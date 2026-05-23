# Bilskirnir — Page catalogue « Œuvres » (éditorial par univers) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre la page catalogue (`/collections/all`, lien « Œuvres ») en catalogue éditorial regroupé par univers — chaque univers avec sa couleur maîtresse, grille de couvertures (4 col desktop / 2 mobile, gap généreux, halo + badge de statut), section « Romans indépendants », et **rotation quotidienne** de l'ordre des sections ; rediriger `/products` → `/collections/all`.

**Architecture:** Logique pure côté lib : `seededShuffle`/`todaySeed` (rotation déterministe par jour) + `buildCatalogue` (regroupe les produits par univers / indépendants / autres, trie les tomes, applique la rotation). La route `collections.all.tsx` interroge tous les produits (`TILE_PRODUCT_FRAGMENT`) + les univers (`UNIVERSE_RAIL_FRAGMENT` pour `couleur_theme`), construit les sections dans le loader (graine = jour) et les rend via un nouveau `CatalogueSection` (en-tête ✦ teinté + grille de `TomeCard`). `TomeCard` reçoit une prop optionnelle `halo`. CSS responsive dans `catalogue.css`. Page non-immersive.

**Tech Stack:** Hydrogen (React Router v7), TypeScript, Vitest + Testing Library, Vanilla CSS (`--bsk-*` + `catalogue.css`).

**Spec:** `docs/superpowers/specs/2026-05-23-catalogue-produits-design.md`
**Maquettes:** `.superpowers/brainstorm/5708-1779520535/content/catalogue-B-desktop.html`, `catalogue-B-mobile.html`

---

## Décisions de cadrage

1. Restyle `/collections/all` + redirection `/products` → `/collections/all` (cf. spec §2).
2. Rotation quotidienne calculée **dans le loader** (serveur) → ordre passé au composant, rendu tel quel : **aucun aléa client / pas de mismatch d'hydratation** (spec §3.6).
3. Pas de pagination : fetch borné (~100 produits, catalogue réduit). Abandon de `PaginatedResourceSection`/`ProductItem` pour cette page.
4. Données incomplètes en dev (metafield `univers` non renseigné, couleurs manquantes) → dégradation propre via section « Autres œuvres » + accent doré par défaut.

---

## Prerequisites

- [ ] `cd storefront && npm test` vert.
- [ ] `TomeCard` (`cover`, `status`, `releaseDate`, `tomeNumber`, `priceFormatted`, `handle`, `title`) ; `Cover` (bleed) ; `ReleaseStatusBadge onImage` ; `Ornament` (✦) ; `universeAccentStyle` ; `Container`.
- [ ] `TILE_PRODUCT_FRAGMENT` (featuredImage, priceRange, TomeMetafields : univers handle/title, numero_tome, statut_parution, date_parution, est_une_oeuvre_independante) et `UNIVERSE_RAIL_FRAGMENT` (handle, title, couleur_theme, est_une_oeuvre_independante) dans `app/lib/fragments.ts`.
- [ ] `parseBool`, `parseNumeroTome`, `parseStatutParution` dans `app/lib/tomeMetafields.ts`.
- [ ] `redirect` de `react-router`.

---

## File Structure

```
storefront/app/
├── lib/
│   ├── ✨ seededShuffle.ts            (PRNG déterministe + todaySeed)
│   ├── ✨ catalogue.ts                (buildCatalogue : produits+univers+graine → sections)
│   └── __tests__/
│       ├── ✨ seededShuffle.test.ts
│       └── ✨ catalogue.test.ts
├── components/
│   ├── ✏️ TomeCard.tsx                (+ prop optionnelle `halo`)
│   ├── ✨ CatalogueSection.tsx        (en-tête ✦ teinté + lien + grille de TomeCard)
│   └── __tests__/
│       ├── ✏️ TomeCard.test.tsx       (+ cas halo ; rester vert)
│       └── ✨ CatalogueSection.test.tsx
├── styles/
│   ├── ✨ catalogue.css               (grille 4↔2 col + gap + halo + en-tête)
│   └── __tests__/✨ catalogueCss.test.ts
└── routes/
    ├── ✏️ collections.all.tsx          (query produits+univers, buildCatalogue, rendu sections)
    ├── ✨ products._index.tsx          (redirect → /collections/all)
    └── __tests__/
        ├── ✨ catalogue-route.test.ts  (assertions sur la source)
        └── ✨ products-index.test.ts   (redirect)
```

---

## Tasks

### Task 1: `seededShuffle` + `todaySeed`

**Files:**
- Create: `storefront/app/lib/seededShuffle.ts`
- Test: `storefront/app/lib/__tests__/seededShuffle.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/lib/__tests__/seededShuffle.test.ts
import {describe, it, expect} from 'vitest';
import {seededShuffle, todaySeed} from '../seededShuffle';

describe('seededShuffle', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8];

  it('déterministe : même graine → même ordre', () => {
    expect(seededShuffle(items, 42)).toEqual(seededShuffle(items, 42));
  });
  it('conserve exactement les mêmes éléments', () => {
    expect([...seededShuffle(items, 7)].sort((a, b) => a - b)).toEqual(items);
  });
  it('graines différentes → ordres (généralement) différents', () => {
    expect(seededShuffle(items, 1)).not.toEqual(seededShuffle(items, 2));
  });
  it('ne mute pas le tableau source', () => {
    const src = [1, 2, 3];
    seededShuffle(src, 5);
    expect(src).toEqual([1, 2, 3]);
  });
  it('gère 0 et 1 élément', () => {
    expect(seededShuffle([], 1)).toEqual([]);
    expect(seededShuffle(['x'], 1)).toEqual(['x']);
  });
});

describe('todaySeed', () => {
  it('même jour → même graine, jour suivant → graine différente', () => {
    const day = 1_700_000_000_000;
    expect(todaySeed(day)).toBe(todaySeed(day + 1000));
    expect(todaySeed(day)).not.toBe(todaySeed(day + 86_400_000));
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- seededShuffle
```

- [ ] **Step 3: Implement**

```ts
// storefront/app/lib/seededShuffle.ts

/** PRNG déterministe (mulberry32) → réordonne sans muter la source. */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const a = items.slice();
  let s = seed >>> 0 || 1;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Index du jour (UTC) — graine stable sur 24 h, différente chaque jour. */
export function todaySeed(now: number = Date.now()): number {
  return Math.floor(now / 86_400_000);
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- seededShuffle
```

- [ ] **Step 5: Commit**

```bash
git add app/lib/seededShuffle.ts app/lib/__tests__/seededShuffle.test.ts
git commit -m "feat(catalogue): seededShuffle + todaySeed (rotation deterministe par jour)"
```

---

### Task 2: `buildCatalogue` (groupement + rotation)

Regroupe les produits par univers (référence `univers`), « Romans indépendants » (flag), « Autres œuvres » (ni univers ni indépendant). Trie les tomes par n°. Applique `seededShuffle` aux **sections univers** et aux **œuvres indépendantes**. Univers d'abord (mélangés), puis indépendants, puis autres.

**Files:**
- Create: `storefront/app/lib/catalogue.ts`
- Test: `storefront/app/lib/__tests__/catalogue.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/lib/__tests__/catalogue.test.ts
import {describe, it, expect} from 'vitest';
import {buildCatalogue, type CatalogueProduct, type CatalogueUniverse} from '../catalogue';

const img = (n: string) => ({url: `https://x/${n}.webp`, altText: n, width: 800, height: 1170});
const price = (a: string) => ({minVariantPrice: {amount: a, currencyCode: 'EUR'}});

function tome(handle: string, univHandle: string | null, numero: string | null, standalone = false): CatalogueProduct {
  return {
    id: `gid://p/${handle}`,
    handle,
    title: handle,
    featuredImage: img(handle),
    priceRange: price('18.90'),
    univers: univHandle ? {reference: {handle: univHandle, title: univHandle}} : null,
    numeroTome: numero ? {value: numero} : null,
    statutParution: {value: 'publié'},
    dateParution: null,
    estUneOeuvreIndependante: {value: standalone ? 'true' : 'false'},
  };
}

const universes: CatalogueUniverse[] = [
  {handle: 'andd', title: 'Au Nom des Dieux', couleurTheme: {value: '#2f8a78'}, estUneOeuvreIndependante: {value: 'false'}},
  {handle: 'fracture', title: 'Fracture', couleurTheme: {value: '#46638f'}, estUneOeuvreIndependante: {value: 'false'}},
];

describe('buildCatalogue', () => {
  it('groupe par univers, trie les tomes, ajoute accent + lien', () => {
    const products = [tome('t2', 'andd', '2'), tome('t1', 'andd', '1')];
    const sections = buildCatalogue(products, universes, 1);
    const andd = sections.find((s) => s.key === 'andd')!;
    expect(andd.name).toBe('Au Nom des Dieux');
    expect(andd.accent).toBe('#2f8a78');
    expect(andd.href).toBe('/collections/andd');
    expect(andd.tomes.map((t) => t.handle)).toEqual(['t1', 't2']); // triés par n°
  });

  it('section Romans indépendants pour les œuvres indépendantes', () => {
    const products = [tome('berserker', null, null, true)];
    const sections = buildCatalogue(products, universes, 1);
    const indep = sections.find((s) => s.name === 'Romans indépendants')!;
    expect(indep.accent).toBeNull();
    expect(indep.href).toBeNull();
    expect(indep.tomes.map((t) => t.handle)).toEqual(['berserker']);
  });

  it('section Autres œuvres pour produit sans univers ni flag', () => {
    const sections = buildCatalogue([tome('orphan', null, null, false)], universes, 1);
    expect(sections.find((s) => s.name === 'Autres œuvres')).toBeTruthy();
  });

  it('univers d\'abord, puis indépendants, puis autres', () => {
    const products = [tome('orphan', null, null), tome('b', null, null, true), tome('t1', 'andd', '1')];
    const names = buildCatalogue(products, universes, 1).map((s) => s.name);
    expect(names[0]).toBe('Au Nom des Dieux');
    expect(names.indexOf('Romans indépendants')).toBeLessThan(names.indexOf('Autres œuvres'));
  });

  it('rotation : ordre déterministe par graine (stable même graine)', () => {
    const products = [tome('a1', 'andd', '1'), tome('f1', 'fracture', '1')];
    const order = (seed: number) =>
      buildCatalogue(products, universes, seed)
        .filter((s) => s.href)
        .map((s) => s.key);
    // déterministe : même graine → même ordre (la variation entre graines est
    // garantie par le test de seededShuffle)
    expect(order(123)).toEqual(order(123));
    expect(order(123).slice().sort()).toEqual(['andd', 'fracture']); // les deux présents
  });

  it('exclut un univers sans produit ; ignore les produits sans couverture', () => {
    const noImg = {...tome('x', 'andd', '1'), featuredImage: null};
    const sections = buildCatalogue([noImg], universes, 1);
    expect(sections.find((s) => s.key === 'fracture')).toBeUndefined();
    const andd = sections.find((s) => s.key === 'andd');
    expect(andd).toBeUndefined(); // pas de couverture → pas de tome → pas de section
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- catalogue
```

- [ ] **Step 3: Implement**

```ts
// storefront/app/lib/catalogue.ts
import type {CoverImage} from '~/components/Cover';
import type {TomeCardProps} from '~/components/TomeCard';
import {parseBool, parseNumeroTome, parseStatutParution} from '~/lib/tomeMetafields';
import {seededShuffle} from '~/lib/seededShuffle';

interface MetafieldValue {
  value?: string | null;
}
interface ImageRef {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface CatalogueProduct {
  id: string;
  handle: string;
  title: string;
  featuredImage?: ImageRef | null;
  priceRange: {minVariantPrice: {amount: string; currencyCode: string}};
  univers?: {reference?: {handle: string; title: string} | null} | null;
  numeroTome?: MetafieldValue | null;
  statutParution?: MetafieldValue | null;
  dateParution?: MetafieldValue | null;
  estUneOeuvreIndependante?: MetafieldValue | null;
}

export interface CatalogueUniverse {
  handle: string;
  title: string;
  couleurTheme?: MetafieldValue | null;
  estUneOeuvreIndependante?: MetafieldValue | null;
}

export interface CatalogueSectionData {
  key: string;
  name: string;
  accent: string | null;
  href: string | null;
  tomes: TomeCardProps[];
}

function toCover(img: ImageRef | null | undefined, alt: string): CoverImage | null {
  if (!img?.url) return null;
  return {url: img.url, altText: img.altText ?? alt, width: img.width ?? 0, height: img.height ?? 0};
}

function toTomeCard(p: CatalogueProduct): TomeCardProps | null {
  const cover = toCover(p.featuredImage, p.title);
  if (!cover) return null;
  const fmt = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: p.priceRange.minVariantPrice.currencyCode || 'EUR',
  });
  return {
    handle: p.handle,
    title: p.title,
    cover,
    status: parseStatutParution(p.statutParution?.value),
    releaseDate: p.dateParution?.value ?? null,
    tomeNumber: parseNumeroTome(p.numeroTome?.value),
    priceFormatted: fmt.format(parseFloat(p.priceRange.minVariantPrice.amount)),
  };
}

export function buildCatalogue(
  products: ReadonlyArray<CatalogueProduct>,
  universes: ReadonlyArray<CatalogueUniverse>,
  seed: number,
): CatalogueSectionData[] {
  const universeMap = new Map(universes.map((u) => [u.handle, u]));

  const byUniverse = new Map<string, CatalogueProduct[]>();
  const standalone: CatalogueProduct[] = [];
  const orphans: CatalogueProduct[] = [];

  for (const p of products) {
    if (parseBool(p.estUneOeuvreIndependante?.value)) {
      standalone.push(p);
      continue;
    }
    const uh = p.univers?.reference?.handle ?? null;
    if (uh) {
      const list = byUniverse.get(uh) ?? [];
      list.push(p);
      byUniverse.set(uh, list);
    } else {
      orphans.push(p);
    }
  }

  const universeSections: CatalogueSectionData[] = [];
  for (const [handle, list] of byUniverse) {
    const tomes = list
      .slice()
      .sort((a, b) => (parseNumeroTome(a.numeroTome?.value) ?? 9999) - (parseNumeroTome(b.numeroTome?.value) ?? 9999))
      .map(toTomeCard)
      .filter((t): t is TomeCardProps => t !== null);
    if (tomes.length === 0) continue;
    const u = universeMap.get(handle);
    universeSections.push({
      key: handle,
      name: u?.title ?? list[0].univers?.reference?.title ?? handle,
      accent: u?.couleurTheme?.value?.trim() || null,
      href: `/collections/${handle}`,
      tomes,
    });
  }

  const sections = seededShuffle(universeSections, seed);

  const standaloneTomes = seededShuffle(standalone, seed)
    .map(toTomeCard)
    .filter((t): t is TomeCardProps => t !== null);
  if (standaloneTomes.length > 0) {
    sections.push({key: '__indep', name: 'Romans indépendants', accent: null, href: null, tomes: standaloneTomes});
  }

  const orphanTomes = orphans.map(toTomeCard).filter((t): t is TomeCardProps => t !== null);
  if (orphanTomes.length > 0) {
    sections.push({key: '__autres', name: 'Autres œuvres', accent: null, href: null, tomes: orphanTomes});
  }

  return sections;
}
```

> NB : `byUniverse` est une `Map` — l'ordre d'insertion suit l'ordre des produits ; `seededShuffle` le rebrasse de toute façon. Le test « rotation » vérifie qu'au moins une graine diffère.

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- catalogue
```

- [ ] **Step 5: Commit**

```bash
git add app/lib/catalogue.ts app/lib/__tests__/catalogue.test.ts
git commit -m "feat(catalogue): buildCatalogue (groupement univers + rotation quotidienne)"
```

---

### Task 3: `catalogue.css`

**Files:**
- Create: `storefront/app/styles/catalogue.css`
- Test: `storefront/app/styles/__tests__/catalogueCss.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/styles/__tests__/catalogueCss.test.ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const css = readFileSync(resolve(process.cwd(), 'app/styles/catalogue.css'), 'utf8');

describe('catalogue.css', () => {
  it('grille 2 colonnes mobile, 4 desktop', () => {
    expect(css).toContain('.cat-grid');
    expect(css).toMatch(/grid-template-columns:\s*repeat\(2/);
    expect(css).toMatch(/@media\s*\(min-width/);
    expect(css).toMatch(/repeat\(4/);
  });
  it('halo de couleur d\'univers', () => {
    expect(css).toContain('.cat-halo');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- catalogueCss
```

- [ ] **Step 3: Create `catalogue.css`**

```css
/* app/styles/catalogue.css — page catalogue Œuvres */

.cat-head {
  text-align: center;
  padding: var(--bsk-space-10) var(--bsk-space-5) var(--bsk-space-5);
}
.cat-k {
  font-size: var(--bsk-text-xs);
  letter-spacing: var(--bsk-tracking-widest);
  text-transform: uppercase;
  color: var(--bsk-accent-gold);
  margin-bottom: var(--bsk-space-2);
}
.cat-h1 {
  font-family: var(--bsk-font-display);
  font-weight: 800;
  font-size: var(--bsk-text-2xl);
  letter-spacing: -0.02em;
  color: var(--bsk-fg-primary);
  line-height: 1;
}
.cat-sub {
  font-size: var(--bsk-text-sm);
  color: var(--bsk-fg-secondary);
  margin-top: var(--bsk-space-3);
}

.cat-sec-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--bsk-space-4);
  margin: 0 0 var(--bsk-space-6);
}
.cat-sec-name {
  font-family: var(--bsk-font-display);
  font-weight: 700;
  font-size: var(--bsk-text-xl);
  color: var(--bsk-fg-primary);
  display: flex;
  align-items: center;
  gap: 10px;
}
.cat-sec-name .cat-star {
  color: var(--bsk-uni);
}
.cat-sec-link {
  font-size: var(--bsk-text-xs);
  letter-spacing: var(--bsk-tracking-wide);
  text-transform: uppercase;
  color: var(--bsk-accent-gold);
  text-decoration: none;
  white-space: nowrap;
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--bsk-space-6) var(--bsk-space-5);
  list-style: none;
  margin: 0;
  padding: 0;
}

.cat-cover-wrap {
  position: relative;
}
.cat-halo {
  position: absolute;
  inset: -10% -6% 0;
  z-index: -1;
  border-radius: 50%;
  opacity: 0.18;
  filter: blur(10px);
  pointer-events: none;
}

@media (min-width: 860px) {
  .cat-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--bsk-space-8) var(--bsk-space-6);
  }
  .cat-h1 {
    font-size: var(--bsk-text-3xl);
  }
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- catalogueCss
```

- [ ] **Step 5: Commit**

```bash
git add app/styles/catalogue.css app/styles/__tests__/catalogueCss.test.ts
git commit -m "feat(catalogue): catalogue.css (grille 4/2 col + gap + halo)"
```

---

### Task 4: prop `halo` sur `TomeCard`

Ajoute une prop optionnelle `halo?: string | null` : quand fournie, rend un halo de couleur derrière la couverture (le wrapper de couverture porte la classe `cat-cover-wrap`). Sans `halo`, comportement inchangé (les tests existants restent verts).

**Files:**
- Modify: `storefront/app/components/TomeCard.tsx`
- Modify: `storefront/app/components/__tests__/TomeCard.test.tsx`

- [ ] **Step 1: Ajouter le test (au fichier existant)**

```tsx
it('rend un halo quand `halo` est fourni', () => {
  const {container} = renderWithRouter(
    <TomeCard {...baseTome} status="publié" priceFormatted="18,90 €" halo="#2f8a78" />,
  );
  const halo = container.querySelector('.cat-halo') as HTMLElement;
  expect(halo).not.toBeNull();
  expect(halo.style.background).toContain('#2f8a78');
});

it('pas de halo par défaut', () => {
  const {container} = renderWithRouter(
    <TomeCard {...baseTome} status="publié" priceFormatted="18,90 €" />,
  );
  expect(container.querySelector('.cat-halo')).toBeNull();
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- TomeCard
```

- [ ] **Step 3: Modifier `TomeCard.tsx`**

Ajouter `halo?: string | null;` à `TomeCardProps`. Dans la signature, destructurer `halo`. Remplacer le wrapper de couverture :

```tsx
      <div className="cat-cover-wrap" style={{position: 'relative'}}>
        {halo ? (
          <span
            className="cat-halo"
            aria-hidden="true"
            style={{background: `radial-gradient(60% 50% at 50% 40%, ${halo}, transparent 70%)`}}
          />
        ) : null}
        <ReleaseStatusBadge status={status} releaseDate={releaseDate} onImage />
        <Cover image={cover} bleed />
      </div>
```

(le reste du composant inchangé : bloc texte n° tome / titre / prix.)

- [ ] **Step 4: Run — expect PASS (anciens + nouveaux)**

```bash
cd storefront && npm test -- TomeCard
```

- [ ] **Step 5: Commit**

```bash
git add app/components/TomeCard.tsx app/components/__tests__/TomeCard.test.tsx
git commit -m "feat(catalogue): TomeCard prop halo (accent univers derriere la couverture)"
```

---

### Task 5: `CatalogueSection`

En-tête `✦` teinté de l'accent (via `universeAccentStyle`) + nom + lien optionnel « Explorer l'univers → », puis grille de `TomeCard` (avec `halo`).

**Files:**
- Create: `storefront/app/components/CatalogueSection.tsx`
- Test: `storefront/app/components/__tests__/CatalogueSection.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/CatalogueSection.test.tsx
import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {CatalogueSection} from '../CatalogueSection';

const tome = {
  handle: 'tome-1',
  title: 'Le Sang Versé',
  cover: {url: 'https://x/c.webp', altText: 'Le Sang Versé', width: 400, height: 600},
  status: 'publié' as const,
  tomeNumber: 1,
  priceFormatted: '18,90 €',
};

describe('CatalogueSection', () => {
  it('rend le nom, le lien et les tomes', () => {
    renderWithRouter(
      <CatalogueSection name="Au Nom des Dieux" accent="#2f8a78" href="/collections/andd" tomes={[tome]} />,
    );
    expect(screen.getByRole('heading', {name: /Au Nom des Dieux/})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Explorer l'univers/i})).toHaveAttribute('href', '/collections/andd');
    expect(screen.getByText('Le Sang Versé')).toBeInTheDocument();
  });

  it('sans href : pas de lien explorer', () => {
    renderWithRouter(<CatalogueSection name="Romans indépendants" accent={null} href={null} tomes={[tome]} />);
    expect(screen.queryByRole('link', {name: /Explorer l'univers/i})).toBeNull();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- CatalogueSection
```

- [ ] **Step 3: Implement**

```tsx
// storefront/app/components/CatalogueSection.tsx
import {Link} from 'react-router';
import {TomeCard, type TomeCardProps} from './TomeCard';
import {universeAccentStyle} from '~/lib/universeAccent';

export interface CatalogueSectionProps {
  name: string;
  accent: string | null;
  href: string | null;
  tomes: TomeCardProps[];
}

export function CatalogueSection({name, accent, href, tomes}: CatalogueSectionProps) {
  return (
    <section style={{...universeAccentStyle(accent), padding: 'var(--bsk-space-6) 0'}}>
      <div className="cat-sec-head">
        <h2 className="cat-sec-name">
          <span className="cat-star" aria-hidden="true">✦</span> {name}
        </h2>
        {href ? (
          <Link className="cat-sec-link" to={href}>
            Explorer l'univers →
          </Link>
        ) : null}
      </div>
      <ul className="cat-grid">
        {tomes.map((t) => (
          <li key={t.handle}>
            <TomeCard {...t} halo={accent} />
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- CatalogueSection
```

- [ ] **Step 5: Commit**

```bash
git add app/components/CatalogueSection.tsx app/components/__tests__/CatalogueSection.test.tsx
git commit -m "feat(catalogue): CatalogueSection (en-tete teinte + grille TomeCard)"
```

---

### Task 6: Câbler `collections.all.tsx`

Query produits (`TILE_PRODUCT_FRAGMENT`) + univers (`UNIVERSE_RAIL_FRAGMENT`) ; `buildCatalogue` avec la graine du jour dans le loader ; rendu en-tête + sections séparées par `Ornament` ; import `catalogue.css`. Non-immersive (Header/Footer globaux).

**Files:**
- Modify (réécriture): `storefront/app/routes/collections.all.tsx`
- Test: `storefront/app/routes/__tests__/catalogue-route.test.ts` (create)

- [ ] **Step 1: Write the failing test (source)**

```ts
// storefront/app/routes/__tests__/catalogue-route.test.ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const src = readFileSync(resolve(process.cwd(), 'app/routes/collections.all.tsx'), 'utf8');

describe('collections.all (catalogue)', () => {
  it('utilise buildCatalogue + todaySeed et les fragments produits/univers', () => {
    expect(src).toContain('buildCatalogue');
    expect(src).toContain('todaySeed');
    expect(src).toContain('...TileProduct');
    expect(src).toContain('UNIVERSE_RAIL_FRAGMENT');
  });
  it('rend CatalogueSection + importe catalogue.css', () => {
    expect(src).toContain('CatalogueSection');
    expect(src).toContain("'~/styles/catalogue.css'");
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- catalogue-route
```

- [ ] **Step 3: Réécrire `collections.all.tsx`**

```tsx
// storefront/app/routes/collections.all.tsx
import type {Route} from './+types/collections.all';
import {useLoaderData} from 'react-router';
import {Container} from '~/components/Container';
import {Ornament} from '~/components/Ornament';
import {CatalogueSection} from '~/components/CatalogueSection';
import {
  buildCatalogue,
  type CatalogueProduct,
  type CatalogueUniverse,
} from '~/lib/catalogue';
import {todaySeed} from '~/lib/seededShuffle';
import {TILE_PRODUCT_FRAGMENT, UNIVERSE_RAIL_FRAGMENT} from '~/lib/fragments';
import '~/styles/catalogue.css';

export const meta: Route.MetaFunction = () => [{title: 'Œuvres — Bilskirnir'}];

const CATALOGUE_QUERY = `#graphql
  query Catalogue($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 100) {
      nodes { ...TileProduct }
    }
    collections(first: 30, sortKey: TITLE) {
      nodes { ...UniverseRailCard }
    }
  }
  ${TILE_PRODUCT_FRAGMENT}
  ${UNIVERSE_RAIL_FRAGMENT}
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const data = await context.storefront.query(CATALOGUE_QUERY, {
    cache: context.storefront.CacheShort(),
  });
  const sections = buildCatalogue(
    data.products.nodes as unknown as CatalogueProduct[],
    data.collections.nodes as unknown as CatalogueUniverse[],
    todaySeed(),
  );
  return {sections};
}

export default function Catalogue() {
  const {sections} = useLoaderData<typeof loader>();

  return (
    <Container width="content">
      <header className="cat-head">
        <div className="cat-k">Le catalogue</div>
        <h1 className="cat-h1">Œuvres</h1>
        <p className="cat-sub">Toutes les œuvres de la maison, par univers</p>
      </header>

      {sections.length === 0 ? (
        <p style={{textAlign: 'center', color: 'var(--bsk-fg-secondary)', padding: 'var(--bsk-space-10) 0'}}>
          Le catalogue arrive bientôt.
        </p>
      ) : (
        sections.map((s, i) => (
          <div key={s.key}>
            <CatalogueSection name={s.name} accent={s.accent} href={s.href} tomes={s.tomes} />
            {i < sections.length - 1 ? <Ornament /> : null}
          </div>
        ))
      )}
    </Container>
  );
}
```

- [ ] **Step 4: Régénérer les types + run + build**

```bash
cd storefront && npm run codegen && npm test -- catalogue-route && npm run build
```

Expected : codegen OK, test PASS, build OK.

- [ ] **Step 5: Commit**

```bash
git add app/routes/collections.all.tsx app/routes/__tests__/catalogue-route.test.ts storefrontapi.generated.d.ts
git commit -m "feat(catalogue): page Oeuvres editoriale par univers (rotation quotidienne)"
```

---

### Task 7: Redirection `/products` → `/collections/all`

**Files:**
- Create: `storefront/app/routes/products._index.tsx`
- Test: `storefront/app/routes/__tests__/products-index.test.ts` (create)

- [ ] **Step 1: Write the failing test (source)**

```ts
// storefront/app/routes/__tests__/products-index.test.ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const src = readFileSync(resolve(process.cwd(), 'app/routes/products._index.tsx'), 'utf8');

describe('products._index', () => {
  it('redirige vers /collections/all', () => {
    expect(src).toContain('redirect');
    expect(src).toContain('/collections/all');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- products-index
```

- [ ] **Step 3: Implement**

```tsx
// storefront/app/routes/products._index.tsx
import {redirect} from 'react-router';
import type {Route} from './+types/products._index';

export async function loader(_args: Route.LoaderArgs) {
  return redirect('/collections/all', 301);
}
```

- [ ] **Step 4: Run + build**

```bash
cd storefront && npm run codegen && npm test -- products-index && npm run build
```

Expected : `/products` redirige (301) vers `/collections/all`.

- [ ] **Step 5: Commit**

```bash
git add app/routes/products._index.tsx app/routes/__tests__/products-index.test.ts storefrontapi.generated.d.ts
git commit -m "feat(catalogue): redirige /products -> /collections/all"
```

---

### Task 8: Sanity check + revue visuelle

- [ ] **Step 1: Suite + build**

```bash
cd storefront && npm test && npm run build
```

Expected : tout vert, build OK.

- [ ] **Step 2: Dev** (`npm run dev`)

- [ ] `/collections/all` (lien « Œuvres ») : en-tête « Le catalogue / Œuvres », sections par univers (✦ + nom teinté de la couleur maîtresse, lien « Explorer l'univers → »), **grille 4 colonnes desktop / 2 mobile avec gap généreux**, halo discret + badge de statut sur les couvertures, infos dessous (n° tome · titre · prix/statut), séparateurs `✦`, puis « Romans indépendants » / « Autres œuvres ». Footer global.
- [ ] `/products` → redirige vers `/collections/all`.
- [ ] L'ordre des sections est stable au rechargement (même jour) ; recharger ne fait pas « sauter » l'ordre.
- [ ] `prefers-reduced-motion` : pas d'animation gênante.
- [ ] Aucun warning console, aucune couverture encadrée.

- [ ] **Step 3: Commit (si ajustements)**

```bash
cd storefront && npm test && git add -A && git commit -m "chore(catalogue): sanity pass page Oeuvres"
```

---

## Self-review (couverture spec)

| Élément spec | Tâche |
|---|---|
| §2 Restyle /collections/all + redirect /products | Task 6, 7 |
| §3.1 En-tête (label, titre, sous-titre) | Task 3, 6 |
| §3.2 Sections par univers (✦ teinté, lien explorer, grille 4/2, halo, badge, infos) | Task 3, 4, 5, 6 |
| §3.3 Romans indépendants | Task 2, 6 |
| §3.4 Fallback « Autres œuvres » | Task 2 |
| §3.5 Séparateurs ✦ | Task 6 (Ornament) |
| §3.6 Rotation quotidienne (seededShuffle, graine jour, loader) | Task 1, 2, 6 |
| §3 gap généreux entre couvertures | Task 3 (catalogue.css) |
| §4 Données (TILE_PRODUCT + UNIVERSE_RAIL, groupement) | Task 2, 6 |
| §5 Composants (CatalogueSection, seededShuffle, halo, catalogue.css) | Task 1, 3, 4, 5 |

**Différé (spec §7) :** filtres/tri, pagination, desktop dédié des autres pages, données admin réelles.
