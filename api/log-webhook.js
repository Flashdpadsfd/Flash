/* FlashShp — Journal des envois de webhook (façon SellAuth « Webhook Logs »).
   =========================================================================
   POST /api/log-webhook
   body : { source, event, url, success, response_status, response_body,
            error_type, error_message, duration_ms, invoice_id? }

   Chaque appel Discord (commande créée, remboursement, produit ajouté, stock
   bas…) était jusqu'ici « fire-and-forget » (.catch(function(){})) : impossible
   de savoir si Discord avait bien reçu la notification. On journalise donc
   chaque tentative, pour un affichage façon SellAuth dans l'admin (succès/échec,
   code de réponse, durée, horodatage).

   Écriture PUBLIQUE (le checkout, sans secret admin, doit pouvoir logger) mais
   bornée : même origine (boutique OU panneau admin) seulement, champs sur liste
   blanche, tailles plafonnées. Lecture réservée à l'admin (clé ADMIN dans
   api/content.js, comme nexus_orders). */

var origin = require('./_origin.js');
var store = require('./_store.js');

var MAX_LOGS = 1000;      /* garde-fou : ne garde que les plus récents */
var MAX_FIELD = 1000;

function readBody(req) {
  return new Promise(function (resolve) {
    if (req.body && typeof req.body === 'object') { resolve(req.body); return; }
    var data = '';
    req.on('data', function (c) { data += c; if (data.length > 32 * 1024) req.destroy(); });
    req.on('end', function () { try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); } });
    req.on('error', function () { resolve({}); });
  });
}

function str(v, max) { return String(v == null ? '' : v).slice(0, max || 255); }

function sanitizeLog(b, nextId) {
  return {
    id: nextId,
    source: str(b.source, 24) || 'discord',
    event: str(b.event, 64) || 'UNKNOWN',
    url: str(b.url, 500),
    invoice_id: b.invoice_id != null ? str(b.invoice_id, 190) : null,
    response_status: (b.response_status != null && b.response_status !== '') ? Number(b.response_status) : null,
    response_body: str(b.response_body, MAX_FIELD),
    success: !!b.success,
    error_type: b.error_type ? str(b.error_type, 64) : null,
    error_message: b.error_message ? str(b.error_message, MAX_FIELD) : null,
    duration_ms: Number(b.duration_ms) || 0,
    created_at: new Date().toISOString()
  };
}

module.exports = async function (req, res) {
  if (origin.handlePreflight(req, res)) return;
  origin.applyCors(req, res);

  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  /* Anti-abus : boutique (même origine) ou panneau admin (CORS dédié) seulement. */
  if (!origin.isAllowedOrigin(req)) { res.status(403).json({ error: 'Forbidden' }); return; }
  if (!store.available()) { res.status(501).json({ error: 'Store not configured' }); return; }

  var body = await readBody(req);

  try {
    var cur = await store.getContent(['nexus_webhook_logs']);
    var arr = Array.isArray(cur.nexus_webhook_logs) ? cur.nexus_webhook_logs : [];
    var nextId = arr.length ? (Number(arr[0].id) || 0) + 1 : 1;

    var entry = sanitizeLog(body, nextId);
    arr.unshift(entry);
    if (arr.length > MAX_LOGS) arr = arr.slice(0, MAX_LOGS);
    await store.setContent('nexus_webhook_logs', arr);

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ok: true, id: entry.id });
  } catch (e) {
    console.error('[FlashShp] /api/log-webhook failed:', e && e.message);
    res.status(502).json({ error: 'Could not log webhook' });
  }
};
