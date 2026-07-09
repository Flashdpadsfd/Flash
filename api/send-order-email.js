/* FlashShp - Envoi des emails de commande via Gmail SMTP (fonction Vercel)
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
   - ALLOWED_ORIGINS     : (optionnel) liste de domaines autorises a appeler
                           cette fonction, separes par des virgules
                           (ex: monshop.com,boutique.fr). *.vercel.app et
                           localhost sont toujours autorises.

   Tant que GMAIL_USER/GMAIL_APP_PASSWORD ne sont pas definies, la fonction
   repond 501 et le site retombe automatiquement sur EmailJS. */

var nodemailer = require('nodemailer');
var emailCfg = require('../assets/email-config.js');

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
   Allowed hosts: *.vercel.app preview/prod deploys, localhost (dev) and any
   host listed in the ALLOWED_ORIGINS env var. */
function hostFrom(value) {
  try { return new URL(value).hostname.toLowerCase(); } catch (e) { return ''; }
}

function isAllowedOrigin(req) {
  var src = (req.headers && (req.headers.origin || req.headers.referer)) || '';
  if (!src) return false;
  var host = hostFrom(src);
  if (!host) return false;
  /* Same-origin (hôte de l'Origin == hôte servant la page) : marche sur
     n'importe quel domaine (Hostinger, domaine perso…), sans config. */
  var selfHost = String((req.headers && req.headers.host) || '').toLowerCase().split(':')[0];
  if (selfHost && host === selfHost) return true;
  if ((host === 'localhost' || host === '127.0.0.1') && process.env.NODE_ENV !== 'production') return true;
  /* Project-scoped: only OUR deployments (prod + preview), not every tenant
     of the multi-tenant vercel.app root. */
  if (/^nexus-theme[a-z0-9-]*\.vercel\.app$/.test(host)) return true;
  if (/^flashshp[a-z0-9-]*\.vercel\.app$/.test(host)) return true;
  var extra = String(process.env.ALLOWED_ORIGINS || '')
    .split(',').map(function (h) { return h.trim().toLowerCase(); }).filter(Boolean);
  for (var i = 0; i < extra.length; i++) {
    if (host === extra[i] || host.endsWith('.' + extra[i])) return true;
  }
  return false;
}

module.exports = function (req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isAllowedOrigin(req)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  var user = process.env.GMAIL_USER;
  var pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
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
  var storeUrl    = String(body.storeUrl || 'https://flashshp.vercel.app/').slice(0, 200);
  if (!/^https?:\/\//.test(storeUrl)) storeUrl = 'https://flashshp.vercel.app/';
  storeUrl = escHtml(storeUrl);
  var subject     = oneLine(String(body.subject || 'Your Order is Ready!')).slice(0, 150) || 'Your Order is Ready!';

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
  var html = emailCfg.template.replace(/\{\{(invoice_id|product_name|deliverable|customer_email|store_name|store_url)\}\}/g,
    function (_m, key) { return fields[key]; });

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: user, pass: pass }
  });

  transporter.sendMail({
    from: { name: oneLine(process.env.FROM_NAME || 'FlashShp'), address: user },
    to: to,
    subject: subject,
    html: html
  }, function (err) {
    if (err) {
      console.error('[FlashShp] SMTP send failed:', err && err.message);
      res.status(502).json({ error: 'Send failed' });
      return;
    }
    res.status(200).json({ ok: true });
  });
};
