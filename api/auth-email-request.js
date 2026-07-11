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
  var digits = String(code).split('').map(function (dgt) {
    return '<td style="padding:0 4px;">' +
      '<div style="width:44px;height:56px;line-height:56px;text-align:center;font-size:26px;font-weight:800;' +
      'color:#ffffff;background:#141519;border:1px solid rgba(255,255,255,.14);border-radius:12px;">' + dgt + '</div>' +
      '</td>';
  }).join('');
  return '' +
'<div style="margin:0;padding:32px 14px;background:#08080a;font-family:Inter,Segoe UI,Arial,sans-serif;">' +
'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;">' +
  '<tr><td align="center" style="padding-bottom:6px;">' +
    '<span style="font-size:22px;font-weight:800;letter-spacing:-.4px;color:#ffffff;">Flash<span style="color:#9aa0ac;">Shp</span></span>' +
  '</td></tr>' +
  '<tr><td align="center" style="padding-bottom:24px;">' +
    '<div style="width:52px;height:3px;border-radius:3px;background:linear-gradient(90deg,#5b616e,#ffffff);"></div>' +
  '</td></tr>' +
  '<tr><td style="background:#0f1014;border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:34px 30px;">' +
    '<div style="font-size:19px;font-weight:700;color:#ffffff;text-align:center;">Your sign-in code</div>' +
    '<div style="font-size:14px;color:rgba(255,255,255,.55);text-align:center;margin:8px 0 26px;line-height:1.6;">Enter this code to access your FlashShp account.</div>' +
    '<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>' + digits + '</tr></table>' +
    '<div style="font-size:12.5px;color:rgba(255,255,255,.4);text-align:center;margin-top:22px;">Expires in 10 minutes &middot; one-time use</div>' +
    '<div style="height:1px;background:rgba(255,255,255,.07);margin:24px 0;"></div>' +
    '<div style="font-size:12.5px;color:rgba(255,255,255,.4);text-align:center;line-height:1.7;">Didn\'t request this? You can safely ignore this email — the code is useless without access to your inbox, and no one else can use it.</div>' +
  '</td></tr>' +
  '<tr><td align="center" style="padding-top:20px;">' +
    '<div style="font-size:11.5px;color:rgba(255,255,255,.32);"><a href="https://flashshp.fr" style="color:rgba(255,255,255,.45);text-decoration:none;">flashshp.fr</a> &middot; Automated message, please don\'t reply.</div>' +
    '<div style="font-size:11.5px;color:rgba(255,255,255,.22);margin-top:4px;">&#169; ' + new Date().getFullYear() + ' FlashShp</div>' +
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
      subject: 'Your FlashShp sign-in code: ' + code,
      html: codeEmailHtml(code)
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[FlashShp] auth-email-request failed:', e && e.message);
    res.status(502).json({ error: 'Envoi impossible. Réessayez plus tard.' });
  }
};
