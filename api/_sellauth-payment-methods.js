/* FlashShp — Client SellAuth pour les moyens de paiement (lecture + toggle +
   reordonnancement uniquement — pas de create/update/delete).
   =========================================================================
   Utilisé par api/admin-payment-methods.js.

   Portée volontairement limitée : SellAuth gere aussi des identifiants de
   connexion sensibles (password/otp/tfa_code) sur certains gateways via
   Update Payment Method — hors de portee ici, ce panneau ne fait qu'afficher
   l'etat reel des moyens de paiement du shop SellAuth et permettre de les
   activer/desactiver/reordonner. La configuration fine (frais, identifiants)
   reste sur dash.sellauth.com.

   Distinct des 4 wallets crypto (BTC/ETH/LTC/SOL) geres par ce theme lui-meme
   (nexus_payments, adresses de wallet) : le checkout de CE site n'utilise pas
   les moyens de paiement SellAuth (aucune facture SellAuth n'est creee ici),
   donc cette liste est informative/de gestion du compte SellAuth, separee de
   ce que le checkout accepte reellement. */

var SELLAUTH_BASE = 'https://api.sellauth.com/v1';

function headersFor(apiKey) {
  return { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json' };
}

async function fetchJson(url, opts, diag) {
  try {
    var r = await fetch(url, opts);
    var text = await r.text();
    var json = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) { /* reponse non-JSON */ }
    if (!r.ok) {
      if (diag) { diag.status = r.status; diag.detail = String(text || '').slice(0, 300); }
      return null;
    }
    return json === null ? {} : json;
  } catch (e) {
    if (diag) { diag.status = 0; diag.detail = String((e && e.message) || 'network error').slice(0, 300); }
    return null;
  }
}

function fromSellAuth(m) {
  return {
    id: m.id,
    type: m.type,
    name: m.name,
    checkoutName: m.checkout_name || '',
    isActive: !!m.is_active,
    order: m.order || 0,
    percentageFee: m.percentage_fee != null ? Number(m.percentage_fee) : 0,
    fixedFee: m.fixed_fee != null ? Number(m.fixed_fee) : 0
  };
}

async function listPaymentMethods(opts) {
  var diag = { status: 0, detail: '' };
  var url = SELLAUTH_BASE + '/shops/' + encodeURIComponent(opts.shopId) + '/payment-methods';
  var json = await fetchJson(url, { method: 'GET', headers: headersFor(opts.apiKey) }, diag);
  if (!json) return { ok: false, status: diag.status, detail: diag.detail };
  var list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
  list.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  return { ok: true, methods: list.map(fromSellAuth) };
}

async function togglePaymentMethod(opts) {
  var diag = { status: 0, detail: '' };
  var url = SELLAUTH_BASE + '/shops/' + encodeURIComponent(opts.shopId) + '/payment-methods/' + encodeURIComponent(opts.id) + '/toggle';
  var json = await fetchJson(url, { method: 'POST', headers: headersFor(opts.apiKey) }, diag);
  if (json === null && diag.status) return { ok: false, status: diag.status, detail: diag.detail };
  return { ok: true };
}

async function reorderPaymentMethods(opts) {
  var diag = { status: 0, detail: '' };
  var url = SELLAUTH_BASE + '/shops/' + encodeURIComponent(opts.shopId) + '/payment-methods/order';
  var json = await fetchJson(url, {
    method: 'PUT', headers: headersFor(opts.apiKey), body: JSON.stringify({ paymentMethods: opts.order })
  }, diag);
  if (json === null && diag.status) return { ok: false, status: diag.status, detail: diag.detail };
  return { ok: true };
}

module.exports = {
  listPaymentMethods: listPaymentMethods,
  togglePaymentMethod: togglePaymentMethod,
  reorderPaymentMethods: reorderPaymentMethods
};
