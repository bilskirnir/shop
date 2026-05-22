# Bilskirnir — Accueil : slider d'univers immersif — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer la home « catalogue schématique » par le **slider d'univers plein écran** validé en maquette : chaque univers / œuvre indépendante a son panneau immersif (fond atmosphérique teinté de sa couleur maîtresse, couverture(s) en vedette, citation lore, CTAs), avec navigation (swipe / dots / flèches / sélecteur), autoplay à barre de progression, et chrome sur base grise neutre.

**Architecture:** La home devient une route **immersive** : un flag `handle.immersive` lu dans `root.tsx` fait sauter le `Footer` global et remplace le `Header` par un `ImmersiveNav` transparent posé sur le slider (le `Header`/`Footer` existants restent inchangés pour les autres pages, refondues aux plans suivants). Le loader récupère univers (lore, `couleur_theme`, hero, couvertures) + œuvres indépendantes ; un module pur `buildHomeSlides` transforme ces données en un modèle `HomeSlide[]` ; le composant client `UniverseSlider` rend la piste, les animations (CSS keyframes), les contrôles responsive et l'autoplay (désactivé si `prefers-reduced-motion`). On réutilise les primitives du Plan Foundation : `Cover`, `Logo`, `universeAccentStyle`.

**Tech Stack:** Hydrogen (React Router v7), TypeScript, Vitest + Testing Library, Vanilla CSS (custom properties `--bsk-*` + `home.css` pour keyframes/media queries). Polices Cabinet Grotesk / Switzer (déjà auto-hébergées au Plan Foundation).

**Spec:** `docs/superpowers/specs/2026-05-22-bilskirnir-visual-redesign.md` (§2.6 mouvement, §3.1 accueil)
**Maquettes:** `docs/superpowers/mockups/2026-05-22-visual-redesign/01-home-desktop.html`, `02-home-mobile.html`
**Plan précédent (primitives consommées):** `docs/superpowers/plans/2026-05-22-bilskirnir-design-foundation.md`

---

## Décisions de cadrage (à valider en lisant)

1. **Nav du slider = `ImmersiveNav` propre à la home**, rendu par `root.tsx` quand la route est immersive. Le `Header`/`Footer` globaux **ne sont pas modifiés** (les autres pages restent en l'état jusqu'aux plans suivants → zéro régression). La spec veut la *smart nav* « standard partout » : cette généralisation est différée aux plans qui refondent les autres pages, où `ImmersiveNav` / `SmartNav` seront promus en chrome global.
2. **Pas de metafield genre/couleur produit** dans le schéma actuel. Donc :
   - Pastille (« pill ») d'un **univers** = `N tome(s)` (la maquette affichait « Mythologie · 6 tomes » ; le genre n'existe pas en données → on garde le compte de tomes).
   - Pastille d'une **œuvre indépendante** = `Roman indépendant` (constante). La distinction « Recueil de nouvelles » et la **couleur maîtresse par livre** sont **différées** (nécessitent un metafield produit `type_oeuvre` / `couleur_theme` côté admin). Accent d'une œuvre = neutre (doré) par défaut.
3. **Desktop de la home EST dans le périmètre** (la spec §6 ne diffère que le desktop des *autres* pages ; l'accueil desktop est maquetté). Le slider est donc responsive (1 composant, layouts mobile + desktop via media queries).

---

## Prerequisites

- [ ] `cd storefront && npm test` est vert au départ (suite Plan Foundation incluse).
- [ ] Les primitives Plan Foundation existent : `app/components/Cover.tsx`, `app/components/Logo.tsx`, `app/lib/universeAccent.ts`, tokens `--bsk-uni` / `--bsk-uni-soft` / `--bsk-cover-shadow` dans `app/styles/tokens.css`.
- [ ] `app/test/render.tsx` exporte `renderWithRouter`.

---

## File Structure

```
storefront/app/
├── lib/
│   ├── ✨ immersiveRoute.ts          (isImmersiveRoute(matches) — flag de layout)
│   ├── ✨ homeSlides.ts              (buildHomeSlides() : données → HomeSlide[])
│   └── ✏️ fragments.ts               (✨ HOME_UNIVERSE_FRAGMENT)
├── components/
│   ├── ✨ UniverseSlider.tsx         (slider client : track, slides, contrôles, autoplay, swipe)
│   ├── ✨ ImmersiveNav.tsx           (nav transparente du slider : burger, Logo, panier+pastille)
│   └── __tests__/
│       ├── ✨ UniverseSlider.test.tsx
│       └── ✨ ImmersiveNav.test.tsx
├── lib/__tests__/
│   ├── ✨ immersiveRoute.test.ts
│   └── ✨ homeSlides.test.ts
├── routes/__tests__/
│   └── ✨ home-fragment.test.ts      (assertions sur HOME_QUERY)
├── styles/
│   └── ✨ home.css                   (keyframes + layout responsive du slider)
├── test/
│   └── ✏️ setup.ts                   (mock matchMedia pour jsdom)
├── ✏️ routes/_index.tsx              (loader HOME_QUERY + buildHomeSlides + <UniverseSlider> + export handle)
└── ✏️ root.tsx                       (immersive → ImmersiveNav + pas de Footer)
```

---

## Tasks

### Task 1: Helper `isImmersiveRoute` (flag de layout)

Détermine si l'une des routes actives porte `handle.immersive === true`. Utilisé par `root.tsx` pour masquer le `Footer` et choisir la nav.

**Files:**
- Create: `storefront/app/lib/immersiveRoute.ts`
- Test: `storefront/app/lib/__tests__/immersiveRoute.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/lib/__tests__/immersiveRoute.test.ts
import {describe, it, expect} from 'vitest';
import {isImmersiveRoute} from '../immersiveRoute';

describe('isImmersiveRoute', () => {
  it('true si une route active porte handle.immersive', () => {
    expect(
      isImmersiveRoute([
        {id: 'root', handle: undefined},
        {id: 'routes/_index', handle: {immersive: true}},
      ]),
    ).toBe(true);
  });
  it('false si aucune route immersive', () => {
    expect(
      isImmersiveRoute([
        {id: 'root', handle: undefined},
        {id: 'routes/collections.$handle', handle: {}},
      ]),
    ).toBe(false);
  });
  it('false sur une liste vide', () => {
    expect(isImmersiveRoute([])).toBe(false);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- immersiveRoute
```

Expected: FAIL (`isImmersiveRoute` n'existe pas).

- [ ] **Step 3: Implement**

```ts
// storefront/app/lib/immersiveRoute.ts

/** Forme minimale d'un match react-router (on ne lit que `handle`). */
export interface RouteMatchLike {
  handle?: unknown;
}

/** True si une des routes actives déclare `handle.immersive === true`. */
export function isImmersiveRoute(
  matches: ReadonlyArray<RouteMatchLike> | undefined | null,
): boolean {
  if (!matches) return false;
  return matches.some(
    (m) =>
      !!m.handle &&
      typeof m.handle === 'object' &&
      (m.handle as {immersive?: unknown}).immersive === true,
  );
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- immersiveRoute
```

- [ ] **Step 5: Commit**

```bash
git add app/lib/immersiveRoute.ts app/lib/__tests__/immersiveRoute.test.ts
git commit -m "feat(layout): isImmersiveRoute helper (handle.immersive flag)"
```

---

### Task 2: Modèle de slides + `buildHomeSlides` (logique pure)

Transforme les collections (univers) et produits (œuvres indépendantes) en un tableau ordonné de `HomeSlide` : univers d'abord (avec pile de couvertures triée par n° de tome), puis œuvres indépendantes. Couleur maîtresse, lore/teaser, CTAs selon le statut.

**Files:**
- Create: `storefront/app/lib/homeSlides.ts`
- Test: `storefront/app/lib/__tests__/homeSlides.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/lib/__tests__/homeSlides.test.ts
import {describe, it, expect} from 'vitest';
import {buildHomeSlides, type SlideUniverse, type SlideWork} from '../homeSlides';

const cover = (n: number) => ({
  url: `https://x/t${n}.webp`,
  altText: `Tome ${n}`,
  width: 800,
  height: 1170,
});

const universe: SlideUniverse = {
  id: 'gid://c/1',
  handle: 'au-nom-des-dieux',
  title: 'Au Nom des Dieux',
  estUneOeuvreIndependante: {value: 'false'},
  lore: {value: '« Et si les légendes antiques étaient vraies ? »'},
  couleurTheme: {value: '#2f8a78'},
  illustrationHero: null,
  products: {
    nodes: [
      {featuredImage: cover(2), numeroTome: {value: '2'}, statutParution: {value: 'publié'}},
      {featuredImage: cover(1), numeroTome: {value: '1'}, statutParution: {value: 'publié'}},
      {featuredImage: cover(3), numeroTome: {value: '3'}, statutParution: {value: 'publié'}},
      {featuredImage: cover(4), numeroTome: {value: '4'}, statutParution: {value: 'publié'}},
    ],
  },
};

const work: SlideWork = {
  id: 'gid://p/9',
  handle: 'berserker',
  title: 'Berserker',
  estUneOeuvreIndependante: {value: 'true'},
  featuredImage: cover(9),
  teaserCourt: {value: '« La rage, et la neige. »'},
  statutParution: {value: 'publié'},
  dateParution: null,
};

describe('buildHomeSlides', () => {
  it('produit un slide univers avec couvertures triées par n° de tome (max 3) et débord stack', () => {
    const slides = buildHomeSlides([universe], []);
    expect(slides).toHaveLength(1);
    const s = slides[0];
    expect(s.title).toBe('Au Nom des Dieux');
    expect(s.kicker).toBe('4 tomes');
    expect(s.lore).toBe('« Et si les légendes antiques étaient vraies ? »');
    expect(s.accent).toBe('#2f8a78');
    expect(s.covers.map((c) => c.altText)).toEqual(['Tome 1', 'Tome 2', 'Tome 3']);
    expect(s.primary.href).toBe('/collections/au-nom-des-dieux');
  });

  it('exclut un univers sans couverture', () => {
    const empty: SlideUniverse = {...universe, products: {nodes: []}};
    expect(buildHomeSlides([empty], [])).toHaveLength(0);
  });

  it('exclut une collection marquée œuvre indépendante', () => {
    const standalone: SlideUniverse = {
      ...universe,
      estUneOeuvreIndependante: {value: 'true'},
    };
    expect(buildHomeSlides([standalone], [])).toHaveLength(0);
  });

  it('produit un slide œuvre (1 couverture, pill constante, teaser en lore)', () => {
    const slides = buildHomeSlides([], [work]);
    expect(slides).toHaveLength(1);
    const s = slides[0];
    expect(s.kicker).toBe('Roman indépendant');
    expect(s.covers).toHaveLength(1);
    expect(s.lore).toBe('« La rage, et la neige. »');
    expect(s.accent).toBeNull();
    expect(s.primary).toEqual({label: 'Découvrir le livre', href: '/products/berserker'});
  });

  it('CTA précommande pour une œuvre en précommande', () => {
    const preorder: SlideWork = {...work, statutParution: {value: 'précommande'}};
    expect(buildHomeSlides([], [preorder])[0].primary.label).toBe('Précommander');
  });

  it('ignore une œuvre indépendante sans image et un produit de saga (non indépendant)', () => {
    const noImg: SlideWork = {...work, featuredImage: null};
    const sagaProduct: SlideWork = {...work, estUneOeuvreIndependante: {value: 'false'}};
    expect(buildHomeSlides([], [noImg, sagaProduct])).toHaveLength(0);
  });

  it('ordonne univers avant œuvres indépendantes', () => {
    const slides = buildHomeSlides([universe], [work]);
    expect(slides.map((s) => s.title)).toEqual(['Au Nom des Dieux', 'Berserker']);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- homeSlides
```

- [ ] **Step 3: Implement**

```ts
// storefront/app/lib/homeSlides.ts
import type {CoverImage} from '~/components/Cover';
import {parseBool, parseNumeroTome, parseStatutParution} from '~/lib/tomeMetafields';

interface MetafieldValue {
  value?: string | null;
}
interface ImageRef {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

/** Données minimales d'un univers (collection) consommées par le slider. */
export interface SlideUniverse {
  id: string;
  handle: string;
  title: string;
  estUneOeuvreIndependante?: MetafieldValue | null;
  lore?: MetafieldValue | null;
  couleurTheme?: MetafieldValue | null;
  illustrationHero?: {reference?: {image?: ImageRef | null} | null} | null;
  products: {
    nodes: ReadonlyArray<{
      featuredImage?: ImageRef | null;
      numeroTome?: MetafieldValue | null;
      statutParution?: MetafieldValue | null;
    }>;
  };
}

/** Données minimales d'une œuvre indépendante (produit) consommées par le slider. */
export interface SlideWork {
  id: string;
  handle: string;
  title: string;
  estUneOeuvreIndependante?: MetafieldValue | null;
  featuredImage?: ImageRef | null;
  teaserCourt?: MetafieldValue | null;
  statutParution?: MetafieldValue | null;
  dateParution?: MetafieldValue | null;
}

export interface SlideImage {
  url: string;
  altText: string;
  width: number;
  height: number;
}

export interface SlideCta {
  label: string;
  href: string;
}

export interface HomeSlide {
  key: string;
  kicker: string;
  title: string;
  lore: string | null;
  accent: string | null;
  heroImage: SlideImage | null;
  covers: CoverImage[];
  primary: SlideCta;
  secondary: SlideCta | null;
}

function toCover(img: ImageRef | null | undefined, fallbackAlt: string): CoverImage | null {
  if (!img?.url) return null;
  return {
    url: img.url,
    altText: img.altText ?? fallbackAlt,
    width: img.width ?? 0,
    height: img.height ?? 0,
  };
}

function universeToSlide(u: SlideUniverse): HomeSlide | null {
  if (parseBool(u.estUneOeuvreIndependante?.value)) return null;

  const covers = u.products.nodes
    .slice()
    .sort(
      (a, b) =>
        (parseNumeroTome(a.numeroTome?.value) ?? 9999) -
        (parseNumeroTome(b.numeroTome?.value) ?? 9999),
    )
    .map((p) => toCover(p.featuredImage, u.title))
    .filter((c): c is CoverImage => c !== null)
    .slice(0, 3);

  if (covers.length === 0) return null;

  const tomeCount = u.products.nodes.length;
  const heroRef = u.illustrationHero?.reference?.image;
  const heroImage: SlideImage | null = heroRef?.url
    ? {
        url: heroRef.url,
        altText: heroRef.altText ?? u.title,
        width: heroRef.width ?? 0,
        height: heroRef.height ?? 0,
      }
    : null;
  const href = `/collections/${u.handle}`;

  return {
    key: u.id,
    kicker: `${tomeCount} tome${tomeCount > 1 ? 's' : ''}`,
    title: u.title,
    lore: u.lore?.value?.trim() || null,
    accent: u.couleurTheme?.value?.trim() || null,
    heroImage,
    covers,
    primary: {label: "Explorer l'univers", href},
    secondary: {label: 'Voir les tomes', href},
  };
}

function workToSlide(w: SlideWork): HomeSlide | null {
  if (!parseBool(w.estUneOeuvreIndependante?.value)) return null;
  const cover = toCover(w.featuredImage, w.title);
  if (!cover) return null;

  const status = parseStatutParution(w.statutParution?.value);
  const href = `/products/${w.handle}`;
  const primary: SlideCta =
    status === 'précommande'
      ? {label: 'Précommander', href}
      : status === 'annoncé'
        ? {label: 'En savoir plus', href}
        : {label: 'Découvrir le livre', href};

  return {
    key: w.id,
    kicker: 'Roman indépendant',
    title: w.title,
    lore: w.teaserCourt?.value?.trim() || null,
    accent: null, // couleur par livre différée (pas de metafield produit)
    heroImage: null,
    covers: [cover],
    primary,
    secondary: null,
  };
}

/** Univers d'abord (ordre d'entrée), puis œuvres indépendantes. */
export function buildHomeSlides(
  universes: ReadonlyArray<SlideUniverse>,
  works: ReadonlyArray<SlideWork>,
): HomeSlide[] {
  const universeSlides = universes
    .map(universeToSlide)
    .filter((s): s is HomeSlide => s !== null);
  const workSlides = works
    .map(workToSlide)
    .filter((s): s is HomeSlide => s !== null);
  return [...universeSlides, ...workSlides];
}
```

> NB : `heroImage` est calculé via une expression un peu verbeuse pour rester `null`-safe ; on peut la simplifier mais le test ne vérifie que le cas `illustrationHero: null` (→ `null`).

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- homeSlides
```

- [ ] **Step 5: Commit**

```bash
git add app/lib/homeSlides.ts app/lib/__tests__/homeSlides.test.ts
git commit -m "feat(home): buildHomeSlides — universes + standalone works -> slide model"
```

---

### Task 3: `HOME_UNIVERSE_FRAGMENT` (données du slider)

Le fragment `UniverseCard` actuel ne contient pas `lore` / `couleur_theme` / hero / couvertures. On ajoute un fragment dédié à la home (sans alourdir `UniverseCard`, consommé par le mega-menu).

**Files:**
- Modify: `storefront/app/lib/fragments.ts`
- Test: `storefront/app/lib/__tests__/homeFragment.test.ts` (create)

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/lib/__tests__/homeFragment.test.ts
import {describe, it, expect} from 'vitest';
import {HOME_UNIVERSE_FRAGMENT} from '../fragments';

describe('HOME_UNIVERSE_FRAGMENT', () => {
  it('inclut lore, couleur_theme, illustration_hero et les couvertures de tomes', () => {
    expect(HOME_UNIVERSE_FRAGMENT).toContain('fragment HomeUniverse on Collection');
    expect(HOME_UNIVERSE_FRAGMENT).toContain('key: "lore"');
    expect(HOME_UNIVERSE_FRAGMENT).toContain('key: "couleur_theme"');
    expect(HOME_UNIVERSE_FRAGMENT).toContain('key: "illustration_hero"');
    expect(HOME_UNIVERSE_FRAGMENT).toContain('key: "est_une_oeuvre_independante"');
    expect(HOME_UNIVERSE_FRAGMENT).toMatch(/products\(first:\s*\d+/);
    expect(HOME_UNIVERSE_FRAGMENT).toContain('featuredImage');
    expect(HOME_UNIVERSE_FRAGMENT).toContain('key: "numero_tome"');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- homeFragment
```

- [ ] **Step 3: Add the fragment to `fragments.ts`**

Ajouter à la fin de `storefront/app/lib/fragments.ts` :

```ts
export const HOME_UNIVERSE_FRAGMENT = `#graphql
  fragment HomeUniverse on Collection {
    id
    handle
    title
    estUneOeuvreIndependante: metafield(namespace: "custom", key: "est_une_oeuvre_independante") { value }
    lore: metafield(namespace: "custom", key: "lore") { value }
    couleurTheme: metafield(namespace: "custom", key: "couleur_theme") { value }
    illustrationHero: metafield(namespace: "custom", key: "illustration_hero") {
      reference {
        ... on MediaImage { image { url altText width height } }
      }
    }
    products(first: 6, sortKey: COLLECTION_DEFAULT) {
      nodes {
        featuredImage { url altText width height }
        numeroTome: metafield(namespace: "custom", key: "numero_tome") { value }
        statutParution: metafield(namespace: "custom", key: "statut_parution") { value }
      }
    }
  }
` as const;
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- homeFragment
```

- [ ] **Step 5: Commit**

```bash
git add app/lib/fragments.ts app/lib/__tests__/homeFragment.test.ts
git commit -m "feat(home): HOME_UNIVERSE_FRAGMENT (lore, couleur, hero, covers)"
```

---

### Task 4: `home.css` — keyframes + layout responsive du slider

Feuille de style scoppée au slider : structure (track/slide/bg/tint/scrim/fog/stage/content/contrôles), keyframes (`bsk-kb`, `bsk-drift`, `bsk-float`, `bsk-rise`, `bsk-fill`), layouts mobile (stage en haut, contenu centré en bas) et desktop (grille 2 colonnes), et neutralisation sous `prefers-reduced-motion`. Préfixe `hs-` pour éviter les collisions.

**Files:**
- Create: `storefront/app/styles/home.css`
- Test: `storefront/app/styles/__tests__/homeCss.test.ts` (create)

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/styles/__tests__/homeCss.test.ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const css = readFileSync(fileURLToPath(new URL('../home.css', import.meta.url)), 'utf8');

describe('home.css', () => {
  it('définit la piste et la translation par slide', () => {
    expect(css).toContain('.hs-track');
    expect(css).toContain('.hs-slide');
  });
  it('utilise l\'accent univers pour la teinte', () => {
    expect(css).toContain('var(--bsk-uni-soft)');
  });
  it('porte les animations clés', () => {
    expect(css).toMatch(/@keyframes\s+bsk-rise/);
    expect(css).toMatch(/@keyframes\s+bsk-float/);
    expect(css).toMatch(/@keyframes\s+bsk-fill/);
  });
  it('neutralise les animations en reduced-motion', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });
  it('a un layout desktop en media query', () => {
    expect(css).toMatch(/@media\s*\(min-width/);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- homeCss
```

- [ ] **Step 3: Create `home.css`**

```css
/* app/styles/home.css — slider d'univers (accueil immersif) */

.hs-slider {
  position: relative;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: var(--bsk-bg-base);
  color: var(--bsk-fg-primary);
  font-family: var(--bsk-font-sans);
  touch-action: pan-y;
}

.hs-track {
  display: flex;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.76, 0, 0.24, 1);
}

.hs-slide {
  position: relative;
  flex: 0 0 100%;
  height: 100%;
  overflow: hidden;
  /* --bsk-uni / --bsk-uni-soft surchargés en inline par universeAccentStyle */
}

/* couches de fond */
.hs-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(ellipse at 50% 26%, #20222b, var(--bsk-bg-base) 62%);
  transform: scale(1.1);
}
.hs-bg-img {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
  transform: scale(1.1);
}
.hs-slide.is-active .hs-bg,
.hs-slide.is-active .hs-bg-img {
  animation: bsk-kb 20s ease-in-out infinite alternate;
}
.hs-tint {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: radial-gradient(60% 50% at 50% 34%, var(--bsk-uni-soft), transparent 70%);
}
.hs-scrim {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(
    to top,
    rgba(19, 20, 25, 0.96) 26%,
    rgba(19, 20, 25, 0.4) 58%,
    rgba(19, 20, 25, 0.65) 100%
  );
}
.hs-fog {
  position: absolute;
  inset: 0;
  z-index: 3;
  opacity: 0.35;
  mix-blend-mode: screen;
  background: radial-gradient(50% 30% at 50% 38%, var(--bsk-uni-soft), transparent 65%);
  animation: bsk-drift 16s ease-in-out infinite alternate;
}

/* scène couvertures */
.hs-stage {
  position: absolute;
  top: 92px;
  left: 0;
  right: 0;
  height: 42%;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hs-cov {
  position: absolute;
  opacity: 0;
  transition: opacity 0.7s;
  filter: var(--bsk-cover-shadow);
}
.hs-slide.is-active .hs-cov {
  opacity: 1;
}
.hs-cov.is-single {
  height: 100%;
  width: auto;
}
.hs-slide.is-active .hs-cov.is-single {
  animation: bsk-float 7s ease-in-out 1s infinite alternate;
}
.hs-stack .hs-cov {
  height: 84%;
  width: auto;
}
.hs-stack .hs-c0 {
  transform: translate(-30%, 4%) rotate(-9deg);
  z-index: 1;
}
.hs-stack .hs-c1 {
  transform: translate(0, -3%) rotate(-1deg);
  z-index: 3;
}
.hs-stack .hs-c2 {
  transform: translate(30%, 6%) rotate(8deg);
  z-index: 2;
}
.hs-slide.is-active.hs-stack .hs-c1 {
  animation: bsk-float 7s ease-in-out 1s infinite alternate;
}

/* contenu textuel */
.hs-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 116px;
  z-index: 6;
  padding: 0 26px;
  text-align: center;
}
.hs-content > * {
  opacity: 0;
  transform: translateY(18px);
}
.hs-slide.is-active .hs-content > * {
  animation: bsk-rise 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
}
.hs-slide.is-active .hs-content > *:nth-child(1) { animation-delay: 0.1s; }
.hs-slide.is-active .hs-content > *:nth-child(2) { animation-delay: 0.2s; }
.hs-slide.is-active .hs-content > *:nth-child(3) { animation-delay: 0.3s; }
.hs-slide.is-active .hs-content > *:nth-child(4) { animation-delay: 0.4s; }

.hs-pill {
  display: inline-flex;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--bsk-fg-primary);
  border: 1px solid var(--bsk-border-subtle);
  border-radius: 999px;
  padding: 6px 13px;
}
.hs-title {
  font-family: var(--bsk-font-display);
  font-weight: 800;
  font-size: clamp(40px, 11vw, 52px);
  line-height: 0.94;
  letter-spacing: -0.02em;
  margin: 14px 0 12px;
  color: var(--bsk-fg-primary);
}
.hs-lore {
  font-size: var(--bsk-text-read, 1.0625rem);
  line-height: 1.5;
  font-style: italic;
  color: #d7cbb0;
  margin: 0 auto 18px;
  max-width: 320px;
}
.hs-cta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}
.hs-btn {
  font-family: var(--bsk-font-sans);
  font-size: 14px;
  letter-spacing: 0.04em;
  padding: 14px 26px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s, color 0.25s;
}
.hs-btn-fill {
  background: linear-gradient(135deg, var(--bsk-accent-gold), var(--bsk-accent-gold-dim));
  color: #231603;
  font-weight: 700;
}
.hs-btn-ghost {
  background: rgba(236, 228, 211, 0.06);
  color: var(--bsk-fg-primary);
  border: 1px solid var(--bsk-border-subtle);
}

/* contrôles mobiles : nom actif + points */
.hs-mobile-ctrl {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  padding: 0 24px 30px;
  text-align: center;
}
.hs-seltag {
  font-size: 9.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--bsk-accent-gold);
  margin-bottom: 6px;
}
.hs-dots {
  display: flex;
  gap: 7px;
  justify-content: center;
}
.hs-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(236, 228, 211, 0.3);
  border: none;
  padding: 0;
  transition: 0.35s;
  cursor: pointer;
}
.hs-dot.is-active {
  width: 24px;
  background: var(--bsk-accent-gold);
}

/* contrôles desktop : flèches + compteur + sélecteur */
.hs-desktop-ctrl {
  display: none;
}
.hs-arrow {
  position: absolute;
  top: 45%;
  z-index: 30;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1px solid var(--bsk-border-subtle);
  background: rgba(19, 20, 25, 0.5);
  backdrop-filter: blur(8px);
  color: var(--bsk-fg-primary);
  font-size: 21px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s;
}
.hs-arrow:hover {
  background: var(--bsk-accent-gold);
  color: #231603;
  border-color: var(--bsk-accent-gold);
}
.hs-arrow-l { left: 18px; }
.hs-arrow-r { right: 18px; }
.hs-counter {
  position: absolute;
  right: 46px;
  bottom: 108px;
  z-index: 30;
  font-size: 12px;
  letter-spacing: 0.2em;
  color: var(--bsk-fg-secondary);
}
.hs-counter b { color: var(--bsk-fg-primary); }
.hs-selector {
  position: absolute;
  left: 46px;
  right: 46px;
  bottom: 24px;
  z-index: 30;
  display: flex;
  gap: 10px;
}
.hs-pick {
  position: relative;
  flex: 1;
  text-align: left;
  padding: 13px 16px 15px;
  border-radius: 13px;
  cursor: pointer;
  border: 1px solid var(--bsk-border-subtle);
  background: rgba(19, 20, 25, 0.45);
  backdrop-filter: blur(8px);
  transition: 0.35s;
  overflow: hidden;
  color: inherit;
}
.hs-pick:hover { background: rgba(19, 20, 25, 0.7); }
.hs-pick.is-active {
  border-color: var(--bsk-accent-gold);
  background: rgba(40, 36, 28, 0.72);
}
.hs-pick-tag {
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--bsk-fg-secondary);
  margin-bottom: 4px;
}
.hs-pick.is-active .hs-pick-tag { color: var(--bsk-accent-gold); }
.hs-pick-name {
  font-family: var(--bsk-font-display);
  font-weight: 600;
  font-size: 16px;
  color: var(--bsk-fg-primary);
}
.hs-progress {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  width: 0;
  background: var(--bsk-accent-gold);
}
.hs-pick.is-active .hs-progress {
  animation: bsk-fill 7s linear forwards;
}

/* ── Desktop ── */
@media (min-width: 860px) {
  .hs-mobile-ctrl { display: none; }
  .hs-desktop-ctrl { display: block; }
  .hs-slide {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    align-items: center;
    padding: 0 96px;
  }
  .hs-scrim {
    background: linear-gradient(
        90deg,
        rgba(19, 20, 25, 0.92) 8%,
        rgba(19, 20, 25, 0.45) 46%,
        rgba(19, 20, 25, 0.1) 78%
      ),
      linear-gradient(to top, rgba(19, 20, 25, 0.85), transparent 42%);
  }
  .hs-stage {
    position: relative;
    top: 0;
    height: 100%;
    grid-column: 2;
  }
  .hs-cov.is-single { height: 66vh; }
  .hs-stack .hs-cov { height: 56vh; }
  .hs-content {
    position: relative;
    bottom: 0;
    left: 0;
    right: 0;
    grid-column: 1;
    grid-row: 1;
    padding: 0;
    text-align: left;
    max-width: 560px;
    z-index: 5;
  }
  .hs-title { font-size: clamp(48px, 6.4vw, 92px); margin: 20px 0 16px; }
  .hs-lore { margin: 0 0 26px; max-width: 450px; font-size: 20px; }
  .hs-cta { flex-direction: row; align-items: flex-start; }
  .hs-btn-fill:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(216, 166, 87, 0.4);
  }
  .hs-btn-ghost:hover { border-color: var(--bsk-accent-gold); color: var(--bsk-accent-gold); }
}

@keyframes bsk-kb { to { transform: scale(1); } }
@keyframes bsk-drift { to { transform: translate(3%, -3%) scale(1.1); } }
@keyframes bsk-float {
  from { transform: translateY(0) rotate(2deg); }
  to { transform: translateY(-4%) rotate(0deg); }
}
@keyframes bsk-rise { to { opacity: 1; transform: none; } }
@keyframes bsk-fill { to { width: 100%; } }

@media (prefers-reduced-motion: reduce) {
  .hs-track { transition: none; }
  .hs-slide.is-active .hs-bg,
  .hs-slide.is-active .hs-bg-img,
  .hs-slide.is-active .hs-cov,
  .hs-slide.is-active.hs-stack .hs-c1,
  .hs-slide.is-active .hs-cov.is-single,
  .hs-fog,
  .hs-pick.is-active .hs-progress { animation: none; }
  .hs-slide.is-active .hs-content > * { opacity: 1; transform: none; animation: none; }
}
```

- [ ] **Step 4: Run — expect PASS + build**

```bash
cd storefront && npm test -- homeCss && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add app/styles/home.css app/styles/__tests__/homeCss.test.ts
git commit -m "feat(home): home.css — slider keyframes + responsive layout"
```

---

### Task 5: Mock `matchMedia` dans le setup de test

Le slider lit `window.matchMedia('(prefers-reduced-motion: reduce)')`, absent de jsdom. On l'ajoute au setup global pour que les tests du slider ne plantent pas (défaut : pas de reduced-motion).

**Files:**
- Modify: `storefront/app/test/setup.ts`

- [ ] **Step 1: Add the mock**

Remplacer le contenu de `storefront/app/test/setup.ts` par :

```ts
import '@testing-library/jest-dom/vitest';
import {cleanup} from '@testing-library/react';
import {afterEach, vi} from 'vitest';

// jsdom n'implémente pas matchMedia : stub neutre (aucune media ne matche).
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 2: Verify la suite existante reste verte**

```bash
cd storefront && npm test
```

Expected: PASS (aucun test cassé par le stub).

- [ ] **Step 3: Commit**

```bash
git add app/test/setup.ts
git commit -m "test: stub window.matchMedia in jsdom setup"
```

---

### Task 6: Composant `UniverseSlider`

Slider client : piste translatée, slides actifs/inactifs, scène couvertures (single vs stack via `Cover`), contenu (pill/titre/lore/CTAs), contrôles mobile (nom + points) et desktop (flèches + compteur + sélecteur), autoplay 7 s (désactivé si `prefers-reduced-motion`), navigation par swipe. Accent d'univers porté par `universeAccentStyle` sur chaque slide.

**Files:**
- Create: `storefront/app/components/UniverseSlider.tsx`
- Test: `storefront/app/components/__tests__/UniverseSlider.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/UniverseSlider.test.tsx
import {describe, it, expect} from 'vitest';
import {screen, fireEvent} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {UniverseSlider} from '../UniverseSlider';
import type {HomeSlide} from '~/lib/homeSlides';

const slides: HomeSlide[] = [
  {
    key: 'u1',
    kicker: '4 tomes',
    title: 'Au Nom des Dieux',
    lore: '« légendes »',
    accent: '#2f8a78',
    heroImage: null,
    covers: [
      {url: 'https://x/1.webp', altText: 'Tome 1', width: 800, height: 1170},
      {url: 'https://x/2.webp', altText: 'Tome 2', width: 800, height: 1170},
    ],
    primary: {label: "Explorer l'univers", href: '/collections/au-nom-des-dieux'},
    secondary: {label: 'Voir les tomes', href: '/collections/au-nom-des-dieux'},
  },
  {
    key: 'w1',
    kicker: 'Roman indépendant',
    title: 'Berserker',
    lore: '« neige »',
    accent: null,
    heroImage: null,
    covers: [{url: 'https://x/9.webp', altText: 'Berserker', width: 800, height: 1170}],
    primary: {label: 'Découvrir le livre', href: '/products/berserker'},
    secondary: null,
  },
];

describe('UniverseSlider', () => {
  it('rend tous les slides avec leurs titres et CTAs', () => {
    renderWithRouter(<UniverseSlider slides={slides} />);
    expect(screen.getByText('Au Nom des Dieux')).toBeInTheDocument();
    expect(screen.getByText('Berserker')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: "Explorer l'univers"})).toHaveAttribute(
      'href',
      '/collections/au-nom-des-dieux',
    );
  });

  it('le premier slide est actif par défaut', () => {
    const {container} = renderWithRouter(<UniverseSlider slides={slides} />);
    const active = container.querySelectorAll('.hs-slide.is-active');
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveTextContent('Au Nom des Dieux');
  });

  it('un clic sur un point change le slide actif', () => {
    const {container} = renderWithRouter(<UniverseSlider slides={slides} />);
    const dots = container.querySelectorAll('.hs-dot');
    expect(dots).toHaveLength(2);
    fireEvent.click(dots[1]);
    const active = container.querySelector('.hs-slide.is-active');
    expect(active).toHaveTextContent('Berserker');
  });

  it('applique l\'accent univers en CSS var sur le slide', () => {
    const {container} = renderWithRouter(<UniverseSlider slides={slides} />);
    const first = container.querySelector('.hs-slide') as HTMLElement;
    expect(first.style.getPropertyValue('--bsk-uni')).toBe('#2f8a78');
  });

  it('le slide à plusieurs couvertures porte la classe stack', () => {
    const {container} = renderWithRouter(<UniverseSlider slides={slides} />);
    const first = container.querySelector('.hs-slide') as HTMLElement;
    expect(first.className).toContain('hs-stack');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- UniverseSlider
```

- [ ] **Step 3: Implement**

```tsx
// storefront/app/components/UniverseSlider.tsx
import {useCallback, useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {Cover} from '~/components/Cover';
import {universeAccentStyle} from '~/lib/universeAccent';
import type {HomeSlide} from '~/lib/homeSlides';

const AUTOPLAY_MS = 7000;
const SWIPE_THRESHOLD = 45;
const COVER_CLASSES = ['hs-c0', 'hs-c1', 'hs-c2'];

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function UniverseSlider({slides}: {slides: HomeSlide[]}) {
  const [index, setIndex] = useState(0);
  const n = slides.length;
  const reduced = useRef(false);

  const go = useCallback(
    (k: number) => {
      if (n === 0) return;
      setIndex(((k % n) + n) % n);
    },
    [n],
  );

  // Autoplay (sauf reduced-motion). Redémarre à chaque changement d'index.
  useEffect(() => {
    reduced.current = prefersReducedMotion();
    if (reduced.current || n <= 1) return;
    const t = setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, n, go]);

  // Swipe
  const down = useRef(false);
  const startX = useRef(0);
  const deltaX = useRef(0);
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('a,button')) return;
    down.current = true;
    startX.current = e.clientX;
    deltaX.current = 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (down.current) deltaX.current = e.clientX - startX.current;
  };
  const onPointerUp = () => {
    if (down.current && Math.abs(deltaX.current) > SWIPE_THRESHOLD) {
      go(index + (deltaX.current < 0 ? 1 : -1));
    }
    down.current = false;
  };

  if (n === 0) {
    return (
      <section className="hs-slider" aria-label="Univers Bilskirnir">
        <div className="hs-content" style={{position: 'relative', bottom: 0}}>
          <p className="hs-lore">Le catalogue arrive bientôt.</p>
        </div>
      </section>
    );
  }

  const active = slides[index];

  return (
    <section
      className="hs-slider"
      aria-roledescription="carrousel"
      aria-label="Univers Bilskirnir"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (down.current = false)}
    >
      <div
        className="hs-track"
        style={{transform: `translateX(-${index * 100}%)`}}
      >
        {slides.map((slide, i) => {
          const isStack = slide.covers.length > 1;
          return (
            <div
              key={slide.key}
              className={`hs-slide${isStack ? ' hs-stack' : ''}${
                i === index ? ' is-active' : ''
              }`}
              style={universeAccentStyle(slide.accent)}
              role="group"
              aria-roledescription="diapositive"
              aria-label={`${i + 1} / ${n} — ${slide.title}`}
              aria-hidden={i === index ? undefined : true}
            >
              {slide.heroImage ? (
                <img
                  className="hs-bg-img"
                  src={slide.heroImage.url}
                  alt=""
                  aria-hidden="true"
                />
              ) : (
                <div className="hs-bg" />
              )}
              <div className="hs-tint" />
              <div className="hs-scrim" />
              <div className="hs-fog" />

              <div className="hs-stage">
                {isStack
                  ? slide.covers.map((cover, c) => (
                      <Cover
                        key={cover.url}
                        image={cover}
                        className={`hs-cov ${COVER_CLASSES[c] ?? ''}`}
                      />
                    ))
                  : (
                      <Cover
                        image={slide.covers[0]}
                        className="hs-cov is-single"
                      />
                    )}
              </div>

              <div className="hs-content">
                <span className="hs-pill">{slide.kicker}</span>
                <h2 className="hs-title">{slide.title}</h2>
                {slide.lore ? <p className="hs-lore">{slide.lore}</p> : null}
                <div className="hs-cta">
                  <Link className="hs-btn hs-btn-fill" to={slide.primary.href}>
                    {slide.primary.label}
                  </Link>
                  {slide.secondary ? (
                    <Link className="hs-btn hs-btn-ghost" to={slide.secondary.href}>
                      {slide.secondary.label}
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contrôles mobile : nom de l'univers actif + points */}
      <div className="hs-mobile-ctrl">
        <div className="hs-seltag">{active.title}</div>
        <div className="hs-dots" role="tablist" aria-label="Choisir un univers">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              className={`hs-dot${i === index ? ' is-active' : ''}`}
              aria-label={slide.title}
              aria-selected={i === index}
              role="tab"
              onClick={() => go(i)}
            />
          ))}
        </div>
      </div>

      {/* Contrôles desktop : flèches + compteur + sélecteur */}
      <div className="hs-desktop-ctrl">
        <button
          type="button"
          className="hs-arrow hs-arrow-l"
          aria-label="Univers précédent"
          onClick={() => go(index - 1)}
        >
          ‹
        </button>
        <button
          type="button"
          className="hs-arrow hs-arrow-r"
          aria-label="Univers suivant"
          onClick={() => go(index + 1)}
        >
          ›
        </button>
        <div className="hs-counter" aria-hidden="true">
          <b>{String(index + 1).padStart(2, '0')}</b> / {String(n).padStart(2, '0')}
        </div>
        <div className="hs-selector">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              className={`hs-pick${i === index ? ' is-active' : ''}`}
              onClick={() => go(i)}
            >
              <div className="hs-pick-tag">{slide.kicker}</div>
              <div className="hs-pick-name">{slide.title}</div>
              <div className="hs-progress" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- UniverseSlider
```

- [ ] **Step 5: Commit**

```bash
git add app/components/UniverseSlider.tsx app/components/__tests__/UniverseSlider.test.tsx
git commit -m "feat(home): UniverseSlider (track, covers, controls, autoplay, swipe)"
```

---

### Task 7: Composant `ImmersiveNav` (nav transparente du slider)

Barre transparente posée sur le slider : burger (mobile, ouvre le mega-menu d'univers), `Logo` centré, bouton panier (icône sac + pastille de quantité dorée). Réutilise `MegaMenu` pour la liste d'univers et `useAside` pour ouvrir le panier.

**Files:**
- Create: `storefront/app/components/ImmersiveNav.tsx`
- Test: `storefront/app/components/__tests__/ImmersiveNav.test.tsx`

- [ ] **Step 1: Vérifier la signature de `MegaMenu` et `useAside`**

```bash
cd storefront && grep -n "export function MegaMenu\|export interface UniverseItem\|export type UniverseItem" app/components/MegaMenu.tsx
grep -n "export function useAside\|open(" app/components/Aside.tsx | head
```

Expected : `MegaMenu({universes}: {universes: UniverseItem[]})` et `useAside().open('cart')` (mêmes contrats que ceux consommés par `Header.tsx`). Adapter les props ci-dessous si la signature diffère.

- [ ] **Step 2: Write the failing test**

```tsx
// storefront/app/components/__tests__/ImmersiveNav.test.tsx
import {describe, it, expect, vi} from 'vitest';
import {screen, fireEvent} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {ImmersiveNav} from '../ImmersiveNav';

vi.mock('~/components/Aside', () => ({
  useAside: () => ({open: vi.fn(), close: vi.fn(), type: 'closed'}),
}));

const universes = [
  {id: '1', handle: 'au-nom-des-dieux', title: 'Au Nom des Dieux', isStandalone: false},
];

describe('ImmersiveNav', () => {
  it('rend le logo de la maison', () => {
    renderWithRouter(<ImmersiveNav universes={universes} cartCount={0} />);
    expect(screen.getByRole('img', {name: /bilskirnir/i})).toBeInTheDocument();
  });

  it('affiche la pastille de quantité quand le panier est non vide', () => {
    renderWithRouter(<ImmersiveNav universes={universes} cartCount={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('le burger ouvre le menu des univers', () => {
    renderWithRouter(<ImmersiveNav universes={universes} cartCount={0} />);
    expect(screen.queryByText('Au Nom des Dieux')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /menu/i}));
    expect(screen.getByText('Au Nom des Dieux')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run — expect FAIL**

```bash
cd storefront && npm test -- ImmersiveNav
```

- [ ] **Step 4: Implement**

```tsx
// storefront/app/components/ImmersiveNav.tsx
import {useState} from 'react';
import {Link} from 'react-router';
import {Logo} from '~/components/Logo';
import {MegaMenu, type UniverseItem} from '~/components/MegaMenu';
import {useAside} from '~/components/Aside';

export function ImmersiveNav({
  universes,
  cartCount,
}: {
  universes: UniverseItem[];
  cartCount: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const {open} = useAside();

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 22px',
        background: 'linear-gradient(to bottom, rgba(14,15,19,.78), transparent)',
      }}
    >
      <button
        type="button"
        aria-label="Menu des univers"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 6,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 20,
              height: 1.8,
              background: 'var(--bsk-fg-primary)',
              borderRadius: 2,
            }}
          />
        ))}
      </button>

      <Link to="/" aria-label="Accueil Bilskirnir" style={{display: 'inline-flex'}}>
        <Logo height={38} />
      </Link>

      <button
        type="button"
        onClick={() => open('cart')}
        aria-label={`Panier (${cartCount} article${cartCount > 1 ? 's' : ''})`}
        style={{
          position: 'relative',
          width: 38,
          height: 38,
          borderRadius: '50%',
          border: '1px solid var(--bsk-border-subtle)',
          background: 'transparent',
          color: 'var(--bsk-fg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="17"
          height="17"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 7h12l-1.1 12.2a1 1 0 0 1-1 .8H8.1a1 1 0 0 1-1-.8L6 7Z" />
          <path d="M9 7V6a3 3 0 0 1 6 0v1" />
        </svg>
        {cartCount > 0 ? (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              minWidth: 16,
              height: 16,
              borderRadius: 999,
              background: 'var(--bsk-accent-gold)',
              color: '#231603',
              fontSize: 9,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
            }}
          >
            {cartCount}
          </span>
        ) : null}
      </button>

      {menuOpen ? (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(14,15,19,.97)',
            borderBottom: '1px solid var(--bsk-border-subtle)',
          }}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <MegaMenu universes={universes} />
        </div>
      ) : null}
    </header>
  );
}
```

> Si `useAside` ou `MegaMenu` ont une signature différente (vérifiée au Step 1), aligner les imports/props. Le test mocke `~/components/Aside` pour éviter d'avoir besoin du `Aside.Provider`.

- [ ] **Step 5: Run — expect PASS**

```bash
cd storefront && npm test -- ImmersiveNav
```

- [ ] **Step 6: Commit**

```bash
git add app/components/ImmersiveNav.tsx app/components/__tests__/ImmersiveNav.test.tsx
git commit -m "feat(home): ImmersiveNav (transparent overlay nav for slider)"
```

---

### Task 8: Câbler la route `_index.tsx` (loader + slider + flag immersive)

Remplacer la home « catalogue » par le slider : nouvelle requête `HOME_QUERY`, construction des slides via `buildHomeSlides`, rendu `<UniverseSlider>`, import de `home.css`, et export `handle = {immersive: true}`.

**Files:**
- Modify (réécriture): `storefront/app/routes/_index.tsx`
- Test: `storefront/app/routes/__tests__/home-fragment.test.ts` (create)

- [ ] **Step 1: Write the failing test (assertions sur la query)**

```ts
// storefront/app/routes/__tests__/home-fragment.test.ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const src = readFileSync(
  fileURLToPath(new URL('../_index.tsx', import.meta.url)),
  'utf8',
);

describe('_index (home slider)', () => {
  it('utilise HOME_UNIVERSE_FRAGMENT et récupère les œuvres indépendantes', () => {
    expect(src).toContain('HOME_UNIVERSE_FRAGMENT');
    expect(src).toContain('...HomeUniverse');
    expect(src).toContain('TileProduct');
  });
  it('construit les slides et rend le slider', () => {
    expect(src).toContain('buildHomeSlides');
    expect(src).toContain('<UniverseSlider');
  });
  it('déclare la route comme immersive', () => {
    expect(src).toMatch(/export const handle\s*=\s*\{[^}]*immersive:\s*true/s);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- home-fragment
```

- [ ] **Step 3: Réécrire `_index.tsx`**

```tsx
// storefront/app/routes/_index.tsx
import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import type {HomeQuery} from 'storefrontapi.generated';
import {UniverseSlider} from '~/components/UniverseSlider';
import {
  buildHomeSlides,
  type SlideUniverse,
  type SlideWork,
} from '~/lib/homeSlides';
import {HOME_UNIVERSE_FRAGMENT, TILE_PRODUCT_FRAGMENT} from '~/lib/fragments';
import '~/styles/home.css';

export const meta: Route.MetaFunction = () => [
  {title: 'Bilskirnir — Des récits héroïques, sans compromis'},
];

/** Route immersive : root.tsx masque le Footer et pose ImmersiveNav. */
export const handle = {immersive: true};

const HOME_QUERY = `#graphql
  query Home($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 20, sortKey: TITLE) {
      nodes { ...HomeUniverse }
    }
    products(first: 50) {
      nodes { ...TileProduct }
    }
  }
  ${HOME_UNIVERSE_FRAGMENT}
  ${TILE_PRODUCT_FRAGMENT}
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  const data = await storefront.query(HOME_QUERY, {
    cache: storefront.CacheShort(),
  });
  return data;
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const universes = data.collections.nodes as unknown as SlideUniverse[];
  const works = data.products.nodes as unknown as SlideWork[];
  const slides = buildHomeSlides(universes, works);

  return <UniverseSlider slides={slides} />;
}
```

> Le `as unknown as` ponte le type généré (`HomeQuery`) vers les interfaces structurelles de `homeSlides.ts` (champs identiques, structure compatible). `HomeQuery` est régénéré par `npm run codegen` à partir de `HOME_QUERY`.

- [ ] **Step 4: Régénérer les types + run**

```bash
cd storefront && npm run codegen && npm test -- home-fragment
```

Expected: codegen OK (la query est valide), test PASS.

- [ ] **Step 5: Vérifier qu'aucun import mort ne casse le typecheck**

```bash
cd storefront && npm run build
```

Expected: build OK. (Les anciens composants `WorkTile`, `Ornament`, `ReleaseStatusBadge` ne sont plus importés par la home — ils restent utilisés ailleurs, ne pas les supprimer.)

- [ ] **Step 6: Commit**

```bash
git add app/routes/_index.tsx app/routes/__tests__/home-fragment.test.ts storefrontapi.generated.d.ts
git commit -m "feat(home): slider d'univers en page d'accueil (immersive route)"
```

---

### Task 9: Câbler `root.tsx` (ImmersiveNav + suppression du Footer sur routes immersives)

Sur une route immersive, remplacer le `Header` global par `ImmersiveNav` et **ne pas** rendre le `Footer`. Les autres routes restent inchangées.

**Files:**
- Modify: `storefront/app/root.tsx`

- [ ] **Step 1: Importer le helper, la nav et `useMatches`**

Dans les imports de `root.tsx`, ajouter :

```ts
import {useMatches} from 'react-router';
import {ImmersiveNav} from '~/components/ImmersiveNav';
import {isImmersiveRoute} from '~/lib/immersiveRoute';
```

> Si `root.tsx` importe déjà des symboles depuis `react-router` (ex. `Outlet`, `Await`), ajouter `useMatches` à cette liste d'import existante plutôt qu'une seconde ligne.

- [ ] **Step 2: Calculer le flag dans `App()`**

Juste après `const universes = mapUniverses(...)` dans `export default function App()`, ajouter :

```ts
  const immersive = isImmersiveRoute(useMatches());
```

- [ ] **Step 3: Choisir la nav selon le flag**

Remplacer le bloc nav existant (le `<Suspense fallback={<Header .../>}>` qui résout `data.cart` pour afficher `<Header .../>`) par une sélection conditionnelle. Conserver l'`Await` sur `data.cart` pour récupérer `totalQuantity` :

```tsx
        <Suspense
          fallback={
            immersive ? (
              <ImmersiveNav universes={universes} cartCount={0} />
            ) : (
              <Header universes={universes} cartCount={0} />
            )
          }
        >
          <Await resolve={data.cart}>
            {(cart) =>
              immersive ? (
                <ImmersiveNav
                  universes={universes}
                  cartCount={cart?.totalQuantity ?? 0}
                />
              ) : (
                <Header
                  universes={universes}
                  cartCount={cart?.totalQuantity ?? 0}
                />
              )
            }
          </Await>
        </Suspense>
```

- [ ] **Step 4: Conditionner le `Footer`**

Remplacer la ligne `<Footer />` par :

```tsx
        {immersive ? null : <Footer />}
```

- [ ] **Step 5: Verify build + dev**

```bash
cd storefront && npm run build
```

Expected: build OK.

```bash
cd storefront && npm run dev
```

Vérifier sur `/` : slider plein écran, nav transparente (burger / emblème / panier), **aucun footer**, et que les CTAs pointent vers `/collections/...` et `/products/...`. Vérifier qu'une autre page (ex. `/collections/<handle>`) garde son `Header` + `Footer` classiques.

- [ ] **Step 6: Commit**

```bash
git add app/root.tsx
git commit -m "feat(layout): ImmersiveNav + no footer on immersive routes"
```

---

### Task 10: Sanity check + revue visuelle accueil

- [ ] **Step 1: Toute la suite verte**

```bash
cd storefront && npm test
```

Expected: tous verts (suite Foundation + nouveaux tests de ce plan).

- [ ] **Step 2: Build**

```bash
cd storefront && npm run build
```

Expected: pas d'erreur de type ni de bundle.

- [ ] **Step 3: Revue visuelle (`npm run dev`)**

Comparer `/` aux maquettes `01-home-desktop.html` / `02-home-mobile.html` :
- [ ] Mobile : couvertures en haut (pile inclinée pour AnDd, couverture seule pour les one-shots), titre Cabinet Grotesk, citation lore, CTAs empilés, nom de l'univers + points en bas, swipe fonctionnel, autoplay ~7 s.
- [ ] Desktop : grille texte à gauche / couvertures à droite, flèches, compteur `01 / 0N`, sélecteur de cartes avec barre de progression.
- [ ] Chrome sur **base grise** (pas de base verte) : scrims/sélecteur/nav en gris anthracite ; la **couleur d'univers** ne teinte que le fond/halo de chaque slide (discret).
- [ ] Pas de cadre/carré autour des couvertures (drop-shadow uniquement).
- [ ] `prefers-reduced-motion` activé (DevTools → Rendering) : pas d'autoplay ni de flottement, contenu visible immédiatement.
- [ ] Aucun warning console (`getProductOptions`, `src=""`), aucun footer sur la home.

- [ ] **Step 4: Bump version + commit (préférence globale utilisateur)**

```bash
cd storefront && npm test && git add -A && git commit -m "chore(home): sanity pass slider d'accueil"
```

---

## Self-review (couverture spec §3.1 + §2.6)

| Élément spec | Tâche |
|---|---|
| Slider d'univers plein écran (la home EST le slider) | Task 6, 8 |
| Pas de footer sur la home / liens légaux via menu | Task 9 (no Footer) + Task 7 (mega-menu) |
| Slider égalitaire (panneau immersif par univers, fond + couleur maîtresse) | Task 2 (accent), Task 4 (bg/tint), Task 6 |
| Pile de couvertures multi-tomes / couverture seule one-shot | Task 2 (covers), Task 6 (stack vs single) |
| Citation lore par slide | Task 2 (lore/teaser), Task 6 |
| Sélecteur desktop (cartes) / points + nom mobile | Task 6 (`hs-selector` / `hs-mobile-ctrl`) |
| Flèches (desktop), swipe, autoplay + barre de progression, compteur `01/04` | Task 6 + Task 4 (`bsk-fill`) |
| Pas de hero « livre du mois », tous au même niveau | Task 2 (ordre égalitaire) |
| Harmoniser chrome sur base grise (pas base verte) | Task 4 (couleurs `--bsk-*` neutres) |
| Animations en cascade / révélations / flottement / fonds atmosphériques | Task 4 (keyframes) |
| Tout en douceur + respect reduced-motion | Task 4 (media query) + Task 6 (autoplay gate) |
| Nav transparente en haut (emblème, panier + pastille dorée) | Task 7 |

**Différé (autres plans / données admin) :**
- Généralisation de la *smart nav* sur **toutes** les pages (Plans 3+ qui refondent univers/fiches/maison).
- **Couleur maîtresse par œuvre indépendante** et **distinction « Recueil »** (nécessitent un metafield produit ; accent neutre + pill « Roman indépendant » par défaut en attendant).
- **Fonds atmosphériques par univers** : placeholder dégradé/halo ici ; l'image `illustration_hero` est déjà câblée si présente (Task 2/6), Gautier fournira les visuels.
- Pages univers / fiches / maison / panier / légal : plans suivants.
```
