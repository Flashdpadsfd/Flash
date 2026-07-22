/* FlashShp — Vérifie le code email et ouvre la session client.
   =========================================================================
   POST /api/auth-email-verify   body: { "email": "...", "code": "123456" }
   1. Garde same-origin.
   2. Relit le code stocké dans Upstash, compare (temps constant), max 5 essais.
   3. Si OK : pose la MÊME session signée `fs_session` que le login Discord,
      enregistre le client dans le store, renvoie { ok:true }.

   Variables : SESSION_SECRET (signature), KV_* (Upstash). */

var crypto = require('crypto');
var session = require('./_session.js');
var store = require('./_store.js');

/* Même liste blanche stricte que auth-email-request.js (voir le commentaire
   là-bas) : l'adresse sert d'identifiant client et finit affichée dans l'admin. */
var EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

function hostFrom(value) { try { return new URL(value).hostname.toLowerCase(); } catch (e) { return ''; } }
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
  if (!process.env.SESSION_SECRET) { res.status(501).json({ error: 'Session not configured' }); return; }
  if (!store.available()) { res.status(501).json({ error: 'Store not configured' }); return; }

  var body = await readBody(req);
  var email = String((body && body.email) || '').trim().toLowerCase().slice(0, 254);
  var code = String((body && body.code) || '').trim();
  if (!EMAIL_RE.test(email) || !/^[0-9]{6}$/.test(code)) {
    res.status(400).json({ error: 'Email ou code invalide.' });
    return;
  }

  try {
    var rec = await store.getOtp(email);
    if (!rec || !rec.code) { res.status(400).json({ error: 'Code expiré ou invalide. Redemandez-en un.' }); return; }

    /* Anti-bruteforce : 5 essais max. */
    var attempts = (rec.attempts || 0) + 1;
    if (attempts > 5) { await store.deleteOtp(email); res.status(429).json({ error: 'Trop d\'essais. Redemandez un code.' }); return; }

    if (!safeEqual(code, String(rec.code))) {
      await store.bumpOtpAttempts(email, attempts);
      res.status(400).json({ error: 'Code incorrect. Il vous reste ' + (5 - attempts) + ' essai(s).' });
      return;
    }

    /* Succès : on brûle le code, ouvre la session, enregistre le client. */
    await store.deleteOtp(email);
    var username = email.split('@')[0] || 'Client';
    session.setSession(res, { sub: 'email:' + email, username: username, avatar: null, email: email });

    try {
      await store.recordClient({ id: 'email:' + email, username: username, avatar: null, email: email, provider: 'email' });
    } catch (e) { console.error('[FlashShp] record (email) failed:', e && e.message); }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[FlashShp] auth-email-verify failed:', e && e.message);
    res.status(502).json({ error: 'Erreur serveur. Réessayez.' });
  }
};
