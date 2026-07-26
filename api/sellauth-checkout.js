/* FlashShp — Création d'une commande via SellAuth (vraie facture + checkout hébergé).
   =========================================================================
   POST /api/sellauth-checkout
   body : { productId, variantId?, quantity?, email? }
          productId / variantId = identifiants SELLAUTH (mappés dans l'admin sur
          chaque produit), pas les id internes du site.

   Appelle SellAuth `POST /v1/shops/{shopId}/checkout` avec la clé API (jamais
   exposée au client) et renvoie l'URL du checkout hébergé SellAuth, vers
   laquelle la boutique redirige le client. SellAuth crée la facture (invoice_id)
   et gère le paiement (crypto compris, selon la config du dashboard SellAuth).

   Env : SELLAUTH_API_KEY, SELLAUTH_SHOP_ID (déjà configurés côté hébergement). */

var origin = require('./_origin.js');

var SELLAUTH_BASE = 'https://api.sellauth.com/v1';

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

  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  /* Anti-abus : seul le front de la boutique (même origine) peut appeler. */
  if (!origin.isAllowedOrigin(req)) { res.status(403).json({ error: 'Forbidden' }); return; }

  var apiKey = String(process.env.SELLAUTH_API_KEY || '').trim();
  var shopId = String(process.env.SELLAUTH_SHOP_ID || '').trim();
  if (!apiKey || !shopId) { res.status(501).json({ error: 'SellAuth non configuré' }); return; }

  var body = await readBody(req);
  var productId = parseInt(body.productId, 10);
  var variantId = (body.variantId != null && body.variantId !== '') ? parseInt(body.variantId, 10) : null;
  var quantity  = Math.max(1, parseInt(body.quantity, 10) || 1);
  var email     = String(body.email || '').trim();

  if (!productId) { res.status(400).json({ error: 'Produit non relié à SellAuth (productId manquant)' }); return; }

  var item = { productId: productId, quantity: quantity };
  if (variantId) item.variantId = variantId;
  var payload = { cart: [item] };
  if (email) payload.email = email;

  try {
    var r = await fetch(SELLAUTH_BASE + '/shops/' + encodeURIComponent(shopId) + '/checkout', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    var data = await r.json().catch(function () { return null; });

    if (!r.ok) {
      var msg = (data && (data.message || data.error)) || ('SellAuth a répondu ' + r.status);
      res.status(r.status >= 400 && r.status < 600 ? r.status : 502).json({ error: String(msg).slice(0, 300) });
      return;
    }

    /* La forme de réponse peut varier : on cherche l'URL et l'id à plat OU sous data. */
    var nested = (data && data.data) || {};
    var url = (data && (data.invoice_url || data.url || data.checkout_url)) ||
              (nested.invoice_url || nested.url || nested.checkout_url);
    var invoiceId = (data && (data.invoice_id || data.id)) || (nested.invoice_id || nested.id) || null;

    if (!url) { res.status(502).json({ error: 'Réponse SellAuth sans URL de checkout' }); return; }

    res.status(200).json({ ok: true, checkoutUrl: url, invoiceId: invoiceId });
  } catch (e) {
    res.status(502).json({ error: 'SellAuth injoignable' });
  }
};
