# Bilskirnir — Refonte visuelle 2 (langage « encre » + accueil vertical par saga) — Design

**Date :** 2026-06-19
**Statut :** validé (mockups validés via compagnon visuel, toutes surfaces)
**Périmètre :** nouveau langage graphique du site + nouveau modèle d'accueil (séquence verticale « Reels » par saga) + footer, page univers, fiche produit, catalogue, nav & atomes.

## Intention / problème

La refonte visuelle 1 (gris + **doré** + Cormorant/serif + slider **horizontal**) est jugée **datée (« 2010 »)** : le doré-sur-noir fait cliché « premium whisky », la typo manque de parti-pris, et le slider horizontal va à contre-courant du réflexe de scroll vertical. On garde l'**âme dark-atmosphérique héroïque** (direction validée, cf. `feedback_visual_direction`) mais on remplace la **peau** et on repense l'**accueil** autour du mouvement.

Mockups de référence (persistés) : `.superpowers/brainstorm/54548-1781885729/content/` — `composition-merge.html`, `composition-desktop.html`, `footer.html`, `page-univers.html`, `fiche.html`, `catalogue.html`, `atoms.html`.

## Direction visuelle — design system « encre »

C'est la **fondation** dont dépend tout le reste.

- **Palette :** fond encre `#0b0b0c`, texte crème `#f2efe7`, + un **accent par univers/saga** (sa couleur). **Zéro doré.** Accent neutre = crème quand aucune couleur n'est définie.
- **Typo :** **Bricolage Grotesque** (display/titres, graisses 600 & 800, tracking serré) + **Inter** (labels, corps, prix). Auto-hébergées via `@fontsource` (comme l'existant). Remplace Cormorant/Cabinet Grotesk + le doré.
- **Finition :**
  - **Grain** : overlay SVG `feTurbulence` (`mix-blend-mode: overlay`, ~0.35 opacité).
  - **Halo de saga/univers** : nappe radiale dans la couleur de l'entité, **débordant par-dessus les couvertures** (`mix-blend-mode: screen`) + halo de fond flou.
  - **Filets fins** : séparateurs `1px` en crème ~0.12 alpha ; kicker souligné par un filet dans l'accent.
  - **Mist** : dégradé vers l'encre en bas des écrans pour asseoir le texte.
- **Mouvement :** parallax par couches + animations d'entrée (cf. accueil). Respecte `prefers-reduced-motion`.

### Atomes (réutilisés partout)

- **Boutons :** `crème` (pill, action principale, texte encre), `ghost` (bordure crème, secondaire), `accent` (rempli de la couleur de l'entité, CTA saga), `disabled` (crème 12%). Radius pill `999px` pour les CTA ; `var(--bsk-radius)` conservé pour champs/cartes.
- **Badges/pastilles :** `accent` (statut « Bientôt »/« Précommande », bordure teintée), `crème` (« Roman indépendant »), `plein` (« Livraison offerte »).
- **Champs :** newsletter **inline souligné** (input + flèche), champ classique (dédicace), **stepper qty** (pill bordé – n +).
- **Puces de progression :** colonne de points, point actif = barre dans l'accent. Cliquables (jump). `aria` adéquat.
- **Kicker + filet :** label uppercase tracké dans l'accent, filet supérieur.
- **Couleur par univers :** chaque univers/saga porte sa teinte ; crème = neutre par défaut.

### Nav

- **`BILSKIRNIR`** en wordmark Bricolage. Liens `Œuvres · Univers · Goodies · La maison` + panier.
- Deux états : **overlay** (transparent dégradé, sur la home immersive) / **solide** (`#101013` + filet, au scroll et sur les autres pages). Réutilise `ImmersiveNav` + `useHideOnScroll` existants, restylés.
- Mobile : tiroir vertical existant, restylé.

## Accueil — séquence verticale « Reels par saga »

- **Unité = une saga.** 1 écran plein (`100vh`) = 1 saga. Les **one-shots** (romans indépendants) = 1 écran chacun (1 couverture). **Pas d'écran d'intro** (on entre direct dans la 1ʳᵉ saga). Le **footer** est le dernier écran.
- **Mécanique :** **CSS `scroll-snap-type: y mandatory`** (le « une par une » des Reels, natif, accessible, mobile). **Pas de scroll-hijack JS.** Au-dessus :
  - **Parallax par couches** : l'éventail glisse plus lentement que le titre (profondeur) ; brume + halo dérivent ; la **couverture de la saga suivante pré-apparaît** par le bas avant le snap.
  - **Animations d'entrée** par section via `IntersectionObserver` (titre/lore/CTA montent + apparaissent).
- **Composition (compo « A » validée) :**
  - *Mobile :* éventail de couvertures **centre-haut**, kicker `Univers — Saga`, **titre de saga géant Bricolage ancré bas-gauche**, lore court, **CTA crème** « Entrer dans la saga ». Halo de saga débordant. Puces de progression (droite), scroll-cue « ↓ saga suivante ».
  - *Desktop (« D1 » validé) :* titre géant **bas-gauche**, éventail **tilté à droite**, halo derrière, nav overlay en haut.
- **CTA :** saga → **page univers ancrée** sur la section de cette saga (pas de page saga dédiée). One-shot → **fiche produit**.
- **Ordre :** sagas regroupées par univers (sagas d'un même univers adjacentes), puis one-shots.
- **Accessibilité :** `prefers-reduced-motion` → désactive parallax/animations, le snap dégrade en scroll normal ; chaque écran = `<section>` avec heading ; navigation clavier (flèches / tabulation sur les puces) ; puces `aria-label`.

## Footer (« F3 » — panneau final)

- Sur la **home** : **dernier écran snap** — halo neutre, gros CTA newsletter Bricolage « Reçois les annonces de sortie », champ inline, liens minuscules + socials en bas.
- Sur les **autres pages** : **même composant**, hauteur normale (pas `100vh`). Remplace le footer actuel (jugé daté).

## Page univers

Scroll normal (pas Reels).
- **Hero univers :** halo de l'univers, kicker « Univers », **titre Bricolage géant**, lore, éventail des couvertures à droite.
- **Sections par saga :** titre saga + accroche + **grille de cartes tome**.
- **Rail « Découvrir un autre univers » :** chips avec **mini-halo de la couleur** de chaque univers.

## Fiche produit (tome + one-shot)

- **Hero « split » :** couverture flottante inclinée + **halo de l'univers** à gauche ; bloc d'achat à droite (kicker, **titre Bricolage**, prix, synopsis, **dédicace**, stepper qty + **CTA crème « Ajouter au panier »**, **Shop Pay**, « Lire un extrait », valeurs ✦).
- **« Le récit »** ; **fiche technique** (format / pages / ISBN / parution, en filets) ; **bandeau « Dans l'univers de »** (halo).
- **One-shot :** même structure, pastille **« Roman indépendant »**, **sans** bandeau saga.

## Catalogue « Œuvres »

- Titre géant Bricolage. **Sections par univers** (pastille + halo de couleur), **grille 4 (desktop) / 2 (mobile)** de cartes tome crème (halo de l'univers au survol, badge statut). Section **« Romans indépendants »** à part. **Rotation quotidienne** déterministe conservée (`seededShuffle`/`todaySeed`).

## Carte tome (atome clé)

Couverture (ratio 2/3), titre, prix, **halo de l'univers au survol**, **badge statut** teinté. Réutilisée par page univers, catalogue, rails « liés ». Étend la `TomeCard` existante (nouvelle peau).

## Modèle de données

- **Saga = metaobject (NOUVEAU).** Champs attendus :
  - `nom` (single line), `accroche` (single line), `lore` (rich text), `couleur` (couleur/hex — pilote le **halo**), `tomes` (références produits, **ordonnées**), `univers` (référence collection — pour le **CTA ancré** + héritage de couleur).
  - **Étape 0 du plan :** confirmer les clés réelles sur le metaobject live et **activer l'accès Storefront API**.
- **Résolution de couleur (halo/accent) :** `saga.couleur` → sinon `univers.couleur_theme` → sinon **crème neutre**.
- **One-shots :** produits `est_une_oeuvre_independante = true` (existant).
- **Fallback (tant que les Saga metaobjects n'existent pas) :** dériver **1 écran-saga par collection** (comportement actuel de `buildHomeSlides`), pour que la home et les pages affichent quelque chose en dev. Quand les Saga metaobjects existent, ils **priment**.

## Dépendances admin (Gautier, hors code)

- Créer les **metaobjects Saga** (+ accès Storefront API), avec **couleur** par saga.
- `couleur_theme` par univers (déjà au backlog).
- Polices : **rien à faire** (auto-hébergées via le code).
- Rappel data déjà connue (refonte 1) : images one-shots, prix, `univers` sur les tomes, lore collection.

## Phasage (décomposition implémentation)

Le périmètre est volontairement large ; il s'implémente en **phases**, chacune = un plan TDD séparé (green bar = `npm test` + `npm run build`).

- **Phase A — Design system (fondation).** Tokens encre/crème + accent ; polices Bricolage + Inter (`@fontsource`) ; helpers de résolution de couleur ; atomes (boutons, badges, champs, stepper, puces, kicker) ; nav overlay/solide restylée. Tout le reste en dépend.
- **Phase B — Accueil vertical + footer.** Modèle saga (+ fallback collection) ; fragment Saga metaobject ; `buildHomeScreens` (saga + one-shots → écrans) ; `SagaScroller` (scroll-snap) / `SagaPanel` ; hook parallax + `IntersectionObserver` ; puces de progression ; `prefers-reduced-motion` ; route `_index.tsx` ; **footer F3** (composant partagé home/global).
- **Phase C — Surfaces.** Page univers (hero + sections saga + rail) ; **carte tome** nouvelle peau ; catalogue Œuvres.
- **Phase D — Fiche produit.** Tome + one-shot restylés (hero split, bandeaux, technique).

## Hors périmètre / différé

- Migration du **reste** au nouveau langage (la maison, panier, légal) — itération suivante (ils héritent déjà des tokens/atomes de la Phase A, donc partiellement gratuits).
- **Page saga dédiée** (le CTA pointe vers la page univers ancrée).
- **Bundles** (chantier en pause, spec/plan déjà écrits).

## Tests (Vitest + Testing Library)

- **Purs :** `buildHomeScreens` (saga + one-shots, fallback collection, ordre), résolution de couleur (saga→univers→neutre), parsing du metaobject Saga.
- **Composants :** `SagaPanel`, `TomeCard` (peau), nav (états overlay/solide), footer. Mocks `matchMedia` + `IntersectionObserver`.
- **Build** propre. `npm run typecheck` : erreurs de scaffold préexistantes hors périmètre.
