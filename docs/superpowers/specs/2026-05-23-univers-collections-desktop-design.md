---
title: Bilskirnir — Page univers (desktop) + index « Nos univers » (/collections) — design validé
date: 2026-05-23
status: validated
parent_spec: docs/superpowers/specs/2026-05-22-bilskirnir-visual-redesign.md
mockups: .superpowers/brainstorm/6732-1779543946/content/ (univers-desktop.html, collections-index.html)
---

# Page univers desktop + index « Nos univers » — design validé

## 1. Contexte et problème

Deux pages liées aux univers ne sont pas finies :

- **`/collections/$handle`** (la page d'**un** univers) existe (Plan 3) mais **uniquement en mobile-first** : sur desktop le hero est étroit/centré et la grille de tomes en 2 colonnes paraît clairsemée. → besoin d'un **layout desktop immersif**.
- **`/collections`** (l'**index** des univers, lien « Univers » de la nav) est resté le **scaffold Hydrogen brut** : `<h1>Collections</h1>`, liste paginée pêle-mêle (incluant `all`, `goodies`, `a-paraitre`). → page « inexistante » à refaire en **« Nos univers »**.

Direction validée en Visual Companion, dans le langage immersif de la fiche desktop (atmosphère teintée de la couleur d'univers, rythme centré, doré/anthracite, emblème `✦`).

## 2. Périmètre

Deux sous-parties, **une spec** (langage + composants partagés) :
- **A** : couche **desktop** ajoutée à `/collections/$handle` (mobile inchangé) via `@media (min-width: 860px)`.
- **B** : refonte de `/collections` (`collections._index.tsx`) en index « Nos univers ».

Breakpoint desktop : **860px** (cohérent site). Aucune donnée admin nouvelle obligatoire (dégradation propre si metafields absents).

## 3. Partie A — `/collections/$handle` desktop (validée)

Réutilise l'existant (`UniverseHero`, `SagaSection`, `TomeCard`, `UniverseRail`, `univers.css`). Ajouts **desktop only** :

- **Hero immersif** : plus grand, atmosphère renforcée (halo `--bsk-uni` + brume + emblème `✦` en filigrane), **remonte sous la nav** (margin-top négatif compensé par padding, comme la fiche), titre ~64px, citation lore, stats (`N sagas · N tomes · statut`), centré.
- **« L'univers »** : colonne de lecture **centrée** (`max-width ~680px`, texte aligné à gauche dedans).
- **Sections par saga** : label `SAGA · type · N tomes`, titre, synopsis (centrés), puis **grille de tomes en 3 colonnes** (au lieu de 2) sur desktop ; badge de statut posé sur la couverture. La grille « plate » (univers sans saga) passe aussi à 3 colonnes desktop.
- Séparateurs `✦` (`Ornament`) entre sections.
- **« Découvrir un autre univers »** : rail de cartes teintées ; sur desktop, **réparti/centré à la largeur du contenu** (pas un petit cluster collé à gauche).
- Conteneur de contenu centré (`max-width ~1040px`). Mobile inchangé.

## 4. Partie B — `/collections` index « Nos univers » (validée)

Refonte de `collections._index.tsx` (abandon du scaffold `PaginatedResourceSection`/`CollectionItem`).

- **En-tête** : label doré `Les mondes de la maison`, titre **« Nos univers »**, sous-titre (« Entrez dans les mondes que nous éditons. »). Centré, fond neutre/léger halo doré.
- **Liste d'univers** : une **grande carte atmosphérique par univers** (`UniverseCard`), empilées verticalement (`max-width ~1040px` centré) :
  - fond teinté de la **couleur maîtresse** (`couleur_theme`) en dégradé radial + scrim + emblème `✦` en filigrane,
  - **pastille** (genre, optionnel), **nom** en grand (Cabinet Grotesk), **citation** (1er paragraphe du lore via `splitLore`), **stats** (`N sagas · N tomes`), **« Entrer dans l'univers → »**,
  - toute la carte est un lien vers `/collections/<handle>`.
  - Desktop : carte large (~240px de haut, contenu à gauche). Mobile : même carte, plus courte, empilée.
- **Filtrage** : on exclut les collections **techniques** par denylist de handle (`all`, `goodies`, `a-paraitre`) et les collections **vides**. On affiche les autres collections (univers). (Si une collection one-shot existe, elle apparaît comme une carte — acceptable.)
- **Données** : query `collections(first: 50)` avec, par collection : `couleur_theme`, `genre`, `lore`, `est_une_oeuvre_independante`, `sagas` (nombre de références), `products(first: 50){nodes{id}}` (nombre de tomes). Un helper pur `buildUniverseIndex(collections, denylist)` filtre + mappe en `UniverseCardProps` (couleur, genre, citation via `splitLore`, stats, handle, name). Testable.

## 5. Composants & fichiers

- **Réutilisés** : `UniverseHero`, `SagaSection`, `TomeCard`, `UniverseRail`, `Ornament`, `Container`, `universeAccentStyle`, `splitLore`, `richTextToPlain`/`metaobjectField`.
- **Modifiés** :
  - `univers.css` : + couche `@media (min-width: 860px)` (hero immersif sous nav, sections centrées, grille saga 3 col, rail réparti) + styles `UniverseCard`.
  - `SagaSection.tsx` : grille passe à 3 colonnes sur desktop (via classe + media query ; mobile reste 2 col). 
  - `UniverseRail.tsx` : classes ciblables pour répartition desktop (comme `RelatedRail`).
  - `collections.$handle.tsx` : wrappers/classes pour accrocher le desktop (hero, sections centrées). L'accent est déjà posé (`universeAccentStyle`).
  - `collections._index.tsx` : réécriture (en-tête + liste de `UniverseCard`).
  - `app/lib/fragments.ts` : `UNIVERSE_INDEX_FRAGMENT` (métadonnées + counts).
- **Nouveaux** :
  - `UniverseCard.tsx` (carte atmosphérique d'univers, présentielle).
  - `app/lib/universeIndex.ts` : `buildUniverseIndex` (filtre denylist + map → `UniverseCardProps[]`). Pur, testé.

## 6. Tests
- Logique pure testée : `buildUniverseIndex` (filtrage technique, mapping, stats, citation). `UniverseCard` (rendu nom/lien/stats). Assertions « string » sur `univers.css` (media query desktop + grille 3 col). Composants existants restent verts.
- Vérif visuelle dev : `/collections/<handle>` desktop (hero immersif sous nav, grille 3 col, rail centré) ; `/collections` (« Nos univers », cartes atmosphériques, exclusion des collections techniques) ; mobile inchangé.

## 7. Hors scope (différé)
- Versions desktop dédiées des autres pages (déjà responsive).
- Données admin réelles (couleurs, lore, sagas, genres) — dégradation propre (accent doré par défaut, citation/stats omis si absents).
- `illustration_hero` en image de fond des cartes/hero (dégradé par défaut).

## 8. Références
- Maquettes validées : `univers-desktop.html` (page univers), `collections-index.html` (index).
- Spec mère : `2026-05-22-bilskirnir-visual-redesign.md` ; page univers mobile : Plan 3 (`2026-05-22-bilskirnir-page-univers.md`).
