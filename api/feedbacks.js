/* FlashShp - Récupère les feedbacks depuis l'API SellAuth (endpoint /api/feedbacks)
   =========================================================================
   La page Avis (preview-feedback.html) et l'admin appellent GET /api/feedbacks ;
   cette fonction interroge SellAuth côté serveur (la clé API reste secrète) et
   renvoie une liste d'avis nettoyée (sans données sensibles).

   La récupération + la mise en forme vivent dans api/_sellauth-feedbacks.js
   (partagées avec l'import scripts/import-feedbacks.js). Ici on gère seulement :
   le garde same-origin, le cache mémoire et la forme de la réponse.

   Variables d'environnement :
   - SELLAUTH_API_KEY : clé API SellAuth (Dashboard SellAuth > Settings > API).
                        Envoyée en en-tête « Authorization: Bearer <clé> ».
   - SELLAUTH_SHOP_ID : identifiant numérique de la boutique SellAuth.
   - ALLOWED_ORIGINS  : (optionnel) domaines autorisés en plus de *.vercel.app
                        et localhost, séparés par des virgules.

   Tant que SELLAUTH_API_KEY / SELLAUTH_SHOP_ID ne sont pas définies, la
   fonction répond 501 et la page Avis garde ses avis de secours. */

var sellauth = require('./_sellauth-feedbacks.js');
var origin = require('./_origin.js');

/* ── Cache mémoire (le serveur Hostinger est un process persistant) ──
   Sans cache, CHAQUE visite déclenchait ~13 appels SellAuth en parallèle →
   rate-limit → des pages échouaient et étaient silencieusement ignorées
   (« count » qui varie : 1245, 845…), voire la page 1 en échec → 502 → la
   page Avis retombait sur ses avis de secours. On mémorise le dernier résultat
   COMPLET et on le ressert quelques minutes sans rappeler SellAuth. */
var CACHE_FRESH_MS = 5 * 60 * 1000;    // sert le cache sans rappeler SellAuth
var CACHE_STALE_MS = 60 * 60 * 1000;   // si SellAuth tombe : sert le cache jusqu'à 1h
var _cache = { at: 0, payload: null, complete: false };

/* Anti-abus : n'accepter que les appels venant de nos pages ou du panneau admin
   (règle partagée par toutes les routes — voir api/_origin.js). */

module.exports = async function (req, res) {
  if (origin.handlePreflight(req, res)) return;
  origin.applyCors(req, res);
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!origin.isAllowedOrigin(req)) { res.status(403).json({ error: 'Forbidden' }); return; }

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

  try {
    var result = await sellauth.fetchAllFeedbacks({ apiKey: apiKey, shopId: shopId });

    if (!result.ok) {
      /* SellAuth a refusé ou est injoignable. On ressert le dernier bon cache
         plutôt qu'une erreur (qui ferait retomber la page sur ses avis de
         secours), mais on REMONTE le vrai statut HTTP : un 401 (clé révoquée)
         ou un 403/404 (mauvais shop id) ne se diagnostiquait pas quand tout
         était aplati en « unreachable ». */
      console.error('[FlashShp] SellAuth feedbacks refused: status=' + result.status +
                    ' detail=' + String(result.detail || '').slice(0, 200));
      if (_cache.payload && (now - _cache.at) < CACHE_STALE_MS) return send(_cache.payload);
      res.status(502).json({
        error: 'SellAuth unreachable',
        upstream: result.status || 0,          /* 0 = erreur réseau, sinon statut SellAuth */
        detail: String(result.detail || '').slice(0, 200)
      });
      return;
    }

    var payload = {
      ok: true,
      count: result.count,
      average: result.average,
      reviews: result.reviews,
      complete: result.complete
    };

    if (result.complete) {
      /* Résultat complet → on le met en cache et on le sert. */
      _cache = { at: now, payload: payload, complete: true };
      return send(payload);
    }

    /* Incomplet (des pages SellAuth ont échoué malgré les retries) : on
       n'écrase PAS un bon cache. On ressert le dernier résultat complet s'il
       n'est pas trop vieux ; sinon on renvoie ce qu'on a (mieux que les avis de
       secours) en le mettant en cache très court pour réessayer vite. */
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
