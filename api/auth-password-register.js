/* FlashShp — Inscription par mot de passe (avec preuve d'email).
   =========================================================================
   POST /api/auth-password-register   body: { "email": "...", "password": "..." }
   Le mot de passe n'est PAS activé tout de suite : on le hache et on le
   range en attente (otp_codes.pending_password_hash), puis on envoie un code
   à 6 chiffres comme pour une connexion classique. C'est /api/auth-email-verify
   qui, une fois le code vérifié (= preuve que l'appelant lit bien cette boîte
   mail), pose réellement le mot de passe sur le compte. Sans cette étape,
   n'importe qui pourrait « squatter » l'email de quelqu'un d'autre avec un
   mot de passe de son choix.

   Réponses : 200 {ok} (code envoyé, à vérifier via /login comme d'habitude),
   400 (email/mot de passe invalide), 409 (compte déjà protégé par un mot de
   passe), 429 (trop de demandes), 501 (non configuré). */

var store = require('./_store.js');
var mailer = require('./_mailer.js');
var origin = require('./_origin.js');
var pwd = require('./_password.js');
var otpMail = require('./_otp-mail.js');

var EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

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
  if (!origin.isAllowedOrigin(req)) { res.status(403).json({ error: 'Forbidden' }); return; }
  if (!mailer.available()) { res.status(501).json({ error: 'Email login not configured' }); return; }
  if (!store.available()) { res.status(501).json({ error: 'Store not configured' }); return; }

  var body = await readBody(req);
  var email = String((body && body.email) || '').trim().toLowerCase().slice(0, 254);
  var password = String((body && body.password) || '');
  if (!EMAIL_RE.test(email)) { res.status(400).json({ error: 'Please enter a valid email.' }); return; }
  if (password.length < 8 || password.length > 200) { res.status(400).json({ error: 'Password must be at least 8 characters.' }); return; }

  try {
    var existing = await store.getClientByEmail(email);
    if (existing && existing.passwordHash) {
      res.status(409).json({ error: 'An account with this email already exists. Sign in instead.' });
      return;
    }

    /* Anti-spam : 1 code / 60 s / email (la limite par IP vit dans _otp-mail.js). */
    var allowed = await store.checkCooldown(email, 60);
    if (!allowed) { res.status(429).json({ error: 'Trop de demandes. Réessayez dans une minute.' }); return; }

    var sent = await otpMail.sendCode(req, email, { purpose: 'register' });
    if (!sent.ok) { res.status(sent.status).json({ error: sent.error }); return; }

    await store.saveOtp(email, sent.code, pwd.hashPassword(password));
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[FlashShp] auth-password-register failed:', e && e.message);
    res.status(502).json({ error: 'Erreur serveur. Réessayez.' });
  }
};
