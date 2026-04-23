---
title: Bilskirnir — Boutique en ligne (design spec)
date: 2026-04-23
status: draft
stack: Shopify + Hydrogen + Oxygen
tags: [bilskirnir, shopify, hydrogen, ecommerce, design-spec, edition]
---

# Bilskirnir — Boutique en ligne

> Document de design validé en brainstorming le 23 avril 2026.
> À réviser par l'utilisateur avant d'écrire le plan d'implémentation.

---

## 1. Contexte et objectif

### 1.1 Le projet

Refonte complète de la boutique en ligne de **Bilskirnir**, maison d'édition française indépendante dirigée par l'auteur **Gautier Durieux de Madron**. La boutique actuelle sur WordPress est cassée et **rien ne sera réutilisé**.

Communauté existante autour de Gautier : **~140 000 abonnés TikTok**, **~20 000 abonnés Instagram**. La boutique doit être un canal de conversion premium pour cette audience, pas une boutique générique.

### 1.2 Promesse UX

**« Un Netflix des univers littéraires »** — pas un slider cinématique avec un "livre du mois" mis en avant, mais un **stand de libraire numérique** où toutes les œuvres cohabitent à égalité, présentées comme autant de portes d'entrée vers des univers narratifs distincts.

> [!important] Pas de « héros à la con »
> Aucune œuvre ne doit être visuellement sacralisée au-dessus des autres en homepage. Le catalogue est le héros, pas un livre en particulier. Référence esthétique : **runesdechene.com**.

### 1.3 Scope MVP

**Dans le scope v1** :

- Catalogue complet (livres physiques, livres numériques, goodies)
- Checkout Shopify Payments + PayPal + Apple/Google Pay
- Comptes clients
- Bundles sagas complètes
- Précommandes et notifications « me prévenir à la sortie »
- Service de dédicace à l'achat (par livre, +5 €, nom du dédicataire)
- Expédition mondiale (Gautier envoie lui-même)
- TVA livres 5,5 % · goodies 20 % (EI au réel)

**Hors scope v1 (v2 ou plus tard)** :

- Éditions collector / tirages limités / jaquettes alternatives
- Blog / actualités éditoriales
- Hub communauté (embeds TikTok/Instagram dans le site)
- Recherche full-text avancée
- Programme de fidélité
- Illustrations panoramiques dédiées par saga (`saga_hero_image` metafield réservé, pas exploité au launch)

---

## 2. Identité éditoriale — catchphrases et textes à préserver

> [!note] À valider avec Gautier
> Les textes ci-dessous ont été produits pendant le brainstorming pour caler le ton. Le **ton et la structure** ont été validés par l'utilisateur ; le **contenu littéral** (en particulier les synopses, noms de personnages, citations de lore) doit être validé ou remplacé par Gautier avec ses propres textes avant mise en ligne.

### 2.1 Tagline principale de la maison

> « Des récits héroïques, sans compromis. »

À utiliser en homepage (sous le header) et en tête de page « La maison ».

### 2.2 Manifeste éditorial (page « La maison »)

**Headline :**

> Nous éditons des récits héroïques sans compromis.

**Sous-titre :**

> « L'héroïsme, la bravoure, le sacrifice. Une voix française, sans concession, pour réenchanter le roman populaire. »

**Paragraphes « Pourquoi nous existons » :**

> Le roman héroïque français contemporain a été abandonné par l'édition dominante. Entre les romans introspectifs primés et les blockbusters traduits, il n'y a plus grand-chose pour les lecteurs qui cherchent du souffle, de la chair, des enjeux plus grands que soi.
>
> Bilskirnir édite ce qui manquait. Des univers longs, des sagas denses, des personnages qui ne s'excusent pas d'exister. Une voix française qui assume ses racines nordiques autant que méditerranéennes.

### 2.3 Les 4 piliers de la maison

| Pilier | Description |
|---|---|
| ⚔ **Héroïsme sans compromis** | Des personnages qui agissent, choisissent, échouent parfois. Pas d'antihéros désabusés pour le confort moderne. |
| 🏛 **Mythes et racines** | Nos récits puisent dans les mythologies vivantes — nordique, gréco-romaine, celte. Ce qui a nourri mille ans de littérature occidentale. |
| 🇫🇷 **Une voix française** | Écrits en France, imprimés en France, pensés depuis une sensibilité qui n'a pas à emprunter ses codes ailleurs. |
| ✒ **Indépendance éditoriale** | Maison indépendante, modèle direct-au-lecteur. Pas de distributeur qui dicte, pas de comité qui lisse. |

### 2.4 Lore univers — *Au Nom des Dieux*

**Citation hero :**

> « Quand les dieux se sont tus, le monde n'a pas cessé de tourner. Mais leur silence, lui, parle encore — à ceux qui portent leur sang. »

**Description :**

> *Au Nom des Dieux* est une mythologie moderne où les divinités antiques n'ont pas disparu : elles se sont retirées, laissant l'humanité se débrouiller avec ses démigods — ces héritiers dispersés qui découvrent leur filiation dans la douleur. Gautier Durieux de Madron y construit un univers dense, traversé de plusieurs sagas parallèles.

### 2.5 Textes de sagas (proposés, à valider)

**Saga *L'Eau et du Sang* (duologie)**

Teaser fiche produit :
> « Quand les dieux se taisent, restent les fils qu'ils ont abandonnés. Quatre démigods, une dette de sang, et un monde qui ne croit plus. »

Description saga :
> La saga fondatrice de l'univers. Quatre démigods du bassin méditerranéen découvrent leur filiation au moment où les forces endormies se réveillent. Une duologie dense qui pose toutes les règles mythologiques.

Synopsis long (à réécrire par Gautier) :
> Les dieux ne répondent plus. Depuis combien de siècles ? Personne ne sait. Les hommes ont continué à construire, aimer, mourir — comme si de rien n'était. Mais dans les marges, des enfants naissent encore avec du sang divin dans les veines. Quatre d'entre eux vont se rencontrer.

**Saga *Salvation* (urban fantasy)**

> Itération urban fantasy de l'univers, dans la Marseille contemporaine. Les dieux anciens ressurgissent là où on les attend le moins.

**Saga *Fracture* (uchronie)**

> Quand un démigod remonte le fil du temps pour changer le XXe siècle. Seconde Guerre mondiale, mythologie, voyages temporels.

**Saga *Crépuscule d'un monde* (annoncée 2026)**

> Le chapitre final de l'univers. La fin annoncée des dieux.

### 2.6 Roman indépendant — *Berserker*

Teaser hero :
> « Nice, été. La chaleur est la même qu'avant. La mer aussi. Les morts, eux, ont changé. »

Atmosphère :
> *Berserker* se lit d'une traite. C'est un huis-clos sous soleil écrasant, un récit de survie qui refuse les codes du genre zombie pour les remplacer par quelque chose de plus intime : la peur ordinaire, la solitude, la tentation du repli.

### 2.7 Copy de footer / newsletter

> **Restez dans l'univers**
> Annonces de sortie, précommandes, behind-the-scenes. Pas de spam. Pas de tracking.

---

## 3. Stack technique

### 3.1 Architecture retenue

| Composant | Technologie | Justification |
|---|---|---|
| **Backend commerce** | Shopify (plan Basic, 27 €/mois) | Admin mature, Shop Pay, metaobjects, gestion fiscale native |
| **Storefront** | Hydrogen (React + Remix) | Liberté de design totale, dev workflow local propre (`npm run dev`) |
| **Hébergement storefront** | Oxygen (inclus Shopify) | Déploiement edge `shopify hydrogen deploy`, zéro config |
| **Paiement** | Shop Pay + PayPal + Apple/Google Pay | Tous natifs Shopify, Shop Pay = meilleur taux de conversion du marché |
| **Assets visuels HD** | Supabase Storage (option) | Déjà utilisé par l'utilisateur sur d'autres projets |

### 3.2 Rejets explicites et pourquoi

- **Shopify thème Liquid classique** → workflow Shopify CLI (`theme push/pull`) jugé pénible par l'utilisateur (bugs de sync, preview capricieuse). Hydrogen offre un vrai workflow React local.
- **Medusa.js self-hosté** → trop de ops à la charge de l'utilisateur (serveur, backups, Redis, sécurité) pour un ROI faible vs Shopify. Abandonné après comparaison pragmatique.
- **WooCommerce / WordPress** → hors course (la boutique existante dessus étant cassée).

---

## 4. Modèle de données

### 4.1 Principe directeur

**« Tout livre a un univers »**, implicite ou explicite. Le niveau *saga* est optionnel.

### 4.2 Mapping Shopify

| Concept métier | Entité Shopify | Metafields clés |
|---|---|---|
| **Univers** | Collection | `hero_image` (illustration HD pleine largeur), `lore` (rich text), `theme_color`, `sagas` (liste de metaobjects Saga), `homepage_order` (int), `is_standalone_bucket` (bool — true pour la collection « Romans indépendants ») |
| **Saga** | Metaobject | `synopsis`, `tome_order`, `parent_universe` (ref collection), `saga_hero_image` (optionnel, non exploité v1) |
| **Tome / Livre** | Product | `universe` (ref collection), `saga` (ref metaobject, optionnel), `tome_number` (int, optionnel), `is_standalone` (bool), `release_status` (enum), `release_date` (date), `teaser_short`, `synopsis_long` |
| **Romans indépendants** | Collection Shopify « Romans indépendants » | Collection réelle (smart collection basée sur la règle `product.is_standalone = true`). Traitée visuellement comme un univers sur la home et dans le mega-menu, mais la fiche produit utilise le template one-shot immersive, pas une page collection. |
| **Goodies** | Product | `linked_universe` (ref collection, optionnel), `goodie_type` (ex-libris · illustration · marque-page · coffret) |

### 4.3 Les 3 cas métier absorbés par le modèle

1. **One-shot** (ex. *Berserker*) → Product avec `is_standalone = true`. Listé dans la pseudo-collection « Romans indépendants ». Page produit = template immersive.
2. **Univers sans sagas** (ex. *Fracture* à 2 tomes directs) → Collection Univers + Products avec `universe` set, `saga` vide. Page univers affiche directement la grille de tomes.
3. **Univers avec sagas** (ex. *Au Nom des Dieux*) → Collection Univers + Metaobjects Saga référencés dans `sagas` + Products avec `universe` + `saga`. Page univers affiche des sections par saga.

### 4.4 Statuts de release

Metafield `release_status` sur Product, 3 valeurs :

- **`published`** — disponible à l'achat, UX standard (prix + « AJOUTER AU PANIER »)
- **`preorder`** — précommande ouverte, badge doré « PRÉCO » + date de sortie + bouton « PRÉCOMMANDER »
- **`announced`** — pré-annoncé sans date, silhouette « à paraître » + champ email inline « Me prévenir à la sortie »

Gautier change le statut dans l'admin Shopify, le front s'adapte automatiquement.

---

## 5. Commerce et opérations

### 5.1 Paiement

- **Shop Pay** (Shopify Payments, CB) — le rail principal
- **PayPal**
- **Apple Pay / Google Pay** (natifs Shopify)

### 5.2 Livraison

- **Monde entier**, expédition par Gautier depuis son domicile (France)
- Zones de tarification à configurer dans Shopify : France métro / Europe / Monde
- Intégration étiquettes via **Sendcloud** ou **Boxtal** (à trancher à l'implémentation)

### 5.3 TVA

- **Livres : 5,5 %**
- **Goodies : 20 %**
- EI au réel, facturation électronique via Shopify ou app dédiée (à trancher)

### 5.4 Dédicaces

Service payant à l'achat, **+5,00 €** par livre, configurable via :

- **Checkbox « Dédicacer ce livre »** sur la fiche produit (déploie un champ texte « À qui dédicacer ? »)
- **Implémentation Shopify** : une line item property `{dedicace_activee, dedicace_nom}` + surcoût appliqué via **Shopify Functions (cart transform)** ou via un produit « service de dédicace » invisible ajouté en ligne cachée
- Gautier voit dans sa commande le livre + la propriété « Dédicace : À Marie » → il sait quoi signer

### 5.5 Précommandes et notifications

- **Précommandes** : app **Shopify Preorder Manager** (~10 $/mois, natif Shopify)
- **Notifications de sortie** : **Shopify Back in Stock** (gratuit) en v1 ; option **Klaviyo** en v2 si besoin CRM plus poussé

### 5.6 Produits proposés

- **Livres physiques** (cœur)
- **Livres numériques** (epub/pdf, livraison digitale via app type Sky Pilot)
- **Goodies** : ex-libris signés, illustrations A3, marque-pages, coffrets univers

---

## 6. Langage visuel

### 6.1 Direction artistique

- **Dark mode global** — fond sombre uni sur tout le site, dégradés subtils entre sections permis mais toujours sombres. Pas de toggle, pas de mode clair.
- **Les couvertures flottent** sur le fond avec ombre portée chaude
- **Accents dorés / bronze** (~`#fbbf24`) pour les labels, pastilles et CTAs secondaires
- **Typo serif** (ex. Georgia, ou serif plus distinctive à choisir) pour les titres d'œuvres
- **Sans-serif** pour les métadonnées, labels, nav
- **Ornements doré** (`◈ ◈ ◈`) pour séparer les sagas
- **Les illustrations de Gautier / de l'utilisateur** (illustrateur) occupent les heros d'univers et, à terme, éventuellement les bannières sagas

### 6.2 Règles de mise en avant

- Homepage : toutes les œuvres au même niveau visuel (stand)
- Page univers : le hero bannière illustré porte l'identité visuelle de l'univers
- Sagas : traitement typo-driven (pas d'illustration propre à la saga en v1)

---

## 7. Pages et templates

### 7.1 Homepage — « Stand de libraire numérique »

**Structure verticale** :

1. **Header mince** (logo centré + nav gauche / actions droite)
2. **Tagline sobre** une ligne (« Des récits héroïques, sans compromis »)
3. **Slideshow des œuvres** — **LE bloc dominant**. Carrousel horizontal de tuiles œuvres, toutes au même niveau. Fond sombre earthy (effet « stand la nuit »). Ordre manuel via metafield `homepage_order` (entier) sur la collection univers et sur les produits standalone. Gautier édite la valeur dans l'admin Shopify pour contrôler le tri ; tuiles triées ascendantes, valeur vide → exclue du slideshow.
4. **Section « À paraître »** — ligne horizontale des prochaines sorties (3-4 tomes annoncés) avec date, univers de rattachement, bouton précommande ou notify-me
5. **Bloc « Valeurs maison »** — 4 icônes + mots-clés (style Runes de Chêne)
6. **Grille « Tout le catalogue »** — pour SEO et visiteurs qui veulent tout voir sans scroller le carrousel
7. **Footer**

**Types de tuiles dans le slideshow** :

| Type | Rendu visuel | Cas |
|---|---|---|
| Univers 1 tome visible | Couverture seule | — |
| Univers 2-3 tomes | Couvertures **empilées** avec légère rotation (pile de livres) | *L'Eau et du Sang* |
| Univers 4+ tomes | Pile + badge doré « +N » | — |
| Roman indépendant / recueil / guide | Couverture seule + pastille dorée (ROMAN / RECUEIL / GUIDE) | *Berserker* |

### 7.2 Page univers — `/collections/:handle`

**Structure** :

1. **Hero bannière 380-420 px** — illustration dédiée de l'univers (créée par l'utilisateur/Gautier) + titre univers + citation lore + stats (« 4 sagas · 6 tomes · en cours »)
2. **Sections par saga** (si sagas) ou **grille de tomes** (si pas de sagas)
   - Header saga typo-driven : label (SAGA · TYPE · N TOMES) → ornement ◈ → titre serif → synopsis italique → CTA « Acheter la saga complète » (si bundle actif)
   - Grille des tomes de la saga (2-4 colonnes selon breakpoint)
   - Gestion tomes `preorder` / `announced` / `published` dans la même grille
3. **Séparateurs ornementaux** `◈ ◈ ◈` entre sagas
4. **Section « Produits dérivés de cet univers »** — grille de 4 goodies liés
5. **Footer « Découvrir un autre univers »** — tuiles œuvres

### 7.3 Template fiche tome — `/products/:handle` (pour tomes d'un univers)

**Structure verticale, max-width 1000 px** :

1. **Fil d'Ariane** (Accueil › Univers › Saga › Tome)
2. **Bloc 2 colonnes 55/45** :
   - Gauche : couverture principale + galerie thumbnails (recto, dos, intérieur, illustration)
   - Droite : badge contexte · titre · **teaser court** italique en sidebar dorée · prix · 6 badges valeurs · bloc dédicace · quantité · CTAs (Ajouter au panier + Shop Pay) · lien « Lire un extrait (10 pages) »
3. **Section Synopsis pleine largeur** — vrai 4e de couverture, 15-25 lignes, typo serif aérée, max-width 720 px
4. **Section « Dans l'univers de [Nom] »** — bandeau visuel univers + 3 sous-blocs (L'univers, La saga, Place de ce tome) + CTA « Explorer l'univers complet »
5. **Fiche technique** — grille 4 colonnes (format, pages, ISBN, parution, papier, poids, langue, éditeur)
6. **Related « Dans le même univers »** — 3 autres tomes/œuvres + 1 goodie de l'univers

### 7.4 Template fiche one-shot immersive — `/products/:handle` (pour romans indépendants)

**Différences vs fiche tome** :

- **Hero bannière illustré 380 px** en tête (comme une page univers, mais pour un seul livre) avec badge « ROMAN INDÉPENDANT » + titre + teaser
- Bloc achat compact (45/55) en dessous de la bannière
- Section **« L'atmosphère du livre »** remplace « Dans l'univers de » (puisqu'il n'y a pas d'univers)
- Section Synopsis identique
- Related « Autres romans indépendants » en bas (à la place de « Dans le même univers »)

### 7.5 Page « La maison » — `/pages/la-maison`

1. **Hero tagline** : « Nous éditons des récits héroïques sans compromis » + citation sous-titre
2. **Bloc manifeste « Pourquoi nous existons »** (2 paragraphes)
3. **Grille 4 piliers** (Héroïsme · Mythes et racines · Voix française · Indépendance éditoriale)
4. **Bloc « L'auteur fondateur »** — photo circulaire + bio courte + liens TikTok/Instagram

### 7.6 UX dédicace (rappel)

Sur toutes les fiches produit livre : checkbox discrète « Dédicacer ce livre (+5,00 €) » qui déplie un champ texte « À qui dédicacer ? ». Prix du CTA s'ajuste en temps réel.

---

## 8. Navigation globale

### 8.1 Header

Structure 3 colonnes fixe :

- **Gauche** : Œuvres ▾ · Univers ▾ · Goodies · La maison
- **Centre** : Logo « BILSKIRNIR » (typo serif, tracking large, doré)
- **Droite** : 🔍 Search · Compte · **Panier (N)** (en doré)

### 8.2 Mega-menu « Univers »

Déroule une grille 4 colonnes catégorisées :

- **Univers en cours** (Au Nom des Dieux, Fracture, etc.)
- **Romans indépendants** (Berserker, Parmi ces mondes…)
- **À paraître** (Crépuscule d'un monde, 2026)

### 8.3 Footer

4 colonnes :

- **Bloc newsletter** (double-colonne, large) — champ email + bouton
- **Boutique** : Œuvres · Univers · Goodies · À paraître
- **La maison** : Notre mission · L'auteur · Contact · Presse
- **Info** : Livraison · Retours · Mentions légales · CGV

Barre copyright + liens socials (TikTok / Instagram / YouTube).

---

## 9. Contenu hors scope v1 (explicitement)

- **Éditions collector / tirages limités** — Gautier n'a pas confirmé de roadmap collector. Réactivé en v2 si demandé.
- **Pages sagas dédiées** — une saga = une section dans sa page univers, pas d'URL propre `/collections/saga-X`.
- **Blog / actualités éditoriales** — prévu v2 pour SEO + fidélisation.
- **Hub communauté (embeds TikTok/Instagram)** — v2.
- **Programme fidélité / points / parrainage** — pas évoqué.
- **Recherche full-text avancée** — search Shopify native suffit en v1.
- **Illustrations dédiées par saga** — metafield `saga_hero_image` réservé, mais non exploité v1 (fallback typo-driven).

---

## 10. Questions à valider avant implémentation

- [ ] **Textes éditoriaux** : tous les synopses, citations et extraits de ce spec doivent être relus / remplacés par Gautier.
- [ ] **Illustrations univers** : qui les produit, dans quel délai ? (Utilisateur + Gautier, calendrier à préciser.)
- [ ] **Catalogue réel** : collecter liste définitive des tomes, ISBN, prix, dates de parution, formats, couvertures HD.
- [ ] **Photo Gautier** pour page « La maison ».
- [ ] **Textes personnels Gautier** : bio auteur, piliers de la maison reformulés à sa voix.
- [ ] **Livraison** : choix final Sendcloud vs Boxtal vs autre.
- [ ] **Facturation électronique** : quelle app Shopify pour conformité EI au réel ?
- [ ] **Livres numériques** : formats (epub/pdf/mobi ?) + DRM ou pas ?
- [ ] **Précommandes** : confirmer que Shopify Preorder Manager couvre bien tous les besoins, ou faut-il une app plus riche ?

---

## 11. Références visuelles

- **Inspiration UX générale** : [runesdechene.com](https://runesdechene.com) — stand de produits, hiérarchie typographique, storytelling > specs
- **Maquettes brainstorming** : `.superpowers/brainstorm/16170-*/content/*.html` (conservées pour référence)
- **Fiche produit modèle** : runesdechene.com/products/morrigan-sweatshirt-premium (pour le storytelling et le max-width)

---

## 12. Historique de décision

Points clés actés pendant le brainstorming, par ordre chronologique :

1. **Stack Shopify + Hydrogen** retenue après avoir rejeté Medusa (ops trop lourd) puis Shopify Liquid classique (workflow CLI pénible). Hydrogen gagne pour la liberté de dev React + Shopify admin pour la robustesse.
2. **Modèle Univers/Saga/Tome** validé : Collection / Metaobject / Product. Le niveau saga est optionnel.
3. **One-shots** traités comme produits avec `is_standalone`, regroupés dans une pseudo-collection « Romans indépendants » pour la navigation, mais avec une **page produit immersive** (hero bannière illustré) qui reprend les codes d'une page univers.
4. **Homepage « stand de libraire »** : pas de hero cinématique, slideshow d'œuvres au même niveau visuel. Ordre manuel par Gautier via metafield `homepage_order`.
5. **Dark mode global** uniforme, accents dorés, couvertures flottantes.
6. **Tuiles œuvres** : stack de couvertures pour univers multi-tomes, couverture seule + pastille dorée pour standalones.
7. **Fiche produit tome** : teaser court à droite (sidebar dorée) + synopsis long en section pleine largeur + section « Dans l'univers de » riche en contexte narratif.
8. **Sagas** : traitement typo-driven (pas d'illustration propre) avec ornement `◈`. Le stack de couvertures a été retiré car redondant avec la grille de tomes en dessous.
9. **3 statuts tome** : published / preorder / announced, pilotés par un seul metafield `release_status`.
10. **Hero univers** = illustration dédiée (une par univers, pas une par saga).
