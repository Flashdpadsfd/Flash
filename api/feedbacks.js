/* FlashShp - Récupère les feedbacks 5★ depuis l'API SellAuth (fonction Vercel)
   =========================================================================
   La page Avis (preview-feedback.html) appelle GET /api/feedbacks ; cette
   fonction interroge SellAuth côté serveur (la clé API reste secrète) et
   renvoie une liste d'avis nettoyée (sans données sensibles).

   Variables d'environnement à configurer sur Vercel :
   - SELLAUTH_API_KEY : clé API SellAuth (Dashboard SellAuth > Settings > API).
                        Envoyée en en-tête « Authorization: Bearer <clé> ».
   - SELLAUTH_SHOP_ID : identifiant numérique de la boutique SellAuth.
   - ALLOWED_ORIGINS  : (optionnel) domaines autorisés en plus de *.vercel.app
                        et localhost, séparés par des virgules.

   Tant que SELLAUTH_API_KEY / SELLAUTH_SHOP_ID ne sont pas définies, la
   fonction répond 501 et la page Avis garde ses avis locaux par défaut. */

var SELLAUTH_BASE = 'https://api.sellauth.com/v1';
var PER_PAGE = 100;     // max autorisé par l'API
var MAX_PAGES = 5;      // garde-fou : jusqu'à 500 avis

/* ── Anti-abus : n'accepter que les appels venant de nos propres pages ── */
function hostFrom(value) {
  try { return new URL(value).hostname.toLowerCase(); } catch (e) { return ''; }
}
function isAllowedOrigin(req) {
  var src = (req.headers && (req.headers.origin || req.headers.referer)) || '';
  if (!src) return false;
  var host = hostFrom(src);
  if (!host) return false;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  if (/^nexus-theme[a-z0-9-]*\.vercel\.app$/.test(host)) return true;
  if (/^flashshp[a-z0-9-]*\.vercel\.app$/.test(host)) return true;
  var extra = String(process.env.ALLOWED_ORIGINS || '')
    .split(',').map(function (h) { return h.trim().toLowerCase(); }).filter(Boolean);
  for (var i = 0; i < extra.length; i++) {
    if (host === extra[i] || host.endsWith('.' + extra[i])) return true;
  }
  return false;
}

/* ── Helpers de mapping (la forme exacte du feedback SellAuth peut varier) ── */
var PALETTE = ['#e50914', '#1db954', '#6495ed', '#ffa01e', '#9b59b6', '#1abc9c',
               '#e74c3c', '#3498db', '#f39c12', '#00b4d8', '#64c864'];

function emailOf(f) {
  var inv = f.invoice || {};
  return f.invoice_email || f.email || inv.email || inv.customer_email || '';
}
function productOf(f) {
  if (f.product_name) return f.product_name;
  if (f.variant_name) return f.variant_name;
  var inv = f.invoice || {};
  var items = inv.items || inv.items_data || inv.products || [];
  if (Array.isArray(items) && items.length) {
    var it = items[0] || {};
    return it.product_name || (it.product && it.product.name) || it.name || '';
  }
  return inv.product_name || '';
}
function hashCode(s) {
  var h = 0;
  s = String(s);
  for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
/* Nom anonymisé à partir de l'e-mail (pas de PII exposée) : « Jo••• ». */
function maskedName(email) {
  var local = String(email || '').split('@')[0].replace(/[^a-zA-Z]/g, '');
  if (!local) return 'Verified Buyer';
  var head = local.slice(0, 2);
  return head.charAt(0).toUpperCase() + head.slice(1).toLowerCase() + '•••';
}
function initialsOf(email, name) {
  var base = String(email || '').replace(/[^a-zA-Z]/g, '') || String(name || '').replace(/[^a-zA-Z]/g, '');
  if (!base) return '★';
  return base.slice(0, 2).toUpperCase();
}
function monthYear(iso) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/* Extrait le tableau de feedbacks quelle que soit l'enveloppe de réponse. */
function extractList(json) {
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.data)) return json.data;
  if (json && json.feedbacks && Array.isArray(json.feedbacks.data)) return json.feedbacks.data;
  if (json && json.feedbacks && Array.isArray(json.feedbacks)) return json.feedbacks;
  if (json && json.results && Array.isArray(json.results)) return json.results;
  return [];
}

module.exports = async function (req, res) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!isAllowedOrigin(req)) { res.status(403).json({ error: 'Forbidden' }); return; }

  var apiKey = process.env.SELLAUTH_API_KEY;
  var shopId = process.env.SELLAUTH_SHOP_ID;
  if (!apiKey || !shopId) { res.status(501).json({ error: 'SellAuth not configured' }); return; }

  var headers = {
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  try {
    var collected = [];
    for (var page = 1; page <= MAX_PAGES; page++) {
      var url = SELLAUTH_BASE + '/shops/' + encodeURIComponent(shopId) +
        '/feedbacks?rating=5&perPage=' + PER_PAGE + '&page=' + page +
        '&orderColumn=created_at&orderDirection=desc';
      var r = await fetch(url, { headers: headers });
      if (!r.ok) {
        if (page === 1) { res.status(502).json({ error: 'SellAuth error ' + r.status }); return; }
        break; /* on garde ce qu'on a déjà */
      }
      var json = await r.json();
      var list = extractList(json);
      if (!list.length) break;
      collected = collected.concat(list);
      if (list.length < PER_PAGE) break; /* dernière page atteinte */
    }

    /* Garde uniquement les 5★ avec un message ; map vers la forme « avis » du site. */
    var reviews = collected
      .filter(function (f) {
        return Number(f.rating) === 5 &&
               !f.deleted_at &&
               String(f.message || '').trim() !== '';
      })
      .map(function (f) {
        var email = emailOf(f);
        var name = maskedName(email);
        return {
          id: f.id,
          name: name,
          initials: initialsOf(email, name),
          color: PALETTE[hashCode(email || String(f.id)) % PALETTE.length],
          date: monthYear(f.created_at),
          product: productOf(f),
          stars: 5,
          reply: String(f.reply || ''),
          text: String(f.message || '').slice(0, 600)
        };
      });

    /* Cache CDN 5 min (réduit les appels API + accélère la page). */
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ ok: true, count: reviews.length, average: reviews.length ? 5 : 0, reviews: reviews });
  } catch (e) {
    console.error('[FlashShp] SellAuth feedbacks failed:', e && e.message);
    res.status(502).json({ error: 'Fetch failed' });
  }
};
