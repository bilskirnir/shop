---
title: Bilskirnir — Data model Shopify
date: 2026-04-23
status: active
---

# Data model Shopify

Source de vérité du schéma metaobject + metafields configuré dans l'admin Shopify de `bilskirnir-2.myshopify.com`. À tenir à jour à chaque modification côté admin.

**Convention de nommage**

- **Labels affichés dans l'admin** → français (inclut accents)
- **Keys techniques** → français `snake_case`, sans accents, sans tirets (GraphQL n'accepte que alphanumérique + underscore)
- **Namespace** → `custom` (défaut Shopify, idiomatique Hydrogen)
- **Valeurs stockées** (enums, strings) → français avec accents et tirets autorisés

**Règle d'accès** : toutes les définitions sont marquées **Storefronts can access** pour être lisibles depuis Hydrogen.

---

## Metaobject : `Saga`

Le champ `Name` est fourni automatiquement par Shopify (drives le handle).

| Label | Key | Type | Required |
|---|---|---|---|
| Synopsis | `synopsis` | Rich text | — |
| Ordre des tomes | `ordre_des_tomes` | List of products | — |
| Univers parent | `univers_parent` | Collection | ✅ |
| Illustration hero de la saga | `illustration_hero_saga` | File (image) | — |

---

## Metafields : Collection (« Univers »)

Namespace : `custom`

| Label | Key | Type |
|---|---|---|
| Illustration hero | `illustration_hero` | File (image) |
| Lore | `lore` | Rich text |
| Couleur thème | `couleur_theme` | Single line text (hex) |
| Sagas | `sagas` | List of metaobject → Saga |
| Est une œuvre indépendante | `est_une_oeuvre_independante` | Boolean |

> **Note** : l'ordre de tri du slideshow homepage a été retiré ici. Il sera géré en Plan 2 via un metaobject dédié `Configuration accueil` avec une liste drag-and-drop mixte (Collection + Product), pour éviter à Gautier d'éditer chaque entité une par une.

---

## Metafields : Product (« Tome »)

Namespace : `custom`

Le champ `description` natif de Shopify sert de **synopsis long** (4e de couverture). Le teaser court est stocké en metafield.

| Label | Key | Type | Validation |
|---|---|---|---|
| Univers | `univers` | Collection | — |
| Saga | `saga` | Metaobject → Saga | — |
| Numéro de tome | `numero_tome` | Integer | — |
| Est une œuvre indépendante | `est_une_oeuvre_independante` | Boolean | — |
| Statut de parution | `statut_parution` | Single line text | Choix : `publié` · `précommande` · `annoncé` |
| Date de parution | `date_parution` | Date | — |
| Teaser court | `teaser_court` | Multi-line text | — |
| Type de goodie | `type_goodie` | Single line text | Choix : `ex-libris` · `illustration` · `marque-page` · `coffret` |
| Univers associé | `univers_associe` | Collection | — |

---

## Collections Shopify utilisées

| Collection | Type | Rôle |
|---|---|---|
| `au-nom-des-dieux` | Manual | Univers principal (exemple) |
| `romans-independants` | Automated | Smart collection regroupant les Products avec `custom.est_une_oeuvre_independante = true` |

Chaque collection « Univers » (non standalone-bucket) a ses metafields remplis (`illustration_hero`, `lore`, `couleur_theme`, `sagas`, `est_une_oeuvre_independante = false`).

La collection « Romans indépendants » a `est_une_oeuvre_independante = true` — c'est le flag que le frontend utilise pour la classer dans la colonne « Romans indépendants » du mega-menu.

---

## GraphQL — patterns de requête

**Lister toutes les collections avec leur flag standalone** :

```graphql
{
  collections(first: 20) {
    nodes {
      id
      handle
      title
      estUneOeuvreIndependante: metafield(namespace: "custom", key: "est_une_oeuvre_independante") { value }
    }
  }
}
```

**Charger un tome avec son univers, sa saga et son statut** :

```graphql
query Tome($handle: String!) {
  product(handle: $handle) {
    id
    handle
    title
    descriptionHtml                        # 4e de couverture
    teaserCourt: metafield(namespace: "custom", key: "teaser_court") { value }
    statutParution: metafield(namespace: "custom", key: "statut_parution") { value }
    dateParution: metafield(namespace: "custom", key: "date_parution") { value }
    numeroTome: metafield(namespace: "custom", key: "numero_tome") { value }
    univers: metafield(namespace: "custom", key: "univers") {
      reference { ... on Collection { handle title } }
    }
    saga: metafield(namespace: "custom", key: "saga") {
      reference { ... on Metaobject { handle fields { key value } } }
    }
  }
}
```

---

## Historique des décisions

- **2026-04-23** : définitions initiales créées. Namespace `custom` unique pour cohérence avec Shopify default. Keys en français snake_case, labels en français avec accents. Synopsis long = `product.description` natif plutôt que metafield. Ordre homepage reporté en Plan 2 via metaobject dédié.
