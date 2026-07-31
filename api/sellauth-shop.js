/* FlashShp — Expose le Shop ID SellAuth au checkout (statique, sans templating).
   =========================================================================
   GET /api/sellauth-shop → { ok:true, shopId }

   Le Shop ID n'est pas un secret (il est visible dans l'URL de n'importe quel
   checkout SellAuth) : contrairement à SELLAUTH_API_KEY, il peut être renvoyé
   tel quel à n'importe quel visiteur. checkout.html (fichier statique, jamais
   passé par un moteur de template) en a besoin pour appeler
   window.sellAuthEmbed.checkout({ shopId, ... }). */

module.exports = function (req, res) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }

  var shopId = Number(process.env.SELLAUTH_SHOP_ID) || 0;
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.status(200).json({ ok: true, shopId: shopId });
};
