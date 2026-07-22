/* FlashShp — Import ponctuel de TOUS les avis SellAuth dans le site.
   =========================================================================
   Récupère l'intégralité des feedbacks de la boutique (toutes les pages, toutes
   les notes) et les fige dans « assets/reviews.json ». Ce fichier sert de
   secours à la page Avis et à l'admin quand /api/feedbacks est indisponible
   (clé non configurée, SellAuth en rade, rate-limit) — à la place des avis de
   démonstration inventés.

   Usage :
       npm run import:feedbacks

   Les identifiants sont lus dans l'environnement (ou dans un fichier .env à la
   racine, chargé automatiquement) : SELLAUTH_API_KEY et SELLAUTH_SHOP_ID.
   Le script n'affiche jamais la clé. Rien n'est envoyé nulle part : il écrit
   seulement un fichier local, que vous commitez et déployez comme le reste. */

try { require('dotenv').config(); } catch (e) { /* dotenv optionnel */ }

var fs = require('fs');
var path = require('path');
var sellauth = require('../api/_sellauth-feedbacks.js');

var OUT_FILE = path.join(__dirname, '..', 'assets', 'reviews.json');

function fail(msg) {
  console.error('\n✗ ' + msg + '\n');
  process.exit(1);
}

(async function main() {
  var apiKey = String(process.env.SELLAUTH_API_KEY || '').trim();
  var shopId = String(process.env.SELLAUTH_SHOP_ID || '').trim();

  if (!apiKey || !shopId) {
    fail('SELLAUTH_API_KEY et/ou SELLAUTH_SHOP_ID manquantes.\n' +
         '  Renseignez-les dans un fichier .env à la racine (voir .env.example),\n' +
         '  ou dans l\'environnement, puis relancez « npm run import:feedbacks ».');
  }

  console.log('→ Import des avis SellAuth (boutique ' + shopId + ')…');

  var lastLogged = 0;
  var result = await sellauth.fetchAllFeedbacks({
    apiKey: apiKey,
    shopId: shopId,
    onProgress: function (page, total) {
      if (page === total || page - lastLogged >= 5) {
        lastLogged = page;
        console.log('  page ' + page + '/' + total);
      }
    }
  });

  if (!result.ok) {
    var why = result.status === 401 ? 'clé API refusée (401) — régénérez-la dans SellAuth > Settings > API'
            : result.status === 403 ? 'accès refusé (403) — la clé n\'a pas les droits sur cette boutique'
            : result.status === 404 ? 'boutique introuvable (404) — vérifiez SELLAUTH_SHOP_ID'
            : result.status ? 'SellAuth a répondu ' + result.status
            : 'SellAuth injoignable (réseau)';
    fail('Import impossible : ' + why +
         (result.detail ? '\n  Réponse SellAuth : ' + result.detail : ''));
  }

  if (!result.count) {
    fail('SellAuth a répondu correctement mais ne renvoie aucun avis. Rien n\'a été écrit.');
  }

  if (!result.complete) {
    console.warn('  ⚠ ' + result.missing + ' page(s) ont échoué (rate-limit ?) : ' +
                 'l\'import est partiel. Relancez dans une minute pour le compléter.');
  }

  var payload = {
    ok: true,
    source: 'sellauth',
    generatedAt: new Date().toISOString(),
    count: result.count,
    average: result.average,
    complete: result.complete,
    reviews: result.reviews
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  var withText = result.reviews.filter(function (r) { return !r.automatic; }).length;
  console.log('\n✓ ' + result.count + ' avis importés (moyenne ' + result.average.toFixed(1) + '★, ' +
              withText + ' avec message, ' + (result.count - withText) + ' automatiques)');
  console.log('  → ' + path.relative(path.join(__dirname, '..'), OUT_FILE).replace(/\\/g, '/'));
  console.log('  Commitez ce fichier puis déployez pour le publier.\n');
})().catch(function (e) {
  fail('Erreur inattendue : ' + (e && (e.stack || e.message)));
});
