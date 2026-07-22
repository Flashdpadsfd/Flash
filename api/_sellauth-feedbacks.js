/* FlashShp — Source unique des avis SellAuth (récupération + mise en forme).
   =========================================================================
   Utilisé par :
   - api/feedbacks.js            → l'API live appelée par la page Avis / l'admin,
   - scripts/import-feedbacks.js → l'import ponctuel qui fige TOUS les avis dans
                                   assets/reviews.json (secours hors-ligne).

   Le préfixe « _ » exclut ce fichier du routage /api/<name> (server.js) et des
   fonctions serverless Vercel : ce n'est pas un endpoint, juste une librairie.

   Aucun secret n'est lu ici : la clé et l'id boutique sont passés en argument
   par l'appelant (qui les prend dans process.env). */

var SELLAUTH_BASE = 'https://api.sellauth.com/v1';
var PER_PAGE = 100;     // max autorisé par l'API
var MAX_PAGES = 40;     // garde-fou : jusqu'à 4000 avis (on suit last_page de l'API)
var CONCURRENCY = 4;    // pages récupérées en parallèle par lot (évite le rate-limit)

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

/* fetch JSON avec retries : 429 / 5xx = transitoire → on réessaie (backoff).
   `diag` (optionnel) mémorise le DERNIER échec réel (statut + extrait du corps)
   pour qu'un 401/403/422 remonte à l'appelant au lieu d'un « unreachable » muet
   qui masquait la vraie cause (clé révoquée, mauvais shop id, paramètre refusé). */
async function fetchJson(url, headers, tries, diag) {
  tries = tries || 3;
  for (var i = 0; i < tries; i++) {
    try {
      var r = await fetch(url, { headers: headers });
      if (r.ok) return await r.json();
      if (diag) {
        diag.status = r.status;
        try { diag.detail = String(await r.text()).slice(0, 300); } catch (e) { diag.detail = ''; }
      }
      if (r.status !== 429 && r.status < 500) return null; // 4xx définitif : inutile de réessayer
    } catch (e) {
      if (diag) { diag.status = 0; diag.detail = String((e && e.message) || 'network error').slice(0, 300); }
    }
    if (i < tries - 1) await sleep(250 * (i + 1));
  }
  return null;
}

/* Récupère plusieurs pages par petits lots (au lieu de 13 d'un coup). */
async function fetchPages(pages, urlOf, headers, diag) {
  var out = [];
  for (var i = 0; i < pages.length; i += CONCURRENCY) {
    var batch = pages.slice(i, i + CONCURRENCY);
    var got = await Promise.all(batch.map(function (p) { return fetchJson(urlOf(p), headers, 3, diag); }));
    out = out.concat(got);
  }
  return out;
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

/* Feedbacks bruts SellAuth → avis affichables par le site. */
function mapFeedbacks(collected) {
  /* Garde TOUS les avis (toutes notes 1★→5★, y compris les avis AUTOMATIQUES
     après 7 jours, qui n'ont pas de message → texte neutre par défaut). */
  var reviews = collected
    .filter(function (f) {
      var r = Number(f.rating);
      return r >= 1 && r <= 5 && !f.deleted_at;
    })
    .map(function (f) {
      var email = emailOf(f);
      var name = maskedName(email);
      var msg = String(f.message || '').trim();
      var stars = Math.max(1, Math.min(5, Math.round(Number(f.rating)) || 5));
      return {
        id: f.id,
        name: name,
        initials: initialsOf(email, name),
        color: PALETTE[hashCode(email || String(f.id)) % PALETTE.length],
        date: monthYear(f.created_at),
        createdAt: f.created_at || null,
        product: productOf(f),
        stars: stars,
        automatic: !!f.is_automatic,
        reply: String(f.reply || ''),
        text: msg ? msg.slice(0, 600) : 'Automatic after 7 days'
      };
    });

  /* Met en avant les vrais témoignages (avec message) ; les avis automatiques
     (sans message) passent après. Le tri de V8 est stable → l'ordre par date
     (récent d'abord) est conservé à l'intérieur de chaque groupe. */
  reviews.sort(function (a, b) { return (a.automatic ? 1 : 0) - (b.automatic ? 1 : 0); });
  return reviews;
}

/* Moyenne réelle, tronquée à 0,1 (pas d'arrondi vers le haut : 4.95 → 4.9). */
function averageOf(reviews) {
  if (!reviews.length) return 0;
  var sum = 0;
  for (var i = 0; i < reviews.length; i++) sum += reviews[i].stars;
  return Math.floor((sum / reviews.length) * 10) / 10;
}

/* Récupère TOUS les feedbacks de la boutique (toutes les pages).
   → { ok, reviews, count, average, complete, missing, status, detail }
   `complete` vaut false si des pages ont échoué malgré les retries : l'appelant
   décide alors s'il préfère servir un cache plus ancien mais complet. */
async function fetchAllFeedbacks(opts) {
  opts = opts || {};
  var apiKey = String(opts.apiKey || '').trim();
  var shopId = String(opts.shopId || '').trim();
  var onProgress = typeof opts.onProgress === 'function' ? opts.onProgress : function () {};

  var headers = {
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  var pageUrl = function (page) {
    return SELLAUTH_BASE + '/shops/' + encodeURIComponent(shopId) +
      '/feedbacks?perPage=' + PER_PAGE + '&page=' + page +
      '&orderColumn=created_at&orderDirection=desc';
  };

  var diag = { status: 0, detail: '' };

  /* 1re page : on récupère les données ET le nombre total de pages (last_page). */
  var firstJson = await fetchJson(pageUrl(1), headers, 4, diag);
  if (!firstJson) {
    return { ok: false, reviews: [], count: 0, average: 0, complete: false,
             missing: 1, status: diag.status, detail: diag.detail };
  }

  var collected = extractList(firstJson);
  var lastPage = Number(firstJson && firstJson.last_page) || 1;
  if (lastPage > MAX_PAGES) lastPage = MAX_PAGES; /* garde-fou */
  onProgress(1, lastPage);

  /* Pages restantes : par petits lots, avec retries. On COMPTE les pages
     échouées (missing) pour savoir si le résultat est complet. */
  var missing = 0;
  if (lastPage > 1) {
    var rest = [];
    for (var p = 2; p <= lastPage; p++) rest.push(p);
    var pages = await fetchPages(rest, pageUrl, headers, diag);
    pages.forEach(function (json, i) {
      if (json) collected = collected.concat(extractList(json));
      else missing++;
      onProgress(i + 2, lastPage);
    });
  }

  var reviews = mapFeedbacks(collected);
  return {
    ok: true,
    reviews: reviews,
    count: reviews.length,
    average: averageOf(reviews),
    complete: missing === 0,
    missing: missing,
    status: diag.status,
    detail: diag.detail
  };
}

module.exports = {
  SELLAUTH_BASE: SELLAUTH_BASE,
  fetchAllFeedbacks: fetchAllFeedbacks,
  mapFeedbacks: mapFeedbacks,
  averageOf: averageOf,
  extractList: extractList
};
