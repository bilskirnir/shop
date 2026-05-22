---
title: Bilskirnir — Refonte visuelle immersive (design system + pages)
date: 2026-05-22
status: validated
parent_spec: docs/superpowers/specs/2026-04-23-bilskirnir-shop-design.md
mockups: docs/superpowers/mockups/2026-05-22-visual-redesign/
---

# Bilskirnir — Refonte visuelle immersive

## 1. Contexte et objectif

Le Plan 1 (foundation) et le Plan 2 (catalogue navigable) ont produit une boutique **fonctionnelle mais schématique** : structure correcte, styles vanilla par tokens, aucune passe visuelle. L'objectif de cette refonte est la **phase design jamais faite** : un site **moderne, animé, immersif et pro** (2026), à la hauteur d'une maison d'édition ambitieuse.

Cette refonte définit un **système de design** complet et son application **page par page**, validés visuellement avec l'utilisateur via des maquettes interactives (voir `docs/superpowers/mockups/2026-05-22-visual-redesign/`).

**Mobile-first.** ~70 % des utilisateurs sont sur mobile : chaque page est conçue d'abord pour mobile, puis adaptée desktop. Les maquettes validées sont en mobile (sauf l'accueil, dont la version desktop est aussi maquettée).

> **Note d'identité :** la **nouvelle** direction (sombre atmosphérique / doré / Cabinet Grotesk / immersif) remplace l'ancienne identité des flyers (cramoisi, entrelacs nordiques, parchemin), considérée comme datée. On ne réutilise de l'ancien matériel que **l'emblème de la maison**.

---

## 2. Système de design

### 2.1 Couleurs

Principe directeur (issu d'une décision explicite de l'utilisateur) :

- **Base neutre globale = gris sombre anthracite + doré + belles images.** C'est la constante du site partout (nav, footers, pages génériques, catalogue, panier). Le **doré/bronze** est l'accent **permanent** de la maison.
- **Couleur maîtresse par univers/saga = un accent ponctuel uniquement.** Elle n'apparaît que sur les surfaces *de cet univers* : halo derrière la couverture, teinte du fond atmosphérique du hero, carte « Dans l'univers de », slide d'accueil correspondant. **Le site n'est jamais « tout vert » ni mono-couleur.**

Tokens (valeurs validées en maquette, à porter en CSS custom properties `--bsk-*`) :

| Rôle | Valeur | Usage |
|---|---|---|
| `--ink` (base) | `#131419` | Fond global anthracite |
| `--ink-2` | `#191a20` | Panneaux/cartes |
| `--footer` | `#0e0f13` | Footer |
| `--fg` | `#ece4d3` | Texte principal (crème chaud) |
| `--muted` | `#969089` | Texte secondaire (gris chaud) |
| `--line` | `rgba(236,228,211,.13)` | Bordures fines |
| `--gold` / `--gold-2` | `#d8a657` / `#c4912f` | Accent permanent : CTAs, labels, pastilles, badge panier |
| `--uni` | par univers | Couleur maîtresse (ex. AnDd `#2f8a78` vert ; Berserker `#46638f` acier ; Fracture bleu ; Recueil ambre) |
| `--uni-soft` | `rgba(uni,.16)` | Halo/teinte discrète de l'univers |

Le **dosage de l'accent univers est volontairement discret** (~16 % d'opacité pour les halos).

### 2.2 Typographie

- **Display / titres : Cabinet Grotesk** (700–800), letter-spacing serré (`-.02em`). Audacieux, contemporain, « pro ».
- **Texte / UI : Switzer** (400–600).
- Chargées via Fontshare (`api.fontshare.com`). Prévoir l'auto-hébergement (`@fontsource` ou fichiers) pour la prod afin d'éviter une dépendance CDN externe.
- **Corps de texte agrandi** : paragraphes éditoriaux à **17 px** (lecture confortable, demande explicite de l'utilisateur).

### 2.3 Logo / emblème

- Emblème **« Bilskirnir — Le Hall de Force »** (halle viking + wordmark), source : `\\EGIDE\Bilskirnir\Logos\Bilskirnig Logo Sans_Details.png` (version épurée). À intégrer dans le repo en SVG idéalement.
- Fichier noir → rendu **blanc** sur fond sombre via `filter: brightness(0) invert(1)`. Prévoir une vraie version blanche/SVG pour la prod.
- Présent dans la nav (centré) et en filigrane discret sur certains heros.

### 2.4 Couvertures (règle importante)

Les fichiers de couverture sont des **mock-ups 3D détourés** (livre en perspective sur fond transparent, avec marge).

- **Toujours en `filter: drop-shadow(...)`** (l'ombre suit la forme réelle du livre), **jamais** dans un cadre/carré avec fond (sinon un carré gris apparaît autour).
- Dans les grilles, les laisser **déborder légèrement** (`width:~114%; margin:0 -7%`) pour que le livre paraisse plus grand malgré la marge transparente.
- Les couvertures sont **les vedettes** de chaque page (grandes, lumineuses, elles ressortent sur le fond sombre).

### 2.5 Composants transverses

- **Nav intelligente (mobile)** : transparente en haut de page ; au **scroll vers le bas** elle se masque (`translateY(-104%)`) ; au **scroll vers le haut** elle réapparaît avec **fond flou + fine bordure** (`backdrop-filter: blur` + `--line`). Comportement **standard sur toutes les pages**.
- **Panier** : icône sac + **pastille de quantité dorée** (pas de texte « Panier · 0 »).
- **Badges de statut** (`ReleaseStatusBadge`) : `Préco · <date>` (fond doré) / `À paraître` (contour). Dans les grilles, **posés sur la couverture**, centrés en haut, avec `z-index` explicite au-dessus de l'image (le `filter` de l'image crée un contexte d'empilement — image `z-index:1`, badge `z-index:3`).
- **Dédicace** : bloc avec checkbox « Dédicacer ce livre · offert » qui **déplie** un champ « À qui dédicacer ? » (transition `max-height`). Gratuit, sans impact sur le prix.
- **CTA principal** : dégradé doré, texte sombre ; CTA secondaire « ghost » (contour). **Shop Pay** en bouton violet sous l'ajout panier.
- **Ornement séparateur** : simple `✦` doré entre sections (PAS les entrelacs nordiques de l'ancienne identité).
- **Badges « valeurs »** : pictogramme **au-dessus** du label (SVG en `display:block; margin:0 auto`), centrés.

### 2.6 Mouvement / animation

- Entrées en **cascade** au chargement/au scroll (opacity + translateY, `cubic-bezier(.2,.7,.2,1)`, délais échelonnés).
- **Révélations au scroll** (IntersectionObserver) sur les sections.
- **Couvertures qui flottent** doucement (boucle `floatc` ~7 s).
- **Fonds atmosphériques** : léger ken-burns + brume dérivante + halo qui respire.
- Tout en douceur (durées 0.3–0.9 s), jamais clinquant.

---

## 3. Application page par page

> Maquettes de référence dans `docs/superpowers/mockups/2026-05-22-visual-redesign/`.

### 3.1 Accueil — slider d'univers plein écran (`01-home-desktop.html`, `02-home-mobile.html`)

- **Full-height, c'est tout** : la home EST le slider d'univers, pas de footer (le footer vit sur toutes les autres pages ; les liens légaux/contact sont accessibles via le menu).
- **Slider égalitaire** : chaque univers a son **panneau immersif plein écran** (fond atmosphérique propre + couleur maîtresse), titre Cabinet Grotesk, citation lore, CTAs, **couverture(s) en vedette** (pile pour multi-tomes, couverture seule pour one-shot/recueil).
- **Navigation claire entre slides** : sélecteur d'univers (cartes égales en desktop / **points + nom de l'univers actif** en mobile), flèches (desktop), **swipe** (mobile/desktop), lecture auto avec barre de progression, compteur `01/04` aligné au bord du sélecteur.
- Pas de hero « livre du mois » : tous les univers au même niveau (cf. `[[feedback_no_hero_treatment]]`).
- **À harmoniser** : les maquettes home (v13/v14) ont été faites avant la décision « base grise » et utilisent encore une base verte ; à l'implémentation, ramener le **chrome** (scrims, sélecteur, nav) sur la base grise neutre, la couleur d'univers restant portée par le fond atmosphérique + le halo de chaque slide.

### 3.2 Page univers (`03-univers-mobile.html`)

- **Hero atmosphérique** : base grise + accent de l'univers (discret), emblème en filigrane, grand titre, citation lore, stats (`N sagas · N tomes · statut`).
- **Bloc « L'univers »** : lore en corps agrandi.
- **Sections par saga** : label `SAGA · TYPE · N TOMES`, titre, synopsis italique, puis **grille 2 colonnes de tomes** (couvertures vedettes, texte centré dessous, badge de statut sur la couverture).
- Séparateurs `✦`.
- **« Découvrir un autre univers »** : rail horizontal de cartes, **chacune avec sa couleur maîtresse**.
- Footer complet.

### 3.3 Fiche produit — tome (`04-fiche-tome-mobile.html`)

- **Hero** : couverture en grand qui flotte (présence renforcée), **halo d'univers discret** derrière, fil d'Ariane, mini-galerie de vignettes.
- **Bloc achat** : pill catégorie, n° de tome, titre, **teaser** en citation bordée dorée, prix, **dédicace dépliable**, quantité + **Ajouter au panier** (incrémente la pastille panier + toast), **Shop Pay**, « Lire un extrait ».
- **3 badges valeurs** (expédition / paiement / dédicace offerte), pictogramme au-dessus.
- **« Le récit »** (synopsis, corps 17 px).
- **« Dans l'univers de »** : carte atmosphérique (couleur de l'univers) cliquable vers la page univers.
- **Fiche technique** (format, pages, ISBN, parution, langue).
- **« Dans le même univers »** : rail de couvertures.
- **CTA selon statut** : `publié` → Ajouter au panier ; `précommande` → Précommander (+ date) ; `annoncé` → bloc « à paraître » non marchand.

### 3.4 Fiche one-shot — immersive (`05-fiche-oneshot-mobile.html`)

Comme la fiche tome, avec :
- **Hero plus immersif** (couleur maîtresse propre au livre), pill « Roman indépendant ».
- **« L'atmosphère du livre »** (bandeau immersif teinté + phrase d'ambiance) **remplace** « Dans l'univers de » (pas d'univers).
- Related **« Autres romans indépendants »**.

### 3.5 La maison (`06-maison-mobile.html`)

- **Hero** : emblème en grand, « Ramener de l'héroïsme. », sous-titre. Glow doré.
- **Manifeste « Pourquoi nous existons »** (copy éditoriale de la maison).
- **4 piliers** (Héroïsme · Mythes & racines · Voix française · Indépendance) en grille 2×2 avec icônes.
- **L'auteur fondateur** : photo circulaire (Gautier) + bio + liens TikTok/Instagram.
- Footer.

---

## 4. Bugs connus à corriger pendant l'implémentation

Relevés sur le dev server le 2026-05-22 (la refonte des routes les absorbe) :

1. **`getProductOptions: product.options is missing`** — la query produit ne récupère pas `options`/variants ; casse la fiche produit Hydrogen. À corriger dans la query/loader de `products.$handle`.
2. **`<img src="">`** vide sur la fiche produit (rendre `null` plutôt qu'une chaîne vide).
3. **`/images/gautier.jpg` → 404** — asset manquant (page La maison) : fournir la photo du fondateur.

## 5. Données admin / assets à fournir (côté Gautier / utilisateur)

- **Prix manquants** : des tomes `publié` sont à `0,00 €` dans l'admin → à renseigner avant mise en prod (sinon commandes gratuites).
- **Univers « Fracture »** : collection absente (404) → à créer dans l'admin.
- **Fonds atmosphériques par univers** : l'utilisateur les produira lui-même (façon flyer / générés par IA). Le design prévoit un **emplacement remplaçable** (halo/dégradé en placeholder aujourd'hui).
- **Emblème** en SVG/PNG blanc propre ; **photo du fondateur**.

## 6. Hors scope (différé)

- Versions desktop des pages univers / fiche / maison (le design system se transpose ; à maquetter/implémenter en responsive à partir du mobile + du modèle home desktop).
- Bundles sagas, notify-me « à paraître », précommande via app dédiée (cf. Plan 2 out-of-scope).
- Pages légales (mentions, CGV, livraison, confidentialité, contact) — à créer (accessibles via menu/footer).
- Rich text formaté (gras/listes) — plain text suffit.

## 7. Références

- Maquettes interactives validées : `docs/superpowers/mockups/2026-05-22-visual-redesign/` (ouvrir dans un navigateur).
- Spec structurelle/éditoriale d'origine : `docs/superpowers/specs/2026-04-23-bilskirnir-shop-design.md`.
- Typo : Cabinet Grotesk + Switzer (Fontshare).
