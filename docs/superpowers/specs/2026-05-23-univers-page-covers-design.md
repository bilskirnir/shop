# Page univers (`/collections/$handle`) — design centré couvertures — Spec

**Date :** 2026-05-23
**Statut :** validé (design)
**Maquettes :** `.superpowers/brainstorm/7587-1779549008/content/univers-layout.html` (3 partis-pris), `univers-b-scale.html` (parti B à 7 tomes)

## Contexte & problème

La page univers actuelle repose sur un **hero à image de fond** (`illustration_hero`). Or **il n'existe pas d'image d'ambiance pour les univers — uniquement les couvertures des livres** (contrainte répétée par l'utilisateur). Résultat : sans image, le hero paraît vide et « ancien ». On refond la page pour qu'elle **s'appuie sur les couvertures + la description (lore)**, et reste belle avec **peu de tomes (2)** comme avec **beaucoup (7+)**.

Parti retenu (**B — « couvertures en éventail »**) : les livres eux-mêmes font l'ambiance. L'atmosphère vient de la **couleur de l'univers** (`--bsk-uni`) + des **couvertures**, jamais d'une image de fond.

## Objectif

Refondre `/collections/$handle` : hero sans image (éventail décoratif de couvertures + titre + description), puis galerie de tous les tomes en grille (groupée par saga si dispo), puis rail « autres univers ». Mobile-first, couche desktop ≥ 860px.

## Architecture / structure de page

1. **Hero (sans image)** — section pleine largeur, fond = gradient teinté `--bsk-uni` (+ brume légère + emblème ✦ filigrane optionnel), passe sous la nav en desktop (immersif).
   - **Éventail** (gauche desktop / haut mobile) : **jusqu'à 3 couvertures** des **tomes les plus récemment parus**, en éventail (rotations légères, ombres `--bsk-shadow-cover`). Décoratif et **fixe** quel que soit le nombre de tomes.
   - **Bloc texte** (droite desktop / dessous mobile, centré mobile) : pastille **genre** (masquée si vide) · **titre** (h1, `clamp` jusqu'à ~56–64px desktop) · **description (lore)** en italique · **stats** (`N tomes` + `· M sagas` si sagas) · bouton ancre « Découvrir les tomes ↓ ».
2. **Galerie des tomes** — tous les tomes en **grille responsive** : `grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))` (≈4 col desktop, 2 col mobile), gap généreux, couvertures `object-fit:cover` + hover, **badge de statut** (préco / à paraître) via `ReleaseStatusBadge`.
   - **Si sagas renseignées** : sections par saga (`SagaSection` : label · titre · synopsis + grille), séparées par `Ornament` (✦).
   - **Sinon** : une **seule grille plate** (classe `saga-grid`) de tous les tomes.
3. **Rail « Découvrir un autre univers »** — `UniverseRail` existant, inchangé.

## Composants

| Composant | Action | Responsabilité |
|---|---|---|
| `UniverseHero` | **Réécrit** | Éventail + bloc texte. Props : `title, genre, lore, stats, fanCovers`. **Supprime** `heroImage`. |
| `CoverFan` | **Nouveau** | Rend 1–3 couvertures en éventail ; gère 1/2/3 (pas d'effet vide). Props : `covers: CoverImage[]`. |
| `SagaSection` | Conservé | label · titre · synopsis + grille responsive (auto-fill). |
| Grille plate | Conservé | Classe `saga-grid`, mêmes colonnes responsive que les grilles saga. |
| `TomeCard` | Inchangé | couverture + n° tome + titre + prix + badge statut. |
| `UniverseRail` | Inchangé | rail « autres univers ». |
| `pickFanCovers` | **Nouveau (lib pure)** | `pickFanCovers(products, max=3)` → couvertures triées par date de parution **décroissante** (sans date → en dernier), plafonnées à `max`, en ignorant les produits sans `featuredImage`. |

## Données

Aucun nouveau métafield. La requête `COLLECTION_QUERY` fournit déjà : `couleur_theme`, `genre`, `lore`, `sagas` (métaobjets), `products{ featuredImage, numero_tome, statut_parution, dateParution, prix, saga }`.
- `lore` (rich text) aplati via `richTextToPlain` (existant).
- `fanCovers` = `pickFanCovers(products)` — nécessite `featuredImage` + `dateParution` par produit (déjà dans le fragment des tomes).
- `illustration_hero` n'est **plus** utilisé par cette page (on retire l'usage ; le métafield peut rester côté Shopify sans effet).

## États gérés

- **0 produit** → état vide centré (« Les tomes de cet univers arrivent bientôt. »), pas d'éventail.
- **1–2 couvertures** → `CoverFan` rend 1 ou 2 couvertures (centrées, sans trou).
- **genre vide** → pas de pastille.
- **lore vide** → pas de paragraphe description.
- **sagas vide** → grille unique (pas de titres de section).

## Responsive

- Mobile (<860px) : hero empilé (éventail centré au-dessus, texte centré dessous) ; grille 2 colonnes.
- Desktop (≥860px) : hero en 2 colonnes (éventail | texte), passe sous la nav (`margin-top` négatif + `padding-top` compensateur, comme la fiche) ; grille ≈4 colonnes.
- `prefers-reduced-motion` : pas d'animation d'entrée gênante.

## Tests

- **`pickFanCovers`** (Vitest, pur) : tri par `dateParution` desc, sans-date en dernier, plafond 3, ignore les produits sans `featuredImage`, renvoie ≤ `max`.
- **CSS** (`readFileSync`) : présence des classes hero/éventail/galerie (`.uni-hero`, `.uni-fan`, grille responsive `repeat(auto-fill`).
- **`UniverseHero`** (Testing Library) : rend le titre + N images d'éventail ; masque la pastille quand `genre` absent ; rend la description quand `lore` présent.
- **`CoverFan`** : rend exactement `min(covers.length, 3)` images.
- Tests existants univers/collection : rester verts (adapter ceux qui référencent `heroImage`).

## Hors périmètre (YAGNI)

- Pas de réintroduction d'image d'ambiance.
- Pas de carrousel/lightbox de couvertures (grille simple).
- Le remplissage des données Shopify (genre, sagas, tomes manquants) reste une tâche **contenu**, hors code.

## Cohérence design

Réutilise les tokens (`--bsk-uni`, `--bsk-radius` 14px pour les coins non-ronds, `--bsk-accent-gold`, `--bsk-shadow-cover`), l'emblème ✦, le langage immersif de la fiche (gradient teinté + brume), `Container`, `Ornament`, `ReleaseStatusBadge`.
