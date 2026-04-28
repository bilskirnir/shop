---
title: Bilskirnir — Plan 2 · Catalogue navigable
date: 2026-04-28
status: ready
parent_spec: docs/superpowers/specs/2026-04-23-bilskirnir-shop-design.md
previous_plan: docs/superpowers/plans/2026-04-23-bilskirnir-foundation.md
---

# Bilskirnir Catalogue — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre tout le catalogue navigable et achetable de bout en bout : homepage « stand de libraire » → page univers → fiche tome (avec variant one-shot immersive). À la fin de ce plan, un visiteur peut découvrir une œuvre, ouvrir sa fiche, l'ajouter au panier (avec dédicace gratuite optionnelle) et passer en checkout Shopify.

**Architecture:** Refonte de 3 routes Hydrogen scaffold (`_index`, `collections.$handle`, `products.$handle`) avec une suite de composants Bilskirnir TDD. Toutes les données viennent du Storefront API en lisant les metafields `custom.*` posés en Plan 1. Fallback typographique sur dégradé `couleur_theme` quand les illustrations univers ne sont pas encore fournies. Cart drawer Hydrogen natif monté dans le root via le scaffold `Aside` + un hook `useAside`.

**Sécurité — pas de HTML injecté.** Tous les textes éditoriaux (lore, synopsis, teaser, description) sont consommés en **plain text**. Le rendu visuel utilise `white-space: pre-line` pour préserver les sauts de ligne. Si Gautier veut introduire du rich text formaté (gras, listes), un Plan 3+ ajoutera un renderer dédié basé sur le format Shopify rich text JSON. Aucun usage de `dangerouslySetInnerHTML` dans ce plan.

**Tech Stack:**
- Hydrogen 2025.x (React Router v7) — déjà câblé Plan 1
- Storefront API — déjà câblée
- Vitest + Testing Library — déjà câblé Plan 1
- Vanilla CSS custom properties (tokens existants `--bsk-*`)
- `@shopify/hydrogen` : `Money`, `useOptimisticCart`, `CartForm`, `getSelectedProductOptions`

**Hypothèses (à confirmer pendant l'exécution) :**
1. **Catalogue** : on continue avec les samples « Au Nom des Dieux » (2 tomes) + « Berserker » (standalone). Task 1 demande à Gautier d'ajouter 3-4 produits supplémentaires pour rendre la home crédible.
2. **Illustrations univers** : pas encore fournies. Tous les composants ont un fallback typographique propre + provision pour swap dès que `illustration_hero` est rempli.
3. **Bundles, dédicace+5€, précommande Preorder Manager, notify-me Back in Stock** = hors scope Plan 2 (Plan 3). Fiche tome affiche les **badges visuels** des 3 statuts mais le wiring complet préco/notify est différé.

**Out of scope (Plan 3+):**
- Bundles sagas (CTA visible mais non câblé)
- Précommande via Shopify Preorder Manager (badge oui, bouton `Précommander` câblé sur cart add standard, app Preorder Manager intercepte plus tard)
- Notify-me « à paraître » (placeholder UI seulement, pas de formulaire fonctionnel)
- Pages contact, mentions légales, livraison, CGV
- Rich text rendering (gras, listes) — plain text suffit en v1
- SEO sitemap custom (le scaffold suffit v1)

---

## Prerequisites (check before starting)

- [ ] Plan 1 Foundation terminé et déployé (vérif : `git log --oneline | head -20` montre les commits Plan 1 jusqu'au deploy Oxygen)
- [ ] `npm run dev` boot sans erreur sur `storefront/` et le store répond avec les samples de Plan 1 (Au Nom des Dieux, Berserker, L'Eau et du Sang metaobject)
- [ ] Token Storefront API toujours valide (sinon `npx shopify hydrogen env pull` depuis `storefront/`)
- [ ] Tests verts : `npm test` depuis `storefront/`

---

## File Structure

Après ce plan, voici les fichiers nouveaux (✨) et modifiés (✏️) sous `storefront/app/` :

```
app/
├── components/
│   ├── ✨ ReleaseStatusBadge.tsx
│   ├── ✨ WorkTile.tsx
│   ├── ✨ UniverseHero.tsx
│   ├── ✨ TomeCard.tsx
│   ├── ✨ SagaSection.tsx
│   ├── ✨ TomePageTemplate.tsx
│   ├── ✨ OneShotPageTemplate.tsx
│   ├── ✨ DedicaceField.tsx
│   ├── ✨ TomeAddToCart.tsx
│   ├── ✏️ Header.tsx              (cart button → useAside.open('cart'))
│   └── __tests__/
│       ├── ✨ ReleaseStatusBadge.test.tsx
│       ├── ✨ WorkTile.test.tsx
│       ├── ✨ UniverseHero.test.tsx
│       ├── ✨ TomeCard.test.tsx
│       ├── ✨ SagaSection.test.tsx
│       ├── ✨ TomePageTemplate.test.tsx
│       ├── ✨ OneShotPageTemplate.test.tsx
│       └── ✨ DedicaceField.test.tsx
├── lib/
│   ├── ✏️ fragments.ts             (TOME_METAFIELDS_FRAGMENT, UNIVERSE_DETAIL_FRAGMENT)
│   └── ✨ tomeMetafields.ts        (parsers + richTextToPlain helper)
├── routes/
│   ├── ✏️ _index.tsx               (homepage stand)
│   ├── ✏️ collections.$handle.tsx  (page univers)
│   └── ✏️ products.$handle.tsx    (switch tome / one-shot)
└── ✏️ root.tsx                    (mount cart Aside)
```

Chaque composant a une responsabilité unique. Les **templates de page** (`TomePageTemplate`, `OneShotPageTemplate`) sont des composants purs qui acceptent toute la donnée en props — la route ne fait que loader + render. Ça permet de tester l'arrangement visuel sans monter une route entière.

---

## Tasks

### Task 1: Enrichir les sample data (Shopify admin)

**No code. Manuel dans l'admin Shopify.** Sans ce minimum, l'homepage ressemblera à un magasin vide.

**Files:** None — config Shopify admin only.

- [ ] **Step 1: Compter les produits actuels**

  Dans l'admin → Products. Si on a < 5 produits, continuer ; sinon skip cette task.

- [ ] **Step 2: Créer 2 produits supplémentaires dans « Au Nom des Dieux »**

  Pour chaque produit :
  - Title : `[Saga] - Tome N - [Titre]` (ex: « L'Eau et du Sang - Tome 2 - Le Sel des Mers »)
  - Status : Active
  - Price : 18,90 €
  - Image cover : un placeholder via picsum.photos/400/600 ou cover réelle si dispo
  - Metafields :
    - `custom.univers` → `au-nom-des-dieux`
    - `custom.saga` → metaobject `L'Eau et du Sang`
    - `custom.numero_tome` → `2`
    - `custom.statut_parution` → `publié`
    - `custom.teaser_court` → 2-3 lignes max, italique de fiche
    - `custom.est_une_oeuvre_independante` → `false`

- [ ] **Step 3: Créer 1 univers supplémentaire « Fracture »**

  Collection manuelle (pas smart) :
  - Title : `Fracture`
  - Handle : `fracture`
  - Metafields :
    - `custom.illustration_hero` → vide (fallback typo)
    - `custom.couleur_theme` → `#2a4d5c` (un bleu-gris uchronique)
    - `custom.lore` → 2 paragraphes courts (« Quand un démigod remonte le fil du temps… »)
    - `custom.est_une_oeuvre_independante` → `false`
    - `custom.sagas` → vide (univers sans sagas, juste 1 tome direct)
  - Ajouter 1 produit dedans : `Fracture - Tome 1 - L'Échelle Brisée`, `statut_parution = précommande`, `date_parution = 2026-09-15`.

- [ ] **Step 4: Créer 1 produit « annoncé »**

  Pour tester le badge "à paraître" :
  - Title : `Crépuscule d'un monde - Tome 1 - L'Aube Tardive`
  - Image : silhouette / placeholder noir 400×600
  - Status : Active
  - Metafields :
    - `custom.statut_parution` → `annoncé`
    - `custom.date_parution` → vide ou « 2026 »
    - `custom.est_une_oeuvre_independante` → `false`

- [ ] **Step 5: Vérifier via storefront query**

  Dans l'admin GraphiQL (ou Postman, ou le dev server), exécuter :

  ```graphql
  query {
    collections(first: 10) { nodes { handle title } }
    products(first: 20) {
      nodes {
        handle title
        statutParution: metafield(namespace: "custom", key: "statut_parution") { value }
      }
    }
  }
  ```

  Confirmer : ≥ 4 collections (au-nom-des-dieux, romans-independants, fracture, + main-menu si présent), ≥ 5 produits avec leurs `statut_parution` corrects.

- [ ] **Step 6: Pas de commit (rien de code-side)**

---

### Task 2: ReleaseStatusBadge component (TDD)

**Files:**
- Create: `storefront/app/components/ReleaseStatusBadge.tsx`
- Test: `storefront/app/components/__tests__/ReleaseStatusBadge.test.tsx`

Composant pur qui rend le bon badge selon `statut_parution`. Aucune logique métier, juste du visuel.

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/ReleaseStatusBadge.test.tsx
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ReleaseStatusBadge} from '../ReleaseStatusBadge';

describe('ReleaseStatusBadge', () => {
  it('rend null pour le statut publié', () => {
    const {container} = render(<ReleaseStatusBadge status="publié" />);
    expect(container.firstChild).toBeNull();
  });

  it('rend "PRÉCO" + date pour précommande', () => {
    render(<ReleaseStatusBadge status="précommande" releaseDate="2026-09-15" />);
    expect(screen.getByText(/PRÉCO/)).toBeInTheDocument();
    expect(screen.getByText(/15 sept\. 2026/)).toBeInTheDocument();
  });

  it('rend "PRÉCO" sans date si releaseDate manquante', () => {
    render(<ReleaseStatusBadge status="précommande" />);
    expect(screen.getByText(/PRÉCO/)).toBeInTheDocument();
  });

  it('rend "À PARAÎTRE" pour annoncé', () => {
    render(<ReleaseStatusBadge status="annoncé" />);
    expect(screen.getByText(/À PARAÎTRE/)).toBeInTheDocument();
  });

  it('applique data-status pour styling CSS', () => {
    render(<ReleaseStatusBadge status="précommande" />);
    expect(screen.getByText(/PRÉCO/).closest('span')).toHaveAttribute('data-status', 'précommande');
  });
});
```

- [ ] **Step 2: Run — expect 5 failures**

```bash
cd storefront && npm test -- ReleaseStatusBadge
```

Expected : `Cannot find module '../ReleaseStatusBadge'`.

- [ ] **Step 3: Implement**

```tsx
// storefront/app/components/ReleaseStatusBadge.tsx
export type ReleaseStatus = 'publié' | 'précommande' | 'annoncé';

export interface ReleaseStatusBadgeProps {
  status: ReleaseStatus;
  releaseDate?: string | null;
}

const FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function formatReleaseDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return FORMATTER.format(d);
}

export function ReleaseStatusBadge({
  status,
  releaseDate,
}: ReleaseStatusBadgeProps) {
  if (status === 'publié') return null;

  const formatted = formatReleaseDate(releaseDate);
  const label = status === 'précommande' ? 'PRÉCO' : 'À PARAÎTRE';

  return (
    <span
      data-status={status}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--bsk-space-2)',
        padding: 'var(--bsk-space-1) var(--bsk-space-3)',
        fontFamily: 'var(--bsk-font-sans)',
        fontSize: 'var(--bsk-text-xs)',
        fontWeight: 'var(--bsk-weight-semibold)',
        letterSpacing: 'var(--bsk-tracking-widest)',
        textTransform: 'uppercase',
        color:
          status === 'précommande'
            ? 'var(--bsk-bg-base)'
            : 'var(--bsk-fg-secondary)',
        background:
          status === 'précommande'
            ? 'var(--bsk-accent-gold)'
            : 'transparent',
        border:
          status === 'précommande'
            ? 'none'
            : '1px solid var(--bsk-border-subtle)',
        borderRadius: '2px',
      }}
    >
      <span>{label}</span>
      {formatted && status === 'précommande' && (
        <span style={{opacity: 0.85}}>· {formatted}</span>
      )}
    </span>
  );
}
```

- [ ] **Step 4: Run — expect 5 passed**

- [ ] **Step 5: Commit**

```bash
git add app/components/ReleaseStatusBadge.tsx app/components/__tests__/ReleaseStatusBadge.test.tsx
git commit -m "feat(ui): ReleaseStatusBadge for tome statuts"
```

---

### Task 3: WorkTile component (TDD, 4 variants)

La tuile œuvre du slideshow homepage et de la grille catalogue. Discriminated union sur `kind`.

**Files:**
- Create: `storefront/app/components/WorkTile.tsx`
- Test: `storefront/app/components/__tests__/WorkTile.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/WorkTile.test.tsx
import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {WorkTile} from '../WorkTile';

const cover = (alt: string) => ({
  url: 'https://example.com/c.jpg',
  altText: alt,
  width: 400,
  height: 600,
});

describe('WorkTile', () => {
  it('variant single rend une couverture seule', () => {
    renderWithRouter(
      <WorkTile
        kind="single"
        href="/products/berserker"
        title="Berserker"
        cover={cover('Berserker')}
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/berserker');
    expect(screen.getByAltText('Berserker')).toBeInTheDocument();
    expect(screen.getByText('Berserker')).toBeInTheDocument();
  });

  it('variant stack rend toutes les couvertures', () => {
    renderWithRouter(
      <WorkTile
        kind="stack"
        href="/collections/au-nom-des-dieux"
        title="Au Nom des Dieux"
        covers={[cover('T1'), cover('T2'), cover('T3')]}
      />,
    );
    expect(screen.getAllByRole('img')).toHaveLength(3);
  });

  it('variant stack-many rend les 3 premières + badge +N', () => {
    renderWithRouter(
      <WorkTile
        kind="stack-many"
        href="/collections/saga-x"
        title="Grand Univers"
        covers={[cover('T1'), cover('T2'), cover('T3')]}
        extraCount={4}
      />,
    );
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByText('+4')).toBeInTheDocument();
  });

  it('variant standalone rend cover + pastille typée', () => {
    renderWithRouter(
      <WorkTile
        kind="standalone"
        href="/products/berserker"
        title="Berserker"
        cover={cover('Berserker')}
        pillLabel="ROMAN"
      />,
    );
    expect(screen.getByText('ROMAN')).toBeInTheDocument();
  });

  it('affiche meta optionnelle quand fournie', () => {
    renderWithRouter(
      <WorkTile
        kind="single"
        href="/products/x"
        title="X"
        cover={cover('X')}
        meta="2 tomes · en cours"
      />,
    );
    expect(screen.getByText('2 tomes · en cours')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect 5 failures**

- [ ] **Step 3: Implement**

```tsx
// storefront/app/components/WorkTile.tsx
import {Link} from 'react-router';

export interface CoverImage {
  url: string;
  altText: string;
  width: number;
  height: number;
}

export type WorkTileProps =
  | {
      kind: 'single';
      href: string;
      title: string;
      cover: CoverImage;
      meta?: string;
    }
  | {
      kind: 'stack';
      href: string;
      title: string;
      covers: CoverImage[];
      meta?: string;
    }
  | {
      kind: 'stack-many';
      href: string;
      title: string;
      covers: CoverImage[];
      extraCount: number;
      meta?: string;
    }
  | {
      kind: 'standalone';
      href: string;
      title: string;
      cover: CoverImage;
      pillLabel: 'ROMAN' | 'RECUEIL' | 'GUIDE';
      meta?: string;
    };

const tileLink: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textDecoration: 'none',
  color: 'inherit',
  width: '14rem',
  flex: '0 0 auto',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--bsk-font-serif)',
  fontSize: 'var(--bsk-text-md)',
  color: 'var(--bsk-fg-primary)',
  textAlign: 'center',
  marginTop: 'var(--bsk-space-4)',
  letterSpacing: 'var(--bsk-tracking-tight)',
};

const metaStyle: React.CSSProperties = {
  fontFamily: 'var(--bsk-font-sans)',
  fontSize: 'var(--bsk-text-xs)',
  letterSpacing: 'var(--bsk-tracking-wide)',
  textTransform: 'uppercase',
  color: 'var(--bsk-fg-secondary)',
  marginTop: 'var(--bsk-space-1)',
};

const coverFloat: React.CSSProperties = {
  width: '100%',
  height: 'auto',
  boxShadow: 'var(--bsk-shadow-cover)',
  borderRadius: '2px',
  background: 'var(--bsk-bg-raised)',
};

function Cover({src}: {src: CoverImage}) {
  return (
    <img
      src={src.url}
      alt={src.altText}
      width={src.width}
      height={src.height}
      style={coverFloat}
      loading="lazy"
    />
  );
}

function StackedCovers({
  covers,
  extraCount,
}: {
  covers: CoverImage[];
  extraCount?: number;
}) {
  const visible = covers.slice(0, 3);
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '20rem',
      }}
    >
      {visible.map((c, i) => (
        <div
          key={c.url + i}
          style={{
            position: 'absolute',
            top: 0,
            left: `${i * 8}%`,
            width: '70%',
            transform: `rotate(${(i - 1) * 2.5}deg)`,
            transformOrigin: 'bottom center',
          }}
        >
          <Cover src={c} />
        </div>
      ))}
      {extraCount && extraCount > 0 ? (
        <span
          style={{
            position: 'absolute',
            bottom: '-0.5rem',
            right: '-0.25rem',
            background: 'var(--bsk-accent-gold)',
            color: 'var(--bsk-bg-base)',
            fontFamily: 'var(--bsk-font-sans)',
            fontWeight: 'var(--bsk-weight-bold)',
            fontSize: 'var(--bsk-text-sm)',
            padding: 'var(--bsk-space-1) var(--bsk-space-3)',
            borderRadius: '999px',
          }}
        >
          +{extraCount}
        </span>
      ) : null}
    </div>
  );
}

function StandalonePill({label}: {label: string}) {
  return (
    <span
      style={{
        position: 'absolute',
        top: 'var(--bsk-space-3)',
        right: 'var(--bsk-space-3)',
        background: 'var(--bsk-accent-gold)',
        color: 'var(--bsk-bg-base)',
        fontFamily: 'var(--bsk-font-sans)',
        fontSize: 'var(--bsk-text-xs)',
        fontWeight: 'var(--bsk-weight-semibold)',
        letterSpacing: 'var(--bsk-tracking-widest)',
        padding: 'var(--bsk-space-1) var(--bsk-space-3)',
        borderRadius: '2px',
      }}
    >
      {label}
    </span>
  );
}

export function WorkTile(props: WorkTileProps) {
  return (
    <Link to={props.href} style={tileLink} data-kind={props.kind}>
      <div style={{position: 'relative', width: '100%'}}>
        {props.kind === 'single' && <Cover src={props.cover} />}
        {props.kind === 'stack' && <StackedCovers covers={props.covers} />}
        {props.kind === 'stack-many' && (
          <StackedCovers covers={props.covers} extraCount={props.extraCount} />
        )}
        {props.kind === 'standalone' && (
          <>
            <Cover src={props.cover} />
            <StandalonePill label={props.pillLabel} />
          </>
        )}
      </div>
      <span style={titleStyle}>{props.title}</span>
      {props.meta && <span style={metaStyle}>{props.meta}</span>}
    </Link>
  );
}
```

- [ ] **Step 4: Run — expect 5 passed**

- [ ] **Step 5: Commit**

```bash
git add app/components/WorkTile.tsx app/components/__tests__/WorkTile.test.tsx
git commit -m "feat(ui): WorkTile with single/stack/stack-many/standalone variants"
```

---

### Task 4: UniverseHero component (TDD)

Bannière 380-420px en tête de page univers. Si `heroImage` fournie → image. Sinon → fallback dégradé avec `themeColor` + titre serif XXL. Texte du `lore` rendu en plain text avec `pre-line`.

**Files:**
- Create: `storefront/app/components/UniverseHero.tsx`
- Test: `storefront/app/components/__tests__/UniverseHero.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/UniverseHero.test.tsx
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {UniverseHero} from '../UniverseHero';

describe('UniverseHero', () => {
  it('rend titre + lore + stats en mode fallback typo', () => {
    render(
      <UniverseHero
        title="Au Nom des Dieux"
        lore="Quand les dieux se sont tus, le monde n'a pas cessé de tourner."
        stats="4 sagas · 6 tomes · en cours"
      />,
    );
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent(
      'Au Nom des Dieux',
    );
    expect(screen.getByText(/Quand les dieux/)).toBeInTheDocument();
    expect(screen.getByText('4 sagas · 6 tomes · en cours')).toBeInTheDocument();
  });

  it('rend l\'image hero quand fournie', () => {
    render(
      <UniverseHero
        title="Saga X"
        heroImage={{
          url: 'https://example.com/hero.jpg',
          altText: 'Saga X hero',
          width: 1920,
          height: 600,
        }}
      />,
    );
    expect(screen.getByAltText('Saga X hero')).toBeInTheDocument();
  });

  it('applique themeColor en background fallback quand pas d\'image', () => {
    const {container} = render(
      <UniverseHero title="Fracture" themeColor="#2a4d5c" />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.style.background).toContain('#2a4d5c');
  });
});
```

- [ ] **Step 2: Run — expect 3 failures**

- [ ] **Step 3: Implement**

```tsx
// storefront/app/components/UniverseHero.tsx
export interface HeroImage {
  url: string;
  altText: string;
  width: number;
  height: number;
}

export interface UniverseHeroProps {
  title: string;
  lore?: string | null;
  stats?: string | null;
  heroImage?: HeroImage | null;
  themeColor?: string | null;
}

export function UniverseHero({
  title,
  lore,
  stats,
  heroImage,
  themeColor,
}: UniverseHeroProps) {
  const hasImage = !!heroImage;
  const fallbackColor = themeColor || '#1a140e';

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '420px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--bsk-space-12) var(--bsk-space-5)',
        overflow: 'hidden',
        background: hasImage
          ? 'var(--bsk-bg-base)'
          : `radial-gradient(ellipse at 50% 0%, ${fallbackColor} 0%, var(--bsk-bg-base) 75%)`,
      }}
    >
      {hasImage && (
        <img
          src={heroImage.url}
          alt={heroImage.altText}
          width={heroImage.width}
          height={heroImage.height}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.55,
          }}
        />
      )}
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          maxWidth: 'var(--bsk-width-content)',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--bsk-font-serif)',
            fontSize: 'var(--bsk-text-3xl)',
            color: 'var(--bsk-fg-primary)',
            letterSpacing: 'var(--bsk-tracking-tight)',
            marginBottom: 'var(--bsk-space-5)',
          }}
        >
          {title}
        </h1>
        {lore && (
          <p
            style={{
              fontFamily: 'var(--bsk-font-serif)',
              fontStyle: 'italic',
              fontSize: 'var(--bsk-text-md)',
              color: 'var(--bsk-fg-secondary)',
              maxWidth: 'var(--bsk-width-reading)',
              margin: '0 auto var(--bsk-space-5)',
              whiteSpace: 'pre-line',
            }}
          >
            {lore}
          </p>
        )}
        {stats && (
          <p
            style={{
              fontFamily: 'var(--bsk-font-sans)',
              fontSize: 'var(--bsk-text-sm)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-accent-gold)',
            }}
          >
            {stats}
          </p>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run — expect 3 passed**

- [ ] **Step 5: Commit**

```bash
git add app/components/UniverseHero.tsx app/components/__tests__/UniverseHero.test.tsx
git commit -m "feat(ui): UniverseHero with image + typo fallback"
```

---

### Task 5: TomeCard component (TDD)

Carte d'un tome dans une grille saga ou page univers : couverture + numéro de tome + titre + statut + prix.

**Files:**
- Create: `storefront/app/components/TomeCard.tsx`
- Test: `storefront/app/components/__tests__/TomeCard.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/TomeCard.test.tsx
import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {TomeCard} from '../TomeCard';

const baseTome = {
  handle: 'tome-1',
  title: 'Le Sang Versé',
  cover: {
    url: 'https://example.com/c.jpg',
    altText: 'Le Sang Versé',
    width: 400,
    height: 600,
  },
};

describe('TomeCard', () => {
  it('rend titre + couverture + lien produit', () => {
    renderWithRouter(<TomeCard {...baseTome} status="publié" priceFormatted="18,90 €" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/products/tome-1');
    expect(screen.getByText('Le Sang Versé')).toBeInTheDocument();
    expect(screen.getByAltText('Le Sang Versé')).toBeInTheDocument();
  });

  it('affiche tome N quand fourni', () => {
    renderWithRouter(
      <TomeCard {...baseTome} tomeNumber={1} status="publié" priceFormatted="18,90 €" />,
    );
    expect(screen.getByText(/TOME 1/)).toBeInTheDocument();
  });

  it('affiche le prix pour publié', () => {
    renderWithRouter(<TomeCard {...baseTome} status="publié" priceFormatted="18,90 €" />);
    expect(screen.getByText('18,90 €')).toBeInTheDocument();
  });

  it('cache le prix pour précommande/annoncé et délègue à ReleaseStatusBadge', () => {
    renderWithRouter(
      <TomeCard
        {...baseTome}
        status="annoncé"
        priceFormatted="18,90 €"
      />,
    );
    expect(screen.queryByText('18,90 €')).not.toBeInTheDocument();
    expect(screen.getByText(/À PARAÎTRE/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect 4 failures**

- [ ] **Step 3: Implement**

```tsx
// storefront/app/components/TomeCard.tsx
import {Link} from 'react-router';
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
      }}
    >
      <img
        src={cover.url}
        alt={cover.altText}
        width={cover.width}
        height={cover.height}
        loading="lazy"
        style={{
          width: '100%',
          height: 'auto',
          boxShadow: 'var(--bsk-shadow-cover)',
          borderRadius: '2px',
          background: 'var(--bsk-bg-raised)',
        }}
      />
      <div
        style={{
          marginTop: 'var(--bsk-space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--bsk-space-2)',
        }}
      >
        {tomeNumber != null && (
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
        )}
        <span
          style={{
            fontFamily: 'var(--bsk-font-serif)',
            fontSize: 'var(--bsk-text-lg)',
            color: 'var(--bsk-fg-primary)',
            letterSpacing: 'var(--bsk-tracking-tight)',
          }}
        >
          {title}
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--bsk-space-3)',
          }}
        >
          {status === 'publié' && priceFormatted && (
            <span
              style={{
                fontFamily: 'var(--bsk-font-sans)',
                fontSize: 'var(--bsk-text-base)',
                color: 'var(--bsk-fg-primary)',
              }}
            >
              {priceFormatted}
            </span>
          )}
          <ReleaseStatusBadge status={status} releaseDate={releaseDate} />
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Run — expect 4 passed**

- [ ] **Step 5: Commit**

```bash
git add app/components/TomeCard.tsx app/components/__tests__/TomeCard.test.tsx
git commit -m "feat(ui): TomeCard for grid of tomes within univers/saga"
```

---

### Task 6: SagaSection component (TDD)

Section visuelle pour une saga sur la page univers : header typo-driven (label · ornement · titre · synopsis) + grille de TomeCard.

**Files:**
- Create: `storefront/app/components/SagaSection.tsx`
- Test: `storefront/app/components/__tests__/SagaSection.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/SagaSection.test.tsx
import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {SagaSection} from '../SagaSection';

const tome = (n: number) => ({
  handle: `tome-${n}`,
  title: `Tome ${n}`,
  cover: {
    url: 'https://example.com/c.jpg',
    altText: `T${n}`,
    width: 400,
    height: 600,
  },
  status: 'publié' as const,
  tomeNumber: n,
  priceFormatted: '18,90 €',
});

describe('SagaSection', () => {
  it('rend le label SAGA · TYPE · N TOMES', () => {
    renderWithRouter(
      <SagaSection
        nom="L'Eau et du Sang"
        type="Duologie"
        synopsis="La saga fondatrice de l'univers."
        tomes={[tome(1), tome(2)]}
      />,
    );
    expect(screen.getByText(/SAGA · DUOLOGIE · 2 TOMES/)).toBeInTheDocument();
  });

  it('rend le titre serif et le synopsis', () => {
    renderWithRouter(
      <SagaSection
        nom="L'Eau et du Sang"
        synopsis="La saga fondatrice de l'univers."
        tomes={[tome(1)]}
      />,
    );
    expect(
      screen.getByRole('heading', {name: "L'Eau et du Sang"}),
    ).toBeInTheDocument();
    expect(screen.getByText(/saga fondatrice/)).toBeInTheDocument();
  });

  it('rend tous les TomeCard de la grille', () => {
    renderWithRouter(
      <SagaSection nom="X" tomes={[tome(1), tome(2), tome(3)]} />,
    );
    expect(screen.getByText('Tome 1')).toBeInTheDocument();
    expect(screen.getByText('Tome 2')).toBeInTheDocument();
    expect(screen.getByText('Tome 3')).toBeInTheDocument();
  });

  it('rend CTA bundle si bundleHref fourni', () => {
    renderWithRouter(
      <SagaSection
        nom="X"
        tomes={[tome(1)]}
        bundleHref="/products/saga-x-bundle"
      />,
    );
    expect(
      screen.getByRole('link', {name: /saga complète/i}),
    ).toHaveAttribute('href', '/products/saga-x-bundle');
  });

  it('omet CTA bundle si bundleHref absent', () => {
    renderWithRouter(<SagaSection nom="X" tomes={[tome(1)]} />);
    expect(
      screen.queryByRole('link', {name: /saga complète/i}),
    ).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect 5 failures**

- [ ] **Step 3: Implement**

```tsx
// storefront/app/components/SagaSection.tsx
import {Link} from 'react-router';
import {Ornament} from './Ornament';
import {TomeCard, type TomeCardProps} from './TomeCard';

export interface SagaSectionProps {
  nom: string;
  type?: string | null;
  synopsis?: string | null;
  tomes: TomeCardProps[];
  bundleHref?: string | null;
}

export function SagaSection({
  nom,
  type,
  synopsis,
  tomes,
  bundleHref,
}: SagaSectionProps) {
  const labelParts = [
    'SAGA',
    type ? type.toUpperCase() : null,
    `${tomes.length} TOMES`,
  ].filter(Boolean);

  return (
    <section
      style={{
        padding: 'var(--bsk-space-12) 0',
        textAlign: 'center',
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
        {labelParts.join(' · ')}
      </p>
      <Ornament />
      <h2
        style={{
          fontFamily: 'var(--bsk-font-serif)',
          fontSize: 'var(--bsk-text-2xl)',
          color: 'var(--bsk-fg-primary)',
          letterSpacing: 'var(--bsk-tracking-tight)',
          margin: 'var(--bsk-space-3) 0',
        }}
      >
        {nom}
      </h2>
      {synopsis && (
        <p
          style={{
            fontFamily: 'var(--bsk-font-serif)',
            fontStyle: 'italic',
            fontSize: 'var(--bsk-text-md)',
            color: 'var(--bsk-fg-secondary)',
            maxWidth: 'var(--bsk-width-reading)',
            margin: '0 auto var(--bsk-space-6)',
            whiteSpace: 'pre-line',
          }}
        >
          {synopsis}
        </p>
      )}
      {bundleHref && (
        <Link
          to={bundleHref}
          style={{
            display: 'inline-block',
            padding: 'var(--bsk-space-3) var(--bsk-space-6)',
            fontFamily: 'var(--bsk-font-sans)',
            fontSize: 'var(--bsk-text-sm)',
            letterSpacing: 'var(--bsk-tracking-wide)',
            textTransform: 'uppercase',
            color: 'var(--bsk-bg-base)',
            background: 'var(--bsk-accent-gold)',
            textDecoration: 'none',
            marginBottom: 'var(--bsk-space-8)',
            borderRadius: '2px',
          }}
        >
          Acheter la saga complète
        </Link>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--bsk-space-6)',
          textAlign: 'left',
          marginTop: 'var(--bsk-space-6)',
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

- [ ] **Step 4: Run — expect 5 passed**

- [ ] **Step 5: Commit**

```bash
git add app/components/SagaSection.tsx app/components/__tests__/SagaSection.test.tsx
git commit -m "feat(ui): SagaSection with typo header and tome grid"
```

---

### Task 7: Étendre les fragments GraphQL + helpers metafield

**Files:**
- Modify: `storefront/app/lib/fragments.ts`
- Create: `storefront/app/lib/tomeMetafields.ts` (parsers + rich text → plain text helper)

Centraliser les fragments pour récupérer les metafields custom + helpers de parsing typés. Les rich text Shopify sont convertis en plain text à la frontière du loader, ce qui isole l'app du format Shopify et évite tout `dangerouslySetInnerHTML`.

- [ ] **Step 1: Append fragments dans `app/lib/fragments.ts`**

  Append à la fin du fichier existant :

  ```ts
  // storefront/app/lib/fragments.ts (append)

  export const TOME_METAFIELDS_FRAGMENT = `#graphql
    fragment TomeMetafields on Product {
      univers: metafield(namespace: "custom", key: "univers") {
        reference {
          ... on Collection {
            id handle title
          }
        }
      }
      saga: metafield(namespace: "custom", key: "saga") {
        reference {
          ... on Metaobject {
            id handle
            fields { key value }
          }
        }
      }
      numeroTome: metafield(namespace: "custom", key: "numero_tome") { value }
      statutParution: metafield(namespace: "custom", key: "statut_parution") { value }
      dateParution: metafield(namespace: "custom", key: "date_parution") { value }
      teaserCourt: metafield(namespace: "custom", key: "teaser_court") { value }
      estUneOeuvreIndependante: metafield(namespace: "custom", key: "est_une_oeuvre_independante") { value }
    }
  ` as const;

  export const TILE_PRODUCT_FRAGMENT = `#graphql
    fragment TileProduct on Product {
      id
      handle
      title
      featuredImage { url altText width height }
      priceRange { minVariantPrice { amount currencyCode } }
      ...TomeMetafields
    }
    ${TOME_METAFIELDS_FRAGMENT}
  ` as const;

  export const UNIVERSE_DETAIL_FRAGMENT = `#graphql
    fragment UniverseDetail on Collection {
      id
      handle
      title
      illustrationHero: metafield(namespace: "custom", key: "illustration_hero") {
        reference {
          ... on MediaImage { image { url altText width height } }
        }
      }
      lore: metafield(namespace: "custom", key: "lore") { value }
      couleurTheme: metafield(namespace: "custom", key: "couleur_theme") { value }
      sagas: metafield(namespace: "custom", key: "sagas") {
        references(first: 10) {
          nodes {
            ... on Metaobject {
              id handle
              fields { key value reference { ... on MediaImage { image { url altText width height } } } }
            }
          }
        }
      }
      estUneOeuvreIndependante: metafield(namespace: "custom", key: "est_une_oeuvre_independante") { value }
      products(first: 50) {
        nodes { ...TileProduct }
      }
    }
    ${TILE_PRODUCT_FRAGMENT}
  ` as const;
  ```

- [ ] **Step 2: Créer les helpers**

  ```ts
  // storefront/app/lib/tomeMetafields.ts
  import type {ReleaseStatus} from '~/components/ReleaseStatusBadge';

  /** Parse une valeur metafield 'statut_parution' en un type strict. */
  export function parseStatutParution(
    raw: string | null | undefined,
  ): ReleaseStatus {
    if (raw === 'précommande' || raw === 'annoncé') return raw;
    return 'publié';
  }

  export function parseNumeroTome(
    raw: string | null | undefined,
  ): number | null {
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? null : n;
  }

  export function parseBool(raw: string | null | undefined): boolean {
    return raw === 'true';
  }

  /** Get a field value from a Metaobject's `fields` array */
  export function metaobjectField(
    fields: Array<{key: string; value: string | null}> | undefined,
    key: string,
  ): string | null {
    return fields?.find((f) => f.key === key)?.value ?? null;
  }

  /**
   * Convert a Shopify rich-text metafield value (JSON) into plain text.
   * Shopify rich-text format: nested {type, children, value} nodes.
   * Returns paragraphs separated by newlines so consumers can use
   * `white-space: pre-line` to preserve breaks without injecting HTML.
   *
   * Falls through to the raw string if the value is not JSON (e.g. a
   * `single_line_text_field` or `multi_line_text_field`).
   */
  export function richTextToPlain(raw: string | null | undefined): string {
    if (!raw) return '';
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return raw; // already plain text
    }
    return walk(parsed).trim();
  }

  function walk(node: unknown): string {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(walk).join('');
    if (!node || typeof node !== 'object') return '';
    const obj = node as {type?: string; value?: string; children?: unknown};
    const inner =
      typeof obj.value === 'string'
        ? obj.value
        : obj.children !== undefined
          ? walk(obj.children)
          : '';
    if (obj.type === 'paragraph' || obj.type === 'heading') {
      return inner + '\n\n';
    }
    if (obj.type === 'list-item' || obj.type === 'list_item') {
      return '• ' + inner + '\n';
    }
    return inner;
  }
  ```

- [ ] **Step 3: Run codegen**

  ```bash
  cd storefront && npm run codegen
  ```

  Expected : pas d'erreur GraphQL. Si fail, c'est souvent un metafield manquant côté admin (Task 1).

- [ ] **Step 4: Commit**

  ```bash
  git add app/lib/fragments.ts app/lib/tomeMetafields.ts
  git commit -m "feat(data): TomeMetafields/TileProduct/UniverseDetail fragments + parsers + richTextToPlain"
  ```

---

### Task 8: Refonte route `_index.tsx` (homepage stand)

Remplace le placeholder par l'homepage complète : tagline + slideshow horizontal d'œuvres + section « À paraître » + grille catalogue + valeurs maison.

**Files:**
- Modify: `storefront/app/routes/_index.tsx`

- [ ] **Step 1: Réécrire le fichier**

  Remplacer le contenu intégral par :

  ```tsx
  // storefront/app/routes/_index.tsx
  import {useLoaderData} from 'react-router';
  import type {Route} from './+types/_index';
  import {Container} from '~/components/Container';
  import {WorkTile, type WorkTileProps} from '~/components/WorkTile';
  import {Ornament} from '~/components/Ornament';
  import {
    TILE_PRODUCT_FRAGMENT,
    UNIVERSE_CARD_FRAGMENT,
  } from '~/lib/fragments';
  import {
    parseBool,
    parseStatutParution,
  } from '~/lib/tomeMetafields';

  export const meta: Route.MetaFunction = () => [
    {title: 'Bilskirnir — Des récits héroïques, sans compromis'},
  ];

  const HOME_QUERY = `#graphql
    query Home($country: CountryCode, $language: LanguageCode)
      @inContext(country: $country, language: $language) {
      collections(first: 20, sortKey: TITLE) {
        nodes {
          ...UniverseCard
          products(first: 6, sortKey: BEST_SELLING) {
            nodes { ...TileProduct }
          }
        }
      }
      products(first: 50) {
        nodes { ...TileProduct }
      }
    }
    ${UNIVERSE_CARD_FRAGMENT}
    ${TILE_PRODUCT_FRAGMENT}
  ` as const;

  export async function loader({context}: Route.LoaderArgs) {
    const {storefront} = context;
    const data = await storefront.query(HOME_QUERY, {
      cache: storefront.CacheShort(),
    });
    return data;
  }

  type ProductLite = {
    id: string;
    handle: string;
    title: string;
    featuredImage: {url: string; altText: string | null; width: number; height: number} | null;
    estUneOeuvreIndependante?: {value: string} | null;
    statutParution?: {value: string} | null;
    dateParution?: {value: string} | null;
  };

  function buildTilesFromUniverses(
    collections: Array<{
      id: string;
      handle: string;
      title: string;
      estUneOeuvreIndependante?: {value: string} | null;
      products: {nodes: ProductLite[]};
    }>,
  ): WorkTileProps[] {
    return collections
      .filter((c) => !parseBool(c.estUneOeuvreIndependante?.value))
      .map<WorkTileProps | null>((c) => {
        const tomes = c.products.nodes;
        if (tomes.length === 0) return null;
        const covers = tomes
          .map((t) => t.featuredImage)
          .filter((i): i is NonNullable<typeof i> => !!i)
          .map((i) => ({
            url: i.url,
            altText: i.altText ?? c.title,
            width: i.width,
            height: i.height,
          }));
        if (covers.length === 0) return null;
        const href = `/collections/${c.handle}`;
        const meta = `${tomes.length} tome${tomes.length > 1 ? 's' : ''}`;
        if (covers.length === 1) {
          return {kind: 'single', href, title: c.title, cover: covers[0], meta};
        }
        if (covers.length <= 3) {
          return {kind: 'stack', href, title: c.title, covers, meta};
        }
        return {
          kind: 'stack-many',
          href,
          title: c.title,
          covers: covers.slice(0, 3),
          extraCount: covers.length - 3,
          meta,
        };
      })
      .filter((x): x is WorkTileProps => x !== null);
  }

  function buildStandaloneTiles(products: ProductLite[]): WorkTileProps[] {
    return products
      .filter((p) => parseBool(p.estUneOeuvreIndependante?.value))
      .filter((p) => p.featuredImage)
      .map<WorkTileProps>((p) => ({
        kind: 'standalone',
        href: `/products/${p.handle}`,
        title: p.title,
        cover: {
          url: p.featuredImage!.url,
          altText: p.featuredImage!.altText ?? p.title,
          width: p.featuredImage!.width,
          height: p.featuredImage!.height,
        },
        pillLabel: 'ROMAN',
      }));
  }

  function selectUpcoming(products: ProductLite[]): ProductLite[] {
    return products
      .filter((p) => {
        const s = parseStatutParution(p.statutParution?.value);
        return s === 'précommande' || s === 'annoncé';
      })
      .slice(0, 6);
  }

  export default function Home() {
    const data = useLoaderData<typeof loader>();
    const collections = data.collections.nodes as Parameters<typeof buildTilesFromUniverses>[0];
    const allProducts = data.products.nodes as ProductLite[];

    const universeTiles = buildTilesFromUniverses(collections);
    const standaloneTiles = buildStandaloneTiles(allProducts);
    const allTiles = [...universeTiles, ...standaloneTiles];
    const upcoming = selectUpcoming(allProducts);

    return (
      <>
        <Container width="full">
          <div
            style={{
              padding: 'var(--bsk-space-10) 0 var(--bsk-space-6)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--bsk-font-serif)',
                fontStyle: 'italic',
                fontSize: 'var(--bsk-text-md)',
                color: 'var(--bsk-fg-secondary)',
              }}
            >
              Des récits héroïques, sans compromis.
            </p>
          </div>
        </Container>

        <Container width="full">
          <section
            aria-label="Œuvres au catalogue"
            style={{
              padding: 'var(--bsk-space-8) 0',
              background: 'var(--bsk-bg-gradient-warm)',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 'var(--bsk-space-8)',
                overflowX: 'auto',
                padding: 'var(--bsk-space-6) var(--bsk-space-8)',
                scrollSnapType: 'x mandatory',
              }}
            >
              {allTiles.map((tile) => (
                <div
                  key={tile.href}
                  style={{scrollSnapAlign: 'start', flex: '0 0 auto'}}
                >
                  <WorkTile {...tile} />
                </div>
              ))}
            </div>
          </section>
        </Container>

        {upcoming.length > 0 && (
          <Container width="content">
            <section style={{padding: 'var(--bsk-space-12) 0'}}>
              <h2
                style={{
                  fontFamily: 'var(--bsk-font-serif)',
                  fontSize: 'var(--bsk-text-xl)',
                  textAlign: 'center',
                  marginBottom: 'var(--bsk-space-6)',
                  color: 'var(--bsk-fg-primary)',
                }}
              >
                À paraître
              </h2>
              <Ornament />
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 'var(--bsk-space-6) 0 0',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 'var(--bsk-space-5)',
                }}
              >
                {upcoming.map((p) => {
                  const status = parseStatutParution(p.statutParution?.value);
                  return (
                    <li
                      key={p.id}
                      style={{
                        padding: 'var(--bsk-space-4)',
                        border: '1px solid var(--bsk-border-subtle)',
                        borderRadius: '4px',
                      }}
                    >
                      <a
                        href={`/products/${p.handle}`}
                        style={{
                          textDecoration: 'none',
                          color: 'var(--bsk-fg-primary)',
                          fontFamily: 'var(--bsk-font-serif)',
                        }}
                      >
                        {p.title}
                      </a>
                      <p
                        style={{
                          fontFamily: 'var(--bsk-font-sans)',
                          fontSize: 'var(--bsk-text-xs)',
                          letterSpacing: 'var(--bsk-tracking-widest)',
                          textTransform: 'uppercase',
                          color:
                            status === 'précommande'
                              ? 'var(--bsk-accent-gold)'
                              : 'var(--bsk-fg-secondary)',
                          marginTop: 'var(--bsk-space-2)',
                        }}
                      >
                        {status === 'précommande' ? 'PRÉCO' : 'À PARAÎTRE'}
                        {p.dateParution?.value
                          ? ` · ${new Date(p.dateParution.value).toLocaleDateString('fr-FR')}`
                          : ''}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          </Container>
        )}

        <Container width="content">
          <section style={{padding: 'var(--bsk-space-12) 0'}}>
            <h2
              style={{
                fontFamily: 'var(--bsk-font-serif)',
                fontSize: 'var(--bsk-text-xl)',
                textAlign: 'center',
                marginBottom: 'var(--bsk-space-6)',
                color: 'var(--bsk-fg-primary)',
              }}
            >
              Les valeurs de la maison
            </h2>
            <Ornament />
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                marginTop: 'var(--bsk-space-6)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--bsk-space-6)',
                textAlign: 'center',
              }}
            >
              {[
                {icon: '⚔', title: 'Héroïsme sans compromis'},
                {icon: '🏛', title: 'Mythes et racines'},
                {icon: '🇫🇷', title: 'Une voix française'},
                {icon: '✒', title: 'Indépendance éditoriale'},
              ].map((p) => (
                <li
                  key={p.title}
                  style={{padding: 'var(--bsk-space-5)'}}
                >
                  <div
                    style={{
                      fontSize: 'var(--bsk-text-2xl)',
                      marginBottom: 'var(--bsk-space-3)',
                    }}
                  >
                    {p.icon}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--bsk-font-serif)',
                      fontSize: 'var(--bsk-text-lg)',
                      color: 'var(--bsk-fg-primary)',
                    }}
                  >
                    {p.title}
                  </h3>
                </li>
              ))}
            </ul>
          </section>
        </Container>
      </>
    );
  }
  ```

  **Note :** la query `products(first: 50)` ramène tout le catalogue, on filtre côté JS pour standalones et upcoming. Plus simple et plus portable que les filters Shopify metafield-based qui ne sont pas tous supportés.

- [ ] **Step 2: Codegen + smoke test**

  ```bash
  cd storefront && npm run codegen && npm run dev
  ```

  Ouvrir `http://localhost:3000`. Vérifier :
  - Tagline « Des récits héroïques, sans compromis »
  - Slideshow horizontal montre les univers + standalones
  - Section « À paraître » liste les produits préco/annoncés
  - Section « Valeurs de la maison » avec les 4 piliers
  - Console browser : pas d'erreur

- [ ] **Step 3: Commit**

  ```bash
  git add app/routes/_index.tsx
  git commit -m "feat(home): refonte stand de libraire avec slideshow + à paraître + valeurs"
  ```

---

### Task 9: Refonte route `collections.$handle.tsx` (page univers)

Remplace le scaffold par : `UniverseHero` + sections par saga (`SagaSection`) ou grille flat si univers sans sagas.

**Files:**
- Modify: `storefront/app/routes/collections.$handle.tsx`

- [ ] **Step 1: Réécrire le fichier**

  ```tsx
  // storefront/app/routes/collections.$handle.tsx
  import {useLoaderData} from 'react-router';
  import type {Route} from './+types/collections.$handle';
  import {Container} from '~/components/Container';
  import {UniverseHero} from '~/components/UniverseHero';
  import {SagaSection} from '~/components/SagaSection';
  import {TomeCard} from '~/components/TomeCard';
  import {Ornament} from '~/components/Ornament';
  import {UNIVERSE_DETAIL_FRAGMENT} from '~/lib/fragments';
  import {
    metaobjectField,
    parseNumeroTome,
    parseStatutParution,
    richTextToPlain,
  } from '~/lib/tomeMetafields';

  export const meta: Route.MetaFunction = ({data}) => [
    {title: `${data?.collection.title ?? 'Univers'} — Bilskirnir`},
  ];

  const COLLECTION_QUERY = `#graphql
    query Collection($country: CountryCode, $language: LanguageCode, $handle: String!)
      @inContext(country: $country, language: $language) {
      collection(handle: $handle) {
        ...UniverseDetail
      }
    }
    ${UNIVERSE_DETAIL_FRAGMENT}
  ` as const;

  export async function loader({context, params}: Route.LoaderArgs) {
    const {handle} = params;
    if (!handle) throw new Response('Missing handle', {status: 400});
    const {collection} = await context.storefront.query(COLLECTION_QUERY, {
      variables: {handle},
    });
    if (!collection) throw new Response('Not found', {status: 404});
    return {collection};
  }

  type ProductNode = {
    id: string;
    handle: string;
    title: string;
    featuredImage: {url: string; altText: string | null; width: number; height: number} | null;
    priceRange: {minVariantPrice: {amount: string; currencyCode: string}};
    saga?: {reference: {handle: string} | null} | null;
    statutParution?: {value: string} | null;
    dateParution?: {value: string} | null;
    numeroTome?: {value: string} | null;
  };

  function toTomeCardProps(p: ProductNode) {
    const status = parseStatutParution(p.statutParution?.value);
    const fmt = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: p.priceRange.minVariantPrice.currencyCode,
    });
    return {
      handle: p.handle,
      title: p.title,
      cover: p.featuredImage
        ? {
            url: p.featuredImage.url,
            altText: p.featuredImage.altText ?? p.title,
            width: p.featuredImage.width,
            height: p.featuredImage.height,
          }
        : {url: '', altText: p.title, width: 400, height: 600},
      status,
      releaseDate: p.dateParution?.value ?? null,
      tomeNumber: parseNumeroTome(p.numeroTome?.value),
      priceFormatted: fmt.format(parseFloat(p.priceRange.minVariantPrice.amount)),
    };
  }

  export default function CollectionRoute() {
    const {collection} = useLoaderData<typeof loader>();
    const heroImage = collection.illustrationHero?.reference?.image
      ? {
          url: collection.illustrationHero.reference.image.url,
          altText:
            collection.illustrationHero.reference.image.altText ??
            collection.title,
          width: collection.illustrationHero.reference.image.width,
          height: collection.illustrationHero.reference.image.height,
        }
      : null;
    const themeColor = collection.couleurTheme?.value ?? null;
    const lore = richTextToPlain(collection.lore?.value);
    const sagas = collection.sagas?.references?.nodes ?? [];
    const products = collection.products.nodes as ProductNode[];

    const productsBySaga = new Map<string, ProductNode[]>();
    const standaloneProducts: ProductNode[] = [];
    for (const p of products) {
      const sagaHandle = p.saga?.reference?.handle;
      if (sagaHandle) {
        if (!productsBySaga.has(sagaHandle))
          productsBySaga.set(sagaHandle, []);
        productsBySaga.get(sagaHandle)!.push(p);
      } else {
        standaloneProducts.push(p);
      }
    }

    const stats = `${sagas.length > 0 ? `${sagas.length} sagas · ` : ''}${products.length} tomes`;

    return (
      <>
        <UniverseHero
          title={collection.title}
          heroImage={heroImage}
          themeColor={themeColor}
          lore={lore}
          stats={stats}
        />
        <Container width="content">
          {sagas.length > 0 ? (
            <>
              {sagas.map((saga: {id: string; handle: string; fields: Array<{key: string; value: string | null}>}, i: number) => {
                const nom = metaobjectField(saga.fields, 'nom') ?? '';
                const synopsis = richTextToPlain(metaobjectField(saga.fields, 'synopsis'));
                const tomes = (productsBySaga.get(saga.handle) ?? [])
                  .map(toTomeCardProps)
                  .sort((a, b) => (a.tomeNumber ?? 0) - (b.tomeNumber ?? 0));
                return (
                  <div key={saga.id}>
                    <SagaSection
                      nom={nom}
                      synopsis={synopsis}
                      tomes={tomes}
                    />
                    {i < sagas.length - 1 && <Ornament />}
                  </div>
                );
              })}
              {standaloneProducts.length > 0 && (
                <section style={{padding: 'var(--bsk-space-12) 0'}}>
                  <h2
                    style={{
                      fontFamily: 'var(--bsk-font-serif)',
                      fontSize: 'var(--bsk-text-xl)',
                      textAlign: 'center',
                      color: 'var(--bsk-fg-primary)',
                      marginBottom: 'var(--bsk-space-6)',
                    }}
                  >
                    Hors saga
                  </h2>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: 'var(--bsk-space-6)',
                    }}
                  >
                    {standaloneProducts.map(toTomeCardProps).map((t) => (
                      <TomeCard key={t.handle} {...t} />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <section style={{padding: 'var(--bsk-space-12) 0'}}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--bsk-space-6)',
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
      </>
    );
  }
  ```

- [ ] **Step 2: Codegen + smoke test**

  ```bash
  cd storefront && npm run codegen && npm run dev
  ```

  - `http://localhost:3000/collections/au-nom-des-dieux` → hero + section saga + grille tomes
  - `http://localhost:3000/collections/fracture` → hero typo bleu-gris + grille flat avec tome préco

- [ ] **Step 3: Commit**

  ```bash
  git add app/routes/collections.$handle.tsx
  git commit -m "feat(univers): page collection avec hero + sections sagas + grille fallback"
  ```

---

### Task 10: TomePageTemplate component (TDD)

Composant pur qui rend la fiche d'un tome standard. Reçoit toute la donnée en props. La route `products.$handle` lui passera la donnée + le `<TomeAddToCart>` rendu en children.

**Files:**
- Create: `storefront/app/components/TomePageTemplate.tsx`
- Test: `storefront/app/components/__tests__/TomePageTemplate.test.tsx`

- [ ] **Step 1: Write the failing test**

  ```tsx
  // storefront/app/components/__tests__/TomePageTemplate.test.tsx
  import {describe, it, expect} from 'vitest';
  import {screen} from '@testing-library/react';
  import {renderWithRouter} from '~/test/render';
  import {TomePageTemplate} from '../TomePageTemplate';

  const baseProps = {
    breadcrumbs: [
      {label: 'Accueil', href: '/'},
      {label: 'Au Nom des Dieux', href: '/collections/au-nom-des-dieux'},
      {label: 'Tome 1'},
    ],
    title: 'Le Sang Versé',
    teaserShort: 'Quand les dieux se taisent…',
    description: 'Synopsis long\n\nDeuxième paragraphe.',
    cover: {
      url: 'https://x/c.jpg',
      altText: 'Le Sang Versé',
      width: 400,
      height: 600,
    },
    status: 'publié' as const,
    universe: {handle: 'au-nom-des-dieux', title: 'Au Nom des Dieux'},
    purchaseSlot: <div data-testid="purchase">CTA</div>,
  };

  describe('TomePageTemplate', () => {
    it('rend le breadcrumb avec les bons liens', () => {
      renderWithRouter(<TomePageTemplate {...baseProps} />);
      expect(screen.getByRole('link', {name: 'Accueil'})).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', {name: 'Au Nom des Dieux'})).toHaveAttribute(
        'href',
        '/collections/au-nom-des-dieux',
      );
    });

    it('rend titre + teaser + couverture', () => {
      renderWithRouter(<TomePageTemplate {...baseProps} />);
      expect(screen.getByRole('heading', {name: 'Le Sang Versé'})).toBeInTheDocument();
      expect(screen.getByText(/dieux se taisent/)).toBeInTheDocument();
      expect(screen.getByAltText('Le Sang Versé')).toBeInTheDocument();
    });

    it('monte le purchaseSlot', () => {
      renderWithRouter(<TomePageTemplate {...baseProps} />);
      expect(screen.getByTestId('purchase')).toBeInTheDocument();
    });

    it('rend le synopsis pleine largeur en plain text', () => {
      renderWithRouter(<TomePageTemplate {...baseProps} />);
      expect(screen.getByText(/Synopsis long/)).toBeInTheDocument();
      expect(screen.getByText(/Deuxième paragraphe/)).toBeInTheDocument();
    });

    it('rend le bloc "Dans l\'univers de"', () => {
      renderWithRouter(<TomePageTemplate {...baseProps} />);
      expect(screen.getByText(/Dans l'univers de Au Nom des Dieux/)).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 2: Run — expect failures**

- [ ] **Step 3: Implement**

  ```tsx
  // storefront/app/components/TomePageTemplate.tsx
  import {Link} from 'react-router';
  import type {ReactNode} from 'react';
  import {Container} from './Container';
  import {Ornament} from './Ornament';
  import type {CoverImage} from './WorkTile';
  import type {ReleaseStatus} from './ReleaseStatusBadge';

  export interface BreadcrumbItem {
    label: string;
    href?: string;
  }

  export interface TomePageTemplateProps {
    breadcrumbs: BreadcrumbItem[];
    title: string;
    teaserShort?: string | null;
    description: string;
    cover: CoverImage;
    status: ReleaseStatus;
    universe: {handle: string; title: string};
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
          letterSpacing: 'var(--bsk-tracking-wide)',
          textTransform: 'uppercase',
          color: 'var(--bsk-fg-secondary)',
          padding: 'var(--bsk-space-5) 0',
        }}
      >
        {items.map((item, i) => (
          <span key={i}>
            {item.href ? (
              <Link
                to={item.href}
                style={{
                  color: 'var(--bsk-fg-secondary)',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{color: 'var(--bsk-fg-primary)'}}>{item.label}</span>
            )}
            {i < items.length - 1 && (
              <span style={{margin: '0 var(--bsk-space-2)'}}> › </span>
            )}
          </span>
        ))}
      </nav>
    );
  }

  export function TomePageTemplate({
    breadcrumbs,
    title,
    teaserShort,
    description,
    cover,
    universe,
    purchaseSlot,
    relatedSlot,
  }: TomePageTemplateProps) {
    return (
      <>
        <Container width="content">
          <Breadcrumbs items={breadcrumbs} />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '55fr 45fr',
              gap: 'var(--bsk-space-10)',
              alignItems: 'start',
              padding: 'var(--bsk-space-6) 0 var(--bsk-space-12)',
            }}
          >
            <div>
              <img
                src={cover.url}
                alt={cover.altText}
                width={cover.width}
                height={cover.height}
                style={{
                  width: '100%',
                  height: 'auto',
                  boxShadow: 'var(--bsk-shadow-cover)',
                  borderRadius: '2px',
                }}
              />
            </div>
            <div>
              <h1
                style={{
                  fontFamily: 'var(--bsk-font-serif)',
                  fontSize: 'var(--bsk-text-2xl)',
                  color: 'var(--bsk-fg-primary)',
                  letterSpacing: 'var(--bsk-tracking-tight)',
                  marginBottom: 'var(--bsk-space-5)',
                }}
              >
                {title}
              </h1>
              {teaserShort && (
                <blockquote
                  style={{
                    fontFamily: 'var(--bsk-font-serif)',
                    fontStyle: 'italic',
                    fontSize: 'var(--bsk-text-md)',
                    color: 'var(--bsk-fg-secondary)',
                    borderLeft: '2px solid var(--bsk-accent-gold)',
                    padding: 'var(--bsk-space-3) var(--bsk-space-5)',
                    margin: '0 0 var(--bsk-space-6)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {teaserShort}
                </blockquote>
              )}
              <div>{purchaseSlot}</div>
            </div>
          </div>
        </Container>

        <Container width="reading">
          <section
            style={{
              padding: 'var(--bsk-space-10) 0',
              fontFamily: 'var(--bsk-font-serif)',
              fontSize: 'var(--bsk-text-md)',
              lineHeight: 1.7,
              color: 'var(--bsk-fg-primary)',
              whiteSpace: 'pre-line',
            }}
          >
            {description}
          </section>
        </Container>

        <Container width="content">
          <section
            style={{
              padding: 'var(--bsk-space-10) 0',
              textAlign: 'center',
            }}
          >
            <Ornament />
            <h2
              style={{
                fontFamily: 'var(--bsk-font-serif)',
                fontSize: 'var(--bsk-text-xl)',
                color: 'var(--bsk-fg-primary)',
                margin: 'var(--bsk-space-5) 0',
              }}
            >
              Dans l'univers de {universe.title}
            </h2>
            <Link
              to={`/collections/${universe.handle}`}
              style={{
                color: 'var(--bsk-accent-gold)',
                fontFamily: 'var(--bsk-font-sans)',
                fontSize: 'var(--bsk-text-sm)',
                letterSpacing: 'var(--bsk-tracking-wide)',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Explorer l'univers complet →
            </Link>
          </section>
        </Container>

        {relatedSlot && <Container width="content">{relatedSlot}</Container>}
      </>
    );
  }
  ```

- [ ] **Step 4: Run — expect passes**

- [ ] **Step 5: Commit**

  ```bash
  git add app/components/TomePageTemplate.tsx app/components/__tests__/TomePageTemplate.test.tsx
  git commit -m "feat(ui): TomePageTemplate with breadcrumb, 55/45 layout, synopsis section"
  ```

---

### Task 11: OneShotPageTemplate component (TDD)

Variante immersive : hero bannière 380px (comme une page univers, mais pour 1 livre) + bloc achat compact en dessous + section « Atmosphère du livre » au lieu de « Dans l'univers de ».

**Files:**
- Create: `storefront/app/components/OneShotPageTemplate.tsx`
- Test: `storefront/app/components/__tests__/OneShotPageTemplate.test.tsx`

- [ ] **Step 1: Write the failing test**

  ```tsx
  // storefront/app/components/__tests__/OneShotPageTemplate.test.tsx
  import {describe, it, expect} from 'vitest';
  import {screen} from '@testing-library/react';
  import {renderWithRouter} from '~/test/render';
  import {OneShotPageTemplate} from '../OneShotPageTemplate';

  const baseProps = {
    title: 'Berserker',
    teaserShort: "Nice, été. La chaleur est la même qu'avant.",
    description: 'Atmosphere du livre.\n\nUn huis-clos.',
    cover: {
      url: 'https://x/c.jpg',
      altText: 'Berserker',
      width: 400,
      height: 600,
    },
    pillLabel: 'ROMAN' as const,
    purchaseSlot: <div data-testid="purchase">CTA</div>,
  };

  describe('OneShotPageTemplate', () => {
    it('rend la pastille typée', () => {
      renderWithRouter(<OneShotPageTemplate {...baseProps} />);
      expect(screen.getByText(/ROMAN INDÉPENDANT/)).toBeInTheDocument();
    });

    it('rend titre, teaser, cover, purchase', () => {
      renderWithRouter(<OneShotPageTemplate {...baseProps} />);
      expect(screen.getByRole('heading', {name: 'Berserker'})).toBeInTheDocument();
      expect(screen.getByText(/chaleur/)).toBeInTheDocument();
      expect(screen.getByAltText('Berserker')).toBeInTheDocument();
      expect(screen.getByTestId('purchase')).toBeInTheDocument();
    });

    it('rend le synopsis dans la section atmosphère', () => {
      renderWithRouter(<OneShotPageTemplate {...baseProps} />);
      expect(screen.getByText(/Atmosphere du livre/)).toBeInTheDocument();
      expect(screen.getByText(/L'atmosphère du livre/)).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 2: Run — expect failures**

- [ ] **Step 3: Implement**

  ```tsx
  // storefront/app/components/OneShotPageTemplate.tsx
  import type {ReactNode} from 'react';
  import {Container} from './Container';
  import {Ornament} from './Ornament';
  import type {CoverImage} from './WorkTile';

  export interface OneShotPageTemplateProps {
    title: string;
    teaserShort?: string | null;
    description: string;
    cover: CoverImage;
    pillLabel: 'ROMAN' | 'RECUEIL' | 'GUIDE';
    purchaseSlot: ReactNode;
    relatedSlot?: ReactNode;
  }

  export function OneShotPageTemplate({
    title,
    teaserShort,
    description,
    cover,
    pillLabel,
    purchaseSlot,
    relatedSlot,
  }: OneShotPageTemplateProps) {
    return (
      <>
        <section
          style={{
            position: 'relative',
            minHeight: '380px',
            padding: 'var(--bsk-space-12) var(--bsk-space-5)',
            background: 'var(--bsk-bg-gradient-warm)',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              fontFamily: 'var(--bsk-font-sans)',
              fontSize: 'var(--bsk-text-xs)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-bg-base)',
              background: 'var(--bsk-accent-gold)',
              padding: 'var(--bsk-space-1) var(--bsk-space-3)',
              marginBottom: 'var(--bsk-space-5)',
            }}
          >
            {pillLabel} INDÉPENDANT
          </span>
          <h1
            style={{
              fontFamily: 'var(--bsk-font-serif)',
              fontSize: 'var(--bsk-text-3xl)',
              color: 'var(--bsk-fg-primary)',
              letterSpacing: 'var(--bsk-tracking-tight)',
              marginBottom: 'var(--bsk-space-5)',
            }}
          >
            {title}
          </h1>
          {teaserShort && (
            <p
              style={{
                fontFamily: 'var(--bsk-font-serif)',
                fontStyle: 'italic',
                fontSize: 'var(--bsk-text-md)',
                color: 'var(--bsk-fg-secondary)',
                maxWidth: 'var(--bsk-width-reading)',
                margin: '0 auto',
                whiteSpace: 'pre-line',
              }}
            >
              {teaserShort}
            </p>
          )}
        </section>

        <Container width="content">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '45fr 55fr',
              gap: 'var(--bsk-space-10)',
              alignItems: 'start',
              padding: 'var(--bsk-space-10) 0',
            }}
          >
            <img
              src={cover.url}
              alt={cover.altText}
              width={cover.width}
              height={cover.height}
              style={{
                width: '100%',
                height: 'auto',
                boxShadow: 'var(--bsk-shadow-cover)',
                borderRadius: '2px',
              }}
            />
            <div>{purchaseSlot}</div>
          </div>
        </Container>

        <Container width="content">
          <section
            style={{
              padding: 'var(--bsk-space-10) 0',
              textAlign: 'center',
            }}
          >
            <Ornament />
            <h2
              style={{
                fontFamily: 'var(--bsk-font-serif)',
                fontSize: 'var(--bsk-text-xl)',
                color: 'var(--bsk-fg-primary)',
                margin: 'var(--bsk-space-5) 0',
              }}
            >
              L'atmosphère du livre
            </h2>
          </section>
        </Container>

        <Container width="reading">
          <div
            style={{
              padding: '0 0 var(--bsk-space-12)',
              fontFamily: 'var(--bsk-font-serif)',
              fontSize: 'var(--bsk-text-md)',
              lineHeight: 1.7,
              color: 'var(--bsk-fg-primary)',
              whiteSpace: 'pre-line',
            }}
          >
            {description}
          </div>
        </Container>

        {relatedSlot && <Container width="content">{relatedSlot}</Container>}
      </>
    );
  }
  ```

- [ ] **Step 4: Run — expect passes**

- [ ] **Step 5: Commit**

  ```bash
  git add app/components/OneShotPageTemplate.tsx app/components/__tests__/OneShotPageTemplate.test.tsx
  git commit -m "feat(ui): OneShotPageTemplate with hero banner + atmosphere section"
  ```

---

### Task 12: DedicaceField + TomeAddToCart components (TDD)

`DedicaceField` = checkbox « Dédicacer ce livre » qui déplie un input texte. Émet `(activated, name)` au parent.

`TomeAddToCart` = wrapper autour de `CartForm` qui :
- Lit le statut tome → bouton « Ajouter au panier » (publié), « Précommander » (préco) ou bloc « Bientôt disponible » (annoncé)
- Inclut DedicaceField (publié + préco uniquement)
- Pose les line item properties `_dedicace_activee` / `Dédicace` quand activée

**Files:**
- Create: `storefront/app/components/DedicaceField.tsx`
- Create: `storefront/app/components/TomeAddToCart.tsx`
- Test: `storefront/app/components/__tests__/DedicaceField.test.tsx`

- [ ] **Step 1: Write DedicaceField test**

  ```tsx
  // storefront/app/components/__tests__/DedicaceField.test.tsx
  import {describe, it, expect, vi} from 'vitest';
  import {render, screen, fireEvent} from '@testing-library/react';
  import {DedicaceField} from '../DedicaceField';

  describe('DedicaceField', () => {
    it('checkbox unchecked par défaut, input caché', () => {
      render(<DedicaceField onChange={() => {}} />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
      expect(screen.queryByPlaceholderText(/à qui dédicacer/i)).not.toBeInTheDocument();
    });

    it('toggle checkbox affiche l\'input', () => {
      render(<DedicaceField onChange={() => {}} />);
      fireEvent.click(screen.getByRole('checkbox'));
      expect(screen.getByPlaceholderText(/à qui dédicacer/i)).toBeInTheDocument();
    });

    it('émet onChange avec activated + name', () => {
      const onChange = vi.fn();
      render(<DedicaceField onChange={onChange} />);
      fireEvent.click(screen.getByRole('checkbox'));
      expect(onChange).toHaveBeenLastCalledWith({activated: true, name: ''});
      fireEvent.change(screen.getByPlaceholderText(/à qui dédicacer/i), {
        target: {value: 'Marie'},
      });
      expect(onChange).toHaveBeenLastCalledWith({activated: true, name: 'Marie'});
    });
  });
  ```

- [ ] **Step 2: Implement DedicaceField**

  ```tsx
  // storefront/app/components/DedicaceField.tsx
  import {useState, useEffect} from 'react';

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

    useEffect(() => {
      onChange({activated, name});
    }, [activated, name, onChange]);

    return (
      <div
        style={{
          padding: 'var(--bsk-space-4) 0',
          borderTop: '1px solid var(--bsk-border-subtle)',
          borderBottom: '1px solid var(--bsk-border-subtle)',
          margin: 'var(--bsk-space-5) 0',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--bsk-space-3)',
            fontFamily: 'var(--bsk-font-sans)',
            fontSize: 'var(--bsk-text-sm)',
            color: 'var(--bsk-fg-primary)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={activated}
            onChange={(e) => setActivated(e.target.checked)}
          />
          <span>Dédicacer ce livre</span>
          <span
            style={{
              color: 'var(--bsk-fg-secondary)',
              fontSize: 'var(--bsk-text-xs)',
              letterSpacing: 'var(--bsk-tracking-wide)',
              textTransform: 'uppercase',
            }}
          >
            Gratuit
          </span>
        </label>
        {activated && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="À qui dédicacer ?"
            style={{
              display: 'block',
              width: '100%',
              padding: 'var(--bsk-space-3)',
              marginTop: 'var(--bsk-space-3)',
              background: 'var(--bsk-bg-raised)',
              border: '1px solid var(--bsk-border-subtle)',
              color: 'var(--bsk-fg-primary)',
              fontFamily: 'var(--bsk-font-sans)',
              fontSize: 'var(--bsk-text-sm)',
              borderRadius: '2px',
            }}
          />
        )}
      </div>
    );
  }
  ```

- [ ] **Step 3: Run DedicaceField tests — expect passes**

- [ ] **Step 4: Implement TomeAddToCart**

  ```tsx
  // storefront/app/components/TomeAddToCart.tsx
  import {useState, useCallback} from 'react';
  import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
  import {DedicaceField, type DedicaceState} from './DedicaceField';
  import type {ReleaseStatus} from './ReleaseStatusBadge';

  export interface TomeAddToCartProps {
    variantId: string;
    available: boolean;
    status: ReleaseStatus;
    priceFormatted: string;
    releaseDate?: string | null;
  }

  export function TomeAddToCart({
    variantId,
    available,
    status,
    priceFormatted,
    releaseDate,
  }: TomeAddToCartProps) {
    const [dedicace, setDedicace] = useState<DedicaceState>({
      activated: false,
      name: '',
    });
    const handleDedicaceChange = useCallback((s: DedicaceState) => setDedicace(s), []);

    if (status === 'annoncé') {
      return (
        <div
          style={{
            padding: 'var(--bsk-space-5)',
            border: '1px solid var(--bsk-border-subtle)',
            background: 'var(--bsk-bg-raised)',
            borderRadius: '2px',
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
          <p
            style={{
              fontFamily: 'var(--bsk-font-serif)',
              fontStyle: 'italic',
              color: 'var(--bsk-fg-secondary)',
            }}
          >
            Ce titre est annoncé sans date de sortie. Le formulaire de
            notification sera disponible prochainement.
          </p>
        </div>
      );
    }

    const ctaLabel =
      status === 'précommande' ? 'Précommander' : 'Ajouter au panier';

    const lineAttributes: Array<{key: string; value: string}> = [];
    if (dedicace.activated) {
      lineAttributes.push({key: '_dedicace_activee', value: 'true'});
      if (dedicace.name.trim()) {
        lineAttributes.push({key: 'Dédicace', value: dedicace.name.trim()});
      }
    }

    const lines: OptimisticCartLineInput[] = [
      {
        merchandiseId: variantId,
        quantity: 1,
        attributes: lineAttributes,
      },
    ];

    return (
      <div>
        <p
          style={{
            fontFamily: 'var(--bsk-font-serif)',
            fontSize: 'var(--bsk-text-2xl)',
            color: 'var(--bsk-fg-primary)',
            marginBottom: 'var(--bsk-space-4)',
          }}
        >
          {priceFormatted}
        </p>
        {status === 'précommande' && releaseDate && (
          <p
            style={{
              fontFamily: 'var(--bsk-font-sans)',
              fontSize: 'var(--bsk-text-sm)',
              color: 'var(--bsk-accent-gold)',
              marginBottom: 'var(--bsk-space-4)',
              letterSpacing: 'var(--bsk-tracking-wide)',
            }}
          >
            Sortie prévue : {new Date(releaseDate).toLocaleDateString('fr-FR')}
          </p>
        )}
        <DedicaceField onChange={handleDedicaceChange} />
        <CartForm
          route="/cart"
          inputs={{lines}}
          action={CartForm.ACTIONS.LinesAdd}
        >
          {(fetcher) => (
            <button
              type="submit"
              disabled={!available || fetcher.state !== 'idle'}
              style={{
                width: '100%',
                padding: 'var(--bsk-space-4)',
                fontFamily: 'var(--bsk-font-sans)',
                fontSize: 'var(--bsk-text-sm)',
                fontWeight: 'var(--bsk-weight-semibold)',
                letterSpacing: 'var(--bsk-tracking-widest)',
                textTransform: 'uppercase',
                color: 'var(--bsk-bg-base)',
                background: available
                  ? 'var(--bsk-accent-gold)'
                  : 'var(--bsk-fg-muted)',
                border: 'none',
                borderRadius: '2px',
                cursor: available ? 'pointer' : 'not-allowed',
              }}
            >
              {fetcher.state !== 'idle' ? '…' : ctaLabel}
            </button>
          )}
        </CartForm>
      </div>
    );
  }
  ```

- [ ] **Step 5: Run all tests**

  ```bash
  cd storefront && npm test
  ```

  Tous verts.

- [ ] **Step 6: Commit**

  ```bash
  git add app/components/DedicaceField.tsx app/components/TomeAddToCart.tsx app/components/__tests__/DedicaceField.test.tsx
  git commit -m "feat(commerce): TomeAddToCart with status-aware CTA + free dedicace line item"
  ```

---

### Task 13: Refonte route `products.$handle.tsx` (switch tome / one-shot)

La route choisit le bon template selon `est_une_oeuvre_independante`. Toute la donnée passe par les templates en plain text.

**Files:**
- Modify: `storefront/app/routes/products.$handle.tsx`

- [ ] **Step 1: Réécrire complètement le fichier**

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
  import {TomePageTemplate} from '~/components/TomePageTemplate';
  import {OneShotPageTemplate} from '~/components/OneShotPageTemplate';
  import {TomeAddToCart} from '~/components/TomeAddToCart';

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
      selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
        ...ProductVariant
      }
      adjacentVariants(selectedOptions: $selectedOptions) {
        ...ProductVariant
      }
      ...TomeMetafields
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
    }
    ${PRODUCT_FRAGMENT}
  ` as const;

  export async function loader({context, params, request}: Route.LoaderArgs) {
    const {handle} = params;
    if (!handle) throw new Error('Expected product handle');
    const {product} = await context.storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    });
    if (!product?.id) throw new Response(null, {status: 404});
    redirectIfHandleIsLocalized(request, {handle, data: product});
    return {product};
  }

  export default function ProductRoute() {
    const {product} = useLoaderData<typeof loader>();
    const selectedVariant = useOptimisticVariant(
      product.selectedOrFirstAvailableVariant,
      getAdjacentAndFirstAvailableVariants(product),
    );

    const isStandalone = parseBool(product.estUneOeuvreIndependante?.value);
    const status = parseStatutParution(product.statutParution?.value);
    const fmt = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: selectedVariant?.price.currencyCode ?? 'EUR',
    });
    const priceFormatted = fmt.format(
      parseFloat(selectedVariant?.price.amount ?? '0'),
    );

    const cover = product.featuredImage
      ? {
          url: product.featuredImage.url,
          altText: product.featuredImage.altText ?? product.title,
          width: product.featuredImage.width,
          height: product.featuredImage.height,
        }
      : {url: '', altText: product.title, width: 400, height: 600};

    // Use plain `description` field (Shopify natural plain-text output) instead
    // of `descriptionHtml` to avoid any HTML injection. If Gautier later wants
    // formatted rich text in the synopsis, Plan 3+ will add a renderer.
    const description = product.description ?? '';

    const purchase = (
      <TomeAddToCart
        variantId={selectedVariant?.id ?? ''}
        available={selectedVariant?.availableForSale ?? false}
        status={status}
        priceFormatted={priceFormatted}
        releaseDate={product.dateParution?.value ?? null}
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
      return (
        <>
          <OneShotPageTemplate
            title={product.title}
            teaserShort={product.teaserCourt?.value ?? null}
            description={description}
            cover={cover}
            pillLabel="ROMAN"
            purchaseSlot={purchase}
          />
          {analytics}
        </>
      );
    }

    const universe = product.univers?.reference;
    const breadcrumbs = [
      {label: 'Accueil', href: '/'},
      ...(universe
        ? [{label: universe.title, href: `/collections/${universe.handle}`}]
        : []),
      {label: product.title},
    ];

    return (
      <>
        <TomePageTemplate
          breadcrumbs={breadcrumbs}
          title={product.title}
          teaserShort={product.teaserCourt?.value ?? null}
          description={description}
          cover={cover}
          status={status}
          universe={universe ?? {handle: '', title: '—'}}
          purchaseSlot={purchase}
        />
        {analytics}
      </>
    );
  }
  ```

- [ ] **Step 2: Codegen + smoke test**

  ```bash
  cd storefront && npm run codegen && npm run dev
  ```

  Visiter dans le browser :
  - `/products/le-sang-verse` (ou autre tome de Au Nom des Dieux) → fiche tome avec breadcrumb + 55/45 + dédicace + bouton AAP
  - `/products/berserker` → page immersive avec hero + « ROMAN INDÉPENDANT »
  - `/products/[fracture-tome-1]` → bouton « Précommander » + date de sortie
  - `/products/[crepuscule-tome-1]` → bloc « À paraître » sans bouton

- [ ] **Step 3: Vérifier que le panier reçoit la dédicace**

  Sur une fiche tome publiée, cocher « Dédicacer ce livre », saisir « Marie », cliquer « Ajouter au panier ». Aller sur `/cart`. La ligne doit afficher l'attribut `Dédicace: Marie`. (Le drawer cart sera câblé Task 14.)

- [ ] **Step 4: Commit**

  ```bash
  git add app/routes/products.$handle.tsx
  git commit -m "feat(product): switch tome/one-shot template + status-aware CTA + dedicace line item"
  ```

---

### Task 14: Cart drawer wiring (Aside dans root, useAside hook, header trigger)

Le scaffold inclut `app/components/Aside.tsx` mais n'est pas monté dans `root.tsx`. On monte un drawer `cart` qui affiche `<CartMain>`, et on relie le bouton « Panier » du Header.

**Files:**
- Modify: `storefront/app/root.tsx`
- Modify: `storefront/app/components/Header.tsx`
- Modify (si besoin): `storefront/app/components/__tests__/Header.test.tsx`

- [ ] **Step 1: Inspecter `Aside.tsx`**

  ```bash
  cd storefront && grep -E "(Provider|useAside|export)" app/components/Aside.tsx
  ```

  Si `Aside.Provider` et `useAside` sont déjà exportés (cas usuel du scaffold Hydrogen) → continuer Step 2. Sinon, le scaffold a une variante : adapter en wrappant `Aside` avec un `useState` local pour `openType` et exposer `{type, open, close}` via context. Comportement attendu : `open('cart')` → drawer cart, `close()` → fermé.

- [ ] **Step 2: Modifier root.tsx**

  Dans `app/root.tsx`, ajouter en haut les imports :

  ```tsx
  import {Aside} from '~/components/Aside';
  import {CartMain} from '~/components/CartMain';
  ```

  Et remplacer le retour du composant `App` par :

  ```tsx
  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <Aside.Provider>
        <Suspense
          fallback={<Header universes={universes} cartCount={0} />}
        >
          <Await resolve={data.cart}>
            {(cart) => (
              <Header
                universes={universes}
                cartCount={cart?.totalQuantity ?? 0}
              />
            )}
          </Await>
        </Suspense>
        <main>
          <Outlet />
        </main>
        <Footer />
        <Suspense fallback={null}>
          <Await resolve={data.cart}>
            {(cart) =>
              cart ? (
                <Aside type="cart" heading="Panier">
                  <CartMain layout="aside" cart={cart} />
                </Aside>
              ) : null
            }
          </Await>
        </Suspense>
      </Aside.Provider>
    </Analytics.Provider>
  );
  ```

- [ ] **Step 3: Câbler le bouton panier dans Header**

  Ouvrir `app/components/Header.tsx`. Importer `useAside` :

  ```tsx
  import {useAside} from './Aside';
  ```

  Remplacer le lien `Panier` existant par un bouton qui ouvre le drawer. Adapter au markup existant — exemple :

  ```tsx
  function CartTrigger({count}: {count: number}) {
    const {open} = useAside();
    return (
      <button
        type="button"
        onClick={() => open('cart')}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--bsk-accent-gold)',
          fontFamily: 'var(--bsk-font-sans)',
          fontSize: 'var(--bsk-text-sm)',
          letterSpacing: 'var(--bsk-tracking-wide)',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        Panier ({count})
      </button>
    );
  }
  ```

  Utiliser `<CartTrigger count={cartCount} />` dans le rendu Header à la place du lien existant.

- [ ] **Step 4: Mettre à jour les tests Header si nécessaire**

  Si `Header.test.tsx` testait `<a href="/cart">`, remplacer l'assertion :

  ```tsx
  // Avant
  expect(screen.getByRole('link', {name: /panier/i})).toBeInTheDocument();
  // Après
  expect(screen.getByRole('button', {name: /panier/i})).toBeInTheDocument();
  ```

  **Note** : le test Header doit maintenant être wrappé dans `<Aside.Provider>` puisque `useAside` est appelé. Adapter le helper `renderWithRouter` ou wrapper localement dans le test.

- [ ] **Step 5: Smoke test cart drawer**

  ```bash
  cd storefront && npm run dev
  ```

  - Aller sur `/products/[un-tome]`, cliquer « Ajouter au panier »
  - Cliquer « Panier (1) » dans le header → drawer s'ouvre
  - Vérifier que la ligne affiche le titre + prix + bouton retirer
  - Cliquer en dehors → drawer ferme
  - Si dédicace cochée à l'achat → la propriété s'affiche dans la ligne du drawer

- [ ] **Step 6: Run tests**

  ```bash
  cd storefront && npm test
  ```

  Tous verts.

- [ ] **Step 7: Commit**

  ```bash
  git add app/root.tsx app/components/Header.tsx app/components/__tests__/Header.test.tsx
  git commit -m "feat(cart): mount Aside drawer + cart button trigger via useAside"
  ```

---

### Task 15: Sanity check end-to-end + deploy

Vérification visuelle complète + déploiement Oxygen.

**Files:** None (manuel + deploy command).

- [ ] **Step 1: Lancer dev server propre**

  ```bash
  cd storefront && npm run dev
  ```

- [ ] **Step 2: Parcourir le site selon ce checklist**

  - [ ] Homepage `/` : tagline + slideshow + à paraître + valeurs
  - [ ] Mega-menu Header : clic « Univers » → liste correcte
  - [ ] `/collections/au-nom-des-dieux` : hero + saga « L'Eau et du Sang » + grille tomes
  - [ ] `/collections/fracture` : hero typo bleu-gris + grille flat avec tome préco
  - [ ] `/collections/romans-independants` : grille standalone (Berserker)
  - [ ] `/products/[un-tome-publié]` : breadcrumb · 55/45 · teaser sidebar · dédicace · AAP · synopsis · « Dans l'univers de »
  - [ ] `/products/berserker` : hero immersif · pastille `ROMAN INDÉPENDANT` · 45/55 · synopsis « atmosphère »
  - [ ] `/products/[fracture-t1]` : bouton « Précommander » + date · ajout au panier OK
  - [ ] `/products/[crepuscule-t1]` : bloc « À paraître » non interactif
  - [ ] Dédicace : cocher → input apparaît · saisir « Marie » · AAP · drawer affiche `Dédicace: Marie`
  - [ ] Cart drawer : Header bouton ouvre · click outside ferme · update qty · checkout button visible
  - [ ] Page `/pages/la-maison` (du Plan 1) : toujours fonctionnelle
  - [ ] Browser console : 0 erreur JS

- [ ] **Step 3: Run all tests**

  ```bash
  npm test
  ```

  Tous verts.

- [ ] **Step 4: Build**

  ```bash
  npm run build
  ```

  Pas d'erreur de type, pas d'erreur de bundle.

- [ ] **Step 5: Deploy Oxygen**

  ```bash
  npx shopify hydrogen deploy
  ```

  Choisir l'environnement Production. Récupérer l'URL retournée.

- [ ] **Step 6: Vérifier le déploiement**

  Ouvrir l'URL Oxygen renvoyée par le deploy. Refaire un scan rapide du checklist de Step 2 sur prod.

- [ ] **Step 7: Mettre à jour `docs/deployments.md`**

  Ajouter la date du nouveau deploy avec la note « Plan 2 — Catalogue navigable ». Pas de nouveau env, juste un nouveau record dans le tableau.

- [ ] **Step 8: Commit final**

  ```bash
  git add docs/deployments.md
  git commit -m "docs: record Plan 2 catalogue deploy"
  ```

---

## Self-review

**Spec coverage check:**

| Spec section | Couvert par |
|---|---|
| §7.1 Homepage stand | Task 8 |
| §7.2 Page univers | Task 9 |
| §7.3 Fiche tome | Tasks 10 + 13 |
| §7.4 Fiche one-shot immersive | Tasks 11 + 13 |
| §5.4 Dédicace gratuite UI | Tasks 12 + 13 |
| §4.4 Statuts publié/préco/annoncé | Tasks 2 + 12 + 13 |
| §6.1 Dark mode + couvertures flottantes | Tokens existants + Tasks 3-6 |
| §6.1 Ornements `◈ ◈ ◈` | Réutilise Plan 1 `Ornament` (Tasks 6, 8, 10, 11) |
| Cart drawer + Add to cart | Tasks 12 + 14 |

**Hors scope confirmé Plan 3+ :** bundles sagas (CTA `bundleHref` réservé mais jamais fourni), précommande Preorder Manager (cart add standard utilisé v1), notify-me (placeholder annoncé), goodies dérivés sur page univers, rich text rendering (gras/listes).

**Hypothèses à valider pendant l'exécution :**
1. Si `Aside.Provider`/`useAside` n'existent pas dans le scaffold (variantes Hydrogen 2025.x), Task 14 Step 1 explique comment adapter.
2. Si Gautier n'a pas encore enrichi les sample data, Task 1 reste un blocker — le reste du plan tourne mais la home affiche peu.
3. La query `products(first: 50)` de la home ramène tout et filtre côté JS pour rester portable, plutôt que d'utiliser des filters metafield-based qui ne sont pas tous supportés sur tous les comptes Shopify.

---

## Execution

Plan complet et sauvegardé dans `docs/superpowers/plans/2026-04-28-bilskirnir-catalogue.md`. Deux options pour l'exécuter :

1. **Subagent-driven (recommandé)** — un subagent dispatché par tâche, review entre chaque tâche, isolation propre.
2. **Inline execution** — exécution dans cette session avec checkpoints batch.

Lequel veux-tu ?
