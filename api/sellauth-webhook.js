/* FlashShp — Réception des notifications SellAuth (paiement confirmé).
   =========================================================================
   POST /api/sellauth-webhook
   Appelé par SellAuth (serveur-à-serveur), PAS par le navigateur du client :
   pas de vérification d'origine ici, la sécurité vient de la signature HMAC.

   Remplace l'ancienne confirmation "façon polling blockchain" du checkout
   crypto : désormais SellAuth traite le paiement lui-même (widget embed,
   voir checkout.html) et nous notifie ici quand une facture est payée. On
   récupère alors la facture complète, on l'enregistre (nexus_orders), on
   envoie l'email de livraison au client, et on relaie l'alerte Discord —
   exactement ce que faisait checkout.html:completeOrder() côté client avant,
   mais déclenché par SellAuth plutôt que par le navigateur du client.

   Sécurité : X-Signature = HMAC-SHA256(corps brut, SELLAUTH_WEBHOOK_SECRET).
   Le corps DOIT être vérifié sur ses octets bruts (req.rawBody, capturé par
   le verify() de express.json() dans server.js) — un JSON.stringify(req.body)
   ré-encodé ne reproduit pas forcément exactement ce que SellAuth a signé.

   Variables d'environnement : SELLAUTH_API_KEY, SELLAUTH_SHOP_ID (déjà
   utilisées ailleurs), SELLAUTH_WEBHOOK_SECRET (nouvelle — Storefront >
   Configure > Miscellaneous dans le dashboard SellAuth). */

var crypto = require('crypto');
var store = require('./_store.js');
var sellauthInvoice = require('./_sellauth-invoice.js');
var recordOrderMod = require('./record-order.js');
var sendOrderEmailMod = require('./send-order-email.js');

function safeEqual(a, b) {
  var ba = Buffer.from(String(a), 'hex'), bb = Buffer.from(String(b), 'hex');
  if (ba.length !== bb.length) return false;
  try { return crypto.timingSafeEqual(ba, bb); } catch (e) { return false; }
}

function verifySignature(req) {
  var secret = process.env.SELLAUTH_WEBHOOK_SECRET;
  if (!secret) return false;
  var signature = req.headers['x-signature'];
  if (!signature) return false;
  var raw = req.rawBody;
  if (!raw) return false;
  var expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  return safeEqual(expected, signature);
}

/* Relaie l'alerte Discord "Paiement confirmé" (même contenu que
   checkout.html:completeOrder() envoyait auparavant) et journalise la
   tentative dans nexus_webhook_logs, comme api/log-webhook.js. */
async function notifyDiscord(order) {
  try {
    var cfg = await store.getContent(['nexus_webhooks']);
    var wc = (cfg.nexus_webhooks || {}).ORDER_CREATE || {};
    if (!wc.url) return;

    var t0 = Date.now();
    var entry = {
      source: 'discord', event: 'ORDER_CREATE', url: String(wc.url).slice(0, 500),
      invoice_id: String(order.id).slice(0, 190)
    };
    try {
      var r = await fetch(wc.url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [{ title: '💎 Payment Confirmed', color: 0x57F287,
          fields: [
            { name: 'Invoice', value: String(order.id), inline: true },
            { name: 'Product', value: (order.productIcon || '📦') + ' ' + order.productName, inline: true },
            { name: 'Method', value: order.paymentMethod || 'sellauth', inline: true }
          ], footer: { text: 'FlashShp Store' }, timestamp: new Date().toISOString() }] })
      });
      entry.success = r.ok;
      entry.response_status = r.status;
    } catch (e) {
      entry.success = false;
      entry.error_type = 'network';
      entry.error_message = String((e && e.message) || e).slice(0, 1000);
    }
    entry.duration_ms = Date.now() - t0;

    var cur = await store.getContent(['nexus_webhook_logs']);
    var arr = Array.isArray(cur.nexus_webhook_logs) ? cur.nexus_webhook_logs : [];
    entry.id = arr.length ? (Number(arr[0].id) || 0) + 1 : 1;
    entry.created_at = new Date().toISOString();
    arr.unshift(entry);
    if (arr.length > 1000) arr = arr.slice(0, 1000);
    await store.setContent('nexus_webhook_logs', arr);
  } catch (e) {
    console.error('[FlashShp] sellauth-webhook discord notify failed:', e && e.message);
  }
}

/* Retrouve l'icône du produit local correspondant, pour l'affichage admin. */
async function localIconFor(sellauthProductId) {
  try {
    var cur = await store.getContent(['nexus_products']);
    var list = Array.isArray(cur.nexus_products) ? cur.nexus_products : [];
    var match = list.find(function (p) { return p && Number(p.sellauthProductId) === Number(sellauthProductId); });
    return (match && match.icon) || '📦';
  } catch (e) { return '📦'; }
}

module.exports = async function (req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  if (!verifySignature(req)) { res.status(401).json({ error: 'Invalid signature' }); return; }

  var body = (req.body && typeof req.body === 'object') ? req.body : {};
  var event = String(body.event || '');
  var invoiceId = body.data && body.data.invoice_id;

  /* On ne traite que les événements de facture ; tout le reste (avis, tickets,
     stock produit…) est acquitté sans action. */
  if (!/^NOTIFICATION\.SHOP_INVOICE_/i.test(event) || !invoiceId) {
    res.status(200).json({ ok: true, ignored: true });
    return;
  }

  try {
    var result = await sellauthInvoice.getInvoice(invoiceId);
    if (!result.ok) {
      /* 404 = facture introuvable, rien à faire ; autre erreur = transitoire,
         on répond 5xx pour que SellAuth réessaie. */
      res.status(result.status === 404 ? 200 : 502).json({ error: result.detail || 'Could not load invoice' });
      return;
    }
    var inv = result.invoice;

    /* Seule une facture réellement payée déclenche livraison/email/Discord. */
    if (String(inv.status || '').toLowerCase() !== 'completed') {
      res.status(200).json({ ok: true, skipped: true, status: inv.status });
      return;
    }

    var items = Array.isArray(inv.items) ? inv.items : [];
    var firstItem = items[0] || null;
    var productId = (firstItem && firstItem.product_id) || (firstItem && firstItem.product && firstItem.product.id) || null;
    var productName = sellauthInvoice.nameOf(firstItem, inv);
    var deliverable = items.length
      ? items.map(function (it) { return sellauthInvoice.deliverableOf(it); }).filter(Boolean).join('\n')
      : sellauthInvoice.deliverableOf(inv);

    var order = recordOrderMod.sanitizeOrder({
      id: inv.id,
      date: inv.completed_at || inv.created_at || new Date().toISOString(),
      email: inv.email || '',
      productId: productId,
      productName: productName,
      productIcon: await localIconFor(productId),
      price: inv.price,
      currency: inv.currency || 'EUR',
      deliverable: deliverable,
      status: 'completed',
      paymentMethod: 'sellauth',
      couponCode: inv.coupon_code || inv.coupon || ''
    });

    var recorded = await recordOrderMod.recordOrder(order);

    /* Uniquement pour une commande réellement nouvelle : évite de renvoyer
       l'email/Discord si SellAuth ré-émet la même notification (retries). */
    if (recorded.recorded) {
      if (order.email) {
        try {
          await sendOrderEmailMod.sendOrderEmail({
            to: order.email, invoiceId: String(order.id), productName: order.productName,
            deliverable: order.deliverable, type: 'ready'
          });
        } catch (e) { console.error('[FlashShp] sellauth-webhook order email failed:', e && e.message); }
      }
      await notifyDiscord(order);
    }

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ok: true, recorded: recorded.recorded });
  } catch (e) {
    console.error('[FlashShp] /api/sellauth-webhook failed:', e && e.message);
    res.status(502).json({ error: 'Webhook processing failed' });
  }
};
