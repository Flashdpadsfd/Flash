/* FlashShp — Factures crypto en attente (invoice créée, paiement pas encore
   confirmé), stockées serveur pour que ni l'adresse ni le montant attendu ne
   soient jamais fournis par le client au moment de la vérification.
   =========================================================================
   Préfixe « _ » : pas un endpoint, juste une librairie (voir api/record-order.js
   pour le même motif tableau-dans-site_content que nexus_orders). */

var store = require('./_store.js');

var KEY = 'nexus_crypto_pending';
var MAX_PENDING = 2000;   /* garde-fou : purge les plus anciennes au-delà */

async function readAll() {
  var cur = await store.getContent([KEY]);
  return Array.isArray(cur[KEY]) ? cur[KEY] : [];
}

async function create(order) {
  var arr = await readAll();
  arr.unshift(order);
  if (arr.length > MAX_PENDING) arr = arr.slice(0, MAX_PENDING);
  await store.setContent(KEY, arr);
  return order;
}

async function get(id) {
  var arr = await readAll();
  return arr.find(function (o) { return o && String(o.id) === String(id); }) || null;
}

/* Fusionne `patch` dans l'entrée existante (id) et réécrit tout le tableau.
   Renvoie l'entrée mise à jour, ou null si l'id est introuvable. */
async function update(id, patch) {
  var arr = await readAll();
  var idx = arr.findIndex(function (o) { return o && String(o.id) === String(id); });
  if (idx === -1) return null;
  var next = Object.assign({}, arr[idx], patch);
  arr[idx] = next;
  await store.setContent(KEY, arr);
  return next;
}

module.exports = { create: create, get: get, update: update };
