# Thème Liquid — accueil : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** l'accueil du nouveau thème Liquid, fidèle aux maquettes mobile et ordinateur, éditable par Gautier dans l'éditeur de thème.

**Architecture :** thème OS 2.0 parti du Skeleton Theme officiel, dans `theme/` à la racine du dépôt. Une section par écran (Ouverture, Histoire ×N, La maison), en-tête et pied de page en groupes de sections, décor fixe en snippet. Tout le visible est écrit d'après la maquette ; aucune dépendance JS, un seul petit script (`reveal.js`).

**Tech Stack :** Shopify CLI 3 (`shopify theme`), Liquid, CSS, JS natif. Polices Google Fonts.

**Spec :** `docs/superpowers/specs/2026-11-19-theme-liquid-accueil.md` · maquettes `docs/maquette-2026-11-19/Main.dc.html` (390 px) et `Main-Desktop.dc.html` (1440 px) · brief `docs/brief-theme-liquid.md`.

## Global Constraints

- Boutique `bilskirnir-2.myshopify.com`. **Jamais `shopify theme publish`**, jamais `push` sans `--unpublished` ou `--theme <id du thème de dev>`.
- Ne pas toucher `storefront/`.
- Couleurs : fond `#0b0c0e`, ivoire `#ece5d6` (jamais `#fff`), gris `#c9c7c2` / `#a7a6a2` / `#8d8b86`, or `#d2b06a` → `#b08a45`, rond de flèche `#17110a`.
- Polices : Buenard 400/700 (titres), Source Sans 3 400/600/700 (interface).
- Point de rupture ordinateur : `min-width: 1024px`. Tailles en `clamp()` entre les valeurs mobile et ordinateur de la maquette.
- Aucun prix sur l'accueil. Aucun lien sortant sauf TikTok / Instagram dans le pied de page.
- Animations : `is-active` par IntersectionObserver + transitions, boucles `@keyframes`. **Pas de `animation-timeline: view()`.** Tout coupé sous `prefers-reduced-motion: reduce`.
- Métachamps : namespace `custom`. Clés (spec) : saga `nom`, `teaser_court`, `couleur_halo` (Couleur), `mention_de_lecture`, `ordre_des_tomes` ; produit `teaser_court`, `mention_de_lecture`, `date_parution`, `couleur_halo` (Couleur) ; collection `couleur` (texte hex). Un champ vide ne casse rien : l'élément est simplement absent.
- Commits fréquents en français (`feat(theme): …`) ; **le push est fait par Uriel**.

## Review Focus

1. **Éditeur de thème** : le scroll-snap obligatoire empêche de sélectionner une section dans l'éditeur → snap désactivé quand `request.design_mode` (Task 2).
2. **Petit téléphone (360 × 640)** : « La maison » + pied de page dépassent l'écran → `min-height`, jamais `height`, sur les écrans ; tout reste atteignable au défilement (Task 6).
3. **Titres longs** (« Crépuscule d'un monde », « Parmi ces mondes ici-bas ») à 360 px : ni débordement ni mot coupé (Task 5).
4. **Données absentes** : saga sans `ordre_des_tomes`, produit sans image, aucune couleur, aucune date → écran propre, halo ivoire, pas de badge (Task 5).
5. **Inscription** : email déjà inscrit ou invalide → message lisible sur place, pas de page d'erreur (Task 6).

---

## Task 0 (Uriel, en parallèle) : créer les champs dans l'admin

Pas de code. Le thème est câblé sur ces clés dès maintenant (règle « câbler sur confiance ») et s'allume quand elles sont remplies.

- [ ] Saga : `teaser_court` (multiligne), `couleur_halo` (Couleur), `mention_de_lecture` (une ligne), `style_particules` (une ligne).
- [ ] Produit : `mention_de_lecture` (une ligne), `extrait` (fichier), `couleur_halo` (Couleur), `nombre_pages` (entier). Supprimer « Type de goodie » (0 produit).
- [ ] Saisir le **type de produit** (« Roman », « Recueil de nouvelles »), les `date_parution`, l'`ordre_des_tomes` de Crépuscule d'un monde.

---

### Task 1 : installer le Skeleton

**Files :**
- Create : `theme/` (clone du Skeleton)
- Modify : `.gitignore` (ignorer `theme/.shopify/`)

**Interfaces :**
- Produces : un thème de dev non publié dont l'**id** est noté dans `theme/README.md`, utilisé par toutes les tâches suivantes (`shopify theme dev --store bilskirnir-2 --path theme`).

- [ ] **Step 1 :** `shopify version` → noter la version. `shopify theme init theme --clone-url https://github.com/Shopify/skeleton-theme` (URL explicite : on ne dépend pas du défaut du CLI).
- [ ] **Step 2 :** `shopify theme check --path theme` → `0 offenses` (ou seulement des avertissements hérités du Skeleton, à lister dans le commit).
- [ ] **Step 3 :** `shopify theme dev --store bilskirnir-2 --path theme` → l'URL de prévisualisation s'ouvre et affiche l'accueil brut du Skeleton. Noter l'id du thème de dev dans `theme/README.md` (avec les deux commandes ci-dessus et la règle « jamais publish »).
- [ ] **Step 4 : Commit** `feat(theme): base Skeleton Theme officiel`

### Task 2 : socle visuel (couleurs, polices, décor fixe, scroll-snap)

**Files :**
- Create : `theme/assets/base.css`, `theme/snippets/decor.liquid`, `theme/assets/fond-foret.jpg`, `theme/assets/grain.png`, `theme/assets/logo-ivoire.svg` (copiés de `docs/maquette-2026-11-19/assets/`)
- Modify : `theme/layout/theme.liquid`, `theme/config/settings_schema.json`, `theme/config/settings_data.json`

**Interfaces :**
- Produces :
  - Variables CSS sur `:root` : `--encre`, `--ivoire`, `--gris-1` (`#c9c7c2`), `--gris-2` (`#a7a6a2`), `--gris-3` (`#8d8b86`), `--or`, `--or-fonce`, `--rond` (`#17110a`), `--titre` (Buenard), `--texte` (Source Sans 3).
  - Classes : `.verre` (panneau translucide), `.ecran` (écran plein : `min-height: 100svh`, `scroll-snap-align: start`), `.surtitre`.
  - `{% render 'decor' %}` : calque `position: fixed; inset: 0; z-index: -1`, contenu = forêt masquée, crêtes SVG, 2 brumes, braises du bas, 12 étincelles (valeurs reprises de la maquette lignes 68-79), grain.
  - Réglages de thème : `nouveaute_jours` (number, défaut 90), `nombre_lecteurs` (number, vide par défaut), `social_tiktok_link`, `social_instagram_link` (url).
  - `<html class="page-{{ template.name }}">` ; `.page-index` porte `scroll-snap-type: y mandatory`, **sauf** si `request.design_mode` (classe `design-mode`).

- [ ] **Step 1 :** écrire `base.css`, `decor.liquid`, brancher dans `theme.liquid` (Google Fonts en `preconnect` + feuille, `render 'decor'` en premier enfant de `body`). Les `@keyframes` du décor sont repris tels quels de la maquette ; la règle `prefers-reduced-motion` coupe toutes les animations.
- [ ] **Step 2 :** `shopify theme check --path theme` → aucune nouvelle offense.
- [ ] **Step 3 : vérification visuelle** dans `theme dev`, à 390 × 844 et 1440 × 900 : fond encre, forêt en bas, braises qui montent, grain ; le décor ne bouge pas quand on défile. Dans l'éditeur de thème, on peut défiler librement (pas de snap).
- [ ] **Step 4 : Commit** `feat(theme): socle visuel et décor fixe`

### Task 3 : en-tête, menu burger, compteur panier

**Files :**
- Create/Modify : `theme/sections/header.liquid`, `theme/sections/header-group.json`, `theme/assets/menu.js`

**Interfaces :**
- Consumes : `.verre`, variables de la Task 2.
- Produces : section `header` avec un réglage `menu` (`link_list`, défaut `main-menu`). Le lien panier pointe vers `{{ routes.cart_url }}` (le tiroir viendra avec le plan Panier) et affiche `cart.item_count` s'il est > 0.

- [ ] **Step 1 :** mobile : barre verre collante (52 px, marges 10/12 px, rayon 8 px) : burger | BILSKIRNIR | panier. Le burger est un `<button aria-expanded aria-controls>` qui ouvre un panneau verre plein écran contenant les liens du menu ; `Échap` et le lien cliqué le ferment ; le focus revient au bouton. `menu.js` fait uniquement ça.
- [ ] **Step 2 :** ordinateur (≥ 1024 px) : pilule (60 px, marges 16/40 px), grille `1fr auto 1fr` : mot-symbole | liens du menu (gris-1, 15 px, 600, écart 36 px) | panier. Burger et panneau masqués.
- [ ] **Step 3 : vérification** : à 390 px, le panneau s'ouvre, se ferme au clavier, les liens sont ceux de *Navigation › Menu principal* ; à 1440 px, les liens sont visibles en ligne. `theme check` propre.
- [ ] **Step 4 : Commit** `feat(theme): en-tête et menu`

### Task 4 : section Ouverture + snippet bouton

**Files :**
- Create : `theme/sections/ouverture.liquid`, `theme/snippets/bouton.liquid`

**Interfaces :**
- Produces : `{% render 'bouton', libelle: …, url: …, variante: 'or' | 'contour' %}`. `or` = pilule dégradé or + flèche dans le rond `--rond` + reflet animé (`bskSheen`) ; `contour` = pilule bordure ivoire 70 %, texte gras. Réutilisé par Histoire, La maison, et plus tard Arc / Livre / Panier.
- Section `ouverture`, réglages exacts de la spec (logo, titre, sous-titre, avatar, ligne fondateur ×2, note, source de la note, libellé du bouton), valeurs par défaut = textes de la maquette. Le bouton pointe vers `#histoires`.

- [ ] **Step 1 :** écrire `bouton.liquid` puis `ouverture.liquid` (classe `.ecran`). Mobile : contenu centré, bouton pleine largeur en bas, indice « Défiler » animé (`bskCue`, `aria-hidden`). Ordinateur : tout centré, titre `clamp(50px, …, 84px)`, fondateur et note côte à côte, bouton min. 340 px.
- [ ] **Step 2 : vérification** à 390 et 1440 contre `Main.dc.html` / `Main-Desktop.dc.html`, côte à côte. Champs du schéma modifiables dans l'éditeur. Image d'avatar vide → la pastille fondateur s'affiche sans image. `settings.nombre_lecteurs` = 10247 → « · 10 247 lecteurs » après la note (séparateur des milliers = espace) ; vide → mention absente.
- [ ] **Step 3 : Commit** `feat(theme): écran Ouverture et bouton`

### Task 5 : section Histoire (composant central) + snippet couverture

**Files :**
- Create : `theme/sections/histoire.liquid`, `theme/snippets/couverture.liquid`, `theme/snippets/badge-nouveaute.liquid`

**Interfaces :**
- Consumes : `bouton` (Task 4), `.ecran`, `.surtitre`, `settings.nouveaute_jours`.
- Produces :
  - `{% render 'couverture', produit: p, taille: 'eventail' | 'seule', position: 1 | 2 %}` : `image_url` + `srcset` (largeurs 320/480/640), `alt` = « Couverture : {{ titre }} », flottement `bskFloat` (position 1) / `bskFloat2` (position 2). Produit sans image → rien.
  - `{% render 'badge-nouveaute', date: d %}` : affiche la pastille or « ★ Nouveauté » si `d` est à moins de `settings.nouveaute_jours` jours, sinon rien.
  - Section `histoire` : réglages `saga` (`metaobject`, `metaobject_type: "saga"`), `livre` (`product`), `libelle_bouton` (text). Le premier écran Histoire de la page porte `id="histoires"` (ancre du bouton de l'Ouverture).

Règles de données (copiées de la spec, à appliquer à la lettre) :

| | Saga choisie | Sinon livre |
|---|---|---|
| Couvertures | 2 premiers de `saga.ordre_des_tomes.value` en éventail ; 1 seul → `seule` | image du produit, `seule` |
| Surtitre gauche | « {{ n }} livre(s) », n = taille de la liste | `product.type` |
| Surtitre droite | `saga.mention_de_lecture` | `product.metafields.custom.mention_de_lecture` |
| Titre / accroche | `saga.nom` / `saga.teaser_court` | `product.title` / `custom.teaser_court` |
| Couleur | `saga.couleur_halo` | `custom.couleur_halo`, sinon `custom.univers.value.metafields.custom.couleur` |
| Nouveauté | la plus récente `date_parution` des tomes | `custom.date_parution` |
| Lien + libellé | `saga.system.url` si la saga a une page, sinon le 1er tome ; « Entrer dans l'arc » | `product.url` ; « Voir le livre » |

Couleur absente → `#ece5d6`. Halo = `couleur | color_modify: 'alpha', 0.25` (mobile) / `0.4` (ordinateur, comme la maquette) ; surtitre = `couleur | color_lighten: 20`. Les deux parties du surtitre sont jointes par « · » seulement si les deux existent. Ni saga ni livre choisis → la section ne rend rien (sauf dans l'éditeur : message « Choisis une saga ou un livre »).

- [ ] **Step 1 :** écrire `couverture`, `badge-nouveaute`, puis `histoire`. Mobile : couvertures en haut (éventail 160 px chevauchées de -44 px, seule 210 px), texte dessous, halo centré derrière. Ordinateur : grille 2 colonnes, **texte à gauche, couvertures à droite** (éventail 260 px, chevauchement -70 px, seule 300 px), halo de 860 px derrière les couvertures. Titres `clamp(48px, …, 72px)`, `text-wrap: balance`, `overflow-wrap: break-word`.
- [ ] **Step 2 : préparer les cas de test** dans `theme/templates/index.json` (6 sections Histoire dans l'ordre de la maquette) : De l'Eau et du Sang (saga, 2 tomes), Fracture (saga), Salvation (livre), Crépuscule d'un monde (saga sans tomes aujourd'hui), Berserker (livre), Parmi ces mondes ici-bas (livre).
- [ ] **Step 3 : vérification** à 360, 390 et 1440 px :
  - De l'Eau et du Sang : éventail de 2, « 2 LIVRES · … », bouton « Entrer dans l'arc ».
  - Salvation / Berserker : grande couverture seule, « Voir le livre ».
  - Crépuscule (sans tomes) : pas de couverture, pas de badge, titre et bouton présents, rien de cassé.
  - Couleur vide → halo ivoire discret. Mettre temporairement une `date_parution` d'hier sur Le Réveil (via l'admin) → badge visible ; la retirer → badge parti.
  - « Parmi ces mondes ici-bas » à 360 px : aucun débordement horizontal.
  - `theme check` propre.
- [ ] **Step 4 : Commit** `feat(theme): écran Histoire, couverture, badge nouveauté`

### Task 6 : section La maison + inscription

**Files :**
- Create : `theme/sections/maison.liquid`

**Interfaces :**
- Consumes : `.verre`, `bouton`, `.ecran`.
- Produces : section `maison` avec les réglages de la spec (surtitre, présentation `richtext`, prochain salon + lien, page « à la française » + libellé, titre inscription) et blocs `personne` (`image`, `nom`, `role`, `max_blocks: 2`).

- [ ] **Step 1 :** écrire la section. Ligne salon rendue seulement si le texte est rempli ; lien seulement si l'url est remplie. Inscription : `{% form 'customer' %}` avec `contact[tags]=newsletter` ; après envoi, `form.posted_successfully?` → « C'est noté, tu recevras les sorties. » ; `form.errors` → message d'erreur dans le formulaire (`role="alert"`). Ancre `#maison` pour que le retour du formulaire ramène sur l'écran. Mobile : une colonne, contenu calé en bas. Ordinateur : grille `1.2fr 1fr`, écart 80 px.
- [ ] **Step 2 : vérification** : à 360 × 640, tout le contenu de la section et du pied de page est atteignable au défilement. Inscription avec un email neuf → message de succès, client visible dans l'admin avec le tag `newsletter`. Même email une deuxième fois → pas de page d'erreur. Salon vide → ligne absente.
- [ ] **Step 3 : Commit** `feat(theme): écran La maison et inscription aux sorties`

### Task 7 : pied de page

**Files :**
- Modify : `theme/sections/footer.liquid`, `theme/sections/footer-group.json`

**Interfaces :**
- Consumes : `settings.social_tiktok_link`, `settings.social_instagram_link`.
- Produces : section `footer` avec un réglage `menu` (`link_list`, défaut `footer`). TikTok / Instagram (rendus seulement si l'url est remplie, `rel="noopener"`), liens du menu en gris-3, « © Bilskirnir » ; filet supérieur ivoire 10 %. Sur l'accueil, il s'affiche dans l'écran de La maison (pas de snap propre) ; sur une autre page, il est autonome.

- [ ] **Step 1 :** écrire la section. Mobile : deux lignes. Ordinateur : une ligne, réseaux à gauche, liens à droite.
- [ ] **Step 2 : vérification** à 390 / 1440 contre la maquette ; réseau sans url → absent ; menu `footer` modifié dans l'admin → reflété.
- [ ] **Step 3 : Commit** `feat(theme): pied de page`

### Task 8 : apparitions au défilement

**Files :**
- Create : `theme/assets/reveal.js`
- Modify : `theme/assets/base.css`, `theme/layout/theme.liquid`

**Interfaces :**
- Produces : tout élément `[data-reveal]` reçoit `is-active` quand son `.ecran` est visible à 35 % (IntersectionObserver, `threshold: 0.35`). CSS : état de départ `opacity: .2; transform: translateY(48px) scale(.96)`, transition 0,6 s vers l'état normal. Sans JS ou sous `prefers-reduced-motion` : contenu visible directement.

- [ ] **Step 1 :** écrire `reveal.js` (chargé en `defer`) et poser `data-reveal` sur les blocs texte des sections Histoire et La maison.
- [ ] **Step 2 : vérification** : au défilement, le texte de chaque écran monte à son arrivée. JS désactivé (DevTools) → tout est visible. `prefers-reduced-motion` émulé → rien ne bouge, braises et brume comprises.
- [ ] **Step 3 : Commit** `feat(theme): apparitions au défilement`

### Task 9 : assemblage final et thème de dev en ligne

**Files :**
- Modify : `theme/templates/index.json` (ordre final : Ouverture, 6 Histoire, La maison), `_ContexteIA/xo-status.md`

- [ ] **Step 1 :** comparer l'accueil complet à `Main.dc.html` et `Main-Desktop.dc.html`, écran par écran, à 390 et 1440 ; noter les écarts restants dans `_ContexteIA/xo-status.md`.
- [ ] **Step 2 :** `shopify theme push --path theme --unpublished` (ou `--theme <id>` si le thème existe déjà) → noter l'URL de prévisualisation pour Uriel. **Ne pas publier.**
- [ ] **Step 3 :** `/graphify --update` (plus de 5 fichiers ajoutés).
- [ ] **Step 4 : Commit** `feat(theme): accueil complet sur thème non publié`
