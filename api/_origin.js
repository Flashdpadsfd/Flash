/* FlashShp — Contrôle d'origine partagé + CORS pour le panneau admin séparé.
   =========================================================================
   Fichier préfixé « _ » → jamais exposé comme route (server.js).

   Remplace les 5 copies identiques de isAllowedOrigin() qui traînaient dans
   api/feedbacks.js, feedback-delete.js, admin-clients.js, auth-email-request.js
   et auth-email-verify.js : une seule règle, un seul endroit à corriger.

   Deux notions distinctes :
   - origine « boutique »  : les pages du site lui-même (garde anti-abus) ;
   - origine « admin »     : le panneau d'administration, désormais hébergé sur
                             un AUTRE domaine (admin.flashshp.fr). Comme c'est
                             une origine différente, le navigateur exige du CORS.

   Variables d'environnement :
   - ADMIN_ORIGIN     : origine(s) du panneau admin, séparées par des virgules.
                        Défaut : https://admin.flashshp.fr
   - ALLOWED_ORIGINS  : domaines supplémentaires autorisés côté boutique.

   À retenir : le CORS n'est PAS une protection. Il dit juste au navigateur
   quelles pages peuvent lire la réponse. Ce qui protège réellement les routes
   admin, c'est l'en-tête « x-admin-secret » comparé à ADMIN_SECRET. */

var DEFAULT_ADMIN_ORIGIN = 'https://admin.flashshp.fr';

function hostFrom(value) {
  try { return new URL(value).hostname.toLowerCase(); } catch (e) { return ''; }
}

/* Origine de la requête (en-tête Origin, sinon Referer). */
function originOf(req) {
  return (req.headers && (req.headers.origin || req.headers.referer)) || '';
}

function listFromEnv(name) {
  return String(process.env[name] || '')
    .split(',').map(function (h) { return h.trim().toLowerCase(); }).filter(Boolean);
}

/* Origines admin autorisées, normalisées en « scheme://host » sans slash final. */
function adminOrigins() {
  var raw = listFromEnv('ADMIN_ORIGIN');
  if (!raw.length) raw = [DEFAULT_ADMIN_ORIGIN];
  /* En développement, le panneau tourne souvent sur un autre port en local. */
  raw.push('http://localhost:3001', 'http://127.0.0.1:3001');
  return raw.map(function (o) { return o.replace(/\/+$/, ''); });
}

/* L'appel vient-il du panneau admin (origine exacte, schéma compris) ? */
function isAdminOrigin(req) {
  var src = String(originOf(req) || '').toLowerCase();
  if (!src) return false;
  var origin;
  try { var u = new URL(src); origin = u.protocol + '//' + u.host; } catch (e) { return false; }
  return adminOrigins().indexOf(origin) >= 0;
}

/* L'appel vient-il d'une page de la boutique elle-même ? */
function isShopOrigin(req) {
  var src = originOf(req);
  if (!src) return false;
  var host = hostFrom(src);
  if (!host) return false;
  /* Same-origin : l'hôte de l'Origin est celui qui sert la page. Marche sur
     n'importe quel domaine (Hostinger, domaine perso…) sans configuration. */
  var selfHost = String((req.headers && req.headers.host) || '').toLowerCase().split(':')[0];
  if (selfHost && host === selfHost) return true;
  if (host === 'localhost' || host === '127.0.0.1') return true;
  var extra = listFromEnv('ALLOWED_ORIGINS');
  for (var i = 0; i < extra.length; i++) {
    if (host === extra[i] || host.endsWith('.' + extra[i])) return true;
  }
  return false;
}

/* Garde générale : boutique OU panneau admin. */
function isAllowedOrigin(req) {
  return isShopOrigin(req) || isAdminOrigin(req);
}

/* Pose les en-têtes CORS quand l'appel vient du panneau admin.
   On renvoie l'origine EXACTE (jamais « * ») : « * » autoriserait n'importe
   quel site à lire les réponses de ces routes. */
function applyCors(req, res) {
  if (!isAdminOrigin(req)) return false;
  var src = String(originOf(req));
  var origin;
  try { var u = new URL(src); origin = u.protocol + '//' + u.host; } catch (e) { return false; }
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-secret');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Max-Age', '600');
  /* Deux origines différentes peuvent recevoir deux réponses différentes :
     sans Vary, un cache partagé servirait l'en-tête de la mauvaise origine. */
  res.setHeader('Vary', 'Origin');
  return true;
}

/* Répond aux pré-vérifications CORS (OPTIONS). Renvoie true si c'était une
   pré-vérification — l'appelant doit alors s'arrêter là. */
function handlePreflight(req, res) {
  if (req.method !== 'OPTIONS') return false;
  applyCors(req, res);
  res.status(204).end();
  return true;
}

module.exports = {
  isAllowedOrigin: isAllowedOrigin,
  isShopOrigin: isShopOrigin,
  isAdminOrigin: isAdminOrigin,
  applyCors: applyCors,
  handlePreflight: handlePreflight
};
