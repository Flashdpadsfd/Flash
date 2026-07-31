/* FlashShp — Serveur autonome (Express) pour hébergement Node (Hostinger, VPS…).
   =========================================================================
   Point d'entrée unique de l'hébergement. Un seul process Node :
   - sert les pages statiques (.html, assets/…),
   - applique les réécritures d'URL « propres » (/login, /account, /admin…),
   - monte chaque fichier api/<name>.js sur la route /api/<name>,
   - pose les en-têtes de sécurité (CSP, etc.).

   Démarrage : `npm start` (écoute sur process.env.PORT, défaut 3000).
   Variables d'environnement : voir .env.example (un fichier .env est chargé
   automatiquement s'il est présent). Node 18+ requis (fetch global). */

try { require('dotenv').config(); } catch (e) { /* dotenv optionnel */ }

var express = require('express');
var helmet = require('helmet');
var path = require('path');
var fs = require('fs');

var app = express();
app.disable('x-powered-by');
app.set('trust proxy', true); // derrière le proxy Hostinger : req.protocol/ip corrects

/* Corps JSON (les handlers lisent req.body ; readBody gère aussi l'absence).
   verify() garde aussi les octets bruts (req.rawBody) : api/sellauth-webhook.js
   en a besoin pour vérifier la signature HMAC de SellAuth — un JSON.stringify()
   du corps re-parsé ne reproduit pas forcément exactement ce qui a été signé. */
app.use(express.json({
  limit: '1mb',
  verify: function (req, res, buf) { req.rawBody = buf; }
}));

/* Helmet pose une base d'en-têtes qu'on ne gérait pas encore soi-même
   (X-DNS-Prefetch-Control, Cross-Origin-Resource-Policy, Origin-Agent-Cluster…).
   Tout ce qu'on pose déjà à la main juste après (CSP, HSTS, X-Frame-Options,
   Referrer-Policy, COOP) est désactivé ici pour éviter le doublon — la
   middleware suivante reste la seule source de vérité pour ces en-têtes-là. */
app.use(helmet({
  contentSecurityPolicy: false,
  hsts: false,
  frameguard: false,
  referrerPolicy: false,
  crossOriginOpenerPolicy: false
}));

/* ── En-têtes de sécurité ──
   img-src/connect-src/frame-src listent les hôtes externes réellement appelés
   par le front (QR code du checkout crypto, webhook Discord) plutôt qu'un
   wildcard https: — voir checkout.html / assets/main.js pour la liste des
   appels. Le taux de change et la vérification blockchain sont désormais
   appelés par le SERVEUR (api/crypto-invoice-create.js, api/crypto-invoice-
   status.js), pas par le navigateur : pas besoin de les autoriser ici, la CSP
   ne s'applique qu'aux requêtes faites depuis la page. */
var CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.paypal.com https://*.paypalobjects.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https://api.qrserver.com; connect-src 'self' https://discord.com; frame-src 'self'; media-src 'self'; manifest-src 'self'; worker-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'self'; upgrade-insecure-requests";
app.use(function (req, res, next) {
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), payment=(), usb=()');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  if (/^\/admin(\.html)?$/i.test(req.path)) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
});

/* ── Routes API : /api/<name> → api/<name>.js ──
   Le nom est strictement [a-z0-9-] : exclut les helpers _session.js / _store.js
   et empêche tout accès à d'autres fichiers.

   IMPORTANT : sous Hostinger, un require() de handler au fil des requêtes peut
   échouer par intermittence avec « open EEXIST » (course sur le cache de
   compilation Node). On charge donc chaque handler UNE fois, avec réessai sur
   EEXIST, et on les précharge au démarrage (passe séquentielle). */
var API_DIR = path.join(__dirname, 'api');
var API_CACHE = {};

function loadHandler(name) {
  if (Object.prototype.hasOwnProperty.call(API_CACHE, name)) return API_CACHE[name];
  var file = path.join(API_DIR, name + '.js');
  /* name est déjà filtré en [a-z0-9-]+ par tous les appelants (route /api/:name
     ligne ~81, préchargement ligne ~75 depuis un readdirSync) donc aucune
     séquence '..' ne peut s'y glisser — cette vérification est une ceinture-
     et-bretelles pour que loadHandler() reste sûr même si un futur appelant
     oublie de valider en amont. */
  if (path.dirname(file) !== API_DIR) { API_CACHE[name] = null; return null; }
  if (!fs.existsSync(file)) { API_CACHE[name] = null; return null; }
  var lastErr;
  for (var i = 0; i < 6; i++) {
    try {
      var h = require(file);
      API_CACHE[name] = (typeof h === 'function') ? h : null;
      return API_CACHE[name];
    } catch (e) {
      lastErr = e;
      if (!/EEXIST/i.test((e && e.message) || '')) break;
      try { delete require.cache[require.resolve(file)]; } catch (x) {}
    }
  }
  console.error('[FlashShp] load api failed', name, lastErr && (lastErr.stack || lastErr.message));
  return null; /* non caché : on retentera à la prochaine requête */
}

/* Préchargement au démarrage : évite les require concurrents par requête. */
try {
  fs.readdirSync(API_DIR).forEach(function (f) {
    var m = /^([a-z0-9-]+)\.js$/.exec(f);
    if (m) loadHandler(m[1]);
  });
} catch (e) { console.error('[FlashShp] preload api failed', e && e.message); }

app.all('/api/:name', function (req, res) {
  var name = String(req.params.name || '');
  if (!/^[a-z0-9-]+$/.test(name)) { res.status(404).json({ error: 'Not found' }); return; }
  var handler = loadHandler(name);
  if (typeof handler !== 'function') {
    res.status(fs.existsSync(path.join(API_DIR, name + '.js')) ? 500 : 404)
       .json({ error: fs.existsSync(path.join(API_DIR, name + '.js')) ? 'Server error' : 'Not found' });
    return;
  }
  try {
    Promise.resolve(handler(req, res)).catch(function (err) {
      console.error('[FlashShp] api error', name, err && (err.stack || err.message));
      if (!res.headersSent) res.status(500).json({ error: 'Server error' });
    });
  } catch (err) {
    console.error('[FlashShp] api throw', name, err && (err.stack || err.message));
    if (!res.headersSent) res.status(500).json({ error: 'Server error' });
  }
});

/* ── Réécritures d'URL propres ── */
var REWRITES = {
  '/': 'preview.html',
  /* '/admin' retiré volontairement : le panneau vit désormais sur son propre
     domaine (admin.flashshp.fr, cf. scripts/build-admin-site.js). Le servir ici
     aussi annulerait la séparation demandée. */
  '/products': 'preview-products.html',
  '/product': 'preview-product.html',
  '/review': 'preview-feedback.html',
  '/tutorials': 'preview-tutorials.html',
  '/migrate': 'migrate.html',   /* outil ponctuel, noindex — voir migrate.html */
  '/reviews': 'preview-feedback.html',
  '/invoice': 'invoice.html',
  '/checkout': 'checkout.html',
  '/login': 'client-login.html',
  '/account': 'client-dashboard.html'
};
Object.keys(REWRITES).forEach(function (route) {
  app.get(route, function (req, res) { res.sendFile(path.join(__dirname, REWRITES[route])); });
});
/* URL propre de la fiche produit : /products-<nom> (ex. /products-netflix). */
app.get(/^\/products-[^\/]+$/, function (req, res) {
  res.sendFile(path.join(__dirname, 'preview-product.html'));
});

/* ── Garde : ne jamais servir le code source / secrets en statique ──
   Les dossiers d'outillage (scripts/, logs/) étaient servis : /logs/<fichier>.log
   renvoyait 200, et les journaux de déploiement exposent l'arborescence du
   serveur. On bloque le dossier entier plutôt que fichier par fichier, et on
   couvre deploy.* quelle que soit l'extension (.ps1, .bat…). */
var BLOCKED = /^\/(?:api|node_modules|scripts|logs|admin|\.git|\.claude|templates|sellauth|sellauth-theme|components|snippets)(?:\/|$)|^\/(?:server\.js|package(?:-lock)?\.json|deploy[^\/]*\.(?:ps1|bat|sh|cmd)|\.env.*|\.gitignore|admin(?:\.html)?|assets\/admin\.(?:js|css)|test-buttons\.html)$/i;
app.use(function (req, res, next) {
  if (BLOCKED.test(req.path)) { res.status(404).send('Not found'); return; }
  next();
});

/* ── Fichiers statiques (html, assets/…) ── */
app.use(express.static(__dirname, { index: false, dotfiles: 'ignore', extensions: ['html'] }));

/* 404 par défaut. */
app.use(function (req, res) {
  if (req.path.indexOf('/api/') === 0) { res.status(404).json({ error: 'Not found' }); return; }
  res.status(404).send('Not found');
});

/* Publie le panneau admin vers le sous-domaine (voir api/_publish-admin.js pour
   la raison de ce détour). Best-effort : n'empêche jamais le démarrage. */
try { require('./api/_publish-admin.js').publish(__dirname); }
catch (e) { console.error('[FlashShp] publish admin skipped:', e && e.message); }

var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log('[FlashShp] serveur démarré sur le port ' + PORT);
});
