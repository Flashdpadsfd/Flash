/* FlashShp — Helpers de session pour le dashboard client (sans dépendance).
   =========================================================================
   Fichier préfixé « _ » → Vercel ne le transforme PAS en route ; il est juste
   require() par les autres fonctions (auth-callback, me, logout).

   La session est un jeton signé HMAC-SHA256 (façon JWT compact) stocké dans un
   cookie httpOnly. Aucune donnée sensible n'y est mise à part l'identité Discord
   (id, username, avatar, email) nécessaire pour retrouver les commandes SellAuth.

   Variable d'environnement requise :
   - SESSION_SECRET : chaîne aléatoire longue (secret de signature). */

var crypto = require('crypto');

var COOKIE_NAME = 'fs_session';
var STATE_COOKIE = 'fs_oauth_state';
var MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

function b64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
  str = String(str).replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}
function secret() {
  return process.env.SESSION_SECRET || '';
}
function sign(data) {
  return b64url(crypto.createHmac('sha256', secret()).update(data).digest());
}
/* Comparaison à temps constant pour éviter les attaques temporelles. */
function safeEqual(a, b) {
  var ba = Buffer.from(String(a)), bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/* Crée un jeton signé à partir d'un objet payload (auquel on ajoute exp). */
function createToken(payload, maxAgeSec) {
  if (!secret()) throw new Error('SESSION_SECRET missing');
  var body = Object.assign({}, payload, {
    exp: Math.floor(Date.now() / 1000) + (maxAgeSec || MAX_AGE)
  });
  var data = b64url(JSON.stringify(body));
  return data + '.' + sign(data);
}

/* Vérifie un jeton ; renvoie le payload si valide et non expiré, sinon null. */
function verifyToken(token) {
  if (!token || !secret()) return null;
  var parts = String(token).split('.');
  if (parts.length !== 2) return null;
  if (!safeEqual(parts[1], sign(parts[0]))) return null;
  try {
    var payload = JSON.parse(b64urlDecode(parts[0]));
    if (!payload || typeof payload.exp !== 'number') return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (e) { return null; }
}

/* Parse l'en-tête Cookie en objet { nom: valeur }. */
function parseCookies(req) {
  var out = {};
  var raw = (req.headers && req.headers.cookie) || '';
  raw.split(';').forEach(function (part) {
    var i = part.indexOf('=');
    if (i < 0) return;
    var k = part.slice(0, i).trim();
    var v = part.slice(i + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  });
  return out;
}

/* Construit un en-tête Set-Cookie sécurisé. maxAge<=0 → suppression. */
function buildCookie(name, value, maxAgeSec) {
  var parts = [
    name + '=' + encodeURIComponent(value),
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax'
  ];
  if (maxAgeSec <= 0) parts.push('Max-Age=0');
  else parts.push('Max-Age=' + (maxAgeSec || MAX_AGE));
  return parts.join('; ');
}

function setSession(res, payload) {
  res.setHeader('Set-Cookie', buildCookie(COOKIE_NAME, createToken(payload), MAX_AGE));
}
function clearSession(res) {
  res.setHeader('Set-Cookie', buildCookie(COOKIE_NAME, '', 0));
}
function getSession(req) {
  return verifyToken(parseCookies(req)[COOKIE_NAME]);
}

module.exports = {
  COOKIE_NAME: COOKIE_NAME,
  STATE_COOKIE: STATE_COOKIE,
  MAX_AGE: MAX_AGE,
  createToken: createToken,
  verifyToken: verifyToken,
  parseCookies: parseCookies,
  buildCookie: buildCookie,
  setSession: setSession,
  clearSession: clearSession,
  getSession: getSession,
  randomState: function () { return crypto.randomBytes(16).toString('hex'); }
};
