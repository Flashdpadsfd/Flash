/* FlashShp — Lecture d'une facture (invoice) SellAuth.
   =========================================================================
   Utilisé par :
   - api/order.js           → le client consulte sa propre commande,
   - api/sellauth-webhook.js → confirmation serveur d'un paiement.

   Le préfixe « _ » exclut ce fichier du routage /api/<name> (server.js) :
   ce n'est pas un endpoint, juste une librairie. Réutilise SELLAUTH_API_KEY /
   SELLAUTH_SHOP_ID (déjà utilisées pour coupons/avis — voir _sellauth-coupons.js /
   _sellauth-feedbacks.js). */

var SELLAUTH_BASE = 'https://api.sellauth.com/v1';

/* Extrait le contenu livré d'un item, quel que soit le champ SellAuth. */
function deliverableOf(item) {
  if (!item || typeof item !== 'object') return '';
  var d = item.deliverable || item.delivered || item.delivery || item.data || item.content || '';
  if (!d && Array.isArray(item.deliverables)) {
    d = item.deliverables.map(function (x) { return (x && (x.deliverable || x.serial || x.data)) || x; }).join('\n');
  }
  if (!d && Array.isArray(item.serials)) {
    d = item.serials.map(function (x) { return (x && (x.serial || x.data)) || x; }).join('\n');
  }
  return String(d || '').trim();
}

function nameOf(item, inv) {
  var n = (item && (item.custom_name || (item.product && item.product.name) || item.name)) || '';
  if (!n && inv && inv.product && inv.product.name) n = inv.product.name;
  return n || 'Product';
}

/* Charge une facture par id. { apiKey, shopId } requis.
   Renvoie { ok:false, status, detail } ou { ok:true, invoice }. */
async function getInvoice(id, opts) {
  var apiKey = (opts && opts.apiKey) || process.env.SELLAUTH_API_KEY;
  var shopId = (opts && opts.shopId) || process.env.SELLAUTH_SHOP_ID;
  if (!apiKey || !shopId) return { ok: false, status: 501, detail: 'SellAuth not configured' };

  var r;
  try {
    r = await fetch(SELLAUTH_BASE + '/shops/' + encodeURIComponent(shopId) + '/invoices/' + encodeURIComponent(id), {
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Accept': 'application/json' }
    });
  } catch (e) {
    return { ok: false, status: 0, detail: String((e && e.message) || 'network error').slice(0, 300) };
  }
  if (r.status === 404) return { ok: false, status: 404, detail: 'Not found' };
  if (!r.ok) {
    var detail = '';
    try { detail = String(await r.text()).slice(0, 300); } catch (e2) {}
    return { ok: false, status: r.status, detail: detail };
  }
  var json = await r.json();
  var inv = (json && json.invoice) ? json.invoice : (json && json.data ? json.data : json);
  if (!inv || inv.id == null) return { ok: false, status: 404, detail: 'Not found' };
  return { ok: true, invoice: inv };
}

module.exports = {
  SELLAUTH_BASE: SELLAUTH_BASE,
  deliverableOf: deliverableOf,
  nameOf: nameOf,
  getInvoice: getInvoice
};
