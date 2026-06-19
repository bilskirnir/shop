# Refonte 2 — Phase B : Accueil vertical « Reels » par saga + Footer F3 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le slider horizontal de l'accueil par une **séquence verticale plein-écran à scroll-snap, 1 écran = 1 saga** (one-shots = 1 écran chacun), façon Reels, avec parallax, puces de progression, et le **footer F3** comme dernier panneau ; le footer global des autres pages adopte la même peau.

**Architecture :** Les sagas sont des **metaobjects** liés à chaque collection (univers) par le metafield `custom.sagas` (déjà utilisé par la page univers). Un module pur `homeScreens.ts` transforme `collections (+ leurs sagas) + produits standalone` en `HomeScreen[]`. Si une collection n'a pas de saga renseignée, on **retombe** sur 1 écran dérivé de la collection (comme l'accueil actuel) — la home tourne donc en dev avant que Gautier crée les sagas. Le composant `SagaScroller` (CSS `scroll-snap`) rend un `SagaPanel` par écran + `ProgressDots` (Phase A) + le `Footer` en panneau final. Accent/halo par saga via `universeAccentStyle`/`resolveAccentColor` (Phase A).

**Tech Stack :** Hydrogen (React Router 7) + Storefront GraphQL, Vitest + Testing Library. Green bar = `npm test` + `npm run build` depuis `storefront/`. `npm run typecheck` a des erreurs de scaffold préexistantes hors périmètre.

## Global Constraints

- 1 écran plein (`100vh`) = 1 saga ; one-shots = 1 écran chacun ; pas d'écran d'intro ; **footer = dernier écran** sur la home.
- Mécanique = **CSS `scroll-snap-type: y mandatory`** (pas de scroll-hijack JS) + couches parallax + animations d'entrée. `prefers-reduced-motion` désactive parallax/animations et dégrade le snap.
- Peau « encre » Phase A : `var(--bsk-ink)`, `var(--bsk-cream)`, accent `var(--bsk-uni)` (crème neutre par défaut), polices `var(--bsk-font-display)` (Bricolage) / `var(--bsk-font-sans)` (Inter). **Zéro doré nouveau.**
- Composition validée : **mobile = compo A** (éventail centre-haut, titre géant bas-gauche, lore, CTA crème) ; **desktop ≥860px = D1** (titre bas-gauche, éventail tilté droite). CTA saga « Entrer dans la saga » → page univers ancrée ; CTA one-shot « Découvrir le livre » → fiche produit.
- Réutiliser **`CoverFan`**, **`ProgressDots`**, **`universeAccentStyle`/`resolveAccentColor`**, les classes **`atoms.css`** (`.bsk-kicker`, `.bsk-btn`/`--cream`, `.bsk-halo`, `.bsk-grain`, `.bsk-dots`), et les helpers `tomeMetafields` (`parseBool`, `parseNumeroTome`, `parseStatutParution`, `metaobjectField`, `richTextToPlain`).
- Tous les chemins partent de `storefront/`.

---

## Étape 0 (avant la Task 1) : confirmer les clés du metaobject Saga

Le metaobject saga est référencé par `collection.sagas`. La page univers le lit déjà (`UNIVERSE_DETAIL_FRAGMENT`, `app/routes/collections.$handle.tsx`). **Avant de coder**, confirmer les **clés de champ réelles** du metaobject saga sur le store live :

```
{ metaobjectDefinitions(first:20){ nodes { type fieldDefinitions { key } } } }
```
ou via une collection peuplée : `{ collection(handle:"au-nom-des-dieux"){ sagas:metafield(namespace:"custom",key:"sagas"){ references(first:5){ nodes{ ... on Metaobject { type fields{ key } } } } } } }`.

Ce plan **suppose** les clés `nom`, `accroche`, `lore`, `couleur`, et une liste de tomes `tomes` (références produits). Si une clé diffère, remplacer la constante correspondante en tête de `homeScreens.ts` (`SAGA_KEYS`) et dans le fragment. Le store dev n'ayant pas encore de saga, le **fallback collection** (Task 2) couvre le rendu dev — Étape 0 n'est bloquante que pour l'affichage réel des sagas.

---

## Task 1: Fragment GraphQL `HOME_SAGA_FRAGMENT` + requête home enrichie

**Files:**
- Modify: `app/lib/fragments.ts` (ajouter en fin de fichier)
- Test: `app/lib/__tests__/homeSagaFragment.test.ts` (créer)

**Interfaces:**
- Produces: `HOME_SAGA_FRAGMENT` (fragment `on Collection` : champs univers + `sagas` → metaobjects avec `fields { key value }` et les couvertures des tomes de la saga).

- [ ] **Step 1: Écrire le test (échec attendu)**

Créer `app/lib/__tests__/homeSagaFragment.test.ts` :

```ts
import {describe, it, expect} from 'vitest';
import {HOME_SAGA_FRAGMENT} from '../fragments';

describe('HOME_SAGA_FRAGMENT', () => {
  it('cible la collection, ses sagas metaobjects et les couvertures', () => {
    expect(HOME_SAGA_FRAGMENT).toContain('fragment HomeSaga on Collection');
    expect(HOME_SAGA_FRAGMENT).toContain('key: "couleur_theme"');
    expect(HOME_SAGA_FRAGMENT).toContain('key: "sagas"');
    expect(HOME_SAGA_FRAGMENT).toContain('... on Metaobject');
    expect(HOME_SAGA_FRAGMENT).toContain('fields { key value');
    expect(HOME_SAGA_FRAGMENT).toContain('references(first: 6)');
    expect(HOME_SAGA_FRAGMENT).toContain('featuredImage { url altText }');
  });
});
```

- [ ] **Step 2: Lancer le test, vérifier l'échec** — Run: `npm test -- homeSagaFragment` → FAIL (export absent).

- [ ] **Step 3: Ajouter le fragment dans `fragments.ts`**

```ts
export const HOME_SAGA_FRAGMENT = `#graphql
  fragment HomeSaga on Collection {
    id
    handle
    title
    estUneOeuvreIndependante: metafield(namespace: "custom", key: "est_une_oeuvre_independante") { value }
    lore: metafield(namespace: "custom", key: "lore") { value }
    couleurTheme: metafield(namespace: "custom", key: "couleur_theme") { value }
    sagas: metafield(namespace: "custom", key: "sagas") {
      references(first: 10) {
        nodes {
          ... on Metaobject {
            id
            handle
            fields {
              key
              value
              references(first: 6) {
                nodes {
                  ... on Product {
                    featuredImage { url altText }
                    numeroTome: metafield(namespace: "custom", key: "numero_tome") { value }
                  }
                }
              }
            }
          }
        }
      }
    }
    products(first: 6, sortKey: COLLECTION_DEFAULT) {
      nodes {
        featuredImage { url altText }
        numeroTome: metafield(namespace: "custom", key: "numero_tome") { value }
        statutParution: metafield(namespace: "custom", key: "statut_parution") { value }
      }
    }
  }
` as const;
```

- [ ] **Step 4: Lancer le test** — Run: `npm test -- homeSagaFragment` → PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/fragments.ts app/lib/__tests__/homeSagaFragment.test.ts
git commit -m "feat(accueil): fragment HomeSaga (collection + sagas metaobjects + couvertures)"
```

---

## Task 2: `buildHomeScreens` (sagas + fallback collection + one-shots)

**Files:**
- Create: `app/lib/homeScreens.ts`
- Test: `app/lib/__tests__/homeScreens.test.ts`

**Interfaces:**
- Consumes: helpers `tomeMetafields` (`parseBool`, `parseNumeroTome`, `parseStatutParution`, `metaobjectField`, `richTextToPlain`), `resolveAccentColor` (Phase A), type `FanCover`.
- Produces:
  - `interface HomeScreen { key: string; kind: 'saga' | 'universe' | 'oneshot'; kicker: string; title: string; lore: string | null; accent: string | null; covers: FanCover[]; href: string; ctaLabel: string }`
  - `buildHomeScreens(collections: ScreenCollection[], works: ScreenWork[]): HomeScreen[]`
  - input types `ScreenCollection` / `ScreenWork` / `SagaNode` (exported for the test + loader cast).

- [ ] **Step 1: Écrire le test (échec attendu)**

Créer `app/lib/__tests__/homeScreens.test.ts` :

```ts
import {describe, it, expect} from 'vitest';
import {buildHomeScreens, type ScreenCollection, type ScreenWork} from '../homeScreens';

const cover = (n: number) => ({featuredImage: {url: `https://x/t${n}.jpg`, altText: `T${n}`}, numeroTome: {value: String(n)}});

const sagaNode = () => ({
  id: 'gid://m/1', handle: 'eau-et-sang',
  fields: [
    {key: 'nom', value: "De l'Eau et du Sang", references: null},
    {key: 'accroche', value: "L'arc fondateur", references: null},
    {key: 'couleur', value: '#2fb6c4', references: null},
    {key: 'tomes', value: null, references: {nodes: [cover(2), cover(1)]}},
  ],
});

const universe = (overrides: Partial<ScreenCollection> = {}): ScreenCollection => ({
  id: 'gid://c/1', handle: 'au-nom-des-dieux', title: 'Au Nom des Dieux',
  estUneOeuvreIndependante: {value: 'false'},
  lore: {value: 'Quand les dieux se sont tus.'},
  couleurTheme: {value: '#114b45'},
  sagas: {references: {nodes: [sagaNode()]}},
  products: {nodes: [cover(1), cover(2)]},
  ...overrides,
});

const work = (overrides: Partial<ScreenWork> = {}): ScreenWork => ({
  id: 'gid://p/9', handle: 'berserker', title: 'Berserker',
  estUneOeuvreIndependante: {value: 'true'},
  featuredImage: {url: 'https://x/b.jpg', altText: 'Berserker'},
  teaserCourt: {value: 'La rage, et la neige.'},
  statutParution: {value: 'publié'},
  ...overrides,
});

describe('buildHomeScreens', () => {
  it('produit un écran par saga (nom, lore, accent saga, couvertures triées, CTA univers)', () => {
    const [s] = buildHomeScreens([universe()], []);
    expect(s.kind).toBe('saga');
    expect(s.title).toBe("De l'Eau et du Sang");
    expect(s.accent).toBe('#2fb6c4');
    expect(s.covers.map((c) => c.altText)).toEqual(['T1', 'T2']);
    expect(s.href).toBe('/collections/au-nom-des-dieux#eau-et-sang');
    expect(s.ctaLabel).toBe('Entrer dans la saga');
  });

  it("retombe sur 1 écran collection si pas de saga (accent = couleur d'univers)", () => {
    const u = universe({sagas: null});
    const [s] = buildHomeScreens([u], []);
    expect(s.kind).toBe('universe');
    expect(s.title).toBe('Au Nom des Dieux');
    expect(s.accent).toBe('#114b45');
    expect(s.covers).toHaveLength(2);
    expect(s.href).toBe('/collections/au-nom-des-dieux');
  });

  it('hérite de la couleur univers si la saga n’a pas de couleur', () => {
    const node = sagaNode();
    node.fields = node.fields.filter((f) => f.key !== 'couleur');
    const u = universe({sagas: {references: {nodes: [node]}}});
    expect(buildHomeScreens([u], [])[0].accent).toBe('#114b45');
  });

  it('produit un écran one-shot par œuvre indépendante avec couverture', () => {
    const [s] = buildHomeScreens([], [work()]);
    expect(s.kind).toBe('oneshot');
    expect(s.kicker).toBe('Roman indépendant');
    expect(s.covers).toHaveLength(1);
    expect(s.href).toBe('/products/berserker');
    expect(s.ctaLabel).toBe('Découvrir le livre');
  });

  it('exclut une œuvre indépendante sans couverture et un univers sans couverture', () => {
    expect(buildHomeScreens([], [work({featuredImage: null})])).toHaveLength(0);
    const empty = universe({sagas: null, products: {nodes: []}});
    expect(buildHomeScreens([empty], [])).toHaveLength(0);
  });

  it('ordonne sagas/univers avant one-shots', () => {
    const screens = buildHomeScreens([universe()], [work()]);
    expect(screens.map((s) => s.kind)).toEqual(['saga', 'oneshot']);
  });
});
```

- [ ] **Step 2: Lancer le test** — Run: `npm test -- homeScreens` → FAIL (module absent).

- [ ] **Step 3: Créer `app/lib/homeScreens.ts`**

```ts
import {
  parseBool,
  parseNumeroTome,
  parseStatutParution,
  metaobjectField,
  richTextToPlain,
} from '~/lib/tomeMetafields';
import {resolveAccentColor} from '~/lib/universeAccent';
import type {FanCover} from '~/lib/universeFan';

interface MV {value?: string | null}
interface ProductCover {
  featuredImage?: {url: string; altText?: string | null} | null;
  numeroTome?: MV | null;
  statutParution?: MV | null;
}
interface SagaField {
  key: string;
  value?: string | null;
  references?: {nodes: ProductCover[]} | null;
}
export interface SagaNode {id: string; handle: string; fields: SagaField[]}
export interface ScreenCollection {
  id: string; handle: string; title: string;
  estUneOeuvreIndependante?: MV | null;
  lore?: MV | null;
  couleurTheme?: MV | null;
  sagas?: {references?: {nodes: SagaNode[]} | null} | null;
  products: {nodes: ProductCover[]};
}
export interface ScreenWork {
  id: string; handle: string; title: string;
  estUneOeuvreIndependante?: MV | null;
  featuredImage?: {url: string; altText?: string | null} | null;
  teaserCourt?: MV | null;
  statutParution?: MV | null;
}

export interface HomeScreen {
  key: string;
  kind: 'saga' | 'universe' | 'oneshot';
  kicker: string;
  title: string;
  lore: string | null;
  accent: string | null;
  covers: FanCover[];
  href: string;
  ctaLabel: string;
}

const SAGA_KEYS = {nom: 'nom', accroche: 'accroche', lore: 'lore', couleur: 'couleur', tomes: 'tomes'};

/** Trie par n° de tome puis garde les 3 premières couvertures non nulles. */
function coversFrom(nodes: ProductCover[]): FanCover[] {
  return [...nodes]
    .sort((a, b) => parseNumeroTome(a.numeroTome?.value) - parseNumeroTome(b.numeroTome?.value))
    .map((p) => (p.featuredImage?.url ? {url: p.featuredImage.url, altText: p.featuredImage.altText ?? ''} : null))
    .filter((c): c is FanCover => c !== null)
    .slice(0, 3);
}

function sagaScreen(u: ScreenCollection, node: SagaNode): HomeScreen | null {
  const refs = node.fields.find((f) => f.key === SAGA_KEYS.tomes)?.references?.nodes ?? [];
  const covers = coversFrom(refs);
  if (covers.length === 0) return null;
  const accent = resolveAccentColor(metaobjectField(node.fields, SAGA_KEYS.couleur), u.couleurTheme?.value);
  const lore = richTextToPlain(
    metaobjectField(node.fields, SAGA_KEYS.lore) ?? metaobjectField(node.fields, SAGA_KEYS.accroche),
  ).trim();
  return {
    key: node.id,
    kind: 'saga',
    kicker: `${u.title} — Saga`,
    title: metaobjectField(node.fields, SAGA_KEYS.nom) ?? node.handle,
    lore: lore || null,
    accent,
    covers,
    href: `/collections/${u.handle}#${node.handle}`,
    ctaLabel: 'Entrer dans la saga',
  };
}

function universeScreen(u: ScreenCollection): HomeScreen | null {
  const covers = coversFrom(u.products.nodes);
  if (covers.length === 0) return null;
  return {
    key: u.id,
    kind: 'universe',
    kicker: 'Univers',
    title: u.title,
    lore: richTextToPlain(u.lore?.value).trim() || null,
    accent: resolveAccentColor(null, u.couleurTheme?.value),
    covers,
    href: `/collections/${u.handle}`,
    ctaLabel: "Explorer l'univers",
  };
}

function workScreen(w: ScreenWork): HomeScreen | null {
  if (!parseBool(w.estUneOeuvreIndependante?.value)) return null;
  if (!w.featuredImage?.url) return null;
  const status = parseStatutParution(w.statutParution?.value);
  return {
    key: w.id,
    kind: 'oneshot',
    kicker: 'Roman indépendant',
    title: w.title,
    lore: richTextToPlain(w.teaserCourt?.value).trim() || null,
    accent: null,
    covers: [{url: w.featuredImage.url, altText: w.featuredImage.altText ?? w.title}],
    href: `/products/${w.handle}`,
    ctaLabel: status === 'précommande' ? 'Précommander' : 'Découvrir le livre',
  };
}

export function buildHomeScreens(
  collections: ReadonlyArray<ScreenCollection>,
  works: ReadonlyArray<ScreenWork>,
): HomeScreen[] {
  const out: HomeScreen[] = [];
  for (const u of collections) {
    if (parseBool(u.estUneOeuvreIndependante?.value)) continue;
    const sagas = u.sagas?.references?.nodes ?? [];
    const sagaScreens = sagas.map((n) => sagaScreen(u, n)).filter((s): s is HomeScreen => s !== null);
    if (sagaScreens.length > 0) out.push(...sagaScreens);
    else {
      const fallback = universeScreen(u);
      if (fallback) out.push(fallback);
    }
  }
  for (const w of works) {
    const s = workScreen(w);
    if (s) out.push(s);
  }
  return out;
}
```

- [ ] **Step 4: Lancer le test** — Run: `npm test -- homeScreens` → PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/homeScreens.ts app/lib/__tests__/homeScreens.test.ts
git commit -m "feat(accueil): buildHomeScreens (sagas + fallback collection + one-shots)"
```

---

## Task 3: Composant `SagaPanel`

**Files:**
- Create: `app/components/SagaPanel.tsx`
- Test: `app/components/__tests__/SagaPanel.test.tsx`

**Interfaces:**
- Consumes: `HomeScreen` (Task 2), `CoverFan`, `universeAccentStyle`, classes `atoms.css`.
- Produces: `SagaPanel({screen, index}: {screen: HomeScreen; index: number})` — une `<section>` plein-écran (compo A), accent posé en style inline via `universeAccentStyle(screen.accent)`.

- [ ] **Step 1: Écrire le test (échec attendu)**

Créer `app/components/__tests__/SagaPanel.test.tsx` :

```tsx
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {createRoutesStub} from 'react-router';
import {SagaPanel} from '../SagaPanel';
import type {HomeScreen} from '~/lib/homeScreens';

const base: HomeScreen = {
  key: 'k', kind: 'saga', kicker: 'Au Nom des Dieux — Saga', title: "De l'Eau et du Sang",
  lore: 'Le silence des dieux.', accent: '#2fb6c4',
  covers: [{url: 'https://x/1.jpg', altText: 'T1'}], href: '/collections/au-nom-des-dieux#eau', ctaLabel: 'Entrer dans la saga',
};

function renderPanel(s: HomeScreen) {
  const Stub = createRoutesStub([{path: '/', Component: () => <SagaPanel screen={s} index={0} />}]);
  return render(<Stub initialEntries={['/']} />);
}

describe('SagaPanel', () => {
  it('rend le kicker, le titre, le lore et le CTA vers la cible', () => {
    renderPanel(base);
    expect(screen.getByRole('heading', {name: "De l'Eau et du Sang"})).toBeInTheDocument();
    expect(screen.getByText('Au Nom des Dieux — Saga')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Entrer dans la saga/})).toHaveAttribute('href', '/collections/au-nom-des-dieux#eau');
  });

  it('applique la couleur d’accent de la saga via --bsk-uni', () => {
    const {container} = renderPanel(base);
    const section = container.querySelector('section');
    expect(section?.getAttribute('style')).toContain('--bsk-uni');
    expect(section?.getAttribute('style')).toContain('#2fb6c4');
  });

  it('reste neutre (pas de --bsk-uni inline) si accent null', () => {
    const {container} = renderPanel({...base, accent: null});
    expect(container.querySelector('section')?.getAttribute('style') ?? '').not.toContain('--bsk-uni');
  });
});
```

- [ ] **Step 2: Lancer le test** — Run: `npm test -- SagaPanel` → FAIL.

- [ ] **Step 3: Créer `app/components/SagaPanel.tsx`**

```tsx
import {Link} from 'react-router';
import {CoverFan} from '~/components/CoverFan';
import {universeAccentStyle} from '~/lib/universeAccent';
import type {HomeScreen} from '~/lib/homeScreens';
import '~/styles/atoms.css';

export function SagaPanel({screen, index}: {screen: HomeScreen; index: number}) {
  return (
    <section
      className="bsk-saga-panel"
      style={universeAccentStyle(screen.accent ?? undefined)}
      aria-roledescription="diapositive"
      aria-label={screen.title}
    >
      <div className="bsk-saga-halo bsk-halo" aria-hidden="true" />
      <div className="bsk-saga-fan" data-parallax="fan">
        <CoverFan covers={screen.covers} />
      </div>
      <div className="bsk-grain" aria-hidden="true" />
      <div className="bsk-saga-mist" aria-hidden="true" />
      <div className="bsk-saga-text" data-parallax="text">
        <span className="bsk-kicker">{screen.kicker}</span>
        <h2 className="bsk-saga-title">{screen.title}</h2>
        {screen.lore ? <p className="bsk-saga-lore">{screen.lore}</p> : null}
        <Link to={screen.href} className="bsk-btn bsk-btn--cream bsk-saga-cta">
          {screen.ctaLabel} →
        </Link>
      </div>
      {index === 0 ? <div className="bsk-saga-cue" aria-hidden="true">↓ saga suivante</div> : null}
    </section>
  );
}
```

- [ ] **Step 4: Lancer le test** — Run: `npm test -- SagaPanel` → PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/SagaPanel.tsx app/components/__tests__/SagaPanel.test.tsx
git commit -m "feat(accueil): composant SagaPanel (compo A + halo + accent saga)"
```

---

## Task 4: Hook `useActivePanel` (index actif pour les puces)

**Files:**
- Create: `app/hooks/useActivePanel.ts`
- Test: `app/hooks/__tests__/useActivePanel.test.tsx`

**Interfaces:**
- Produces: `useActivePanel(count: number): {activeIndex: number; containerRef: RefObject<HTMLDivElement | null>; jumpTo: (i: number) => void}`. Suit l'index via `IntersectionObserver` sur les enfants directs `[data-panel]` du conteneur ; `jumpTo` fait défiler le panneau ciblé via `scrollIntoView`.

- [ ] **Step 1: Écrire le test (échec attendu)**

Créer `app/hooks/__tests__/useActivePanel.test.tsx` :

```tsx
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, act} from '@testing-library/react';
import {useActivePanel} from '../useActivePanel';

let lastCb: ((entries: any[]) => void) | null = null;
beforeEach(() => {
  lastCb = null;
  (globalThis as any).IntersectionObserver = class {
    constructor(cb: any) { lastCb = cb; }
    observe() {} unobserve() {} disconnect() {}
  };
});

function Harness() {
  const {activeIndex, containerRef, jumpTo} = useActivePanel(3);
  return (
    <div ref={containerRef} data-active={activeIndex}>
      <div data-panel /><div data-panel /><div data-panel />
      <button onClick={() => jumpTo(2)}>jump</button>
    </div>
  );
}

describe('useActivePanel', () => {
  it('met à jour activeIndex quand un panneau devient visible', () => {
    const {container} = render(<Harness />);
    const panels = container.querySelectorAll('[data-panel]');
    act(() => {
      lastCb?.([{isIntersecting: true, intersectionRatio: 0.9, target: panels[1]}]);
    });
    expect(container.firstElementChild?.getAttribute('data-active')).toBe('1');
  });

  it('jumpTo fait défiler le panneau ciblé', () => {
    const spy = vi.fn();
    const {getByText, container} = render(<Harness />);
    (container.querySelectorAll('[data-panel]')[2] as HTMLElement).scrollIntoView = spy;
    act(() => { getByText('jump').click(); });
    expect(spy).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Lancer le test** — Run: `npm test -- useActivePanel` → FAIL.

- [ ] **Step 3: Créer `app/hooks/useActivePanel.ts`**

```ts
import {useCallback, useEffect, useRef, useState} from 'react';

export function useActivePanel(count: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-panel]'));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.5) {
            const i = panels.indexOf(e.target as HTMLElement);
            if (i >= 0) setActiveIndex(i);
          }
        }
      },
      {threshold: [0.5, 0.9]},
    );
    panels.forEach((p) => io.observe(p));
    return () => io.disconnect();
  }, [count]);

  const jumpTo = useCallback((i: number) => {
    const panels = containerRef.current?.querySelectorAll<HTMLElement>('[data-panel]');
    panels?.[i]?.scrollIntoView({behavior: 'smooth'});
  }, []);

  return {activeIndex, containerRef, jumpTo};
}
```

- [ ] **Step 4: Lancer le test** — Run: `npm test -- useActivePanel` → PASS.

- [ ] **Step 5: Commit**

```bash
git add app/hooks/useActivePanel.ts app/hooks/__tests__/useActivePanel.test.tsx
git commit -m "feat(accueil): hook useActivePanel (index actif via IntersectionObserver + jumpTo)"
```

---

## Task 5: Composant `SagaScroller` (conteneur scroll-snap + puces + footer final)

**Files:**
- Create: `app/components/SagaScroller.tsx`
- Test: `app/components/__tests__/SagaScroller.test.tsx`

**Interfaces:**
- Consumes: `HomeScreen[]`, `SagaPanel`, `ProgressDots` (Phase A), `useActivePanel`, `Footer` (Task 7).
- Produces: `SagaScroller({screens}: {screens: HomeScreen[]})` — conteneur `data-panel`-wrappé + `ProgressDots` + `Footer` en dernier panneau.

- [ ] **Step 1: Écrire le test (échec attendu)**

Créer `app/components/__tests__/SagaScroller.test.tsx` :

```tsx
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {createRoutesStub} from 'react-router';
import {SagaScroller} from '../SagaScroller';
import type {HomeScreen} from '~/lib/homeScreens';

vi.mock('~/components/Footer', () => ({Footer: () => <footer>FOOTER</footer>}));

const screens: HomeScreen[] = [
  {key: 'a', kind: 'saga', kicker: 'K', title: 'Saga A', lore: null, accent: null, covers: [{url: 'u', altText: 'a'}], href: '/c#a', ctaLabel: 'Entrer dans la saga'},
  {key: 'b', kind: 'oneshot', kicker: 'Roman indépendant', title: 'Œuvre B', lore: null, accent: null, covers: [{url: 'u', altText: 'b'}], href: '/products/b', ctaLabel: 'Découvrir le livre'},
];

function renderScroller(s: HomeScreen[]) {
  const Stub = createRoutesStub([{path: '/', Component: () => <SagaScroller screens={s} />}]);
  return render(<Stub initialEntries={['/']} />);
}

describe('SagaScroller', () => {
  it('rend un panneau par écran + le footer en panneau final', () => {
    const {container} = renderScroller(screens);
    expect(screen.getByRole('heading', {name: 'Saga A'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Œuvre B'})).toBeInTheDocument();
    expect(screen.getByText('FOOTER')).toBeInTheDocument();
    // 2 sagas + 1 footer = 3 panneaux
    expect(container.querySelectorAll('[data-panel]')).toHaveLength(3);
  });

  it('rend des puces de progression (1 par panneau)', () => {
    renderScroller(screens);
    expect(screen.getAllByRole('button', {name: /Aller à la saga/})).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Lancer le test** — Run: `npm test -- SagaScroller` → FAIL.

- [ ] **Step 3: Créer `app/components/SagaScroller.tsx`**

```tsx
import {SagaPanel} from '~/components/SagaPanel';
import {ProgressDots} from '~/components/ProgressDots';
import {Footer} from '~/components/Footer';
import {useActivePanel} from '~/hooks/useActivePanel';
import type {HomeScreen} from '~/lib/homeScreens';
import '~/styles/home.css';

export function SagaScroller({screens}: {screens: HomeScreen[]}) {
  const total = screens.length + 1; // + footer final
  const {activeIndex, containerRef, jumpTo} = useActivePanel(total);

  return (
    <div className="bsk-scroller" ref={containerRef}>
      {screens.map((s, i) => (
        <div className="bsk-scroller-panel" data-panel key={s.key}>
          <SagaPanel screen={s} index={i} />
        </div>
      ))}
      <div className="bsk-scroller-panel bsk-scroller-panel--footer" data-panel>
        <Footer asPanel />
      </div>
      <nav className="bsk-scroller-dots" aria-label="Navigation des sagas">
        <ProgressDots count={total} activeIndex={activeIndex} onJump={jumpTo} />
      </nav>
    </div>
  );
}
```

- [ ] **Step 4: Lancer le test** — Run: `npm test -- SagaScroller` → PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/SagaScroller.tsx app/components/__tests__/SagaScroller.test.tsx
git commit -m "feat(accueil): SagaScroller (scroll-snap + puces + footer panneau final)"
```

---

## Task 6: `home.css` — scroll-snap, compo A/D1, parallax, reduced-motion

**Files:**
- Modify: `app/styles/home.css` (remplacer le contenu lié au slider horizontal ; voir Step 1)

**Interfaces:** purement CSS (consommé par `SagaScroller`/`SagaPanel`).

- [ ] **Step 1: Remplacer le contenu de `app/styles/home.css`**

Remplacer l'intégralité du fichier par (le slider horizontal n'est plus utilisé après la Task 8) :

```css
/* app/styles/home.css — accueil vertical « Reels » par saga (Refonte 2). */
.bsk-scroller{height:100dvh;overflow-y:scroll;scroll-snap-type:y mandatory;scroll-behavior:smooth;background:var(--bsk-ink);color:var(--bsk-cream)}
.bsk-scroller-panel{scroll-snap-align:start;scroll-snap-stop:always;min-height:100dvh;position:relative}

.bsk-saga-panel{position:relative;min-height:100dvh;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;padding:0 24px 40px}
.bsk-saga-halo{left:50%;top:60px;width:380px;height:380px;transform:translateX(-50%);opacity:.42}
.bsk-saga-mist{position:absolute;inset:0;z-index:5;background:linear-gradient(180deg,transparent 40%,var(--bsk-ink) 90%)}
.bsk-saga-fan{position:absolute;top:84px;left:50%;transform:translateX(-50%);width:260px;z-index:2;will-change:transform}
.bsk-saga-text{position:relative;z-index:6;max-width:520px}
.bsk-saga-title{font-family:var(--bsk-font-display);font-weight:800;font-size:clamp(34px,11vw,44px);line-height:.9;letter-spacing:-.02em;margin:10px 0 12px}
.bsk-saga-lore{font-size:13px;line-height:1.5;opacity:.62;max-width:34ch}
.bsk-saga-cta{margin-top:14px}
.bsk-saga-cue{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:6;font-family:var(--bsk-font-sans);font-size:9px;letter-spacing:.2em;text-transform:uppercase;opacity:.45}

.bsk-scroller-dots{position:fixed;right:14px;top:50%;transform:translateY(-50%);z-index:40}

/* Animation d'entrée : le panneau actif (visible) révèle son texte */
.bsk-saga-text{opacity:0;transform:translateY(18px);transition:opacity .5s var(--bsk-ease),transform .5s var(--bsk-ease)}
.bsk-scroller-panel:has(.bsk-saga-text) {} /* no-op anchor */
@supports (animation-timeline: view()) {
  .bsk-saga-text{animation:bsk-rise linear both;animation-timeline:view();animation-range:entry 10% cover 35%}
  @keyframes bsk-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
}
/* Fallback sans view-timeline : visible dès le montage */
@supports not (animation-timeline: view()) {.bsk-saga-text{opacity:1;transform:none}}

/* Desktop ≥860px — D1 : titre bas-gauche, éventail tilté à droite */
@media (min-width: 860px){
  .bsk-saga-panel{padding:0 6vw 8vh}
  .bsk-saga-fan{left:auto;right:8vw;top:14vh;transform:none;width:340px}
  .bsk-saga-halo{left:auto;right:10vw;top:8vh;transform:none}
  .bsk-saga-title{font-size:clamp(48px,5.5vw,72px)}
  .bsk-saga-mist{background:linear-gradient(90deg,var(--bsk-ink) 20%,transparent 70%)}
}

@media (prefers-reduced-motion: reduce){
  .bsk-scroller{scroll-snap-type:none;scroll-behavior:auto}
  .bsk-saga-text{opacity:1;transform:none;animation:none;transition:none}
}
```

- [ ] **Step 2: Vérifier le build** — Run: `npm run build` → OK.

- [ ] **Step 3: Commit**

```bash
git add app/styles/home.css
git commit -m "feat(accueil): home.css scroll-snap vertical (compo A/D1 + parallax + reduced-motion)"
```

---

## Task 7: Footer F3 (peau encre, panneau final + footer global)

**Files:**
- Modify: `app/components/Footer.tsx`
- Create: `app/styles/footer.css`
- Test: `app/components/__tests__/Footer.test.tsx` (créer)

**Interfaces:**
- Produces: `Footer({asPanel}: {asPanel?: boolean})` — F3 (wordmark + gros CTA newsletter + liens minuscules). `asPanel` ajoute la classe plein-écran (`bsk-footer--panel`) pour l'usage en dernier panneau du scroller ; sans prop = footer global hauteur normale.

- [ ] **Step 1: Écrire le test (échec attendu)**

Créer `app/components/__tests__/Footer.test.tsx` :

```tsx
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {createRoutesStub} from 'react-router';
import {Footer} from '../Footer';

function renderFooter(props = {}) {
  const Stub = createRoutesStub([{path: '/', Component: () => <Footer {...props} />}]);
  return render(<Stub initialEntries={['/']} />);
}

describe('Footer F3', () => {
  it('rend le wordmark, le CTA newsletter et les réseaux', () => {
    renderFooter();
    expect(screen.getByText('BILSKIRNIR')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /inscrire/i})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /TikTok/i})).toBeInTheDocument();
  });

  it('ajoute la classe panneau quand asPanel', () => {
    const {container} = renderFooter({asPanel: true});
    expect(container.querySelector('footer')?.className).toContain('bsk-footer--panel');
  });
});
```

- [ ] **Step 2: Lancer le test** — Run: `npm test -- Footer` → FAIL.

- [ ] **Step 3: Réécrire `app/components/Footer.tsx`**

```tsx
import {Link} from 'react-router';
import {FOOTER_NAV} from '~/data/nav';
import '~/styles/footer.css';

const ALL_LINKS = [...FOOTER_NAV.boutique, ...FOOTER_NAV.maison, ...FOOTER_NAV.info];

export function Footer({asPanel = false}: {asPanel?: boolean}) {
  return (
    <footer className={`bsk-footer${asPanel ? ' bsk-footer--panel' : ''}`}>
      <div className="bsk-footer-halo bsk-halo" aria-hidden="true" />
      <div className="bsk-footer-inner">
        <span className="bsk-kicker">Restez dans l’univers</span>
        <p className="bsk-footer-big">Reçois les annonces<br />de sortie.</p>
        <form className="bsk-footer-form bsk-mailrow" action="/api/newsletter" method="post">
          <label htmlFor="footer-email" className="visually-hidden">Adresse email</label>
          <input id="footer-email" name="email" type="email" required placeholder="votre@email.fr" />
          <button type="submit" className="bsk-btn bsk-btn--cream">S’inscrire</button>
        </form>
        <nav className="bsk-footer-links" aria-label="Liens de pied de page">
          {ALL_LINKS.map((l) => (
            <Link key={l.href} to={l.href}>{l.label}</Link>
          ))}
        </nav>
        <div className="bsk-footer-base">
          <small>© Bilskirnir — Éditeur indépendant</small>
          <span>
            <a href="https://tiktok.com/@bilskirnir" rel="me noreferrer" target="_blank">TikTok</a>
            {' · '}
            <a href="https://instagram.com/bilskirnir" rel="me noreferrer" target="_blank">Instagram</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
```

> Note : l'année dynamique (`new Date()`) est retirée volontairement — interdite dans certains contextes SSR/test et superflue ici (« © Bilskirnir » suffit).

- [ ] **Step 4: Créer `app/styles/footer.css`**

```css
/* app/styles/footer.css — footer F3 « encre » (panneau final + global). */
.bsk-footer{position:relative;overflow:hidden;background:var(--bsk-ink);color:var(--bsk-cream);
  border-top:1px solid color-mix(in srgb,var(--bsk-cream) 12%,transparent)}
.bsk-footer--panel{min-height:100dvh;display:flex;align-items:center;border-top:0;scroll-snap-align:start}
.bsk-footer-halo{left:50%;top:-120px;width:420px;height:300px;transform:translateX(-50%);
  background:radial-gradient(circle,color-mix(in srgb,var(--bsk-cream) 22%,transparent),transparent 65%);opacity:.4}
.bsk-footer-inner{position:relative;z-index:2;max-width:760px;margin:0 auto;padding:48px 28px;text-align:center;width:100%}
.bsk-footer-big{font-family:var(--bsk-font-display);font-weight:800;font-size:clamp(28px,7vw,40px);
  letter-spacing:-.02em;line-height:1;margin:10px 0 18px}
.bsk-footer-form{max-width:320px;margin:0 auto 24px}
.bsk-footer-links{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 18px;margin-bottom:24px}
.bsk-footer-links a{font-family:var(--bsk-font-sans);font-size:12.5px;color:var(--bsk-cream);opacity:.6;text-decoration:none}
.bsk-footer-links a:hover{opacity:1}
.bsk-footer-base{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;
  border-top:1px solid color-mix(in srgb,var(--bsk-cream) 12%,transparent);padding-top:14px;
  font-family:var(--bsk-font-sans);font-size:11px;opacity:.5}
.bsk-footer-base a{color:var(--bsk-cream);text-decoration:none}
```

- [ ] **Step 5: Lancer le test + build** — Run: `npm test -- Footer` → PASS ; `npm run build` → OK.

- [ ] **Step 6: Commit**

```bash
git add app/components/Footer.tsx app/styles/footer.css app/components/__tests__/Footer.test.tsx
git commit -m "feat(accueil): footer F3 encre (wordmark + CTA newsletter, panneau final + global)"
```

---

## Task 8: Câblage `_index.tsx` (query sagas + SagaScroller)

**Files:**
- Modify: `app/routes/_index.tsx`

**Interfaces:**
- Consumes: `HOME_SAGA_FRAGMENT` (Task 1), `TILE_PRODUCT_FRAGMENT` (existant), `buildHomeScreens` (Task 2), `SagaScroller` (Task 5).

- [ ] **Step 1: Réécrire `app/routes/_index.tsx`**

```tsx
import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {SagaScroller} from '~/components/SagaScroller';
import {
  buildHomeScreens,
  type ScreenCollection,
  type ScreenWork,
} from '~/lib/homeScreens';
import {HOME_SAGA_FRAGMENT, TILE_PRODUCT_FRAGMENT} from '~/lib/fragments';

export const meta: Route.MetaFunction = () => [
  {title: 'Bilskirnir — Des récits héroïques, sans compromis'},
];

/** Route immersive : root.tsx masque le Footer global et pose ImmersiveNav overlay. */
export const handle = {immersive: true};

const HOME_QUERY = `#graphql
  query Home($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 20, sortKey: TITLE) {
      nodes { ...HomeSaga }
    }
    products(first: 50) {
      nodes { ...TileProduct }
    }
  }
  ${HOME_SAGA_FRAGMENT}
  ${TILE_PRODUCT_FRAGMENT}
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  return await storefront.query(HOME_QUERY, {cache: storefront.CacheShort()});
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  const collections = data.collections.nodes as unknown as ScreenCollection[];
  const works = data.products.nodes as unknown as ScreenWork[];
  const screens = buildHomeScreens(collections, works);
  return <SagaScroller screens={screens} />;
}
```

- [ ] **Step 2: Vérifier types + build** — Run: `npm run build` → OK (codegen régénère le type `Home`).

- [ ] **Step 3: Vérif dev (manuel)** — Run: `npm run dev`. Ouvrir `/`. Attendu : sequence verticale, 1 écran par collection (fallback dev, pas encore de saga), one-shot exclu si sans couverture, footer en dernier panneau, puces à droite, scroll-snap, nav overlay. Aucune erreur SSR/console.

- [ ] **Step 4: Commit**

```bash
git add app/routes/_index.tsx
git commit -m "feat(accueil): cable _index sur SagaScroller (query sagas + buildHomeScreens)"
```

---

## Task 9: Nettoyage des modules morts + vérification finale

**Files:**
- Delete: `app/components/UniverseSlider.tsx`, `app/components/__tests__/UniverseSlider.test.tsx`, `app/lib/homeSlides.ts`, `app/lib/__tests__/homeSlides.test.ts`, `app/lib/__tests__/homeFragment.test.ts`, `app/routes/__tests__/home-fragment.test.ts`
- Modify: `app/lib/fragments.ts` (retirer `HOME_UNIVERSE_FRAGMENT` s'il n'est plus importé nulle part)

- [ ] **Step 1: Confirmer que les modules sont orphelins**

Run (depuis `storefront/`) :
```bash
grep -rn "UniverseSlider\|buildHomeSlides\|HOME_UNIVERSE_FRAGMENT" app/ --include=*.ts --include=*.tsx
```
Expected : plus aucune référence hors des fichiers à supprimer et de leurs tests. (Si `HOME_UNIVERSE_FRAGMENT` est encore importé ailleurs, ne pas le retirer — noter et garder.)

- [ ] **Step 2: Supprimer les fichiers morts listés ci-dessus** (et, seulement s'il est devenu orphelin, retirer `HOME_UNIVERSE_FRAGMENT` de `fragments.ts`).

- [ ] **Step 3: Suite complète + build**

Run : `npm test` puis `npm run build`
Expected : tout vert (les tests Phase B + l'existant moins les tests supprimés), build propre.

- [ ] **Step 4: Vérif dev finale** — `npm run dev`, ouvrir `/` (tome + one-shot présents), redescendre jusqu'au footer. Aucune erreur.

- [ ] **Step 5: Commit + push**

```bash
git add -A
git commit -m "chore(accueil): retire le slider horizontal mort (UniverseSlider/homeSlides)"
git push
```

---

## Self-review — couverture du spec (Phase B)

- 1 écran = 1 saga, one-shots = 1 écran, footer final → Task 2 (build) + Task 5 (scroller) + Task 7 (footer panneau). ✅
- Scroll-snap natif + parallax + reduced-motion → Task 6 (CSS). ✅
- Compo A (mobile) / D1 (desktop) → Task 3 (markup) + Task 6 (CSS). ✅
- Halo/accent par saga (saga→univers→neutre) → Task 2 (`resolveAccentColor`) + Task 3 (`universeAccentStyle`). ✅
- Puces de progression (jump) → Task 4 (hook) + Task 5 (ProgressDots Phase A). ✅
- CTA saga → univers ancré ; one-shot → fiche → Task 2 (`href`/`ctaLabel`). ✅
- Fallback collection (dev sans saga) → Task 2 (`universeScreen`). ✅
- Footer F3 (panneau + global) → Task 7. ✅
- Métaobjet saga : clés confirmées en Étape 0 ; accès Storefront API = pré-requis admin (déjà actif côté page univers). ✅

## Notes

- **Dépendance admin (Gautier) :** créer les metaobjects saga (nom/accroche/lore/couleur/tomes) + couleur par saga. Tant qu'ils n'existent pas, la home affiche le fallback collection (1 écran/univers) — comportement dev voulu.
- **DRY assumé :** `coversFrom` (tri par n° de tome + 3 max) recoupe la logique de `pickFanCovers`/`universeFan` ; extraction partagée écartée pour limiter le périmètre (à reconsidérer si un 3ᵉ usage apparaît).
- **Parallax :** réalisé en CSS (scroll-driven `animation-timeline: view()`) avec fallback statique et coupe sous `prefers-reduced-motion` — pas de JS de scroll. Les attributs `data-parallax` sont posés pour un éventuel raffinement ultérieur sans changer le markup.
- `npm run typecheck` : erreurs de scaffold préexistantes hors périmètre.
```
