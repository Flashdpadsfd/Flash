/* FlashShp — Envoi d'une alerte Discord + journalisation (nexus_webhook_logs),
   factorisé pour tout code serveur qui a besoin de notifier un événement
   (paiement confirmé, etc.) sans dupliquer la mécanique fetch+log.
   =========================================================================
   Préfixe « _ » : pas un endpoint, juste une librairie. Même format de log
   que api/log-webhook.js (utilisé, lui, par les appels faits côté client). */

var store = require('./_store.js');

/* eventType : clé dans nexus_webhooks (ex. 'ORDER_CREATE') — configurée côté
   admin (Discord Webhooks). embed : objet embed Discord complet (title,
   color, fields, footer, timestamp…). invoiceId : pour le log uniquement. */
async function notify(eventType, embed, invoiceId) {
  try {
    var cfg = await store.getContent(['nexus_webhooks']);
    var wc = (cfg.nexus_webhooks || {})[eventType] || {};
    if (!wc.url) return;

    var t0 = Date.now();
    var entry = {
      source: 'discord', event: eventType, url: String(wc.url).slice(0, 500),
      invoice_id: invoiceId != null ? String(invoiceId).slice(0, 190) : null
    };
    try {
      var body = { embeds: [embed] };
      if (wc.msg) body.content = wc.msg;
      var r = await fetch(wc.url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
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
    console.error('[FlashShp] discord notify failed:', e && e.message);
  }
}

module.exports = { notify: notify };
