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

  function apply(content) {
    Object.keys(content).forEach(function (k) {
      if (KEYS.indexOf(k) < 0) return;          /* clé inconnue : ignorée */
      var value = content[k];
      /* null = jamais publiée. Ne pas écraser ce qu'a déjà le navigateur. */
      if (value === null || value === undefined) return;

      var next = JSON.stringify(value);
      var prev = null;
      try { prev = localStorage.getItem(k); } catch (e) { return; }   /* mode privé */
      if (prev === next) return;                /* déjà à jour : rien à faire */

      try { localStorage.setItem(k, next); } catch (e) { return; }    /* quota plein */

      /* Prévient les pages déjà rendues. Les écouteurs « storage » natifs ne se
         déclenchent que pour les AUTRES onglets : on émet donc l'événement
         nous-mêmes pour celui-ci. */
      try {
        window.dispatchEvent(new StorageEvent('storage', {
          key: k, newValue: next, oldValue: prev, storageArea: localStorage
        }));
      } catch (e) { /* navigateur ancien : le contenu sera bon au prochain chargement */ }
    });
  }

  fetch(API + '/api/content', { headers: { 'Accept': 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || !data.ok || !data.content) return;
      apply(data.content);
    })
    .catch(function () { /* hors-ligne : on garde le contenu local */ });
})();
