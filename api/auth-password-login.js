/* FlashShp — Connexion par mot de passe (1er facteur) → code email (2e facteur).
   =========================================================================
   POST /api/auth-password-login   body: { "email": "...", "password": "..." }
   Un mot de passe correct ne pose PAS la session directement : il déclenche
   l'envoi d'un code à 6 chiffres, vérifié ensuite par /api/auth-email-verify
   (même endpoint que l'inscription et la connexion sans mot de passe) — qui,
   lui, pose réellement la session. Le mot de passe seul ne suffit donc
   jamais à se connecter, ce qui protège contre un mot de passe deviné/réutilisé
   ailleurs.

   Anti-bruteforce par compte : 5 essais ratés → verrouillage 15 min (voir
   store.recordPasswordLoginResult). Message d'erreur volontairement
   identique (email/mot de passe invalide) que le compte existe ou non, ou
   qu'il n'ait pas de mot de passe défini — sans quoi la réponse renseigne un
   attaquant sur quelles adresses ont un compte. */

var store = require('./_store.js');
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
  if (!store.available()) { res.status(501).json({ error: 'Store not configured' }); return; }
  if (!otpMail.available()) { res.status(501).json({ error: 'Email login not configured' }); return; }

  var body = await readBody(req);
  var email = String((body && body.email) || '').trim().toLowerCase().slice(0, 254);
  var password = String((body && body.password) || '');
  if (!EMAIL_RE.test(email) || !password) { res.status(400).json({ error: 'Invalid email or password.' }); return; }

  try {
    var client = await store.getClientByEmail(email);
    if (!client || !client.passwordHash) {
      res.status(400).json({ error: 'Invalid email or password.' });
      return;
    }
    if (client.loginLockedUntil && Number(client.loginLockedUntil) > Date.now()) {
      res.status(429).json({ error: 'Too many attempts. Try again in a few minutes, or sign in with an email code instead.' });
      return;
    }

    var ok = pwd.verifyPassword(password, client.passwordHash);
    await store.recordPasswordLoginResult(email, ok);
    if (!ok) { res.status(400).json({ error: 'Invalid email or password.' }); return; }

    /* Mot de passe correct : deuxième facteur obligatoire, on envoie le code
       et on s'arrête là — /api/auth-email-verify posera la session une fois
       le code confirmé, jamais avant. */
    var allowed = await store.checkCooldown(email, 60);
    if (!allowed) { res.status(429).json({ error: 'Trop de demandes. Réessayez dans une minute.' }); return; }

    var sent = await otpMail.sendCode(req, email);
    if (!sent.ok) { res.status(sent.status).json({ error: sent.error }); return; }

    await store.saveOtp(email, sent.code);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[FlashShp] auth-password-login failed:', e && e.message);
    res.status(502).json({ error: 'Erreur serveur. Réessayez.' });
  }
};
