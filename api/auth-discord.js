/* FlashShp — Démarre la connexion Discord (OAuth2).
   =========================================================================
   GET /api/auth-discord → 302 vers Discord. Un « state » aléatoire est posé
   dans un cookie court pour se protéger du CSRF (vérifié au callback).

   Variables d'environnement requises (Vercel) :
   - DISCORD_CLIENT_ID    : ID de l'application Discord.
   - DISCORD_REDIRECT_URI : ex. https://flashshp.vercel.app/api/auth-callback
                            (doit être ajoutée dans le portail Discord).
   Optionnel :
   - DISCORD_SCOPES : défaut « identify email ». */

var session = require('./_session.js');

module.exports = function (req, res) {
  var clientId = process.env.DISCORD_CLIENT_ID;
  var redirectUri = process.env.DISCORD_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    res.status(501).json({ error: 'Discord OAuth not configured' });
    return;
  }

  var scopes = process.env.DISCORD_SCOPES || 'identify email';
  var state = session.randomState();

  /* Cookie court (10 min) qui mémorise le state pour le vérifier au retour. */
  res.setHeader('Set-Cookie', session.buildCookie(session.STATE_COOKIE, state, 600));

  var url = 'https://discord.com/api/oauth2/authorize' +
    '?client_id=' + encodeURIComponent(clientId) +
    '&redirect_uri=' + encodeURIComponent(redirectUri) +
    '&response_type=code' +
    '&scope=' + encodeURIComponent(scopes) +
    '&state=' + encodeURIComponent(state) +
    '&prompt=consent';

  res.writeHead(302, { Location: url });
  res.end();
};
