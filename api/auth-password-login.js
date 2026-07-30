/* FlashShp — Connexion par mot de passe.
   =========================================================================
   POST /api/auth-password-login   body: { "email": "...", "password": "..." }
   Pose la MÊME session signée `fs_session` que la connexion par code email.
   Anti-bruteforce par compte : 5 essais ratés → verrouillage 15 min (voir
   store.recordPasswordLoginResult). Message d'erreur volontairement
   identique (email/mot de passe invalide) que le compte existe ou non, ou
   qu'il n'ait pas de mot de passe défini — sans quoi la réponse renseigne un
   attaquant sur quelles adresses ont un compte. */

var store = require('./_store.js');
var origin = require('./_origin.js');
var session = require('./_session.js');
var pwd = require('./_password.js');

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
  if (!process.env.SESSION_SECRET) { res.status(501).json({ error: 'Session not configured' }); return; }
  if (!store.available()) { res.status(501).json({ error: 'Store not configured' }); return; }

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

    var username = client.username || email.split('@')[0] || 'Client';
    session.setSession(res, { sub: 'email:' + email, username: username, avatar: client.avatar || null, email: email });
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[FlashShp] auth-password-login failed:', e && e.message);
    res.status(502).json({ error: 'Erreur serveur. Réessayez.' });
  }
};
