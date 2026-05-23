---
title: Bilskirnir — Fiche produit desktop immersive (tome + one-shot) — design validé
date: 2026-05-23
status: validated
parent_spec: docs/superpowers/specs/2026-05-22-bilskirnir-visual-redesign.md
mockups: .superpowers/brainstorm/6204-1779540238/content/ (fiche-desktop-centered.html, fiche-desktop-oneshot.html, fiche-desktop-final.html)
---

# Fiche produit desktop immersive — design validé

## 1. Contexte et problème

La fiche produit (`/products/$handle`) a été refondue au Plan 4 **en mobile-first uniquement** : tout vit dans `Container width="reading"` (672px), en colonne unique. Sur desktop, ça donne une colonne étroite centrée qui « flotte » sur grand écran — pas d'effet, pas d'immersion.

Objectif : une **mise en page desktop immersive** (« effet wouah », on se sent plongé dans l'univers du livre), pour le **tome** et le **one-shot**, sans casser le mobile (qui reste tel quel). Direction validée en Visual Companion : **hero atmosphérique « split » + rythme centré symétrique**.

## 2. Périmètre

- Couche **desktop** ajoutée à l'existant (`TomePageTemplate`, `OneShotPageTemplate`, `fiche.css`) via media query. **Le mobile ne change pas.**
- **Breakpoint desktop : `min-width: 860px`** (cohérent avec la nav et le catalogue). En dessous : layout mobile actuel inchangé.
- Concerne **tome** et **one-shot**. Pas de nouvelle route ni nouvelle donnée obligatoire.

## 3. Mise en page desktop (validée)

Page **non-immersive au sens nav** (la nav `ImmersiveNav` variant `solid` reste, transparente en haut puis solide au scroll). L'accent (`--bsk-uni`/`--bsk-uni-soft`) est déjà posé sur le conteneur de page par la route (Plan 4) : couleur de l'**univers** pour un tome, couleur **du livre** pour un one-shot.

### 3.1 Hero immersif (le « wouah »)
- **Bandeau atmosphérique pleine largeur** (full-bleed), hauteur généreuse (≈ 80–90vh, min ~560px), teinté de l'accent :
  - Fond = **dégradés radiaux de `--bsk-uni`** (halos ~0.5–0.6 d'intensité) fondus vers l'anthracite, + **brume** (radial clair, `mix-blend-mode: screen`, légère dérive), + **emblème `✦`/logo en filigrane** (~4 % d'opacité), + léger **scrim** pour la lisibilité.
  - **Si le metafield `illustration_hero` de l'univers est présent** (tome), l'utiliser en image de fond (cover, opacité réduite + scrim) à la place des dégradés ; sinon dégradés. (One-shot : dégradés de la couleur du livre, pas d'image.)
- **Contenu centré sur l'axe de page**, dans un bloc `max-width ~1040px` : split **couverture (gauche) + bloc d'achat (droite)**, centré, `gap` généreux.
  - **Couverture** : grande, **légèrement inclinée** (`rotate(-2.5deg)`), **flottement** doux (déjà `fiche-float`), `drop-shadow` marqué. **Respiration verticale** : de l'air au-dessus *et en dessous* (la couverture n'est pas collée au bas du hero / au bandeau valeurs).
  - **Bloc d'achat** (≤ ~420px) : pastille (genre / « Roman indépendant »), libellé `Saga · Tome N` (tome uniquement), **titre** Cabinet Grotesk (clamp ~44–54px), **teaser** en citation bordée dorée, **prix**, **dédicace dépliable**, **quantité**, **Ajouter au panier** (+ toast), **Shop Pay**, lien **« Lire un extrait »**.
- **Entrée en cascade** (déjà `fiche-rise`), neutralisée en `prefers-reduced-motion`.
- Indice de scroll discret en bas du hero (« ↓ Le récit »), optionnel.

### 3.2 Rythme du contenu (sous le hero) — centré & symétrique
Décision validée : **tout est centré sur l'axe de la page** (pas d'alignement à gauche). Les titres de section sont centrés ; le **texte de lecture reste aligné à gauche à l'intérieur de sa colonne centrée** (lisibilité). Seuls le hero et le bandeau univers/atmosphère passent en **full-bleed**.

1. **Bandeau « valeurs »** : 3 garanties (Expédié 48 h · Paiement sécurisé · Dédicace offerte), **rangée centrée** pleine largeur, filets haut/bas.
2. **« Le récit »** : section centrée, `max-width ~680px`, label doré + titre centrés, paragraphes (corps 16–17px) alignés à gauche.
3. **Bandeau immersif central (full-bleed)** :
   - **Tome → « Dans l'univers de »** : bandeau teinté de la couleur de l'univers (dégradé radial + scrim), nom de l'univers en grand, bouton **« Explorer l'univers → »** vers `/collections/<handle>`.
   - **One-shot → « L'atmosphère du livre »** : même bandeau teinté de la couleur du livre + **phrase d'ambiance** (metafield `ambiance`, déjà câblé Plan 4).
4. **Fiche technique** : section centrée, `max-width ~520px`, titre centré, lignes label/valeur.
5. Séparateur `✦` (`Ornament`).
6. **Rail lié** : **même largeur que les sections (~680px), centré**, couvertures **réparties d'un bord à l'autre** (`justify-content: space-between`, items `flex:1; max-width ~150px`), titre centré.
   - Tome → **« Dans le même univers »** ; one-shot → **« Autres romans indépendants »**.
7. **Footer** global.

### 3.3 One-shot — différences (vs tome)
- Couleur = **celle du livre** (`couleur_theme` produit) ; pas de libellé saga/tome ; pastille **« Roman indépendant »**.
- **« L'atmosphère du livre »** remplace **« Dans l'univers de »**.
- Rail **« Autres romans indépendants »**.
- Tout le reste (hero split, valeurs, récit, technique, rythme centré) identique.

## 4. Implémentation (orientations)

- **CSS-driven** : l'essentiel est dans `fiche.css` via `@media (min-width: 860px)` — le hero passe en grille 2 colonnes centrée + fond atmosphérique renforcé ; les sections reçoivent leurs `max-width` centrés ; le rail passe en `space-between`. Le **markup mobile existant est réutilisé** ; on ajoute surtout des classes/structure pour que le desktop s'accroche (ex. un conteneur de hero full-bleed, des wrappers de section centrés).
- `TomePageTemplate` / `OneShotPageTemplate` : adapter la structure pour exposer les zones (hero split, bandeau full-bleed, sections centrées, rail) avec des classes ciblables en CSS desktop. Garder les composants partagés (`ProductGallery`, `ValuesBadges`, `TechSpecs`, `RelatedRail`, `DedicaceField`, `TomeAddToCart`).
- **`RelatedRail`** : sur desktop, passer d'un rail scrollable à une rangée répartie à la largeur du contenu (variante CSS via classe, pas de refonte du composant).
- **Atmosphère** : background du hero piloté par `--bsk-uni` (déjà posé). `illustration_hero` (univers) en option : l'ajouter à la query produit (`relatedUniverse { ... illustration_hero }`) pour l'image de fond du tome ; dégradé sinon.
- **Aucune régression mobile** : toutes les nouveautés sont sous le media query desktop ; les tests existants des templates restent verts.

## 5. Tests
- Les composants restent testés au niveau unité (déjà fait Plan 4). L'ajout est surtout CSS desktop → test « string » sur `fiche.css` (présence d'un `@media (min-width: 860px)` + grille hero + `space-between` du rail). Pas de logique nouvelle à tester lourdement.
- Vérification visuelle desktop en dev (tome + one-shot) : hero immersif, respiration sous la couverture, rythme centré, rail à la largeur du contenu.

## 6. Hors scope (différé)
- Versions desktop dédiées des **autres** pages (déjà responsive depuis mobile).
- Galerie multi-images avancée (la galerie actuelle suffit).
- Données admin réelles (couleurs, `illustration_hero`, `ambiance`, prix) — la page dégrade proprement (dégradés par défaut, accent doré neutre si pas de couleur).

## 7. Références
- Maquettes validées : `fiche-desktop-final.html` (tome), `fiche-desktop-oneshot.html` (one-shot), `fiche-desktop-centered.html` (rythme).
- Spec mère : `docs/superpowers/specs/2026-05-22-bilskirnir-visual-redesign.md` ; fiche mobile : Plan 4 (`2026-05-22-bilskirnir-fiches-produit.md`).
