/* FlashShp — Liste des clients connectés + détail d'un client (réservé admin).
   =========================================================================
   GET /api/admin-clients            → { clients:[...] }  (triés par dernière connexion)
   GET /api/admin-clients?id=<id>    → { client:{...}, orders:[...], ordersAvailable }

   En-tête requis : « x-admin-secret: <ADMIN_SECRET> » (même schéma que
   api/feedback-delete.js) + garde same-origin.

   Les clients viennent de NOTRE stockage (Upstash/KV), donc indépendants de
   SellAuth. Les commandes, elles, sont encore récupérées chez SellAuth par
   email (seule dépendance restante).

   Variables d'environnement :
   - ADMIN_SECRET                          : secret admin (obligatoire).
   - KV_REST_API_URL / KV_REST_API_TOKEN   : stockage (via intégration Vercel).
   - SELLAUTH_API_KEY / SELLAUTH_SHOP_ID   : pour les commandes (optionnel). */

var crypto = require('crypto');
var store = require('./_store.js');

var SELLAUTH_BASE = 'https://api.sellauth.com/v1';

function hostFrom(value) {
  try { return new URL(value).hostname.toLowerCase(); } catch (e) { return ''; }
}
function isAllowedOrigin(req) {
  var src = (req.headers && (req.headers.origin || req.headers.referer)) || '';
  if (!src) return false;
  var host = hostFrom(src);
  if (!host) return false;
  /* Same-origin (hôte de l'Origin == hôte servant la page) : marche sur
     n'importe quel domaine (Hostinger, domaine perso…), sans config. */
  var selfHost = String((req.headers && req.headers.host) || '').toLowerCase().split(':')[0];
  if (selfHost && host === selfHost) return true;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  if (/^nexus-theme[a-z0-9-]*\.vercel\.app$/.test(host)) return true;
  if (/^flashshp[a-z0-9-]*\.vercel\.app$/.test(host)) return true;
  var extra = String(process.env.ALLOWED_ORIGINS || '')
    .split(',').map(function (h) { return h.trim().toLowerCase(); }).filter(Boolean);
  for (var i = 0; i < extra.length; i++) {
    if (host === extra[i] || host.endsWith('.' + extra[i])) return true;
  }
  return false;
}
function safeEqual(a, b) {
  var ba = Buffer.from(String(a)), bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  try { return crypto.timingSafeEqual(ba, bb); } catch (e) { return false; }
}

function productsOf(inv) {
  var items = (inv && inv.items) || [];
  var names = [];
  if (Array.isArray(items)) {
    items.forEach(function (it) {
      var n = (it && (it.custom_name || (it.product && it.product.name))) || '';
      if (n) names.push(n);
    });
  }
  if (!names.length && inv && inv.product && inv.product.name) names.push(inv.product.name);
  return names;
}

/* Récupère les commandes SellAuth d'un email (mêmes champs sûrs que /api/me). */
async function ordersForEmail(email) {
  var apiKey = process.env.SELLAUTH_API_KEY;
  var shopId = process.env.SELLAUTH_SHOP_ID;
  if (!apiKey || !shopId || !email) return { orders: [], available: false };
  try {
    var url = SELLAUTH_BASE + '/shops/' + encodeURIComponent(shopId) +
      '/invoices?email=' + encodeURIComponent(email) +
      '&perPage=100&orderColumn=created_at&orderDirection=desc';
    var r = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Accept': 'application/json' }
    });
    if (!r.ok) return { orders: [], available: false };
    var json = await r.json();
    var list = Array.isArray(json) ? json : (json && Array.isArray(json.data) ? json.data : []);
    var orders = list.map(function (inv) {
      return {
        id: inv.id,
        uniqueId: inv.unique_id || null,
        status: inv.status || 'unknown',
        price: inv.price != null ? Number(inv.price) : null,
        currency: inv.currency || 'EUR',
        gateway: inv.gateway || null,
        createdAt: inv.created_at || null,
        completedAt: inv.completed_at || null,
        products: productsOf(inv)
      };
    });
    return { orders: orders, available: true };
  } catch (e) {
    console.error('[FlashShp] admin orders failed:', e && e.message);
    return { orders: [], available: false };
  }
}

module.exports = async function (req, res) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!isAllowedOrigin(req)) { res.status(403).json({ error: 'Forbidden' }); return; }

  var adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) { res.status(501).json({ error: 'Admin not configured' }); return; }

  var provided = (req.headers && (req.headers['x-admin-secret'] || req.headers['X-Admin-Secret'])) || '';
  if (!provided || !safeEqual(provided, adminSecret)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (!store.available()) {
    res.status(200).json({ ok: true, storeAvailable: false, clients: [] });
    return;
  }

  var url = new URL(req.url, 'http://localhost');
  var id = url.searchParams.get('id');

  res.setHeader('Cache-Control', 'no-store');

  try {
    /* Détail d'un client + ses commandes. */
    if (id) {
      var client = await store.getClient(id);
      if (!client) { res.status(404).json({ error: 'Client not found' }); return; }
      var r = await ordersForEmail(client.email);
      res.status(200).json({
        ok: true, storeAvailable: true,
        client: client, orders: r.orders, ordersAvailable: r.available
      });
      return;
    }

    /* Liste complète (déjà triée par dernière connexion). */
    var records = await store.listClients();
    res.status(200).json({ ok: true, storeAvailable: true, clients: records });
  } catch (e) {
    console.error('[FlashShp] admin-clients failed:', e && e.message);
    res.status(502).json({ error: 'Store error' });
  }
};
