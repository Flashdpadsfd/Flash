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
var origin = require('./_origin.js');

/* Liste blanche de caractères (et non « tout sauf espace et @ ») : l'adresse
   devient l'identifiant du client, stocké puis réaffiché dans le panneau admin.
   L'ancienne règle laissait passer apostrophes, parenthèses et points-virgules,
   de quoi injecter du code dans l'admin via une adresse fabriquée. */
var EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

/* Règle d'origine partagée : voir api/_origin.js. */
function readBody(req) {
  return new Promise(function (resolve) {
    if (req.body && typeof req.body === 'object') { resolve(req.body); return; }
    var data = '';
    req.on('data', function (c) { data += c; });
    req.on('end', function () { try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); } });
    req.on('error', function () { resolve({}); });
  });
}

/* ── Limite par IP (en plus du cooldown par adresse) ──
   Le cooldown de _store.js est indexé sur l'e-mail : viser 10 000 adresses
   différentes ne coûtait rien, et cet endpoint envoie un vrai e-mail à chaque
   appel. De quoi épuiser le quota SMTP et faire classer le domaine en
   expéditeur de spam. Le garde d'origine ne protège pas de ça : un en-tête
   Origin se falsifie hors navigateur.
   Compteur en mémoire — le process Hostinger est persistant (même raisonnement
   que le cache de api/feedbacks.js). */
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
  /* Purge des IP inactives : sans ça la Map grossit indéfiniment (fuite mémoire
     sur un process qui tourne des semaines). */
  if (_ipHits.size > 5000) {
    _ipHits.forEach(function (times, key) {
      if (!times.length || now - times[times.length - 1] >= IP_WINDOW_MS) _ipHits.delete(key);
    });
  }
  return true;
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
  if (!origin.isAllowedOrigin(req)) { res.status(403).json({ error: 'Forbidden' }); return; }

  if (!mailer.available()) { res.status(501).json({ error: 'Email login not configured' }); return; }
  if (!store.available()) { res.status(501).json({ error: 'Store not configured' }); return; }

  if (!ipAllowed(req)) {
    res.status(429).json({ error: 'Trop de demandes. Réessayez dans quelques minutes.' });
    return;
  }

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
