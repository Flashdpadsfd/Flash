/* FlashShp — Callback Discord OAuth2.
   =========================================================================
   GET /api/auth-callback?code=...&state=...
   1. Vérifie le state (cookie posé par auth-discord).
   2. Échange le code contre un access_token Discord.
   3. Récupère l'identité (id, username, avatar, email).
   4. Pose un cookie de session signé et redirige vers /account.

   Variables d'environnement requises :
   - DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI, SESSION_SECRET. */

var session = require('./_session.js');

function redirect(res, to) { res.writeHead(302, { Location: to }); res.end(); }

module.exports = async function (req, res) {
  var clientId = process.env.DISCORD_CLIENT_ID;
  var clientSecret = process.env.DISCORD_CLIENT_SECRET;
  var redirectUri = process.env.DISCORD_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri || !process.env.SESSION_SECRET) {
    res.status(501).json({ error: 'Discord OAuth not configured' });
    return;
  }

  var url = new URL(req.url, 'http://localhost');
  var code = url.searchParams.get('code');
  var state = url.searchParams.get('state');
  var err = url.searchParams.get('error');
  if (err) { redirect(res, '/login?error=' + encodeURIComponent(err)); return; }
  if (!code) { redirect(res, '/login?error=missing_code'); return; }

  /* Vérif CSRF : le state renvoyé doit correspondre au cookie. */
  var cookies = session.parseCookies(req);
  if (!state || !cookies[session.STATE_COOKIE] || state !== cookies[session.STATE_COOKIE]) {
    redirect(res, '/login?error=bad_state');
    return;
  }

  try {
    /* 2. Échange code → token. */
    var body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri
    });
    var tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    if (!tokenRes.ok) { redirect(res, '/login?error=token_exchange'); return; }
    var token = await tokenRes.json();

    /* 3. Identité Discord. */
    var meRes = await fetch('https://discord.com/api/users/@me', {
      headers: { 'Authorization': (token.token_type || 'Bearer') + ' ' + token.access_token }
    });
    if (!meRes.ok) { redirect(res, '/login?error=userinfo'); return; }
    var u = await meRes.json();

    if (!u.email || u.verified === false) {
      /* Sans email vérifié on ne peut pas relier aux commandes SellAuth. */
      redirect(res, '/login?error=no_email');
      return;
    }

    var avatar = u.avatar
      ? 'https://cdn.discordapp.com/avatars/' + u.id + '/' + u.avatar + '.png?size=128'
      : null;

    /* 4. Session signée (efface aussi le cookie de state). */
    session.setSession(res, {
      sub: u.id,
      username: u.global_name || u.username || 'Client',
      avatar: avatar,
      email: String(u.email).toLowerCase()
    });
    /* setSession a écrit Set-Cookie ; on ajoute la suppression du state. */
    var existing = res.getHeader('Set-Cookie');
    var arr = Array.isArray(existing) ? existing : [existing];
    arr.push(session.buildCookie(session.STATE_COOKIE, '', 0));
    res.setHeader('Set-Cookie', arr);

    redirect(res, '/account');
  } catch (e) {
    console.error('[FlashShp] Discord callback failed:', e && e.message);
    redirect(res, '/login?error=server');
  }
};
