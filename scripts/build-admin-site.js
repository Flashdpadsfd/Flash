/* FlashShp — Génère le site du panneau admin (à déployer sur admin.flashshp.fr).
   =========================================================================
   Usage :  npm run build:admin
   Sortie :  admin-site/   (index.html + assets/) — dossier à téléverser tel quel.

   Pourquoi un script plutôt qu'un dossier écrit à la main : le panneau reste
   une SEULE source (admin.html + assets/admin.*). Dupliquer ces fichiers
   garantirait qu'ils divergent au premier correctif. On régénère à la place.

   Ce que le script transforme :
   1. injecte NEXUS_API_BASE → le panneau, servi depuis un autre domaine, doit
      viser l'API de la boutique (une URL « /api/… » relative taperait dans le
      vide sur admin.flashshp.fr) ;
   2. rend absolus les liens vers la boutique (« / », « /products », « /review ») ;
   3. ajoute une balise noindex, pour ne pas voir le panneau finir dans Google.

   Personnalisation par variables d'environnement :
   - SHOP_URL  : URL de la boutique (défaut https://flashshp.fr) */

var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var OUT = path.join(ROOT, 'admin-site');
var SHOP_URL = String(process.env.SHOP_URL || 'https://flashshp.fr').replace(/\/+$/, '');

var ASSETS = ['admin.css', 'admin.js', 'email-config.js'];

function read(p) { return fs.readFileSync(p, 'utf8'); }

function build() {
  /* Repartir d'un dossier propre : un fichier retiré des sources ne doit pas
     survivre dans la sortie du build précédent. */
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });

  var html = read(path.join(ROOT, 'admin.html'));

  /* 1. Base de l'API + noindex, injectés juste après <head>. */
  var inject =
    '\n  <meta name="robots" content="noindex, nofollow" />' +
    '\n  <!-- Généré par scripts/build-admin-site.js — ne pas modifier ici, éditer admin.html -->' +
    '\n  <script>window.NEXUS_API_BASE = ' + JSON.stringify(SHOP_URL) + ';</script>';
  if (!/<head[^>]*>/i.test(html)) throw new Error('admin.html : balise <head> introuvable');
  html = html.replace(/<head[^>]*>/i, function (m) { return m + inject; });

  /* 2. Liens vers la boutique : « /products » pointerait sinon vers
        admin.flashshp.fr/products, qui n'existe pas. */
  html = html.replace(/href="\/(products|review|reviews|checkout|account|login)?"/g, function (m, page) {
    return 'href="' + SHOP_URL + '/' + (page || '') + '"';
  });

  fs.writeFileSync(path.join(OUT, 'index.html'), html, 'utf8');

  var copied = [];
  ASSETS.forEach(function (name) {
    var src = path.join(ROOT, 'assets', name);
    if (!fs.existsSync(src)) { console.warn('  ⚠ ressource absente, ignorée : assets/' + name); return; }
    fs.copyFileSync(src, path.join(OUT, 'assets', name));
    copied.push(name);
  });

  /* Empêche l'indexation même si le fichier est servi tel quel. */
  fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n', 'utf8');

  console.log('\n✓ Site admin généré dans admin-site/');
  console.log('  API de la boutique : ' + SHOP_URL);
  console.log('  Fichiers : index.html, robots.txt, assets/' + copied.join(', assets/'));
  console.log('\n  Téléversez le CONTENU de admin-site/ à la racine de admin.flashshp.fr.');
  console.log('  Côté boutique, ADMIN_ORIGIN doit valoir https://admin.flashshp.fr\n');
}

try { build(); } catch (e) {
  console.error('\n✗ Build échoué : ' + (e && e.message) + '\n');
  process.exit(1);
}
