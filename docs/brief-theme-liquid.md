# Brief : thème Shopify Liquid de Bilskirnir

> Rédigé par l'Augure le 19/11/2026, après validation de la maquette par Uriel.
> À lire en entier avant toute ligne de code. Les décisions ci-dessous priment sur les anciennes règles du dépôt (Hydrogen, palette « encre » sans or, Bricolage/Inter) : elles sont dépassées.

## Le but

Une boutique mobile d'abord, en **thème Liquid Online Store 2.0**, que **Gautier modifie seul** depuis l'éditeur de thème (sections et blocs). Le trafic vient presque uniquement du **lien en bio TikTok** de Gautier : ses vidéos parlent de mythologie, pas de ses livres. Le visiteur arrive sans connaître les romans. La boutique doit lui donner envie d'une histoire, puis l'amener à l'arc complet.

Boutique : `bilskirnir-2.myshopify.com` (forfait Basic). Le dossier `storefront/` (Hydrogen) est abandonné : n'y touche pas, mais sa logique peut inspirer (dédicace, bundles, panier).

## La maquette validée

`docs/maquette-2026-11-19/` : cinq pages au format Claude Design (HTML avec styles en ligne, valeurs `{{…}}` calculées dans le script en bas de fichier). C'est la **référence visuelle**, pas du code à copier. Les images sont dans `assets/`. En ligne : https://claude.ai/artifact/L5WR448CMwVWJ6HhCmYEUZ

| Fichier | Template Shopify |
|---|---|
| `Main.dc.html` | `index` |
| `Arc.dc.html` | page d'une saga ou d'un arc (collection ou metaobject `saga`, à trancher en plan) |
| `Livre.dc.html` | `product` |
| `Panier.dc.html` | tiroir panier |
| `Valeurs.dc.html` | `page.valeurs` (« Pourquoi « à la française » ? ») |

Versions ordinateur (1440 px), validées le 19/11 : `Main-Desktop`, `Arc-Desktop`, `Livre-Desktop`, `Panier-Desktop` (le panier devient un tiroir à droite), `Valeurs-Desktop`. Même décor, même contenu : le thème est un seul code responsive, pas deux templates.

## Direction artistique (validée le 19/11/2026)

- Fond encre `#0b0c0e`. Texte et titres ivoire `#ece5d6`, **jamais de blanc pur** (sauf les logos Shop Pay et Apple Pay). Gris de texte secondaire `#c9c7c2` et `#a7a6a2`.
- Accent **or antique** `#d2b06a` (dégradé vers `#b08a45`) pour les boutons d'achat. Rouge, orange et blanc ont été refusés pour les boutons.
- Boutons en **pilule**, avec une flèche dans un rond sombre `#17110a`. Panneaux en verre (fond translucide + flou).
- Polices : **Buenard** (titres) et **Source Sans 3** (interface), via Google Fonts.
- Décor : la forêt du roll-up en fond discret, crêtes de montagnes, brume, **braises CSS** qui montent, grain. Sur l'accueil, ce décor est **fixe** et seul le contenu défile.
- **Halo par histoire**, de la teinte de sa couverture. Une saga pourra plus tard avoir sa propre image de fond et son propre style de particules : deux champs facultatifs, sinon le décor par défaut.
- Animations : préférer une classe `is-active` posée par IntersectionObserver + transitions CSS, et des boucles `@keyframes`. `animation-timeline: view()` ne marche pas dans un conteneur scroll-snap (déjà vécu sur ce dépôt). Tout couper sous `prefers-reduced-motion`.

## Contenu et règles commerciales

- **L'accueil parle des histoires, pas des univers.** Un écran plein par histoire (De l'Eau et du Sang, Fracture, Salvation, Crépuscule d'un monde, Berserker, Parmi ces mondes ici-bas), badge « Nouveauté » sur les sorties récentes, **aucun prix sur l'accueil**. Mentions de lecture : « Se lit seul », ou « Idéalement après les deux premiers » pour Salvation. L'explication de l'univers Au Nom des Dieux ira sur une page du menu.
- Couverture plus grande quand l'écran ne montre qu'un livre.
- **Arc complet** : tous les tomes en un clic, livraison offerte. **Aucun cadeau sur les ventes en ligne** (Uriel, 20/11/2026). On peut aussi acheter le Livre 1 seul (lien « ou Livre 1 · 25 € »).
- **Livraison offerte dès 40 € en point relais.** Sous 40 €, le client paie la livraison, calculée à l'étape suivante. **Loi Lang** : aucune remise au-delà de 5 %, et au moins 3 € de port sous 35 €.
- Preuve sociale : **4,7/5 sur Amazon**, tous livres confondus. Plus tard, un agrégateur d'avis maison (avec le futur hub).
- **Dédicace offerte** par Gautier sur les commandes en ligne (champ « À qui ? » → propriété de ligne du panier). **Extrait** du Livre 1 à lire (bouton « Lire les premières pages »).
- **Aucun lien qui sort de la boutique** près de l'achat (ni réseaux de Gautier, ni sites d'Uriel). TikTok et Instagram seulement en pied de page.
- Écran « La maison » : présentation de Gautier (« romancier, expert en mythologie, conférencier et vulgarisateur en ligne »), deux cartes Gautier / Uriel Lahoussaye (direction artistique et couvertures), ligne « Prochain salon » (une seule ligne, cachée s'il n'y a rien ; données venant plus tard de Fellowship), inscription aux sorties.
- Glazier est retiré de la boutique pour l'instant.

## Données Shopify

Le modèle existant est conservé : voir `docs/shopify/data-model.md` (univers = collection, saga = metaobject `saga`, tome = produit, `est_une_oeuvre_independante`, metaobject `bundles`). Clés réelles du metaobject `saga` : voir `.claude/rules/workflow.md` (`illustration_hero_de_la_saga`, etc.).

À ajouter (proposer les clés exactes dans le plan, Uriel les crée dans l'admin) : teinte du halo par histoire, mention de lecture, badge nouveauté (date ou booléen), extrait (fichier), fond et particules facultatifs par saga, nombre de pages. Règle du dépôt : quand une entité n'existe pas encore, câbler quand même avec la clé la plus probable et masquer proprement si elle est vide.

## Méthode

1. **Lire** `_Socle/Méthode.md` dans le vault (code simple, une chose répétée = un seul composant, sonder avant de supposer), puis ce brief et la maquette.
2. **Spec puis plan** dans `docs/superpowers/` (comme les précédents), page par page, **validés par Uriel avant de coder**.
3. Développer sur un **thème non publié** (`shopify theme dev`, puis `shopify theme push --unpublished`). **Jamais publier le thème en ligne** : c'est Uriel qui décide.
4. Commits fréquents, push par lots, faits par Uriel. Lancer `/graphify --update` en fin de lot.
5. Tenir `_ContexteIA/xo-status.md` à jour en fin de session, et noter les questions ouvertes en bas de ce brief : l'Augure les lit.

## Questions ouvertes

- Nombre de pages de chaque livre (Uriel le saisit dans Shopify).
- Arc : template collection ou page metaobject ? À trancher dans le plan.

### Questions de XO sur l'accueil (19/11/2026, spec `docs/superpowers/specs/2026-11-19-theme-liquid-accueil.md`)

Toutes répondues par Uriel le 19/11/2026 :

1. Menu → **burger dans l'en-tête**, panneau plein écran.
2. Ordinateur → **vraie mise en page bureau**, maquettes `*-Desktop.dc.html` faites et validées.
3. Crépuscule → les livres 2 à 4 sont (ou seront) des produits `annoncé` ; « 4 livres » se calcule.
4. Salvation → **produit seul** (surtitre « Roman · … »).
5. Badge Nouveauté → **calculé** depuis `date_parution`.
6. Data-model → à corriger d'après la boutique (XO s'en charge).
7. Inscription → **Shopify natif**.
