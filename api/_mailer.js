/* FlashShp — Envoi d'emails, transport SMTP configurable.
   =========================================================================
   Fichier préfixé « _ » → jamais exposé comme route ; require() par
   auth-email-request.js et send-order-email.js.

   Deux modes, dans l'ordre de priorité :
   1. SMTP générique (recommandé — ex. boîte mail Hostinger) :
        SMTP_HOST, SMTP_USER, SMTP_PASS  (obligatoires)
        SMTP_PORT   (défaut 465), SMTP_SECURE (défaut true si port 465)
      Ex. Hostinger : SMTP_HOST=smtp.hostinger.com, SMTP_PORT=465,
          SMTP_USER=contact@flashshp.fr, SMTP_PASS=<mot de passe de la boîte>
   2. Gmail (repli) : GMAIL_USER, GMAIL_APP_PASSWORD.

   Adresse d'expéditeur : MAIL_FROM (sinon SMTP_USER / GMAIL_USER).
   Nom affiché : FROM_NAME (défaut « FlashShp »). */

var nodemailer = require('nodemailer');

function config() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    var port = Number(process.env.SMTP_PORT || 465);
    var secure = process.env.SMTP_SECURE != null
      ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
      : port === 465;
    return {
      transport: {
        host: process.env.SMTP_HOST,
        port: port,
        secure: secure,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      },
      from: process.env.MAIL_FROM || process.env.SMTP_USER
    };
  }
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return {
      transport: { service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } },
      from: process.env.MAIL_FROM || process.env.GMAIL_USER
    };
  }
  return null;
}

function available() { return !!config(); }

function fromField() {
  var c = config();
  return {
    name: String(process.env.FROM_NAME || 'FlashShp').replace(/[\r\n]/g, ' '),
    address: (c && c.from) || ''
  };
}

/* Envoie un email. mail = { to, subject, html, text? }. Renvoie une Promise. */
async function send(mail) {
  var c = config();
  if (!c) throw new Error('Mail not configured');
  var transporter = nodemailer.createTransport(c.transport);
  return transporter.sendMail(Object.assign({ from: fromField() }, mail));
}

module.exports = { available: available, send: send, fromField: fromField };
