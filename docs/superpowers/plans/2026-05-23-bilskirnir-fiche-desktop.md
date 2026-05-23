# Bilskirnir — Fiche produit desktop immersive — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donner une mise en page **desktop immersive** à la fiche produit (tome + one-shot) — hero atmosphérique « split » (couverture flottante + bloc d'achat sur un fond teinté de la couleur de l'univers/du livre), puis un parcours **centré symétrique** (valeurs, récit, bandeau full-bleed univers/atmosphère, fiche technique, rail à la largeur du contenu) — sans casser le mobile.

**Architecture:** On restructure `TomePageTemplate`/`OneShotPageTemplate` pour que le **hero contienne à la fois la couverture et le bloc d'achat** (aujourd'hui empilés séparément), et on déplace les styles inline du bloc d'achat vers des **classes** dans `fiche.css`. Toute la mise en page desktop vit dans un **`@media (min-width: 860px)`** : le hero passe en grille 2 colonnes centrée, le fond atmosphérique se renforce, les sections reçoivent leurs `max-width` centrés, et le rail lié se répartit à la largeur du contenu. Le **markup et le rendu mobile restent équivalents** (les classes par défaut reproduisent l'actuel). Le bandeau « Dans l'univers de » / « L'atmosphère du livre » devient un **bandeau full-bleed teinté**.

**Tech Stack:** Hydrogen (React Router v7), TypeScript, Vitest + Testing Library, Vanilla CSS (`--bsk-*` + `fiche.css`).

**Spec:** `docs/superpowers/specs/2026-05-23-fiche-produit-desktop-design.md`
**Maquettes:** `.superpowers/brainstorm/6204-1779540238/content/fiche-desktop-final.html`, `fiche-desktop-oneshot.html`, `fiche-desktop-centered.html`

---

## Décisions de cadrage

1. **Breakpoint desktop `860px`** (cohérent nav/catalogue). En dessous : layout mobile actuel (équivalent).
2. **Fond atmosphérique = dégradés de `--bsk-uni`** (déjà posé par la route Plan 4) + brume + emblème filigrane. `illustration_hero` en image de fond : **différé** (pas de changement de query ; le dégradé suffit et dégrade proprement).
3. **CSS-driven** : on bouge les styles inline du bloc d'achat vers des classes partagées (`fiche.css`), réutilisées par tome + one-shot. Aucune logique nouvelle.
4. Les **tests existants** des templates (Plan 4) doivent rester verts : on conserve les textes/rôles (titre h1, teaser, « Dans l'univers de {titre} », « L'atmosphère du livre », pastille « ROMAN INDÉPENDANT », alt couverture, purchaseSlot, breadcrumb).

---

## Prerequisites

- [ ] `cd storefront && npm test` vert.
- [ ] `TomePageTemplate`/`OneShotPageTemplate` (Plan 4) + `fiche.css` présents ; composants `ProductGallery`, `ValuesBadges`, `TechSpecs`, `RelatedRail`.
- [ ] Accent déjà posé par `products.$handle.tsx` via `universeAccentStyle` (`--bsk-uni`/`--bsk-uni-soft`).

---

## File Structure

```
storefront/app/
├── styles/
│   ├── ✏️ fiche.css                   (+ classes bloc d'achat/sections + @media 860px desktop)
│   └── __tests__/✏️ ficheCss.test.ts  (+ assertions desktop)
└── components/
    ├── ✏️ TomePageTemplate.tsx        (hero split cover+achat ; bandeau univers full-bleed ; classes)
    ├── ✏️ OneShotPageTemplate.tsx     (hero split ; bandeau atmosphère full-bleed ; classes)
    ├── ✏️ RelatedRail.tsx             (classes pour répartition desktop)
    └── __tests__/ (TomePageTemplate / OneShotPageTemplate / RelatedRail — rester verts)
```

---

## Tasks

### Task 1: `fiche.css` — classes bloc d'achat + sections + couche desktop

Ajoute les classes utilisées par les templates (pastille, titre, teaser, label de tome, sections centrées, bandeau univers, valeurs, rail) avec un **rendu mobile par défaut** équivalent à l'actuel, puis la **couche desktop** sous `@media (min-width: 860px)` : hero en grille 2 colonnes centrée, atmosphère renforcée, sections `max-width` centrés, rail réparti, respiration sous la couverture.

**Files:**
- Modify: `storefront/app/styles/fiche.css`
- Modify: `storefront/app/styles/__tests__/ficheCss.test.ts`

- [ ] **Step 1: Ajouter les assertions desktop au test**

Remplacer le contenu de `app/styles/__tests__/ficheCss.test.ts` par :

```ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const css = readFileSync(resolve(process.cwd(), 'app/styles/fiche.css'), 'utf8');

describe('fiche.css', () => {
  it('définit le hero, la couverture flottante et le halo d\'univers', () => {
    expect(css).toContain('.fiche-hero');
    expect(css).toContain('.fiche-cover');
    expect(css).toContain('var(--bsk-uni-soft)');
  });
  it('porte le flottement et la cascade', () => {
    expect(css).toMatch(/@keyframes\s+fiche-float/);
    expect(css).toMatch(/@keyframes\s+fiche-rise/);
  });
  it('a une classe toast', () => {
    expect(css).toContain('.fiche-toast');
  });
  it('neutralise les animations en reduced-motion', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });
  it('couche desktop : hero en grille 2 colonnes + bandeau univers', () => {
    expect(css).toMatch(/@media\s*\(min-width:\s*860px\)/);
    expect(css).toContain('.fiche-hero-inner');
    expect(css).toContain('.fiche-buy');
    expect(css).toContain('.fiche-univ-band');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- ficheCss
```

- [ ] **Step 3: Ajouter les règles à `fiche.css`**

Ajouter à la **fin** de `app/styles/fiche.css` (ne pas toucher l'existant) :

```css

/* ── Bloc d'achat & sections (classes partagées tome + one-shot) ── */
.fiche-emblem {
  position: absolute;
  top: 44%;
  left: 42%;
  transform: translate(-50%, -50%);
  font-size: 160px;
  line-height: 1;
  color: #fff;
  opacity: 0.04;
  z-index: 1;
  pointer-events: none;
}
.fiche-hero-inner {
  position: relative;
  z-index: 3;
}
.fiche-pill {
  display: inline-flex;
  font-size: var(--bsk-text-xs);
  letter-spacing: var(--bsk-tracking-widest);
  text-transform: uppercase;
  color: var(--bsk-fg-primary);
  border: 1px solid var(--bsk-border-subtle);
  border-radius: 999px;
  padding: 6px 13px;
}
.fiche-tomelabel {
  font-size: var(--bsk-text-xs);
  letter-spacing: var(--bsk-tracking-widest);
  text-transform: uppercase;
  color: var(--bsk-fg-secondary);
  margin: 16px 0 6px;
}
.fiche-title {
  font-family: var(--bsk-font-display);
  font-weight: 800;
  font-size: clamp(34px, 8vw, 54px);
  line-height: 0.94;
  letter-spacing: -0.025em;
  color: var(--bsk-fg-primary);
  margin: 8px 0 0;
}
.fiche-teaser {
  margin: 18px 0;
  padding: 12px 16px;
  border-left: 2px solid var(--bsk-accent-gold);
  font-style: italic;
  font-size: var(--bsk-text-base);
  line-height: 1.5;
  color: #ddd2b8;
  background: rgba(216, 166, 87, 0.05);
  white-space: pre-line;
}

/* bandeau valeurs */
.fiche-values-band {
  border-top: 1px solid var(--bsk-border-subtle);
  border-bottom: 1px solid var(--bsk-border-subtle);
}

/* sections de contenu (mobile : pleine largeur du Container) */
.fiche-section {
  padding: var(--bsk-space-8) 0;
}
.fiche-k {
  font-size: var(--bsk-text-xs);
  letter-spacing: var(--bsk-tracking-widest);
  text-transform: uppercase;
  color: var(--bsk-accent-gold);
  margin-bottom: var(--bsk-space-4);
}
.fiche-recit-body {
  font-size: var(--bsk-text-read);
  line-height: 1.72;
  color: var(--bsk-fg-primary);
  white-space: pre-line;
}

/* bandeau full-bleed univers / atmosphère */
.fiche-univ-band {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 200px;
  padding: 48px 26px;
  overflow: hidden;
  text-decoration: none;
}
.fiche-univ-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(80% 120% at 50% 20%, var(--bsk-uni), #0c1217);
}
.fiche-univ-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(19, 20, 25, 0.5), rgba(19, 20, 25, 0.85));
}
.fiche-univ-inner {
  position: relative;
  z-index: 2;
  max-width: 520px;
}
.fiche-univ-k {
  display: block;
  font-size: var(--bsk-text-xs);
  letter-spacing: var(--bsk-tracking-widest);
  text-transform: uppercase;
  color: var(--bsk-accent-gold);
  margin-bottom: var(--bsk-space-3);
}
.fiche-univ-name {
  display: block;
  font-family: var(--bsk-font-display);
  font-weight: 800;
  font-size: var(--bsk-text-xl);
  color: var(--bsk-fg-primary);
  margin-bottom: var(--bsk-space-4);
}
.fiche-univ-cta {
  display: inline-block;
  font-size: var(--bsk-text-sm);
  color: var(--bsk-fg-primary);
  border: 1px solid rgba(236, 228, 211, 0.35);
  border-radius: 999px;
  padding: 8px 16px;
}

/* indice de scroll (desktop) */
.fiche-cue {
  display: none;
}

/* ── Desktop ── */
@media (min-width: 860px) {
  .fiche-hero {
    min-height: 86vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 96px 0 80px;
  }
  .fiche-hero-bg {
    background: radial-gradient(85% 95% at 24% 34%, var(--bsk-uni), transparent 55%),
      radial-gradient(140% 130% at 50% 130%, rgba(10, 14, 18, 0.96), var(--bsk-bg-base));
    opacity: 0.85;
  }
  .fiche-hero-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--bsk-space-10);
  }
  .fiche-hero-cover {
    flex: 0 0 auto;
    width: 300px;
    transform: rotate(-2.5deg);
  }
  .fiche-buy {
    flex: 1;
    max-width: 420px;
    text-align: left;
  }
  .fiche-title {
    font-size: clamp(44px, 4.4vw, 56px);
  }
  .fiche-cue {
    display: block;
    text-align: center;
    margin-top: var(--bsk-space-8);
    font-size: 11px;
    letter-spacing: 0.2em;
    color: var(--bsk-fg-secondary);
  }

  /* sections centrées symétriques */
  .fiche-values-band .bsk-values,
  .fiche-values-band > * {
    justify-content: center;
  }
  .fiche-section--read {
    max-width: 680px;
    margin: 0 auto;
    text-align: center;
  }
  .fiche-section--read .fiche-recit-body {
    text-align: left;
  }
  .fiche-section--tech {
    max-width: 520px;
    margin: 0 auto;
  }
  .fiche-univ-band {
    min-height: 230px;
  }
  .fiche-univ-name {
    font-size: var(--bsk-text-2xl);
  }

  /* rail lié : largeur du contenu, couvertures réparties */
  .fiche-related {
    max-width: 680px;
    margin: 0 auto;
  }
  .fiche-related .bsk-related-row {
    overflow: visible;
    justify-content: space-between;
  }
  .fiche-related .bsk-related-card {
    flex: 1;
    max-width: 150px;
  }
}
```

> Le `.fiche-cover` mobile (couverture flottante) est déjà défini plus haut dans `fiche.css` (Plan 4) ; on le réutilise. Sur desktop, `.fiche-hero-cover` lui donne une largeur fixe + inclinaison.

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- ficheCss
```

- [ ] **Step 5: Commit**

```bash
git add app/styles/fiche.css app/styles/__tests__/ficheCss.test.ts
git commit -m "feat(fiche): couche CSS desktop (hero split, sections centrees, bandeau full-bleed)"
```

---

### Task 2: `RelatedRail` — classes ciblables (répartition desktop)

Le rail utilise des styles inline ; on ajoute des **classes** (`bsk-related`, `bsk-related-row`, `bsk-related-card`) pour que `fiche.css` puisse le répartir sur desktop. Le rendu mobile (rail scrollable) reste identique. Test existant vert + assertion de classe.

**Files:**
- Modify: `storefront/app/components/RelatedRail.tsx`
- Modify: `storefront/app/components/__tests__/RelatedRail.test.tsx`

- [ ] **Step 1: Réécrire `RelatedRail.tsx`**

```tsx
// storefront/app/components/RelatedRail.tsx
import {Link} from 'react-router';
import {Cover, type CoverImage} from './Cover';

export interface RelatedItem {
  handle: string;
  title: string;
  cover: CoverImage | null;
  priceLabel: string | null;
}

export function RelatedRail({heading, items}: {heading: string; items: RelatedItem[]}) {
  if (items.length === 0) return null;
  return (
    <section
      className="bsk-related"
      style={{
        padding: 'var(--bsk-space-6) 0 var(--bsk-space-6) var(--bsk-space-5)',
        borderTop: '1px solid var(--bsk-border-subtle)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--bsk-font-display)',
          fontWeight: 'var(--bsk-weight-bold)',
          fontSize: 'var(--bsk-text-md)',
          color: 'var(--bsk-fg-primary)',
          marginBottom: 'var(--bsk-space-4)',
        }}
      >
        {heading}
      </h2>
      <div
        className="bsk-related-row"
        style={{display: 'flex', gap: 'var(--bsk-space-4)', overflowX: 'auto', paddingBottom: 'var(--bsk-space-2)'}}
      >
        {items.map((it) => (
          <Link
            key={it.handle}
            to={`/products/${it.handle}`}
            className="bsk-related-card"
            style={{flex: '0 0 auto', width: '120px', textDecoration: 'none', color: 'inherit', textAlign: 'center'}}
          >
            <div style={{width: '128%', margin: '0 -14%'}}>
              <Cover image={it.cover} />
            </div>
            <div
              style={{
                fontFamily: 'var(--bsk-font-display)',
                fontSize: 'var(--bsk-text-sm)',
                color: 'var(--bsk-fg-primary)',
                marginTop: 'var(--bsk-space-3)',
                lineHeight: 1.2,
              }}
            >
              {it.title}
            </div>
            {it.priceLabel ? (
              <div style={{fontSize: 'var(--bsk-text-xs)', color: 'var(--bsk-accent-gold)', marginTop: '2px'}}>
                {it.priceLabel}
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
```

> `.fiche-related .bsk-related-row { justify-content: space-between }` (Task 1) répartit les cartes sur desktop ; en mobile le rail reste scrollable. Le `width:120px` inline est neutralisé sur desktop par `.bsk-related-card{flex:1;max-width:150px}` (la règle desktop l'emporte par media-query + spécificité de classe sur l'inline ? non : l'inline gagne — voir note).

> **Note importante (inline vs CSS)** : `width:120px` et `flex:'0 0 auto'` sont **inline** → ils battent la classe desktop. Pour que la répartition desktop fonctionne, **retirer ces deux propriétés de l'inline** et les porter en CSS mobile. Donc : sur `.bsk-related-card`, retirer `flex` et `width` de l'objet `style` inline (garder `textDecoration/color/textAlign`), et ajouter dans `fiche.css` (ou ici) une règle mobile `.bsk-related-card{flex:0 0 auto;width:120px}`. Ajouter ce bloc mobile en haut du `@media` desktop dans `fiche.css` :
>
> ```css
> .bsk-related-card { flex: 0 0 auto; width: 120px; }
> ```
> (placée hors media query, dans `fiche.css`, pour le mobile.)

- [ ] **Step 2: Appliquer la note** — dans `RelatedRail.tsx`, l'inline du `Link` devient :

```tsx
            style={{textDecoration: 'none', color: 'inherit', textAlign: 'center'}}
```

Et ajouter dans `fiche.css` (hors `@media`, près des autres classes related) :

```css
.bsk-related-card { flex: 0 0 auto; width: 120px; }
```

- [ ] **Step 3: Test (rester vert + classe présente)**

Ajouter au fichier `app/components/__tests__/RelatedRail.test.tsx` une assertion :

```tsx
it('porte les classes ciblables (desktop)', () => {
  const {container} = renderWithRouter(<RelatedRail heading="X" items={items} />);
  expect(container.querySelector('.bsk-related-row')).not.toBeNull();
  expect(container.querySelector('.bsk-related-card')).not.toBeNull();
});
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- RelatedRail ficheCss
```

- [ ] **Step 5: Commit**

```bash
git add app/components/RelatedRail.tsx app/components/__tests__/RelatedRail.test.tsx app/styles/fiche.css
git commit -m "feat(fiche): RelatedRail classes ciblables (repartition desktop)"
```

---

### Task 3: Restructurer `TomePageTemplate` (hero split + bandeau univers full-bleed)

Le hero contient désormais **couverture + bloc d'achat** dans `.fiche-hero-inner` ; le bloc d'achat utilise les classes de Task 1 ; la carte « Dans l'univers de » devient un **bandeau full-bleed** ; les sections reçoivent leurs classes. Textes/rôles conservés (tests Plan 4 verts).

**Files:**
- Modify (réécriture): `storefront/app/components/TomePageTemplate.tsx`
- Test: `storefront/app/components/__tests__/TomePageTemplate.test.tsx` (rester vert)

- [ ] **Step 1: Réécrire `TomePageTemplate.tsx`**

```tsx
// storefront/app/components/TomePageTemplate.tsx
import {Link} from 'react-router';
import type {ReactNode} from 'react';
import {Container} from './Container';
import {ProductGallery} from './ProductGallery';
import {ValuesBadges} from './ValuesBadges';
import {TechSpecs, type TechRow} from './TechSpecs';
import type {CoverImage} from './Cover';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface TomePageTemplateProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  pill?: string | null;
  tomeLabel?: string | null;
  teaserShort?: string | null;
  description: string;
  cover: CoverImage;
  galleryImages?: CoverImage[];
  universe: {handle: string; title: string};
  universeKicker?: string | null;
  techRows?: TechRow[];
  purchaseSlot: ReactNode;
  relatedSlot?: ReactNode;
}

function Breadcrumbs({items}: {items: BreadcrumbItem[]}) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      style={{
        fontFamily: 'var(--bsk-font-sans)',
        fontSize: 'var(--bsk-text-xs)',
        color: 'var(--bsk-fg-secondary)',
        padding: 'var(--bsk-space-4) 0 0',
      }}
    >
      {items.map((item, i) => (
        <span key={i}>
          {item.href ? (
            <Link to={item.href} style={{color: 'var(--bsk-fg-secondary)', textDecoration: 'none'}}>
              {item.label}
            </Link>
          ) : (
            <span style={{color: 'var(--bsk-fg-primary)'}}>{item.label}</span>
          )}
          {i < items.length - 1 ? <span style={{margin: '0 var(--bsk-space-2)'}}>›</span> : null}
        </span>
      ))}
    </nav>
  );
}

export function TomePageTemplate({
  breadcrumbs,
  title,
  pill,
  tomeLabel,
  teaserShort,
  description,
  cover,
  galleryImages,
  universe,
  universeKicker,
  techRows = [],
  purchaseSlot,
  relatedSlot,
}: TomePageTemplateProps) {
  const images = (galleryImages && galleryImages.length > 0 ? galleryImages : [cover]).filter(
    (c) => c.url,
  );

  return (
    <>
      <section className="fiche-hero">
        <div className="fiche-hero-bg" />
        <div className="fiche-fog" aria-hidden="true" />
        <span className="fiche-emblem" aria-hidden="true">✦</span>
        <Container width="content">
          <Breadcrumbs items={breadcrumbs} />
          <div className="fiche-hero-inner">
            <div className="fiche-hero-cover">
              <ProductGallery images={images} alt={cover.altText ?? title} />
            </div>
            <div className="fiche-buy fiche-rise">
              {pill ? <span className="fiche-pill">{pill}</span> : null}
              {tomeLabel ? <div className="fiche-tomelabel">{tomeLabel}</div> : null}
              <h1 className="fiche-title">{title}</h1>
              {teaserShort ? <blockquote className="fiche-teaser">{teaserShort}</blockquote> : null}
              <div>{purchaseSlot}</div>
            </div>
          </div>
          <div className="fiche-cue" aria-hidden="true">↓ Le récit</div>
        </Container>
      </section>

      <div className="fiche-values-band">
        <Container width="content">
          <ValuesBadges />
        </Container>
      </div>

      <Container width="content">
        <section className="fiche-section fiche-section--read">
          <div className="fiche-k">Le récit</div>
          <div className="fiche-recit-body">{description}</div>
        </section>
      </Container>

      <Link to={`/collections/${universe.handle}`} className="fiche-univ-band">
        <span className="fiche-univ-bg" aria-hidden="true" />
        <span className="fiche-univ-scrim" aria-hidden="true" />
        <span className="fiche-univ-inner">
          {universeKicker ? <span className="fiche-univ-k">{universeKicker}</span> : null}
          <span className="fiche-univ-name">Dans l'univers de {universe.title}</span>
          <span className="fiche-univ-cta">Explorer l'univers →</span>
        </span>
      </Link>

      <Container width="content">
        <section className="fiche-section fiche-section--tech">
          <TechSpecs rows={techRows} />
        </section>
      </Container>

      {relatedSlot ? (
        <Container width="content">
          <div className="fiche-related">{relatedSlot}</div>
        </Container>
      ) : null}
    </>
  );
}
```

- [ ] **Step 2: Run — expect PASS (6 tests Plan 4 inchangés)**

```bash
cd storefront && npm test -- TomePageTemplate
```

Expected : breadcrumb liens, titre h1, teaser, couverture (alt), purchaseSlot, synopsis, « Dans l'univers de Au Nom des Dieux », pas d'img si cover sans url.

- [ ] **Step 3: Commit**

```bash
git add app/components/TomePageTemplate.tsx
git commit -m "feat(fiche): TomePageTemplate hero split desktop + bandeau univers full-bleed"
```

---

### Task 4: Restructurer `OneShotPageTemplate` (hero split + bandeau atmosphère full-bleed)

Même structure : hero split (couverture + achat), bandeau **« L'atmosphère du livre »** full-bleed (teinté de la couleur du livre via `--bsk-uni`), classes partagées. Textes/rôles conservés (tests Plan 4 verts) : pastille « ROMAN INDÉPENDANT », titre, teaser, « Le récit » (description), « L'atmosphère du livre ».

**Files:**
- Modify (réécriture): `storefront/app/components/OneShotPageTemplate.tsx`
- Test: `storefront/app/components/__tests__/OneShotPageTemplate.test.tsx` (rester vert)

- [ ] **Step 1: Réécrire `OneShotPageTemplate.tsx`**

```tsx
// storefront/app/components/OneShotPageTemplate.tsx
import type {ReactNode} from 'react';
import {Container} from './Container';
import {ProductGallery} from './ProductGallery';
import {ValuesBadges} from './ValuesBadges';
import {TechSpecs, type TechRow} from './TechSpecs';
import type {CoverImage} from './Cover';

export interface OneShotPageTemplateProps {
  title: string;
  teaserShort?: string | null;
  description: string;
  cover: CoverImage;
  pillLabel: 'ROMAN' | 'RECUEIL' | 'GUIDE';
  ambiance?: string | null;
  techRows?: TechRow[];
  purchaseSlot: ReactNode;
  relatedSlot?: ReactNode;
}

export function OneShotPageTemplate({
  title,
  teaserShort,
  description,
  cover,
  pillLabel,
  ambiance,
  techRows = [],
  purchaseSlot,
  relatedSlot,
}: OneShotPageTemplateProps) {
  const images = [cover].filter((c) => c.url);
  const atmosphereText = ambiance ?? null;

  return (
    <>
      <section className="fiche-hero">
        <div className="fiche-hero-bg" />
        <div className="fiche-fog" aria-hidden="true" />
        <span className="fiche-emblem" aria-hidden="true">✦</span>
        <Container width="content">
          <div className="fiche-hero-inner">
            <div className="fiche-hero-cover">
              <ProductGallery images={images} alt={cover.altText ?? title} />
            </div>
            <div className="fiche-buy fiche-rise">
              <span className="fiche-pill" style={{color: 'var(--bsk-accent-gold)', borderColor: 'var(--bsk-border-gold)'}}>
                {pillLabel} INDÉPENDANT
              </span>
              <h1 className="fiche-title">{title}</h1>
              {teaserShort ? <blockquote className="fiche-teaser">{teaserShort}</blockquote> : null}
              <div>{purchaseSlot}</div>
            </div>
          </div>
          <div className="fiche-cue" aria-hidden="true">↓ Le récit</div>
        </Container>
      </section>

      <div className="fiche-values-band">
        <Container width="content">
          <ValuesBadges />
        </Container>
      </div>

      <Container width="content">
        <section className="fiche-section fiche-section--read">
          <div className="fiche-k">Le récit</div>
          <div className="fiche-recit-body">{description}</div>
        </section>
      </Container>

      <section className="fiche-univ-band">
        <span className="fiche-univ-bg" aria-hidden="true" />
        <span className="fiche-univ-scrim" aria-hidden="true" />
        <span className="fiche-univ-inner">
          <span className="fiche-univ-k">L'atmosphère du livre</span>
          {atmosphereText ? <span className="fiche-univ-name">{atmosphereText}</span> : null}
        </span>
      </section>

      <Container width="content">
        <section className="fiche-section fiche-section--tech">
          <TechSpecs rows={techRows} />
        </section>
      </Container>

      {relatedSlot ? (
        <Container width="content">
          <div className="fiche-related">{relatedSlot}</div>
        </Container>
      ) : null}
    </>
  );
}
```

> Le test Plan 4 vérifie le titre « L'atmosphère du livre » (présent dans `.fiche-univ-k`) et le synopsis dans « Le récit ». La pastille « ROMAN INDÉPENDANT » est dans `.fiche-pill`.

- [ ] **Step 2: Run — expect PASS (3 tests Plan 4 inchangés)**

```bash
cd storefront && npm test -- OneShotPageTemplate
```

- [ ] **Step 3: Commit**

```bash
git add app/components/OneShotPageTemplate.tsx
git commit -m "feat(fiche): OneShotPageTemplate hero split desktop + bandeau atmosphere full-bleed"
```

---

### Task 5: Sanity check + revue visuelle

- [ ] **Step 1: Suite + build**

```bash
cd storefront && npm test && npm run build
```

Expected : tout vert, build OK.

- [ ] **Step 2: Dev (`npm run dev`) — desktop (largeur ≥ 1100px)**

- [ ] Fiche **tome** : hero plein écran teinté de l'univers (halo + brume + emblème filigrane), couverture inclinée qui flotte à gauche **avec de l'air au-dessus et en dessous**, bloc d'achat à droite (pastille, saga·tome, titre, teaser bordé doré, prix, dédicace, qty, ajouter, Shop Pay, extrait). Puis bandeau valeurs centré, « Le récit » centré (texte aligné gauche), **bandeau « Dans l'univers de » full-bleed** teinté, fiche technique centrée, rail « Dans le même univers » **à la largeur du contenu, couvertures réparties**.
- [ ] Fiche **one-shot** : idem, teintée de la couleur du livre, pastille « ROMAN INDÉPENDANT », **bandeau « L'atmosphère du livre »** à la place du bandeau univers, rail « Autres romans indépendants ».
- [ ] **Mobile (≤ 859px)** : layout inchangé (équivalent à l'actuel) — pas de régression.
- [ ] `prefers-reduced-motion` : pas d'animation gênante.

- [ ] **Step 3: Commit (si ajustements)**

```bash
cd storefront && npm test && git add -A && git commit -m "chore(fiche): sanity pass fiche desktop"
```

---

## Self-review (couverture spec)

| Élément spec | Tâche |
|---|---|
| §3.1 Hero immersif split (atmosphère, couverture flottante, respiration, bloc d'achat) | Task 1 (CSS) + Task 3/4 (structure) |
| §3.2 Rythme centré symétrique (valeurs, récit centré, technique, rail à la largeur) | Task 1 + Task 2 (rail) + Task 3/4 |
| §3.2 Bandeau full-bleed « Dans l'univers de » | Task 1 + Task 3 |
| §3.3 One-shot (couleur livre, pastille, « L'atmosphère du livre », rail autres) | Task 4 |
| §2 Breakpoint 860px, mobile inchangé | Task 1 (media query) |
| §5 Tests + vérif visuelle | Task 1 (ficheCss), Task 5 |

**Différé (spec §6) :** `illustration_hero` en image de fond (dégradé pour v1), galerie multi-images avancée, données admin réelles. Aucune régression mobile (tout sous `@media 860px`).
```
