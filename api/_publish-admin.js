/* FlashShp — Publication du panneau admin vers le sous-domaine, au démarrage.
   =========================================================================
   Appelé une fois par server.js au boot. Copie le dossier « admin/ » du dépôt
   vers la racine du sous-domaine admin.flashshp.fr.

   Pourquoi ce détour plutôt qu'un simple déploiement git :
   Hostinger déploie le dépôt dans « <domaine>/nodejs/ », alors qu'un
   sous-domaine ne peut servir QUE depuis « <domaine>/public_html/… » — le
   panneau hPanel verrouille le champ du dossier à ce préfixe. Le dossier
   admin/ du dépôt n'atterrit donc jamais là où le sous-domaine le cherche.
   L'application, elle, redémarre à chaque déploiement : c'est le seul moment
   automatique où l'on peut recopier les fichiers au bon endroit.

   Déploiement atomique versionné : Hostinger exécute désormais l'app depuis
   « <domaine>/.builds/versions/<uuid>/… » plutôt que directement depuis
   « <domaine>/nodejs/ ». Un simple appRoot/.. atterrit donc DANS ce dossier de
   build éphémère (…/.builds/versions/<uuid>/public_html/admin) au lieu du vrai
   « <domaine>/public_html/admin » — la copie « réussissait » (fichiers bien
   écrits, log de succès) mais dans un dossier qui n'est jamais servi et qui
   disparaît au déploiement suivant. On retrouve donc la racine du domaine en
   coupant le chemin avant « .builds », qui fonctionne aussi bien avec
   l'ancienne disposition (pas de « .builds » → simple appRoot/..).

   Sécurité : on n'écrit QUE dans public_html/admin, uniquement les fichiers
   présents dans admin/, et on ne supprime jamais rien d'autre. Toute erreur est
   journalisée sans interrompre le démarrage du serveur : mieux vaut une
   boutique en ligne avec un panneau périmé qu'un site entièrement à terre.

   Désactivation : PUBLISH_ADMIN=0 (utile en local, où le chemin n'existe pas). */

var fs = require('fs');
var path = require('path');

/* Racine du domaine : tout ce qui précède « .builds » dans le chemin de
   déploiement versionné, sinon appRoot/.. (ancienne disposition, ou local). */
function domainRoot(appRoot) {
  var marker = path.sep + '.builds' + path.sep;
  var idx = appRoot.indexOf(marker);
  if (idx !== -1) return appRoot.slice(0, idx);
  return path.join(appRoot, '..');
}

function targetDir(appRoot) {
  return path.join(domainRoot(appRoot), 'public_html', 'admin');
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  var copied = 0;
  fs.readdirSync(src, { withFileTypes: true }).forEach(function (entry) {
    /* entry.name vient de fs.readdirSync sur un dossier du dépôt (admin/), pas
       d'une requête HTTP : ce ne peut être qu'un nom de fichier/dossier réel de
       src, jamais une chaîne arbitraire. On vérifie quand même l'appartenance
       à src/dest — ceinture-et-bretelles, coût nul. */
    var from = path.join(src, entry.name);
    var to = path.join(dest, entry.name);
    if (path.dirname(from) !== src || path.dirname(to) !== dest) return;
    if (entry.isDirectory()) copied += copyDir(from, to);
    else if (entry.isFile()) { fs.copyFileSync(from, to); copied++; }
  });
  return copied;
}

function publish(appRoot) {
  if (String(process.env.PUBLISH_ADMIN || '') === '0') {
    console.log('[FlashShp] publication du panneau admin désactivée (PUBLISH_ADMIN=0)');
    return;
  }

  var src = path.join(appRoot, 'admin');
  if (!fs.existsSync(src)) {
    console.log('[FlashShp] publication du panneau admin ignorée : dossier admin/ introuvable (' + src + ')');
    return;
  }

  var dest = targetDir(appRoot);
  var parent = path.dirname(dest);
  /* public_html absent = on n'est pas sur cet hébergement (dev local) : on sort
     sans bruit dans le cas normal, mais on journalise quand même — ce chemin
     silencieux est justement celui qui masquait un vrai souci en production
     (arborescence différente de ce qui était attendu). */
  if (!fs.existsSync(parent)) {
    console.log('[FlashShp] publication du panneau admin ignorée : ' + parent + ' introuvable (appRoot=' + appRoot + ')');
    return;
  }

  try {
    var n = copyDir(src, dest);
    console.log('[FlashShp] panneau admin publié : ' + n + ' fichier(s) → ' + dest);
  } catch (e) {
    console.error('[FlashShp] publication du panneau admin échouée :', e && e.message);
  }
}

module.exports = { publish: publish };
