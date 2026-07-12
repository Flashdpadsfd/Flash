/* FlashShp — Serveur autonome (Express) pour hébergement Node (Hostinger, VPS…).
   =========================================================================
   Remplace la couche Vercel (fonctions serverless + vercel.json). Un seul
   process Node :
   - sert les pages statiques (.html, assets/…),
   - applique les réécritures d'URL « propres » (/login, /account, /admin…),
   - monte chaque fichier api/<name>.js sur la route /api/<name>,
   - pose les en-têtes de sécurité (CSP, etc.) qui étaient dans vercel.json.

   Démarrage : `npm start` (écoute sur process.env.PORT, défaut 3000).
   Variables d'environnement : voir .env.example (un fichier .env est chargé
   automatiquement s'il est présent). Node 18+ requis (fetch global). */

try { require('dotenv').config(); } catch (e) { /* dotenv optionnel */ }

var express = require('express');
var path = require('path');
var fs = require('fs');

var app = express();
app.disable('x-powered-by');
app.set('trust proxy', true); // derrière le proxy Hostinger : req.protocol/ip corrects

/* Corps JSON (les handlers lisent req.body ; readBody gère aussi l'absence). */
app.use(express.json({ limit: '1mb' }));

/* ── En-têtes de sécurité (repris de vercel.json) ── */
var CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.sellauth.com https://cdn.jsdelivr.net https://www.paypal.com https://*.paypalobjects.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https:; frame-src 'self' https:; base-uri 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'self'; upgrade-insecure-requests";
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

/* ── Réécritures d'URL propres (repris des rewrites vercel.json) ── */
var REWRITES = {
  '/': 'preview.html',
  '/admin': 'admin.html',
  '/products': 'preview-products.html',
  '/product': 'preview-product.html',
  '/review': 'preview-feedback.html',
  '/reviews': 'preview-feedback.html',
  '/invoice': 'invoice.html',
  '/checkout': 'checkout.html',
  '/login': 'client-login.html',
  '/account': 'client-dashboard.html'
};
Object.keys(REWRITES).forEach(function (route) {
  app.get(route, function (req, res) { res.sendFile(path.join(__dirname, REWRITES[route])); });
});

/* ── Garde : ne jamais servir le code source / secrets en statique ── */
var BLOCKED = /^\/(?:api|node_modules|\.git|\.claude|\.vercel)(?:\/|$)|^\/(?:server\.js|package(?:-lock)?\.json|vercel\.json|deploy\.ps1|\.env.*|\.gitignore)$/i;
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

var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log('[FlashShp] serveur démarré sur le port ' + PORT);
});
