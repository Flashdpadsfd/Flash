/* FlashShp — Petit serveur local pour tester le panneau admin.
   =========================================================================
   Usage :  npm run serve:admin      (puis http://localhost:3001)

   Sert le dossier admin-site/ sur le port 3001, l'origine que api/_origin.js
   autorise pour le développement. Cela permet de tester le panneau dans les
   conditions réelles — deux origines distinctes, donc du vrai CORS — sans rien
   déployer. En production, ce rôle est tenu par Hostinger.

   Variables : PORT (défaut 3001), SHOP_URL n'est PAS utilisée ici (elle est
   figée dans admin-site/index.html au moment du build). */

var http = require('http');
var fs = require('fs');
var path = require('path');

var DIR = path.join(__dirname, '..', 'admin-site');
var PORT = Number(process.env.PORT || 3001);

var TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

if (!fs.existsSync(DIR)) {
  console.error('\n✗ admin-site/ est absent. Lancez d\'abord : npm run build:admin\n');
  process.exit(1);
}

http.createServer(function (req, res) {
  var rel = decodeURIComponent(String(req.url || '/').split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';

  /* Empêche « ../ » de sortir du dossier servi. */
  var file = path.join(DIR, path.normalize(rel).replace(/^([/\\])+/, ''));
  if (!file.startsWith(DIR)) { res.writeHead(403).end('Forbidden'); return; }

  fs.readFile(file, function (err, buf) {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); return; }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store'
    });
    res.end(buf);
  });
}).listen(PORT, function () {
  console.log('[FlashShp] panneau admin servi sur http://localhost:' + PORT);
});
