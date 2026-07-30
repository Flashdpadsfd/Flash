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

var mailer = require('./_mailer.js');
var store = require('./_store.js');
var origin = require('./_origin.js');
var otpMail = require('./_otp-mail.js');

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

module.exports = async function (req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!origin.isAllowedOrigin(req)) { res.status(403).json({ error: 'Forbidden' }); return; }

  if (!mailer.available()) { res.status(501).json({ error: 'Email login not configured' }); return; }
  if (!store.available()) { res.status(501).json({ error: 'Store not configured' }); return; }

  var body = await readBody(req);
  var email = String((body && body.email) || '').trim().toLowerCase().slice(0, 254);
  if (!EMAIL_RE.test(email)) { res.status(400).json({ error: 'Invalid email' }); return; }

  try {
    /* Anti-spam : 1 code / 60 s / email (la limite par IP vit dans _otp-mail.js). */
    var allowed = await store.checkCooldown(email, 60);
    if (!allowed) { res.status(429).json({ error: 'Trop de demandes. Réessayez dans une minute.' }); return; }

    var sent = await otpMail.sendCode(req, email);
    if (!sent.ok) { res.status(sent.status).json({ error: sent.error }); return; }

    await store.saveOtp(email, sent.code);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[FlashShp] auth-email-request failed:', e && e.message);
    res.status(502).json({ error: 'Envoi impossible. Réessayez plus tard.' });
  }
};
