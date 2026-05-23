# Bilskirnir — Page univers desktop + index « Nos univers » — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** (A) Donner un layout **desktop immersif** à la page d'un univers (`/collections/$handle`) — hero atmosphérique sous la nav, « L'univers » centré, grille de tomes 3 colonnes, rail réparti ; (B) refondre l'index `/collections` en **« Nos univers »** : grandes cartes atmosphériques par univers.

**Architecture:** Partie A = couche `@media (min-width: 860px)` dans `univers.css` (mobile inchangé) + petites classes ciblables sur `SagaSection`/`UniverseRail`/route. Partie B = helper pur `buildUniverseIndex` (filtre les collections techniques, mappe en `UniverseCardProps`), composant `UniverseCard` (carte atmosphérique), `UNIVERSE_INDEX_FRAGMENT`, et réécriture de `collections._index.tsx`. Langage partagé avec la fiche desktop (atmosphère `--bsk-uni`, rythme centré, doré, emblème `✦`).

**Tech Stack:** Hydrogen (React Router v7), TypeScript, Vitest + Testing Library, Vanilla CSS (`--bsk-*` + `univers.css`).

**Spec:** `docs/superpowers/specs/2026-05-23-univers-collections-desktop-design.md`
**Maquettes:** `.superpowers/brainstorm/6732-1779543946/content/univers-desktop.html`, `collections-index.html`

---

## Décisions de cadrage

1. Breakpoint desktop **860px**. Mobile inchangé.
2. Atmosphère = dégradés de `--bsk-uni` (déjà posé par la route via `universeAccentStyle`). `illustration_hero` en fond : différé.
3. Index : exclusion des collections techniques par **denylist de handle** (`all`, `goodies`, `a-paraitre`) + collections vides.
4. Tests existants (Plan 3) restent verts.

---

## Prerequisites

- [ ] `cd storefront && npm test` vert.
- [ ] `UniverseHero`, `SagaSection`, `TomeCard`, `UniverseRail`, `Ornament`, `Container`, `universeAccentStyle`, `splitLore`, `richTextToPlain` présents.
- [ ] `collections.$handle.tsx` pose déjà l'accent (`universeAccentStyle`) ; `univers.css` existe (mobile).

---

## File Structure

```
storefront/app/
├── lib/
│   ├── ✨ universeIndex.ts            (buildUniverseIndex : collections → UniverseCardProps[])
│   ├── ✏️ fragments.ts                (✨ UNIVERSE_INDEX_FRAGMENT)
│   └── __tests__/
│       ├── ✨ universeIndex.test.ts
│       └── ✨ universeIndexFragment.test.ts
├── components/
│   ├── ✨ UniverseCard.tsx            (carte atmosphérique d'univers — index)
│   ├── ✏️ SagaSection.tsx             (grille → classe `saga-grid`)
│   ├── ✏️ UniverseRail.tsx            (classes ciblables desktop)
│   └── __tests__/
│       ├── ✨ UniverseCard.test.tsx
│       ├── ✏️ SagaSection.test.tsx    (rester vert)
│       └── ✏️ UniverseRail.test.tsx   (rester vert)
├── styles/
│   ├── ✏️ univers.css                 (+ @media 860px : hero, saga-grid 3col, rail ; + styles UniverseCard)
│   └── __tests__/✏️ universCss.test.ts (+ assertions desktop)
└── routes/
    ├── ✏️ collections.$handle.tsx       (grille plate → classe saga-grid ; hero h1 desktop)
    ├── ✏️ collections._index.tsx        (réécriture : « Nos univers » + UniverseCard)
    └── __tests__/✨ collections-index.test.ts
```

---

## Tasks

### Task 1: `univers.css` — couche desktop + styles `UniverseCard`

**Files:**
- Modify: `storefront/app/styles/univers.css`
- Modify: `storefront/app/styles/__tests__/universCss.test.ts`

- [ ] **Step 1: Étendre le test**

Remplacer `app/styles/__tests__/universCss.test.ts` par :

```ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const css = readFileSync(resolve(process.cwd(), 'app/styles/univers.css'), 'utf8');

describe('univers.css', () => {
  it("définit le hero et la teinte d'univers", () => {
    expect(css).toContain('.uni-hero');
    expect(css).toContain('var(--bsk-uni-soft)');
  });
  it('porte la cascade et la brume', () => {
    expect(css).toMatch(/@keyframes\s+uni-rise/);
    expect(css).toMatch(/@keyframes\s+uni-drift/);
  });
  it('neutralise les animations en reduced-motion', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });
  it('couche desktop : grille saga 3 colonnes + carte univers', () => {
    expect(css).toMatch(/@media\s*\(min-width:\s*860px\)/);
    expect(css).toContain('.saga-grid');
    expect(css).toContain('repeat(3');
    expect(css).toContain('.uni-card');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- universCss
```

- [ ] **Step 3: Ajouter à la fin de `univers.css`**

```css

/* ── Grille de tomes (saga + grille plate) ── */
.saga-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--bsk-space-6) var(--bsk-space-5);
  align-items: start;
}

/* ── Rail « autres univers » : classes ciblables ── */
.uni-rail-row {
  display: flex;
  gap: var(--bsk-space-4);
  overflow-x: auto;
  padding-bottom: var(--bsk-space-2);
}

/* ── Carte d'univers (index « Nos univers ») ── */
.uni-card {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 200px;
  border-radius: 18px;
  overflow: hidden;
  text-decoration: none;
  color: var(--bsk-fg-primary);
}
.uni-card-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(70% 110% at 25% 30%, var(--bsk-uni), #0c1217);
}
.uni-card-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(8, 12, 11, 0.85) 30%, rgba(8, 12, 11, 0.3) 78%);
}
.uni-card-emblem {
  position: absolute;
  right: 6%;
  top: 50%;
  transform: translateY(-50%);
  font-size: 130px;
  line-height: 1;
  color: #fff;
  opacity: 0.07;
  pointer-events: none;
}
.uni-card-inner {
  position: relative;
  z-index: 2;
  padding: 30px 34px;
  max-width: 560px;
}
.uni-card-pill {
  display: inline-flex;
  font-size: var(--bsk-text-xs);
  letter-spacing: var(--bsk-tracking-widest);
  text-transform: uppercase;
  color: var(--bsk-fg-primary);
  border: 1px solid rgba(236, 228, 211, 0.3);
  border-radius: 999px;
  padding: 5px 12px;
}
.uni-card-name {
  font-family: var(--bsk-font-display);
  font-weight: 800;
  font-size: var(--bsk-text-2xl);
  line-height: 1;
  letter-spacing: -0.02em;
  margin: 14px 0 10px;
  color: var(--bsk-fg-primary);
}
.uni-card-lore {
  font-style: italic;
  font-size: var(--bsk-text-base);
  color: #e0d6bd;
  max-width: 440px;
  margin-bottom: 12px;
}
.uni-card-stats {
  font-size: var(--bsk-text-xs);
  letter-spacing: var(--bsk-tracking-wide);
  text-transform: uppercase;
  color: var(--bsk-accent-gold);
  margin-bottom: 16px;
}
.uni-card-cta {
  display: inline-block;
  font-size: var(--bsk-text-sm);
  color: var(--bsk-fg-primary);
  border: 1px solid rgba(236, 228, 211, 0.35);
  border-radius: 999px;
  padding: 9px 18px;
}

/* ── Desktop ── */
@media (min-width: 860px) {
  .uni-hero {
    min-height: 80vh;
    margin-top: -96px;
    padding: 150px 30px 64px;
  }
  .saga-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--bsk-space-8) var(--bsk-space-6);
  }
  .uni-rail-row {
    overflow: visible;
    flex-wrap: wrap;
    justify-content: center;
  }
  .uni-card {
    min-height: 240px;
  }
  .uni-card-name {
    font-size: var(--bsk-text-3xl);
  }
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- universCss
```

- [ ] **Step 5: Commit**

```bash
git add app/styles/univers.css app/styles/__tests__/universCss.test.ts
git commit -m "feat(univers): couche CSS desktop (hero, grille saga 3col) + styles UniverseCard"
```

---

### Task 2: `SagaSection` — grille en classe `saga-grid`

**Files:**
- Modify: `storefront/app/components/SagaSection.tsx`
- Test: `storefront/app/components/__tests__/SagaSection.test.tsx` (rester vert)

- [ ] **Step 1: Remplacer la grille inline par la classe**

Dans `SagaSection.tsx`, repérer le `<div>` de grille (style inline `gridTemplateColumns: '1fr 1fr'`, etc.) et le remplacer par :

```tsx
      <div className="saga-grid">
        {tomes.map((t) => (
          <TomeCard key={t.handle} {...t} />
        ))}
      </div>
```

(Retirer l'objet `style` inline de ce div — la grille vit maintenant dans `univers.css`.)

- [ ] **Step 2: Run — expect PASS (5 tests inchangés)**

```bash
cd storefront && npm test -- SagaSection
```

- [ ] **Step 3: Commit**

```bash
git add app/components/SagaSection.tsx
git commit -m "feat(univers): SagaSection grille via classe saga-grid (3col desktop)"
```

---

### Task 3: `UniverseRail` — classes ciblables desktop

**Files:**
- Modify: `storefront/app/components/UniverseRail.tsx`
- Test: `storefront/app/components/__tests__/UniverseRail.test.tsx` (rester vert + assertion classe)

- [ ] **Step 1: Ajouter les classes**

Dans `UniverseRail.tsx` : ajouter `className="uni-rail"` à la `<section>`, et `className="uni-rail-row"` au `<div>` qui contient les cartes (retirer de ce div l'inline `display/gap/overflowX/paddingBottom` — repris par `.uni-rail-row` dans `univers.css`). Les cartes (`<Link>`) gardent leur style inline (width 200, etc.).

- [ ] **Step 2: Ajouter au test**

```tsx
it('porte les classes ciblables (desktop)', () => {
  const {container} = renderWithRouter(<UniverseRail items={items} />);
  expect(container.querySelector('.uni-rail-row')).not.toBeNull();
});
```

- [ ] **Step 3: Run — expect PASS**

```bash
cd storefront && npm test -- UniverseRail
```

- [ ] **Step 4: Commit**

```bash
git add app/components/UniverseRail.tsx app/components/__tests__/UniverseRail.test.tsx
git commit -m "feat(univers): UniverseRail classe uni-rail-row (centrage desktop)"
```

---

### Task 4: `collections.$handle.tsx` — grille plate en `saga-grid` + titre hero desktop

**Files:**
- Modify: `storefront/app/routes/collections.$handle.tsx`
- Modify: `storefront/app/components/UniverseHero.tsx`

- [ ] **Step 1: Grille plate (fallback sans saga) → classe**

Dans `collections.$handle.tsx`, la branche « sans saga » contient un `<div style={{display:'grid', gridTemplateColumns:'1fr 1fr', ...}}>`. Le remplacer par `<div className="saga-grid">` (retirer le style inline).

- [ ] **Step 2: Titre hero plus grand sur desktop**

Dans `UniverseHero.tsx`, le `<h1>` a `fontSize: 'clamp(40px, 12vw, 52px)'`. Le remplacer par `fontSize: 'clamp(40px, 7vw, 64px)'` (mobile inchangé ~40px ; desktop jusqu'à 64px).

- [ ] **Step 3: Build**

```bash
cd storefront && npm run build
```

Expected : OK.

- [ ] **Step 4: Commit**

```bash
git add app/routes/collections.$handle.tsx app/components/UniverseHero.tsx
git commit -m "feat(univers): grille plate en saga-grid + titre hero desktop 64px"
```

---

### Task 5: `buildUniverseIndex` (logique pure)

Filtre les collections techniques + vides, mappe en `UniverseCardProps` (couleur, genre, citation = 1er paragraphe du lore, stats `N sagas · N tomes`).

**Files:**
- Create: `storefront/app/lib/universeIndex.ts`
- Test: `storefront/app/lib/__tests__/universeIndex.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/lib/__tests__/universeIndex.test.ts
import {describe, it, expect} from 'vitest';
import {buildUniverseIndex, type IndexCollection} from '../universeIndex';

const coll = (over: Partial<IndexCollection> & {handle: string; title: string}): IndexCollection => ({
  couleurTheme: null,
  genre: null,
  lore: null,
  sagas: {references: {nodes: []}},
  products: {nodes: []},
  ...over,
});

describe('buildUniverseIndex', () => {
  it('exclut les collections techniques et vides', () => {
    const cards = buildUniverseIndex(
      [
        coll({handle: 'all', title: 'All', products: {nodes: [{id: '1'}]}}),
        coll({handle: 'goodies', title: 'Goodies', products: {nodes: [{id: '1'}]}}),
        coll({handle: 'vide', title: 'Vide'}),
        coll({handle: 'andd', title: 'Au Nom des Dieux', products: {nodes: [{id: '1'}, {id: '2'}]}}),
      ],
      ['all', 'goodies', 'a-paraitre'],
    );
    expect(cards.map((c) => c.handle)).toEqual(['andd']);
  });

  it('mappe couleur, genre, citation et stats', () => {
    const cards = buildUniverseIndex(
      [
        coll({
          handle: 'andd',
          title: 'Au Nom des Dieux',
          couleurTheme: {value: '#2f8a78'},
          genre: {value: 'Fantastique · Mythologie'},
          lore: {value: '« Et si les légendes ? »\n\nUn long paragraphe.'},
          sagas: {references: {nodes: [{id: 's1'}, {id: 's2'}]}},
          products: {nodes: [{id: '1'}, {id: '2'}, {id: '3'}]},
        }),
      ],
      [],
    );
    const c = cards[0];
    expect(c.accent).toBe('#2f8a78');
    expect(c.genre).toBe('Fantastique · Mythologie');
    expect(c.citation).toBe('« Et si les légendes ? »');
    expect(c.stats).toBe('2 sagas · 3 tomes');
    expect(c.href).toBe('/collections/andd');
  });

  it('stats sans saga : seulement les tomes', () => {
    const cards = buildUniverseIndex(
      [coll({handle: 'x', title: 'X', products: {nodes: [{id: '1'}]}})],
      [],
    );
    expect(cards[0].stats).toBe('1 tome');
    expect(cards[0].citation).toBeNull();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- universeIndex
```

- [ ] **Step 3: Implement**

```ts
// storefront/app/lib/universeIndex.ts
import {richTextToPlain} from '~/lib/tomeMetafields';

interface MetafieldValue {
  value?: string | null;
}

export interface IndexCollection {
  handle: string;
  title: string;
  couleurTheme?: MetafieldValue | null;
  genre?: MetafieldValue | null;
  lore?: MetafieldValue | null;
  sagas?: {references?: {nodes: ReadonlyArray<{id: string}>} | null} | null;
  products: {nodes: ReadonlyArray<{id: string}>};
}

export interface UniverseCardProps {
  handle: string;
  name: string;
  genre: string | null;
  citation: string | null;
  stats: string;
  accent: string | null;
  href: string;
}

function firstParagraph(text: string): string | null {
  const paras = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paras.length > 1 ? paras[0] : null;
}

export function buildUniverseIndex(
  collections: ReadonlyArray<IndexCollection>,
  denylist: ReadonlyArray<string>,
): UniverseCardProps[] {
  const deny = new Set(denylist);
  return collections
    .filter((c) => !deny.has(c.handle) && c.products.nodes.length > 0)
    .map((c) => {
      const sagaCount = c.sagas?.references?.nodes.length ?? 0;
      const tomeCount = c.products.nodes.length;
      const stats =
        (sagaCount > 0 ? `${sagaCount} saga${sagaCount > 1 ? 's' : ''} · ` : '') +
        `${tomeCount} tome${tomeCount > 1 ? 's' : ''}`;
      return {
        handle: c.handle,
        name: c.title,
        genre: c.genre?.value?.trim() || null,
        citation: firstParagraph(richTextToPlain(c.lore?.value)),
        stats,
        accent: c.couleurTheme?.value?.trim() || null,
        href: `/collections/${c.handle}`,
      };
    });
}
```

> `citation` = 1er paragraphe du lore **s'il y en a plusieurs** (sinon `null`, pour ne pas afficher tout le lore comme citation).

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- universeIndex
```

- [ ] **Step 5: Commit**

```bash
git add app/lib/universeIndex.ts app/lib/__tests__/universeIndex.test.ts
git commit -m "feat(univers): buildUniverseIndex (filtre + map cartes index)"
```

---

### Task 6: `UNIVERSE_INDEX_FRAGMENT`

**Files:**
- Modify: `storefront/app/lib/fragments.ts`
- Test: `storefront/app/lib/__tests__/universeIndexFragment.test.ts` (create)

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/lib/__tests__/universeIndexFragment.test.ts
import {describe, it, expect} from 'vitest';
import {UNIVERSE_INDEX_FRAGMENT} from '../fragments';

describe('UNIVERSE_INDEX_FRAGMENT', () => {
  it('récupère couleur, genre, lore, sagas, produits', () => {
    expect(UNIVERSE_INDEX_FRAGMENT).toContain('fragment UniverseIndexCard on Collection');
    expect(UNIVERSE_INDEX_FRAGMENT).toContain('key: "couleur_theme"');
    expect(UNIVERSE_INDEX_FRAGMENT).toContain('key: "genre"');
    expect(UNIVERSE_INDEX_FRAGMENT).toContain('key: "lore"');
    expect(UNIVERSE_INDEX_FRAGMENT).toContain('key: "sagas"');
    expect(UNIVERSE_INDEX_FRAGMENT).toMatch(/products\(first:/);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- universeIndexFragment
```

- [ ] **Step 3: Ajouter le fragment dans `fragments.ts`** (près de `UNIVERSE_RAIL_FRAGMENT`)

```ts
export const UNIVERSE_INDEX_FRAGMENT = `#graphql
  fragment UniverseIndexCard on Collection {
    id
    handle
    title
    couleurTheme: metafield(namespace: "custom", key: "couleur_theme") { value }
    genre: metafield(namespace: "custom", key: "genre") { value }
    lore: metafield(namespace: "custom", key: "lore") { value }
    estUneOeuvreIndependante: metafield(namespace: "custom", key: "est_une_oeuvre_independante") { value }
    sagas: metafield(namespace: "custom", key: "sagas") {
      references(first: 10) { nodes { ... on Metaobject { id } } }
    }
    products(first: 50) { nodes { id } }
  }
` as const;
```

- [ ] **Step 4: Run + codegen**

```bash
cd storefront && npm test -- universeIndexFragment && npm run codegen
```

- [ ] **Step 5: Commit**

```bash
git add app/lib/fragments.ts app/lib/__tests__/universeIndexFragment.test.ts
git commit -m "feat(univers): UNIVERSE_INDEX_FRAGMENT"
```

---

### Task 7: `UniverseCard` (carte atmosphérique d'index)

**Files:**
- Create: `storefront/app/components/UniverseCard.tsx`
- Test: `storefront/app/components/__tests__/UniverseCard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/UniverseCard.test.tsx
import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {UniverseCard} from '../UniverseCard';

describe('UniverseCard', () => {
  it('rend le nom, les stats et le lien vers la page univers', () => {
    renderWithRouter(
      <UniverseCard
        handle="au-nom-des-dieux"
        name="Au Nom des Dieux"
        genre="Fantastique"
        citation="« Et si ? »"
        stats="4 sagas · 6 tomes"
        accent="#2f8a78"
        href="/collections/au-nom-des-dieux"
      />,
    );
    expect(screen.getByRole('link', {name: /Au Nom des Dieux/})).toHaveAttribute(
      'href',
      '/collections/au-nom-des-dieux',
    );
    expect(screen.getByText('4 sagas · 6 tomes')).toBeInTheDocument();
    expect(screen.getByText(/Et si/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- UniverseCard
```

- [ ] **Step 3: Implement**

```tsx
// storefront/app/components/UniverseCard.tsx
import {Link} from 'react-router';
import {universeAccentStyle} from '~/lib/universeAccent';
import type {UniverseCardProps} from '~/lib/universeIndex';

export function UniverseCard({name, genre, citation, stats, accent, href}: UniverseCardProps) {
  return (
    <Link to={href} className="uni-card" style={universeAccentStyle(accent)}>
      <span className="uni-card-bg" aria-hidden="true" />
      <span className="uni-card-scrim" aria-hidden="true" />
      <span className="uni-card-emblem" aria-hidden="true">
        ✦
      </span>
      <span className="uni-card-inner">
        {genre ? <span className="uni-card-pill">{genre}</span> : null}
        <span className="uni-card-name">{name}</span>
        {citation ? <span className="uni-card-lore">{citation}</span> : null}
        <span className="uni-card-stats">{stats}</span>
        <span className="uni-card-cta">Entrer dans l'univers →</span>
      </span>
    </Link>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- UniverseCard
```

- [ ] **Step 5: Commit**

```bash
git add app/components/UniverseCard.tsx app/components/__tests__/UniverseCard.test.tsx
git commit -m "feat(univers): UniverseCard (carte atmospherique d'index)"
```

---

### Task 8: Réécrire `collections._index.tsx` (« Nos univers »)

**Files:**
- Modify (réécriture): `storefront/app/routes/collections._index.tsx`
- Test: `storefront/app/routes/__tests__/collections-index.test.ts` (create)

- [ ] **Step 1: Write the failing test (source)**

```ts
// storefront/app/routes/__tests__/collections-index.test.ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const src = readFileSync(resolve(process.cwd(), 'app/routes/collections._index.tsx'), 'utf8');

describe('collections._index (Nos univers)', () => {
  it('utilise buildUniverseIndex + UniverseCard + le fragment + denylist', () => {
    expect(src).toContain('buildUniverseIndex');
    expect(src).toContain('UniverseCard');
    expect(src).toContain('UNIVERSE_INDEX_FRAGMENT');
    expect(src).toContain("'goodies'");
  });
  it('importe univers.css et titre « Nos univers »', () => {
    expect(src).toContain("'~/styles/univers.css'");
    expect(src).toContain('Nos univers');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- collections-index
```

- [ ] **Step 3: Réécrire `collections._index.tsx`**

```tsx
// storefront/app/routes/collections._index.tsx
import {useLoaderData} from 'react-router';
import type {Route} from './+types/collections._index';
import {Container} from '~/components/Container';
import {UniverseCard} from '~/components/UniverseCard';
import {buildUniverseIndex, type IndexCollection} from '~/lib/universeIndex';
import {UNIVERSE_INDEX_FRAGMENT} from '~/lib/fragments';
import '~/styles/univers.css';

export const meta: Route.MetaFunction = () => [{title: 'Nos univers — Bilskirnir'}];

const TECHNICAL_HANDLES = ['all', 'goodies', 'a-paraitre', 'frontpage'];

const COLLECTIONS_INDEX_QUERY = `#graphql
  query CollectionsIndex($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 50, sortKey: TITLE) {
      nodes { ...UniverseIndexCard }
    }
  }
  ${UNIVERSE_INDEX_FRAGMENT}
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const data = await context.storefront.query(COLLECTIONS_INDEX_QUERY, {
    cache: context.storefront.CacheShort(),
  });
  const universes = buildUniverseIndex(
    data.collections.nodes as unknown as IndexCollection[],
    TECHNICAL_HANDLES,
  );
  return {universes};
}

export default function Collections() {
  const {universes} = useLoaderData<typeof loader>();
  return (
    <>
      <header
        style={{
          textAlign: 'center',
          padding: 'var(--bsk-space-10) var(--bsk-space-5) var(--bsk-space-6)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--bsk-text-xs)',
            letterSpacing: 'var(--bsk-tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--bsk-accent-gold)',
            marginBottom: 'var(--bsk-space-2)',
          }}
        >
          Les mondes de la maison
        </div>
        <h1
          style={{
            fontFamily: 'var(--bsk-font-display)',
            fontWeight: 800,
            fontSize: 'var(--bsk-text-2xl)',
            letterSpacing: '-0.02em',
            color: 'var(--bsk-fg-primary)',
          }}
        >
          Nos univers
        </h1>
        <p style={{color: 'var(--bsk-fg-secondary)', marginTop: 'var(--bsk-space-3)'}}>
          Entrez dans les mondes que nous éditons.
        </p>
      </header>

      <Container width="content">
        {universes.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--bsk-fg-secondary)',
              padding: 'var(--bsk-space-10) 0',
            }}
          >
            Nos univers arrivent bientôt.
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--bsk-space-6)',
              padding: 'var(--bsk-space-2) 0 var(--bsk-space-12)',
            }}
          >
            {universes.map((u) => (
              <UniverseCard key={u.handle} {...u} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
```

- [ ] **Step 4: Régénérer les types + run + build**

```bash
cd storefront && npm run codegen && npm test -- collections-index && npm run build
```

Expected : codegen OK, test PASS, build OK.

- [ ] **Step 5: Commit**

```bash
git add app/routes/collections._index.tsx app/routes/__tests__/collections-index.test.ts storefrontapi.generated.d.ts
git commit -m "feat(univers): index /collections « Nos univers » (cartes atmospheriques)"
```

---

### Task 9: Sanity check + revue visuelle

- [ ] **Step 1: Suite + build**

```bash
cd storefront && npm test && npm run build
```

- [ ] **Step 2: Dev (`npm run dev`)**

- [ ] **`/collections`** : en-tête « Nos univers », grandes cartes atmosphériques par univers (couleur, emblème, pastille, nom, citation, stats, « Entrer dans l'univers → »), collections techniques (all/goodies/à paraître) exclues. Mobile : cartes empilées.
- [ ] **`/collections/<handle>`** desktop (≥1100px) : hero immersif teinté **sous la nav** (atmosphère continue jusqu'en haut), titre ~64px, « L'univers » centré, **grille de tomes 3 colonnes**, rail « autres univers » centré. Mobile : inchangé.
- [ ] `prefers-reduced-motion` : pas d'animation gênante. Aucune erreur console.

- [ ] **Step 3: Commit (si ajustements)**

```bash
cd storefront && npm test && git add -A && git commit -m "chore(univers): sanity pass univers desktop + index"
```

---

## Self-review (couverture spec)

| Élément spec | Tâche |
|---|---|
| §3 A. Hero immersif desktop sous nav + titre 64px | Task 1 (CSS) + Task 4 (titre) |
| §3 A. « L'univers » centré, grille tomes 3 col, rail réparti | Task 1 + Task 2 + Task 3 + Task 4 |
| §4 B. En-tête « Nos univers » | Task 8 |
| §4 B. Cartes atmosphériques par univers (UniverseCard) | Task 1 (CSS) + Task 7 |
| §4 B. Filtrage collections techniques + données | Task 5 (buildUniverseIndex) + Task 6 (fragment) + Task 8 |
| §6 Tests logique pure | Task 5, 7 |

**Différé (spec §7) :** `illustration_hero` en fond, données admin réelles. Mobile inchangé (desktop sous `@media 860px`).
```
