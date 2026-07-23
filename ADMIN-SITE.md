# Panneau admin sur son propre domaine

Le panneau d'administration n'est plus servi par la boutique. Il vit sur
**`admin.flashshp.fr`**, et le contenu qu'il modifie est stocké **en base**,
plus dans le navigateur.

## Pourquoi ce changement

Avant, produits, catégories et textes n'existaient que dans le `localStorage` du
navigateur de l'admin. Deux conséquences : les visiteurs voyaient les valeurs
codées en dur dans `assets/main.js` et jamais les modifications, et le panneau ne
pouvait pas déménager (le `localStorage` est cloisonné par domaine).

Le contenu passe donc par `/api/content`, adossé à la table `site_content`.

## Déployer le panneau

```bash
npm run build:admin
```

Génère le dossier `admin/`, puis commitez et poussez : **c'est tout**.

### Comment la publication se fait réellement

Hostinger déploie le dépôt dans `<domaine>/nodejs/`, alors qu'un sous-domaine ne
peut servir **que** depuis `<domaine>/public_html/…` — le champ du dossier est
verrouillé sur ce préfixe dans le hPanel. Le dossier `admin/` du dépôt n'atterrit
donc jamais là où `admin.flashshp.fr` le cherche.

C'est l'application qui comble l'écart : au démarrage, `api/_publish-admin.js`
recopie `admin/` vers `public_html/admin`. Comme l'application redémarre à chaque
déploiement, le panneau publié suit automatiquement chaque push.

La copie n'écrit que dans `public_html/admin`, ne supprime jamais rien d'autre,
et toute erreur est journalisée sans empêcher le serveur de démarrer. Pour la
désactiver : `PUBLISH_ADMIN=0`.

Le dossier est versionné mais **généré** : ne l'éditez jamais à la main, vos
modifications seraient écrasées au prochain build. La source reste `admin.html`
et `assets/admin.*`.

À refaire après chaque modification du panneau, sinon le site publié garde
l'ancienne version.

Pour viser une autre boutique que la production :

```bash
SHOP_URL=https://autre-domaine.fr npm run build:admin
```

## Côté boutique : une variable à ajouter

Dans le hPanel de `flashshp.fr` → Variables d'environnement :

```
ADMIN_ORIGIN=https://admin.flashshp.fr
```

Sans elle, le navigateur bloque tous les appels du panneau vers l'API (CORS).
Redémarrez l'application après l'avoir ajoutée.

`ADMIN_SECRET` doit déjà être définie : **c'est elle qui protège réellement**
l'écriture du contenu. Le CORS ne fait qu'autoriser le navigateur à lire les
réponses, il n'authentifie rien.

## Tester en local

```bash
npm start
```

```bash
SHOP_URL=http://localhost:3000 npm run build:admin && npm run serve:admin
```

Boutique sur `http://localhost:3000`, panneau sur `http://localhost:3001` —
deux origines distinctes, donc les mêmes conditions de CORS qu'en production.

⚠ Pensez à relancer `npm run build:admin` **sans** `SHOP_URL` avant de
commiter, sinon vous publieriez un panneau qui pointe vers localhost.

## Ce qui est publié, et ce qui ne l'est pas

`GET /api/content` (public, lu par la boutique) ne renvoie que :
`nexus_products`, `nexus_categories`, `nexus_content`, `nexus_links`,
`nexus_reviews`, `nexus_text_overrides`.

Ne sortent **jamais** en public, et ne sont lisibles qu'avec `x-admin-secret`
via `GET /api/content?scope=admin` :

| Clé | Pourquoi |
|---|---|
| `nexus_payments` | contient le client secret PayPal et la clé Stripe `sk_live_…` |
| `nexus_promos` | publier les codes reviendrait à les offrir à tout le monde |
| `nexus_webhooks` | URLs Discord, exploitables pour spammer |
| `nexus_blacklist_*`, `nexus_security`, `nexus_email_config`, `nexus_stats`, `nexus_orders` | données internes |

Restent volontairement **locales à votre machine** (jamais envoyées) : le mot de
passe du panneau, le journal des tentatives de connexion et le cache du secret
admin.

## Limite connue : les codes promo

Les codes n'étant pas publiés, la validation côté client ne peut plus les
trouver. Ce n'est pas une régression — elle ne fonctionnait déjà pas pour les
visiteurs, dont le `localStorage` était vide. Pour des promos réellement
utilisables, il faudra un endpoint de validation côté serveur : le client envoie
le code, le serveur répond par la remise. C'est la seule forme sûre.
