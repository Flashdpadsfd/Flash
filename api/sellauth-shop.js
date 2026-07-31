/* FlashShp — Expose la config SellAuth au checkout (statique, sans templating).
   =========================================================================
   GET /api/sellauth-shop → { ok:true, shopId, checkoutDomain }

   Ni le Shop ID ni le domaine de checkout ne sont des secrets (visibles dans
   l'URL de n'importe quel checkout SellAuth) : contrairement à
   SELLAUTH_API_KEY, ils peuvent être renvoyés tels quels à n'importe quel
   visiteur. checkout.html (fichier statique, jamais passé par un moteur de
   template) en a besoin pour construire l'URL de paiement direct
   (checkout-link — voir SELLAUTH_CHECKOUT_DOMAIN dans .env.example). */

module.exports = function (req, res) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }

  var shopId = Number(process.env.SELLAUTH_SHOP_ID) || 0;
  var checkoutDomain = String(process.env.SELLAUTH_CHECKOUT_DOMAIN || '').trim();
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.status(200).json({ ok: true, shopId: shopId, checkoutDomain: checkoutDomain });
};
