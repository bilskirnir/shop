# Bilskirnir — Page univers immersive — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre la page univers (`/collections/$handle`) selon la maquette validée : hero atmosphérique teinté de la couleur maîtresse de l'univers (halo discret + emblème en filigrane), bloc « L'univers » (lore en corps agrandi), sections par saga en grille 2 colonnes (couvertures vedettes + badge de statut posé dessus), séparateurs `✦`, et rail « Découvrir un autre univers » (chaque carte avec sa couleur maîtresse).

**Architecture:** On porte l'accent d'univers sur un conteneur de page via `universeAccentStyle` (les enfants héritent de `--bsk-uni`/`--bsk-uni-soft`). On restyle en place les composants Plan 2 (`UniverseHero`, `SagaSection`, `TomeCard`) pour consommer ces variables + les primitives Plan 1 (`Cover` débordante, `ReleaseStatusBadge onImage`), on transforme `Ornament` en séparateur `✦` (conforme spec §2.5), on ajoute un composant `UniverseRail` (autres univers) et une feuille `univers.css` pour les animations atmosphériques (cascade d'entrée, brume, indice de scroll), neutralisées sous `prefers-reduced-motion`. La page reste non-immersive (Header + Footer globaux conservés).

**Tech Stack:** Hydrogen (React Router v7), TypeScript, Vitest + Testing Library, Vanilla CSS (tokens `--bsk-*` + `univers.css` pour keyframes). Polices Cabinet Grotesk / Switzer (déjà auto-hébergées).

**Spec:** `docs/superpowers/specs/2026-05-22-bilskirnir-visual-redesign.md` (§2.4 couvertures, §2.5 ornement/badges, §2.6 mouvement, §3.2 page univers)
**Maquette:** `docs/superpowers/mockups/2026-05-22-visual-redesign/03-univers-mobile.html`
**Plans précédents (primitives consommées):** `2026-05-22-bilskirnir-design-foundation.md`, `2026-05-22-bilskirnir-home-slider.md`

---

## Décisions de cadrage (à valider en lisant)

1. **Page non-immersive** : on garde le `Header`/`Footer` globaux (la spec §3.2 demande « Footer complet »). La généralisation de la *smart nav* (emblème, panier, masquage au scroll) sur les pages internes est **différée** à un plan dédié de promotion du chrome global.
2. **Pas de metafield genre/citation requis** : la pastille « genre » du hero est lue depuis un metafield **optionnel** `custom.genre` (rendue seulement si présente). La « citation lore » du hero est dérivée du **premier paragraphe** du metafield `lore` existant (le reste alimente le bloc « L'univers ») — aucun nouveau contenu obligatoire pour Gautier.
3. **Statut d'univers** non modélisé en données → la ligne de stats reste factuelle : `N sagas · N tomes` (pas de « en cours » inventé).
4. **`Ornament` devient le séparateur `✦`** (spec §2.5) : un `✦` doré centré flanqué de filets fins, en remplacement des `◈`. Les fiches produit (plan suivant) en bénéficieront.

---

## Prerequisites

- [ ] `cd storefront && npm test` est vert au départ.
- [ ] Primitives présentes : `app/components/Cover.tsx` (prop `bleed`), `app/components/ReleaseStatusBadge.tsx` (prop `onImage`), `app/lib/universeAccent.ts` (`universeAccentStyle`), `app/assets/bilskirnir-emblem.png`.
- [ ] `app/lib/tomeMetafields.ts` exporte `richTextToPlain`, `metaobjectField`, `parseBool`, `parseNumeroTome`, `parseStatutParution`.
- [ ] `UNIVERSE_DETAIL_FRAGMENT` dans `app/lib/fragments.ts` fournit déjà `lore`, `couleurTheme`, `illustrationHero`, `sagas`, `products`.

---

## File Structure

```
storefront/app/
├── lib/
│   ├── ✨ lore.ts                      (splitLore : 1er paragraphe = citation hero, reste = bloc « L'univers »)
│   ├── ✏️ fragments.ts                 (UNIVERSE_DETAIL_FRAGMENT += genre ; ✨ UNIVERSE_RAIL_FRAGMENT)
│   └── __tests__/
│       ├── ✨ lore.test.ts
│       └── ✨ universeRailFragment.test.ts
├── components/
│   ├── ✏️ Ornament.tsx                 (✦ doré + filets — séparateur spec)
│   ├── ✏️ UniverseHero.tsx             (hero atmosphérique : halo --bsk-uni-soft, emblème filigrane, pill, citation, stats, cascade)
│   ├── ✏️ SagaSection.tsx              (grille 2 colonnes, head centré, sans ornement interne)
│   ├── ✏️ TomeCard.tsx                 (Cover débordante + ReleaseStatusBadge onImage, texte centré)
│   ├── ✨ UniverseRail.tsx             (« Découvrir un autre univers » : cartes teintées par couleur maîtresse)
│   └── __tests__/
│       ├── ✏️ Ornament.test.tsx
│       ├── ✏️ UniverseHero.test.tsx
│       ├── ✏️ SagaSection.test.tsx     (inchangé en intention — vérifier vert)
│       ├── ✏️ TomeCard.test.tsx        (inchangé en intention — vérifier vert)
│       └── ✨ UniverseRail.test.tsx
├── styles/
│   ├── ✨ univers.css                  (cascade d'entrée, brume, indice scroll, reduced-motion)
│   └── __tests__/
│       └── ✨ universCss.test.ts
└── routes/
    ├── ✏️ collections.$handle.tsx       (accent wrapper, citation/lore, sagas+type, rail, ✦, query otherUniverses)
    └── __tests__/
        └── ✨ collection-univers.test.ts (assertions sur la source de la route)
```

---

## Tasks

### Task 1: `Ornament` → séparateur `✦` (spec §2.5)

Transformer l'ornement (`◈ ◈ ◈`) en séparateur conforme : un `✦` doré centré, flanqué de deux filets fins.

**Files:**
- Modify: `storefront/app/components/Ornament.tsx`
- Modify: `storefront/app/components/__tests__/Ornament.test.tsx`

- [ ] **Step 1: Réécrire le test**

```tsx
// storefront/app/components/__tests__/Ornament.test.tsx
import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {renderWithRouter} from '~/test/render';
import {Ornament} from '../Ornament';

describe('<Ornament />', () => {
  it('rend un ✦ doré (séparateur spec)', () => {
    renderWithRouter(<Ornament />);
    const el = screen.getByRole('presentation', {hidden: true});
    expect(el).toHaveTextContent('✦');
  });

  it('accepte plusieurs glyphes via count', () => {
    renderWithRouter(<Ornament count={3} />);
    expect(screen.getByRole('presentation', {hidden: true})).toHaveTextContent(
      '✦ ✦ ✦',
    );
  });

  it('est décoratif et masqué aux lecteurs d\'écran', () => {
    renderWithRouter(<Ornament />);
    expect(screen.getByRole('presentation', {hidden: true})).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- Ornament
```

- [ ] **Step 3: Réécrire le composant**

```tsx
// storefront/app/components/Ornament.tsx
export function Ornament({count = 1}: {count?: number}) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--bsk-space-4)',
        padding: 'var(--bsk-space-6) 0',
        color: 'var(--bsk-accent-gold)',
      }}
    >
      <span style={{flex: 1, height: 1, background: 'var(--bsk-border-subtle)'}} />
      <span style={{fontSize: 'var(--bsk-text-md)', opacity: 0.8, letterSpacing: '0.4em'}}>
        {Array.from({length: count}, () => '✦').join(' ')}
      </span>
      <span style={{flex: 1, height: 1, background: 'var(--bsk-border-subtle)'}} />
    </div>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- Ornament
```

- [ ] **Step 5: Commit**

```bash
git add app/components/Ornament.tsx app/components/__tests__/Ornament.test.tsx
git commit -m "feat(ui): Ornament -> separateur ✦ dore (spec §2.5)"
```

---

### Task 2: Helper `splitLore`

Sépare le lore (texte multi-paragraphes via `richTextToPlain`) en `{quote, body}` : 1er paragraphe = citation du hero, le reste = bloc « L'univers ». Si un seul paragraphe : pas de citation, tout dans `body`.

**Files:**
- Create: `storefront/app/lib/lore.ts`
- Test: `storefront/app/lib/__tests__/lore.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/lib/__tests__/lore.test.ts
import {describe, it, expect} from 'vitest';
import {splitLore} from '../lore';

describe('splitLore', () => {
  it('1er paragraphe = citation, reste = body', () => {
    expect(splitLore('Une question ?\n\nUn monde.\n\nDes héros.')).toEqual({
      quote: 'Une question ?',
      body: 'Un monde.\n\nDes héros.',
    });
  });
  it('un seul paragraphe : pas de citation, tout en body', () => {
    expect(splitLore('Un seul bloc de texte.')).toEqual({
      quote: null,
      body: 'Un seul bloc de texte.',
    });
  });
  it('vide : quote null, body vide', () => {
    expect(splitLore('')).toEqual({quote: null, body: ''});
    expect(splitLore('   ')).toEqual({quote: null, body: ''});
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- lore
```

- [ ] **Step 3: Implement**

```ts
// storefront/app/lib/lore.ts

/**
 * Découpe un lore en citation (1er paragraphe) + corps (paragraphes suivants).
 * Un seul paragraphe → pas de citation, tout dans `body`.
 */
export function splitLore(text: string): {quote: string | null; body: string} {
  const paras = (text ?? '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paras.length === 0) return {quote: null, body: ''};
  if (paras.length === 1) return {quote: null, body: paras[0]};
  return {quote: paras[0], body: paras.slice(1).join('\n\n')};
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- lore
```

- [ ] **Step 5: Commit**

```bash
git add app/lib/lore.ts app/lib/__tests__/lore.test.ts
git commit -m "feat(univers): splitLore (citation hero + corps L'univers)"
```

---

### Task 3: Fragments — `genre` optionnel + `UNIVERSE_RAIL_FRAGMENT`

Ajouter le metafield optionnel `genre` à `UNIVERSE_DETAIL_FRAGMENT` (pastille hero) et un fragment léger pour le rail « autres univers ».

**Files:**
- Modify: `storefront/app/lib/fragments.ts`
- Test: `storefront/app/lib/__tests__/universeRailFragment.test.ts` (create)

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/lib/__tests__/universeRailFragment.test.ts
import {describe, it, expect} from 'vitest';
import {UNIVERSE_RAIL_FRAGMENT, UNIVERSE_DETAIL_FRAGMENT} from '../fragments';

describe('fragments univers', () => {
  it('UNIVERSE_RAIL_FRAGMENT : id/handle/title + couleur + flag indépendant', () => {
    expect(UNIVERSE_RAIL_FRAGMENT).toContain('fragment UniverseRailCard on Collection');
    expect(UNIVERSE_RAIL_FRAGMENT).toContain('key: "couleur_theme"');
    expect(UNIVERSE_RAIL_FRAGMENT).toContain('key: "est_une_oeuvre_independante"');
  });
  it('UNIVERSE_DETAIL_FRAGMENT expose le genre (optionnel)', () => {
    expect(UNIVERSE_DETAIL_FRAGMENT).toContain('key: "genre"');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- universeRailFragment
```

- [ ] **Step 3: Modifier `fragments.ts`**

Dans `UNIVERSE_DETAIL_FRAGMENT`, ajouter la ligne `genre` juste après la ligne `lore: metafield(...) { value }` :

```graphql
    genre: metafield(namespace: "custom", key: "genre") { value }
```

Puis ajouter, juste avant `export const UNIVERSE_DETAIL_FRAGMENT` :

```ts
export const UNIVERSE_RAIL_FRAGMENT = `#graphql
  fragment UniverseRailCard on Collection {
    id
    handle
    title
    couleurTheme: metafield(namespace: "custom", key: "couleur_theme") { value }
    estUneOeuvreIndependante: metafield(namespace: "custom", key: "est_une_oeuvre_independante") { value }
  }
` as const;
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- universeRailFragment
```

- [ ] **Step 5: Commit**

```bash
git add app/lib/fragments.ts app/lib/__tests__/universeRailFragment.test.ts
git commit -m "feat(univers): genre optionnel + UNIVERSE_RAIL_FRAGMENT"
```

---

### Task 4: `univers.css` — animations atmosphériques

Feuille scoppée à la page univers : cascade d'entrée du hero, brume dérivante, indice de scroll, emblème filigrane, séparateur, neutralisées sous `prefers-reduced-motion`. Préfixe `uni-`.

**Files:**
- Create: `storefront/app/styles/univers.css`
- Test: `storefront/app/styles/__tests__/universCss.test.ts` (create)

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/styles/__tests__/universCss.test.ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const css = readFileSync(resolve(process.cwd(), 'app/styles/univers.css'), 'utf8');

describe('univers.css', () => {
  it('définit le hero et la teinte d\'univers', () => {
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
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- universCss
```

- [ ] **Step 3: Create `univers.css`**

```css
/* app/styles/univers.css — page univers (atmosphère + animations) */

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
.uni-hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(75% 55% at 50% 22%, var(--bsk-uni-soft), transparent 60%),
    var(--bsk-bg-base);
}
.uni-hero-img {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
}
.uni-fog {
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0.4;
  mix-blend-mode: screen;
  background: radial-gradient(45% 30% at 50% 36%, var(--bsk-uni-soft), transparent 65%);
  animation: uni-drift 16s ease-in-out infinite alternate;
}
.uni-emblem {
  position: absolute;
  z-index: 1;
  top: 22%;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  opacity: 0.07;
  filter: brightness(0) invert(1);
  pointer-events: none;
}
.uni-rise {
  position: relative;
  z-index: 3;
}
.uni-rise > * {
  opacity: 0;
  transform: translateY(18px);
  animation: uni-rise 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
}
.uni-rise > *:nth-child(2) { animation-delay: 0.12s; }
.uni-rise > *:nth-child(3) { animation-delay: 0.24s; }
.uni-rise > *:nth-child(4) { animation-delay: 0.36s; }

.uni-cue {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--bsk-fg-secondary);
  animation: uni-bob 2s ease-in-out infinite;
}

@keyframes uni-rise { to { opacity: 1; transform: none; } }
@keyframes uni-drift { to { transform: translate(3%, -3%) scale(1.1); } }
@keyframes uni-bob { 50% { transform: translateX(-50%) translateY(6px); } }

@media (prefers-reduced-motion: reduce) {
  .uni-fog,
  .uni-cue { animation: none; }
  .uni-rise > * { opacity: 1; transform: none; animation: none; }
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- universCss
```

- [ ] **Step 5: Commit**

```bash
git add app/styles/univers.css app/styles/__tests__/universCss.test.ts
git commit -m "feat(univers): univers.css (hero cascade + brume + reduced-motion)"
```

---

### Task 5: Restyle `UniverseHero` (atmosphérique)

Hero teinté par l'accent d'univers (halo `--bsk-uni-soft` hérité du conteneur de page), emblème en filigrane, pastille genre optionnelle, citation, stats, animation en cascade. Remplace l'ancienne API `themeColor` (l'accent vient désormais du CSS var posé par la route).

**Files:**
- Modify: `storefront/app/components/UniverseHero.tsx`
- Modify: `storefront/app/components/__tests__/UniverseHero.test.tsx`

- [ ] **Step 1: Réécrire le test**

```tsx
// storefront/app/components/__tests__/UniverseHero.test.tsx
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {UniverseHero} from '../UniverseHero';

describe('UniverseHero', () => {
  it('rend titre + citation + stats + pastille genre', () => {
    render(
      <UniverseHero
        title="Au Nom des Dieux"
        kicker="Fantastique · Mythologie"
        quote="« Et si les légendes antiques étaient vraies ? »"
        stats="4 sagas · 6 tomes"
      />,
    );
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Au Nom des Dieux');
    expect(screen.getByText('Fantastique · Mythologie')).toBeInTheDocument();
    expect(screen.getByText(/légendes antiques/)).toBeInTheDocument();
    expect(screen.getByText('4 sagas · 6 tomes')).toBeInTheDocument();
  });

  it('omet la pastille et la citation quand absentes', () => {
    render(<UniverseHero title="Fracture" stats="1 tome" />);
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Fracture');
    expect(screen.getByText('1 tome')).toBeInTheDocument();
    expect(screen.queryByText('Fantastique · Mythologie')).not.toBeInTheDocument();
    expect(screen.queryByText(/légendes antiques/)).not.toBeInTheDocument();
  });

  it('rend l\'image hero quand fournie', () => {
    render(
      <UniverseHero
        title="Saga X"
        heroImage={{url: 'https://example.com/hero.jpg', altText: 'Saga X hero', width: 1920, height: 600}}
      />,
    );
    expect(screen.getByAltText('Saga X hero')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- UniverseHero
```

- [ ] **Step 3: Réécrire le composant**

```tsx
// storefront/app/components/UniverseHero.tsx
import emblem from '~/assets/bilskirnir-emblem.png';

export interface HeroImage {
  url: string;
  altText: string;
  width: number;
  height: number;
}

export interface UniverseHeroProps {
  title: string;
  kicker?: string | null;
  quote?: string | null;
  stats?: string | null;
  heroImage?: HeroImage | null;
}

export function UniverseHero({title, kicker, quote, stats, heroImage}: UniverseHeroProps) {
  return (
    <header className="uni-hero">
      {heroImage ? (
        <img className="uni-hero-img" src={heroImage.url} alt={heroImage.altText} />
      ) : (
        <div className="uni-hero-bg" />
      )}
      <div className="uni-fog" />
      <img className="uni-emblem" src={emblem} alt="" aria-hidden="true" />

      <div className="uni-rise">
        {kicker ? (
          <span
            style={{
              display: 'inline-flex',
              fontSize: 'var(--bsk-text-xs)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-fg-primary)',
              border: '1px solid var(--bsk-border-subtle)',
              borderRadius: '999px',
              padding: '6px 13px',
            }}
          >
            {kicker}
          </span>
        ) : null}
        <h1
          style={{
            fontFamily: 'var(--bsk-font-display)',
            fontWeight: 800,
            fontSize: 'clamp(40px, 12vw, 52px)',
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
            margin: 'var(--bsk-space-4) 0 var(--bsk-space-3)',
            color: 'var(--bsk-fg-primary)',
          }}
        >
          {title}
        </h1>
        {quote ? (
          <p
            style={{
              fontStyle: 'italic',
              fontSize: 'var(--bsk-text-read)',
              lineHeight: 1.5,
              color: '#d7cdb6',
              maxWidth: '300px',
              margin: '0 auto var(--bsk-space-4)',
            }}
          >
            {quote}
          </p>
        ) : null}
        {stats ? (
          <p
            style={{
              fontFamily: 'var(--bsk-font-sans)',
              fontSize: 'var(--bsk-text-xs)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-accent-gold)',
            }}
          >
            {stats}
          </p>
        ) : null}
      </div>

      <div className="uni-cue" aria-hidden="true">↓ Les sagas</div>
    </header>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- UniverseHero
```

- [ ] **Step 5: Commit**

```bash
git add app/components/UniverseHero.tsx app/components/__tests__/UniverseHero.test.tsx
git commit -m "feat(univers): UniverseHero atmospherique (halo univers, embleme, citation, stats)"
```

---

### Task 6: Restyle `TomeCard` (couverture débordante + badge sur image)

Couverture vedette via `Cover` débordante (`bleed`), `ReleaseStatusBadge onImage` posé sur la couverture, texte centré dessous (n° de tome, titre, prix si publié). L'API et les textes restent identiques (les tests existants doivent rester verts).

**Files:**
- Modify: `storefront/app/components/TomeCard.tsx`
- Test: `storefront/app/components/__tests__/TomeCard.test.tsx` (doit rester vert)

- [ ] **Step 1: Vérifier l'état vert avant**

```bash
cd storefront && npm test -- TomeCard
```

Expected: PASS (4 tests existants). On va les garder verts.

- [ ] **Step 2: Réécrire le composant**

```tsx
// storefront/app/components/TomeCard.tsx
import {Link} from 'react-router';
import {Cover} from './Cover';
import {ReleaseStatusBadge, type ReleaseStatus} from './ReleaseStatusBadge';
import type {CoverImage} from './WorkTile';

export interface TomeCardProps {
  handle: string;
  title: string;
  cover: CoverImage;
  status: ReleaseStatus;
  releaseDate?: string | null;
  tomeNumber?: number | null;
  priceFormatted?: string | null;
}

export function TomeCard({
  handle,
  title,
  cover,
  status,
  releaseDate,
  tomeNumber,
  priceFormatted,
}: TomeCardProps) {
  return (
    <Link
      to={`/products/${handle}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
        textAlign: 'center',
      }}
    >
      <div style={{position: 'relative'}}>
        <ReleaseStatusBadge status={status} releaseDate={releaseDate} onImage />
        <Cover image={cover} bleed />
      </div>
      <div
        style={{
          marginTop: 'var(--bsk-space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--bsk-space-1)',
        }}
      >
        {tomeNumber != null ? (
          <span
            style={{
              fontFamily: 'var(--bsk-font-sans)',
              fontSize: 'var(--bsk-text-xs)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-fg-secondary)',
            }}
          >
            TOME {tomeNumber}
          </span>
        ) : null}
        <span
          style={{
            fontFamily: 'var(--bsk-font-display)',
            fontWeight: 'var(--bsk-weight-medium)',
            fontSize: 'var(--bsk-text-lg)',
            color: 'var(--bsk-fg-primary)',
            letterSpacing: 'var(--bsk-tracking-tight)',
            lineHeight: 1.15,
          }}
        >
          {title}
        </span>
        {status === 'publié' && priceFormatted ? (
          <span
            style={{
              fontFamily: 'var(--bsk-font-sans)',
              fontSize: 'var(--bsk-text-base)',
              color: 'var(--bsk-accent-gold)',
            }}
          >
            {priceFormatted}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Run — expect PASS (4 tests inchangés)**

```bash
cd storefront && npm test -- TomeCard
```

Expected: PASS. (Le lien, l'altText via `Cover`, « TOME 1 », le prix publié et « À PARAÎTRE » via le badge restent présents.)

- [ ] **Step 4: Commit**

```bash
git add app/components/TomeCard.tsx
git commit -m "feat(univers): TomeCard couverture debordante + badge sur image"
```

---

### Task 7: Restyle `SagaSection` (grille 2 colonnes)

Head centré (label `SAGA · TYPE · N TOMES`, titre display, synopsis italique) puis **grille 2 colonnes** de `TomeCard`. On retire l'ornement interne (les séparateurs `✦` sont posés par la route entre les sagas).

**Files:**
- Modify: `storefront/app/components/SagaSection.tsx`
- Test: `storefront/app/components/__tests__/SagaSection.test.tsx` (doit rester vert)

- [ ] **Step 1: Réécrire le composant**

```tsx
// storefront/app/components/SagaSection.tsx
import {Link} from 'react-router';
import {TomeCard, type TomeCardProps} from './TomeCard';

export interface SagaSectionProps {
  nom: string;
  type?: string | null;
  synopsis?: string | null;
  tomes: TomeCardProps[];
  bundleHref?: string | null;
}

export function SagaSection({nom, type, synopsis, tomes, bundleHref}: SagaSectionProps) {
  const labelParts = [
    'SAGA',
    type ? type.toUpperCase() : null,
    `${tomes.length} TOMES`,
  ].filter(Boolean);

  return (
    <section style={{padding: 'var(--bsk-space-10) 0'}}>
      <div style={{textAlign: 'center', marginBottom: 'var(--bsk-space-6)'}}>
        <p
          style={{
            fontFamily: 'var(--bsk-font-sans)',
            fontSize: 'var(--bsk-text-xs)',
            letterSpacing: 'var(--bsk-tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--bsk-accent-gold)',
            marginBottom: 'var(--bsk-space-3)',
          }}
        >
          {labelParts.join(' · ')}
        </p>
        <h2
          style={{
            fontFamily: 'var(--bsk-font-display)',
            fontWeight: 'var(--bsk-weight-bold)',
            fontSize: 'var(--bsk-text-xl)',
            color: 'var(--bsk-fg-primary)',
            letterSpacing: 'var(--bsk-tracking-tight)',
            marginBottom: 'var(--bsk-space-3)',
          }}
        >
          {nom}
        </h2>
        {synopsis ? (
          <p
            style={{
              fontStyle: 'italic',
              fontSize: 'var(--bsk-text-base)',
              lineHeight: 1.6,
              color: 'var(--bsk-fg-secondary)',
              maxWidth: 'var(--bsk-width-reading)',
              margin: '0 auto',
              whiteSpace: 'pre-line',
            }}
          >
            {synopsis}
          </p>
        ) : null}
        {bundleHref ? (
          <Link
            to={bundleHref}
            style={{
              display: 'inline-block',
              marginTop: 'var(--bsk-space-5)',
              padding: 'var(--bsk-space-3) var(--bsk-space-6)',
              fontFamily: 'var(--bsk-font-sans)',
              fontSize: 'var(--bsk-text-sm)',
              letterSpacing: 'var(--bsk-tracking-wide)',
              textTransform: 'uppercase',
              color: 'var(--bsk-bg-base)',
              background: 'var(--bsk-accent-gold)',
              textDecoration: 'none',
              borderRadius: '999px',
            }}
          >
            Acheter la saga complète
          </Link>
        ) : null}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--bsk-space-5)',
          alignItems: 'start',
        }}
      >
        {tomes.map((t) => (
          <TomeCard key={t.handle} {...t} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run — expect PASS (5 tests inchangés)**

```bash
cd storefront && npm test -- SagaSection
```

Expected: PASS (label `SAGA · DUOLOGIE · 2 TOMES`, titre, synopsis, tomes, CTA bundle).

- [ ] **Step 3: Commit**

```bash
git add app/components/SagaSection.tsx
git commit -m "feat(univers): SagaSection grille 2 colonnes + head centre"
```

---

### Task 8: Composant `UniverseRail` (« Découvrir un autre univers »)

Rail horizontal de cartes, **chacune teintée de sa couleur maîtresse** (`accent`), avec un label (Univers / Roman indépendant) et le nom, liant vers la page de l'univers.

**Files:**
- Create: `storefront/app/components/UniverseRail.tsx`
- Test: `storefront/app/components/__tests__/UniverseRail.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/UniverseRail.test.tsx
import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {UniverseRail, type UniverseRailItem} from '../UniverseRail';

const items: UniverseRailItem[] = [
  {handle: 'fracture', title: 'Fracture', kicker: 'Univers', accent: '#46638f'},
  {handle: 'berserker', title: 'Berserker', kicker: 'Roman indépendant', accent: null},
];

describe('UniverseRail', () => {
  it('rend une carte par univers avec lien et nom', () => {
    renderWithRouter(<UniverseRail items={items} />);
    expect(screen.getByRole('link', {name: /Fracture/})).toHaveAttribute(
      'href',
      '/collections/fracture',
    );
    expect(screen.getByText('Berserker')).toBeInTheDocument();
  });

  it('ne rend rien si la liste est vide', () => {
    const {container} = renderWithRouter(<UniverseRail items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- UniverseRail
```

- [ ] **Step 3: Implement**

```tsx
// storefront/app/components/UniverseRail.tsx
import {Link} from 'react-router';

export interface UniverseRailItem {
  handle: string;
  title: string;
  kicker: string;
  accent: string | null;
}

export function UniverseRail({items}: {items: UniverseRailItem[]}) {
  if (items.length === 0) return null;
  return (
    <section style={{padding: 'var(--bsk-space-10) 0 var(--bsk-space-8) var(--bsk-space-5)'}}>
      <h2
        style={{
          fontFamily: 'var(--bsk-font-display)',
          fontWeight: 'var(--bsk-weight-bold)',
          fontSize: 'var(--bsk-text-lg)',
          color: 'var(--bsk-fg-primary)',
          marginBottom: 'var(--bsk-space-5)',
        }}
      >
        Découvrir un autre univers
      </h2>
      <div
        style={{
          display: 'flex',
          gap: 'var(--bsk-space-4)',
          overflowX: 'auto',
          paddingBottom: 'var(--bsk-space-2)',
        }}
      >
        {items.map((it) => (
          <Link
            key={it.handle}
            to={`/collections/${it.handle}`}
            style={{
              position: 'relative',
              flex: '0 0 auto',
              width: '200px',
              height: '130px',
              borderRadius: '14px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-end',
              padding: 'var(--bsk-space-4)',
              textDecoration: 'none',
              background: `radial-gradient(70% 80% at 60% 20%, ${it.accent ?? '#2a2c36'}, #0e1117)`,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,.82), transparent 70%)',
              }}
            />
            <span style={{position: 'relative', zIndex: 2}}>
              <span
                style={{
                  display: 'block',
                  fontSize: '9px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--bsk-accent-gold)',
                }}
              >
                {it.kicker}
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--bsk-font-display)',
                  fontWeight: 'var(--bsk-weight-bold)',
                  fontSize: 'var(--bsk-text-md)',
                  color: 'var(--bsk-fg-primary)',
                  marginTop: '3px',
                }}
              >
                {it.title}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- UniverseRail
```

- [ ] **Step 5: Commit**

```bash
git add app/components/UniverseRail.tsx app/components/__tests__/UniverseRail.test.tsx
git commit -m "feat(univers): UniverseRail (autres univers, cartes teintees)"
```

---

### Task 9: Câbler la route `collections.$handle.tsx`

Poser l'accent d'univers sur un conteneur de page, alimenter le hero (genre + citation issue du lore), le bloc « L'univers » (corps du lore), les sagas (avec `type`) séparées par `✦`, et le rail « autres univers ». Importer `univers.css` et étendre la query avec `otherUniverses`.

**Files:**
- Modify (réécriture): `storefront/app/routes/collections.$handle.tsx`
- Test: `storefront/app/routes/__tests__/collection-univers.test.ts` (create)

- [ ] **Step 1: Write the failing test (assertions sur la source)**

```ts
// storefront/app/routes/__tests__/collection-univers.test.ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const src = readFileSync(resolve(process.cwd(), 'app/routes/collections.$handle.tsx'), 'utf8');

describe('collections.$handle (page univers)', () => {
  it('porte l\'accent d\'univers et importe univers.css', () => {
    expect(src).toContain('universeAccentStyle');
    expect(src).toContain("'~/styles/univers.css'");
  });
  it('utilise splitLore, UniverseRail et la query otherUniverses', () => {
    expect(src).toContain('splitLore');
    expect(src).toContain('UniverseRail');
    expect(src).toContain('otherUniverses');
    expect(src).toContain('UNIVERSE_RAIL_FRAGMENT');
  });
  it('sépare les sagas par un Ornament', () => {
    expect(src).toContain('<Ornament');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- collection-univers
```

- [ ] **Step 3: Réécrire `collections.$handle.tsx`**

```tsx
// storefront/app/routes/collections.$handle.tsx
import {useLoaderData} from 'react-router';
import type {Route} from './+types/collections.$handle';
import type {CollectionQuery} from 'storefrontapi.generated';
import {Container} from '~/components/Container';
import {UniverseHero} from '~/components/UniverseHero';
import {SagaSection} from '~/components/SagaSection';
import {TomeCard} from '~/components/TomeCard';
import {Ornament} from '~/components/Ornament';
import {UniverseRail, type UniverseRailItem} from '~/components/UniverseRail';
import {UNIVERSE_DETAIL_FRAGMENT, UNIVERSE_RAIL_FRAGMENT} from '~/lib/fragments';
import {universeAccentStyle} from '~/lib/universeAccent';
import {splitLore} from '~/lib/lore';
import {
  metaobjectField,
  parseBool,
  parseNumeroTome,
  parseStatutParution,
  richTextToPlain,
} from '~/lib/tomeMetafields';
import '~/styles/univers.css';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.collection.title ?? 'Univers'} — Bilskirnir`},
];

const COLLECTION_QUERY = `#graphql
  query Collection($country: CountryCode, $language: LanguageCode, $handle: String!)
    @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      ...UniverseDetail
    }
    otherUniverses: collections(first: 20, sortKey: TITLE) {
      nodes { ...UniverseRailCard }
    }
  }
  ${UNIVERSE_DETAIL_FRAGMENT}
  ${UNIVERSE_RAIL_FRAGMENT}
` as const;

export async function loader({context, params}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw new Response('Missing handle', {status: 400});
  const {collection, otherUniverses} = await context.storefront.query(
    COLLECTION_QUERY,
    {variables: {handle}},
  );
  if (!collection) throw new Response('Not found', {status: 404});
  return {collection, otherUniverses};
}

type Collection = NonNullable<CollectionQuery['collection']>;
type ProductNode = Collection['products']['nodes'][number];

function toTomeCardProps(p: ProductNode) {
  const status = parseStatutParution(p.statutParution?.value);
  const fmt = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: p.priceRange.minVariantPrice.currencyCode,
  });
  const cover = p.featuredImage
    ? {
        url: p.featuredImage.url,
        altText: p.featuredImage.altText ?? p.title,
        width: p.featuredImage.width ?? 0,
        height: p.featuredImage.height ?? 0,
      }
    : {url: '', altText: p.title, width: 400, height: 600};
  return {
    handle: p.handle,
    title: p.title,
    cover,
    status,
    releaseDate: p.dateParution?.value ?? null,
    tomeNumber: parseNumeroTome(p.numeroTome?.value),
    priceFormatted: fmt.format(parseFloat(p.priceRange.minVariantPrice.amount)),
  };
}

export default function CollectionRoute() {
  const {collection, otherUniverses} = useLoaderData<typeof loader>();

  const themeColor = collection.couleurTheme?.value ?? null;
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

  const sagaNodes = collection.sagas?.references?.nodes ?? [];
  const products = collection.products.nodes;

  const productsBySaga = new Map<string, ProductNode[]>();
  const standaloneProducts: ProductNode[] = [];
  for (const p of products) {
    const sagaHandle = p.saga?.reference?.handle ?? null;
    if (sagaHandle) {
      const existing = productsBySaga.get(sagaHandle) ?? [];
      existing.push(p);
      productsBySaga.set(sagaHandle, existing);
    } else {
      standaloneProducts.push(p);
    }
  }

  const stats = `${
    sagaNodes.length > 0
      ? `${sagaNodes.length} saga${sagaNodes.length > 1 ? 's' : ''} · `
      : ''
  }${products.length} tome${products.length > 1 ? 's' : ''}`;

  const railItems: UniverseRailItem[] = (otherUniverses?.nodes ?? [])
    .filter((c) => c.handle !== collection.handle)
    .map((c) => ({
      handle: c.handle,
      title: c.title,
      kicker: parseBool(c.estUneOeuvreIndependante?.value)
        ? 'Roman indépendant'
        : 'Univers',
      accent: c.couleurTheme?.value ?? null,
    }));

  return (
    <div style={universeAccentStyle(themeColor)}>
      <UniverseHero
        title={collection.title}
        kicker={genre}
        quote={quote}
        stats={stats}
        heroImage={heroImage}
      />

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

      <Container width="content">
        {sagaNodes.length > 0 ? (
          <>
            {sagaNodes.map((saga, i) => {
              const nom = metaobjectField(saga.fields, 'nom') ?? '';
              const type = metaobjectField(saga.fields, 'type');
              const synopsis = richTextToPlain(metaobjectField(saga.fields, 'synopsis'));
              const tomes = (productsBySaga.get(saga.handle) ?? [])
                .map(toTomeCardProps)
                .sort((a, b) => (a.tomeNumber ?? 0) - (b.tomeNumber ?? 0));
              return (
                <div key={saga.id}>
                  <SagaSection nom={nom} type={type} synopsis={synopsis} tomes={tomes} />
                  {i < sagaNodes.length - 1 ? <Ornament /> : null}
                </div>
              );
            })}
          </>
        ) : (
          <section style={{padding: 'var(--bsk-space-10) 0'}}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--bsk-space-5)',
                alignItems: 'start',
              }}
            >
              {products
                .map(toTomeCardProps)
                .sort((a, b) => (a.tomeNumber ?? 0) - (b.tomeNumber ?? 0))
                .map((t) => (
                  <TomeCard key={t.handle} {...t} />
                ))}
            </div>
          </section>
        )}
      </Container>

      <Ornament />
      <Container width="content">
        <UniverseRail items={railItems} />
      </Container>
    </div>
  );
}
```

> Note : on a retiré le bloc « Hors saga » de la version précédente (les œuvres indépendantes vivent sur leur propre fiche/univers ; un univers regroupe ses sagas). Si une collection n'a pas de saga, on retombe sur la grille plate 2 colonnes.

- [ ] **Step 4: Régénérer les types + run**

```bash
cd storefront && npm run codegen && npm test -- collection-univers
```

Expected: codegen OK (query valide), test PASS.

- [ ] **Step 5: Build (typecheck complet)**

```bash
cd storefront && npm run build
```

Expected: build OK.

- [ ] **Step 6: Commit**

```bash
git add app/routes/collections.$handle.tsx app/routes/__tests__/collection-univers.test.ts storefrontapi.generated.d.ts
git commit -m "feat(univers): page univers immersive (hero, lore, sagas ✦, rail autres univers)"
```

---

### Task 10: Sanity check + revue visuelle

- [ ] **Step 1: Toute la suite verte**

```bash
cd storefront && npm test
```

Expected: tous verts (suite existante + nouveaux tests de ce plan).

- [ ] **Step 2: Build**

```bash
cd storefront && npm run build
```

Expected: pas d'erreur de type ni de bundle.

- [ ] **Step 3: Revue visuelle (`npm run dev`)**

Ouvrir `/collections/au-nom-des-dieux` et comparer à `03-univers-mobile.html` :
- [ ] Hero atmosphérique : halo discret de la **couleur d'univers** (vert AnDd), emblème en filigrane, grand titre Cabinet Grotesk, citation, stats dorées, indice « ↓ Les sagas ».
- [ ] Bloc « L'univers » : lore en corps 17px.
- [ ] Sections par saga : label `SAGA · TYPE · N TOMES`, titre, synopsis italique, **grille 2 colonnes** de couvertures vedettes (débord, drop-shadow, **badge de statut posé sur la couverture** pour préco/à paraître).
- [ ] Séparateurs `✦` entre les sagas et avant le rail.
- [ ] Rail « Découvrir un autre univers » : cartes **chacune teintée de sa couleur maîtresse**, lien vers la page univers.
- [ ] `Header` + `Footer` globaux présents (page non-immersive).
- [ ] `prefers-reduced-motion` (DevTools → Rendering) : pas de cascade ni de brume animée, contenu visible immédiatement.
- [ ] Aucun warning console, aucune couverture dans un cadre/carré gris.

- [ ] **Step 4: Commit (si ajustements)**

```bash
cd storefront && npm test && git add -A && git commit -m "chore(univers): sanity pass page univers"
```

---

## Self-review (couverture spec §3.2 + §2.4-2.6)

| Élément spec | Tâche |
|---|---|
| §3.2 Hero atmosphérique (base grise + accent univers discret, emblème filigrane, titre, citation, stats) | Task 5 (+ Task 9 accent wrapper) |
| §3.2 Bloc « L'univers » (lore corps agrandi) | Task 2 (splitLore) + Task 9 |
| §3.2 Sections par saga (label, titre, synopsis, grille 2 colonnes) | Task 7 + Task 9 |
| §2.4 Couvertures vedettes (drop-shadow, débord, jamais de cadre) | Task 6 (Cover bleed) |
| §2.5 Badge de statut posé sur la couverture | Task 6 (ReleaseStatusBadge onImage) |
| §2.5 Séparateur `✦` | Task 1 (Ornament) + Task 9 |
| §3.2 « Découvrir un autre univers » (cartes par couleur maîtresse) | Task 8 + Task 9 |
| §3.2 Footer complet | Task 9 (page non-immersive → Footer global) |
| §2.6 Mouvement (cascade, brume) + reduced-motion | Task 4 (univers.css) + Task 5 |

**Différé (plans suivants / données admin) :**
- Promotion de la *smart nav* (emblème, panier, masquage au scroll) sur les pages internes — plan dédié de chrome global.
- Metafields `genre` (pastille hero) et `type` de saga : optionnels, rendus si présents ; à renseigner côté admin pour matcher pleinement la maquette.
- Fonds atmosphériques `illustration_hero` par univers : câblés (rendu si présents), visuels fournis par Gautier.
- Fiches produit (tome / one-shot) §3.3-3.4 : **plan suivant** (la carte « Dans l'univers de » de la fiche pointera vers cette page).
- Version desktop dédiée (la page se transpose en responsive depuis le mobile).
```
