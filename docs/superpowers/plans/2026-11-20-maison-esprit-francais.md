# Écran « La maison » — esprit français et lettre — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer la colonne droite de « La maison » par « L'esprit français » (calé en bas) et sortir l'inscription dans un bandeau pleine largeur avec un vrai bouton or.

**Architecture:** Tout se passe dans `theme/sections/maison.liquid` (markup, CSS de section, schéma). Le bouton or reste un seul composant : `snippets/bouton.liquid` apprend à rendre un `<button type="submit">` quand on ne lui donne pas d'`url`.

**Tech Stack:** Shopify Liquid OS 2.0 (thème `theme/`, base Skeleton), CSS sans préprocesseur.

**Spec:** `docs/superpowers/specs/2026-11-20-maison-esprit-francais-design.md` — maquette de référence : `.superpowers/brainstorm/1683-1795179359/content/maison-pc-v4.html` (bloc « PISTE B »).

## Global Constraints

- Lire `.claude/rules/theme-liquid.md` avant tout envoi : vérifier chaque `Synced » update`, lire la sortie de `theme push` (`2>&1 | grep -iE "error|invalid"`), libellés de schéma ≤ 50 caractères.
- Push sur le thème non publié 200840970627 **toujours** avec `--ignore "templates/*.json" --ignore "config/settings_data.json" --ignore "sections/*-group.json"`.
- Couleurs et polices : variables de `theme/assets/base.css` (`--ivoire`, `--gris-1..3`, `--or`, `--titre`, `.verre`, `.surtitre`). Aucune couleur nouvelle.
- Point de rupture PC : `min-width: 1024px`, comme le reste de la section.
- Toute apparition garde `data-reveal` (animations déjà coupées sous `prefers-reduced-motion` dans `reveal.js`/`base.css`).
- Le texte « jamais plus d'une lettre par mois » de la maquette n'est **pas** repris (non validé).

## Review Focus

- **Aucun engagement et aucune page choisie** → le bloc « L'esprit français » entier disparaît (pas de surtitre orphelin) ; la colonne gauche occupe alors la ligne seule.
- **Formulaire posté avec succès** → le bandeau garde son titre et remplace champ + bouton par « C'est noté, tu recevras les sorties. » (pas de bouton orphelin).
- **Email invalide ou déjà inscrit** → message d'erreur sous le champ, `aria-invalid` et `aria-describedby` conservés, focus visible (contour or).
- **Portable 1366×768** → l'écran « La maison » + le pied tiennent sans que le bouton passe sous la ligne de flottaison du scroll-snap (pied atteignable).
- **Mobile 390 px** → bouton or pleine largeur sous le champ, rien ne déborde horizontalement.

---

### Task 1: Le bouton or sait être un bouton d'envoi

**Files:**
- Modify: `theme/snippets/bouton.liquid`
- Modify: `theme/assets/base.css` (section « Bouton pilule », règle `.bouton`)

**Interfaces:**
- Produces: `{% render 'bouton', libelle: 'Je m'inscris', variante: 'or' %}` sans `url` → `<button type="submit" class="bouton bouton--or">` avec le même contenu (libellé + `.bouton__fleche`). Avec `url` : inchangé (`<a>`).

- [ ] **Step 1:** Dans le snippet, variante `or` : si `url` est vide, rendre `<button type="submit" class="bouton bouton--or">` au lieu de `<a>`. Mettre à jour le commentaire d'usage (une ligne).
- [ ] **Step 2:** Dans `base.css`, ajouter à `.bouton` : `border: 0; font: inherit; cursor: pointer;` (sans effet sur les `<a>` existants). Garder `font-weight` / `font-size` des variantes.
- [ ] **Step 3: Vérifier** — `shopify theme push --store bilskirnir-2 --theme 200840675715 --path theme --only snippets/bouton.liquid --only assets/base.css 2>&1 | grep -iE "error|invalid"` → aucune ligne. Ouvrir l'accueil : le bouton « Découvrir » de l'Ouverture est identique à avant.
- [ ] **Step 4: Commit** — `feat(theme): le bouton or peut être un bouton d'envoi (sans url)`

### Task 2: L'esprit français à droite, calé en bas

**Files:**
- Modify: `theme/sections/maison.liquid` (markup `.maison__droite`, CSS, schéma)

**Interfaces:**
- Consumes: réglages existants `page_valeurs`, `libelle_valeurs`.
- Produces: nouveaux réglages `esprit_surtitre` (text, défaut « L'esprit français »), `esprit_titre` (text, défaut « Entre grandeur et abnégation ») ; nouveau type de bloc `engagement` (settings `titre` text, `texte` text). Les blocs `personne` se filtrent par `block.type == 'personne'`, les engagements par `block.type == 'engagement'`.

- [ ] **Step 1: Schéma** — ajouter le header « L'esprit français », les deux réglages, le bloc `engagement` (nom « Engagement »). Retirer `max_blocks: 2` (il limiterait aussi les engagements) et ajouter `"limit": 2` au bloc `personne`. Preset : ajouter les quatre engagements par défaut :
  - « 100 % indépendants » / « On publie les histoires qu'on a envie de lire. »
  - « Faits et pensés en France » / « Des romans originaux, épiques et déjantés. »
  - « Jamais ennuyeux » / « Des histoires qui se dévorent comme les meilleures séries. »
  - « Héroïsme, bravoure » / « Des mots qui ont encore un sens. »
- [ ] **Step 2: Markup** — `.maison__droite` contient désormais : surtitre, `<h2 class="maison__esprit-titre">`, `<ul class="maison__engagements">` (un `<li>` par bloc `engagement` avec `{{ block.shopify_attributes }}`, `<strong>` titre + texte), puis le lien `page_valeurs` en lien or texte (« Pourquoi « à la française » ? → »), plus en pilule. La boucle des personnes ne garde que `block.type == 'personne'`. Tout le bloc droit est omis s'il n'y a ni engagement ni page.
- [ ] **Step 3: CSS** — PC : `.maison__grille { align-items: end }` ; `.maison__droite` avec filet gauche `1px solid #d2b06a55` et `padding-left: 40px` ; titre Buenard 38 px ; engagements en grille 2 colonnes, gap `14px 24px` ; li 15 px `--gris-2`, strong 16 px `--ivoire`. Mobile : une colonne, pas de filet. Supprimer les règles `.maison__valeurs*` devenues inutiles.
- [ ] **Step 4: Vérifier** — push `--only sections/maison.liquid` sur le thème de dev (lire la sortie), puis `curl -s http://127.0.0.1:9292/ | grep -c maison__engagements` → `1`. À l'écran (PC 1440) : comparer à la maquette v4.
- [ ] **Step 5: Commit** — `feat(theme): La maison — l'esprit français à droite, engagements en blocs`

### Task 3: La lettre de la maison en bandeau pleine largeur

**Files:**
- Modify: `theme/sections/maison.liquid`

**Interfaces:**
- Consumes: `{% render 'bouton', libelle: section.settings.libelle_inscription, variante: 'or' %}` (Task 1).
- Produces: réglages `surtitre_inscription` (défaut « La lettre de la maison »), `titre_inscription` (défaut remplacé par « Ne manque ni une sortie, ni une rencontre »), `texte_inscription` (textarea, défaut « Les nouveaux romans dès leur parution, les dates où venir nous voir en salon et en dédicace, et un peu des coulisses. »), `libelle_inscription` (défaut « Je m'inscris »).

- [ ] **Step 1:** Sortir le `{% form 'customer' %}` de `.maison__droite` et le placer après `.maison__grille`, dans `<div class="maison__lettre verre" data-reveal>` : à gauche surtitre + `<h2>` + texte (le `<label for="inscription-email">` devient visuellement masqué, libellé « Ton adresse email ») ; à droite champ email (classe `.maison__champ verre`, sans bouton intégré) + bouton or. Messages succès / erreur et attributs ARIA inchangés.
- [ ] **Step 2: CSS** — PC : bandeau `margin-top: 40px`, `padding: 26px 30px 26px 36px`, `border-radius: 22px`, flex `align-items: center`, `gap: 40px` ; texte `flex: 1.1`, titre Buenard 30 px ; formulaire `flex: 1`, champ `min-height: 60px` + bouton côte à côte, gap 10 px. Mobile : colonne, bouton `width: 100%`. Supprimer les règles du bouton rond `.maison__champ button`. Ajuster `--pied` / `min-height` de `.maison` si l'écran déborde en 1366×768.
- [ ] **Step 3: Vérifier** — push section, lire la sortie ; tester à l'écran les trois états du Review Focus : vide → erreur (`a@b`) → succès (adresse jetable). Vérifier 1440, 1366×768 et 390 px.
- [ ] **Step 4: Commit** — `feat(theme): La maison — la lettre en bandeau pleine largeur avec bouton or`

### Task 4: Envoi sur le thème non publié d'Uriel

- [ ] **Step 1:** `shopify theme push --store bilskirnir-2 --theme 200840970627 --path theme --only sections/maison.liquid --only snippets/bouton.liquid --only assets/base.css --ignore "templates/*.json" --ignore "config/settings_data.json" --ignore "sections/*-group.json" 2>&1 | grep -iE "error|invalid"` → aucune ligne.
- [ ] **Step 2:** Prévenir Uriel : les réglages existants de la section gardent leurs valeurs ; les engagements par défaut n'apparaissent que sur une section neuve (preset) — dans son template, il les ajoute dans l'éditeur (4 blocs « Engagement »), ou je les fusionne dans `templates/index.json` après `theme pull --only templates/index.json`, avec son accord.
