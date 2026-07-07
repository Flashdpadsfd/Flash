/* FlashShp — Déconnexion : efface le cookie de session et redirige. */

var session = require('./_session.js');

module.exports = function (req, res) {
  session.clearSession(res);
  res.writeHead(302, { Location: '/login?loggedout=1' });
  res.end();
};
