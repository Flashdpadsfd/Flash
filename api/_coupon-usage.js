/* FlashShp — Suivi des utilisations de coupon POUR CETTE BOUTIQUE.
   =========================================================================
   Pourquoi ce fichier existe : le checkout de ce thème est autonome (aucune
   facture n'est créée chez SellAuth — voir api/record-order.js), donc le
   compteur "uses" renvoyé par l'API SellAuth pour un coupon ne bougera
   JAMAIS suite à une vente faite ici. Impossible de s'y fier pour faire
   respecter max_uses / max_uses_per_customer : on tient donc notre propre
   compteur, en base, incrémenté uniquement quand une commande est
   effectivement enregistrée (api/record-order.js — jamais depuis la simple
   validation d'un code au moment du "Apply").

   Clé site_content utilisée : nexus_coupon_usage
   Forme : { "<CODE>": { uses: number, byEmail: { "<email>": number } } }
   Volontairement absente de PUBLIC_KEYS et WRITABLE dans api/content.js :
   ce n'est pas un réglage éditable depuis l'admin, juste un compteur interne
   géré uniquement par ce fichier. */

var store = require('./_store.js');

var KEY = 'nexus_coupon_usage';

async function readAll() {
  var content = await store.getContent([KEY]);
  var all = content[KEY];
  return (all && typeof all === 'object') ? all : {};
}

/* { uses, byEmail } pour un code donné (0 par défaut). */
async function getUsage(code) {
  var all = await readAll();
  var entry = all[String(code || '').toUpperCase()];
  return {
    uses: (entry && entry.uses) || 0,
    byEmail: (entry && entry.byEmail && typeof entry.byEmail === 'object') ? entry.byEmail : {}
  };
}

/* Incrémente le compteur global + celui de l'email. Lecture-écriture simple
   (pas de transaction) : cohérent avec le reste du site, qui ne verrouille
   pas non plus la décrémentation de stock. Une double commande simultanée sur
   le DERNIER usage autorisé d'un coupon très prisé pourrait en théorie passer
   les deux ; risque jugé acceptable au vu du volume de ce type de boutique. */
async function recordUse(code, email) {
  code = String(code || '').toUpperCase();
  if (!code) return;
  email = String(email || '').trim().toLowerCase();
  var all = await readAll();
  var entry = all[code] || { uses: 0, byEmail: {} };
  entry.uses = (entry.uses || 0) + 1;
  if (email) entry.byEmail = Object.assign({}, entry.byEmail, { [email]: ((entry.byEmail && entry.byEmail[email]) || 0) + 1 });
  all[code] = entry;
  await store.setContent(KEY, all);
}

module.exports = { getUsage: getUsage, recordUse: recordUse };
