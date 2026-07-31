/* FlashShp — Détail d'une commande + contenu livré (réservé au client).
   =========================================================================
   GET /api/order?id=<invoiceId>
   - 401 si pas de session.
   - Récupère l'invoice SellAuth par id, VÉRIFIE qu'elle appartient bien à
     l'e-mail de la session (sinon 403 — on ne voit que ses propres commandes).
   - Renvoie les produits + le contenu livré (deliverable) pour que le client
     puisse revoir ce qu'il a reçu.

   Réutilise SELLAUTH_API_KEY / SELLAUTH_SHOP_ID via _sellauth-invoice.js. */

var session = require('./_session.js');
var sellauthInvoice = require('./_sellauth-invoice.js');

module.exports = async function (req, res) {
  var sess = session.getSession(req);
  if (!sess) { res.status(401).json({ error: 'Not authenticated' }); return; }

  if (!process.env.SELLAUTH_API_KEY || !process.env.SELLAUTH_SHOP_ID) {
    res.status(501).json({ error: 'Orders not configured' }); return;
  }

  var url = new URL(req.url, 'http://localhost');
  var id = String(url.searchParams.get('id') || '').trim();
  if (!/^[0-9]+$/.test(id)) { res.status(400).json({ error: 'Invalid order id' }); return; }

  try {
    var result = await sellauthInvoice.getInvoice(id);
    if (!result.ok) {
      res.status(result.status === 404 ? 404 : 502).json({ error: result.status === 404 ? 'Order not found' : 'Could not load order' });
      return;
    }
    var inv = result.invoice;

    /* Sécurité : la commande doit appartenir à l'e-mail de la session. */
    var invEmail = String(inv.email || '').toLowerCase();
    var myEmail = String(sess.email || '').toLowerCase();
    if (!invEmail || invEmail !== myEmail) { res.status(403).json({ error: 'Forbidden' }); return; }

    var items = Array.isArray(inv.items) ? inv.items : [];
    var products = items.length
      ? items.map(function (it) {
          return { name: sellauthInvoice.nameOf(it, inv), quantity: it.quantity || it.qty || 1, deliverable: sellauthInvoice.deliverableOf(it) };
        })
      : [{ name: sellauthInvoice.nameOf(null, inv), quantity: 1, deliverable: sellauthInvoice.deliverableOf(inv) }];

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
