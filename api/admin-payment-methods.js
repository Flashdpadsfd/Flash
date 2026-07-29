/* FlashShp — Moyens de paiement SellAuth (reservé admin) : liste, activer/
   désactiver, réordonner. Proxy direct vers SellAuth, lecture seule pour la
   config fine (frais, identifiants) — voir api/_sellauth-payment-methods.js.
   =========================================================================
   GET    /api/admin-payment-methods                → { ok, methods:[...] }
   POST   /api/admin-payment-methods?id=<id>&action=toggle → active/desactive
   PUT    /api/admin-payment-methods                → body { order:[id,...] }

   En-tête requis : « x-admin-secret: <ADMIN_SECRET> » (même schéma que
   api/admin-coupons.js).

   Variables d'environnement :
   - ADMIN_SECRET                        : secret admin (obligatoire).
   - SELLAUTH_API_KEY / SELLAUTH_SHOP_ID : identifiants SellAuth (obligatoires). */

var crypto = require('crypto');
var origin = require('./_origin.js');
var sellauth = require('./_sellauth-payment-methods.js');

function safeEqual(a, b) {
  var ba = Buffer.from(String(a)), bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  try { return crypto.timingSafeEqual(ba, bb); } catch (e) { return false; }
}

function readBody(req) {
  return new Promise(function (resolve) {
    if (req.body && typeof req.body === 'object') { resolve(req.body); return; }
    var data = '';
    req.on('data', function (c) { data += c; if (data.length > 16 * 1024) req.destroy(); });
    req.on('end', function () { try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); } });
    req.on('error', function () { resolve({}); });
  });
}

module.exports = async function (req, res) {
  if (origin.handlePreflight(req, res)) return;
  origin.applyCors(req, res);
  if (!origin.isAllowedOrigin(req)) { res.status(403).json({ error: 'Forbidden' }); return; }

  var adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) { res.status(501).json({ error: 'Admin not configured' }); return; }
  var provided = (req.headers && (req.headers['x-admin-secret'] || req.headers['X-Admin-Secret'])) || '';
  if (!provided || !safeEqual(provided, adminSecret)) { res.status(401).json({ error: 'Unauthorized' }); return; }

  var apiKey = String(process.env.SELLAUTH_API_KEY || '').trim();
  var shopId = String(process.env.SELLAUTH_SHOP_ID || '').trim();
  if (!apiKey || !shopId) { res.status(501).json({ error: 'SellAuth not configured' }); return; }

  res.setHeader('Cache-Control', 'no-store');
  var url = new URL(req.url, 'http://localhost');
  var id = url.searchParams.get('id');
  var action = url.searchParams.get('action');

  try {
    if (req.method === 'GET') {
      var listed = await sellauth.listPaymentMethods({ apiKey: apiKey, shopId: shopId });
      if (!listed.ok) {
        console.error('[FlashShp] admin-payment-methods list failed: status=' + listed.status + ' detail=' + listed.detail);
        res.status(502).json({ error: 'SellAuth unreachable', upstream: listed.status || 0 });
        return;
      }
      res.status(200).json({ ok: true, methods: listed.methods });
      return;
    }

    if (req.method === 'POST' && action === 'toggle') {
      if (!id) { res.status(400).json({ error: 'Missing payment method id' }); return; }
      var toggled = await sellauth.togglePaymentMethod({ apiKey: apiKey, shopId: shopId, id: id });
      if (!toggled.ok) {
        console.error('[FlashShp] admin-payment-methods toggle failed: status=' + toggled.status + ' detail=' + toggled.detail);
        res.status(502).json({ error: 'SellAuth refused', detail: toggled.detail || null });
        return;
      }
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'PUT') {
      var body = await readBody(req);
      var order = Array.isArray(body.order) ? body.order : null;
      if (!order || !order.length) { res.status(400).json({ error: 'Missing order' }); return; }
      var reordered = await sellauth.reorderPaymentMethods({ apiKey: apiKey, shopId: shopId, order: order });
      if (!reordered.ok) {
        console.error('[FlashShp] admin-payment-methods reorder failed: status=' + reordered.status + ' detail=' + reordered.detail);
        res.status(502).json({ error: 'SellAuth refused', detail: reordered.detail || null });
        return;
      }
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[FlashShp] admin-payment-methods failed:', e && e.message);
    res.status(502).json({ error: 'SellAuth error' });
  }
};
