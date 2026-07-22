/* FlashShp — Renvoie l'utilisateur connecté + ses commandes SellAuth.
   =========================================================================
   GET /api/me
   - 401 si pas de session valide.
   - Sinon { user:{username,avatar,email}, orders:[...] } : les commandes du
     client (filtrées par email) récupérées côté serveur depuis SellAuth.

   Réutilise SELLAUTH_API_KEY / SELLAUTH_SHOP_ID (déjà configurés). */

var session = require('./_session.js');

var SELLAUTH_BASE = 'https://api.sellauth.com/v1';

function productsOf(inv) {
  var items = (inv && inv.items) || [];
  var names = [];
  if (Array.isArray(items)) {
    items.forEach(function (it) {
      var n = (it && (it.custom_name || (it.product && it.product.name))) || '';
      if (n) names.push(n);
    });
  }
  if (!names.length && inv && inv.product && inv.product.name) names.push(inv.product.name);
  return names;
}

module.exports = async function (req, res) {
  var sess = session.getSession(req);
  if (!sess) { res.status(401).json({ error: 'Not authenticated' }); return; }

  var user = { username: sess.username, avatar: sess.avatar || null, email: sess.email };

  var apiKey = process.env.SELLAUTH_API_KEY;
  var shopId = process.env.SELLAUTH_SHOP_ID;
  if (!apiKey || !shopId) {
    /* Auth OK mais SellAuth non configuré : on renvoie au moins le profil. */
    res.status(200).json({ ok: true, user: user, orders: [], ordersAvailable: false });
    return;
  }

  /* Sans e-mail dans la session, la requête partirait avec « ?email= » vide —
     et un filtre vide côté SellAuth renverrait les factures de TOUT LE MONDE.
     On refuse plutôt que de risquer d'exposer les commandes d'autrui. */
  var myEmail = String(sess.email || '').trim().toLowerCase();
  if (!myEmail) {
    res.status(200).json({ ok: true, user: user, orders: [], ordersAvailable: false });
    return;
  }

  try {
    var url = SELLAUTH_BASE + '/shops/' + encodeURIComponent(shopId) +
      '/invoices?email=' + encodeURIComponent(myEmail) +
      '&perPage=100&orderColumn=created_at&orderDirection=desc';
    var r = await fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Accept': 'application/json'
      }
    });
    if (!r.ok) { res.status(200).json({ ok: true, user: user, orders: [], ordersAvailable: false }); return; }
    var json = await r.json();
    var list = Array.isArray(json) ? json : (json && Array.isArray(json.data) ? json.data : []);

    /* Deuxième barrière : on ne se repose pas sur le filtre « ?email= » de
       SellAuth (recherche partielle ou filtre ignoré = commandes d'autrui
       exposées). On revérifie l'égalité stricte, comme le fait /api/order. */
    list = list.filter(function (inv) {
      return String((inv && inv.email) || '').trim().toLowerCase() === myEmail;
    });

    /* On n'expose QUE des champs sûrs (pas d'IP, user-agent, etc.). */
    var orders = list.map(function (inv) {
      return {
        id: inv.id,
        uniqueId: inv.unique_id || null,
        status: inv.status || 'unknown',
        price: inv.price != null ? Number(inv.price) : null,
        currency: inv.currency || 'EUR',
        gateway: inv.gateway || null,
        createdAt: inv.created_at || null,
        completedAt: inv.completed_at || null,
        products: productsOf(inv)
      };
    });

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ok: true, user: user, orders: orders, ordersAvailable: true });
  } catch (e) {
    console.error('[FlashShp] /api/me orders failed:', e && e.message);
    res.status(200).json({ ok: true, user: user, orders: [], ordersAvailable: false });
  }
};
