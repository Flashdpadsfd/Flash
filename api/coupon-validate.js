/* FlashShp — Valide un code promo au checkout SANS exposer la liste complète.
   =========================================================================
   POST /api/coupon-validate   body : { code, email, cartTotal, productId }
   → { ok:true, valid:true,  discount, type }
   → { ok:true, valid:false, reason: 'invalid'|'expired'|'not_started'|
       'max_uses'|'max_uses_per_customer'|'min_cart'|'email_not_allowed'|
       'product_not_eligible' }

   Remplace l'ancienne vérification 100% cliente (le code lisait TOUT
   localStorage.nexus_promos, donc n'importe quel visiteur pouvait ouvrir la
   console et lister chaque coupon existant, y compris ceux réservés à un
   email précis — voir la note dans api/content.js). Ici on ne renvoie jamais
   que le verdict + la réduction du SEUL code demandé.

   N'incrémente PAS l'utilisation : ça reste le rôle de api/record-order.js,
   déclenché uniquement quand la commande est vraiment enregistrée (un client
   qui applique un code puis abandonne son panier ne doit pas le consommer).

   Variables d'environnement : SELLAUTH_API_KEY / SELLAUTH_SHOP_ID, DB_* (pour
   le compteur d'utilisation, voir api/_coupon-usage.js). */

var origin = require('./_origin.js');
var sellauth = require('./_sellauth-coupons.js');
var usage = require('./_coupon-usage.js');

function readBody(req) {
  return new Promise(function (resolve) {
    if (req.body && typeof req.body === 'object') { resolve(req.body); return; }
    var data = '';
    req.on('data', function (c) { data += c; if (data.length > 16 * 1024) req.destroy(); });
    req.on('end', function () { try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); } });
    req.on('error', function () { resolve({}); });
  });
}

function invalid(res, reason) { res.status(200).json({ ok: true, valid: false, reason: reason }); }

module.exports = async function (req, res) {
  if (origin.handlePreflight(req, res)) return;
  origin.applyCors(req, res);
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!origin.isAllowedOrigin(req)) { res.status(403).json({ error: 'Forbidden' }); return; }

  var apiKey = String(process.env.SELLAUTH_API_KEY || '').trim();
  var shopId = String(process.env.SELLAUTH_SHOP_ID || '').trim();
  if (!apiKey || !shopId) { res.status(501).json({ error: 'Coupons not configured' }); return; }

  var body = await readBody(req);
  var code = String(body.code || '').trim().toUpperCase();
  var email = String(body.email || '').trim().toLowerCase();
  var cartTotal = Number(body.cartTotal);
  if (!isFinite(cartTotal)) cartTotal = 0;
  var productId = body.productId != null ? String(body.productId) : null;

  if (!code) { res.status(400).json({ error: 'Missing code' }); return; }

  res.setHeader('Cache-Control', 'no-store');

  try {
    var found = await sellauth.findByCode({ apiKey: apiKey, shopId: shopId, code: code });
    if (!found.ok) {
      console.error('[FlashShp] coupon-validate SellAuth lookup failed: status=' + found.status + ' detail=' + found.detail);
      res.status(502).json({ error: 'SellAuth unreachable' });
      return;
    }
    var c = found.coupon;
    if (!c) return invalid(res, 'invalid');

    var now = Date.now();
    if (c.startDate && now < new Date(c.startDate).getTime()) return invalid(res, 'not_started');
    if (c.expirationDate && now > new Date(c.expirationDate).getTime()) return invalid(res, 'expired');
    if (c.minCart > 0 && cartTotal < c.minCart) return invalid(res, 'min_cart');

    if (c.allowedEmails) {
      var allowed = c.allowedEmails.split(',').map(function (e) { return e.trim().toLowerCase(); }).filter(Boolean);
      if (allowed.length && (!email || allowed.indexOf(email) === -1)) return invalid(res, 'email_not_allowed');
    }

    if (!c.applyToAll) {
      var items = (c.items || []).map(String);
      if (!productId || items.indexOf(productId) === -1) return invalid(res, 'product_not_eligible');
    }

    var u = await usage.getUsage(code);
    if (c.maxUses > 0 && u.uses >= c.maxUses) return invalid(res, 'max_uses');
    if (c.maxUsesPerCustomer > 0 && email && (u.byEmail[email] || 0) >= c.maxUsesPerCustomer) return invalid(res, 'max_uses_per_customer');

    res.status(200).json({ ok: true, valid: true, discount: c.discount, type: c.type });
  } catch (e) {
    console.error('[FlashShp] /api/coupon-validate failed:', e && e.message);
    res.status(502).json({ error: 'Validation failed' });
  }
};
