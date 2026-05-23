# Bilskirnir — Bundles (offres « arc complet ») — Design

**Date :** 2026-05-23
**Statut :** validé
**Périmètre :** vente groupée des tomes d'un arc, avec cadeau offert, mise en avant sur la fiche produit. (La fonctionnalité « Auteur » — metaobject auteur sur la fiche — fera l'objet d'une spec séparée.)

## Intention

Permettre à l'auteur de composer librement, depuis l'admin Shopify, des **bundles** (ex. l'intégrale de l'arc *De l'Eau et du Sang*) et de les vendre via un **ajout groupé** au panier. La loi Lang interdisant de brader les livres, le bundle ne propose pas de remise sur les tomes : chaque tome est ajouté à son **prix plein**, et le bundle débloque un **objet bonus offert**. Les frais de port offerts restent gérés indépendamment, par le seuil du panier global (système de récompenses existant).

L'auteur garde le contrôle total : un bundle peut être mono-arc, multi-arc, voire multi-univers. La saga reste le regroupement *narratif* ; le bundle est une offre *commerciale* posée par-dessus.

## Modèle de données

### Metaobject `bundles` (créé en admin)

| Champ (label) | Clé probable | Type | Rôle |
|---|---|---|---|
| Nom | `nom` | single line text | « De l'Eau et du Sang — l'intégrale » |
| Accroche | `accroche` | single line text | « Les 2 tomes de l'arc fondateur » |
| Articles | `articles` | list of product references | les tomes du bundle |
| Libellé Avantage | `libelle_avantage` | single line text | « Marque-page collector offert » |

Pas de champ prix (loi Lang) ni de champ type d'avantage (l'avantage est **toujours un cadeau**, décrit par `libelle_avantage`).

**Pré-requis admin :**
- Le metaobject `bundles` doit avoir l'**accès Storefront API** activé, sinon il est invisible côté front.
- Les clés exactes des champs (`nom` / `accroche` / `articles` / `libelle_avantage`) seront **confirmées en interrogeant le metaobject live** au tout début de l'implémentation (première étape du plan). Le code lira les champs par clé via le helper `metaobjectField` existant.

### Découverte côté fiche

La fiche d'un tome trouve « ses » bundles en interrogeant `metaobjects(type: "bundles", first: N)` puis en **filtrant côté code** ceux dont la liste `articles` contient l'ID du produit courant. Avantage : l'auteur ne renseigne le lien **qu'une seule fois** (dans le bundle), aucune double saisie sur le produit. Volume attendu faible (quelques bundles) → filtrage en mémoire acceptable.

## Architecture (unités)

- **`app/lib/bundles.ts`** — parsing pur, testable sans réseau :
  - types `BundleArticle` (id, handle, title, cover, price, available, status) et `Bundle` (handle, nom, accroche, libelleAvantage, articles[], totalFormatted).
  - `parseBundles(metaobjectNodes)` → `Bundle[]` (lit les champs via `metaobjectField`, résout les références produits, calcule la somme des prix et un `totalFormatted` en EUR).
  - `bundlesForProduct(bundles, productId)` → `Bundle[]` (filtre par appartenance à `articles`).
  - `bundleAddLines(bundle)` → `OptimisticCartLineInput[]` (une ligne par tome **disponible**, `quantity: 1`, attribut `{key: '_bundle', value: bundle.handle}`).
- **Fragment `BUNDLE_FRAGMENT`** dans `app/lib/fragments.ts` — sur `... on Metaobject` : `handle`, `fields { key value references(first: 20) { nodes { ... on Product { id handle title featuredImage{...} priceRange{...} availableForSale + TomeMetafields (statutParution) } } } }`. (Les `articles` sont exposés en `references`, pas en `value`.)
- **`app/components/BundleOffer.tsx`** — l'encart d'une offre : `CoverFan` des tomes, nom, accroche, ligne avantage `✦ {libelleAvantage}`, prix indicatif (« Les N tomes : XX,XX € »), bouton « Ajouter l'arc complet » via `CartForm` (`LinesAdd`). Réutilise le pattern toast + `open('cart')` de `TomeAddToCart` (enfant du render-prop pour les hooks). Si au moins un tome est **épuisé**, bouton désactivé + mention « momentanément indisponible ».
- **`app/styles/fiche.css`** — classes `bsk-bundle-*` (encart doré : bordure `--bsk-accent-gold`, fond dégradé doré léger, cohérent avec la maquette validée). Mobile-first + couche desktop sous `@media (min-width: 860px)`.

## Intégration

- **`products.$handle.tsx` (loader)** : ajouter la query `metaobjects(type: "bundles")` (en parallèle des données produit), passer les bundles filtrés (`bundlesForProduct`) au template.
- **`TomePageTemplate` / `OneShotPageTemplate`** : rendre `<BundleOffer>` pour chaque bundle, **juste sous le bloc d'ajout au panier**. Aucun bundle → rien (comme les rails « liés » vides).
- **Panier** : l'attribut `_bundle` voyage sur chaque ligne via `attributes`. Affichage d'une mention cadeau : étendre `RewardsBar`/`CartMain` pour, si des lignes portent un `_bundle`, afficher « Offre {nom} — {libelleAvantage} ». (Réutilise la lecture d'attributs déjà faite pour la dédicace.)

## Application de l'avantage (admin, hors code)

Le **cadeau 0 € réel** est appliqué par une **règle d'automatic discount Shopify** (type « Achetez X, obtenez Y offert » ou ligne cadeau 0 €) que Gautier configure, ciblée sur les produits du bundle / l'attribut `_bundle`. Le front se contente d'**afficher** l'avantage promis et de **taguer** les lignes. C'est cohérent avec le pattern existant (« code prêt, admin câblé ») et garde la conformité loi Lang (aucune remise sur le prix des livres).

## Cas limites

- **Tome épuisé** dans le bundle → bouton « Ajouter l'arc complet » désactivé + mention « momentanément indisponible ». (`bundleAddLines` n'inclurait de toute façon que les tomes disponibles.)
- **Tome en précommande** → ajout autorisé (le panier mélange disponible + précommande, comportement Shopify standard).
- **Dédicace** → l'ajout groupé n'embarque **pas** de dédicace ; le champ dédicace reste réservé à l'achat tome par tome.
- **Bundle vide / metaobject sans accès Storefront** → `parseBundles` renvoie une liste filtrée vide ; l'encart ne s'affiche pas (pas d'erreur).

## Tests (Vitest, green bar = `npm test` + `npm run build`)

- `bundles.test.ts` : `parseBundles` (champs lus, total calculé, références résolues), `bundlesForProduct` (appartenance), `bundleAddLines` (exclusion des épuisés, attribut `_bundle`).
- `BundleOffer.test.tsx` : rendu (nom, accroche, avantage, prix), bouton désactivé si tome épuisé, `CartForm` mocké (data router requis comme pour `TomeAddToCart`).
- Test d'intégration léger du template : un bundle passé → encart rendu sous l'ajout ; aucun bundle → rien.

## Hors périmètre (différé)

- Application automatique du cadeau (règle admin Shopify) — données/config Gautier.
- Page dédiée « Coffrets / Offres » et mise en avant catalogue (placement B écarté pour l'instant).
- Encart bundle sur la page univers (placement A écarté).
- Fonctionnalité « Auteur » (metaobject auteur + bio sur la fiche) — spec séparée à venir.
