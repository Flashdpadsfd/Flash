/* FlashShp — Génère + envoie un code à 6 chiffres par email.
   =========================================================================
   Partagé par auth-email-request.js (connexion sans mot de passe) et
   auth-password-register.js (confirmation d'adresse avant d'activer le mot
   de passe choisi). Ne stocke rien : l'appelant décide comment persister le
   code (store.saveOtp, avec ou sans mot de passe en attente).

   La limite par IP vit ici (et pas juste par email) car chaque appel envoie
   un vrai email : viser N adresses différentes ne coûterait sinon rien à
   l'appelant, et épuiserait le quota SMTP / ferait classer le domaine en
   spam. Process Hostinger persistant → compteur en mémoire suffit. */

var crypto = require('crypto');
var mailer = require('./_mailer.js');

var IP_MAX = 5;                          // envois max par fenêtre
var IP_WINDOW_MS = 15 * 60 * 1000;       // fenêtre glissante : 15 minutes
var _ipHits = new Map();

function clientIp(req) {
  var fwd = String((req.headers && req.headers['x-forwarded-for']) || '').split(',')[0].trim();
  return fwd || (req.socket && req.socket.remoteAddress) || 'unknown';
}

function ipAllowed(req) {
  var now = Date.now();
  var ip = clientIp(req);
  var hits = (_ipHits.get(ip) || []).filter(function (t) { return now - t < IP_WINDOW_MS; });
  if (hits.length >= IP_MAX) { _ipHits.set(ip, hits); return false; }
  hits.push(now);
  _ipHits.set(ip, hits);
  if (_ipHits.size > 5000) {
    _ipHits.forEach(function (times, key) {
      if (!times.length || now - times[times.length - 1] >= IP_WINDOW_MS) _ipHits.delete(key);
    });
  }
  return true;
}

function codeEmailHtml(code, title, sub) {
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
    '<div style="font-size:19px;font-weight:700;color:#ffffff;text-align:center;">' + title + '</div>' +
    '<div style="font-size:14px;color:rgba(255,255,255,.55);text-align:center;margin:8px 0 26px;line-height:1.6;">' + sub + '</div>' +
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

/* opts.purpose: 'login' (défaut) | 'register' — change juste le texte affiché.
   Renvoie { ok:true, code } ou { ok:false, status, error }. */
async function sendCode(req, email, opts) {
  opts = opts || {};
  if (!ipAllowed(req)) return { ok: false, status: 429, error: 'Trop de demandes. Réessayez dans quelques minutes.' };
  var code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  var isRegister = opts.purpose === 'register';
  var title = isRegister ? 'Confirm your account' : 'Your sign-in code';
  var sub = isRegister
    ? 'Enter this code to confirm your email and finish creating your FlashShp account.'
    : 'Enter this code to access your FlashShp account.';
  await mailer.send({
    to: email,
    subject: (isRegister ? 'Confirm your FlashShp account: ' : 'Your FlashShp sign-in code: ') + code,
    html: codeEmailHtml(code, title, sub)
  });
  return { ok: true, code: code };
}

module.exports = { sendCode: sendCode };
