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
  var spaced = String(code).split('').join('&nbsp;&nbsp;');
  return '' +
'<div style="margin:0;padding:28px 12px;background:#08080a;font-family:Inter,Arial,Helvetica,sans-serif;">' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">' +
  '<tr><td align="center" style="padding:8px 0 22px;">' +
    '<span style="font-size:24px;font-weight:800;letter-spacing:-.5px;color:#ffffff;">Flash<span style="color:#9aa0ac;">Shp</span></span>' +
  '</td></tr>' +
  '<tr><td style="background:#0f1014;border:1px solid rgba(255,255,255,.09);border-radius:18px;overflow:hidden;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
      '<tr><td style="padding:22px 28px;border-bottom:1px solid rgba(255,255,255,.07);text-align:center;">' +
        '<span style="font-size:19px;font-weight:700;color:#ffffff;">&#128274; Your Login Code</span>' +
      '</td></tr>' +
      '<tr><td style="padding:28px 28px 8px;text-align:center;">' +
        '<div style="font-size:14px;color:rgba(255,255,255,.6);margin-bottom:20px;">Use the code below to sign in to your <b style="color:#fff;">FlashShp</b> account:</div>' +
        '<div style="font-size:34px;font-weight:800;letter-spacing:6px;color:#ffffff;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:20px 12px;">' + spaced + '</div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,.42);margin-top:18px;">This code expires in 10 minutes.</div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,.42);margin:6px 0 24px;">If you didn\'t request this code, you can safely ignore this email.</div>' +
      '</td></tr>' +
      '<tr><td style="padding:0 22px 22px;">' +
        '<div style="background:rgba(250,204,21,.06);border:1px solid rgba(250,204,21,.2);border-radius:12px;padding:14px 16px;text-align:center;">' +
          '<div style="font-size:13px;font-weight:700;color:#fde047;">&#9888;&#65039; Having an issue?</div>' +
          '<div style="font-size:12.5px;color:rgba(255,255,255,.55);margin-top:5px;line-height:1.6;">Visit <a href="https://flashshp.fr" style="color:#fde047;text-decoration:none;">flashshp.fr</a> or contact our support — never share this code with anyone.</div>' +
        '</div>' +
      '</td></tr>' +
    '</table>' +
  '</td></tr>' +
  '<tr><td align="center" style="padding:20px 0 4px;">' +
    '<div style="font-size:11.5px;color:rgba(255,255,255,.3);">&#169; ' + new Date().getFullYear() + ' FlashShp. All rights reserved.</div>' +
    '<div style="font-size:11.5px;color:rgba(255,255,255,.25);margin-top:3px;">This is an automated message.</div>' +
  '</td></tr>' +
'</table>' +
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
      subject: '🔐 Your Login Code - ' + code,
      html: codeEmailHtml(code)
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[FlashShp] auth-email-request failed:', e && e.message);
    res.status(502).json({ error: 'Envoi impossible. Réessayez plus tard.' });
  }
};
