/* FlashShp — Supprime un feedback SellAuth (réservé à l'admin).
   =========================================================================
   POST /api/feedback-delete   body: { "id": <feedbackId> }
   En-tête requis : « x-admin-secret: <ADMIN_SECRET> ».

   Sécurité (le panneau admin est statique, sans backend d'auth) :
   - Garde same-origin (mêmes règles que api/feedbacks.js).
   - Secret admin comparé à temps constant à process.env.ADMIN_SECRET.
     → le public ne peut pas supprimer sans connaître ce secret.
   La suppression réelle se fait côté serveur avec SELLAUTH_API_KEY (jamais
   exposée au client).

   Variables d'environnement :
   - ADMIN_SECRET      : secret que l'admin saisit dans le panneau (obligatoire).
   - SELLAUTH_API_KEY  : clé API SellAuth.
   - SELLAUTH_SHOP_ID  : id boutique. */

var crypto = require('crypto');

var SELLAUTH_BASE = 'https://api.sellauth.com/v1';

function hostFrom(value) {
  try { return new URL(value).hostname.toLowerCase(); } catch (e) { return ''; }
}
function isAllowedOrigin(req) {
  var src = (req.headers && (req.headers.origin || req.headers.referer)) || '';
  if (!src) return false;
  var host = hostFrom(src);
  if (!host) return false;
  /* Same-origin (hôte de l'Origin == hôte servant la page) : marche sur
     n'importe quel domaine (Hostinger, domaine perso…), sans config. */
  var selfHost = String((req.headers && req.headers.host) || '').toLowerCase().split(':')[0];
  if (selfHost && host === selfHost) return true;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  if (/^nexus-theme[a-z0-9-]*\.vercel\.app$/.test(host)) return true;
  if (/^flashshp[a-z0-9-]*\.vercel\.app$/.test(host)) return true;
  var extra = String(process.env.ALLOWED_ORIGINS || '')
    .split(',').map(function (h) { return h.trim().toLowerCase(); }).filter(Boolean);
  for (var i = 0; i < extra.length; i++) {
    if (host === extra[i] || host.endsWith('.' + extra[i])) return true;
  }
  return false;
}
function safeEqual(a, b) {
  var ba = Buffer.from(String(a)), bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  try { return crypto.timingSafeEqual(ba, bb); } catch (e) { return false; }
}
function readBody(req) {
  return new Promise(function (resolve) {
    if (req.body && typeof req.body === 'object') { resolve(req.body); return; }
    var data = '';
    req.on('data', function (c) { data += c; });
    req.on('end', function () { try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); } });
    req.on('error', function () { resolve({}); });
  });
}

module.exports = async function (req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!isAllowedOrigin(req)) { res.status(403).json({ error: 'Forbidden' }); return; }

  var adminSecret = process.env.ADMIN_SECRET;
  var apiKey = process.env.SELLAUTH_API_KEY;
  var shopId = process.env.SELLAUTH_SHOP_ID;
  if (!adminSecret || !apiKey || !shopId) {
    res.status(501).json({ error: 'Delete not configured' });
    return;
  }

  var provided = (req.headers && (req.headers['x-admin-secret'] || req.headers['X-Admin-Secret'])) || '';
  if (!provided || !safeEqual(provided, adminSecret)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  var body = await readBody(req);
  var id = body && body.id;
  if (id == null || String(id).replace(/[0-9]/g, '') !== '') {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }

  try {
    var url = SELLAUTH_BASE + '/shops/' + encodeURIComponent(shopId) +
      '/feedbacks/' + encodeURIComponent(String(id));
    var r = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Accept': 'application/json'
      }
    });
    if (!r.ok) {
      var txt = '';
      try { txt = await r.text(); } catch (e) {}
      res.status(502).json({ error: 'SellAuth delete failed ' + r.status, detail: txt.slice(0, 200) });
      return;
    }
    res.status(200).json({ ok: true, id: id });
  } catch (e) {
    console.error('[FlashShp] feedback delete failed:', e && e.message);
    res.status(502).json({ error: 'Delete failed' });
  }
};
