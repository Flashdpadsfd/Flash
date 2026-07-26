/* FlashShp — Enregistre une commande côté serveur (pour qu'elle apparaisse dans
   l'admin, quel que soit le navigateur du client).
   =========================================================================
   POST /api/record-order   body : la commande (id = invoice id, email, produit…)

   Le checkout tourne sur le navigateur du CLIENT : sans ça, la commande ne vivait
   que dans son localStorage et n'atteignait jamais l'admin (autre domaine). Ici
   on l'ajoute à la clé `nexus_orders` en base ; l'admin la lit déjà via
   /api/content?scope=admin.

   Écriture PUBLIQUE (le checkout n'a pas le secret admin) mais bornée : même
   origine seulement, champs sur liste blanche, tailles plafonnées, dédoublonnage
   par id. Env : DB_* (via _store.js). */

var origin = require('./_origin.js');
var store = require('./_store.js');

var MAX_ORDERS = 5000;          /* garde-fou : on ne garde que les plus récentes */
var MAX_FIELD = 4000;           /* longueur max d'un champ texte (deliverable…) */

function readBody(req) {
  return new Promise(function (resolve) {
    if (req.body && typeof req.body === 'object') { resolve(req.body); return; }
    var data = '';
    req.on('data', function (c) { data += c; if (data.length > 64 * 1024) req.destroy(); });
    req.on('end', function () { try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); } });
    req.on('error', function () { resolve({}); });
  });
}

function str(v, max) { return String(v == null ? '' : v).slice(0, max || 255); }

/* Ne garde que des champs connus, taillés — jamais le corps brut du client. */
function sanitizeOrder(b) {
  return {
    id:            str(b.id, 190),
    date:          str(b.date, 40) || new Date().toISOString(),
    email:         str(b.email, 255),
    productId:     (b.productId != null && b.productId !== '') ? Number(b.productId) : null,
    productName:   str(b.productName, 255),
    productIcon:   str(b.productIcon, 16),
    price:         Number(b.price) || 0,
    currency:      str(b.currency, 8) || 'EUR',
    deliverable:   str(b.deliverable, MAX_FIELD),
    status:        str(b.status, 24) || 'completed',
    paymentMethod: str(b.paymentMethod, 40),
    txHash:        str(b.txHash, 190)
  };
}

module.exports = async function (req, res) {
  if (origin.handlePreflight(req, res)) return;
  origin.applyCors(req, res);

  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  /* Anti-abus : seul le front de la boutique (même origine) peut enregistrer. */
  if (!origin.isAllowedOrigin(req)) { res.status(403).json({ error: 'Forbidden' }); return; }
  if (!store.available()) { res.status(501).json({ error: 'Store not configured' }); return; }

  var body = await readBody(req);
  var order = sanitizeOrder(body);
  if (!order.id) { res.status(400).json({ error: 'Missing order id' }); return; }

  try {
    var cur = await store.getContent(['nexus_orders']);
    var arr = Array.isArray(cur.nexus_orders) ? cur.nexus_orders : [];

    /* Idempotent : le checkout peut ré-émettre — on ne double pas une commande. */
    var exists = arr.some(function (o) { return o && String(o.id) === String(order.id); });
    if (!exists) {
      arr.unshift(order);
      if (arr.length > MAX_ORDERS) arr = arr.slice(0, MAX_ORDERS);
      await store.setContent('nexus_orders', arr);
    }
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ok: true, recorded: !exists });
  } catch (e) {
    console.error('[FlashShp] /api/record-order failed:', e && e.message);
    res.status(502).json({ error: 'Could not record order' });
  }
};
