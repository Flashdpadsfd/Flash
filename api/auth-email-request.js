/* FlashShp — Envoi d'un code de connexion par email (OTP).
   =========================================================================
   POST /api/auth-email-request   body: { "email": "client@exemple.com" }
   1. Vérifie l'origine (garde same-origin).
   2. Génère un code à 6 chiffres, le stocke dans Upstash (expire 10 min).
   3. Anti-spam : 1 envoi max / 60 s par email.
   4. Envoie le code par email via le mailer partagé (SMTP Hostinger/Gmail).

   Variables d'environnement :
   - SMTP_HOST/USER/PASS (ou GMAIL_USER/GMAIL_APP_PASSWORD) : voir _mailer.js.
   - FROM_NAME (optionnel) : nom d'expéditeur (défaut FlashShp).
   - DB_* (MySQL) : stockage du code (via _store.js).
   Réponses : 200 {ok}, 429 (cooldown), 501 (non configuré), 400 (email invalide). */

var crypto = require('crypto');
var mailer = require('./_mailer.js');
var store = require('./_store.js');

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
function readBody(req) {
  return new Promise(function (resolve) {
    if (req.body && typeof req.body === 'object') { resolve(req.body); return; }
    var data = '';
    req.on('data', function (c) { data += c; });
    req.on('end', function () { try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); } });
    req.on('error', function () { resolve({}); });
  });
}

function codeEmailHtml(code) {
  return '<div style="font-family:Inter,Arial,sans-serif;background:#0e0f13;color:#fff;padding:32px;border-radius:16px;max-width:440px;margin:auto;">' +
    '<div style="font-size:22px;font-weight:800;letter-spacing:-.5px;margin-bottom:6px;">Flash<span style="color:#c9ccd3;">Shp</span></div>' +
    '<div style="font-size:15px;color:rgba(255,255,255,.6);margin-bottom:22px;">Votre code de connexion</div>' +
    '<div style="font-size:34px;font-weight:800;letter-spacing:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:16px;text-align:center;">' + code + '</div>' +
    '<div style="font-size:13px;color:rgba(255,255,255,.45);margin-top:20px;line-height:1.6;">Ce code expire dans 10 minutes. Si vous n\'êtes pas à l\'origine de cette demande, ignorez cet email — personne ne peut accéder à votre compte sans ce code.</div>' +
    '</div>';
}

module.exports = async function (req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!isAllowedOrigin(req)) { res.status(403).json({ error: 'Forbidden' }); return; }

  if (!mailer.available()) { res.status(501).json({ error: 'Email login not configured' }); return; }
  if (!store.available()) { res.status(501).json({ error: 'Store not configured' }); return; }

  var body = await readBody(req);
  var email = String((body && body.email) || '').trim().toLowerCase().slice(0, 254);
  if (!EMAIL_RE.test(email)) { res.status(400).json({ error: 'Invalid email' }); return; }

  try {
    /* Anti-spam : 1 code / 60 s / email. */
    var allowed = await store.checkCooldown(email, 60);
    if (!allowed) { res.status(429).json({ error: 'Trop de demandes. Réessayez dans une minute.' }); return; }

    /* Code à 6 chiffres, aléatoire sécurisé. */
    var code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    await store.saveOtp(email, code);

    await mailer.send({
      to: email,
      subject: 'Votre code de connexion FlashShp : ' + code,
      html: codeEmailHtml(code)
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[FlashShp] auth-email-request failed:', e && e.message);
    res.status(502).json({ error: 'Envoi impossible. Réessayez plus tard.' });
  }
};
