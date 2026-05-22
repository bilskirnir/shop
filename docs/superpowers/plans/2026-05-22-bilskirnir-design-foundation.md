# Bilskirnir — Design Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Poser le socle de la refonte visuelle immersive (système de couleurs gris+doré, typographies Cabinet Grotesk/Switzer, emblème, primitives partagées) et corriger les 3 bugs connus, sans encore refondre les pages.

**Architecture:** On met à jour les tokens CSS existants (`tokens.css`) vers le système validé, on auto-héberge les deux polices, on ajoute l'emblème en asset + composant `Logo`, et on crée des primitives réutilisables (`Cover`, `SmartNav` via hook `useHideOnScroll`, helper `universeAccentStyle`) tout en restylant `ReleaseStatusBadge`. Les bugs (query `options`, `src=""`, photo fondateur) sont corrigés au passage. Les pages elles-mêmes sont refondues dans les plans suivants.

**Tech Stack:** Hydrogen (React Router v7), TypeScript, Vitest + Testing Library, Vanilla CSS custom properties. Polices : Cabinet Grotesk + Switzer (Fontshare, licence libre commerciale) auto-hébergées.

**Spec:** `docs/superpowers/specs/2026-05-22-bilskirnir-visual-redesign.md`
**Maquettes:** `docs/superpowers/mockups/2026-05-22-visual-redesign/`

---

## Prerequisites

- [ ] `cd storefront && npm test` est vert au départ (69 tests).
- [ ] `npm run dev` démarre (token Storefront API valide).
- [ ] Helper de test `~/test/render` (`renderWithRouter`) disponible (utilisé par les tests Plan 2).

---

## File Structure

```
storefront/app/
├── assets/
│   ├── ✨ bilskirnir-emblem.svg        (emblème maison, monochrome → blanc via currentColor)
│   └── fonts/
│       ├── ✨ cabinet-grotesk-{500,700,800}.woff2
│       └── ✨ switzer-{400,500,600}.woff2
├── styles/
│   ├── ✏️ tokens.css                   (palette grise + doré, fonts, accent univers, --bsk-cover-*)
│   └── ✏️ fonts.css                    (✨ @font-face auto-hébergés)
├── lib/
│   └── ✨ universeAccent.ts            (couleur_theme → style CSS var --bsk-uni)
├── hooks/
│   └── ✨ useHideOnScroll.ts           (logique nav : top/solid/hidden)
├── components/
│   ├── ✨ Logo.tsx                     (emblème blanc)
│   ├── ✨ Cover.tsx                    (couverture mock-up : drop-shadow, jamais de cadre)
│   ├── ✨ SmartNav.tsx                 (barre qui se masque/réapparaît)
│   ├── ✏️ ReleaseStatusBadge.tsx       (variante « surImage » + couleurs système)
│   └── __tests__/
│       ├── ✨ Cover.test.tsx
│       ├── ✨ SmartNav.test.tsx
│       ├── ✨ useHideOnScroll.test.tsx
│       ├── ✨ universeAccent.test.ts
│       └── ✏️ ReleaseStatusBadge.test.tsx
└── routes/
    └── ✏️ products.$handle.tsx          (fix query options)
```

---

## Tasks

### Task 1: Fix bug — `product.options is missing` (query produit)

`getAdjacentAndFirstAvailableVariants`/`getProductOptions` de Hydrogen exigent `options { name optionValues { name } }` + les champs encodés. Le `PRODUCT_FRAGMENT` ne les récupère pas.

**Files:**
- Modify: `storefront/app/routes/products.$handle.tsx` (PRODUCT_FRAGMENT, ~l.33-52)
- Test: `storefront/app/routes/__tests__/products-fragment.test.ts` (create)

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/routes/__tests__/products-fragment.test.ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const src = readFileSync(
  fileURLToPath(new URL('../products.$handle.tsx', import.meta.url)),
  'utf8',
);

describe('PRODUCT_FRAGMENT', () => {
  it('récupère options + valeurs (requis par getProductOptions)', () => {
    expect(src).toMatch(/options\s*\{[^}]*name[^}]*optionValues\s*\{[^}]*name/s);
  });
  it('récupère les champs encodés de variantes', () => {
    expect(src).toContain('encodedVariantExistence');
    expect(src).toContain('encodedVariantAvailability');
  });
});
```

- [ ] **Step 2: Run — expect 2 failures**

```bash
cd storefront && npm test -- products-fragment
```

Expected: FAIL (les champs n'existent pas encore).

- [ ] **Step 3: Add the fields to PRODUCT_FRAGMENT**

Dans `products.$handle.tsx`, dans `fragment Product on Product { ... }`, ajouter après `handle`/`description` :

```graphql
    options {
      name
      optionValues { name }
    }
    encodedVariantExistence
    encodedVariantAvailability
```

- [ ] **Step 4: Run — expect 2 passed + codegen OK**

```bash
cd storefront && npm test -- products-fragment && npm run codegen
```

Expected: PASS, et codegen sans erreur GraphQL.

- [ ] **Step 5: Commit**

```bash
git add app/routes/products.$handle.tsx app/routes/__tests__/products-fragment.test.ts
git commit -m "fix(product): query options + encoded variant fields (getProductOptions)"
```

---

### Task 2: Fix bug — image avec `src=""`

Un `<img src="">` est rendu sur la fiche produit quand une image est absente (warning navigateur + rechargement). Localiser et passer `undefined` plutôt qu'une chaîne vide.

**Files:**
- Modify: le composant fautif (chercher), typiquement `storefront/app/components/ProductImage.tsx` ou un template
- Test: à côté du composant modifié

- [ ] **Step 1: Localiser la source**

```bash
cd storefront && grep -rn 'src={[^}]*\.url' app/components app/routes | grep -v 'altText'
grep -rn "src=\"\"\|src={''}\|image?.url ??\|url ?? ''" app
```

Identifier le composant qui peut rendre `src=""` (image potentiellement `null`).

- [ ] **Step 2: Write the failing test** (adapter le chemin au composant trouvé, ex. `ProductImage`)

```tsx
// storefront/app/components/__tests__/ProductImage.test.tsx
import {describe, it, expect} from 'vitest';
import {render} from '@testing-library/react';
import {ProductImage} from '../ProductImage';

describe('ProductImage', () => {
  it('ne rend pas d\'<img> avec src vide quand image absente', () => {
    const {container} = render(<ProductImage image={undefined} />);
    const img = container.querySelector('img');
    // soit pas d'img, soit pas de src=""
    expect(img?.getAttribute('src')).not.toBe('');
  });
});
```

- [ ] **Step 3: Run — expect FAIL**

```bash
cd storefront && npm test -- ProductImage
```

- [ ] **Step 4: Fix — guard sur l'absence d'image**

Dans le composant : si `image` (ou `image.url`) est absent, retourner `null` (ne rien rendre) au lieu d'un `<img src="">`. Exemple :

```tsx
if (!image?.url) return null;
```

- [ ] **Step 5: Run — expect PASS**

```bash
cd storefront && npm test -- ProductImage
```

- [ ] **Step 6: Commit**

```bash
git add app/components/ProductImage.tsx app/components/__tests__/ProductImage.test.tsx
git commit -m "fix(ui): never render <img> with empty src"
```

---

### Task 3: Auto-héberger les polices Cabinet Grotesk + Switzer

Récupérer les `.woff2` depuis Fontshare (licence libre commerciale) et les servir localement (pas de dépendance CDN en prod).

**Files:**
- Create: `storefront/app/assets/fonts/*.woff2` (téléchargés)
- Create: `storefront/app/styles/fonts.css`
- Modify: `storefront/app/root.tsx` (importer `fonts.css`)

- [ ] **Step 1: Télécharger les fichiers**

Depuis https://www.fontshare.com/fonts/cabinet-grotesk et https://www.fontshare.com/fonts/switzer, télécharger les poids : Cabinet Grotesk 500/700/800, Switzer 400/500/600. Placer les `.woff2` dans `storefront/app/assets/fonts/` avec les noms : `cabinet-grotesk-500.woff2`, `-700.woff2`, `-800.woff2`, `switzer-400.woff2`, `-500.woff2`, `-600.woff2`.

- [ ] **Step 2: Créer `fonts.css`**

```css
/* app/styles/fonts.css — polices auto-hébergées */
@font-face{font-family:"Cabinet Grotesk";src:url("../assets/fonts/cabinet-grotesk-500.woff2") format("woff2");font-weight:500;font-style:normal;font-display:swap}
@font-face{font-family:"Cabinet Grotesk";src:url("../assets/fonts/cabinet-grotesk-700.woff2") format("woff2");font-weight:700;font-style:normal;font-display:swap}
@font-face{font-family:"Cabinet Grotesk";src:url("../assets/fonts/cabinet-grotesk-800.woff2") format("woff2");font-weight:800;font-style:normal;font-display:swap}
@font-face{font-family:"Switzer";src:url("../assets/fonts/switzer-400.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"Switzer";src:url("../assets/fonts/switzer-500.woff2") format("woff2");font-weight:500;font-style:normal;font-display:swap}
@font-face{font-family:"Switzer";src:url("../assets/fonts/switzer-600.woff2") format("woff2");font-weight:600;font-style:normal;font-display:swap}
```

- [ ] **Step 3: Importer dans `root.tsx`**

Remplacer les imports `@fontsource/cormorant-garamond` et `@fontsource/inter` (l.18-20) par :

```ts
import './styles/fonts.css';
```

- [ ] **Step 4: Verify build**

```bash
cd storefront && npm run build
```

Expected: build OK, woff2 émis dans `dist/client/assets`.

- [ ] **Step 5: Commit**

```bash
git add app/assets/fonts app/styles/fonts.css app/root.tsx
git commit -m "feat(type): self-host Cabinet Grotesk + Switzer"
```

---

### Task 4: Mettre à jour `tokens.css` vers le système validé

Palette **gris anthracite + doré**, fonts Cabinet Grotesk/Switzer, et convention d'**accent d'univers** (`--bsk-uni`, défaut neutre).

**Files:**
- Modify: `storefront/app/styles/tokens.css`
- Test: `storefront/app/styles/__tests__/tokens.test.ts` (create)

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/styles/__tests__/tokens.test.ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const css = readFileSync(fileURLToPath(new URL('../tokens.css', import.meta.url)), 'utf8');

describe('tokens.css — système refonte', () => {
  it('base anthracite grise', () => { expect(css).toContain('--bsk-bg-base: #131419'); });
  it('police display Cabinet Grotesk', () => { expect(css).toMatch(/--bsk-font-display:\s*"Cabinet Grotesk"/); });
  it('police sans Switzer', () => { expect(css).toMatch(/--bsk-font-sans:\s*"Switzer"/); });
  it('variable accent univers avec défaut neutre', () => { expect(css).toMatch(/--bsk-uni:\s*var\(--bsk-accent-gold\)/); });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- tokens
```

- [ ] **Step 3: Mettre à jour les tokens**

Dans `tokens.css`, remplacer les blocs concernés :

```css
  /* ── Color: background & surfaces ── */
  --bsk-bg-base: #131419;       /* anthracite — body */
  --bsk-bg-raised: #191a20;     /* cartes/panneaux */
  --bsk-bg-overlay: #1d1e26;    /* hovers, drawer */
  --bsk-bg-footer: #0e0f13;

  /* ── Foreground ── */
  --bsk-fg-primary: #ece4d3;    /* crème chaud */
  --bsk-fg-secondary: #969089;  /* gris chaud */
  --bsk-fg-muted: #6f6a62;

  /* ── Accents (doré = constante maison) ── */
  --bsk-accent-gold: #d8a657;
  --bsk-accent-gold-bright: #e6b95e;
  --bsk-accent-gold-dim: #c4912f;

  /* ── Accent d'univers (ponctuel) — surchargé par page via inline style ── */
  --bsk-uni: var(--bsk-accent-gold);     /* défaut neutre */
  --bsk-uni-soft: rgba(216,166,87,.16);

  /* ── Borders & shadows ── */
  --bsk-border-subtle: rgba(236,228,211,.13);
  --bsk-cover-shadow: drop-shadow(0 26px 44px rgba(0,0,0,.7)) drop-shadow(0 6px 16px rgba(0,0,0,.4));

  /* ── Typographies ── */
  --bsk-font-display: "Cabinet Grotesk", system-ui, sans-serif;
  --bsk-font-sans: "Switzer", system-ui, -apple-system, sans-serif;
```

Conserver les blocs spacing/scale/widths/motion existants. Augmenter `--bsk-text-base` lecture éditoriale : ajouter `--bsk-text-read: 1.0625rem; /* 17px */`.

> NB : `--bsk-font-serif` peut rester défini (compat) mais n'est plus utilisé par la refonte.

- [ ] **Step 4: Run — expect PASS + build**

```bash
cd storefront && npm test -- tokens && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add app/styles/tokens.css app/styles/__tests__/tokens.test.ts
git commit -m "feat(design): tokens gris anthracite + doré + accent univers + Cabinet Grotesk/Switzer"
```

---

### Task 5: Helper `universeAccent` (couleur maîtresse → CSS var)

Convertit la valeur metafield `couleur_theme` d'un univers en style inline `{ '--bsk-uni': color, '--bsk-uni-soft': rgba(color,.16) }` à poser sur le conteneur de page. Défaut neutre (doré) si absent/invalide.

**Files:**
- Create: `storefront/app/lib/universeAccent.ts`
- Test: `storefront/app/lib/__tests__/universeAccent.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/lib/__tests__/universeAccent.test.ts
import {describe, it, expect} from 'vitest';
import {universeAccentStyle} from '../universeAccent';

describe('universeAccentStyle', () => {
  it('retourne les vars pour un hex valide', () => {
    const s = universeAccentStyle('#2f8a78') as Record<string,string>;
    expect(s['--bsk-uni']).toBe('#2f8a78');
    expect(s['--bsk-uni-soft']).toBe('rgba(47,138,120,0.16)');
  });
  it('retourne un objet vide (défaut neutre) si absent', () => {
    expect(universeAccentStyle(null)).toEqual({});
    expect(universeAccentStyle('pas-une-couleur')).toEqual({});
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- universeAccent
```

- [ ] **Step 3: Implement**

```ts
// storefront/app/lib/universeAccent.ts
import type {CSSProperties} from 'react';

const HEX = /^#([0-9a-f]{6})$/i;

export function universeAccentStyle(
  color: string | null | undefined,
): CSSProperties {
  if (!color || !HEX.test(color)) return {};
  const m = color.match(HEX)![1];
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return {
    ['--bsk-uni' as any]: color,
    ['--bsk-uni-soft' as any]: `rgba(${r},${g},${b},0.16)`,
  };
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- universeAccent
```

- [ ] **Step 5: Commit**

```bash
git add app/lib/universeAccent.ts app/lib/__tests__/universeAccent.test.ts
git commit -m "feat(design): universeAccentStyle helper (couleur_theme -> CSS vars)"
```

---

### Task 6: Composant `Cover` (mock-up détouré, drop-shadow, jamais de cadre)

Règle système : les couvertures sont des mock-ups transparents → toujours `filter: drop-shadow`, jamais un cadre/fond. Variante `bleed` (débord) pour les grilles.

**Files:**
- Create: `storefront/app/components/Cover.tsx`
- Test: `storefront/app/components/__tests__/Cover.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/Cover.test.tsx
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Cover} from '../Cover';

const img = {url: 'https://x/c.webp', altText: 'Tome 1', width: 800, height: 1170};

describe('Cover', () => {
  it('rend une image avec drop-shadow et sans background', () => {
    render(<Cover image={img} />);
    const el = screen.getByAltText('Tome 1') as HTMLImageElement;
    expect(el.style.filter).toContain('drop-shadow');
    expect(el.style.background).toBe('');
  });
  it('ne rend rien si image absente', () => {
    const {container} = render(<Cover image={null} />);
    expect(container.firstChild).toBeNull();
  });
  it('applique le débord en variante bleed', () => {
    render(<Cover image={img} bleed />);
    const el = screen.getByAltText('Tome 1') as HTMLImageElement;
    expect(el.style.width).toBe('114%');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- Cover
```

- [ ] **Step 3: Implement**

```tsx
// storefront/app/components/Cover.tsx
export interface CoverImage {
  url: string;
  altText?: string | null;
  width?: number;
  height?: number;
}

export function Cover({
  image,
  bleed = false,
  className,
}: {
  image: CoverImage | null | undefined;
  bleed?: boolean;
  className?: string;
}) {
  if (!image?.url) return null;
  return (
    <img
      className={className}
      src={image.url}
      alt={image.altText ?? ''}
      width={image.width}
      height={image.height}
      loading="lazy"
      style={{
        display: 'block',
        height: 'auto',
        ...(bleed ? {width: '114%', margin: '0 -7%'} : {width: '100%'}),
        filter: 'var(--bsk-cover-shadow)',
      }}
    />
  );
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- Cover
```

- [ ] **Step 5: Commit**

```bash
git add app/components/Cover.tsx app/components/__tests__/Cover.test.tsx
git commit -m "feat(ui): Cover component (transparent mockup, drop-shadow, no frame)"
```

---

### Task 7: Hook `useHideOnScroll` + composant `SmartNav`

Barre : transparente en haut ; masquée au scroll bas (> seuil) ; réapparaît avec fond solide au scroll haut.

**Files:**
- Create: `storefront/app/hooks/useHideOnScroll.ts`
- Create: `storefront/app/components/SmartNav.tsx`
- Test: `storefront/app/components/__tests__/useHideOnScroll.test.tsx`, `SmartNav.test.tsx`

- [ ] **Step 1: Write the failing test (hook)**

```tsx
// storefront/app/components/__tests__/useHideOnScroll.test.tsx
import {describe, it, expect} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {computeNavState} from '../../hooks/useHideOnScroll';

describe('computeNavState', () => {
  it('top quand y < seuilTop', () => {
    expect(computeNavState({y: 0, lastY: 0})).toEqual({solid: false, hidden: false});
  });
  it('solide + caché au scroll bas', () => {
    expect(computeNavState({y: 200, lastY: 100})).toEqual({solid: true, hidden: true});
  });
  it('solide + visible au scroll haut', () => {
    expect(computeNavState({y: 150, lastY: 300})).toEqual({solid: true, hidden: false});
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- useHideOnScroll
```

- [ ] **Step 3: Implement le hook (logique pure + binding scroll)**

```ts
// storefront/app/hooks/useHideOnScroll.ts
import {useEffect, useState} from 'react';

export interface NavState {solid: boolean; hidden: boolean}

export function computeNavState({y, lastY}: {y: number; lastY: number}): NavState {
  const TOP = 12, HIDE_AFTER = 90, DELTA = 4;
  if (y < TOP) return {solid: false, hidden: false};
  const scrollingDown = y > lastY + DELTA;
  const scrollingUp = y < lastY - DELTA;
  return {
    solid: true,
    hidden: scrollingDown && y > HIDE_AFTER ? true : scrollingUp ? false : false,
  };
}

export function useHideOnScroll(target?: HTMLElement | Window | null): NavState {
  const [state, setState] = useState<NavState>({solid: false, hidden: false});
  useEffect(() => {
    const el = target ?? window;
    let lastY = 0, hidden = false;
    const getY = () => (el === window ? window.scrollY : (el as HTMLElement).scrollTop);
    const onScroll = () => {
      const y = getY();
      const next = computeNavState({y, lastY});
      // garder l'état "hidden" tant qu'on ne scrolle pas dans l'autre sens
      if (y >= 12 && !(y > lastY + 4) && !(y < lastY - 4)) next.hidden = hidden;
      hidden = next.hidden;
      lastY = y;
      setState(next);
    };
    el.addEventListener('scroll', onScroll, {passive: true});
    return () => el.removeEventListener('scroll', onScroll);
  }, [target]);
  return state;
}
```

- [ ] **Step 4: Run — expect PASS (hook)**

```bash
cd storefront && npm test -- useHideOnScroll
```

- [ ] **Step 5: Write the failing test (SmartNav)**

```tsx
// storefront/app/components/__tests__/SmartNav.test.tsx
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {SmartNav} from '../SmartNav';

describe('SmartNav', () => {
  it('rend ses enfants dans une <nav>', () => {
    render(<SmartNav><span>contenu</span></SmartNav>);
    expect(screen.getByText('contenu')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Implement SmartNav**

```tsx
// storefront/app/components/SmartNav.tsx
import {useHideOnScroll} from '~/hooks/useHideOnScroll';

export function SmartNav({children}: {children: React.ReactNode}) {
  const {solid, hidden} = useHideOnScroll(typeof window !== 'undefined' ? window : null);
  return (
    <nav
      data-solid={solid}
      data-hidden={hidden}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--bsk-space-4) var(--bsk-space-5)',
        transition: 'transform .35s var(--bsk-ease), background .3s, border-color .3s',
        transform: hidden ? 'translateY(-104%)' : 'none',
        background: solid ? 'rgba(19,20,25,.94)' : 'transparent',
        backdropFilter: solid ? 'blur(12px)' : undefined,
        borderBottom: `1px solid ${solid ? 'var(--bsk-border-subtle)' : 'transparent'}`,
      }}
    >
      {children}
    </nav>
  );
}
```

- [ ] **Step 7: Run — expect PASS (SmartNav)**

```bash
cd storefront && npm test -- SmartNav
```

- [ ] **Step 8: Commit**

```bash
git add app/hooks/useHideOnScroll.ts app/components/SmartNav.tsx app/components/__tests__/useHideOnScroll.test.tsx app/components/__tests__/SmartNav.test.tsx
git commit -m "feat(ui): SmartNav + useHideOnScroll (transparent/solid/hide-on-scroll)"
```

---

### Task 8: Emblème — asset + composant `Logo`

Ajouter l'emblème « Bilskirnir — Le Hall de Force » et un composant qui le rend en blanc sur fond sombre.

**Files:**
- Create: `storefront/app/assets/bilskirnir-emblem.svg` (vectorisé depuis `\\EGIDE\Bilskirnir\Logos\Bilskirnig Logo Sans_Details.png`)
- Create: `storefront/app/components/Logo.tsx`
- Test: `storefront/app/components/__tests__/Logo.test.tsx`

- [ ] **Step 1: Ajouter l'asset**

Vectoriser le PNG `Bilskirnig Logo Sans_Details.png` en SVG monochrome (`fill="currentColor"`) → `app/assets/bilskirnir-emblem.svg`. À défaut, copier le PNG (`bilskirnir-emblem.png`) et utiliser `filter: brightness(0) invert(1)` pour le rendre blanc.

- [ ] **Step 2: Write the failing test**

```tsx
// storefront/app/components/__tests__/Logo.test.tsx
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Logo} from '../Logo';

describe('Logo', () => {
  it('rend l\'emblème avec un alt accessible', () => {
    render(<Logo />);
    expect(screen.getByRole('img', {name: /bilskirnir/i})).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run — expect FAIL**

```bash
cd storefront && npm test -- Logo
```

- [ ] **Step 4: Implement**

```tsx
// storefront/app/components/Logo.tsx
import emblem from '~/assets/bilskirnir-emblem.svg?url';

export function Logo({height = 40}: {height?: number}) {
  return (
    <img
      src={emblem}
      alt="Bilskirnir — Le Hall de Force"
      style={{height, width: 'auto', color: 'var(--bsk-fg-primary)'}}
    />
  );
}
```

> Si l'asset est un PNG monochrome noir, ajouter `filter: 'brightness(0) invert(1)'` au style.

- [ ] **Step 5: Run — expect PASS**

```bash
cd storefront && npm test -- Logo
```

- [ ] **Step 6: Commit**

```bash
git add app/assets/bilskirnir-emblem.svg app/components/Logo.tsx app/components/__tests__/Logo.test.tsx
git commit -m "feat(brand): Bilskirnir emblem asset + Logo component"
```

---

### Task 9: Restyler `ReleaseStatusBadge` (variante « sur image » + couleurs système)

Ajouter une prop `onImage` (centré, ombre, z-index pensé pour passer au-dessus d'une `Cover`) et aligner les couleurs sur le système.

**Files:**
- Modify: `storefront/app/components/ReleaseStatusBadge.tsx`
- Modify: `storefront/app/components/__tests__/ReleaseStatusBadge.test.tsx`

- [ ] **Step 1: Add failing tests**

Ajouter au fichier de test existant :

```tsx
it('variante onImage est positionnée en absolu centré', () => {
  render(<ReleaseStatusBadge status="précommande" onImage />);
  const el = screen.getByText(/PRÉCO/).closest('span')!;
  expect(el.style.position).toBe('absolute');
  expect(el.style.zIndex).toBe('3');
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- ReleaseStatusBadge
```

- [ ] **Step 3: Implement la prop `onImage`**

Ajouter `onImage?: boolean` à `ReleaseStatusBadgeProps`. Quand `true`, fusionner ces styles :

```ts
position: 'absolute',
top: '7%',
left: '50%',
transform: 'translateX(-50%)',
zIndex: 3,
whiteSpace: 'nowrap',
boxShadow: '0 4px 12px rgba(0,0,0,.4)',
```

Et remplacer les couleurs `var(--bsk-accent-gold)` / `var(--bsk-bg-base)` déjà en place (héritent du nouveau système — rien à changer côté valeurs).

- [ ] **Step 4: Run — expect PASS (tous les tests du fichier)**

```bash
cd storefront && npm test -- ReleaseStatusBadge
```

- [ ] **Step 5: Commit**

```bash
git add app/components/ReleaseStatusBadge.tsx app/components/__tests__/ReleaseStatusBadge.test.tsx
git commit -m "feat(ui): ReleaseStatusBadge onImage variant for cover overlay"
```

---

### Task 10: Photo du fondateur (fix 404) + placeholder

`/images/gautier.jpg` renvoie 404. Fournir l'asset ou un placeholder propre jusqu'à réception de la vraie photo.

**Files:**
- Create: `storefront/app/assets/founder-placeholder.svg` (cercle avec initiales « GD ») OU `storefront/public/images/gautier.jpg` (vraie photo si fournie)
- Modify: la référence (page La maison / route concernée)

- [ ] **Step 1: Localiser la référence**

```bash
cd storefront && grep -rn "gautier" app
```

- [ ] **Step 2: Fournir l'asset**

Si la vraie photo est disponible, la placer en `public/images/gautier.jpg`. Sinon créer `app/assets/founder-placeholder.svg` (cercle bordé doré + « GD » centré) et référencer ce placeholder.

- [ ] **Step 3: Verify (pas de 404)**

```bash
cd storefront && npm run dev
# ouvrir la page La maison, vérifier 0 requête 404 sur l'image fondateur
```

- [ ] **Step 4: Commit**

```bash
git add app/assets/founder-placeholder.svg app/<fichier-modifié>
git commit -m "fix(maison): founder image asset (placeholder until real photo)"
```

---

### Task 11: Sanity check foundation

- [ ] **Step 1: Tous les tests verts**

```bash
cd storefront && npm test
```

Expected: tous verts (69 existants + nouveaux).

- [ ] **Step 2: Build**

```bash
cd storefront && npm run build
```

Expected: pas d'erreur de type ni de bundle.

- [ ] **Step 3: Dev visuel**

```bash
cd storefront && npm run dev
```

Vérifier : polices Cabinet Grotesk/Switzer chargées, fond anthracite, doré, emblème blanc, fiche produit sans erreur `getProductOptions` ni `src=""` dans la console.

- [ ] **Step 4: Commit (si ajustements)**

```bash
git add -A && git commit -m "chore(foundation): sanity pass design foundation"
```

---

## Self-review (couverture spec)

| Élément spec | Tâche |
|---|---|
| §2.1 Couleurs gris+doré+accent univers | Task 4, 5 |
| §2.2 Cabinet Grotesk + Switzer (auto-hébergé, corps 17px) | Task 3, 4 |
| §2.3 Emblème/Logo | Task 8 |
| §2.4 Couvertures = drop-shadow, jamais de cadre | Task 6 |
| §2.5 Nav intelligente | Task 7 |
| §2.5 Badge statut sur image | Task 9 |
| §4 Bug `product.options` | Task 1 |
| §4 Bug `src=""` | Task 2 |
| §4 Bug photo fondateur 404 | Task 10 |

**Hors de ce plan (plans suivants) :** home slider (§3.1), page univers (§3.2), fiches tome/one-shot (§3.3-3.4), La maison (§3.5), panier rewards (§3.6), gabarit légal (§3.7), versions desktop. Les composants Plan 2 existants (`Header`, `WorkTile`, `TomePageTemplate`, etc.) seront recâblés/restylés dans ces plans en s'appuyant sur les primitives de ce plan.

**Données admin (côté Gautier, hors code) :** prix à 0 €, collection « Fracture » manquante, fonds atmosphériques par univers, vraie photo fondateur, metafields paliers panier.
