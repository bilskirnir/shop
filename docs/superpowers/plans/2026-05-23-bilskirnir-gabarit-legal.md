# Bilskirnir — Gabarit pages légales / info — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donner un gabarit générique neutre (gris + doré) aux pages légales/info (CGU, mentions, CGV, livraison & retours, confidentialité, contact) : en-tête (label, titre, date), contenu Shopify lisible avec **articles `h2` numérotés en doré** (compteurs CSS) et **listes à puces `✦`**, lien « revenir en haut », footer.

**Architecture:** Un composant présentiel `LegalLayout` (label optionnel, titre, date optionnelle, `children`) + une feuille `legal.css` qui stylise le contenu via la classe `.legal-body` **sans le parser** : compteurs CSS pour numéroter les `h2`, `✦` sur les `li`. Le contenu HTML Shopify (déjà injecté par les routes existantes pour ce contenu de confiance) reste rendu **dans la route** (on ne déplace pas l'injection dans un nouveau composant), enveloppé par `LegalLayout` et porteur de la classe `.legal-body`. Pages non-immersives.

**Tech Stack:** Hydrogen (React Router v7), TypeScript, Vitest + Testing Library, Vanilla CSS.

**Spec:** §3.7. **Maquette:** `08-cgu-legal-template-mobile.html`.

---

## Décisions de cadrage

1. **Numérotation des articles via compteurs CSS** sur les `h2` du corps Shopify (pas de parsing). Sans `h2`, pas de numéro (dégradation propre).
2. **Sommaire ancré (TOC) : différé** (extraction de titres du HTML arbitraire).
3. **Contenu = pages/policies Shopify** (rich text). L'injection HTML existe déjà dans `policies.$handle`/`pages.$handle` pour ce contenu **de confiance (CMS first-party)** ; on la conserve telle quelle et on l'enveloppe. Le texte juridique réel reste à rédiger côté Shopify (hors code).
4. Pages non-immersives.

---

## Prerequisites

- [ ] `cd storefront && npm test` vert.
- [ ] Routes existantes : `policies.$handle.tsx` (rend `policy.body`), `pages.$handle.tsx` (rend `page.body`), `policies._index.tsx`.

---

## File Structure

```
storefront/app/
├── styles/
│   ├── ✨ legal.css                   (en-tête + .legal-body : h2 numérotés, ✦, liens)
│   └── __tests__/✨ legalCss.test.ts
├── components/
│   ├── ✨ LegalLayout.tsx             (label, titre, date, children — PAS d'injection HTML)
│   └── __tests__/✨ LegalLayout.test.tsx
└── routes/
    ├── ✏️ policies.$handle.tsx         (envelopper le corps dans LegalLayout + classe legal-body)
    ├── ✏️ pages.$handle.tsx            (idem)
    └── ✏️ policies._index.tsx          (liste stylée des politiques)
```

---

## Tasks

### Task 1: `legal.css`

**Files:**
- Create: `storefront/app/styles/legal.css`
- Test: `storefront/app/styles/__tests__/legalCss.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/styles/__tests__/legalCss.test.ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const css = readFileSync(resolve(process.cwd(), 'app/styles/legal.css'), 'utf8');

describe('legal.css', () => {
  it('numérote les h2 via compteur CSS', () => {
    expect(css).toContain('counter-reset');
    expect(css).toMatch(/counter-increment:\s*legal-art/);
    expect(css).toContain('counter(legal-art');
  });
  it('puces ✦ sur les li', () => {
    expect(css).toContain('.legal-body li::before');
    expect(css).toContain('"✦"');
  });
  it('classe en-tête', () => {
    expect(css).toContain('.legal-head');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- legalCss
```

- [ ] **Step 3: Create `legal.css`**

```css
/* app/styles/legal.css — gabarit pages légales/info */

.legal-head {
  padding: 26px 0 22px;
  border-bottom: 1px solid var(--bsk-border-subtle);
}
.legal-head .legal-k {
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--bsk-accent-gold);
  margin-bottom: 10px;
}
.legal-head h1 {
  font-family: var(--bsk-font-display);
  font-weight: 800;
  font-size: var(--bsk-text-2xl);
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: var(--bsk-fg-primary);
}
.legal-head .legal-upd {
  font-size: 12px;
  color: var(--bsk-fg-secondary);
  margin-top: 10px;
}

.legal-body {
  counter-reset: legal-art;
  padding: 8px 0 10px;
}
.legal-body h2 {
  counter-increment: legal-art;
  font-family: var(--bsk-font-display);
  font-weight: 700;
  font-size: var(--bsk-text-lg);
  color: var(--bsk-fg-primary);
  margin: 26px 0 14px;
}
.legal-body h2::before {
  content: counter(legal-art, decimal-leading-zero) "  ";
  color: var(--bsk-accent-gold);
}
.legal-body h3 {
  font-family: var(--bsk-font-display);
  font-weight: 600;
  font-size: var(--bsk-text-base);
  color: var(--bsk-fg-primary);
  margin: 18px 0 10px;
}
.legal-body p {
  font-size: var(--bsk-text-read);
  line-height: 1.75;
  color: var(--bsk-fg-primary);
  margin-bottom: 12px;
}
.legal-body ul,
.legal-body ol {
  margin: 0 0 12px 2px;
  padding: 0;
  list-style: none;
}
.legal-body li {
  font-size: var(--bsk-text-read);
  line-height: 1.7;
  color: var(--bsk-fg-primary);
  padding-left: 20px;
  position: relative;
  margin-bottom: 7px;
}
.legal-body li::before {
  content: "✦";
  position: absolute;
  left: 0;
  top: 4px;
  color: var(--bsk-accent-gold);
  font-size: 11px;
}
.legal-body a { color: var(--bsk-accent-gold); text-decoration: underline; }
.legal-body strong,
.legal-body b { color: var(--bsk-fg-primary); font-weight: 600; }
.legal-backtop {
  display: inline-block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--bsk-accent-gold);
  text-decoration: none;
}
.legal-toc a {
  display: block;
  color: var(--bsk-fg-primary);
  font-size: 14px;
  text-decoration: none;
  padding: 8px 0;
  border-bottom: 1px solid rgba(236, 228, 211, 0.06);
}
.legal-toc a:hover { color: var(--bsk-accent-gold); }
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- legalCss
```

- [ ] **Step 5: Commit**

```bash
git add app/styles/legal.css app/styles/__tests__/legalCss.test.ts
git commit -m "feat(legal): legal.css (gabarit, h2 numerotes, puces croix)"
```

---

### Task 2: `LegalLayout` (sans injection HTML — `children`)

**Files:**
- Create: `storefront/app/components/LegalLayout.tsx`
- Test: `storefront/app/components/__tests__/LegalLayout.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/LegalLayout.test.tsx
import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {LegalLayout} from '../LegalLayout';

describe('LegalLayout', () => {
  it('rend label, titre et children dans .legal-body', () => {
    const {container} = renderWithRouter(
      <LegalLayout label="Informations légales" title="CGU">
        <h2>Objet</h2>
        <p>Texte.</p>
      </LegalLayout>,
    );
    expect(screen.getByText('Informations légales')).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 1, name: 'CGU'})).toBeInTheDocument();
    expect(container.querySelector('.legal-body h2')?.textContent).toBe('Objet');
  });

  it('affiche la date si fournie + lien revenir en haut', () => {
    renderWithRouter(
      <LegalLayout title="X" updatedLabel="Dernière mise à jour : 23 mai 2026">
        <p>c</p>
      </LegalLayout>,
    );
    expect(screen.getByText(/Dernière mise à jour/)).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Revenir en haut/i})).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- LegalLayout
```

- [ ] **Step 3: Implement**

```tsx
// storefront/app/components/LegalLayout.tsx
import type {ReactNode} from 'react';
import {Container} from './Container';

export function LegalLayout({
  label,
  title,
  updatedLabel,
  children,
}: {
  label?: string | null;
  title: string;
  updatedLabel?: string | null;
  children: ReactNode;
}) {
  return (
    <Container width="reading">
      <div id="top" className="legal-head">
        {label ? <div className="legal-k">{label}</div> : null}
        <h1>{title}</h1>
        {updatedLabel ? <div className="legal-upd">{updatedLabel}</div> : null}
      </div>
      <div className="legal-body">{children}</div>
      <a className="legal-backtop" href="#top">↑ Revenir en haut</a>
      <div style={{height: 'var(--bsk-space-8)'}} />
    </Container>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- LegalLayout
```

- [ ] **Step 5: Commit**

```bash
git add app/components/LegalLayout.tsx app/components/__tests__/LegalLayout.test.tsx
git commit -m "feat(legal): LegalLayout (en-tete + children stylises)"
```

---

### Task 3: Recâbler `policies.$handle.tsx` (Edit, conserver l'injection existante)

**But :** envelopper le rendu du corps dans `LegalLayout`. **Ne pas réécrire** la ligne d'injection HTML existante (`policy.body`) ; la conserver et lui **ajouter `className="legal-body"`** retiré au profit du wrapper — en pratique : garder le `<div>` d'injection tel quel comme **enfant** de `LegalLayout` (le wrapper `.legal-body` est fourni par `LegalLayout`).

**Files:**
- Modify: `storefront/app/routes/policies.$handle.tsx` (via **Edit**, pas Write)

- [ ] **Step 1: Ajouter les imports** (Edit)

Après les imports existants, ajouter :

```tsx
import {LegalLayout} from '~/components/LegalLayout';
import '~/styles/legal.css';
```

- [ ] **Step 2: Envelopper le rendu** (Edit)

Dans `export default function Policy()`, remplacer le `return (...)` actuel par un `LegalLayout` qui contient **le `<div>` d'injection HTML existant inchangé** (celui qui rend `policy.body`) :

- `label` = `"Informations légales"`
- `title` = `policy.title`
- enfant = le `<div>` d'injection HTML existant (rendant `policy.body`), **tel quel**.

Retirer l'ancien wrapper `.policy`, le `<br>` et le lien « ← Back to Policies » (un lien retour stylé n'est pas nécessaire dans le gabarit ; `LegalLayout` fournit « Revenir en haut »).

- [ ] **Step 3: Build**

```bash
cd storefront && npm run build
```

Expected : OK (le contenu s'affiche dans `.legal-body`, h2 numérotés).

- [ ] **Step 4: Commit**

```bash
git add app/routes/policies.$handle.tsx
git commit -m "feat(legal): policies.\$handle enveloppe dans LegalLayout"
```

---

### Task 4: Recâbler `pages.$handle.tsx` (Edit)

**Files:**
- Modify: `storefront/app/routes/pages.$handle.tsx` (via **Edit**)

- [ ] **Step 1: Imports** (Edit)

```tsx
import {LegalLayout} from '~/components/LegalLayout';
import '~/styles/legal.css';
```

- [ ] **Step 2: Envelopper** (Edit)

Dans `export default function Page()`, remplacer le `return` : `LegalLayout` avec `title={page.title}` (pas de `label`), enfant = le `<main>`/`<div>` d'injection HTML existant (rendant `page.body`) **conservé tel quel** (on peut le transformer en `<div>` neutre, l'injection reste identique).

- [ ] **Step 3: Build + commit**

```bash
cd storefront && npm run build
git add app/routes/pages.$handle.tsx
git commit -m "feat(legal): pages.\$handle enveloppe dans LegalLayout"
```

---

### Task 5: Restyle `policies._index.tsx`

**Files:**
- Modify: `storefront/app/routes/policies._index.tsx`
- Test: `storefront/app/routes/__tests__/policies-index.test.ts` (create)

- [ ] **Step 1: Lire la structure actuelle**

```bash
cd storefront && cat app/routes/policies._index.tsx
```

Repérer le nom du champ renvoyé par le loader (probablement `policies`) et la query.

- [ ] **Step 2: Write the failing test (source)**

```ts
// storefront/app/routes/__tests__/policies-index.test.ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const src = readFileSync(resolve(process.cwd(), 'app/routes/policies._index.tsx'), 'utf8');

describe('policies._index', () => {
  it('importe legal.css et stylise la liste (classe legal-toc / legal-head)', () => {
    expect(src).toContain("'~/styles/legal.css'");
    expect(src).toContain('legal-toc');
  });
});
```

- [ ] **Step 3: Run — expect FAIL**

```bash
cd storefront && npm test -- policies-index
```

- [ ] **Step 4: Réécrire le rendu** (conserver loader + query)

```tsx
import {Link, useLoaderData} from 'react-router';
import {Container} from '~/components/Container';
import '~/styles/legal.css';
import type {Route} from './+types/policies._index';

// ... CONSERVER le loader et la query existants tels quels ...

export default function Policies() {
  const {policies} = useLoaderData<typeof loader>();
  const items = (policies as Array<{id: string; title: string; handle: string} | null>).filter(
    (p): p is {id: string; title: string; handle: string} => Boolean(p),
  );
  return (
    <Container width="reading">
      <div id="top" className="legal-head">
        <div className="legal-k">Informations</div>
        <h1>Informations légales</h1>
      </div>
      <nav className="legal-toc" style={{paddingTop: 'var(--bsk-space-4)'}}>
        {items.map((policy) => (
          <Link key={policy.id} to={`/policies/${policy.handle}`}>
            {policy.title}
          </Link>
        ))}
      </nav>
      <div style={{height: 'var(--bsk-space-8)'}} />
    </Container>
  );
}
```

> Adapter le nom du champ si le loader ne renvoie pas `policies`. Garder loader/query inchangés.

- [ ] **Step 5: Run + build**

```bash
cd storefront && npm test -- policies-index && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add app/routes/policies._index.tsx app/routes/__tests__/policies-index.test.ts
git commit -m "feat(legal): policies._index stylise"
```

---

### Task 6: Sanity + revue visuelle

- [ ] **Step 1: Suite + build**

```bash
cd storefront && npm test && npm run build
```

- [ ] **Step 2: Dev** — `/policies`, une politique (`/policies/<handle>`), une `/pages/<handle>` : en-tête label/titre, `h2` numérotés en doré, puces `✦`, « Revenir en haut », footer. Aucune erreur.

---

## Self-review (couverture §3.7)

| Élément | Tâche |
|---|---|
| En-tête (label, titre, date) | Task 2 |
| Articles numérotés (n° doré) | Task 1 |
| Texte lisible 17px, listes `✦` | Task 1 |
| « Revenir en haut » | Task 2 |
| Contenu pages/policies Shopify | Task 3, 4 (injection conservée) |
| Footer | global |

**Différé :** sommaire ancré auto ; rédaction du contenu juridique (Shopify) ; desktop dédié.
