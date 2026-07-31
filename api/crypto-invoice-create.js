/* FlashShp — Crée une facture crypto en attente (adresse + montant décidés par
   le serveur, jamais par le client).
   =========================================================================
   POST /api/crypto-invoice-create   body : { productId, email, coin, couponCode? }
   → { ok:true, invoiceId, address, amountStr, fiatAmount, currency, expiresAt }

   Le client ne fournit que son choix (produit, email, crypto, code promo) ;
   tout ce qui compte pour la vérification — adresse de portefeuille, montant
   dû, taux du jour — est calculé ici et stocké côté serveur (voir
   api/_crypto-pending.js), pour que api/crypto-invoice-status.js n'ait jamais
   à faire confiance à des valeurs venues du navigateur. */

var origin = require('./_origin.js');
var store = require('./_store.js');
var pending = require('./_crypto-pending.js');
var sellauthCoupons = require('./_sellauth-coupons.js');
var couponUsage = require('./_coupon-usage.js');

var PAYMENT_TIMEOUT_MS = 30 * 60 * 1000;   /* 30 min — même délai que l'ancien checkout client */
var CRYPTO_INFO = {
  btc: { symbol: 'BTC', cgId: 'bitcoin' },
  eth: { symbol: 'ETH', cgId: 'ethereum' },
  ltc: { symbol: 'LTC', cgId: 'litecoin' },
  sol: { symbol: 'SOL', cgId: 'solana' }
};

function generateId() {
  var hex = '0123456789abcdef', salt = '';
  for (var i = 0; i < 13; i++) salt += hex[Math.floor(Math.random() * 16)];
  var num = Math.floor(Math.random() * 9000000) + 1000;
  var padded = ('0000000000' + num).slice(-10);
  return salt + '-' + padded;
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

/* Revalide le code promo côté serveur — même logique que api/coupon-validate.js,
   mais on n'a besoin ici que de la réduction, pas du détail du refus : un code
   invalide/périmé/inéligible est simplement ignoré (pas de réduction), le
   client ayant déjà vu le message d'erreur via /api/coupon-validate en amont. */
async function resolveDiscount(code, email, cartTotal, productId) {
  if (!code) return null;
  var apiKey = String(process.env.SELLAUTH_API_KEY || '').trim();
  var shopId = String(process.env.SELLAUTH_SHOP_ID || '').trim();
  if (!apiKey || !shopId) return null;
  try {
    var found = await sellauthCoupons.findByCode({ apiKey: apiKey, shopId: shopId, code: code });
    if (!found.ok || !found.coupon) return null;
    var c = found.coupon;
    var now = Date.now();
    if (c.startDate && now < new Date(c.startDate).getTime()) return null;
    if (c.expirationDate && now > new Date(c.expirationDate).getTime()) return null;
    if (c.minCart > 0 && cartTotal < c.minCart) return null;
    if (c.allowedEmails) {
      var allowed = c.allowedEmails.split(',').map(function (e) { return e.trim().toLowerCase(); }).filter(Boolean);
      if (allowed.length && (!email || allowed.indexOf(email) === -1)) return null;
    }
    if (!c.applyToAll) {
      var items = (c.items || []).map(String);
      if (!productId || items.indexOf(String(productId)) === -1) return null;
    }
    var u = await couponUsage.getUsage(code);
    if (c.maxUses > 0 && u.uses >= c.maxUses) return null;
    if (c.maxUsesPerCustomer > 0 && email && (u.byEmail[email] || 0) >= c.maxUsesPerCustomer) return null;
    return { code: code, discount: c.discount, type: c.type };
  } catch (e) {
    return null;
  }
}

function applyDiscount(price, promo) {
  if (!promo) return price;
  var out = promo.type === 'fixed' ? (price - Number(promo.discount)) : (price * (1 - Number(promo.discount) / 100));
  return Math.max(0, out);
}

module.exports = async function (req, res) {
  if (origin.handlePreflight(req, res)) return;
  origin.applyCors(req, res);
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!origin.isAllowedOrigin(req)) { res.status(403).json({ error: 'Forbidden' }); return; }
  if (!store.available()) { res.status(501).json({ error: 'Store not configured' }); return; }

  var body = await readBody(req);
  var productId = body.productId != null ? Number(body.productId) : NaN;
  var email = String(body.email || '').trim().toLowerCase();
  var coin = String(body.coin || '').trim().toLowerCase();
  var couponCode = String(body.couponCode || '').trim().toUpperCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { res.status(400).json({ error: 'Invalid email' }); return; }
  if (!CRYPTO_INFO[coin]) { res.status(400).json({ error: 'Unsupported payment method' }); return; }
  if (!isFinite(productId)) { res.status(400).json({ error: 'Invalid product' }); return; }

  try {
    var content = await store.getContent(['nexus_products', 'nexus_payments']);
    var products = Array.isArray(content.nexus_products) ? content.nexus_products : [];
    var product = products.find(function (p) { return p && Number(p.id) === productId; });
    if (!product) { res.status(404).json({ error: 'Product not found' }); return; }

    var hasStock = (Array.isArray(product.deliverables) && product.deliverables.length > 0) || Number(product.stock) > 0;
    if (!hasStock) { res.status(409).json({ error: 'Out of stock' }); return; }

    var wallet = (content.nexus_payments || {})[coin];
    if (!wallet || !wallet.enabled || !wallet.address) { res.status(409).json({ error: 'Payment method not configured' }); return; }

    var basePrice = Number(product.price) || 0;
    var promo = await resolveDiscount(couponCode, email, basePrice, productId);
    var fiatAmount = applyDiscount(basePrice, promo);

    var info = CRYPTO_INFO[coin];
    var currency = 'EUR';
    var rateRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=' + info.cgId + '&vs_currencies=' + currency.toLowerCase());
    if (!rateRes.ok) { res.status(502).json({ error: 'Could not fetch live rate' }); return; }
    var rateData = await rateRes.json();
    var rate = rateData && rateData[info.cgId] && rateData[info.cgId][currency.toLowerCase()];
    if (!rate) { res.status(502).json({ error: 'Could not fetch live rate' }); return; }

    var amountCrypto = fiatAmount / rate;
    var finalAmount = Math.ceil(amountCrypto * 1e8) / 1e8;
    var amountStr = finalAmount.toFixed(8).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '') + ' ' + info.symbol;

    var now = Date.now();
    var invoiceId = generateId();
    var order = {
      id: invoiceId,
      productId: productId,
      productName: product.name,
      productIcon: product.icon || '📦',
      email: email,
      coin: coin,
      address: wallet.address,
      amountCrypto: finalAmount,
      amountStr: amountStr,
      fiatAmount: fiatAmount,
      currency: currency,
      couponCode: promo ? promo.code : null,
      createdAt: now,
      expiresAt: now + PAYMENT_TIMEOUT_MS,
      status: 'pending',
      lastCheckedAt: 0,
      deliverable: null
    };
    await pending.create(order);

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      ok: true, invoiceId: invoiceId, address: wallet.address, amountStr: amountStr,
      fiatAmount: fiatAmount, currency: currency, expiresAt: order.expiresAt, coin: coin
    });
  } catch (e) {
    console.error('[FlashShp] /api/crypto-invoice-create failed:', e && e.message);
    res.status(502).json({ error: 'Could not create invoice' });
  }
};
