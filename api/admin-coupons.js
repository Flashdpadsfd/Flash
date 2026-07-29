/* FlashShp — CRUD des coupons (réservé admin), proxy direct vers SellAuth.
   =========================================================================
   GET    /api/admin-coupons          → { ok, coupons:[...] }
   POST   /api/admin-coupons          → body = coupon (forme camelCase du
                                         formulaire admin) → crée chez SellAuth
   PUT    /api/admin-coupons?id=<id>  → met à jour ce coupon chez SellAuth
   DELETE /api/admin-coupons?id=<id>  → supprime ce coupon chez SellAuth

   En-tête requis : « x-admin-secret: <ADMIN_SECRET> » (même schéma que
   api/admin-clients.js) + garde d'origine.

   SellAuth est la SEULE source de vérité pour les coupons (voir la note dans
   api/_sellauth-coupons.js sur pourquoi ils ne sont jamais mis en cache côté
   client comme les produits/catégories).

   Variables d'environnement :
   - ADMIN_SECRET                        : secret admin (obligatoire).
   - SELLAUTH_API_KEY / SELLAUTH_SHOP_ID : identifiants SellAuth (obligatoires). */

var crypto = require('crypto');
var origin = require('./_origin.js');
var sellauth = require('./_sellauth-coupons.js');

function safeEqual(a, b) {
  var ba = Buffer.from(String(a)), bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  try { return crypto.timingSafeEqual(ba, bb); } catch (e) { return false; }
}

function readBody(req) {
  return new Promise(function (resolve) {
    if (req.body && typeof req.body === 'object') { resolve(req.body); return; }
    var data = '';
    req.on('data', function (c) { data += c; if (data.length > 64 * 1024) req.destroy(); });
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

  try {
    if (req.method === 'GET') {
      var listed = await sellauth.listCoupons({ apiKey: apiKey, shopId: shopId });
      if (!listed.ok) {
        console.error('[FlashShp] admin-coupons list failed: status=' + listed.status + ' detail=' + listed.detail);
        res.status(502).json({ error: 'SellAuth unreachable', upstream: listed.status || 0 });
        return;
      }
      res.status(200).json({ ok: true, coupons: listed.coupons });
      return;
    }

    if (req.method === 'POST') {
      var form = await readBody(req);
      if (!form.code) { res.status(400).json({ error: 'Missing coupon code' }); return; }
      var created = await sellauth.createCoupon({ apiKey: apiKey, shopId: shopId, form: form });
      if (!created.ok) {
        console.error('[FlashShp] admin-coupons create failed: status=' + created.status + ' detail=' + created.detail);
        res.status(created.status === 422 ? 422 : 502).json({ error: 'SellAuth refused', detail: created.detail || null });
        return;
      }
      res.status(200).json({ ok: true, coupon: created.coupon });
      return;
    }

    if (req.method === 'PUT') {
      if (!id) { res.status(400).json({ error: 'Missing coupon id' }); return; }
      var form2 = await readBody(req);
      if (!form2.code) { res.status(400).json({ error: 'Missing coupon code' }); return; }
      var updated = await sellauth.updateCoupon({ apiKey: apiKey, shopId: shopId, id: id, form: form2 });
      if (!updated.ok) {
        console.error('[FlashShp] admin-coupons update failed: status=' + updated.status + ' detail=' + updated.detail);
        res.status(updated.status === 422 ? 422 : 502).json({ error: 'SellAuth refused', detail: updated.detail || null });
        return;
      }
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'DELETE') {
      if (!id) { res.status(400).json({ error: 'Missing coupon id' }); return; }
      var deleted = await sellauth.deleteCoupon({ apiKey: apiKey, shopId: shopId, id: id });
      if (!deleted.ok) {
        console.error('[FlashShp] admin-coupons delete failed: status=' + deleted.status + ' detail=' + deleted.detail);
        res.status(502).json({ error: 'SellAuth refused', detail: deleted.detail || null });
        return;
      }
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[FlashShp] admin-coupons failed:', e && e.message);
    res.status(502).json({ error: 'SellAuth error' });
  }
};
