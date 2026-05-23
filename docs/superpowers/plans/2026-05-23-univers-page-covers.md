# Page univers centrée couvertures (parti « éventail ») — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre `/collections/$handle` pour qu'elle s'appuie sur les couvertures + la description, sans image de fond : hero avec éventail des 3 couvertures les plus récentes + titre/genre/description/stats, puis galerie responsive de tous les tomes, puis rail « autres univers ».

**Architecture:** Helper pur `pickFanCovers` (tri par date de parution) + composant `CoverFan` (éventail 1–3 couvertures) + `UniverseHero` réécrit (on retire `heroImage`/`illustration_hero`). La galerie réutilise `SagaSection`/`saga-grid` (grille passée en 2 col mobile / 4 col desktop). Couche desktop dans `univers.css` (@media 860px), hero sous la nav.

**Tech Stack:** Hydrogen (React Router v7), TypeScript, Vitest + Testing Library, Vanilla CSS (`--bsk-*`).

**Spec :** `docs/superpowers/specs/2026-05-23-univers-page-covers-design.md`

---

## Prerequisites

- [ ] `cd storefront && npm test` vert (baseline).
- [ ] On travaille sur `main` (préférence utilisateur actuelle).

## File Structure

```
storefront/app/
├── lib/
│   ├── ✨ universeFan.ts              (pickFanCovers : produits → 3 couvertures récentes)
│   └── __tests__/✨ universeFan.test.ts
├── components/
│   ├── ✨ CoverFan.tsx                (éventail 1–3 couvertures)
│   ├── ✏️ UniverseHero.tsx            (réécrit : fan + texte, sans heroImage)
│   └── __tests__/
│       ├── ✨ CoverFan.test.tsx
│       └── ✏️ UniverseHero.test.tsx   (réécrit)
├── styles/
│   ├── ✏️ univers.css                 (hero fan layout + CoverFan + grille 2/4 col)
│   └── __tests__/✏️ universCss.test.ts
└── routes/
    ├── ✏️ collections.$handle.tsx       (wire pickFanCovers + nouvelles props, retire heroImage + section « L'univers » + splitLore)
    └── __tests__/✏️ collection-univers.test.ts
```

---

### Task 1: `pickFanCovers` (logique pure)

**Files:**
- Create: `storefront/app/lib/universeFan.ts`
- Test: `storefront/app/lib/__tests__/universeFan.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/lib/__tests__/universeFan.test.ts
import {describe, it, expect} from 'vitest';
import {pickFanCovers, type FanProduct} from '../universeFan';

const prod = (over: Partial<FanProduct>): FanProduct => ({
  title: 'T',
  featuredImage: {url: 'u', altText: null},
  dateParution: null,
  ...over,
});

describe('pickFanCovers', () => {
  it('trie par date de parution décroissante, sans date en dernier', () => {
    const covers = pickFanCovers([
      prod({title: 'A', featuredImage: {url: 'a', altText: null}, dateParution: {value: '2025-01-01'}}),
      prod({title: 'B', featuredImage: {url: 'b', altText: null}, dateParution: {value: '2026-06-01'}}),
      prod({title: 'C', featuredImage: {url: 'c', altText: null}, dateParution: null}),
    ]);
    expect(covers.map((c) => c.url)).toEqual(['b', 'a', 'c']);
  });

  it('plafonne à 3 et ignore les produits sans couverture', () => {
    const covers = pickFanCovers([
      prod({featuredImage: null, dateParution: {value: '2026-01-01'}}),
      prod({featuredImage: {url: '1', altText: null}, dateParution: {value: '2025-05-01'}}),
      prod({featuredImage: {url: '2', altText: null}, dateParution: {value: '2025-04-01'}}),
      prod({featuredImage: {url: '3', altText: null}, dateParution: {value: '2025-03-01'}}),
      prod({featuredImage: {url: '4', altText: null}, dateParution: {value: '2025-02-01'}}),
    ]);
    expect(covers).toHaveLength(3);
    expect(covers.map((c) => c.url)).toEqual(['1', '2', '3']);
  });

  it('utilise le titre comme alt par défaut', () => {
    const covers = pickFanCovers([
      prod({title: 'Le Réveil', featuredImage: {url: 'x', altText: null}}),
    ]);
    expect(covers[0].altText).toBe('Le Réveil');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- --run universeFan
```

- [ ] **Step 3: Implement**

```ts
// storefront/app/lib/universeFan.ts
export interface FanCover {
  url: string;
  altText: string;
}

export interface FanProduct {
  title: string;
  featuredImage?: {url: string; altText?: string | null} | null;
  dateParution?: {value?: string | null} | null;
}

/** Couvertures pour l'éventail : les `max` tomes les plus récemment parus
 * (date ISO `YYYY-MM-DD` décroissante ; sans date → en dernier), sans les
 * produits dépourvus de couverture. */
export function pickFanCovers(products: ReadonlyArray<FanProduct>, max = 3): FanCover[] {
  return products
    .filter((p) => p.featuredImage?.url)
    .map((p) => ({
      url: p.featuredImage!.url,
      altText: p.featuredImage!.altText ?? p.title,
      date: p.dateParution?.value ?? null,
    }))
    .sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date);
      if (a.date) return -1;
      if (b.date) return 1;
      return 0;
    })
    .slice(0, max)
    .map(({url, altText}) => ({url, altText}));
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- --run universeFan
```

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/uriel/Desktop/DEVs/bilskirnir"
git add storefront/app/lib/universeFan.ts storefront/app/lib/__tests__/universeFan.test.ts
git commit -m "feat(univers): pickFanCovers (3 couvertures les plus recentes)"
```

---

### Task 2: `CoverFan` (composant éventail)

**Files:**
- Create: `storefront/app/components/CoverFan.tsx`
- Test: `storefront/app/components/__tests__/CoverFan.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/CoverFan.test.tsx
import {describe, it, expect} from 'vitest';
import {render} from '@testing-library/react';
import {CoverFan} from '../CoverFan';

describe('CoverFan', () => {
  it('rend jusqu’à 3 couvertures', () => {
    const covers = [1, 2, 3, 4, 5].map((n) => ({url: `u${n}`, altText: `A${n}`}));
    const {container} = render(<CoverFan covers={covers} />);
    expect(container.querySelectorAll('img')).toHaveLength(3);
  });
  it('rend ce qui est dispo si moins de 3', () => {
    const {container} = render(<CoverFan covers={[{url: 'u', altText: 'a'}]} />);
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(container.querySelector('.uni-fan--1')).not.toBeNull();
  });
  it('ne rend rien si vide', () => {
    const {container} = render(<CoverFan covers={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- --run CoverFan
```

- [ ] **Step 3: Implement**

```tsx
// storefront/app/components/CoverFan.tsx
import type {FanCover} from '~/lib/universeFan';

export function CoverFan({covers}: {covers: FanCover[]}) {
  const shown = covers.slice(0, 3);
  if (shown.length === 0) return null;
  return (
    <div className={`uni-fan uni-fan--${shown.length}`} aria-hidden="true">
      {shown.map((c, i) => (
        <img key={i} className="uni-fan-cover" src={c.url} alt={c.altText} loading="lazy" />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- --run CoverFan
```

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/uriel/Desktop/DEVs/bilskirnir"
git add storefront/app/components/CoverFan.tsx storefront/app/components/__tests__/CoverFan.test.tsx
git commit -m "feat(univers): composant CoverFan (eventail 1-3 couvertures)"
```

---

### Task 3: `UniverseHero` réécrit (fan + texte, sans heroImage)

**Files:**
- Modify (réécriture): `storefront/app/components/UniverseHero.tsx`
- Modify (réécriture): `storefront/app/components/__tests__/UniverseHero.test.tsx`

- [ ] **Step 1: Réécrire le test**

```tsx
// storefront/app/components/__tests__/UniverseHero.test.tsx
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {UniverseHero} from '../UniverseHero';

describe('UniverseHero', () => {
  it('rend titre + genre + lore + stats + éventail', () => {
    const {container} = render(
      <UniverseHero
        title="Au Nom des Dieux"
        genre="Fantastique · Mythologie"
        lore="Quand les dieux se sont tus."
        stats="2 tomes"
        fanCovers={[
          {url: 'a', altText: 'A'},
          {url: 'b', altText: 'B'},
        ]}
      />,
    );
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Au Nom des Dieux');
    expect(screen.getByText('Fantastique · Mythologie')).toBeInTheDocument();
    expect(screen.getByText('Quand les dieux se sont tus.')).toBeInTheDocument();
    expect(screen.getByText('2 tomes')).toBeInTheDocument();
    expect(container.querySelectorAll('.uni-fan img')).toHaveLength(2);
  });

  it('omet genre et lore quand absents', () => {
    render(<UniverseHero title="Fracture" stats="1 tome" />);
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Fracture');
    expect(screen.queryByText('Fantastique · Mythologie')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- --run UniverseHero
```

- [ ] **Step 3: Réécrire `UniverseHero.tsx`**

```tsx
// storefront/app/components/UniverseHero.tsx
import emblem from '~/assets/bilskirnir-emblem.png';
import {CoverFan} from '~/components/CoverFan';
import type {FanCover} from '~/lib/universeFan';

export interface UniverseHeroProps {
  title: string;
  genre?: string | null;
  lore?: string | null;
  stats?: string | null;
  fanCovers?: FanCover[];
}

export function UniverseHero({title, genre, lore, stats, fanCovers = []}: UniverseHeroProps) {
  return (
    <header className="uni-hero">
      <div className="uni-hero-bg" />
      <div className="uni-fog" />
      <img className="uni-emblem" src={emblem} alt="" aria-hidden="true" />

      <div className="uni-hero-inner">
        <CoverFan covers={fanCovers} />
        <div className="uni-hero-text uni-rise">
          {genre ? <span className="uni-hero-pill">{genre}</span> : null}
          <h1 className="uni-hero-title">{title}</h1>
          {lore ? <p className="uni-hero-lore">{lore}</p> : null}
          {stats ? <p className="uni-hero-stats">{stats}</p> : null}
        </div>
      </div>
    </header>
  );
}
```

> Supprime `HeroImage`, `heroImage`, `kicker`, `quote`, `uni-cue`. Le seul consommateur est `collections.$handle.tsx` (mis à jour en Task 5).

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- --run UniverseHero CoverFan
```

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/uriel/Desktop/DEVs/bilskirnir"
git add storefront/app/components/UniverseHero.tsx storefront/app/components/__tests__/UniverseHero.test.tsx
git commit -m "feat(univers): UniverseHero reecrit (eventail + texte, sans image de fond)"
```

---

### Task 4: `univers.css` — hero fan layout + CoverFan + grille 2/4 colonnes

**Files:**
- Modify: `storefront/app/styles/univers.css`
- Modify: `storefront/app/styles/__tests__/universCss.test.ts`

- [ ] **Step 1: Mettre à jour le test CSS**

Dans `app/styles/__tests__/universCss.test.ts`, remplacer le `it('couche desktop …')` par :

```ts
  it('couche desktop : grille tomes 4 colonnes + carte univers + éventail', () => {
    expect(css).toMatch(/@media\s*\(min-width:\s*860px\)/);
    expect(css).toContain('.saga-grid');
    expect(css).toContain('repeat(4');
    expect(css).toContain('.uni-card');
    expect(css).toContain('.uni-fan');
  });
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- --run universCss
```

- [ ] **Step 3a: Remplacer le bloc `.uni-hero`** (en tête de `univers.css`)

Remplacer :

```css
.uni-hero {
  position: relative;
  min-height: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 90px 26px 48px;
  overflow: hidden;
}
```

par :

```css
.uni-hero {
  position: relative;
  padding: 70px 24px 44px;
  overflow: hidden;
}
.uni-hero-inner {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--bsk-space-6);
}
.uni-hero-text {
  max-width: 520px;
}
.uni-hero-pill {
  display: inline-flex;
  font-size: var(--bsk-text-xs);
  letter-spacing: var(--bsk-tracking-widest);
  text-transform: uppercase;
  color: var(--bsk-fg-primary);
  border: 1px solid var(--bsk-border-subtle);
  border-radius: 999px;
  padding: 6px 13px;
}
.uni-hero-title {
  font-family: var(--bsk-font-display);
  font-weight: 800;
  font-size: clamp(36px, 9vw, 46px);
  line-height: 0.95;
  letter-spacing: -0.02em;
  margin: var(--bsk-space-4) 0 var(--bsk-space-3);
  color: var(--bsk-fg-primary);
}
.uni-hero-lore {
  font-style: italic;
  font-size: var(--bsk-text-read);
  line-height: 1.6;
  color: #d8ceb6;
  margin: 0 0 var(--bsk-space-4);
}
.uni-hero-stats {
  font-family: var(--bsk-font-sans);
  font-size: var(--bsk-text-xs);
  letter-spacing: var(--bsk-tracking-widest);
  text-transform: uppercase;
  color: var(--bsk-accent-gold);
}

/* Éventail de couvertures (décoratif, 1–3) */
.uni-fan {
  position: relative;
  flex: 0 0 auto;
  width: 226px;
  height: 232px;
  margin: 0 auto;
}
.uni-fan-cover {
  position: absolute;
  top: 8px;
  width: 130px;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: var(--bsk-shadow-cover);
  background: var(--bsk-bg-raised);
}
.uni-fan--1 .uni-fan-cover:nth-child(1) { left: 48px; transform: rotate(-2deg); }
.uni-fan--2 .uni-fan-cover:nth-child(1) { left: 18px; transform: rotate(-8deg); }
.uni-fan--2 .uni-fan-cover:nth-child(2) { left: 78px; top: 0; transform: rotate(7deg); z-index: 2; }
.uni-fan--3 .uni-fan-cover:nth-child(1) { left: 0; transform: rotate(-9deg); }
.uni-fan--3 .uni-fan-cover:nth-child(2) { left: 48px; top: 0; transform: rotate(2deg); z-index: 3; }
.uni-fan--3 .uni-fan-cover:nth-child(3) { left: 96px; transform: rotate(11deg); z-index: 2; }
```

- [ ] **Step 3b: Mettre à jour le bloc desktop** `@media (min-width: 860px)`

Dans `univers.css`, repérer le bloc `@media (min-width: 860px) { … }` et remplacer son contenu par :

```css
@media (min-width: 860px) {
  .uni-hero {
    margin-top: -96px;
    padding: 150px 44px 56px;
  }
  .uni-hero-inner {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    text-align: left;
    gap: var(--bsk-space-10);
  }
  .uni-hero-text {
    text-align: left;
  }
  .uni-hero-title {
    font-size: clamp(44px, 5vw, 60px);
  }
  .saga-grid {
    grid-template-columns: repeat(4, 1fr);
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

- [ ] **Step 3c: Passer `.saga-grid` (base mobile) en 2 colonnes**

Remplacer le bloc de base :

```css
.saga-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--bsk-space-6) var(--bsk-space-5);
  align-items: start;
}
```

par (identique mais explicite `repeat(2, 1fr)`) :

```css
.saga-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--bsk-space-6) var(--bsk-space-5);
  align-items: start;
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- --run universCss
```

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/uriel/Desktop/DEVs/bilskirnir"
git add storefront/app/styles/univers.css storefront/app/styles/__tests__/universCss.test.ts
git commit -m "feat(univers): CSS hero eventail (2 col mobile / row+4 col desktop) + styles CoverFan"
```

---

### Task 5: `collections.$handle.tsx` — câbler l'éventail + retirer l'image/section « L'univers »

**Files:**
- Modify: `storefront/app/routes/collections.$handle.tsx`
- Modify: `storefront/app/routes/__tests__/collection-univers.test.ts`

- [ ] **Step 1: Mettre à jour le test source**

Remplacer le `it('utilise splitLore, UniverseRail…')` par :

```ts
  it('utilise pickFanCovers, UniverseRail et la query otherUniverses', () => {
    expect(src).toContain('pickFanCovers');
    expect(src).toContain('UniverseRail');
    expect(src).toContain('otherUniverses');
    expect(src).toContain('UNIVERSE_RAIL_FRAGMENT');
  });
  it('ne dépend plus de heroImage', () => {
    expect(src).not.toContain('heroImage');
  });
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- --run collection-univers
```

- [ ] **Step 3a: Imports** — dans `collections.$handle.tsx`, remplacer

```ts
import {splitLore} from '~/lib/lore';
```

par

```ts
import {pickFanCovers} from '~/lib/universeFan';
```

- [ ] **Step 3b: Données** — remplacer

```ts
  const genre = collection.genre?.value ?? null;
  const {quote, body} = splitLore(richTextToPlain(collection.lore?.value));

  const heroImageRef = collection.illustrationHero?.reference?.image;
  const heroImage = heroImageRef
    ? {
        url: heroImageRef.url,
        altText: heroImageRef.altText ?? collection.title,
        width: heroImageRef.width ?? 0,
        height: heroImageRef.height ?? 0,
      }
    : null;
```

par

```ts
  const genre = collection.genre?.value ?? null;
  const lore = richTextToPlain(collection.lore?.value);
  const fanCovers = pickFanCovers(collection.products.nodes);
```

- [ ] **Step 3c: Hero** — remplacer le `<UniverseHero …>` :

```tsx
      <UniverseHero
        title={collection.title}
        kicker={genre}
        quote={quote}
        stats={stats}
        heroImage={heroImage}
      />
```

par

```tsx
      <UniverseHero
        title={collection.title}
        genre={genre}
        lore={lore}
        stats={stats}
        fanCovers={fanCovers}
      />
```

- [ ] **Step 3d: Retirer la section « L'univers »** — supprimer entièrement le bloc :

```tsx
      {body ? (
        <Container width="reading">
          <section style={{padding: 'var(--bsk-space-8) 0'}}>
            <p
              style={{
                fontSize: 'var(--bsk-text-xs)',
                letterSpacing: 'var(--bsk-tracking-widest)',
                textTransform: 'uppercase',
                color: 'var(--bsk-accent-gold)',
                textAlign: 'center',
                marginBottom: 'var(--bsk-space-4)',
              }}
            >
              L'univers
            </p>
            <p
              style={{
                fontSize: 'var(--bsk-text-read)',
                lineHeight: 1.75,
                color: 'var(--bsk-fg-primary)',
                whiteSpace: 'pre-line',
              }}
            >
              {body}
            </p>
          </section>
        </Container>
      ) : null}
```

> La description vit maintenant dans le hero (`lore`). Si `Container` n'est plus utilisé ailleurs dans le fichier, retirer son import ; sinon le laisser. (Il reste utilisé pour les sections sagas/grille et le rail → **garder** l'import.)

- [ ] **Step 4: Codegen + run + build**

```bash
cd storefront && npm run codegen && npm test -- --run collection-univers UniverseHero && npm run build
```

Expected : codegen OK, tests PASS, build OK.

- [ ] **Step 5: Commit**

```bash
cd "C:/Users/uriel/Desktop/DEVs/bilskirnir"
git add storefront/app/routes/collections.$handle.tsx storefront/app/routes/__tests__/collection-univers.test.ts storefront/storefrontapi.generated.d.ts
git commit -m "feat(univers): page univers cablee sur l'eventail (lore au hero, sans image)"
```

---

### Task 6: Sanity + revue visuelle

- [ ] **Step 1: Suite complète + build**

```bash
cd storefront && npm test && npm run build
```

- [ ] **Step 2: `npm run dev` — vérifier `/collections/au-nom-des-dieux`**

- [ ] Hero **sans image** : éventail des couvertures (2 ici) à gauche, teinte `#8b6b3a`, titre, description (lore), stats « 2 tomes ». Mobile : éventail centré au-dessus, texte dessous.
- [ ] Desktop ≥860px : hero en 2 colonnes, sous la nav ; grille de tomes **4 colonnes** (2 en mobile).
- [ ] Pas de pastille genre (genre vide en base) — normal. Rail « autres univers » présent.
- [ ] `prefers-reduced-motion` : pas d'animation gênante. Aucune erreur console.

- [ ] **Step 3: Commit (si ajustements)**

```bash
cd "C:/Users/uriel/Desktop/DEVs/bilskirnir"
git add -A && git commit -m "chore(univers): sanity pass page univers couvertures"
```

---

## Self-review (couverture spec)

| Élément spec | Tâche |
|---|---|
| Hero sans image : éventail 3 couv. récentes + genre/titre/lore/stats | Task 1 (pickFanCovers) + Task 2 (CoverFan) + Task 3 (UniverseHero) + Task 4 (CSS) + Task 5 (câblage) |
| Galerie responsive 2/4 col, sagas si dispo sinon grille unique | Task 4 (saga-grid) — `SagaSection`/flat grid déjà en place |
| Rail « autres univers » réutilisé | déjà en place (inchangé) |
| États : 0 produit, 1–2 couv., genre/lore vides, sagas vides | Task 2 (CoverFan 1/2/3 + null) + Task 3 (omissions) + grille existante |
| Retrait `illustration_hero`/heroImage | Task 3 + Task 5 |
| Tests pickFanCovers / CoverFan / UniverseHero / CSS | Tasks 1–4 |

**Différé (spec) :** remplissage des données Shopify (genre, sagas, tomes) = tâche contenu, hors code. Pas de carrousel/lightbox.
```
