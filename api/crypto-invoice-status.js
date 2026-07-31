/* FlashShp — Vérifie une facture crypto en attente et livre la commande une
   fois le paiement confirmé sur la blockchain, ENTIÈREMENT côté serveur.
   =========================================================================
   GET /api/crypto-invoice-status?id=<invoiceId>
   → { ok:true, status: 'pending'|'awaiting_confirmation'|'completed'|'expired',
       txHash?, confirmations?, deliverable? }

   Remplace l'ancien polling fait par le NAVIGATEUR du client (qui pouvait être
   fermé, ralenti, ou dont le résultat n'était jamais vérifié par personne
   d'autre) : ici, adresse et montant attendus viennent uniquement de la
   facture stockée par api/crypto-invoice-create.js — jamais de la requête
   du client — donc rien de ce qu'un visiteur envoie ne peut faire passer un
   paiement pour confirmé. */

var origin = require('./_origin.js');
var pending = require('./_crypto-pending.js');
var recordOrderMod = require('./record-order.js');
var sendOrderEmailMod = require('./send-order-email.js');
var discordNotify = require('./_discord-notify.js');
var store = require('./_store.js');

var RECHECK_THROTTLE_MS = 10 * 1000;   /* pas plus d'un vrai appel blockchain toutes les 10s par facture */
var MATCH_THRESHOLD = 0.9;             /* accepte un paiement dès 90% du montant attendu (frais réseau) */
var RECENT_WINDOW_MS = 5 * 60 * 1000;  /* ignore les transactions antérieures à createdAt - 5 min */

/* ── Vérifications blockchain (portées du client vers le serveur, logique
     inchangée — seule la provenance de address/expectedAmount change). ── */

async function checkBtcLtc(coin, address, expectedAmount, afterMs) {
  var network = coin === 'btc' ? 'btc' : 'ltc';
  var r = await fetch('https://api.blockcypher.com/v1/' + network + '/main/addrs/' + encodeURIComponent(address) + '/full?limit=10');
  var data = await r.json();
  if (data.error) throw new Error(data.error);
  var txs = data.txs || [];
  for (var i = 0; i < txs.length; i++) {
    var tx = txs[i];
    var rMs = tx.received ? new Date(tx.received).getTime() : 0;
    if (rMs < afterMs - RECENT_WINDOW_MS) continue;
    var confs = tx.confirmations || 0;
    var outputs = tx.outputs || [];
    for (var j = 0; j < outputs.length; j++) {
      var out = outputs[j];
      if ((out.addresses || []).indexOf(address) !== -1) {
        var amt = (out.value || 0) / 1e8;
        if (amt >= expectedAmount * MATCH_THRESHOLD) {
          return { confirmed: confs >= 1, txHash: tx.hash, confirmations: confs };
        }
      }
    }
  }
  return { confirmed: false };
}

async function checkEth(address, expectedAmount, afterMs) {
  var r = await fetch('https://eth.blockscout.com/api?module=account&action=txlist&address=' + encodeURIComponent(address) + '&sort=desc&page=1&offset=20');
  var data = await r.json();
  var txs = Array.isArray(data.result) ? data.result : [];
  for (var i = 0; i < txs.length; i++) {
    var tx = txs[i];
    var txMs = parseInt(tx.timeStamp || '0', 10) * 1000;
    if (txMs < afterMs - RECENT_WINDOW_MS) continue;
    if (tx.isError === '1') continue;
    if ((tx.to || '').toLowerCase() !== address.toLowerCase()) continue;
    var amt = parseInt(tx.value || '0', 10) / 1e18;
    if (amt >= expectedAmount * MATCH_THRESHOLD) {
      var confs = parseInt(tx.confirmations || '0', 10);
      return { confirmed: confs >= 1, txHash: tx.hash, confirmations: confs };
    }
  }
  return { confirmed: false };
}

async function checkSol(address, expectedAmount, afterMs) {
  var sigRes = await fetch('https://api.mainnet-beta.solana.com', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress', params: [address, { limit: 10 }] })
  });
  var sigData = await sigRes.json();
  var sigs = (sigData.result || []).filter(function (s) { return s.blockTime && s.blockTime * 1000 >= afterMs - RECENT_WINDOW_MS; }).slice(0, 3);
  for (var i = 0; i < sigs.length; i++) {
    var txRes = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getTransaction', params: [sigs[i].signature, { encoding: 'json', maxSupportedTransactionVersion: 0 }] })
    });
    var txData = await txRes.json();
    var tx = txData.result;
    if (!tx || (tx.meta && tx.meta.err)) continue;
    var accs = (tx.transaction && tx.transaction.message && tx.transaction.message.accountKeys) || [];
    var idx = accs.indexOf(address);
    if (idx === -1) continue;
    var pre = (tx.meta.preBalances || [])[idx] || 0;
    var post = (tx.meta.postBalances || [])[idx] || 0;
    var recv = (post - pre) / 1e9;
    if (recv >= expectedAmount * MATCH_THRESHOLD) {
      return { confirmed: true, txHash: sigs[i].signature, confirmations: 1 };
    }
  }
  return { confirmed: false };
}

function checkChain(order) {
  if (order.coin === 'btc' || order.coin === 'ltc') return checkBtcLtc(order.coin, order.address, order.amountCrypto, order.createdAt);
  if (order.coin === 'eth') return checkEth(order.address, order.amountCrypto, order.createdAt);
  if (order.coin === 'sol') return checkSol(order.address, order.amountCrypto, order.createdAt);
  return Promise.resolve({ confirmed: false });
}

/* Prend un livrable pour la commande (server-side, jamais fait par le client)
   et décrémente le stock — même logique que l'ancien checkout.html. */
async function takeDeliverable(productId, invoiceId) {
  var content = await store.getContent(['nexus_products']);
  var products = Array.isArray(content.nexus_products) ? content.nexus_products : [];
  var idx = products.findIndex(function (p) { return p && Number(p.id) === Number(productId); });
  if (idx === -1) return '(Contact support — invoice: ' + invoiceId + ')';
  var product = products[idx];
  var deliverable;
  if (Array.isArray(product.deliverables) && product.deliverables.length > 0) {
    deliverable = product.deliverables[0];
    product.deliverables = product.deliverables.slice(1);
  } else {
    deliverable = '(Contact support — invoice: ' + invoiceId + ')';
    if (Number(product.stock) > 0) product.stock = Number(product.stock) - 1;
  }
  products[idx] = product;
  await store.setContent('nexus_products', products);
  return deliverable;
}

async function fulfill(order) {
  /* Deuxième garde : si une requête concurrente a déjà marqué la facture
     complétée entre la lecture et ici, on ne livre pas deux fois. */
  var fresh = await pending.get(order.id);
  if (!fresh || fresh.status === 'completed') return fresh;

  var deliverable = await takeDeliverable(order.productId, order.id);
  var completed = await pending.update(order.id, { status: 'completed', deliverable: deliverable });

  var orderRecord = recordOrderMod.sanitizeOrder({
    id: order.id, date: new Date().toISOString(), email: order.email,
    productId: order.productId, productName: order.productName, productIcon: order.productIcon,
    price: order.fiatAmount, currency: order.currency, deliverable: deliverable, status: 'completed',
    paymentMethod: 'crypto_' + order.coin, couponCode: order.couponCode
  });
  await recordOrderMod.recordOrder(orderRecord);

  try {
    await sendOrderEmailMod.sendOrderEmail({
      to: order.email, invoiceId: order.id, productName: order.productName,
      deliverable: deliverable, type: 'ready'
    });
  } catch (e) { console.error('[FlashShp] crypto-invoice-status order email failed:', e && e.message); }

  await discordNotify.notify('ORDER_CREATE', {
    title: '💎 Payment Confirmed', color: 0x57F287,
    fields: [
      { name: 'Invoice', value: String(order.id), inline: true },
      { name: 'Product', value: (order.productIcon || '📦') + ' ' + order.productName, inline: true },
      { name: 'Method', value: 'crypto_' + order.coin, inline: true }
    ], footer: { text: 'FlashShp Store' }, timestamp: new Date().toISOString()
  }, order.id);

  return completed;
}

module.exports = async function (req, res) {
  if (origin.handlePreflight(req, res)) return;
  origin.applyCors(req, res);
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!origin.isAllowedOrigin(req)) { res.status(403).json({ error: 'Forbidden' }); return; }

  var url = new URL(req.url, 'http://localhost');
  var id = String(url.searchParams.get('id') || '').trim();
  if (!id) { res.status(400).json({ error: 'Missing id' }); return; }

  res.setHeader('Cache-Control', 'no-store');

  try {
    var order = await pending.get(id);
    if (!order) { res.status(404).json({ error: 'Invoice not found' }); return; }

    if (order.status === 'completed') {
      res.status(200).json({ ok: true, status: 'completed', deliverable: order.deliverable });
      return;
    }
    if (order.status === 'expired' || Date.now() > order.expiresAt) {
      if (order.status !== 'expired') await pending.update(id, { status: 'expired' });
      res.status(200).json({ ok: true, status: 'expired' });
      return;
    }

    /* Throttle : un client qui poll trop vite ne déclenche pas un appel
       blockchain à chaque fois, il reçoit juste le dernier état connu. */
    if (Date.now() - (order.lastCheckedAt || 0) < RECHECK_THROTTLE_MS) {
      res.status(200).json({ ok: true, status: 'pending' });
      return;
    }
    await pending.update(id, { lastCheckedAt: Date.now() });

    var result;
    try {
      result = await checkChain(order);
    } catch (e) {
      /* Erreur réseau/API tierce : on répond "pending" plutôt qu'une erreur —
         le client réessaiera au prochain intervalle. */
      res.status(200).json({ ok: true, status: 'pending' });
      return;
    }

    if (!result || !result.confirmed) {
      var status = (result && result.txHash) ? 'awaiting_confirmation' : 'pending';
      res.status(200).json({ ok: true, status: status, txHash: result && result.txHash, confirmations: result && result.confirmations });
      return;
    }

    var fulfilled = await fulfill(order);
    res.status(200).json({ ok: true, status: 'completed', txHash: result.txHash, deliverable: fulfilled && fulfilled.deliverable });
  } catch (e) {
    console.error('[FlashShp] /api/crypto-invoice-status failed:', e && e.message);
    res.status(502).json({ error: 'Could not check invoice' });
  }
};
