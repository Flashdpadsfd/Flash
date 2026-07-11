/* FlashShp — Détail d'une commande + contenu livré (réservé au client).
   =========================================================================
   GET /api/order?id=<invoiceId>
   - 401 si pas de session.
   - Récupère l'invoice SellAuth par id, VÉRIFIE qu'elle appartient bien à
     l'e-mail de la session (sinon 403 — on ne voit que ses propres commandes).
   - Renvoie les produits + le contenu livré (deliverable) pour que le client
     puisse revoir ce qu'il a reçu.

   Réutilise SELLAUTH_API_KEY / SELLAUTH_SHOP_ID. */

var session = require('./_session.js');

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

module.exports = async function (req, res) {
  var sess = session.getSession(req);
  if (!sess) { res.status(401).json({ error: 'Not authenticated' }); return; }

  var apiKey = process.env.SELLAUTH_API_KEY;
  var shopId = process.env.SELLAUTH_SHOP_ID;
  if (!apiKey || !shopId) { res.status(501).json({ error: 'Orders not configured' }); return; }

  var url = new URL(req.url, 'http://localhost');
  var id = String(url.searchParams.get('id') || '').trim();
  if (!/^[0-9]+$/.test(id)) { res.status(400).json({ error: 'Invalid order id' }); return; }

  try {
    var r = await fetch(SELLAUTH_BASE + '/shops/' + encodeURIComponent(shopId) + '/invoices/' + encodeURIComponent(id), {
      headers: { 'Authorization': 'Bearer ' + apiKey, 'Accept': 'application/json' }
    });
    if (r.status === 404) { res.status(404).json({ error: 'Order not found' }); return; }
    if (!r.ok) { res.status(502).json({ error: 'Could not load order' }); return; }
    var json = await r.json();
    var inv = (json && json.invoice) ? json.invoice : (json && json.data ? json.data : json);
    if (!inv || inv.id == null) { res.status(404).json({ error: 'Order not found' }); return; }

    /* Sécurité : la commande doit appartenir à l'e-mail de la session. */
    var invEmail = String(inv.email || '').toLowerCase();
    var myEmail = String(sess.email || '').toLowerCase();
    if (!invEmail || invEmail !== myEmail) { res.status(403).json({ error: 'Forbidden' }); return; }

    var items = Array.isArray(inv.items) ? inv.items : [];
    var products = items.length
      ? items.map(function (it) {
          return { name: nameOf(it, inv), quantity: it.quantity || it.qty || 1, deliverable: deliverableOf(it) };
        })
      : [{ name: nameOf(null, inv), quantity: 1, deliverable: deliverableOf(inv) }];

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      ok: true,
      id: inv.id,
      uniqueId: inv.unique_id || null,
      status: inv.status || 'unknown',
      price: inv.price != null ? Number(inv.price) : null,
      currency: inv.currency || 'EUR',
      createdAt: inv.created_at || null,
      completedAt: inv.completed_at || null,
      products: products
    });
  } catch (e) {
    console.error('[FlashShp] /api/order failed:', e && e.message);
    res.status(502).json({ error: 'Could not load order' });
  }
};
