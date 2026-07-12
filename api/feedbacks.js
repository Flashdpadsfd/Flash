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
var MAX_PAGES = 40;     // garde-fou : jusqu'à 4000 avis (on suit last_page de l'API)
var CONCURRENCY = 4;    // pages récupérées en parallèle par lot (évite le rate-limit)

/* ── Cache mémoire (le serveur Hostinger est un process persistant) ──
   Sans cache, CHAQUE visite déclenchait ~13 appels SellAuth en parallèle →
   rate-limit → des pages échouaient et étaient silencieusement ignorées
   (« count » qui varie : 1245, 845…), voire la page 1 en échec → 502 → la
   page Avis retombait sur ses 12 avis démo. On mémorise le dernier résultat
   COMPLET et on le ressert quelques minutes sans rappeler SellAuth. */
var CACHE_FRESH_MS = 5 * 60 * 1000;    // sert le cache sans rappeler SellAuth
var CACHE_STALE_MS = 60 * 60 * 1000;   // si SellAuth tombe : sert le cache jusqu'à 1h
var _cache = { at: 0, payload: null, complete: false };

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

/* fetch JSON avec retries : 429 / 5xx = transitoire → on réessaie (backoff). */
async function fetchJson(url, headers, tries) {
  tries = tries || 3;
  for (var i = 0; i < tries; i++) {
    try {
      var r = await fetch(url, { headers: headers });
      if (r.ok) return await r.json();
      if (r.status !== 429 && r.status < 500) return null; // 4xx définitif : inutile de réessayer
    } catch (e) { /* erreur réseau : on réessaie */ }
    if (i < tries - 1) await sleep(250 * (i + 1));
  }
  return null;
}

/* Récupère plusieurs pages par petits lots (au lieu de 13 d'un coup). */
async function fetchPages(pages, urlOf, headers) {
  var out = [];
  for (var i = 0; i < pages.length; i += CONCURRENCY) {
    var batch = pages.slice(i, i + CONCURRENCY);
    var got = await Promise.all(batch.map(function (p) { return fetchJson(urlOf(p), headers, 3); }));
    out = out.concat(got);
  }
  return out;
}

/* ── Anti-abus : n'accepter que les appels venant de nos propres pages ── */
function hostFrom(value) {
  try { return new URL(value).hostname.toLowerCase(); } catch (e) { return ''; }
}
function isAllowedOrigin(req) {
  var src = (req.headers && (req.headers.origin || req.headers.referer)) || '';
  if (!src) return false;
  var host = hostFrom(src);
  if (!host) return false;
  /* Same-origin (hôte de l'Origin/Referer == hôte servant la page) : marche sur
     n'importe quel domaine (Hostinger, domaine perso…), sans config. */
  var selfHost = String((req.headers && req.headers.host) || '').toLowerCase().split(':')[0];
  if (selfHost && host === selfHost) return true;
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

  var apiKey = String(process.env.SELLAUTH_API_KEY || '').trim();
  var shopId = String(process.env.SELLAUTH_SHOP_ID || '').trim();
  if (!apiKey || !shopId) { res.status(501).json({ error: 'SellAuth not configured' }); return; }

  var now = Date.now();
  var send = function (payload) {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json(payload);
  };

  /* Cache frais ET complet → on répond direct, aucun appel SellAuth. */
  if (_cache.payload && _cache.complete && (now - _cache.at) < CACHE_FRESH_MS) {
    return send(_cache.payload);
  }

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

  try {
    var collected = [];
    var missing = 0;

    /* 1re page : on récupère les données ET le nombre total de pages (last_page). */
    var firstJson = await fetchJson(pageUrl(1), headers, 4);
    if (!firstJson) {
      /* SellAuth injoignable : on ressert le dernier bon cache plutôt qu'une
         erreur (qui ferait retomber la page sur ses 12 avis démo). */
      if (_cache.payload && (now - _cache.at) < CACHE_STALE_MS) return send(_cache.payload);
      res.status(502).json({ error: 'SellAuth unreachable' }); return;
    }
    collected = collected.concat(extractList(firstJson));

    var lastPage = Number(firstJson && firstJson.last_page) || 1;
    if (lastPage > MAX_PAGES) lastPage = MAX_PAGES; /* garde-fou */

    /* Pages restantes : par petits lots, avec retries. On COMPTE les pages
       échouées (missing) pour savoir si le résultat est complet. */
    if (lastPage > 1) {
      var rest = [];
      for (var p = 2; p <= lastPage; p++) rest.push(p);
      var pages = await fetchPages(rest, pageUrl, headers);
      pages.forEach(function (json) {
        if (json) collected = collected.concat(extractList(json));
        else missing++;
      });
    }
    var complete = (missing === 0);

    /* Garde TOUS les avis (toutes notes 1★→5★, y compris les avis AUTOMATIQUES
       après 7 jours, qui n'ont pas de message → on met un texte neutre par défaut).
       Map vers la forme « avis » du site. */
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

    /* Moyenne réelle sur toutes les notes récupérées (arrondie à 0,1). */
    var sum = 0;
    for (var k = 0; k < reviews.length; k++) sum += reviews[k].stars;
    var average = reviews.length ? Math.round((sum / reviews.length) * 10) / 10 : 0;

    var payload = { ok: true, count: reviews.length, average: average, reviews: reviews, complete: complete };

    if (complete) {
      /* Résultat complet → on le met en cache et on le sert. */
      _cache = { at: now, payload: payload, complete: true };
      return send(payload);
    }

    /* Incomplet (des pages SellAuth ont échoué malgré les retries) : on
       n'écrase PAS un bon cache. On ressert le dernier résultat complet s'il
       n'est pas trop vieux ; sinon on renvoie ce qu'on a (mieux que 12 démos)
       en le mettant en cache très court pour réessayer vite. */
    if (_cache.payload && _cache.complete && (now - _cache.at) < CACHE_STALE_MS) {
      return send(_cache.payload);
    }
    _cache = { at: now - (CACHE_FRESH_MS - 30000), payload: payload, complete: false };
    return send(payload);
  } catch (e) {
    console.error('[FlashShp] SellAuth feedbacks failed:', e && e.message);
    if (_cache.payload && (Date.now() - _cache.at) < CACHE_STALE_MS) return send(_cache.payload);
    res.status(502).json({ error: 'Fetch failed' });
  }
};
