---
title: Thème Liquid — spec de l'accueil (template index)
date: 2026-11-19
status: à valider par Uriel
source: docs/brief-theme-liquid.md · docs/maquette-2026-11-19/Main.dc.html
---

# Accueil — spec

**Base du thème** (tranché le 19/11/2026) : le Skeleton Theme officiel de Shopify (`github.com/Shopify/skeleton-theme`). On garde sa plomberie OS 2.0 (templates obligatoires, groupes de sections, `settings_schema`, traductions) et on écrit tout ce qui se voit d'après la maquette. Le tiroir panier s'appuie sur l'API Ajax du panier et la Section Rendering API.

L'accueil est une pile d'**écrans pleins** (`min-height: 100svh`, `scroll-snap-align: start`) posés sur un **décor fixe**. Chaque écran est une **section** que Gautier ajoute, retire et réordonne dans l'éditeur de thème. Aucun prix.

## Structure

```
header-group   → section « En-tête »              (toutes les pages)
index.json     → section « Ouverture »            ×1
               → section « Histoire »             ×N (une par histoire, ordre libre)
               → section « La maison »            ×1
footer-group   → section « Pied de page »         (toutes les pages)
layout/theme   → snippet  decor                   (fond fixe, sous tout le reste)
```

Pourquoi une **section par histoire** plutôt qu'une section à blocs : chaque histoire apparaît nommée dans la colonne de gauche de l'éditeur (« Histoire — Fracture »), se déplace d'un glisser, et tous les écrans de la page sont des frères, ce qui rend le scroll-snap trivial (`html { scroll-snap-type: y mandatory }` posé sur le seul template index).

## Sections et réglages

### En-tête (`header`)
Barre verre collante : bouton menu (burger, mobile seulement) + mot-symbole BILSKIRNIR (lien accueil) + icône panier avec compteur, qui ouvre le tiroir panier. Le burger ouvre un panneau verre plein écran listant le menu choisi.
Réglages : Menu (`link_list`, défaut `main-menu`). Gautier gère les liens dans *Navigation* de l'admin.

### Ouverture (`ouverture`)
| Réglage | Type | Valeur maquette |
|---|---|---|
| Logo | image_picker | `logo-ivoire.svg` |
| Titre | text | Les romans épiques à la française |
| Sous-titre | textarea | Des héros, des mythes, et des histoires… |
| Avatar du fondateur | image_picker | photo de Gautier |
| Ligne fondateur (petite / grande) | text ×2 | Maison d'édition fondée par / Gautier Durrieu de Madron |
| Note | text | 4,7/5 |
| Source de la note | text | sur Amazon |
| *(global)* Nombre de lecteurs | réglage de thème `nombre_lecteurs` (number) | ajouté après la note : « · 10 247 lecteurs » ; masqué si vide. Gautier l'incrémente à la main depuis son carnet. |
| Libellé du bouton | text | Découvrir nos romans |

Le bouton descend vers le premier écran « Histoire » (ancre posée par le code, pas un réglage). Indice « Défiler » animé, décoratif.

### Histoire (`histoire`) — le composant central
Un réglage de **source**, deux pickers, un seul rendu :

| Réglage | Type | Rôle |
|---|---|---|
| Saga | metaobject (`saga`) | si rempli, l'écran présente l'arc |
| Livre | product | sinon, l'écran présente un livre seul |
| Image de fond | image_picker, facultatif | plein écran, en fondu tant que l'écran est au milieu de la vue, entre la forêt et les particules ; vide → `illustration_hero_de_la_saga` de la saga, sinon rien (ajout du 20/11/2026) |
| Libellé du bouton | text, facultatif | remplace « Entrer dans l'arc » / « Voir le livre » (ex. « Voir l'arc final ») |

Tout le reste vient des données, pour que Gautier n'écrive rien deux fois :

| Élément | Saga | Livre seul |
|---|---|---|
| Couvertures | 2 premières de `ordre_des_tomes` en éventail ; 1 seule → grande | image vedette du produit, grande |
| Surtitre (partie gauche) | « N livres », N = taille de `ordre_des_tomes` | `product.type` (« Roman », « Recueil de nouvelles ») |
| Surtitre (partie droite) | `saga.mention_de_lecture` | `product.metafields.custom.mention_de_lecture` |
| Titre | `saga.nom` | `product.title` |
| Accroche | `saga.teaser_court` | `product.metafields.custom.teaser_court` (existe) |
| Halo + teinte du surtitre | `saga.couleur_halo` | `product.metafields.custom.couleur_halo`, sinon couleur de son univers |
| Badge « Nouveauté » | si un tome a une `date_parution` de moins de X jours | si sa `date_parution` a moins de X jours |
| Lien | page de l'arc (dépend du choix collection / metaobject, plan Arc) | fiche produit |

- **Une seule couleur saisie** par histoire : le halo l'utilise à 25 % d'opacité (`color_modify`), le surtitre en version éclaircie (`color_lighten`). Plus besoin de deux teintes comme dans la maquette.
- Sans couleur → halo ivoire neutre. Sans mention → le surtitre n'affiche que la partie gauche. Sans accroche → pas de paragraphe. Rien de cassé tant que les champs sont vides.
- X = réglage de thème global « Durée du badge Nouveauté (jours) », défaut 90. Aucun champ « nouveauté » à cocher : `date_parution` existe déjà.

### La maison (`maison`)
| Réglage | Type |
|---|---|
| Surtitre | text (« La maison ») |
| Présentation | richtext (permet le gras sur le nom) |
| Prochain salon | text, **ligne masquée si vide** |
| Lien du salon | url, facultatif |
| Lien « Pourquoi à la française ? » | page + libellé |
| Titre inscription | text (« Reçois les sorties ») |
| Blocs **Personne** (max 2) | image, nom, rôle |

Inscription : formulaire natif `{% form 'customer' %}` avec le tag `newsletter` → clients Shopify, emails par Shopify Email. Message de confirmation / d'erreur en place, sans recharger ailleurs.

### Pied de page (`footer`, groupe)
TikTok + Instagram depuis les **réseaux sociaux des réglages du thème**, puis le menu `footer` (Livraison, CGV, Mentions légales) et « © Bilskirnir ». Sur l'accueil, il colle sous « La maison » et partage son écran ; ailleurs, il est autonome. C'est le seul endroit où sortent des liens externes.

## Composants partagés (snippets)

- `decor` : forêt (`fond-foret.jpg` en asset), crêtes SVG, brume, braises, grain. `position: fixed` derrière la page. Réutilisable sur les autres pages.
- `couverture` : une image de livre (ombre, rayon 3 px, `image_url` + `srcset`), variantes `eventail` / `seule`. Servira aussi à l'arc, la fiche, le panier.
- `bouton` : pilule or + flèche dans le rond sombre (achat), et variante contour ivoire (navigation). Un seul snippet, deux variantes.
- `halo` : le dégradé radial teinté, prend une couleur.

## Animation

Une seule petite feuille `reveal.js` : un IntersectionObserver pose `is-active` sur l'écran visible ; l'apparition du texte est une `transition` CSS sur `.is-active` (pas de `animation-timeline: view()`, cf. brief). Flottement des couvertures, braises, brume, lueur du logo et reflet du bouton : `@keyframes` en boucle. Tout coupé sous `prefers-reduced-motion`.

## Métachamps à créer dans l'admin

Namespace `custom`, accès Storefront activé, clés en snake_case sans accent.

**Metaobject `saga`** (champs ajoutés)
| Libellé | Clé | Type |
|---|---|---|
| Accroche | `teaser_court` | Texte multiligne (même clé que sur les produits) |
| Couleur du halo | `couleur_halo` | Couleur |
| Mention de lecture | `mention_de_lecture` | Texte une ligne (« Le commencement », « Se lit seul »…) |
| Particules | `style_particules` | Texte une ligne, choix : `braises` (+ futurs styles) — sert à la page arc, pas à l'accueil |

Le fond par saga existe déjà : `illustration_hero_de_la_saga`.

**Produit** (champs ajoutés)
| Libellé | Clé | Type |
|---|---|---|
| Mention de lecture | `mention_de_lecture` | Texte une ligne |
| Extrait | `extrait` | Fichier (PDF) — fiche produit |
| Couleur du halo | `couleur_halo` | Couleur (même clé que la saga) |
| Nombre de pages | `nombre_pages` | Nombre entier — fiche produit |

Déjà là, réutilisés tels quels : `teaser_court`, `date_parution`, `couleur` (collection). `couleur_theme` et `nombre_pages` n'avaient jamais été définis sur les produits (vérifié le 19/11/2026).

**Réglages de thème** : durée du badge Nouveauté ; liens TikTok / Instagram.

## Sur ordinateur

Référence : `docs/maquette-2026-11-19/Main-Desktop.dc.html` (1440 px, validée le 19/11/2026). Un seul code responsive : les mêmes sections changent de disposition à partir d'un point de rupture (~1024 px).

- **En-tête** : pilule verre arrondie ; à gauche le mot-symbole, au centre **le même menu que le burger affiché en liens** (Nos histoires, Au Nom des Dieux, Salons, La maison), à droite le panier. Le burger n'existe que sur mobile.
- **Ouverture** : tout centré, titre plus grand ; fondateur et note côte à côte.
- **Histoire** : deux colonnes, **texte à gauche, couvertures à droite** ; le halo, plus intense, se place derrière les couvertures. Couvertures plus grandes (éventail ~260 px, seule ~300 px).
- **La maison** : deux colonnes (présentation, salon et cartes à gauche ; lien « à la française » et inscription à droite), pied de page en une ligne dessous.

Les tailles exactes viendront de la maquette au moment du plan, en `clamp()` pour éviter un saut brutal entre mobile et bureau.

## Cas réglés

- Crépuscule d'un monde : les livres 2 à 4 existent (ou seront créés) comme produits en statut `annoncé`, donc « 4 livres » se calcule.
- Salvation est un produit seul : son surtitre sera « Roman · Idéalement après les deux premiers ».
- Badge Nouveauté calculé, inscription par le formulaire client Shopify natif.

## Données à remplir (sonde du 19/11/2026)

- **Type de produit** vide sur tous les livres : à saisir (« Roman », « Recueil de nouvelles »), sinon le surtitre d'un livre seul n'a pas de partie gauche.
- **`date_parution`** remplie sur un seul livre (De l'Eau et du Sang 2) : sans elle, pas de badge Nouveauté pour Le Réveil.
- **Crépuscule d'un monde** n'a pas encore d'`ordre_des_tomes`.
- **Salvation** n'a pas de saga : c'est bien un produit seul.

## Hors périmètre de cet écran

Prix, panier, dédicace, bundles (page arc et fiche). Fond et particules par saga sur l'accueil : le décor de l'accueil reste fixe et unique en v1.
