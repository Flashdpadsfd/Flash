/* FlashShp — Hachage de mot de passe (scrypt, natif Node — aucune dépendance
   supplémentaire).
   =========================================================================
   Format stocké : "scrypt$<sel hex>$<hash hex>". Le sel est unique par mot de
   passe ; scrypt est volontairement coûteux en mémoire (résiste au bruteforce
   GPU mieux qu'un simple sha256/pbkdf2). */

var crypto = require('crypto');

var KEYLEN = 64;

function hashPassword(password) {
  var salt = crypto.randomBytes(16).toString('hex');
  var hash = crypto.scryptSync(String(password), salt, KEYLEN).toString('hex');
  return 'scrypt$' + salt + '$' + hash;
}

/* Comparaison à temps constant : évite qu'un timing différent ne renseigne un
   attaquant sur la validité partielle du mot de passe. */
function verifyPassword(password, stored) {
  if (!stored) return false;
  var parts = String(stored).split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  var salt = parts[1], hash = parts[2];
  var candidate;
  try { candidate = crypto.scryptSync(String(password), salt, KEYLEN); }
  catch (e) { return false; }
  var a = candidate, b;
  try { b = Buffer.from(hash, 'hex'); } catch (e) { return false; }
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = { hashPassword: hashPassword, verifyPassword: verifyPassword };
