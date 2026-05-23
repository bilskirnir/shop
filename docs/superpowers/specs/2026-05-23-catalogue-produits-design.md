---
title: Bilskirnir — Page catalogue « Œuvres » (liste de produits) — design validé
date: 2026-05-23
status: validated
parent_spec: docs/superpowers/specs/2026-05-22-bilskirnir-visual-redesign.md
mockups: .superpowers/brainstorm/5708-1779520535/content/ (catalogue-B-desktop.html, catalogue-B-mobile.html)
---

# Page catalogue « Œuvres » — design validé

## 1. Contexte et problème

Le catalogue (liste de tous les produits) est resté le **scaffold Hydrogen brut** : route `collections.all.tsx`, titre « Products » en anglais, grille `ProductItem` par défaut, **aucun style maison**. C'est la dernière page « oubliée » de la refonte (la fiche produit individuelle, elle, a été refondue au Plan 4). De plus, l'URL `/products` renvoie une **404** (il n'existe pas de route liste de produits).

Objectif : refondre cette page en **catalogue éditorial regroupé par univers**, dans le langage visuel Bilskirnir (anthracite + doré + accent d'univers, couvertures détourées en drop-shadow), **desktop d'abord puis mobile**.

Direction retenue (validée en Visual Companion) : **option B — éditorial, regroupé par univers**.

## 2. URL / routage

- On **restyle `collections.all.tsx`** (catalogue existant, lien « Œuvres » de la nav → `/collections/all`).
- On ajoute une **redirection `/products` → `/collections/all`** (nouvelle route `routes/products._index.tsx` dont le loader renvoie un `redirect('/collections/all')`), pour que l'URL `/products` fonctionne.
- Le lien « Œuvres » de la nav continue de pointer vers `/collections/all`.

## 3. Mise en page (validée)

Page **non-immersive** (nav `ImmersiveNav` variant `solid` + `Footer` globaux conservés). Mobile-first, layout desktop via media query.

### 3.1 En-tête
- Petit label doré `Le catalogue` (caps, letter-spacing).
- Titre `Œuvres` en Cabinet Grotesk 800.
- Sous-titre discret : `Toutes les œuvres de la maison, par univers`.
- Centré.

### 3.2 Sections par univers
Les produits sont **regroupés par univers** (via le metafield produit `custom.univers` → référence Collection). Pour chaque univers ayant au moins un produit :
- **En-tête de section** : `✦` + nom de l'univers, le `✦` (et un soupçon d'accent) **teintés de la couleur maîtresse** de l'univers (`couleur_theme`). À droite, lien **« Explorer l'univers → »** (doré) vers `/collections/<handle>`.
- **Grille de couvertures** : **4 colonnes desktop**, **2 colonnes mobile**, avec **un espacement confortable entre les couvertures** (gap généreux — demande explicite). Chaque carte = composant `TomeCard` existant :
  - couverture **débordante** (`Cover bleed`, drop-shadow, jamais de cadre),
  - **halo discret** de la couleur d'univers derrière la couverture (opacité ~16-20 %),
  - **badge de statut posé sur la couverture** (`ReleaseStatusBadge onImage`) : `Préco · <date>` / `À paraître`,
  - dessous, centré : **n° de tome** (si présent, caps muted) · **titre** (Cabinet Grotesk) · **prix** en doré si publié, sinon « Précommander » / l'année (« 2026 ») pour à paraître.
- **Ordre des sections univers : rotation quotidienne** (cf. §3.6) — pas toujours les mêmes en tête. Les **tomes au sein d'une section restent triés par n° de tome** (ordre de lecture 1·2·3).

### 3.3 Section « Romans indépendants »
- Regroupe les produits marqués `est_une_oeuvre_independante = true`.
- Même grille (4 desktop / 2 mobile). En-tête `✦ Romans indépendants` (accent doré neutre, pas de couleur d'univers). Pas de lien « explorer ».
- Sous chaque couverture : titre + prix/statut (pas de n° de tome).

### 3.4 Fallback
- Produits **sans `univers` et non indépendants** → regroupés dans une section neutre **« Autres œuvres »** (accent doré), même grille. Évite qu'un produit disparaisse du catalogue si ses metafields ne sont pas renseignés (cf. données dev incomplètes).

### 3.5 Séparateurs
- `Ornament` (`✦` doré + filets) entre chaque section.

### 3.6 Rotation quotidienne (équité — « pas toujours les mêmes en premier »)
Fidèle à la philosophie maison (aucune œuvre vedette, tout au même niveau), l'**ordre des sections univers tourne chaque jour** :
- Un helper pur `seededShuffle(items, seed)` (PRNG déterministe, ex. mulberry32) réordonne les **sections univers** entre elles.
- **Graine = index du jour** (`Math.floor(Date.now() / 86_400_000)`), calculée **dans le loader (côté serveur)** ; l'ordre est passé au composant, qui le rend tel quel → **aucun aléa côté client, pas de mismatch d'hydratation**, et stable pendant toute la journée (compatible cache).
- Résultat : ordre **stable dans la journée**, **différent chaque jour**, équitable dans le temps.
- Les **« Romans indépendants »** sont eux aussi **mélangés entre eux** avec la même graine. Les sections « Romans indépendants » et « Autres œuvres » restent **après** les univers (structure lisible) ; seules les sections univers tournent entre elles, et les œuvres indépendantes tournent entre elles.
- `seededShuffle` est **pur et testable** (graine fixe → ordre déterministe).

## 4. Données / requête

- Récupérer **tous les produits** (jusqu'à ~100, pas de pagination — catalogue réduit ; à revisiter si la collection grandit) via `TILE_PRODUCT_FRAGMENT` (fournit `featuredImage`, `priceRange`, et `TomeMetafields` : `univers {reference {handle title}}`, `numero_tome`, `statut_parution`, `date_parution`, `est_une_oeuvre_independante`).
- Récupérer **les univers** (collections) avec leur `couleur_theme` (réutiliser `UNIVERSE_RAIL_FRAGMENT` ou un fragment équivalent) → construire une map `handle → {title, couleurTheme}` pour l'accent + l'ordre des sections.
- Grouper les produits côté composant : par `univers.reference.handle` → sections univers ; `est_une_oeuvre_independante` → « Romans indépendants » ; reste → « Autres œuvres ».
- On **abandonne `PaginatedResourceSection`/`ProductItem`** pour cette page (scaffold) au profit de `TomeCard` + le groupement. (`ProductItem` reste utilisé ailleurs si besoin ; sinon nettoyable plus tard.)

## 5. Composants

- **Réutilisés** : `TomeCard` (Plan 3 — couverture bleed + badge onImage + n°/titre/prix), `Cover`, `ReleaseStatusBadge`, `Ornament`, `universeAccentStyle`, `Container`.
- **Nouveau** : un petit composant de section catalogue (`CatalogueSection` : props `name`, `accent`, `href?`, `tomes: TomeCardProps[]`, `showTomeNumber?`) rendant l'en-tête (✦ + nom teinté + lien optionnel) + la grille responsive. Le **halo** d'univers est ajouté soit dans `TomeCard` (variante/prop `halo`), soit via un wrapper dans la section ; décision d'implémentation au plan (préférence : prop optionnelle sur `TomeCard` pour rester DRY).
- **Nouveau (logique pure)** : `seededShuffle(items, seed)` (PRNG déterministe) — réordonne les sections univers + les romans indépendants selon la graine du jour (§3.6). Testable.
- **CSS** : une feuille `catalogue.css` pour la grille responsive (4↔2 colonnes), le gap entre couvertures, et le halo. Pas d'animation lourde (page de liste) ; éventuellement une légère cascade d'apparition, neutralisée en `prefers-reduced-motion`.
- **Route** : `collections.all.tsx` réécrite (en-tête + sections) ; `products._index.tsx` (redirect).

## 6. Accessibilité / divers
- Chaque carte est un lien vers `/products/<handle>` (déjà géré par `TomeCard`).
- Grille = liste sémantique (`ul`/`li`) idéalement.
- Couvertures sans cadre (drop-shadow) ; `src` jamais vide (géré par `Cover`).

## 7. Hors scope (différé)
- Filtres / tri (option C écartée — catalogue encore réduit).
- Pagination (fetch borné ~100 ; à revisiter si croissance).
- Versions desktop dédiées des autres pages.
- Le contenu réel (prix à 0 €, metafield `univers` non renseigné sur certains tomes, couleurs d'univers) reste une tâche **admin Gautier** — la page dégrade proprement (section « Autres œuvres », accent doré par défaut).

## 8. Références
- Maquettes validées : `catalogue-B-desktop.html`, `catalogue-B-mobile.html` (Visual Companion).
- Spec mère : `docs/superpowers/specs/2026-05-22-bilskirnir-visual-redesign.md`.
