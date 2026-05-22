# Bilskirnir — Page « La maison » immersive — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre `/pages/la-maison` selon la maquette : hero centré (emblème en grand + glow doré + titre + sous-titre), manifeste « Pourquoi nous existons », 4 piliers en grille 2×2 avec icônes, et bloc fondateur (avatar à initiales doré + bio + liens TikTok/Instagram).

**Architecture:** On restyle la route statique `pages.la-maison.tsx` (le contenu éditorial validé vit déjà dans `~/data/maison.ts` — on le conserve). On réutilise le composant `Logo` (emblème blanc) et l'`Ornament` (✦), et on ajoute une feuille `maison.css` pour le glow + la cascade d'entrée. Page non-immersive (Header/Footer globaux). Composant testable car la route est statique (pas de loader).

**Tech Stack:** Hydrogen (React Router v7), TypeScript, Vitest + Testing Library, Vanilla CSS (`--bsk-*` + `maison.css`).

**Spec:** `docs/superpowers/specs/2026-05-22-bilskirnir-visual-redesign.md` (§3.5)
**Maquette:** `docs/superpowers/mockups/2026-05-22-visual-redesign/06-maison-mobile.html`

---

## Décisions de cadrage

1. **Contenu conservé** : `~/data/maison.ts` (copie éditoriale validée) reste la source ; on ne change que la présentation. Les libellés exacts du mockup (« Ramener de l'héroïsme. ») diffèrent du contenu validé — on garde le contenu validé (modifiable trivialement dans `data/maison.ts`).
2. **Avatar fondateur** : la vraie photo n'est pas fournie → on rend un **avatar à initiales** (« GD », bordure dorée), conforme au mockup, sans dépendre d'un asset. (`founder-placeholder.svg` existe mais l'initiale est plus propre.)
3. **Icônes piliers** : SVG au trait (or) comme le mockup, dans l'ordre des 4 piliers de `data/maison.ts`.

---

## Prerequisites

- [ ] `cd storefront && npm test` vert.
- [ ] `~/data/maison.ts` exporte `MAISON_HERO`, `MAISON_MANIFESTO`, `MAISON_PILLARS`, `MAISON_AUTHOR`.
- [ ] `~/components/Logo` (emblème), `~/components/Ornament` (✦) présents.

---

## File Structure

```
storefront/app/
├── styles/
│   ├── ✨ maison.css                  (hero glow + cascade + reduced-motion)
│   └── __tests__/✨ maisonCss.test.ts
└── routes/
    ├── ✏️ pages.la-maison.tsx          (restyle complet : hero emblème, manifeste, piliers 2×2, fondateur)
    └── __tests__/✨ la-maison.test.tsx  (render statique)
```

---

## Tasks

### Task 1: `maison.css`

**Files:**
- Create: `storefront/app/styles/maison.css`
- Test: `storefront/app/styles/__tests__/maisonCss.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/styles/__tests__/maisonCss.test.ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const css = readFileSync(resolve(process.cwd(), 'app/styles/maison.css'), 'utf8');

describe('maison.css', () => {
  it('hero avec glow doré et cascade', () => {
    expect(css).toContain('.maison-hero');
    expect(css).toMatch(/@keyframes\s+maison-rise/);
  });
  it('grille de piliers', () => {
    expect(css).toContain('.maison-pillars');
  });
  it('reduced-motion', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- maisonCss
```

- [ ] **Step 3: Create `maison.css`**

```css
/* app/styles/maison.css — page La maison */

.maison-hero {
  position: relative;
  text-align: center;
  padding: 64px 26px 40px;
  overflow: hidden;
}
.maison-hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(70% 50% at 50% 18%, var(--bsk-uni-soft), transparent 60%), var(--bsk-bg-base);
}
.maison-rise {
  position: relative;
  z-index: 2;
}
.maison-rise > * {
  opacity: 0;
  transform: translateY(18px);
  animation: maison-rise 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
}
.maison-rise > *:nth-child(2) { animation-delay: 0.12s; }
.maison-rise > *:nth-child(3) { animation-delay: 0.24s; }

.maison-pillars {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.maison-pillar {
  border: 1px solid var(--bsk-border-subtle);
  border-radius: 16px;
  padding: 20px 16px;
  background: var(--bsk-bg-raised);
  text-align: center;
}
.maison-pillar svg {
  width: 30px;
  height: 30px;
  color: var(--bsk-accent-gold);
  margin-bottom: 12px;
}
.maison-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin: 0 auto 18px;
  border: 2px solid var(--bsk-accent-gold);
  background: linear-gradient(160deg, #2a2b33, #16171c);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--bsk-font-display);
  font-weight: 700;
  font-size: 34px;
  color: var(--bsk-accent-gold);
}
.maison-soc {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--bsk-border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bsk-fg-primary);
  transition: 0.3s;
}
.maison-soc:hover {
  border-color: var(--bsk-accent-gold);
  color: var(--bsk-accent-gold);
}
.maison-soc svg { width: 19px; height: 19px; }

@media (prefers-reduced-motion: reduce) {
  .maison-rise > * { opacity: 1; transform: none; animation: none; }
}

@keyframes maison-rise { to { opacity: 1; transform: none; } }
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- maisonCss
```

- [ ] **Step 5: Commit**

```bash
git add app/styles/maison.css app/styles/__tests__/maisonCss.test.ts
git commit -m "feat(maison): maison.css (hero glow + cascade)"
```

---

### Task 2: Restyle `pages.la-maison.tsx`

**Files:**
- Modify: `storefront/app/routes/pages.la-maison.tsx`
- Test: `storefront/app/routes/__tests__/la-maison.test.tsx` (create)

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/routes/__tests__/la-maison.test.tsx
import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import LaMaison from '../pages.la-maison';
import {MAISON_AUTHOR, MAISON_PILLARS} from '~/data/maison';

describe('La maison', () => {
  it('rend le hero, le manifeste, les 4 piliers et le fondateur', () => {
    renderWithRouter(<LaMaison />);
    expect(screen.getByRole('heading', {level: 1})).toBeInTheDocument();
    expect(screen.getByText('Pourquoi nous existons')).toBeInTheDocument();
    MAISON_PILLARS.forEach((p) =>
      expect(screen.getByText(p.title)).toBeInTheDocument(),
    );
    expect(screen.getByText(MAISON_AUTHOR.name)).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /TikTok/i})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Instagram/i})).toBeInTheDocument();
  });
});
```

> Le default export de `pages.la-maison.tsx` est rendu directement (route statique, sans loader).

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- la-maison
```

- [ ] **Step 3: Réécrire `pages.la-maison.tsx`**

```tsx
// storefront/app/routes/pages.la-maison.tsx
import {Container} from '~/components/Container';
import {Ornament} from '~/components/Ornament';
import {Logo} from '~/components/Logo';
import {
  MAISON_HERO,
  MAISON_MANIFESTO,
  MAISON_PILLARS,
  MAISON_AUTHOR,
} from '~/data/maison';
import '~/styles/maison.css';

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

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const PILLAR_ICONS = [
  <svg key="0" {...svgProps}><path d="M14.5 4.5L20 10l-2 2-5.5-5.5zM12.5 6.5L5 14l-1 5 5-1 7.5-7.5" /></svg>,
  <svg key="1" {...svgProps}><path d="M12 3v18M12 8c0-2 2-3 4-3M12 8c0-2-2-3-4-3M12 13c0-2 2-3 4-3M12 13c0-2-2-3-4-3M8 21h8" /></svg>,
  <svg key="2" {...svgProps}><path d="M5 19l9-9 1.5 1.5-9 9H5zM14 10l3-3a2 2 0 0 0-3-3l-3 3" /></svg>,
  <svg key="3" {...svgProps}><path d="M5 4v16l7-3 7 3V4z" /></svg>,
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => /^[A-ZÀ-Ý]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
}

export default function LaMaison() {
  return (
    <article>
      <header className="maison-hero">
        <div className="maison-hero-bg" />
        <div className="maison-rise">
          <div style={{marginBottom: '22px'}}>
            <span style={{display: 'inline-block'}}>
              <Logo height={96} />
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--bsk-font-display)',
              fontWeight: 800,
              fontSize: 'clamp(36px, 9vw, 42px)',
              lineHeight: 0.98,
              letterSpacing: '-0.02em',
              marginBottom: '14px',
              color: 'var(--bsk-fg-primary)',
            }}
          >
            {MAISON_HERO.headline}
          </h1>
          <p
            style={{
              fontStyle: 'italic',
              fontSize: 'var(--bsk-text-read)',
              lineHeight: 1.5,
              color: '#d7cdb6',
              maxWidth: '320px',
              margin: '0 auto',
            }}
          >
            « {MAISON_HERO.subhead} »
          </p>
        </div>
      </header>

      <Container width="reading">
        <section style={{padding: 'var(--bsk-space-8) 0', textAlign: 'center'}}>
          <div
            style={{
              fontSize: 'var(--bsk-text-xs)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-accent-gold)',
              marginBottom: 'var(--bsk-space-4)',
            }}
          >
            Pourquoi nous existons
          </div>
          {MAISON_MANIFESTO.map((para, i) => (
            <p
              key={i}
              style={{
                fontSize: 'var(--bsk-text-read)',
                lineHeight: 1.78,
                color: 'var(--bsk-fg-primary)',
                marginBottom: 'var(--bsk-space-4)',
                textAlign: 'left',
              }}
            >
              {para}
            </p>
          ))}
        </section>
      </Container>

      <Ornament />

      <Container width="content">
        <section style={{padding: 'var(--bsk-space-8) 0'}}>
          <h2
            style={{
              fontFamily: 'var(--bsk-font-display)',
              fontWeight: 700,
              fontSize: 'var(--bsk-text-xl)',
              textAlign: 'center',
              marginBottom: 'var(--bsk-space-6)',
              color: 'var(--bsk-fg-primary)',
            }}
          >
            Nos quatre piliers
          </h2>
          <div className="maison-pillars">
            {MAISON_PILLARS.map((p, i) => (
              <div key={p.title} className="maison-pillar">
                {PILLAR_ICONS[i] ?? null}
                <div
                  style={{
                    fontFamily: 'var(--bsk-font-display)',
                    fontWeight: 600,
                    fontSize: 'var(--bsk-text-base)',
                    marginBottom: '7px',
                    color: 'var(--bsk-fg-primary)',
                  }}
                >
                  {p.title}
                </div>
                <div style={{fontSize: 'var(--bsk-text-sm)', lineHeight: 1.45, color: 'var(--bsk-fg-secondary)'}}>
                  {p.body}
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>

      <Ornament />

      <Container width="reading">
        <section id="auteur" style={{padding: 'var(--bsk-space-10) 0 var(--bsk-space-12)', textAlign: 'center'}}>
          <div
            style={{
              fontSize: 'var(--bsk-text-xs)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-accent-gold)',
              marginBottom: 'var(--bsk-space-3)',
            }}
          >
            L'auteur fondateur
          </div>
          <div className="maison-avatar">{initials(MAISON_AUTHOR.name)}</div>
          <h3
            style={{
              fontFamily: 'var(--bsk-font-display)',
              fontWeight: 700,
              fontSize: 'var(--bsk-text-xl)',
              marginBottom: 'var(--bsk-space-3)',
              color: 'var(--bsk-fg-primary)',
            }}
          >
            {MAISON_AUTHOR.name}
          </h3>
          <p
            style={{
              fontSize: 'var(--bsk-text-base)',
              lineHeight: 1.65,
              color: 'var(--bsk-fg-primary)',
              maxWidth: '320px',
              margin: '0 auto var(--bsk-space-5)',
            }}
          >
            {MAISON_AUTHOR.bio}
          </p>
          <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '12px', justifyContent: 'center'}}>
            {MAISON_AUTHOR.links.map((l) => (
              <li key={l.href}>
                <a
                  className="maison-soc"
                  href={l.href}
                  target="_blank"
                  rel="me noreferrer"
                  aria-label={l.label}
                >
                  {l.label === 'TikTok' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.3 2.2 1.6 3.7 3.8 4v2.6c-1.3 0-2.6-.4-3.8-1.1V15a5.4 5.4 0 1 1-5.4-5.4c.3 0 .5 0 .8.06v2.7a2.7 2.7 0 1 0 1.9 2.6V3z" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></svg>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </article>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- la-maison
```

- [ ] **Step 5: Build + commit**

```bash
cd storefront && npm run build
git add app/routes/pages.la-maison.tsx app/routes/__tests__/la-maison.test.tsx
git commit -m "feat(maison): page La maison immersive (hero embleme, manifeste, piliers, fondateur)"
```

---

### Task 3: Sanity + revue visuelle

- [ ] **Step 1: Suite + build**

```bash
cd storefront && npm test && npm run build
```

- [ ] **Step 2: Dev** — `/pages/la-maison` : emblème en grand + glow, manifeste, 4 piliers 2×2 avec icônes, avatar « GD » doré + bio + TikTok/Instagram, footer global. Reduced-motion neutralise la cascade.

---

## Self-review (couverture §3.5)

| Élément | Tâche |
|---|---|
| Hero emblème + glow + titre + sous-titre | Task 1, 2 |
| Manifeste « Pourquoi nous existons » | Task 2 |
| 4 piliers grille 2×2 + icônes | Task 1, 2 |
| Fondateur (avatar, bio, TikTok/Instagram) | Task 2 |
| Footer complet | global (page non-immersive) |

**Différé :** vraie photo fondateur (avatar à initiales en attendant) ; version desktop dédiée (responsive depuis mobile).
