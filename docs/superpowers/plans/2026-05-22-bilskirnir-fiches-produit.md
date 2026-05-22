# Bilskirnir — Fiches produit immersives (tome + one-shot) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre la fiche produit (`/products/$handle`) selon les maquettes validées — fiche **tome** (`04-fiche-tome-mobile`) et fiche **one-shot** (`05-fiche-oneshot-mobile`) : hero avec couverture qui flotte + halo d'univers, fil d'Ariane, mini-galerie, bloc d'achat (teaser, dédicace dépliable, quantité, ajout panier + toast, Shop Pay, lire un extrait), 3 badges « valeurs », « Le récit », « Dans l'univers de » (tome) / « L'atmosphère du livre » (one-shot), fiche technique, et rail de couvertures liées.

**Architecture:** On compose les fiches à partir de **petits composants partagés** (`ValuesBadges`, `TechSpecs`, `RelatedRail`, `ProductGallery`) + une feuille `fiche.css` (flottement de la couverture, cascade, brume, toast, reduced-motion). On restyle en place `TomePageTemplate`, `OneShotPageTemplate`, `TomeAddToCart` (quantité + toast + Shop Pay) et `DedicaceField` (carte dépliable), en conservant leurs API + tests. La route `products.$handle.tsx` étend la query (images, métadonnées techniques optionnelles, couleur d'univers, produits liés) et porte l'accent d'univers via `universeAccentStyle`. Pages **non-immersives** (Header/Footer globaux conservés).

**Tech Stack:** Hydrogen (React Router v7), TypeScript, Vitest + Testing Library, Vanilla CSS (`--bsk-*` + `fiche.css`). `ShopPayButton` (@shopify/hydrogen-react). `CartForm` (@shopify/hydrogen).

**Spec:** `docs/superpowers/specs/2026-05-22-bilskirnir-visual-redesign.md` (§2.4 couvertures, §2.5 dédicace/CTA/badges, §2.6 mouvement, §3.3 fiche tome, §3.4 fiche one-shot)
**Maquettes:** `docs/superpowers/mockups/2026-05-22-visual-redesign/04-fiche-tome-mobile.html`, `05-fiche-oneshot-mobile.html`
**Plans précédents (primitives consommées):** design-foundation, home-slider, page-univers.

---

## Décisions de cadrage (à valider en lisant)

1. **Pages non-immersives** : Header/Footer globaux conservés (comme la page univers). Promotion de la *smart nav* différée.
2. **Métadonnées optionnelles, rendu gracieux** : galerie (`product.images`), fiche technique (`custom.format`, `custom.nombre_pages`, `custom.isbn` + `date_parution` + langue « Français »), couleur one-shot (`custom.couleur_theme` produit) et halo tome (couleur de l'univers) sont **rendus seulement si présents**. Aucun contenu obligatoire ajouté ; Gautier complète au fur et à mesure.
3. **Feedback d'ajout panier** : **toast** « Ajouté au panier ✓ » (rendu dans un enfant du render-prop de `CartForm` pour rester hookable) + la **pastille panier** s'incrémente via la revalidation du panier racine. On n'ouvre pas le drawer (on reste sur la fiche, comme la maquette).
4. **Shop Pay** : bouton `ShopPayButton` rendu si `storeDomain` (renvoyé par le loader) et variante disponibles ; sinon masqué.
5. **« Lire un extrait »** : simple lien (placeholder `#`) tant que l'extrait PDF n'est pas fourni — visible, non bloquant.

---

## Prerequisites

- [ ] `cd storefront && npm test` est vert au départ.
- [ ] Primitives présentes : `Cover` (prop `bleed`), `ReleaseStatusBadge`, `universeAccentStyle`, `Ornament` (✦).
- [ ] `app/components/Aside.tsx` exporte `useAside` ; `app/components/DedicaceField.tsx` exporte `DedicaceField` + `DedicaceState`.
- [ ] `@shopify/hydrogen-react` exporte `ShopPayButton` (vérifié).
- [ ] `context.env.PUBLIC_STORE_DOMAIN` disponible dans le loader.

---

## File Structure

```
storefront/app/
├── styles/
│   ├── ✨ fiche.css                    (cover float, hero cascade, brume, toast, reduced-motion)
│   └── __tests__/✨ ficheCss.test.ts
├── components/
│   ├── ✨ ValuesBadges.tsx             (3 badges valeurs, picto au-dessus du label)
│   ├── ✨ TechSpecs.tsx                (fiche technique : lignes label/valeur)
│   ├── ✨ RelatedRail.tsx              (rail de couvertures liées)
│   ├── ✨ ProductGallery.tsx           (couverture flottante + vignettes cliquables)
│   ├── ✏️ DedicaceField.tsx            (carte dépliable « Dédicacer · offert »)
│   ├── ✏️ TomeAddToCart.tsx            (quantité + ajout + toast + Shop Pay + extrait)
│   ├── ✏️ TomePageTemplate.tsx         (hero galerie+halo, valeurs, récit, « Dans l'univers », technique, related)
│   ├── ✏️ OneShotPageTemplate.tsx      (hero immersif accent, valeurs, récit, « L'atmosphère », technique, related)
│   └── __tests__/
│       ├── ✨ ValuesBadges.test.tsx
│       ├── ✨ TechSpecs.test.tsx
│       ├── ✨ RelatedRail.test.tsx
│       ├── ✨ ProductGallery.test.tsx
│       ├── ✨ TomeAddToCart.test.tsx
│       ├── ✏️ DedicaceField.test.tsx   (rester vert)
│       ├── ✏️ TomePageTemplate.test.tsx (rester vert)
│       └── ✏️ OneShotPageTemplate.test.tsx (rester vert)
└── routes/
    ├── ✏️ products.$handle.tsx          (query images/technique/couleur/liés + storeDomain + slots + accent)
    └── __tests__/✨ product-fiche.test.ts
```

---

## Tasks

### Task 1: `fiche.css` — animations de fiche

**Files:**
- Create: `storefront/app/styles/fiche.css`
- Test: `storefront/app/styles/__tests__/ficheCss.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/styles/__tests__/ficheCss.test.ts
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
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- ficheCss
```

- [ ] **Step 3: Create `fiche.css`**

```css
/* app/styles/fiche.css — fiche produit (tome + one-shot) */

.fiche-hero {
  position: relative;
  text-align: center;
  padding: 26px 22px 30px;
  overflow: hidden;
}
.fiche-hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(58% 44% at 50% 16%, var(--bsk-uni-soft), transparent 60%);
}
.fiche-fog {
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0.4;
  mix-blend-mode: screen;
  background: radial-gradient(45% 30% at 50% 30%, var(--bsk-uni-soft), transparent 65%);
  animation: fiche-drift 16s ease-in-out infinite alternate;
}
.fiche-cover-wrap {
  position: relative;
  z-index: 2;
  display: inline-block;
}
.fiche-cover {
  height: 330px;
  width: auto;
  border-radius: 6px;
  filter: var(--bsk-cover-shadow);
  animation: fiche-float 7s ease-in-out infinite alternate;
}
.fiche-thumbs {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 18px;
  position: relative;
  z-index: 2;
}
.fiche-thumb {
  width: 42px;
  height: 62px;
  object-fit: cover;
  border-radius: 3px;
  border: 1px solid var(--bsk-border-subtle);
  opacity: 0.6;
  transition: 0.3s;
  cursor: pointer;
  background: none;
  padding: 0;
}
.fiche-thumb.is-active,
.fiche-thumb:hover {
  opacity: 1;
  border-color: var(--bsk-accent-gold);
}
.fiche-rise > * {
  opacity: 0;
  transform: translateY(16px);
  animation: fiche-rise 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
}
.fiche-rise > *:nth-child(2) { animation-delay: 0.12s; }
.fiche-rise > *:nth-child(3) { animation-delay: 0.24s; }

.fiche-toast {
  position: fixed;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%) translateY(20px);
  z-index: 80;
  background: var(--bsk-accent-gold);
  color: #231603;
  font-weight: 700;
  font-size: 13px;
  padding: 11px 20px;
  border-radius: 999px;
  opacity: 0;
  transition: 0.35s;
  pointer-events: none;
}
.fiche-toast.is-show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

@keyframes fiche-float {
  from { transform: translateY(0) rotate(1.5deg); }
  to { transform: translateY(-10px) rotate(0deg); }
}
@keyframes fiche-rise { to { opacity: 1; transform: none; } }
@keyframes fiche-drift { to { transform: translate(3%, -3%) scale(1.1); } }

@media (prefers-reduced-motion: reduce) {
  .fiche-cover,
  .fiche-fog { animation: none; }
  .fiche-rise > * { opacity: 1; transform: none; animation: none; }
  .fiche-toast { transition: none; }
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- ficheCss
```

- [ ] **Step 5: Commit**

```bash
git add app/styles/fiche.css app/styles/__tests__/ficheCss.test.ts
git commit -m "feat(fiche): fiche.css (cover float + cascade + toast + reduced-motion)"
```

---

### Task 2: `ValuesBadges` (3 badges valeurs)

Picto SVG au-dessus du label, centré (spec §2.5). Trois valeurs fixes : expédition, paiement, dédicace.

**Files:**
- Create: `storefront/app/components/ValuesBadges.tsx`
- Test: `storefront/app/components/__tests__/ValuesBadges.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/ValuesBadges.test.tsx
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ValuesBadges} from '../ValuesBadges';

describe('ValuesBadges', () => {
  it('rend les 3 valeurs de la maison', () => {
    render(<ValuesBadges />);
    expect(screen.getByText(/Expédié sous 48/)).toBeInTheDocument();
    expect(screen.getByText(/Paiement sécurisé/)).toBeInTheDocument();
    expect(screen.getByText(/Dédicace offerte/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- ValuesBadges
```

- [ ] **Step 3: Implement**

```tsx
// storefront/app/components/ValuesBadges.tsx
import type {ReactNode} from 'react';

function Badge({icon, label}: {icon: ReactNode; label: string}) {
  return (
    <div style={{textAlign: 'center', fontSize: '10.5px', color: 'var(--bsk-fg-secondary)', lineHeight: 1.35}}>
      <span
        style={{
          display: 'block',
          width: 24,
          height: 24,
          margin: '0 auto 8px',
          color: 'var(--bsk-accent-gold)',
        }}
      >
        {icon}
      </span>
      {label}
    </div>
  );
}

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  width: 24,
  height: 24,
};

export function ValuesBadges() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--bsk-space-2)',
        padding: 'var(--bsk-space-5) 0',
        borderTop: '1px solid var(--bsk-border-subtle)',
        borderBottom: '1px solid var(--bsk-border-subtle)',
      }}
    >
      <Badge
        label="Expédié sous 48 h"
        icon={
          <svg {...svgProps}>
            <rect x="1.5" y="6.5" width="12" height="9" rx="1.2" />
            <path d="M13.5 9.5h4l3 3v3h-7z" />
            <circle cx="6" cy="17.5" r="1.8" />
            <circle cx="17" cy="17.5" r="1.8" />
          </svg>
        }
      />
      <Badge
        label="Paiement sécurisé"
        icon={
          <svg {...svgProps}>
            <rect x="5" y="10.5" width="14" height="9" rx="2" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
          </svg>
        }
      />
      <Badge
        label="Dédicace offerte"
        icon={
          <svg {...svgProps}>
            <path d="M5 9h14v11H5z" />
            <path d="M3.5 9h17v3h-17z" />
            <path d="M12 9V6.5M12 6.5C12 5 10.8 4 9.4 4S7 5 7 6.5h5zM12 6.5C12 5 13.2 4 14.6 4S17 5 17 6.5h-5zM12 9v11" />
          </svg>
        }
      />
    </div>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- ValuesBadges
```

- [ ] **Step 5: Commit**

```bash
git add app/components/ValuesBadges.tsx app/components/__tests__/ValuesBadges.test.tsx
git commit -m "feat(fiche): ValuesBadges (3 valeurs maison, picto au-dessus)"
```

---

### Task 3: `TechSpecs` (fiche technique)

Lignes label/valeur. Ne rend rien si aucune ligne.

**Files:**
- Create: `storefront/app/components/TechSpecs.tsx`
- Test: `storefront/app/components/__tests__/TechSpecs.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/TechSpecs.test.tsx
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {TechSpecs} from '../TechSpecs';

describe('TechSpecs', () => {
  it('rend les lignes label/valeur', () => {
    render(<TechSpecs rows={[{label: 'Pages', value: '412'}, {label: 'Langue', value: 'Français'}]} />);
    expect(screen.getByText('Pages')).toBeInTheDocument();
    expect(screen.getByText('412')).toBeInTheDocument();
    expect(screen.getByText('Langue')).toBeInTheDocument();
  });
  it('ne rend rien si aucune ligne', () => {
    const {container} = render(<TechSpecs rows={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- TechSpecs
```

- [ ] **Step 3: Implement**

```tsx
// storefront/app/components/TechSpecs.tsx
export interface TechRow {
  label: string;
  value: string;
}

export function TechSpecs({rows}: {rows: TechRow[]}) {
  if (rows.length === 0) return null;
  return (
    <section style={{padding: 'var(--bsk-space-6) 0', borderTop: '1px solid var(--bsk-border-subtle)'}}>
      <h2
        style={{
          fontFamily: 'var(--bsk-font-display)',
          fontWeight: 'var(--bsk-weight-bold)',
          fontSize: 'var(--bsk-text-md)',
          color: 'var(--bsk-fg-primary)',
          marginBottom: 'var(--bsk-space-4)',
        }}
      >
        Fiche technique
      </h2>
      <dl style={{margin: 0}}>
        {rows.map((r) => (
          <div
            key={r.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: 'var(--bsk-space-2) 0',
              borderBottom: '1px solid rgba(236,228,211,.07)',
              fontSize: 'var(--bsk-text-sm)',
            }}
          >
            <dt style={{color: 'var(--bsk-fg-secondary)'}}>{r.label}</dt>
            <dd style={{margin: 0, color: 'var(--bsk-fg-primary)'}}>{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- TechSpecs
```

- [ ] **Step 5: Commit**

```bash
git add app/components/TechSpecs.tsx app/components/__tests__/TechSpecs.test.tsx
git commit -m "feat(fiche): TechSpecs (fiche technique label/valeur)"
```

---

### Task 4: `RelatedRail` (rail de couvertures liées)

Rail horizontal de couvertures cliquables (titre + prix/statut). Ne rend rien si vide.

**Files:**
- Create: `storefront/app/components/RelatedRail.tsx`
- Test: `storefront/app/components/__tests__/RelatedRail.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/RelatedRail.test.tsx
import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {RelatedRail, type RelatedItem} from '../RelatedRail';

const items: RelatedItem[] = [
  {
    handle: 'tome-2',
    title: 'Le Sel des Mers',
    cover: {url: 'https://x/2.webp', altText: 'Le Sel des Mers', width: 400, height: 600},
    priceLabel: '18,90 €',
  },
];

describe('RelatedRail', () => {
  it('rend le titre de section et un lien par item', () => {
    renderWithRouter(<RelatedRail heading="Dans le même univers" items={items} />);
    expect(screen.getByText('Dans le même univers')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Le Sel des Mers/})).toHaveAttribute(
      'href',
      '/products/tome-2',
    );
  });
  it('ne rend rien si vide', () => {
    const {container} = renderWithRouter(<RelatedRail heading="X" items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- RelatedRail
```

- [ ] **Step 3: Implement**

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
    <section style={{padding: 'var(--bsk-space-6) 0 var(--bsk-space-6) var(--bsk-space-5)', borderTop: '1px solid var(--bsk-border-subtle)'}}>
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
      <div style={{display: 'flex', gap: 'var(--bsk-space-4)', overflowX: 'auto', paddingBottom: 'var(--bsk-space-2)'}}>
        {items.map((it) => (
          <Link
            key={it.handle}
            to={`/products/${it.handle}`}
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

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- RelatedRail
```

- [ ] **Step 5: Commit**

```bash
git add app/components/RelatedRail.tsx app/components/__tests__/RelatedRail.test.tsx
git commit -m "feat(fiche): RelatedRail (rail de couvertures liees)"
```

---

### Task 5: `ProductGallery` (couverture flottante + vignettes)

Couverture principale qui flotte + vignettes cliquables qui changent l'image principale. Une seule image → pas de vignettes.

**Files:**
- Create: `storefront/app/components/ProductGallery.tsx`
- Test: `storefront/app/components/__tests__/ProductGallery.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/ProductGallery.test.tsx
import {describe, it, expect} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {ProductGallery} from '../ProductGallery';

const imgs = [
  {url: 'https://x/a.webp', altText: 'A', width: 400, height: 600},
  {url: 'https://x/b.webp', altText: 'B', width: 400, height: 600},
];

describe('ProductGallery', () => {
  it('affiche la couverture principale (1ère image)', () => {
    render(<ProductGallery images={imgs} alt="Le Sang Versé" />);
    const main = screen.getByAltText('Le Sang Versé') as HTMLImageElement;
    expect(main.src).toContain('a.webp');
  });
  it('cliquer une vignette change la couverture principale', () => {
    render(<ProductGallery images={imgs} alt="Le Sang Versé" />);
    fireEvent.click(screen.getByRole('button', {name: /image 2/i}));
    const main = screen.getByAltText('Le Sang Versé') as HTMLImageElement;
    expect(main.src).toContain('b.webp');
  });
  it('une seule image : pas de vignettes', () => {
    render(<ProductGallery images={[imgs[0]]} alt="X" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
  it('aucune image : ne rend rien', () => {
    const {container} = render(<ProductGallery images={[]} alt="X" />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- ProductGallery
```

- [ ] **Step 3: Implement**

```tsx
// storefront/app/components/ProductGallery.tsx
import {useState} from 'react';
import type {CoverImage} from './Cover';

export function ProductGallery({images, alt}: {images: CoverImage[]; alt: string}) {
  const [active, setActive] = useState(0);
  if (images.length === 0) return null;
  const main = images[Math.min(active, images.length - 1)];
  return (
    <div className="fiche-cover-wrap">
      <img className="fiche-cover" src={main.url} alt={alt} />
      {images.length > 1 ? (
        <div className="fiche-thumbs">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              aria-label={`Image ${i + 1}`}
              className={`fiche-thumb${i === active ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
              style={{backgroundImage: `url(${img.url})`, backgroundSize: 'cover', backgroundPosition: 'center'}}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
```

> Les vignettes sont des `<button>` à fond image (pas d'`<img>`) pour ne pas multiplier les `alt` et garder un seul `getByAltText` (la couverture principale).

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- ProductGallery
```

- [ ] **Step 5: Commit**

```bash
git add app/components/ProductGallery.tsx app/components/__tests__/ProductGallery.test.tsx
git commit -m "feat(fiche): ProductGallery (couverture flottante + vignettes)"
```

---

### Task 6: Restyle `DedicaceField` (carte dépliable)

Carte bordée « Dédicacer ce livre · offert » avec case dorée ; l'input « À qui dédicacer ? » apparaît à l'activation. **API et tests existants conservés** (checkbox natif, input conditionnel, `onChange`).

**Files:**
- Modify: `storefront/app/components/DedicaceField.tsx`
- Test: `storefront/app/components/__tests__/DedicaceField.test.tsx` (rester vert)

- [ ] **Step 1: Réécrire le composant**

```tsx
// storefront/app/components/DedicaceField.tsx
import {useState} from 'react';

export interface DedicaceState {
  activated: boolean;
  name: string;
}

export interface DedicaceFieldProps {
  onChange: (state: DedicaceState) => void;
}

export function DedicaceField({onChange}: DedicaceFieldProps) {
  const [activated, setActivated] = useState(false);
  const [name, setName] = useState('');

  const updateActivated = (next: boolean) => {
    setActivated(next);
    onChange({activated: next, name});
  };
  const updateName = (next: string) => {
    setName(next);
    onChange({activated, name: next});
  };

  return (
    <div
      style={{
        border: '1px solid var(--bsk-border-subtle)',
        borderRadius: '14px',
        padding: '14px 16px',
        margin: 'var(--bsk-space-5) 0',
        background: 'var(--bsk-bg-raised)',
      }}
    >
      <label style={{display: 'flex', alignItems: 'center', gap: '11px', cursor: 'pointer'}}>
        <input
          type="checkbox"
          checked={activated}
          onChange={(e) => updateActivated(e.target.checked)}
          style={{
            width: 20,
            height: 20,
            accentColor: 'var(--bsk-accent-gold)',
            flex: '0 0 auto',
            cursor: 'pointer',
          }}
        />
        <span style={{fontSize: '14.5px', color: 'var(--bsk-fg-primary)'}}>
          <b style={{fontFamily: 'var(--bsk-font-display)'}}>Dédicacer ce livre</b>{' '}
          <span style={{fontSize: '11px', color: 'var(--bsk-accent-gold)', letterSpacing: '0.06em'}}>· offert</span>
        </span>
      </label>
      {activated ? (
        <input
          type="text"
          value={name}
          onChange={(e) => updateName(e.target.value)}
          placeholder="À qui dédicacer ? (ex. : Pour Marie)"
          style={{
            display: 'block',
            width: '100%',
            marginTop: '14px',
            background: 'rgba(0,0,0,.3)',
            border: '1px solid var(--bsk-border-subtle)',
            borderRadius: '9px',
            padding: '11px 13px',
            color: 'var(--bsk-fg-primary)',
            fontFamily: 'var(--bsk-font-sans)',
            fontSize: '14px',
          }}
        />
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Run — expect PASS (3 tests inchangés)**

```bash
cd storefront && npm test -- DedicaceField
```

Expected: PASS (checkbox décoché par défaut, input caché ; toggle affiche l'input ; `onChange` émis).

- [ ] **Step 3: Commit**

```bash
git add app/components/DedicaceField.tsx
git commit -m "feat(fiche): DedicaceField carte depliable (offert)"
```

---

### Task 7: Restyle `TomeAddToCart` (quantité + toast + Shop Pay + extrait)

Prix display, date préco, dédicace, **sélecteur de quantité**, bouton doré « Ajouter au panier » (avec **toast** au succès), **Shop Pay** (si `storeDomain`), « Lire un extrait ». Le toast est rendu dans un enfant du render-prop de `CartForm` (hooks autorisés).

**Files:**
- Modify: `storefront/app/components/TomeAddToCart.tsx`
- Test: `storefront/app/components/__tests__/TomeAddToCart.test.tsx` (create)

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/TomeAddToCart.test.tsx
import {describe, it, expect} from 'vitest';
import {screen, fireEvent} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {TomeAddToCart} from '../TomeAddToCart';

describe('TomeAddToCart', () => {
  it('publié : prix + CTA Ajouter au panier + stepper quantité', () => {
    renderWithRouter(
      <TomeAddToCart variantId="gid://v/1" available status="publié" priceFormatted="18,90 €" />,
    );
    expect(screen.getByText('18,90 €')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Ajouter au panier/})).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /augmenter la quantité/i}));
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('précommande : CTA Précommander', () => {
    renderWithRouter(
      <TomeAddToCart variantId="gid://v/1" available status="précommande" priceFormatted="18,90 €" />,
    );
    expect(screen.getByRole('button', {name: /Précommander/})).toBeInTheDocument();
  });

  it('annoncé : bloc à paraître non marchand (pas de CTA panier)', () => {
    renderWithRouter(
      <TomeAddToCart variantId="" available={false} status="annoncé" priceFormatted="0,00 €" />,
    );
    expect(screen.getByText(/À PARAÎTRE/)).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: /Ajouter au panier/})).toBeNull();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- TomeAddToCart
```

- [ ] **Step 3: Réécrire le composant**

```tsx
// storefront/app/components/TomeAddToCart.tsx
import {useEffect, useRef, useState} from 'react';
import {CartForm, type FetcherWithComponents, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {ShopPayButton} from '@shopify/hydrogen-react';
import {DedicaceField, type DedicaceState} from './DedicaceField';
import type {ReleaseStatus} from './ReleaseStatusBadge';

export interface TomeAddToCartProps {
  variantId: string;
  available: boolean;
  status: ReleaseStatus;
  priceFormatted: string;
  releaseDate?: string | null;
  storeDomain?: string | null;
}

/** Enfant du render-prop CartForm : hooks autorisés ici (toast au succès). */
function AddButton({
  fetcher,
  available,
  label,
}: {
  fetcher: FetcherWithComponents<unknown>;
  available: boolean;
  label: string;
}) {
  const [showToast, setShowToast] = useState(false);
  const prev = useRef(fetcher.state);
  useEffect(() => {
    if (prev.current !== 'idle' && fetcher.state === 'idle' && fetcher.data) {
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 1800);
      return () => clearTimeout(t);
    }
    prev.current = fetcher.state;
  }, [fetcher.state, fetcher.data]);

  return (
    <>
      <button
        type="submit"
        disabled={!available || fetcher.state !== 'idle'}
        style={{
          flex: 1,
          padding: '14px',
          fontFamily: 'var(--bsk-font-sans)',
          fontSize: '15px',
          fontWeight: 700,
          letterSpacing: '0.03em',
          color: '#231603',
          background: available
            ? 'linear-gradient(135deg, var(--bsk-accent-gold), var(--bsk-accent-gold-dim))'
            : 'var(--bsk-fg-muted)',
          border: 'none',
          borderRadius: '999px',
          cursor: available ? 'pointer' : 'not-allowed',
        }}
      >
        {fetcher.state !== 'idle' ? '…' : label}
      </button>
      <div className={`fiche-toast${showToast ? ' is-show' : ''}`} role="status" aria-live="polite">
        Ajouté au panier ✓
      </div>
    </>
  );
}

export function TomeAddToCart({
  variantId,
  available,
  status,
  priceFormatted,
  releaseDate,
  storeDomain,
}: TomeAddToCartProps) {
  const [dedicace, setDedicace] = useState<DedicaceState>({activated: false, name: ''});
  const [quantity, setQuantity] = useState(1);

  if (status === 'annoncé') {
    return (
      <div
        style={{
          padding: 'var(--bsk-space-5)',
          border: '1px solid var(--bsk-border-subtle)',
          background: 'var(--bsk-bg-raised)',
          borderRadius: '14px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--bsk-font-sans)',
            fontSize: 'var(--bsk-text-xs)',
            letterSpacing: 'var(--bsk-tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--bsk-fg-secondary)',
            marginBottom: 'var(--bsk-space-3)',
          }}
        >
          À PARAÎTRE
        </p>
        <p style={{fontStyle: 'italic', color: 'var(--bsk-fg-secondary)'}}>
          Ce titre est annoncé sans date de sortie. Le formulaire de notification sera disponible
          prochainement.
        </p>
      </div>
    );
  }

  const ctaLabel = status === 'précommande' ? 'Précommander' : 'Ajouter au panier';

  const lineAttributes: Array<{key: string; value: string}> = [];
  if (dedicace.activated) {
    lineAttributes.push({key: '_dedicace_activee', value: 'true'});
    if (dedicace.name.trim()) {
      lineAttributes.push({key: 'Dédicace', value: dedicace.name.trim()});
    }
  }
  const lines: OptimisticCartLineInput[] = [
    {merchandiseId: variantId, quantity, attributes: lineAttributes},
  ];

  return (
    <div>
      <p
        style={{
          fontFamily: 'var(--bsk-font-display)',
          fontWeight: 700,
          fontSize: 'var(--bsk-text-xl)',
          color: 'var(--bsk-fg-primary)',
          margin: '6px 0 18px',
        }}
      >
        {priceFormatted}
      </p>
      {status === 'précommande' && releaseDate ? (
        <p style={{fontSize: 'var(--bsk-text-sm)', color: 'var(--bsk-accent-gold)', marginBottom: 'var(--bsk-space-4)'}}>
          Sortie prévue : {new Date(releaseDate).toLocaleDateString('fr-FR')}
        </p>
      ) : null}

      <DedicaceField onChange={setDedicace} />

      <div style={{display: 'flex', gap: '12px', marginBottom: '12px'}}>
        <div style={{display: 'flex', alignItems: 'center', border: '1px solid var(--bsk-border-subtle)', borderRadius: '999px', overflow: 'hidden'}}>
          <button
            type="button"
            aria-label="diminuer la quantité"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            style={{width: 42, height: 50, background: 'transparent', border: 'none', color: 'var(--bsk-fg-primary)', fontSize: 18, cursor: 'pointer'}}
          >
            −
          </button>
          <span style={{width: 34, textAlign: 'center', fontWeight: 600, color: 'var(--bsk-fg-primary)'}}>{quantity}</span>
          <button
            type="button"
            aria-label="augmenter la quantité"
            onClick={() => setQuantity((q) => q + 1)}
            style={{width: 42, height: 50, background: 'transparent', border: 'none', color: 'var(--bsk-fg-primary)', fontSize: 18, cursor: 'pointer'}}
          >
            +
          </button>
        </div>
        <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
          {(fetcher: FetcherWithComponents<unknown>) => (
            <AddButton fetcher={fetcher} available={available} label={ctaLabel} />
          )}
        </CartForm>
      </div>

      {storeDomain && variantId ? (
        <div style={{marginBottom: '12px'}}>
          <ShopPayButton
            variantIdsAndQuantities={[{id: variantId, quantity}]}
            storeDomain={storeDomain}
            width="100%"
          />
        </div>
      ) : null}

      <a
        href="#"
        style={{display: 'block', textAlign: 'center', color: 'var(--bsk-accent-gold)', fontSize: '13px', textDecoration: 'none', padding: '6px'}}
      >
        Lire un extrait (10 pages) →
      </a>
    </div>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- TomeAddToCart
```

> Si `CartForm` exige un contexte Hydrogen absent en jsdom et fait échouer le rendu, envelopper le test avec un `MemoryRouter` est déjà fait via `renderWithRouter` ; en dernier recours, mocker `@shopify/hydrogen` (`CartForm`) pour rendre directement `children({state:'idle', data:null, Form: 'form'})`.

- [ ] **Step 5: Commit**

```bash
git add app/components/TomeAddToCart.tsx app/components/__tests__/TomeAddToCart.test.tsx
git commit -m "feat(fiche): TomeAddToCart quantite + toast + Shop Pay + extrait"
```

---

### Task 8: Restyle `TomePageTemplate`

Compose la fiche tome : breadcrumb, hero (galerie flottante + halo d'univers), bloc d'achat (pastille genre, label saga·tome, titre, teaser, `purchaseSlot`), `ValuesBadges`, « Le récit », carte « Dans l'univers de », `TechSpecs`, `relatedSlot`. **Props additives** (les tests existants restent verts).

**Files:**
- Modify: `storefront/app/components/TomePageTemplate.tsx`
- Test: `storefront/app/components/__tests__/TomePageTemplate.test.tsx` (rester vert)

- [ ] **Step 1: Réécrire le composant**

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
      <Container width="reading">
        <Breadcrumbs items={breadcrumbs} />
      </Container>

      <section className="fiche-hero">
        <div className="fiche-hero-bg" />
        <ProductGallery images={images} alt={cover.altText} />
      </section>

      <Container width="reading">
        <div className="fiche-rise" style={{padding: 'var(--bsk-space-2) 0 var(--bsk-space-6)'}}>
          {pill ? (
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
              {pill}
            </span>
          ) : null}
          {tomeLabel ? (
            <div
              style={{
                fontSize: 'var(--bsk-text-xs)',
                letterSpacing: 'var(--bsk-tracking-widest)',
                textTransform: 'uppercase',
                color: 'var(--bsk-fg-secondary)',
                margin: '16px 0 6px',
              }}
            >
              {tomeLabel}
            </div>
          ) : null}
          <h1
            style={{
              fontFamily: 'var(--bsk-font-display)',
              fontWeight: 800,
              fontSize: 'var(--bsk-text-2xl)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: 'var(--bsk-fg-primary)',
            }}
          >
            {title}
          </h1>
          {teaserShort ? (
            <blockquote
              style={{
                margin: '18px 0',
                padding: '12px 16px',
                borderLeft: '2px solid var(--bsk-accent-gold)',
                fontStyle: 'italic',
                fontSize: 'var(--bsk-text-base)',
                lineHeight: 1.5,
                color: '#ddd2b8',
                background: 'rgba(216,166,87,.05)',
                whiteSpace: 'pre-line',
              }}
            >
              {teaserShort}
            </blockquote>
          ) : null}
          <div>{purchaseSlot}</div>
        </div>

        <ValuesBadges />

        <section style={{padding: 'var(--bsk-space-8) 0'}}>
          <h2
            style={{
              fontFamily: 'var(--bsk-font-display)',
              fontWeight: 'var(--bsk-weight-bold)',
              fontSize: 'var(--bsk-text-lg)',
              color: 'var(--bsk-fg-primary)',
              marginBottom: 'var(--bsk-space-4)',
            }}
          >
            Le récit
          </h2>
          <div
            style={{
              fontSize: 'var(--bsk-text-read)',
              lineHeight: 1.72,
              color: 'var(--bsk-fg-primary)',
              whiteSpace: 'pre-line',
            }}
          >
            {description}
          </div>
        </section>
      </Container>

      <Container width="reading">
        <Link
          to={`/collections/${universe.handle}`}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            minHeight: '170px',
            borderRadius: '16px',
            overflow: 'hidden',
            padding: '18px',
            textDecoration: 'none',
            background: 'radial-gradient(75% 85% at 60% 18%, var(--bsk-uni), #0c1a17)',
          }}
        >
          <span
            aria-hidden="true"
            style={{position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.82), transparent 70%)'}}
          />
          <span style={{position: 'relative', zIndex: 2}}>
            {universeKicker ? (
              <span style={{display: 'block', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--bsk-accent-gold)'}}>
                {universeKicker}
              </span>
            ) : null}
            <span style={{display: 'block', fontFamily: 'var(--bsk-font-display)', fontWeight: 700, fontSize: 'var(--bsk-text-lg)', color: 'var(--bsk-fg-primary)', margin: '4px 0 10px'}}>
              Dans l'univers de {universe.title}
            </span>
            <span style={{display: 'inline-block', fontSize: '12px', color: 'var(--bsk-fg-primary)', border: '1px solid rgba(236,228,211,.3)', borderRadius: '999px', padding: '7px 14px'}}>
              Explorer l'univers →
            </span>
          </span>
        </Link>

        <TechSpecs rows={techRows} />
      </Container>

      {relatedSlot ? <Container width="content">{relatedSlot}</Container> : null}
    </>
  );
}
```

- [ ] **Step 2: Run — expect PASS (6 tests inchangés)**

```bash
cd storefront && npm test -- TomePageTemplate
```

Expected: breadcrumb liens, titre, teaser, couverture (alt via galerie), `purchaseSlot`, synopsis, « Dans l'univers de Au Nom des Dieux », et pas d'`<img>` si cover sans url (galerie vide → `Cover` null).

- [ ] **Step 3: Commit**

```bash
git add app/components/TomePageTemplate.tsx
git commit -m "feat(fiche): TomePageTemplate immersif (galerie, valeurs, recit, univers, technique)"
```

---

### Task 9: Restyle `OneShotPageTemplate`

Hero immersif (couverture flottante + halo accent propre au livre + pastille + titre + teaser), bloc d'achat, `ValuesBadges`, « Le récit », bandeau « L'atmosphère du livre », `TechSpecs`, `relatedSlot`. **Props additives** (tests existants verts). L'accent est posé par la route (wrapper `universeAccentStyle`).

**Files:**
- Modify: `storefront/app/components/OneShotPageTemplate.tsx`
- Test: `storefront/app/components/__tests__/OneShotPageTemplate.test.tsx` (rester vert)

- [ ] **Step 1: Réécrire le composant**

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
  // Pas de fallback sur teaserShort (sinon doublon avec le hero) : l'ambiance
  // vient d'un metafield dédié, sinon le bandeau n'affiche que son titre.
  const atmosphereText = ambiance ?? null;

  return (
    <>
      <section className="fiche-hero" style={{paddingTop: '40px'}}>
        <div className="fiche-hero-bg" />
        <div className="fiche-fog" />
        <ProductGallery images={images} alt={cover.altText} />
        <div className="fiche-rise" style={{position: 'relative', zIndex: 3, marginTop: 'var(--bsk-space-5)'}}>
          <span
            style={{
              display: 'inline-flex',
              fontSize: 'var(--bsk-text-xs)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-accent-gold)',
              border: '1px solid var(--bsk-border-gold)',
              borderRadius: '999px',
              padding: '6px 14px',
            }}
          >
            {pillLabel} INDÉPENDANT
          </span>
          <h1
            style={{
              fontFamily: 'var(--bsk-font-display)',
              fontWeight: 800,
              fontSize: 'clamp(40px, 12vw, 50px)',
              lineHeight: 0.94,
              letterSpacing: '-0.02em',
              margin: '14px 0 12px',
              color: 'var(--bsk-fg-primary)',
            }}
          >
            {title}
          </h1>
          {teaserShort ? (
            <p
              style={{
                fontStyle: 'italic',
                fontSize: 'var(--bsk-text-read)',
                lineHeight: 1.5,
                color: '#d7cdb6',
                maxWidth: '300px',
                margin: '0 auto',
              }}
            >
              {teaserShort}
            </p>
          ) : null}
        </div>
      </section>

      <Container width="reading">
        <div style={{padding: 'var(--bsk-space-6) 0'}}>{purchaseSlot}</div>
        <ValuesBadges />
        <section style={{padding: 'var(--bsk-space-8) 0'}}>
          <h2
            style={{
              fontFamily: 'var(--bsk-font-display)',
              fontWeight: 'var(--bsk-weight-bold)',
              fontSize: 'var(--bsk-text-lg)',
              color: 'var(--bsk-fg-primary)',
              marginBottom: 'var(--bsk-space-4)',
            }}
          >
            Le récit
          </h2>
          <div
            style={{
              fontSize: 'var(--bsk-text-read)',
              lineHeight: 1.72,
              color: 'var(--bsk-fg-primary)',
              whiteSpace: 'pre-line',
            }}
          >
            {description}
          </div>
        </section>
      </Container>

      <section
        style={{
          position: 'relative',
          margin: 'var(--bsk-space-4) 0',
          padding: '54px 26px',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <span
          aria-hidden="true"
          style={{position: 'absolute', inset: 0, background: 'radial-gradient(80% 90% at 50% 30%, var(--bsk-uni), #0c1018)'}}
        />
        <span
          aria-hidden="true"
          style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(19,20,25,.6), rgba(19,20,25,.2), rgba(19,20,25,.85))'}}
        />
        <div style={{position: 'relative', zIndex: 2}}>
          <div style={{fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--bsk-accent-gold)', marginBottom: 'var(--bsk-space-4)'}}>
            L'atmosphère du livre
          </div>
          {atmosphereText ? (
            <p style={{fontFamily: 'var(--bsk-font-display)', fontWeight: 700, fontSize: 'var(--bsk-text-lg)', lineHeight: 1.25, maxWidth: '300px', margin: '0 auto', color: 'var(--bsk-fg-primary)'}}>
              {atmosphereText}
            </p>
          ) : null}
        </div>
      </section>

      <Container width="reading">
        <TechSpecs rows={techRows} />
      </Container>

      {relatedSlot ? <Container width="content">{relatedSlot}</Container> : null}
    </>
  );
}
```

- [ ] **Step 2: Run — expect PASS (3 tests inchangés)**

```bash
cd storefront && npm test -- OneShotPageTemplate
```

Expected : pastille « ROMAN INDÉPENDANT », titre, teaser /chaleur/, couverture alt, `purchaseSlot`, synopsis /Atmosphere du livre/ (dans « Le récit ») et titre « L'atmosphère du livre ».

- [ ] **Step 3: Commit**

```bash
git add app/components/OneShotPageTemplate.tsx
git commit -m "feat(fiche): OneShotPageTemplate immersif (hero accent, recit, atmosphere, technique)"
```

---

### Task 10: Câbler la route `products.$handle.tsx`

Étendre la query (images, métadonnées techniques optionnelles, couleur produit, couleur d'univers, produits liés) ; renvoyer `storeDomain` ; construire les slots (`purchaseSlot` avec `storeDomain`, `relatedSlot`, `techRows`, `galleryImages`) ; porter l'accent (`universeAccentStyle`) — couleur du livre (one-shot) ou couleur de l'univers (tome).

**Files:**
- Modify: `storefront/app/routes/products.$handle.tsx`
- Test: `storefront/app/routes/__tests__/product-fiche.test.ts` (create)

- [ ] **Step 1: Write the failing test (assertions sur la source)**

```ts
// storefront/app/routes/__tests__/product-fiche.test.ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const src = readFileSync(resolve(process.cwd(), 'app/routes/products.$handle.tsx'), 'utf8');

describe('products.$handle (fiche)', () => {
  it('importe fiche.css et porte l\'accent', () => {
    expect(src).toContain("'~/styles/fiche.css'");
    expect(src).toContain('universeAccentStyle');
  });
  it('récupère images + métadonnées techniques + produits liés + storeDomain', () => {
    expect(src).toContain('images(first:');
    expect(src).toContain('key: "isbn"');
    expect(src).toContain('storeDomain');
    expect(src).toContain('RelatedRail');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- product-fiche
```

- [ ] **Step 3: Réécrire `products.$handle.tsx`**

```tsx
// storefront/app/routes/products.$handle.tsx
import {useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {TOME_METAFIELDS_FRAGMENT} from '~/lib/fragments';
import {parseBool, parseStatutParution} from '~/lib/tomeMetafields';
import {universeAccentStyle} from '~/lib/universeAccent';
import {TomePageTemplate} from '~/components/TomePageTemplate';
import {OneShotPageTemplate} from '~/components/OneShotPageTemplate';
import {TomeAddToCart} from '~/components/TomeAddToCart';
import {RelatedRail, type RelatedItem} from '~/components/RelatedRail';
import type {CoverImage} from '~/components/Cover';
import '~/styles/fiche.css';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.product.title ?? ''} — Bilskirnir`},
  {rel: 'canonical', href: `/products/${data?.product.handle ?? ''}`},
];

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    id
    title
    price { amount currencyCode }
    compareAtPrice { amount currencyCode }
    image { id url altText width height }
    selectedOptions { name value }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    description
    featuredImage { url altText width height }
    images(first: 8) { nodes { url altText width height } }
    options { name optionValues { name } }
    encodedVariantExistence
    encodedVariantAvailability
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    ...TomeMetafields
    couleurTheme: metafield(namespace: "custom", key: "couleur_theme") { value }
    genre: metafield(namespace: "custom", key: "genre") { value }
    ambiance: metafield(namespace: "custom", key: "ambiance") { value }
    format: metafield(namespace: "custom", key: "format") { value }
    nombrePages: metafield(namespace: "custom", key: "nombre_pages") { value }
    isbn: metafield(namespace: "custom", key: "isbn") { value }
    relatedUniverse: metafield(namespace: "custom", key: "univers") {
      reference {
        ... on Collection {
          handle
          title
          couleurTheme: metafield(namespace: "custom", key: "couleur_theme") { value }
          genre: metafield(namespace: "custom", key: "genre") { value }
          products(first: 8) {
            nodes {
              id handle title
              featuredImage { url altText width height }
              priceRange { minVariantPrice { amount currencyCode } }
              statutParution: metafield(namespace: "custom", key: "statut_parution") { value }
            }
          }
        }
      }
    }
    seo { description title }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
  ${TOME_METAFIELDS_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
    standalone: products(first: 12) {
      nodes {
        id handle title
        featuredImage { url altText width height }
        priceRange { minVariantPrice { amount currencyCode } }
        estUneOeuvreIndependante: metafield(namespace: "custom", key: "est_une_oeuvre_independante") { value }
        statutParution: metafield(namespace: "custom", key: "statut_parution") { value }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw new Error('Expected product handle');
  const {product, standalone} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions: getSelectedProductOptions(request)},
  });
  if (!product?.id) throw new Response(null, {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: product});
  return {product, standalone, storeDomain: context.env.PUBLIC_STORE_DOMAIN};
}

function fmtCurrency(amount: string, currency: string) {
  return new Intl.NumberFormat('fr-FR', {style: 'currency', currency}).format(parseFloat(amount));
}

function priceLabelFor(
  status: ReturnType<typeof parseStatutParution>,
  amount: string,
  currency: string,
): string | null {
  if (status === 'précommande') return 'Préco';
  if (status === 'annoncé') return 'À paraître';
  const n = parseFloat(amount);
  return n > 0 ? fmtCurrency(amount, currency) : null;
}

function toCover(img: {url: string; altText?: string | null; width?: number | null; height?: number | null} | null | undefined, alt: string): CoverImage | null {
  if (!img?.url) return null;
  return {url: img.url, altText: img.altText ?? alt, width: img.width ?? 0, height: img.height ?? 0};
}

export default function ProductRoute() {
  const {product, standalone, storeDomain} = useLoaderData<typeof loader>();
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  const isStandalone = parseBool(product.estUneOeuvreIndependante?.value);
  const status = parseStatutParution(product.statutParution?.value);
  const currency = selectedVariant?.price.currencyCode ?? 'EUR';
  const priceFormatted = fmtCurrency(selectedVariant?.price.amount ?? '0', currency);

  const cover: CoverImage = toCover(product.featuredImage, product.title) ?? {
    url: '',
    altText: product.title,
    width: 400,
    height: 600,
  };
  const galleryImages = (product.images?.nodes ?? [])
    .map((i) => toCover(i, product.title))
    .filter((c): c is CoverImage => c !== null);

  const description = product.description ?? '';

  const techRows = [
    product.format?.value ? {label: 'Format', value: product.format.value} : null,
    product.nombrePages?.value ? {label: 'Pages', value: product.nombrePages.value} : null,
    product.isbn?.value ? {label: 'ISBN', value: product.isbn.value} : null,
    product.dateParution?.value
      ? {label: 'Parution', value: new Date(product.dateParution.value).toLocaleDateString('fr-FR')}
      : null,
    {label: 'Langue', value: 'Français'},
  ].filter((r): r is {label: string; value: string} => r !== null);

  const purchase = (
    <TomeAddToCart
      variantId={selectedVariant?.id ?? ''}
      available={selectedVariant?.availableForSale ?? false}
      status={status}
      priceFormatted={priceFormatted}
      releaseDate={product.dateParution?.value ?? null}
      storeDomain={storeDomain}
    />
  );

  const analytics = (
    <Analytics.ProductView
      data={{
        products: [
          {
            id: product.id,
            title: product.title,
            price: selectedVariant?.price.amount ?? '0',
            vendor: product.vendor,
            variantId: selectedVariant?.id ?? '',
            variantTitle: selectedVariant?.title ?? '',
            quantity: 1,
          },
        ],
      }}
    />
  );

  if (isStandalone) {
    const productColor = product.couleurTheme?.value ?? null;
    const relatedItems: RelatedItem[] = (standalone?.nodes ?? [])
      .filter((p) => parseBool(p.estUneOeuvreIndependante?.value) && p.handle !== product.handle)
      .slice(0, 8)
      .map((p) => ({
        handle: p.handle,
        title: p.title,
        cover: toCover(p.featuredImage, p.title),
        priceLabel: priceLabelFor(
          parseStatutParution(p.statutParution?.value),
          p.priceRange.minVariantPrice.amount,
          p.priceRange.minVariantPrice.currencyCode,
        ),
      }));

    return (
      <div style={universeAccentStyle(productColor)}>
        <OneShotPageTemplate
          title={product.title}
          teaserShort={product.teaserCourt?.value ?? null}
          description={description}
          cover={cover}
          pillLabel="ROMAN"
          ambiance={product.ambiance?.value ?? null}
          techRows={techRows}
          purchaseSlot={purchase}
          relatedSlot={<RelatedRail heading="Autres romans indépendants" items={relatedItems} />}
        />
        {analytics}
      </div>
    );
  }

  const universeRef = product.relatedUniverse?.reference;
  const universeData =
    universeRef && 'handle' in universeRef
      ? {handle: universeRef.handle, title: universeRef.title}
      : {handle: '', title: '—'};
  const universeColor =
    universeRef && 'couleurTheme' in universeRef ? universeRef.couleurTheme?.value ?? null : null;
  const universeProducts =
    universeRef && 'products' in universeRef ? universeRef.products.nodes : [];
  const tomeCount = universeProducts.length;
  const universeKicker =
    universeRef && 'genre' in universeRef && universeRef.genre?.value
      ? `${universeRef.genre.value} · ${tomeCount} tome${tomeCount > 1 ? 's' : ''}`
      : tomeCount > 0
        ? `${tomeCount} tome${tomeCount > 1 ? 's' : ''}`
        : null;

  const relatedItems: RelatedItem[] = universeProducts
    .filter((p) => p.handle !== product.handle)
    .slice(0, 8)
    .map((p) => ({
      handle: p.handle,
      title: p.title,
      cover: toCover(p.featuredImage, p.title),
      priceLabel: priceLabelFor(
        parseStatutParution(p.statutParution?.value),
        p.priceRange.minVariantPrice.amount,
        p.priceRange.minVariantPrice.currencyCode,
      ),
    }));

  const breadcrumbs = [
    {label: 'Accueil', href: '/'},
    ...(universeData.handle
      ? [{label: universeData.title, href: `/collections/${universeData.handle}`}]
      : []),
    {label: product.title},
  ];

  return (
    <div style={universeAccentStyle(universeColor)}>
      <TomePageTemplate
        breadcrumbs={breadcrumbs}
        title={product.title}
        pill={product.genre?.value ?? null}
        tomeLabel={
          product.numeroTome?.value ? `${universeData.title} · Tome ${product.numeroTome.value}` : null
        }
        teaserShort={product.teaserCourt?.value ?? null}
        description={description}
        cover={cover}
        galleryImages={galleryImages}
        universe={universeData}
        universeKicker={universeKicker}
        techRows={techRows}
        purchaseSlot={purchase}
        relatedSlot={<RelatedRail heading="Dans le même univers" items={relatedItems} />}
      />
      {analytics}
    </div>
  );
}
```

- [ ] **Step 4: Régénérer les types + run**

```bash
cd storefront && npm run codegen && npm test -- product-fiche
```

Expected : codegen OK (query valide), test PASS.

- [ ] **Step 5: Build (typecheck complet)**

```bash
cd storefront && npm run build
```

Expected : build OK.

- [ ] **Step 6: Commit**

```bash
git add app/routes/products.$handle.tsx app/routes/__tests__/product-fiche.test.ts storefrontapi.generated.d.ts
git commit -m "feat(fiche): fiche produit immersive (galerie, technique, related, accent, Shop Pay)"
```

---

### Task 11: Sanity check + revue visuelle

- [ ] **Step 1: Toute la suite verte**

```bash
cd storefront && npm test
```

Expected : tous verts (suite existante + nouveaux tests de ce plan).

- [ ] **Step 2: Build**

```bash
cd storefront && npm run build
```

- [ ] **Step 3: Revue visuelle (`npm run dev`)**

Ouvrir une fiche tome (`/products/<tome>`) et une fiche one-shot, comparer aux maquettes 04/05 :
- [ ] Tome : breadcrumb, hero couverture qui flotte + halo de l'**univers**, mini-galerie (si plusieurs images), pastille genre, label saga·tome, titre, teaser bordé doré, prix, dédicace dépliable, quantité, **Ajouter au panier** (toast au succès + pastille panier qui s'incrémente), Shop Pay (si activé), « Lire un extrait », 3 badges valeurs, « Le récit », carte « Dans l'univers de » (teintée), fiche technique, rail « Dans le même univers ». Footer global.
- [ ] One-shot : hero immersif teinté de la couleur du livre, pastille « ROMAN INDÉPENDANT », titre, teaser, achat, valeurs, « Le récit », bandeau « L'atmosphère du livre », fiche technique, rail « Autres romans indépendants ».
- [ ] Couvertures en drop-shadow (jamais de cadre), `prefers-reduced-motion` neutralise flottement/cascade/brume, aucun warning console (`getProductOptions`, `src=""`).

- [ ] **Step 4: Commit (si ajustements)**

```bash
cd storefront && npm test && git add -A && git commit -m "chore(fiche): sanity pass fiches produit"
```

---

## Self-review (couverture spec §3.3 + §3.4)

| Élément spec | Tâche |
|---|---|
| §3.3 Hero (couverture qui flotte, halo univers, fil d'Ariane, mini-galerie) | Task 1, 5, 8 |
| §3.3 Bloc achat (pill, n° tome, titre, teaser bordé, prix, dédicace dépliable, qté + ajouter + toast, Shop Pay, extrait) | Task 6, 7, 8 |
| §2.5 Dédicace dépliable « offert » | Task 6 |
| §2.5 CTA doré + Shop Pay | Task 7 |
| §3.3 3 badges valeurs (picto au-dessus) | Task 2, 8/9 |
| §3.3 « Le récit » (corps 17px) | Task 8, 9 |
| §3.3 « Dans l'univers de » (carte teintée → page univers) | Task 8, 10 |
| §3.3 Fiche technique | Task 3, 10 |
| §3.3 « Dans le même univers » (rail) | Task 4, 10 |
| §3.3 CTA selon statut (publié/préco/annoncé) | Task 7 |
| §3.4 Hero one-shot immersif (couleur propre au livre) | Task 1, 9, 10 |
| §3.4 « L'atmosphère du livre » remplace « Dans l'univers de » | Task 9 |
| §3.4 Related « Autres romans indépendants » | Task 4, 10 |
| §2.4 Couvertures drop-shadow, jamais de cadre | Task 5 (Cover) |
| §2.6 Mouvement (flottement, cascade, brume) + reduced-motion | Task 1 |

**Différé (plans suivants / données admin) :**
- Promotion *smart nav* sur pages internes — plan dédié.
- Extrait PDF réel (« Lire un extrait » = lien placeholder pour l'instant).
- Métadonnées admin : `format`, `nombre_pages`, `isbn`, `couleur_theme` produit, `genre` ; images multiples pour la galerie ; prix > 0. Rendus si présents, sinon dégradés proprement.
- Panier à paliers de récompenses (§3.6), gabarit légal (§3.7), La maison (§3.5) : Plan 5.
- Version desktop dédiée (transposition responsive depuis le mobile).
```
