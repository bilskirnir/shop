---
title: Bilskirnir — Plan 1 · Foundation
date: 2026-04-23
status: ready
parent_spec: docs/superpowers/specs/2026-04-23-bilskirnir-shop-design.md
---

# Bilskirnir Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a deployable Hydrogen storefront skeleton with Shopify backend wired up, dark-mode design tokens, global navigation (header/mega-menu/footer), and a working « La maison » page — the foundation every subsequent plan will build on.

**Architecture:** Shopify Plus-grade backend (metaobjects + metafields) + Hydrogen 2025.x storefront (React Router v7 on Oxygen edge). Design system is vanilla CSS custom properties (no Tailwind — keeps the design language honest to the brand). Components are tested with Vitest + Testing Library; integration is verified in a browser against real Shopify data.

**Tech Stack:**
- Shopify (Basic plan) — admin, metaobjects, storefront API
- Hydrogen 2025.x (React Router v7) — storefront framework
- Oxygen — edge hosting
- TypeScript, Vitest, @testing-library/react
- Fonts: Cormorant Garamond (display serif) + Inter (sans) via `@fontsource`

**Out of scope for this plan (covered in Plan 2+):** Homepage content, page univers, fiche tome, fiche one-shot, dédicace, précommande, notify-me, bundles.

---

## Prerequisites (check before starting)

- [ ] Node.js ≥ 20.11 (`node --version`)
- [ ] A Shopify store — plan **Basic** minimum, with Shop Pay enabled. If the store doesn't exist yet, Gautier must create it at `bilskirnir.myshopify.com` (or similar) before Task 1.
- [ ] Admin access with permission to edit metaobjects, metafields, collections, products
- [ ] Storefront API access token created (Shopify admin → Apps → Develop apps → Create app → Configure Storefront API scopes → `unauthenticated_read_product_listings`, `unauthenticated_read_product_inventory`, `unauthenticated_read_customers`, `unauthenticated_read_metaobjects`, `unauthenticated_read_content`, `unauthenticated_read_selling_plans`)

---

## File Structure

After this plan, the repo layout will be:

```
bilskirnir/
├── .env                         # created by Task 4, gitignored
├── .env.example                 # committed template
├── .gitignore                   # updated by Task 3
├── docs/superpowers/            # existing
├── .superpowers/                # existing
├── package.json                 # Hydrogen scaffold
├── server.ts                    # Hydrogen scaffold — Oxygen worker entry
├── vite.config.ts               # Hydrogen scaffold
├── tsconfig.json                # Hydrogen scaffold
├── vitest.config.ts             # Task 5 — test runner
└── app/
    ├── root.tsx                 # scaffold, modified Task 13
    ├── entry.client.tsx         # scaffold default
    ├── entry.server.tsx         # scaffold default
    ├── lib/
    │   ├── context.ts           # scaffold — Hydrogen context
    │   ├── session.ts           # scaffold
    │   └── fragments.ts         # scaffold — cart fragment
    ├── styles/
    │   ├── tokens.css           # Task 6 — design tokens
    │   └── global.css           # Task 7 — resets + typography
    ├── components/
    │   ├── Ornament.tsx         # Task 8
    │   ├── Container.tsx        # Task 9
    │   ├── MegaMenu.tsx         # Task 11
    │   ├── Header.tsx           # Task 12
    │   ├── Footer.tsx           # Task 13
    │   └── __tests__/
    │       ├── Ornament.test.tsx
    │       ├── Container.test.tsx
    │       ├── MegaMenu.test.tsx
    │       ├── Header.test.tsx
    │       └── Footer.test.tsx
    ├── data/
    │   ├── maison.ts            # Task 15 — manifesto / pillars content
    │   └── nav.ts               # Task 12 — primary nav structure
    ├── routes/
    │   ├── _index.tsx           # scaffold, stripped to placeholder Task 14
    │   └── pages.la-maison.tsx  # Task 16
    └── test/
        ├── setup.ts             # Task 5
        └── render.tsx           # Task 5 — router-aware render helper
```

Each file has one clear responsibility. Styles split tokens (data) from global (application). Components live next to their tests. Static content (maison, nav) lives in `data/` so designers/Gautier can edit without touching components.

---

## Tasks

### Task 1: Shopify admin — define the data model

**No code. This is admin UI configuration.** Produces the metaobject + metafield shape Plan 2 will query.

**Files:** None — config lives in Shopify admin.

- [ ] **Step 1: Create metaobject definition « Saga »**

In Shopify admin → Settings → Custom data → Metaobjects → Add definition.

Name the definition `Saga` (handle auto-fills to `saga`). Check **Storefronts can access this metaobject** under Access.

Shopify adds a system `Name` field automatically — it's the display field and drives the handle. Do NOT re-create it. Add only these **4 custom fields** via "Add field".

**Naming convention for the whole project:** display labels in French, keys in French `snake_case` (no accents — GraphQL identifiers are alphanumeric + underscore only), namespaces stay `univers` / `tome`.

| Label (affiché dans l'admin) | Name / key | Type | Required | Notes |
|---|---|---|---|---|
| Synopsis | `synopsis` | rich_text |  |  |
| Ordre des tomes | `ordre_des_tomes` | list.product_reference |  | Liste ordonnée de produits |
| Univers parent | `univers_parent` | collection_reference | ✅ | Pointe vers la collection Univers |
| Illustration hero de la saga | `illustration_hero_saga` | file_reference (image) |  | Réservé, non affiché v1 |

- [ ] **Step 2: Add metafields to Collection (« Univers »)**

Shopify admin → Settings → Custom data → Collections → Add definition.

| Label (affiché) | Namespace / key | Type | Notes |
|---|---|---|---|
| Illustration hero | `custom.illustration_hero` | file_reference (image) | Illustration pleine largeur |
| Lore | `custom.lore` | rich_text |  |
| Couleur thème | `custom.couleur_theme` | single_line_text | Hex string |
| Sagas | `custom.sagas` | list.metaobject_reference → saga | Liste ordonnée |
| Est une œuvre indépendante | `custom.est_une_oeuvre_independante` | boolean | true pour la collection « Romans indépendants » |

> Note: le tri du slideshow homepage est **volontairement absent** — il sera géré dans Plan 2 via un metaobject dédié « Configuration accueil » avec une liste drag-and-drop mixte (Collection + Product).

All metafields marked **Storefronts can access**.

- [ ] **Step 3: Add metafields to Product (« Tome »)**

Shopify admin → Settings → Custom data → Products → Add definition.

| Label (affiché) | Namespace / key | Type | Notes |
|---|---|---|---|
| Univers | `custom.univers` | collection_reference | Ref simple |
| Saga | `custom.saga` | metaobject_reference → saga |  |
| Numéro de tome | `custom.numero_tome` | number_integer |  |
| Est une œuvre indépendante | `custom.est_une_oeuvre_independante` | boolean | true pour les standalones (Berserker etc.) |
| Statut de parution | `custom.statut_parution` | single_line_text | Validation (choix) : `publié` · `précommande` · `annoncé` |
| Date de parution | `custom.date_parution` | date |  |
| Teaser court | `custom.teaser_court` | multi_line_text | Sidebar italique sur la fiche |
| Type de goodie | `custom.type_goodie` | single_line_text | Validation (choix) : `ex-libris` · `illustration` · `marque-page` · `coffret` |
| Univers associé | `custom.univers_associe` | collection_reference | Pour goodies liés à un univers |

All marked **Storefronts can access**.

- [ ] **Step 4: Verify from admin GraphiQL**

Open Shopify admin → Apps → Develop apps → [your app] → API credentials → Admin API access token.

Open GraphiQL (admin GraphQL explorer) and run:

```graphql
{
  metaobjectDefinitions(first: 5) {
    nodes { name type fieldDefinitions { name key type { name } } }
  }
}
```

Expected: the `saga` definition appears with all 6 fields.

```graphql
{
  metafieldDefinitions(first: 20, ownerType: COLLECTION) {
    nodes { namespace key name type { name } }
  }
}
```

Expected: 6 collection metafields under namespace `univers`.

- [ ] **Step 5: Commit a note documenting the data model**

Create `docs/shopify/data-model.md` with a copy of the tables above so future devs can re-create the schema if needed.

```bash
git add docs/shopify/data-model.md
git commit -m "docs(shopify): record metaobject and metafield definitions"
```

---

### Task 2: Shopify admin — create sample data

Just enough catalog content to exercise queries (mega-menu, page univers stub, « La maison » will ignore catalog). Plan 2 expands.

**Files:** None — admin only.

- [ ] **Step 1: Create collection « Au Nom des Dieux »**

Shopify admin → Products → Collections → Create collection.

- Title: `Au Nom des Dieux`
- Handle: `au-nom-des-dieux` (auto)
- Collection type: **Manual**
- Metafields:
  - `custom.couleur_theme` = `#8b6b3a`
  - `custom.est_une_oeuvre_independante` = `false`
  - `custom.lore` = the citation from spec §2.4 (rich text)
  - `custom.illustration_hero` = upload any placeholder 2400×800 image (real illustration comes later)
- Leave `sagas` empty for now — we'll link after Step 3.

- [ ] **Step 2: Create 2 sample Tome products**

Product 1:
- Title: `L'Eau et du Sang — Tome 1`
- Handle: `l-eau-et-du-sang-tome-1`
- Price: `22.00 €`
- Status: Active
- **Description** (champ natif Shopify, éditeur riche) : synopsis long de la spec §2.5. C'est ce champ qui servira de "4e de couverture" pleine largeur sur la fiche produit.
- Metafields:
  - `custom.univers` = `Au Nom des Dieux`
  - `custom.numero_tome` = `1`
  - `custom.est_une_oeuvre_independante` = `false`
  - `custom.statut_parution` = `publié`
  - `custom.teaser_court` = teaser from spec §2.5
- Add any placeholder cover image.

Product 2: same as Tome 1 but title `L'Eau et du Sang — Tome 2`, handle `l-eau-et-du-sang-tome-2`, `numero_tome = 2`.

- [ ] **Step 3: Create metaobject entry « L'Eau et du Sang »**

Shopify admin → Content → Metaobjects → Saga → Add entry.

- `name`: `L'Eau et du Sang`
- `handle`: `l-eau-et-du-sang`
- `synopsis`: from spec §2.5
- `tome_order`: add Tome 1, then Tome 2 (order matters)
- `parent_universe`: `Au Nom des Dieux`

Then go back to collection `Au Nom des Dieux` and set `custom.sagas` = [L'Eau et du Sang].

- [ ] **Step 4: Create standalone product « Berserker »**

- Title: `Berserker`
- Handle: `berserker`
- Price: `18.00 €`
- Status: Active
- **Description** (champ natif Shopify, éditeur riche) : atmosphère du livre de la spec §2.6 (« *Berserker* se lit d'une traite… »).
- Metafields:
  - `custom.est_une_oeuvre_independante` = `true`
  - `custom.statut_parution` = `publié`
  - `custom.teaser_court` = hero teaser from spec §2.6
- DO NOT set `custom.univers` (it has none).

- [ ] **Step 5: Create smart collection « Romans indépendants »**

Shopify admin → Products → Collections → Create collection.

- Title: `Romans indépendants`
- Handle: `romans-independants`
- Collection type: **Automated**
- Condition: `Product metafield custom.est_une_oeuvre_independante is equal to true`
- Metafields:
  - `custom.est_une_oeuvre_independante` = `true`
  - `custom.lore` = rich text `Romans hors sagas. Portes d'entrée singulières vers l'univers de Gautier Durieux de Madron.`

Verify `Berserker` appears as a member of the collection.

- [ ] **Step 6: Verify with a storefront query (you'll reuse this in code)**

In the Shopify admin Storefront API GraphiQL explorer (or via `curl` if easier), run:

```graphql
{
  collections(first: 10) {
    nodes {
      handle
      title
      estUneOeuvreIndependante: metafield(namespace: "custom", key: "est_une_oeuvre_independante") { value }
    }
  }
}
```

Expected: 2 collections (`au-nom-des-dieux`, `romans-independants`). The standalone bucket should return `{value: "true"}` for `estUneOeuvreIndependante`; the univers collection should return `{value: "false"}`.

---

### Task 3: Scaffold the Hydrogen skeleton

**Files:**
- Create: `package.json`, `server.ts`, `vite.config.ts`, `tsconfig.json`, `app/**/*` (via scaffold)
- Modify: `.gitignore`

- [ ] **Step 1: Run the scaffold in current directory**

```bash
npm create @shopify/hydrogen@latest -- --template skeleton --path . --install-deps
```

The CLI will ask:
- Language: **TypeScript**
- Package manager: **npm**
- Install dependencies: yes
- Connect to a Shopify store: **skip for now** (we link in Task 4)

Expected: project files land at repo root; `node_modules` installs; prompt returns clean.

- [ ] **Step 2: Verify dev server boots**

```bash
npm run dev
```

Expected: log line like `🚀 Shopify Hydrogen dev server running at http://localhost:3000`. Opening the URL shows the skeleton home page (probably with an error banner about missing Shopify credentials — that's expected, fixed in Task 4). Ctrl+C to stop.

- [ ] **Step 3: Update .gitignore**

Append to the existing `.gitignore` (don't overwrite — the scaffold already added entries):

```gitignore
# Hydrogen / Oxygen local
.env
.env.local
.shopify/
.cache/
.turbo/
dist/
build/
```

Check that `.env` is NOT committed:

```bash
git status --short
```

Expected: no `.env` line.

- [ ] **Step 4: Commit the scaffold**

```bash
git add -A
git commit -m "chore: scaffold Hydrogen skeleton"
```

---

### Task 4: Link to Shopify store + configure .env

**Files:**
- Create: `.env`, `.env.example`

- [ ] **Step 1: Link the CLI to the store**

```bash
npx shopify hydrogen link
```

The CLI prompts to select a store and a Hydrogen storefront. Pick the Bilskirnir store; create a new Hydrogen storefront named `Bilskirnir Storefront`.

Expected output: link success message, a `.shopify/` dir appears (gitignored).

- [ ] **Step 2: Pull environment variables**

```bash
npx shopify hydrogen env pull
```

This writes `.env` with `PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_API_TOKEN`, `PUBLIC_STOREFRONT_ID`, and pulls a `SESSION_SECRET` (or generate one if missing: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and paste it as `SESSION_SECRET=...`).

- [ ] **Step 3: Create `.env.example`**

```bash
# Bilskirnir storefront — required env vars
# Copy to .env and fill in values from Shopify admin
PUBLIC_STORE_DOMAIN=your-store.myshopify.com
PUBLIC_STOREFRONT_API_TOKEN=
PUBLIC_STOREFRONT_ID=
PUBLIC_CHECKOUT_DOMAIN=
SESSION_SECRET=generate-with-openssl-rand-hex-32
```

- [ ] **Step 4: Verify dev server connects to real data**

```bash
npm run dev
```

Open http://localhost:3000. Expected: no credentials banner, skeleton home page renders without errors. Navigate to `http://localhost:3000/collections` — should list `Au Nom des Dieux` and `Romans indépendants`. Ctrl+C to stop.

- [ ] **Step 5: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: link Hydrogen to Shopify store, document env vars"
```

---

### Task 5: Set up Vitest + Testing Library

**Files:**
- Create: `vitest.config.ts`, `app/test/setup.ts`, `app/test/render.tsx`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Install deps**

```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./app/test/setup.ts'],
    css: true,
    include: ['app/**/*.test.{ts,tsx}'],
  },
});
```

Install `@vitejs/plugin-react` and `vite-tsconfig-paths` if not already present:

```bash
npm install --save-dev @vitejs/plugin-react vite-tsconfig-paths
```

- [ ] **Step 3: Create `app/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
import {cleanup} from '@testing-library/react';
import {afterEach} from 'vitest';

afterEach(() => {
  cleanup();
});
```

- [ ] **Step 4: Create `app/test/render.tsx`** — a helper that wraps components in a React Router memory context, since most components use `<Link>` / `useLocation`:

```tsx
import type {ReactElement} from 'react';
import {render, type RenderOptions} from '@testing-library/react';
import {createMemoryRouter, RouterProvider} from 'react-router';

export function renderWithRouter(
  ui: ReactElement,
  {route = '/', ...options}: {route?: string} & Omit<RenderOptions, 'wrapper'> = {},
) {
  const router = createMemoryRouter([{path: '*', element: ui}], {
    initialEntries: [route],
  });
  return render(<RouterProvider router={router} />, options);
}
```

- [ ] **Step 5: Add test scripts to `package.json`**

Under `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 6: Write and run a sanity test to verify the harness**

Create `app/test/sanity.test.tsx`:

```tsx
import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {renderWithRouter} from './render';

describe('test harness', () => {
  it('renders a component in router context', () => {
    renderWithRouter(<h1>Bilskirnir</h1>);
    expect(screen.getByRole('heading', {name: 'Bilskirnir'})).toBeInTheDocument();
  });
});
```

Run:

```bash
npm test
```

Expected: 1 passed test. Delete the sanity test afterward (we only needed it to prove the harness works):

```bash
rm app/test/sanity.test.tsx
```

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts app/test/
git commit -m "chore(test): set up Vitest + Testing Library harness"
```

---

### Task 6: Design tokens

**Files:**
- Create: `app/styles/tokens.css`

- [ ] **Step 1: Write the tokens file**

Vanilla CSS custom properties — every component reads from these, never hard-codes values.

```css
/* app/styles/tokens.css
 * Bilskirnir design tokens — dark mode global. No light-mode fallback by design.
 */

:root {
  /* ── Color: background & surfaces ─────────────────────────────── */
  --bsk-bg-base: #0c0906;          /* deepest — body */
  --bsk-bg-raised: #15110c;         /* cards, tiles */
  --bsk-bg-overlay: #1d1812;        /* hovers, mega-menu */
  --bsk-bg-gradient-warm: radial-gradient(
    ellipse at 50% 0%,
    #1a140e 0%,
    #0c0906 60%
  );

  /* ── Color: foreground ────────────────────────────────────────── */
  --bsk-fg-primary: #f5efe3;        /* main text */
  --bsk-fg-secondary: #a89b87;      /* metadata, labels */
  --bsk-fg-muted: #6b6153;          /* disabled, captions */

  /* ── Color: accents ───────────────────────────────────────────── */
  --bsk-accent-gold: #c9a14a;       /* primary accent */
  --bsk-accent-gold-bright: #e6b95e; /* hover / active */
  --bsk-accent-gold-dim: #8a6f33;   /* borders, subtle */
  --bsk-accent-bronze: #8b6b3a;     /* secondary accent */

  /* ── Color: semantic ──────────────────────────────────────────── */
  --bsk-status-preorder: var(--bsk-accent-gold);
  --bsk-status-announced: var(--bsk-fg-secondary);
  --bsk-status-published: var(--bsk-fg-primary);

  /* ── Borders & shadows ────────────────────────────────────────── */
  --bsk-border-subtle: rgba(168, 155, 135, 0.12);
  --bsk-border-gold: rgba(201, 161, 74, 0.35);
  --bsk-shadow-cover: 0 18px 48px rgba(0, 0, 0, 0.55),
    0 2px 8px rgba(0, 0, 0, 0.35);
  --bsk-shadow-float: 0 8px 24px rgba(0, 0, 0, 0.45);

  /* ── Typography: families ─────────────────────────────────────── */
  --bsk-font-serif: "Cormorant Garamond", "EB Garamond", Georgia, serif;
  --bsk-font-sans: "Inter", system-ui, -apple-system, sans-serif;

  /* ── Typography: scale (rem-based, 1rem = 16px) ──────────────── */
  --bsk-text-xs: 0.75rem;   /* 12px — labels */
  --bsk-text-sm: 0.875rem;  /* 14px — meta */
  --bsk-text-base: 1rem;    /* 16px — body */
  --bsk-text-md: 1.125rem;  /* 18px — lead */
  --bsk-text-lg: 1.375rem;  /* 22px — subheads */
  --bsk-text-xl: 1.75rem;   /* 28px — section headings */
  --bsk-text-2xl: 2.25rem;  /* 36px — page titles */
  --bsk-text-3xl: 3rem;     /* 48px — hero */
  --bsk-text-4xl: 4rem;     /* 64px — mega hero */

  /* ── Typography: weights ──────────────────────────────────────── */
  --bsk-weight-regular: 400;
  --bsk-weight-medium: 500;
  --bsk-weight-semibold: 600;
  --bsk-weight-bold: 700;

  /* ── Typography: tracking ─────────────────────────────────────── */
  --bsk-tracking-tight: -0.01em;
  --bsk-tracking-normal: 0;
  --bsk-tracking-wide: 0.08em;
  --bsk-tracking-widest: 0.18em;  /* for caps labels */

  /* ── Spacing (4px base) ───────────────────────────────────────── */
  --bsk-space-1: 0.25rem;
  --bsk-space-2: 0.5rem;
  --bsk-space-3: 0.75rem;
  --bsk-space-4: 1rem;
  --bsk-space-5: 1.5rem;
  --bsk-space-6: 2rem;
  --bsk-space-8: 3rem;
  --bsk-space-10: 4rem;
  --bsk-space-12: 6rem;
  --bsk-space-16: 8rem;

  /* ── Layout widths ────────────────────────────────────────────── */
  --bsk-width-reading: 42rem;      /* 672px — synopsis */
  --bsk-width-content: 62.5rem;    /* 1000px — fiche produit */
  --bsk-width-full: 90rem;         /* 1440px — homepage slideshow wrapper */

  /* ── Motion ───────────────────────────────────────────────────── */
  --bsk-ease: cubic-bezier(0.22, 0.61, 0.36, 1);
  --bsk-duration-fast: 150ms;
  --bsk-duration-base: 280ms;
  --bsk-duration-slow: 480ms;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/styles/tokens.css
git commit -m "feat(design): add design tokens (dark-mode palette, type scale, spacing)"
```

---

### Task 7: Global stylesheet + font loading

**Files:**
- Create: `app/styles/global.css`
- Modify: `app/root.tsx`
- Install: `@fontsource-variable/cormorant-garamond`, `@fontsource-variable/inter`

- [ ] **Step 1: Install self-hosted fonts**

```bash
npm install @fontsource-variable/cormorant-garamond @fontsource-variable/inter
```

- [ ] **Step 2: Write `app/styles/global.css`**

```css
/* app/styles/global.css — base resets + typography defaults */
@import "./tokens.css";

/* Modern CSS reset (minimal, keep things predictable) */
*,
*::before,
*::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

html,
body {
  height: 100%;
}

body {
  background: var(--bsk-bg-base);
  color: var(--bsk-fg-primary);
  font-family: var(--bsk-font-sans);
  font-size: var(--bsk-text-base);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
  height: auto;
}

input,
button,
textarea,
select {
  font: inherit;
  color: inherit;
}

p {
  text-wrap: pretty;
}

h1,
h2,
h3,
h4 {
  font-family: var(--bsk-font-serif);
  font-weight: var(--bsk-weight-semibold);
  line-height: 1.15;
  letter-spacing: var(--bsk-tracking-tight);
  text-wrap: balance;
}

a {
  color: inherit;
  text-decoration: none;
}

a:focus-visible,
button:focus-visible {
  outline: 2px solid var(--bsk-accent-gold);
  outline-offset: 2px;
}

/* Screen-reader-only utility */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 3: Wire fonts + stylesheet in `app/root.tsx`**

Open `app/root.tsx`. The scaffold already imports a `reset.css` or `app.css` — replace with our stylesheet.

Find the existing `links` export (looks roughly like this after scaffold):

```tsx
export const links: Route.LinksFunction = () => {
  return [
    {rel: 'stylesheet', href: resetStyles},
    {rel: 'stylesheet', href: appStyles},
    ...
  ];
};
```

Replace the imports and links with:

```tsx
import '@fontsource-variable/cormorant-garamond/index.css';
import '@fontsource-variable/cormorant-garamond/italic.css';
import '@fontsource-variable/inter/index.css';
import globalStyles from '~/styles/global.css?url';

export const links: Route.LinksFunction = () => {
  return [
    {rel: 'stylesheet', href: globalStyles},
    {rel: 'preconnect', href: 'https://cdn.shopify.com'},
    {rel: 'preconnect', href: 'https://shop.app'},
  ];
};
```

Delete the scaffold's `reset.css` and `app.css` files:

```bash
rm app/styles/reset.css app/styles/app.css 2>/dev/null || true
```

- [ ] **Step 4: Verify fonts + dark mode render**

```bash
npm run dev
```

Open http://localhost:3000. Expected: page background is near-black (`#0c0906`), text is cream-colored, body uses Inter, any `<h1>` shows in Cormorant Garamond. Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(design): global stylesheet, font loading, dark-mode body"
```

---

### Task 8: Ornament component (TDD)

Renders `◈ ◈ ◈` in gold — used between sagas on page univers and as a section divider on « La maison ».

**Files:**
- Test: `app/components/__tests__/Ornament.test.tsx`
- Create: `app/components/Ornament.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// app/components/__tests__/Ornament.test.tsx
import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {renderWithRouter} from '~/test/render';
import {Ornament} from '../Ornament';

describe('<Ornament />', () => {
  it('renders three gold diamond glyphs', () => {
    renderWithRouter(<Ornament />);
    const el = screen.getByRole('presentation');
    expect(el).toHaveTextContent('◈ ◈ ◈');
  });

  it('accepts a custom count', () => {
    renderWithRouter(<Ornament count={5} />);
    expect(screen.getByRole('presentation')).toHaveTextContent('◈ ◈ ◈ ◈ ◈');
  });

  it('is decorative and hidden from assistive tech', () => {
    renderWithRouter(<Ornament />);
    const el = screen.getByRole('presentation');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- Ornament
```

Expected: 3 failures with `Cannot find module '../Ornament'`.

- [ ] **Step 3: Implement**

```tsx
// app/components/Ornament.tsx
export function Ornament({count = 3}: {count?: number}) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      style={{
        textAlign: 'center',
        color: 'var(--bsk-accent-gold)',
        letterSpacing: '0.5em',
        fontSize: 'var(--bsk-text-sm)',
        padding: 'var(--bsk-space-6) 0',
      }}
    >
      {Array.from({length: count}, () => '◈').join(' ')}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

```bash
npm test -- Ornament
```

Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add app/components/Ornament.tsx app/components/__tests__/Ornament.test.tsx
git commit -m "feat(ui): Ornament divider component"
```

---

### Task 9: Container component (TDD)

Width-constrained wrapper used by every page section.

**Files:**
- Test: `app/components/__tests__/Container.test.tsx`
- Create: `app/components/Container.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// app/components/__tests__/Container.test.tsx
import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {renderWithRouter} from '~/test/render';
import {Container} from '../Container';

describe('<Container />', () => {
  it('renders children', () => {
    renderWithRouter(
      <Container>
        <p>Inside</p>
      </Container>,
    );
    expect(screen.getByText('Inside')).toBeInTheDocument();
  });

  it('applies the requested width variant', () => {
    const {container} = renderWithRouter(
      <Container width="reading">
        <p>Inside</p>
      </Container>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.maxWidth).toBe('var(--bsk-width-reading)');
  });

  it('defaults to content width', () => {
    const {container} = renderWithRouter(<Container>x</Container>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.maxWidth).toBe('var(--bsk-width-content)');
  });
});
```

- [ ] **Step 2: Run — expect 3 failures**

```bash
npm test -- Container
```

- [ ] **Step 3: Implement**

```tsx
// app/components/Container.tsx
import type {ReactNode} from 'react';

const WIDTH_MAP = {
  reading: 'var(--bsk-width-reading)',
  content: 'var(--bsk-width-content)',
  full: 'var(--bsk-width-full)',
} as const;

export type ContainerWidth = keyof typeof WIDTH_MAP;

export function Container({
  children,
  width = 'content',
  as: Tag = 'div',
}: {
  children: ReactNode;
  width?: ContainerWidth;
  as?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer' | 'nav';
}) {
  return (
    <Tag
      style={{
        maxWidth: WIDTH_MAP[width],
        marginInline: 'auto',
        paddingInline: 'var(--bsk-space-5)',
        width: '100%',
      }}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 4: Run — expect 3 passed**

```bash
npm test -- Container
```

- [ ] **Step 5: Commit**

```bash
git add app/components/Container.tsx app/components/__tests__/Container.test.tsx
git commit -m "feat(ui): Container layout primitive with width variants"
```

---

### Task 10: Root loader — query data for the mega-menu

The mega-menu needs the list of universes, split by `is_standalone_bucket`. Querying in the root loader makes it available to every page.

**Files:**
- Modify: `app/root.tsx` — extend loader
- Create: `app/lib/fragments.ts` — add collection fragment (or extend existing)

- [ ] **Step 1: Add a collection fragment in `app/lib/fragments.ts`**

The scaffold's `fragments.ts` exports `CART_QUERY_FRAGMENT`. Append:

```ts
// app/lib/fragments.ts (add to existing file)
export const UNIVERSE_CARD_FRAGMENT = `#graphql
  fragment UniverseCard on Collection {
    id
    handle
    title
    estUneOeuvreIndependante: metafield(namespace: "custom", key: "est_une_oeuvre_independante") {
      value
    }
  }
` as const;
```

> **Note:** namespace + key stay French snake_case (as defined in the admin); GraphQL response aliases are camelCase for ergonomic JS consumption.

- [ ] **Step 2: Extend the root loader in `app/root.tsx`**

Find the existing `loader` function. Add a mega-menu query alongside what's already there. Add after existing imports:

```tsx
import {UNIVERSE_CARD_FRAGMENT} from '~/lib/fragments';
```

In the loader, add:

```tsx
export async function loader(args: Route.LoaderArgs) {
  const {storefront} = args.context;

  // existing skeleton calls (cart, header, footer menus, etc.) stay.
  // Add:
  const megaMenuPromise = storefront.query(MEGA_MENU_QUERY, {
    cache: storefront.CacheLong(),
  });

  // Merge into the returned object:
  return {
    ...existingReturnFields,
    megaMenu: megaMenuPromise,
  };
}

const MEGA_MENU_QUERY = `#graphql
  query MegaMenu($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 20, sortKey: TITLE) {
      nodes {
        ...UniverseCard
      }
    }
  }
  ${UNIVERSE_CARD_FRAGMENT}
` as const;
```

> **Why `CacheLong`:** universes rarely change. Storefront-side cache reduces calls.

- [ ] **Step 3: Verify the query runs**

```bash
npm run dev
```

In a second terminal, curl the root route and check for no GraphQL errors in dev logs:

```bash
curl -s http://localhost:3000 > /dev/null
```

Expected: no red errors in the dev server terminal. Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add app/root.tsx app/lib/fragments.ts
git commit -m "feat(data): query universes in root loader for mega-menu"
```

---

### Task 11: MegaMenu component (TDD)

Dropdown triggered by the « Univers » nav item. Splits universes into « Univers en cours » vs « Romans indépendants » by `isStandalone` metafield.

**Files:**
- Test: `app/components/__tests__/MegaMenu.test.tsx`
- Create: `app/components/MegaMenu.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// app/components/__tests__/MegaMenu.test.tsx
import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {renderWithRouter} from '~/test/render';
import {MegaMenu, type UniverseItem} from '../MegaMenu';

const universes: UniverseItem[] = [
  {
    id: '1',
    handle: 'au-nom-des-dieux',
    title: 'Au Nom des Dieux',
    isStandalone: false,
  },
  {
    id: '2',
    handle: 'romans-independants',
    title: 'Romans indépendants',
    isStandalone: true,
  },
];

describe('<MegaMenu />', () => {
  it('renders the "Univers en cours" section with non-standalone universes', () => {
    renderWithRouter(<MegaMenu universes={universes} />);
    const inProgress = screen.getByRole('region', {name: /univers en cours/i});
    expect(inProgress).toHaveTextContent('Au Nom des Dieux');
    expect(inProgress).not.toHaveTextContent('Romans indépendants');
  });

  it('renders the "Romans indépendants" section with standalone bucket', () => {
    renderWithRouter(<MegaMenu universes={universes} />);
    const standalone = screen.getByRole('region', {name: /romans indépendants/i});
    expect(standalone).toHaveTextContent('Romans indépendants');
  });

  it('links each universe to its collection page', () => {
    renderWithRouter(<MegaMenu universes={universes} />);
    const link = screen.getByRole('link', {name: 'Au Nom des Dieux'});
    expect(link).toHaveAttribute('href', '/collections/au-nom-des-dieux');
  });

  it('shows an empty-state message when there are no universes', () => {
    renderWithRouter(<MegaMenu universes={[]} />);
    expect(screen.getByText(/bientôt/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect 4 failures**

```bash
npm test -- MegaMenu
```

- [ ] **Step 3: Implement**

```tsx
// app/components/MegaMenu.tsx
import {Link} from 'react-router';

export type UniverseItem = {
  id: string;
  handle: string;
  title: string;
  isStandalone: boolean;
};

export function MegaMenu({universes}: {universes: UniverseItem[]}) {
  const inProgress = universes.filter((u) => !u.isStandalone);
  const standalone = universes.filter((u) => u.isStandalone);

  if (universes.length === 0) {
    return (
      <div
        style={{
          padding: 'var(--bsk-space-8)',
          color: 'var(--bsk-fg-secondary)',
          fontStyle: 'italic',
        }}
      >
        Les univers arrivent bientôt.
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bsk-bg-overlay)',
        borderTop: '1px solid var(--bsk-border-subtle)',
        padding: 'var(--bsk-space-8) var(--bsk-space-6)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 'var(--bsk-space-8)',
        maxWidth: 'var(--bsk-width-full)',
        margin: '0 auto',
      }}
    >
      <MegaMenuSection title="Univers en cours" items={inProgress} />
      <MegaMenuSection title="Romans indépendants" items={standalone} />
      <MegaMenuSection title="À paraître" items={[]} emptyLabel="Aucune annonce" />
    </div>
  );
}

function MegaMenuSection({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: UniverseItem[];
  emptyLabel?: string;
}) {
  return (
    <section aria-label={title}>
      <h3
        style={{
          fontFamily: 'var(--bsk-font-sans)',
          fontSize: 'var(--bsk-text-xs)',
          letterSpacing: 'var(--bsk-tracking-widest)',
          textTransform: 'uppercase',
          color: 'var(--bsk-accent-gold)',
          marginBottom: 'var(--bsk-space-4)',
        }}
      >
        {title}
      </h3>
      {items.length === 0 && emptyLabel ? (
        <p style={{color: 'var(--bsk-fg-muted)', fontStyle: 'italic'}}>
          {emptyLabel}
        </p>
      ) : (
        <ul style={{listStyle: 'none', padding: 0, display: 'grid', gap: 'var(--bsk-space-3)'}}>
          {items.map((u) => (
            <li key={u.id}>
              <Link
                to={`/collections/${u.handle}`}
                style={{
                  fontFamily: 'var(--bsk-font-serif)',
                  fontSize: 'var(--bsk-text-md)',
                  color: 'var(--bsk-fg-primary)',
                  transition: 'color var(--bsk-duration-fast) var(--bsk-ease)',
                }}
              >
                {u.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Run — expect 4 passed**

```bash
npm test -- MegaMenu
```

- [ ] **Step 5: Commit**

```bash
git add app/components/MegaMenu.tsx app/components/__tests__/MegaMenu.test.tsx
git commit -m "feat(ui): MegaMenu component with universes split by standalone bucket"
```

---

### Task 12: Header component (TDD)

3-column grid header with nav on the left, logo centered, account + cart on the right. Mega-menu opens on hover/focus of the « Univers » item.

**Files:**
- Test: `app/components/__tests__/Header.test.tsx`
- Create: `app/components/Header.tsx`
- Create: `app/data/nav.ts`

- [ ] **Step 1: Write primary nav data in `app/data/nav.ts`**

```ts
// app/data/nav.ts — static navigation structure
export type NavItem = {
  label: string;
  href: string;
  hasMegaMenu?: boolean;
};

export const PRIMARY_NAV: NavItem[] = [
  {label: 'Œuvres', href: '/collections/all'},
  {label: 'Univers', href: '/collections', hasMegaMenu: true},
  {label: 'Goodies', href: '/collections/goodies'},
  {label: 'La maison', href: '/pages/la-maison'},
];

export const FOOTER_NAV = {
  boutique: [
    {label: 'Œuvres', href: '/collections/all'},
    {label: 'Univers', href: '/collections'},
    {label: 'Goodies', href: '/collections/goodies'},
    {label: 'À paraître', href: '/collections/a-paraitre'},
  ],
  maison: [
    {label: 'Notre mission', href: '/pages/la-maison'},
    {label: 'L’auteur', href: '/pages/la-maison#auteur'},
    {label: 'Contact', href: '/pages/contact'},
    {label: 'Presse', href: '/pages/presse'},
  ],
  info: [
    {label: 'Livraison', href: '/policies/shipping-policy'},
    {label: 'Retours', href: '/policies/refund-policy'},
    {label: 'Mentions légales', href: '/policies/legal-notice'},
    {label: 'CGV', href: '/policies/terms-of-service'},
  ],
};
```

- [ ] **Step 2: Write the failing test**

```tsx
// app/components/__tests__/Header.test.tsx
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it} from 'vitest';
import {renderWithRouter} from '~/test/render';
import {Header} from '../Header';
import type {UniverseItem} from '../MegaMenu';

const universes: UniverseItem[] = [
  {id: '1', handle: 'au-nom-des-dieux', title: 'Au Nom des Dieux', isStandalone: false},
];

describe('<Header />', () => {
  it('renders the Bilskirnir logo as a link to home', () => {
    renderWithRouter(<Header universes={universes} cartCount={0} />);
    const logo = screen.getByRole('link', {name: /bilskirnir/i});
    expect(logo).toHaveAttribute('href', '/');
  });

  it('renders the primary nav items', () => {
    renderWithRouter(<Header universes={universes} cartCount={0} />);
    expect(screen.getByRole('link', {name: 'Œuvres'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Goodies'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'La maison'})).toBeInTheDocument();
  });

  it('shows the cart count', () => {
    renderWithRouter(<Header universes={universes} cartCount={3} />);
    expect(screen.getByLabelText(/panier/i)).toHaveTextContent('3');
  });

  it('reveals the mega-menu when the Univers item is focused', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Header universes={universes} cartCount={0} />);
    expect(screen.queryByRole('region', {name: /univers en cours/i})).toBeNull();
    await user.tab(); // first tab lands on logo → not yet
    // tab until we hit the "Univers" trigger
    const trigger = screen.getByRole('button', {name: /univers/i});
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('region', {name: /univers en cours/i})).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run — expect failures**

```bash
npm test -- Header
```

- [ ] **Step 4: Implement**

```tsx
// app/components/Header.tsx
import {useState} from 'react';
import {Link} from 'react-router';
import {MegaMenu, type UniverseItem} from './MegaMenu';
import {PRIMARY_NAV} from '~/data/nav';

type HeaderProps = {
  universes: UniverseItem[];
  cartCount: number;
};

export function Header({universes, cartCount}: HeaderProps) {
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bsk-bg-base)',
        borderBottom: '1px solid var(--bsk-border-subtle)',
      }}
      onMouseLeave={() => setMegaMenuOpen(false)}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 'var(--bsk-space-6)',
          padding: 'var(--bsk-space-4) var(--bsk-space-6)',
          maxWidth: 'var(--bsk-width-full)',
          margin: '0 auto',
        }}
      >
        <nav aria-label="Navigation principale">
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              gap: 'var(--bsk-space-6)',
              fontFamily: 'var(--bsk-font-sans)',
              fontSize: 'var(--bsk-text-sm)',
              letterSpacing: 'var(--bsk-tracking-wide)',
              textTransform: 'uppercase',
            }}
          >
            {PRIMARY_NAV.map((item) =>
              item.hasMegaMenu ? (
                <li key={item.label}>
                  <button
                    type="button"
                    aria-expanded={megaMenuOpen}
                    aria-haspopup="true"
                    onClick={() => setMegaMenuOpen((o) => !o)}
                    onMouseEnter={() => setMegaMenuOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: 'var(--bsk-fg-secondary)',
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      letterSpacing: 'inherit',
                      textTransform: 'inherit',
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              ) : (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    style={{color: 'var(--bsk-fg-secondary)'}}
                    onMouseEnter={() => setMegaMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <Link
          to="/"
          style={{
            fontFamily: 'var(--bsk-font-serif)',
            fontSize: 'var(--bsk-text-lg)',
            letterSpacing: 'var(--bsk-tracking-widest)',
            color: 'var(--bsk-accent-gold)',
            textTransform: 'uppercase',
            fontWeight: 'var(--bsk-weight-semibold)',
          }}
        >
          Bilskirnir
        </Link>

        <div
          style={{
            display: 'flex',
            gap: 'var(--bsk-space-5)',
            justifyContent: 'flex-end',
            alignItems: 'center',
            fontFamily: 'var(--bsk-font-sans)',
            fontSize: 'var(--bsk-text-sm)',
          }}
        >
          <Link to="/search" aria-label="Rechercher" style={{color: 'var(--bsk-fg-secondary)'}}>
            🔍
          </Link>
          <Link to="/account" style={{color: 'var(--bsk-fg-secondary)'}}>
            Compte
          </Link>
          <Link
            to="/cart"
            aria-label={`Panier (${cartCount} article${cartCount > 1 ? 's' : ''})`}
            style={{color: 'var(--bsk-accent-gold)', fontWeight: 'var(--bsk-weight-medium)'}}
          >
            Panier ({cartCount})
          </Link>
        </div>
      </div>

      {megaMenuOpen ? <MegaMenu universes={universes} /> : null}
    </header>
  );
}
```

- [ ] **Step 5: Run — expect passes**

```bash
npm test -- Header
```

- [ ] **Step 6: Commit**

```bash
git add app/components/Header.tsx app/components/__tests__/Header.test.tsx app/data/nav.ts
git commit -m "feat(ui): Header with 3-column grid + mega-menu trigger"
```

---

### Task 13: Footer component (TDD)

4-column footer with newsletter on the left (wide), 3 link columns, social row.

**Files:**
- Test: `app/components/__tests__/Footer.test.tsx`
- Create: `app/components/Footer.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// app/components/__tests__/Footer.test.tsx
import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {renderWithRouter} from '~/test/render';
import {Footer} from '../Footer';

describe('<Footer />', () => {
  it('shows the newsletter headline', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByRole('heading', {name: /restez dans l['’]univers/i})).toBeInTheDocument();
  });

  it('renders a newsletter email input', () => {
    renderWithRouter(<Footer />);
    const input = screen.getByLabelText(/adresse email/i);
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toBeRequired();
  });

  it('links to all three policy columns', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByRole('link', {name: /livraison/i})).toHaveAttribute(
      'href',
      '/policies/shipping-policy',
    );
    expect(screen.getByRole('link', {name: /cgv/i})).toHaveAttribute(
      'href',
      '/policies/terms-of-service',
    );
  });

  it('shows the copyright', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText(/bilskirnir/i, {selector: 'small,p'})).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect failures**

```bash
npm test -- Footer
```

- [ ] **Step 3: Implement**

```tsx
// app/components/Footer.tsx
import {Link} from 'react-router';
import {FOOTER_NAV} from '~/data/nav';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        background: 'var(--bsk-bg-raised)',
        borderTop: '1px solid var(--bsk-border-subtle)',
        marginTop: 'var(--bsk-space-16)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--bsk-width-full)',
          margin: '0 auto',
          padding: 'var(--bsk-space-10) var(--bsk-space-6)',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 'var(--bsk-space-8)',
        }}
      >
        <NewsletterBlock />
        <FooterColumn title="Boutique" items={FOOTER_NAV.boutique} />
        <FooterColumn title="La maison" items={FOOTER_NAV.maison} />
        <FooterColumn title="Info" items={FOOTER_NAV.info} />
      </div>
      <div
        style={{
          borderTop: '1px solid var(--bsk-border-subtle)',
          padding: 'var(--bsk-space-5) var(--bsk-space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--bsk-fg-muted)',
          fontSize: 'var(--bsk-text-xs)',
          maxWidth: 'var(--bsk-width-full)',
          margin: '0 auto',
        }}
      >
        <small>© {year} Bilskirnir. Éditeur indépendant.</small>
        <div style={{display: 'flex', gap: 'var(--bsk-space-4)'}}>
          <a href="https://tiktok.com/@bilskirnir" rel="me noreferrer" target="_blank">
            TikTok
          </a>
          <a href="https://instagram.com/bilskirnir" rel="me noreferrer" target="_blank">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}

function NewsletterBlock() {
  return (
    <div>
      <h3
        style={{
          fontFamily: 'var(--bsk-font-serif)',
          fontSize: 'var(--bsk-text-xl)',
          color: 'var(--bsk-fg-primary)',
          marginBottom: 'var(--bsk-space-2)',
        }}
      >
        Restez dans l’univers
      </h3>
      <p style={{color: 'var(--bsk-fg-secondary)', marginBottom: 'var(--bsk-space-4)', maxWidth: '28rem'}}>
        Annonces de sortie, précommandes, behind-the-scenes. Pas de spam. Pas de tracking.
      </p>
      <form
        style={{display: 'flex', gap: 'var(--bsk-space-2)', maxWidth: '28rem'}}
        action="/api/newsletter"
        method="post"
      >
        <label htmlFor="newsletter-email" className="visually-hidden">
          Adresse email
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="votre@email.fr"
          style={{
            flex: 1,
            background: 'var(--bsk-bg-base)',
            color: 'var(--bsk-fg-primary)',
            border: '1px solid var(--bsk-border-subtle)',
            padding: 'var(--bsk-space-3) var(--bsk-space-4)',
          }}
        />
        <button
          type="submit"
          style={{
            background: 'var(--bsk-accent-gold)',
            color: 'var(--bsk-bg-base)',
            border: 'none',
            padding: 'var(--bsk-space-3) var(--bsk-space-5)',
            fontFamily: 'var(--bsk-font-sans)',
            fontSize: 'var(--bsk-text-xs)',
            letterSpacing: 'var(--bsk-tracking-widest)',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontWeight: 'var(--bsk-weight-semibold)',
          }}
        >
          S’inscrire
        </button>
      </form>
    </div>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: {label: string; href: string}[];
}) {
  return (
    <div>
      <h4
        style={{
          fontFamily: 'var(--bsk-font-sans)',
          fontSize: 'var(--bsk-text-xs)',
          letterSpacing: 'var(--bsk-tracking-widest)',
          textTransform: 'uppercase',
          color: 'var(--bsk-accent-gold)',
          marginBottom: 'var(--bsk-space-4)',
        }}
      >
        {title}
      </h4>
      <ul style={{listStyle: 'none', padding: 0, display: 'grid', gap: 'var(--bsk-space-3)'}}>
        {items.map((item) => (
          <li key={item.href}>
            <Link to={item.href} style={{color: 'var(--bsk-fg-secondary)', fontSize: 'var(--bsk-text-sm)'}}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Run — expect passes**

```bash
npm test -- Footer
```

Note: the `/api/newsletter` form action is a placeholder — Plan 3 wires it up. Submitting in Plan 1 will 404, which is fine.

- [ ] **Step 5: Commit**

```bash
git add app/components/Footer.tsx app/components/__tests__/Footer.test.tsx
git commit -m "feat(ui): Footer with newsletter block + 3 nav columns"
```

---

### Task 14: Wire Header + Footer into root layout

**Files:**
- Modify: `app/root.tsx`
- Modify: `app/routes/_index.tsx` (strip to placeholder — Plan 2 rebuilds)

- [ ] **Step 1: Replace the scaffold's PageLayout with our Header + Footer in `app/root.tsx`**

Find the `Layout` function in `root.tsx` (the component that wraps `{children}`). Inside the body, the scaffold wraps children in a `<PageLayout>` that includes their default header/footer. Replace with:

```tsx
import {Await, Outlet, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import {Header} from '~/components/Header';
import {Footer} from '~/components/Footer';
import type {UniverseItem} from '~/components/MegaMenu';

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Suspense
        fallback={<Header universes={[]} cartCount={0} />}
      >
        <Await resolve={Promise.all([data.megaMenu, data.cart])}>
          {([megaMenu, cart]) => (
            <Header
              universes={mapUniverses(megaMenu.collections.nodes)}
              cartCount={cart?.totalQuantity ?? 0}
            />
          )}
        </Await>
      </Suspense>
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function mapUniverses(nodes: unknown[]): UniverseItem[] {
  return (nodes as Array<{
    id: string;
    handle: string;
    title: string;
    estUneOeuvreIndependante: {value: string} | null;
  }>).map((c) => ({
    id: c.id,
    handle: c.handle,
    title: c.title,
    isStandalone: c.estUneOeuvreIndependante?.value === 'true',
  }));
}
```

Notes:
- `data.cart` comes from the scaffold's root loader — it already returns the cart promise.
- The `Await` wraps both promises so the header renders once both resolve. Fallback shows an empty-state header so navigation is still visible during streaming.

- [ ] **Step 2: Strip `app/routes/_index.tsx` to a placeholder**

```tsx
// app/routes/_index.tsx
import {Container} from '~/components/Container';

export function meta() {
  return [{title: 'Bilskirnir — Des récits héroïques, sans compromis'}];
}

export default function Index() {
  return (
    <Container width="reading">
      <div style={{padding: 'var(--bsk-space-16) 0', textAlign: 'center'}}>
        <h1
          style={{
            fontSize: 'var(--bsk-text-3xl)',
            color: 'var(--bsk-fg-primary)',
            marginBottom: 'var(--bsk-space-5)',
          }}
        >
          Des récits héroïques, sans compromis.
        </h1>
        <p style={{color: 'var(--bsk-fg-secondary)'}}>
          Catalogue en préparation.
        </p>
      </div>
    </Container>
  );
}
```

- [ ] **Step 3: Visual verification in the browser**

```bash
npm run dev
```

Open http://localhost:3000. Expected:
- Dark background (near-black)
- Header visible with nav on left, « BILSKIRNIR » centered in gold, account/panier on right
- Hovering « Univers » opens a 3-column mega-menu showing « Au Nom des Dieux » in the first column, « Romans indépendants » in the second
- Footer at the bottom with newsletter input, 3 link columns, copyright
- Tagline hero is centered, no layout glitches

Check all three link columns point to real routes (clicking `Mentions légales` 404s — that's fine, policies come from Shopify admin and are not wired to content yet).

Ctrl+C when verified.

- [ ] **Step 4: Run the full test suite**

```bash
npm test
```

Expected: all tests pass (Ornament, Container, MegaMenu, Header, Footer).

- [ ] **Step 5: Commit**

```bash
git add app/root.tsx app/routes/_index.tsx
git commit -m "feat(layout): wire Header + Footer into root, strip homepage to placeholder"
```

---

### Task 15: Static content module for « La maison »

Keep editorial copy out of the component, so Gautier (or the user) can edit one file without reading JSX.

**Files:**
- Create: `app/data/maison.ts`

- [ ] **Step 1: Write the content module**

```ts
// app/data/maison.ts — editorial content for /pages/la-maison
// ⚠️ À relire et valider avec Gautier avant publication.

export const MAISON_HERO = {
  headline: 'Nous éditons des récits héroïques sans compromis.',
  subhead:
    'L’héroïsme, la bravoure, le sacrifice. Une voix française, sans concession, pour réenchanter le roman populaire.',
};

export const MAISON_MANIFESTO = [
  'Le roman héroïque français contemporain a été abandonné par l’édition dominante. Entre les romans introspectifs primés et les blockbusters traduits, il n’y a plus grand-chose pour les lecteurs qui cherchent du souffle, de la chair, des enjeux plus grands que soi.',
  'Bilskirnir édite ce qui manquait. Des univers longs, des sagas denses, des personnages qui ne s’excusent pas d’exister. Une voix française qui assume ses racines nordiques autant que méditerranéennes.',
];

export type Pillar = {icon: string; title: string; body: string};

export const MAISON_PILLARS: Pillar[] = [
  {
    icon: '⚔',
    title: 'Héroïsme sans compromis',
    body:
      'Des personnages qui agissent, choisissent, échouent parfois. Pas d’antihéros désabusés pour le confort moderne.',
  },
  {
    icon: '🏛',
    title: 'Mythes et racines',
    body:
      'Nos récits puisent dans les mythologies vivantes — nordique, gréco-romaine, celte. Ce qui a nourri mille ans de littérature occidentale.',
  },
  {
    icon: '🇫🇷',
    title: 'Une voix française',
    body:
      'Écrits en France, imprimés en France, pensés depuis une sensibilité qui n’a pas à emprunter ses codes ailleurs.',
  },
  {
    icon: '✒',
    title: 'Indépendance éditoriale',
    body:
      'Maison indépendante, modèle direct-au-lecteur. Pas de distributeur qui dicte, pas de comité qui lisse.',
  },
];

export const MAISON_AUTHOR = {
  name: 'Gautier Durieux de Madron',
  photoAlt: 'Portrait de Gautier Durieux de Madron',
  photoUrl: '/images/gautier.jpg', // placeholder — real asset added later
  bio:
    'Auteur français. Fondateur de Bilskirnir. Construit depuis 2021 l’univers d’Au Nom des Dieux et ses sagas parallèles. ~140 000 lecteurs sur TikTok.',
  links: [
    {label: 'TikTok', href: 'https://tiktok.com/@bilskirnir'},
    {label: 'Instagram', href: 'https://instagram.com/bilskirnir'},
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add app/data/maison.ts
git commit -m "content: manifesto, pillars, author bio for La maison page"
```

---

### Task 16: « La maison » page route (TDD)

**Files:**
- Test: `app/routes/__tests__/pages.la-maison.test.tsx`
- Create: `app/routes/pages.la-maison.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// app/routes/__tests__/pages.la-maison.test.tsx
import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {renderWithRouter} from '~/test/render';
import LaMaison from '../pages.la-maison';

describe('Page "La maison"', () => {
  it('renders the hero headline', () => {
    renderWithRouter(<LaMaison />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /nous éditons des récits héroïques sans compromis/i,
      }),
    ).toBeInTheDocument();
  });

  it('shows the manifesto paragraphs', () => {
    renderWithRouter(<LaMaison />);
    expect(screen.getByText(/le roman héroïque français contemporain/i)).toBeInTheDocument();
    expect(screen.getByText(/bilskirnir édite ce qui manquait/i)).toBeInTheDocument();
  });

  it('renders all four pillars', () => {
    renderWithRouter(<LaMaison />);
    expect(screen.getByRole('heading', {name: /héroïsme sans compromis/i})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: /mythes et racines/i})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: /voix française/i})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: /indépendance éditoriale/i})).toBeInTheDocument();
  });

  it('renders the author block with TikTok link', () => {
    renderWithRouter(<LaMaison />);
    expect(screen.getByText(/gautier durieux de madron/i)).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /tiktok/i})).toHaveAttribute(
      'href',
      'https://tiktok.com/@bilskirnir',
    );
  });
});
```

- [ ] **Step 2: Run — expect 4 failures**

```bash
npm test -- pages.la-maison
```

- [ ] **Step 3: Implement**

```tsx
// app/routes/pages.la-maison.tsx
import {Container} from '~/components/Container';
import {Ornament} from '~/components/Ornament';
import {
  MAISON_HERO,
  MAISON_MANIFESTO,
  MAISON_PILLARS,
  MAISON_AUTHOR,
} from '~/data/maison';

export function meta() {
  return [
    {title: 'La maison — Bilskirnir'},
    {
      name: 'description',
      content:
        'Bilskirnir édite des récits héroïques sans compromis. Maison d’édition française indépendante.',
    },
  ];
}

export default function LaMaison() {
  return (
    <article>
      {/* Hero tagline */}
      <Container width="reading">
        <section style={{padding: 'var(--bsk-space-16) 0 var(--bsk-space-10)', textAlign: 'center'}}>
          <h1
            style={{
              fontSize: 'clamp(var(--bsk-text-2xl), 5vw, var(--bsk-text-4xl))',
              color: 'var(--bsk-fg-primary)',
              marginBottom: 'var(--bsk-space-5)',
            }}
          >
            {MAISON_HERO.headline}
          </h1>
          <p
            style={{
              fontFamily: 'var(--bsk-font-serif)',
              fontStyle: 'italic',
              fontSize: 'var(--bsk-text-md)',
              color: 'var(--bsk-fg-secondary)',
            }}
          >
            « {MAISON_HERO.subhead} »
          </p>
        </section>
      </Container>

      <Ornament />

      {/* Manifesto */}
      <Container width="reading">
        <section style={{padding: 'var(--bsk-space-8) 0'}}>
          <h2
            style={{
              fontSize: 'var(--bsk-text-xs)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-accent-gold)',
              fontFamily: 'var(--bsk-font-sans)',
              textAlign: 'center',
              marginBottom: 'var(--bsk-space-6)',
            }}
          >
            Pourquoi nous existons
          </h2>
          {MAISON_MANIFESTO.map((para, i) => (
            <p
              key={i}
              style={{
                fontFamily: 'var(--bsk-font-serif)',
                fontSize: 'var(--bsk-text-md)',
                lineHeight: 1.8,
                color: 'var(--bsk-fg-primary)',
                marginBottom: 'var(--bsk-space-5)',
              }}
            >
              {para}
            </p>
          ))}
        </section>
      </Container>

      <Ornament />

      {/* 4 pillars */}
      <Container>
        <section style={{padding: 'var(--bsk-space-10) 0'}}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
              gap: 'var(--bsk-space-8)',
            }}
          >
            {MAISON_PILLARS.map((p) => (
              <div key={p.title} style={{textAlign: 'center'}}>
                <div
                  style={{
                    fontSize: 'var(--bsk-text-2xl)',
                    color: 'var(--bsk-accent-gold)',
                    marginBottom: 'var(--bsk-space-3)',
                  }}
                  aria-hidden="true"
                >
                  {p.icon}
                </div>
                <h3
                  style={{
                    fontSize: 'var(--bsk-text-lg)',
                    color: 'var(--bsk-fg-primary)',
                    marginBottom: 'var(--bsk-space-3)',
                  }}
                >
                  {p.title}
                </h3>
                <p style={{color: 'var(--bsk-fg-secondary)', fontSize: 'var(--bsk-text-sm)'}}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Container>

      <Ornament />

      {/* Author block */}
      <Container width="reading">
        <section
          id="auteur"
          style={{
            padding: 'var(--bsk-space-10) 0 var(--bsk-space-16)',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 'var(--bsk-space-6)',
            alignItems: 'center',
          }}
        >
          <img
            src={MAISON_AUTHOR.photoUrl}
            alt={MAISON_AUTHOR.photoAlt}
            width={128}
            height={128}
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--bsk-accent-gold-dim)',
            }}
          />
          <div>
            <h3
              style={{
                fontSize: 'var(--bsk-text-xl)',
                color: 'var(--bsk-fg-primary)',
                marginBottom: 'var(--bsk-space-2)',
              }}
            >
              {MAISON_AUTHOR.name}
            </h3>
            <p
              style={{
                color: 'var(--bsk-fg-secondary)',
                marginBottom: 'var(--bsk-space-4)',
              }}
            >
              {MAISON_AUTHOR.bio}
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                display: 'flex',
                gap: 'var(--bsk-space-4)',
              }}
            >
              {MAISON_AUTHOR.links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="me noreferrer"
                    style={{
                      color: 'var(--bsk-accent-gold)',
                      fontSize: 'var(--bsk-text-sm)',
                      letterSpacing: 'var(--bsk-tracking-wide)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Container>
    </article>
  );
}
```

- [ ] **Step 4: Run — expect passes**

```bash
npm test -- pages.la-maison
```

- [ ] **Step 5: Visual verification**

```bash
npm run dev
```

Open http://localhost:3000/pages/la-maison. Expected:
- Hero headline in serif, centered
- Italic subtitle below
- Ornament `◈ ◈ ◈` in gold
- Manifesto paragraphs in readable serif
- 4 pillars grid
- Author block with placeholder photo (broken image is expected — real asset later)
- Footer below

Ctrl+C when verified.

- [ ] **Step 6: Commit**

```bash
git add app/routes/pages.la-maison.tsx app/routes/__tests__/
git commit -m "feat(page): /pages/la-maison with hero, manifesto, pillars, author"
```

---

### Task 17: First deployment to Oxygen

**Files:** None (deploy config lives in `.shopify/`, already gitignored).

- [ ] **Step 1: Build locally to catch prod-only issues**

```bash
npm run build
```

Expected: build succeeds, output in `dist/`. No TypeScript errors.

- [ ] **Step 2: Preview the production build**

```bash
npm run preview
```

Open the URL printed (usually http://localhost:3000). Click through header, mega-menu, footer, La maison page. Expected: behaves identically to dev. Ctrl+C.

- [ ] **Step 3: Deploy to Oxygen**

```bash
npx shopify hydrogen deploy
```

The CLI prompts for environment — pick `Production` (or create one if first deploy). Wait for the build + upload + URL assignment.

Expected output: deploy URL like `https://bilskirnir.o2.myshopify.dev` (or a custom domain if already configured).

- [ ] **Step 4: Smoke-test the deployed site**

Open the deployed URL. Verify:
- Homepage loads with tagline
- Header shows real universes in mega-menu (queried live from Shopify)
- `/pages/la-maison` renders fully
- Footer visible
- No console errors (open DevTools → Console)

- [ ] **Step 5: Document the URL**

Create `docs/deployments.md`:

```markdown
# Deployments

| Environment | URL | Shopify link |
|---|---|---|
| Production | https://<your-deploy-url> | Admin → Hydrogen → Bilskirnir Storefront |
```

- [ ] **Step 6: Commit**

```bash
git add docs/deployments.md
git commit -m "docs: record first Oxygen deployment URL"
```

- [ ] **Step 7: Push to origin**

```bash
git push origin main
```

(If `origin` isn't set yet, skip — repo lives local-only until a GitHub remote is added.)

---

## Done criteria for Plan 1

After Task 17, all of these must be true:

- [ ] `npm test` passes (all component + page tests green)
- [ ] `npm run dev` → http://localhost:3000 shows dark-mode homepage with header, mega-menu, footer
- [ ] `/pages/la-maison` renders hero + manifesto + pillars + author
- [ ] Hovering « Univers » in the header opens the mega-menu showing live Shopify collections
- [ ] Production build deployed to Oxygen, URL documented
- [ ] Shopify admin has metaobject Saga, Collection metafields, Product metafields, and sample data (1 collection + 2 tomes + 1 standalone + smart collection)
- [ ] `.env` is gitignored; `.env.example` is committed
- [ ] Repo has ≥ 10 commits mapping cleanly to the task list

---

## Handoff notes for Plan 2

Plan 2 will build on this foundation:

- The `megaMenu` loader data is already queried in root — Plan 2 can reuse it for the homepage « stand ».
- `Container`, `Ornament`, and design tokens are ready — Plan 2 pages should use them, never hard-code values.
- The sample data (`Au Nom des Dieux` + 2 tomes + `Berserker`) is enough to exercise the homepage slideshow, page univers, fiche tome, and fiche one-shot. Extra sample data can be added by the user as Gautier firms up the catalogue.
- If the user decides to change fonts (spec §6.1 left the distinctive serif open), it's a one-line swap in `root.tsx` imports + `tokens.css` font family.

---

## Known deferred items (track, don't implement in Plan 1)

- Mega-menu « À paraître » column is empty — filled in Plan 2 once we query products with `release_status = announced`.
- Newsletter form posts to `/api/newsletter` (404 for now) — Plan 3 wires it to Shopify or a newsletter provider.
- Gautier's real photo + bio: placeholder; swap `MAISON_AUTHOR.photoUrl` when he provides the asset.
- Policy pages (`/policies/*`) 404 until Gautier fills them in Shopify admin.
- Search (`/search`) and Account (`/account`) use Hydrogen skeleton defaults — no custom styling yet.
