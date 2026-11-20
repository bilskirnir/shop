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

Shopify ne fournit pas de champ Name automatique — seul le `handle` est présent par défaut. Le champ `Nom` a été ajouté manuellement et marqué comme **display name** de la définition, ce qui permet l'auto-génération du handle.

| Label | Key | Type | Required | Note |
|---|---|---|---|---|
| Nom | `nom` | Single line text | ✅ | Marqué **display name** — drive l'auto-handle |
| Synopsis | `synopsis` | Rich text | — | |
| Ordre des tomes | `ordre_des_tomes` | List of products | — | |
| Univers parent | `univers_parent` | Collection | ✅ | |
| Illustration hero de la saga | `illustration_hero_de_la_saga` | File (image) | — | clé confirmée par sonde le 19/11/2026 |
| Accroche | `teaser_court` | Multi-line text | — | **à créer** (thème Liquid, accueil) |
| Couleur du halo | `couleur_halo` | Color | — | **à créer** |
| Mention de lecture | `mention_de_lecture` | Single line text | — | **à créer** |
| Particules | `style_particules` | Single line text (choix : `neige`, `braises`) | — | créé ; vide = aucune particule sur l'écran de l'accueil |
| Genres | `genres` | List of single line text | — | **à créer** — pastilles sur l'accueil (PC) |

---

## Metafields : Collection (« Univers »)

Namespace : `custom`

| Label | Key | Type |
|---|---|---|
| Illustration hero | `illustration_hero` | File (image) |
| Lore | `lore` | Rich text |
| Couleur thème | `couleur` | Single line text (hex) — clé confirmée par sonde le 19/11/2026 (pas `couleur_theme`) |
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
| Couleur du halo | `couleur_halo` | Color | créée le 19/11/2026 (remplace `couleur_theme`, jamais défini) |
| Nombre de pages | `nombre_pages` | Integer | **à créer** (jamais défini, le code Hydrogen le lisait dans le vide) |
| Mention de lecture | `mention_de_lecture` | Single line text | **à créer** (thème Liquid, accueil) |
| Extrait | `extrait` | File (PDF) | **à créer** (fiche produit) |
| Genres | `genres` | List of single line text | **à créer** — pastilles sur l'accueil (PC), livres seuls |
| Particules | `style_particules` | Single line text (choix : `neige`, `braises`) | créé le 20/11/2026 — même rôle que sur la saga, pour un livre seul |
| Illustration hero | `illustration_hero` | File (image) | créé le 20/11/2026 — image de fond d'un livre seul sur l'accueil |

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

## À nettoyer sur les fiches produit (après la bascule « une histoire = une saga »)

Depuis le 20/11/2026, tout livre appartient à une saga, y compris un roman seul (saga d'un livre). Les champs produit créés pour les livres seuls ne sont plus lus par le thème. **À supprimer une fois les sagas d'un livre créées et vérifiées, avec l'accord d'Uriel** (et leurs valeurs recopiées sur la saga si besoin) :

- `couleur_halo` → remplacé par `saga.couleur_halo`
- `mention_de_lecture` → `saga.mention_de_lecture`
- `style_particules` → `saga.style_particules`
- `illustration_hero` → `saga.illustration_hero_de_la_saga`
- `genres` (s'il a été créé) → `saga.genres`
- `est_une_oeuvre_independante` → à revoir au plan Arc (une saga d'un livre le dit déjà)

Restent sur le produit : `auteur`, `saga`, `numero_tome`, `statut_parution`, `date_parution`, `teaser_court` (fiche produit), `nombre_pages`, `extrait`, `univers`. `univers_associe` : doublon probable d'`univers`, à trancher.

## Historique des décisions

- **2026-04-23** : définitions initiales créées. Namespace `custom` unique pour cohérence avec Shopify default. Keys en français snake_case, labels en français avec accents. Synopsis long = `product.description` natif plutôt que metafield. Ordre homepage reporté en Plan 2 via metaobject dédié.
- **2026-11-20** : une histoire = une saga, même d'un seul livre (Salvation, Berserker, Parmi ces mondes ici-bas). Le métaobjet peut s'afficher « Histoire » dans l'admin ; sa clé reste `saga`. Son `nom` sert de titre court d'affichage.
- **2026-11-19** : clés corrigées d'après une sonde Storefront (`illustration_hero_de_la_saga`, collection `couleur`). Champs à créer pour le thème Liquid ajoutés (voir `docs/superpowers/specs/2026-11-19-theme-liquid-accueil.md`). L'ordre de l'accueil se règle désormais dans l'éditeur de thème (une section par histoire).
