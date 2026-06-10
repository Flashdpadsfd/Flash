/* Nexus - Envoi des emails de commande via Gmail SMTP (fonction Vercel)
   =====================================================================
   Remplace EmailJS : pas de bandeau "Email sent via EmailJS.com",
   nom d'expediteur controle (FROM_NAME), gratuit (~500 emails/jour Gmail).

   Variables d'environnement a configurer sur Vercel :
   - GMAIL_USER          : adresse Gmail d'envoi (ex: astrashop250@gmail.com)
   - GMAIL_APP_PASSWORD  : mot de passe d'application Google (PAS le mot de
                           passe du compte) - cree sur myaccount.google.com
                           > Securite > Validation en deux etapes
                           > Mots de passe des applications
   - FROM_NAME           : nom d'expediteur affiche (defaut: FlashShp)

   Tant que ces variables ne sont pas definies, la fonction repond 501 et
   le site retombe automatiquement sur EmailJS. */

var nodemailer = require('nodemailer');
var emailCfg = require('../assets/email-config.js');

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

module.exports = function (req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  var user = process.env.GMAIL_USER;
  var pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    res.status(501).json({ error: 'SMTP not configured' });
    return;
  }

  var body = req.body || {};
  var to = String(body.to || '').trim().slice(0, 254);
  if (!EMAIL_RE.test(to)) {
    res.status(400).json({ error: 'Invalid recipient' });
    return;
  }

  /* Contenu borne et echappe : le template HTML reste cote serveur,
     le client ne fournit que des valeurs. */
  var invoiceId   = escHtml(String(body.invoiceId   || '').slice(0, 64));
  var productName = escHtml(String(body.productName || '').slice(0, 128));
  var deliverable = escHtml(String(body.deliverable || '').slice(0, 2000));
  var storeName   = escHtml(String(body.storeName   || 'Nexus').slice(0, 64));
  var storeUrl    = String(body.storeUrl || 'https://nexus-theme-iota.vercel.app/').slice(0, 200);
  if (!/^https?:\/\//.test(storeUrl)) storeUrl = 'https://nexus-theme-iota.vercel.app/';
  var subject     = String(body.subject || 'Your Order is Ready!').slice(0, 150);

  var html = emailCfg.template
    .replace(/\{\{invoice_id\}\}/g,     invoiceId)
    .replace(/\{\{product_name\}\}/g,   productName)
    .replace(/\{\{deliverable\}\}/g,    deliverable)
    .replace(/\{\{customer_email\}\}/g, escHtml(to))
    .replace(/\{\{store_name\}\}/g,     storeName)
    .replace(/\{\{store_url\}\}/g,      storeUrl);

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: user, pass: pass }
  });

  transporter.sendMail({
    from: { name: process.env.FROM_NAME || 'FlashShp', address: user },
    to: to,
    subject: subject,
    html: html
  }, function (err) {
    if (err) {
      console.error('[Nexus] SMTP send failed:', err && err.message);
      res.status(502).json({ error: 'Send failed' });
      return;
    }
    res.status(200).json({ ok: true });
  });
};
