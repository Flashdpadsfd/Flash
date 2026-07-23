/* FlashShp — Contenu de la boutique, partagé entre le panneau admin et le site.
   =========================================================================
   GET  /api/content              → contenu PUBLIC (produits, catégories, textes…)
   GET  /api/content?scope=admin  → tout le contenu (en-tête x-admin-secret requis)
   PUT  /api/content              → écriture (en-tête x-admin-secret requis)
        body : { "key": "nexus_products", "value": [...] }
        ou    : { "content": { "nexus_products": [...], "nexus_content": {...} } }

   Pourquoi ce fichier existe : produits, catégories et textes ne vivaient que
   dans le localStorage du navigateur de l'admin. Les visiteurs voyaient donc
   les valeurs codées en dur dans assets/main.js, jamais les modifications, et
   le panneau ne pouvait pas déménager sur un autre domaine (le localStorage est
   cloisonné par origine). Le contenu est désormais en base.

   Le panneau admin étant sur une AUTRE origine (admin.flashshp.fr), le CORS est
   nécessaire — mais ce n'est pas lui qui protège : la vraie barrière est
   ADMIN_SECRET, comparé à temps constant.

   Variables d'environnement : ADMIN_SECRET (obligatoire en écriture),
   DB_* (MySQL, via _store.js), ADMIN_ORIGIN (origine du panneau). */

var crypto = require('crypto');
var origin = require('./_origin.js');
var store = require('./_store.js');

/* Clés lisibles par n'importe quel visiteur : c'est ce qu'affiche la boutique. */
var PUBLIC_KEYS = [
  'nexus_products',
  'nexus_categories',
  'nexus_content',
  'nexus_links',
  'nexus_reviews',
  'nexus_text_overrides'
];

/* Clés réservées à l'admin. À NE JAMAIS publier :
   - nexus_payments  : contient le client secret PayPal et la clé Stripe sk_live_… ;
   - nexus_promos    : publier les codes promo reviendrait à les offrir à tous
                       (leur validation devra passer par le serveur pour marcher
                       côté client — voir les notes de livraison) ;
   - nexus_webhooks  : URLs de webhooks Discord, exploitables pour spammer ;
   - blacklists / security / email_config / stats / orders : données internes. */
var ADMIN_KEYS = [
  'nexus_payments',
  'nexus_promos',
  'nexus_webhooks',
  'nexus_blacklist_emails',
  'nexus_blacklist_ips',
  'nexus_security',
  'nexus_email_config',
  'nexus_stats',
  'nexus_orders'
];

var WRITABLE = PUBLIC_KEYS.concat(ADMIN_KEYS);

/* Garde-fou : une valeur démesurée saturerait la colonne LONGTEXT et la RAM. */
var MAX_VALUE_BYTES = 2 * 1024 * 1024;   /* 2 Mo par clé */

function safeEqual(a, b) {
  var ba = Buffer.from(String(a)), bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  try { return crypto.timingSafeEqual(ba, bb); } catch (e) { return false; }
}

function isAdmin(req) {
  var expected = process.env.ADMIN_SECRET;
  if (!expected) return false;
  var provided = (req.headers && (req.headers['x-admin-secret'] || req.headers['X-Admin-Secret'])) || '';
  return !!provided && safeEqual(provided, expected);
}

function readBody(req) {
  return new Promise(function (resolve) {
    if (req.body && typeof req.body === 'object') { resolve(req.body); return; }
    var data = '';
    req.on('data', function (c) { data += c; });
    req.on('end', function () { try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); } });
    req.on('error', function () { resolve({}); });
  });
}

module.exports = async function (req, res) {
  if (origin.handlePreflight(req, res)) return;
  origin.applyCors(req, res);

  if (!store.available()) { res.status(501).json({ error: 'Store not configured' }); return; }

  /* ── Lecture ── */
  if (req.method === 'GET') {
    var url = new URL(req.url, 'http://localhost');
    var wantAdmin = url.searchParams.get('scope') === 'admin';

    if (wantAdmin && !isAdmin(req)) { res.status(401).json({ error: 'Unauthorized' }); return; }

    try {
      var keys = wantAdmin ? WRITABLE : PUBLIC_KEYS;
      var content = await store.getContent(keys);
      var updatedAt = await store.contentUpdatedAt();

      if (wantAdmin) res.setHeader('Cache-Control', 'no-store');
      /* Public : cache court. Le contenu change rarement, et la boutique
         rafraîchit de toute façon à chaque chargement de page. */
      else res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=300');

      res.status(200).json({ ok: true, content: content, updatedAt: updatedAt });
    } catch (e) {
      console.error('[FlashShp] /api/content read failed:', e && e.message);
      res.status(502).json({ error: 'Content unavailable' });
    }
    return;
  }

  /* ── Écriture (admin uniquement) ── */
  if (req.method === 'PUT' || req.method === 'POST') {
    if (!process.env.ADMIN_SECRET) { res.status(501).json({ error: 'Admin not configured' }); return; }
    if (!isAdmin(req)) { res.status(401).json({ error: 'Unauthorized' }); return; }

    var body = await readBody(req);
    var updates = {};
    if (body && typeof body.key === 'string') updates[body.key] = body.value;
    else if (body && body.content && typeof body.content === 'object') updates = body.content;

    var keysToWrite = Object.keys(updates);
    if (!keysToWrite.length) { res.status(400).json({ error: 'Nothing to write' }); return; }

    /* Liste blanche : on n'accepte que des clés connues, jamais un nom libre
       (sinon n'importe quoi finirait en base, y compris des clés inventées). */
    var rejected = keysToWrite.filter(function (k) { return WRITABLE.indexOf(k) < 0; });
    if (rejected.length) {
      res.status(400).json({ error: 'Unknown key(s): ' + rejected.join(', ') });
      return;
    }

    for (var i = 0; i < keysToWrite.length; i++) {
      var size = Buffer.byteLength(JSON.stringify(updates[keysToWrite[i]] || null));
      if (size > MAX_VALUE_BYTES) {
        res.status(413).json({ error: 'Value too large for ' + keysToWrite[i] });
        return;
      }
    }

    try {
      for (var j = 0; j < keysToWrite.length; j++) {
        await store.setContent(keysToWrite[j], updates[keysToWrite[j]]);
      }
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({ ok: true, written: keysToWrite });
    } catch (e) {
      console.error('[FlashShp] /api/content write failed:', e && e.message);
      res.status(502).json({ error: 'Write failed' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
