/* FlashShp — Synchronisation du contenu boutique depuis le serveur.
   =========================================================================
   À charger AVANT assets/main.js sur chaque page publique.

   Le problème qu'il règle : produits, catégories et textes ne vivaient que dans
   le localStorage du navigateur de l'admin. Un visiteur ne voyait donc jamais
   les modifications, seulement les valeurs codées en dur dans main.js. Le
   panneau admin ayant déménagé sur un autre domaine (où le localStorage est un
   espace distinct), il fallait de toute façon une source commune : /api/content.

   Fonctionnement : on récupère le contenu publié, on le dépose dans
   localStorage (que tout le code existant lit déjà de façon synchrone), puis on
   émet un événement « storage » par clé modifiée. Les pages écoutent DÉJÀ ces
   événements pour se redessiner (preview.html, preview-products.html,
   preview-feedback.html, main.js) : aucune page n'a besoin d'être modifiée.

   Si le serveur ne répond pas ou n'a encore rien publié, on ne touche à rien :
   la boutique garde son contenu local ou ses valeurs par défaut. */

(function () {
  /* Doit refléter PUBLIC_KEYS de api/content.js. Une clé absente d'ici serait
     ignorée même si le serveur la renvoyait. */
  var KEYS = [
    'nexus_products',
    'nexus_categories',
    'nexus_content',
    'nexus_links',
    'nexus_reviews',
    'nexus_text_overrides'
  ];

  /* Vide = même origine. Le panneau admin, lui, pointe vers la boutique. */
  var API = window.NEXUS_API_BASE || '';

  /* Prévient les pages déjà rendues. Les écouteurs « storage » natifs ne se
     déclenchent que pour les AUTRES onglets : on émet donc l'événement
     nous-mêmes pour celui-ci. */
  function notify(key, newValue, oldValue) {
    try {
      window.dispatchEvent(new StorageEvent('storage', {
        key: key, newValue: newValue, oldValue: oldValue, storageArea: localStorage
      }));
    } catch (e) { /* navigateur ancien : le contenu sera bon au prochain chargement */ }
  }

  /* `published` : la boutique a-t-elle déjà reçu au moins une publication
     (updatedAt renseigné) ? C'est ce qui décide du sort des clés absentes. */
  function apply(content, published) {
    KEYS.forEach(function (k) {
      var value = content[k];

      /* Clé que le serveur ne renvoie pas. */
      if (value === null || value === undefined) {
        /* Rien n'a jamais été publié : une base vide ne doit pas effacer le
           contenu du navigateur (sinon une boutique fonctionnelle se viderait
           au premier déploiement mal configuré). On ne touche à rien. */
        if (!published) return;

        /* Sinon le serveur fait autorité : une clé qu'il ne connaît plus
           n'existe plus. La garder affichait du contenu fantôme — le bug où la
           boutique montrait deux produits alors que l'admin n'en avait qu'un,
           parce que le vieux localStorage survivait indéfiniment. */
        var old = null;
        try { old = localStorage.getItem(k); } catch (e) { return; }   /* mode privé */
        if (old === null) return;
        try { localStorage.removeItem(k); } catch (e) { return; }
        notify(k, null, old);
        return;
      }

      var next = JSON.stringify(value);
      var prev = null;
      try { prev = localStorage.getItem(k); } catch (e) { return; }   /* mode privé */
      if (prev === next) return;                /* déjà à jour : rien à faire */

      try { localStorage.setItem(k, next); } catch (e) { return; }    /* quota plein */
      notify(k, next, prev);
    });
  }

  fetch(API + '/api/content', { headers: { 'Accept': 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || !data.ok || !data.content) return;
      apply(data.content, !!data.updatedAt);
    })
    .catch(function () { /* hors-ligne : on garde le contenu local */ });
})();
