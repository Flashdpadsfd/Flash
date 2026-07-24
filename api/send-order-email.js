/* FlashShp - Envoi des emails de commande via Gmail SMTP (handler api)
   =====================================================================
   Remplace EmailJS : pas de bandeau "Email sent via EmailJS.com",
   nom d'expediteur controle (FROM_NAME), gratuit (~500 emails/jour Gmail).

   Variables d'environnement a configurer :
   - GMAIL_USER          : adresse Gmail d'envoi (ex: astrashop250@gmail.com)
   - GMAIL_APP_PASSWORD  : mot de passe d'application Google (PAS le mot de
                           passe du compte) - cree sur myaccount.google.com
                           > Securite > Validation en deux etapes
                           > Mots de passe des applications
   - FROM_NAME           : nom d'expediteur affiche (defaut: FlashShp)
   - ALLOWED_ORIGINS     : (optionnel) liste de domaines autorises a appeler
                           cette fonction, separes par des virgules
                           (ex: monshop.com,boutique.fr). Le domaine qui sert
                           le site et localhost sont toujours autorises.

   Tant que GMAIL_USER/GMAIL_APP_PASSWORD ne sont pas definies, le handler
   repond 501 et le site retombe automatiquement sur EmailJS. */

var mailer = require('./_mailer.js');
var emailCfg = require('../assets/email-config.js');
var origin = require('./_origin.js');

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* Replace every control character (incl. CR/LF/TAB) with a space and collapse
   runs of whitespace. Prevents SMTP header injection in single-line fields
   such as the subject, and keeps templated values tidy. Implemented with
   char codes to avoid fragile regex escape handling. */
function oneLine(s) {
  s = String(s);
  var out = '';
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    out += (c < 32 || c === 127) ? ' ' : s.charAt(i);
  }
  return out.replace(/ {2,}/g, ' ').trim();
}

/* Anti-abuse: only accept requests coming from our own front-end. Browsers
   always attach Origin (and usually Referer) on POST fetches, so a missing or
   foreign value means the call did not come from our pages (e.g. curl, bots).
   Allowed hosts: the host serving the site (same-origin), localhost (dev) and
   any host listed in the ALLOWED_ORIGINS env var. */
/* Règle d'origine partagée par toutes les routes : voir api/_origin.js. */

module.exports = function (req, res) {
  if (origin.handlePreflight(req, res)) return;
  origin.applyCors(req, res);

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!origin.isAllowedOrigin(req)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  if (!mailer.available()) {
    res.status(501).json({ error: 'SMTP not configured' });
    return;
  }

  var body = (req.body && typeof req.body === 'object') ? req.body : {};
  var to = String(body.to || '').trim().slice(0, 254);
  if (!EMAIL_RE.test(to)) {
    res.status(400).json({ error: 'Invalid recipient' });
    return;
  }

  /* Contenu borne et echappe : le template HTML reste cote serveur, le client
     ne fournit que des valeurs. Toutes les valeurs injectees dans le HTML
     passent par escHtml() - y compris store_url, qui se trouve dans des
     attributs href="..." et permettrait sinon une injection HTML. */
  var invoiceId   = escHtml(String(body.invoiceId   || '').slice(0, 64));
  var productName = escHtml(String(body.productName || '').slice(0, 128));
  var deliverable = escHtml(String(body.deliverable || '').slice(0, 2000));
  var storeName   = escHtml(String(body.storeName   || 'FlashShp').slice(0, 64));
  var storeUrl    = String(body.storeUrl || 'https://flashshp.fr/').slice(0, 200);
  if (!/^https?:\/\//.test(storeUrl)) storeUrl = 'https://flashshp.fr/';
  storeUrl = escHtml(storeUrl);
  /* type = 'created' (commande créée, en attente de paiement, SANS identifiants)
     ou 'ready' (paiement confirmé, avec identifiants). Défaut : 'ready'. */
  var type        = (String(body.type || 'ready') === 'created') ? 'created' : 'ready';
  var defSubject  = type === 'created' ? 'Order Received — Awaiting Payment' : 'Your Order is Ready!';
  var subject     = oneLine(String(body.subject || defSubject)).slice(0, 150) || defSubject;

  /* Function replacements: a string 2nd arg would interpret $&, $`, $', $$ and
     $1.. as substitution patterns (escHtml does not neutralise '$'/backtick),
     letting input leak/corrupt the template. A function replacer never does. */
  var fields = {
    invoice_id:     invoiceId,
    product_name:   productName,
    deliverable:    deliverable,
    customer_email: escHtml(to),
    store_name:     storeName,
    store_url:      storeUrl
  };
  var tpl = (type === 'created' && emailCfg.createdTemplate) ? emailCfg.createdTemplate : emailCfg.template;
  var html = tpl.replace(/\{\{(invoice_id|product_name|deliverable|customer_email|store_name|store_url)\}\}/g,
    function (_m, key) { return fields[key]; });

  mailer.send({
    to: to,
    subject: subject,
    html: html
  }).then(function () {
    res.status(200).json({ ok: true });
  }).catch(function (err) {
    console.error('[FlashShp] SMTP send failed:', err && err.message);
    res.status(502).json({ error: 'Send failed' });
  });
};
