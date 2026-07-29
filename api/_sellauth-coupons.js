/* FlashShp — Client SellAuth pour les coupons (source unique de vérité).
   =========================================================================
   Utilisé par :
   - api/admin-coupons.js  → CRUD depuis le panneau admin,
   - api/coupon-validate.js → validation d'un code au checkout.

   Le préfixe « _ » exclut ce fichier du routage /api/<name> (server.js) :
   ce n'est pas un endpoint, juste une librairie.

   IMPORTANT — pourquoi les coupons ne sont PAS mis en cache localement comme
   les produits/catégories (voir api/content.js) : publier la liste complète
   des codes promo au client reviendrait à les offrir à tous les visiteurs
   (n'importe qui pourrait lire localStorage et récupérer chaque code, même
   ceux réservés à un email précis). Chaque opération passe donc par SellAuth
   en direct, côté serveur, avec la clé API qui reste secrète.

   « uses » : SellAuth ne voit jamais les commandes de cette boutique (le
   checkout est autonome, aucune facture n'est créée chez SellAuth), donc son
   compteur uses resterait bloqué à 0 pour toujours. Le suivi réel des
   utilisations vit dans notre propre base (voir api/_coupon-usage.js). */

var SELLAUTH_BASE = 'https://api.sellauth.com/v1';

function headersFor(apiKey) {
  return {
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
}

async function fetchJson(url, opts, diag) {
  try {
    var r = await fetch(url, opts);
    var text = await r.text();
    var json = null;
    try { json = text ? JSON.parse(text) : null; } catch (e) { /* réponse non-JSON */ }
    if (!r.ok) {
      if (diag) { diag.status = r.status; diag.detail = String(text || '').slice(0, 300); }
      return null;
    }
    return json;
  } catch (e) {
    if (diag) { diag.status = 0; diag.detail = String((e && e.message) || 'network error').slice(0, 300); }
    return null;
  }
}

/* SellAuth (camelCase → snake_case) : notre formulaire admin envoie des clés
   camelCase, SellAuth attend le format ci-dessous. */
function toSellAuthPayload(form) {
  function numOrNull(v) { var n = Number(v); return (v === '' || v == null || isNaN(n) || n <= 0) ? null : n; }
  function dateOrNull(v) { return v ? String(v).slice(0, 10) : null; } /* datetime-local → YYYY-MM-DD */
  var emails = String(form.allowedEmails || '')
    .split(',').map(function (e) { return e.trim(); }).filter(Boolean);
  var global = form.applyToAll !== false;
  var items = Array.isArray(form.items) ? form.items.map(String) : [];

  var payload = {
    code: String(form.code || '').trim().toUpperCase(),
    global: global,
    discount: Number(form.discount) || 0,
    type: form.type === 'fixed' ? 'fixed' : 'percentage',
    max_uses: numOrNull(form.maxUses),
    max_uses_per_customer: numOrNull(form.maxUsesPerCustomer),
    min_invoice_price: (form.minCart !== '' && form.minCart != null && Number(form.minCart) > 0) ? Number(form.minCart) : null,
    start_date: dateOrNull(form.startDate),
    expiration_date: dateOrNull(form.expirationDate),
    allowed_emails: emails.length ? emails : null,
    payment_method_ids: null,
    disable_if_volume_discount: !!form.disableVolume,
    disable_if_quantity_deal: !!form.disableQty,
    disable_if_bundle_offer: !!form.disableBundle,
    disable_if_gateway_discount: false,
    uses_count_mode: 'pending',
    applies_to_renewals: false
  };
  /* SellAuth exige `items` uniquement quand global=false. */
  if (!global) payload.items = items;
  return payload;
}

/* SellAuth (snake_case) → forme affichée par l'admin (camelCase). */
function fromSellAuth(c) {
  return {
    id: c.id,
    code: c.code,
    type: c.type || 'percentage',
    discount: Number(c.discount) || 0,
    maxUses: c.max_uses != null ? Number(c.max_uses) : 0,
    maxUsesPerCustomer: c.max_uses_per_customer != null ? Number(c.max_uses_per_customer) : 0,
    minCart: c.min_invoice_price != null ? Number(c.min_invoice_price) : 0,
    allowedEmails: Array.isArray(c.allowed_emails) ? c.allowed_emails.join(', ') : (c.allowed_emails || ''),
    startDate: c.start_date || '',
    expirationDate: c.expiration_date || '',
    applyToAll: !!c.global,
    items: Array.isArray(c.items) ? c.items : [],
    disableVolume: !!c.disable_if_volume_discount,
    disableBundle: !!c.disable_if_bundle_offer,
    disableQty: !!c.disable_if_quantity_deal,
    sellauthUses: c.uses || 0 /* affiché à titre indicatif : ne compte jamais les ventes de CETTE boutique */
  };
}

async function listCoupons(opts) {
  var apiKey = opts.apiKey, shopId = opts.shopId;
  var diag = { status: 0, detail: '' };
  var url = SELLAUTH_BASE + '/shops/' + encodeURIComponent(shopId) + '/coupons?perPage=100&page=1';
  var json = await fetchJson(url, { method: 'GET', headers: headersFor(apiKey) }, diag);
  if (!json) return { ok: false, status: diag.status, detail: diag.detail };
  var list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
  return { ok: true, coupons: list.map(fromSellAuth) };
}

/* Recherche par code (utilisé au checkout) : filtre côté SellAuth, un seul
   résultat attendu (les codes sont uniques par boutique). */
async function findByCode(opts) {
  var apiKey = opts.apiKey, shopId = opts.shopId, code = String(opts.code || '').trim().toUpperCase();
  var diag = { status: 0, detail: '' };
  var url = SELLAUTH_BASE + '/shops/' + encodeURIComponent(shopId) +
    '/coupons?code=' + encodeURIComponent(code) + '&perPage=5&page=1';
  var json = await fetchJson(url, { method: 'GET', headers: headersFor(apiKey) }, diag);
  if (!json) return { ok: false, status: diag.status, detail: diag.detail };
  var list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
  var match = list.find(function (c) { return String(c.code || '').toUpperCase() === code; });
  return { ok: true, coupon: match ? fromSellAuth(match) : null };
}

async function createCoupon(opts) {
  var diag = { status: 0, detail: '' };
  var url = SELLAUTH_BASE + '/shops/' + encodeURIComponent(opts.shopId) + '/coupons';
  var json = await fetchJson(url, {
    method: 'POST', headers: headersFor(opts.apiKey), body: JSON.stringify(toSellAuthPayload(opts.form))
  }, diag);
  if (!json) return { ok: false, status: diag.status, detail: diag.detail };
  return { ok: true, coupon: fromSellAuth(json.coupon || json.data || json) };
}

async function updateCoupon(opts) {
  var diag = { status: 0, detail: '' };
  var url = SELLAUTH_BASE + '/shops/' + encodeURIComponent(opts.shopId) + '/coupons/' + encodeURIComponent(opts.id) + '/update';
  var json = await fetchJson(url, {
    method: 'PUT', headers: headersFor(opts.apiKey), body: JSON.stringify(toSellAuthPayload(opts.form))
  }, diag);
  if (json === null && diag.status && diag.status !== 200) return { ok: false, status: diag.status, detail: diag.detail };
  return { ok: true };
}

async function deleteCoupon(opts) {
  var diag = { status: 0, detail: '' };
  var url = SELLAUTH_BASE + '/shops/' + encodeURIComponent(opts.shopId) + '/coupons/' + encodeURIComponent(opts.id);
  var r;
  try {
    r = await fetch(url, { method: 'DELETE', headers: headersFor(opts.apiKey) });
  } catch (e) {
    return { ok: false, status: 0, detail: String((e && e.message) || 'network error').slice(0, 300) };
  }
  if (!r.ok) {
    var detail = '';
    try { detail = String(await r.text()).slice(0, 300); } catch (e2) {}
    return { ok: false, status: r.status, detail: detail };
  }
  return { ok: true };
}

module.exports = {
  SELLAUTH_BASE: SELLAUTH_BASE,
  listCoupons: listCoupons,
  findByCode: findByCode,
  createCoupon: createCoupon,
  updateCoupon: updateCoupon,
  deleteCoupon: deleteCoupon,
  toSellAuthPayload: toSellAuthPayload,
  fromSellAuth: fromSellAuth
};
