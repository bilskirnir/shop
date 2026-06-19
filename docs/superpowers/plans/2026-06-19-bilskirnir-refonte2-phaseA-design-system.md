# Refonte 2 — Phase A : Design system « encre » — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Poser la fondation visuelle « encre » (palette encre/crème + accent par univers, polices Bricolage Grotesque + Inter, résolution de couleur, atomes CSS, nav restylée) dont dépendent les phases B/C/D.

**Architecture:** On fait évoluer les tokens existants (`tokens.css`) vers la palette encre tout en gardant des alias de compat (les pages non encore refondues ne cassent pas). On ajoute 2 familles de polices auto-hébergées (même pattern woff2 que l'existant). On crée `atoms.css` (boutons/badges/champs/stepper/puces/halo/grain). On étend le helper d'accent et on restyle `ImmersiveNav`.

**Tech Stack:** Hydrogen (React Router 7) + CSS modules globaux importés par route, Vitest + Testing Library. Green bar = `npm test` + `npm run build` (depuis `storefront/`). `npm run typecheck` a des erreurs de scaffold préexistantes hors périmètre.

## Global Constraints

- Palette encre : fond `#0b0b0c`, texte crème `#f2efe7`. **Zéro doré** dans les nouveaux composants.
- Accent par univers/saga via la CSS var `--bsk-uni` (déjà existante) ; **crème neutre** quand aucune couleur n'est définie.
- Polices : **Bricolage Grotesque** (600, 800) pour les titres/display, **Inter** (400, 500, 600) pour labels/corps. Auto-hébergées en woff2 dans `app/assets/fonts/` + `@font-face` dans `app/styles/fonts.css`.
- Rayon CTA pill = `999px` ; champs/cartes gardent `var(--bsk-radius)` (14px).
- Tous les chemins relatifs partent de `storefront/`.

---

## Task 1: Polices Bricolage Grotesque + Inter (auto-hébergées)

**Files:**
- Add: `app/assets/fonts/bricolage-grotesque-600.woff2`, `bricolage-grotesque-800.woff2`, `inter-400.woff2`, `inter-500.woff2`, `inter-600.woff2`
- Modify: `app/styles/fonts.css`

**Interfaces:**
- Produces: familles CSS `"Bricolage Grotesque"` (600/800) et `"Inter"` (400/500/600) disponibles globalement.

- [ ] **Step 1: Récupérer les woff2 via les paquets @fontsource**

Les deux polices sont libres (OFL). `@fontsource-variable/inter` est déjà une dépendance ; ajouter Bricolage :

```bash
npm i @fontsource/bricolage-grotesque
```

Copier les fichiers woff2 statiques depuis `node_modules` vers les assets (poids latin, normal) :

```bash
cp node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-600-normal.woff2 app/assets/fonts/bricolage-grotesque-600.woff2
cp node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff2 app/assets/fonts/bricolage-grotesque-800.woff2
cp node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2 app/assets/fonts/inter-400.woff2
cp node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2 app/assets/fonts/inter-500.woff2
cp node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2 app/assets/fonts/inter-600.woff2
```

> Si `@fontsource/inter` (non-variable) n'est pas présent, l'installer : `npm i @fontsource/inter`. Les chemins `files/*.woff2` sont stables sur @fontsource.

- [ ] **Step 2: Vérifier que les 5 fichiers existent**

Run: `ls -la app/assets/fonts/ | grep -E "bricolage|inter"`
Expected: 5 fichiers woff2 listés, taille > 0.

- [ ] **Step 3: Ajouter les `@font-face` dans `fonts.css`**

Ajouter à la fin de `app/styles/fonts.css` :

```css
@font-face{font-family:"Bricolage Grotesque";src:url("../assets/fonts/bricolage-grotesque-600.woff2") format("woff2");font-weight:600;font-style:normal;font-display:swap}
@font-face{font-family:"Bricolage Grotesque";src:url("../assets/fonts/bricolage-grotesque-800.woff2") format("woff2");font-weight:800;font-style:normal;font-display:swap}
@font-face{font-family:"Inter";src:url("../assets/fonts/inter-400.woff2") format("woff2");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"Inter";src:url("../assets/fonts/inter-500.woff2") format("woff2");font-weight:500;font-style:normal;font-display:swap}
@font-face{font-family:"Inter";src:url("../assets/fonts/inter-600.woff2") format("woff2");font-weight:600;font-style:normal;font-display:swap}
```

- [ ] **Step 4: Vérifier le build**

Run: `npm run build`
Expected: build OK (les woff2 sont bundlés comme assets, comme Cabinet Grotesk/Switzer).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json app/assets/fonts/ app/styles/fonts.css
git commit -m "feat(design): polices Bricolage Grotesque + Inter auto-hebergees"
```

---

## Task 2: Tokens « encre »

**Files:**
- Modify: `app/styles/tokens.css`
- Test: `app/styles/__tests__/tokens.test.ts` (créer)

**Interfaces:**
- Produces: vars `--bsk-ink`, `--bsk-cream`, `--bsk-grain-opacity`, familles `--bsk-font-display` (Bricolage) et `--bsk-font-sans` (Inter) ; `--bsk-uni` conservée (accent univers, défaut crème neutre).

- [ ] **Step 1: Écrire le test (échec attendu)**

Créer `app/styles/__tests__/tokens.test.ts` :

```ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const css = readFileSync(
  fileURLToPath(new URL('../tokens.css', import.meta.url)),
  'utf8',
);

describe('tokens encre', () => {
  it('définit la palette encre/crème', () => {
    expect(css).toContain('--bsk-ink: #0b0b0c');
    expect(css).toContain('--bsk-cream: #f2efe7');
  });
  it('bascule les familles vers Bricolage + Inter', () => {
    expect(css).toMatch(/--bsk-font-display:\s*"Bricolage Grotesque"/);
    expect(css).toMatch(/--bsk-font-sans:\s*"Inter"/);
  });
  it("garde --bsk-uni avec un défaut crème neutre", () => {
    expect(css).toMatch(/--bsk-uni:\s*var\(--bsk-cream\)/);
  });
});
```

- [ ] **Step 2: Lancer le test, vérifier l'échec**

Run: `npm test -- tokens`
Expected: FAIL (les vars n'existent pas encore).

- [ ] **Step 3: Modifier `tokens.css`**

Dans `app/styles/tokens.css`, **ajouter** dans `:root` (après le bloc background, sans supprimer les anciennes vars pour ne pas casser les pages non refondues) :

```css
  /* ── Refonte 2 « encre » ─────────────────────────────────────── */
  --bsk-ink: #0b0b0c;               /* fond encre (nouveau base) */
  --bsk-cream: #f2efe7;             /* texte crème (nouveau primary) */
  --bsk-grain-opacity: 0.35;
```

Puis **remplacer** les 4 lignes des familles de polices et de l'accent :

```css
  --bsk-font-display: "Bricolage Grotesque", system-ui, sans-serif;
  --bsk-font-serif: "Bricolage Grotesque", system-ui, sans-serif;
  --bsk-font-sans: "Inter", system-ui, -apple-system, sans-serif;
```

et la ligne de `--bsk-uni` (défaut neutre) :

```css
  --bsk-uni: var(--bsk-cream);     /* accent univers — crème neutre par défaut */
```

- [ ] **Step 4: Lancer le test, vérifier le succès**

Run: `npm test -- tokens`
Expected: PASS.

- [ ] **Step 5: Vérifier la suite + build**

Run: `npm test` puis `npm run build`
Expected: tout vert, build OK (les pages existantes héritent des nouvelles familles/teintes sans casse — c'est voulu).

- [ ] **Step 6: Commit**

```bash
git add app/styles/tokens.css app/styles/__tests__/tokens.test.ts
git commit -m "feat(design): tokens encre (palette + Bricolage/Inter + accent neutre)"
```

---

## Task 3: Helper de résolution d'accent (saga → univers → neutre)

**Files:**
- Modify: `app/lib/universeAccent.ts`
- Test: `app/lib/__tests__/universeAccent.test.ts`

**Interfaces:**
- Consumes: rien.
- Produces: `resolveAccentColor(sagaColor?: string|null, universeColor?: string|null): string | null` (1ʳᵉ couleur hex valide, sinon `null`). `universeAccentStyle` inchangée (déjà : `null/invalide → {}` = neutre).

- [ ] **Step 1: Écrire le test (échec attendu)**

Ajouter dans `app/lib/__tests__/universeAccent.test.ts` :

```ts
import {resolveAccentColor} from '../universeAccent';

describe('resolveAccentColor', () => {
  it('priorise la couleur de saga', () => {
    expect(resolveAccentColor('#2fb6c4', '#e0533f')).toBe('#2fb6c4');
  });
  it("retombe sur la couleur d'univers si pas de saga", () => {
    expect(resolveAccentColor(null, '#e0533f')).toBe('#e0533f');
  });
  it('ignore une couleur invalide et descend dans la cascade', () => {
    expect(resolveAccentColor('rouge', '#e0533f')).toBe('#e0533f');
    expect(resolveAccentColor('rouge', 'aussi-invalide')).toBeNull();
  });
  it('retourne null si rien (= neutre crème)', () => {
    expect(resolveAccentColor(null, null)).toBeNull();
  });
});
```

- [ ] **Step 2: Lancer le test, vérifier l'échec**

Run: `npm test -- universeAccent`
Expected: FAIL — `resolveAccentColor` non exporté.

- [ ] **Step 3: Ajouter la fonction dans `universeAccent.ts`**

Ajouter (le `HEX` existe déjà en haut du fichier) :

```ts
/**
 * Résout la couleur d'accent à appliquer : saga d'abord, puis univers, sinon
 * `null` (= accent crème neutre des tokens). Les valeurs non-hex sont ignorées.
 */
export function resolveAccentColor(
  sagaColor?: string | null,
  universeColor?: string | null,
): string | null {
  for (const c of [sagaColor, universeColor]) {
    if (c && HEX.test(c)) return c;
  }
  return null;
}
```

- [ ] **Step 4: Lancer le test, vérifier le succès**

Run: `npm test -- universeAccent`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/universeAccent.ts app/lib/__tests__/universeAccent.test.ts
git commit -m "feat(design): resolveAccentColor (cascade saga -> univers -> neutre)"
```

---

## Task 4: Atomes CSS + composant `ProgressDots`

**Files:**
- Create: `app/styles/atoms.css`
- Create: `app/components/ProgressDots.tsx`
- Test: `app/components/__tests__/ProgressDots.test.tsx`

**Interfaces:**
- Produces:
  - classes CSS : `.bsk-btn` + modificateurs `.bsk-btn--cream | --ghost | --accent | --disabled` ; `.bsk-badge` + `.bsk-badge--accent | --cream | --solid` ; `.bsk-field`, `.bsk-mailrow`, `.bsk-stepper` ; `.bsk-kicker` ; utilitaires `.bsk-grain`, `.bsk-halo`.
  - composant `ProgressDots({count, activeIndex, onJump}: {count: number; activeIndex: number; onJump?: (i: number) => void})`.

- [ ] **Step 1: Créer `atoms.css`**

Créer `app/styles/atoms.css` :

```css
/* app/styles/atoms.css — grammaire de composants « encre ». Importé par les
   surfaces refondues. L'accent vient de --bsk-uni (crème neutre par défaut). */

/* Boutons */
.bsk-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  font-family:var(--bsk-font-sans);font-size:13px;font-weight:600;letter-spacing:.02em;
  padding:11px 20px;border-radius:999px;border:1px solid transparent;cursor:pointer;
  text-decoration:none;transition:transform var(--bsk-duration-fast) var(--bsk-ease),opacity var(--bsk-duration-fast)}
.bsk-btn:active{transform:translateY(1px)}
.bsk-btn--cream{background:var(--bsk-cream);color:var(--bsk-ink)}
.bsk-btn--ghost{background:transparent;color:var(--bsk-cream);border-color:rgba(242,239,231,.35)}
.bsk-btn--accent{background:var(--bsk-uni);color:var(--bsk-ink)}
.bsk-btn--disabled,.bsk-btn:disabled{background:rgba(242,239,231,.12);color:rgba(242,239,231,.4);cursor:not-allowed}

/* Badges */
.bsk-badge{display:inline-flex;align-items:center;font-family:var(--bsk-font-sans);
  font-size:9px;letter-spacing:.14em;text-transform:uppercase;padding:4px 9px;border-radius:999px;border:1px solid}
.bsk-badge--accent{color:var(--bsk-uni);border-color:color-mix(in srgb,var(--bsk-uni) 60%,transparent);background:color-mix(in srgb,var(--bsk-uni) 10%,transparent)}
.bsk-badge--cream{color:var(--bsk-cream);border-color:rgba(242,239,231,.3);background:transparent}
.bsk-badge--solid{color:var(--bsk-ink);background:var(--bsk-uni);border-color:var(--bsk-uni)}

/* Champs */
.bsk-field{background:rgba(242,239,231,.05);border:1px solid rgba(242,239,231,.18);
  border-radius:var(--bsk-radius);padding:11px 14px;font-family:var(--bsk-font-sans);font-size:13px;color:var(--bsk-cream)}
.bsk-mailrow{display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(242,239,231,.4);padding-bottom:7px}
.bsk-mailrow input{flex:1;background:none;border:0;color:var(--bsk-cream);font-family:var(--bsk-font-sans);font-size:13px;outline:none}
.bsk-stepper{display:inline-flex;align-items:center;gap:14px;border:1px solid rgba(242,239,231,.22);border-radius:999px;padding:5px 12px;font-size:14px;color:var(--bsk-cream)}

/* Kicker (label + filet) */
.bsk-kicker{display:inline-block;font-family:var(--bsk-font-sans);font-size:10px;font-weight:600;
  letter-spacing:.26em;text-transform:uppercase;color:var(--bsk-uni);
  border-top:1px solid color-mix(in srgb,var(--bsk-uni) 55%,transparent);padding-top:8px}

/* Puces de progression */
.bsk-dots{display:flex;flex-direction:column;gap:8px}
.bsk-dots button{width:5px;height:5px;padding:0;border:0;border-radius:50%;background:rgba(242,239,231,.28);cursor:pointer;transition:height var(--bsk-duration-fast),background var(--bsk-duration-fast)}
.bsk-dots button[aria-current="true"]{background:var(--bsk-uni);height:20px;border-radius:3px}

/* Finition : grain + halo (utilitaires) */
.bsk-grain{position:absolute;inset:0;pointer-events:none;z-index:9;opacity:var(--bsk-grain-opacity);mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.bsk-halo{position:absolute;border-radius:50%;pointer-events:none;
  background:radial-gradient(circle,var(--bsk-uni),transparent 62%);opacity:.34;filter:blur(20px)}

@media (prefers-reduced-motion: reduce){
  .bsk-btn{transition:none}
}
```

- [ ] **Step 2: Écrire le test de `ProgressDots` (échec attendu)**

Créer `app/components/__tests__/ProgressDots.test.tsx` :

```tsx
import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {ProgressDots} from '../ProgressDots';

describe('ProgressDots', () => {
  it('rend une puce par item et marque l\'active', () => {
    render(<ProgressDots count={3} activeIndex={1} />);
    const dots = screen.getAllByRole('button');
    expect(dots).toHaveLength(3);
    expect(dots[1]).toHaveAttribute('aria-current', 'true');
    expect(dots[0]).toHaveAttribute('aria-current', 'false');
  });

  it('appelle onJump avec l\'index au clic', () => {
    const onJump = vi.fn();
    render(<ProgressDots count={3} activeIndex={0} onJump={onJump} />);
    fireEvent.click(screen.getAllByRole('button')[2]);
    expect(onJump).toHaveBeenCalledWith(2);
  });
});
```

- [ ] **Step 3: Lancer le test, vérifier l'échec**

Run: `npm test -- ProgressDots`
Expected: FAIL — module introuvable.

- [ ] **Step 4: Créer `ProgressDots.tsx`**

```tsx
import '~/styles/atoms.css';

export function ProgressDots({
  count,
  activeIndex,
  onJump,
}: {
  count: number;
  activeIndex: number;
  onJump?: (i: number) => void;
}) {
  return (
    <div className="bsk-dots" role="tablist" aria-label="Sagas">
      {Array.from({length: count}, (_, i) => (
        <button
          key={i}
          type="button"
          aria-current={i === activeIndex ? 'true' : 'false'}
          aria-label={`Aller à la saga ${i + 1}`}
          onClick={() => onJump?.(i)}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Lancer le test, vérifier le succès**

Run: `npm test -- ProgressDots`
Expected: PASS.

- [ ] **Step 6: Vérifier le build**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 7: Commit**

```bash
git add app/styles/atoms.css app/components/ProgressDots.tsx app/components/__tests__/ProgressDots.test.tsx
git commit -m "feat(design): atoms.css (boutons/badges/champs/kicker/halo/grain) + ProgressDots"
```

---

## Task 5: Restyle de la nav (wordmark + peau encre, overlay/solide)

**Files:**
- Modify: `app/components/ImmersiveNav.tsx`
- Modify: `app/styles/nav.css`
- Test: `app/components/__tests__/ImmersiveNav.test.tsx` (créer si absent)

**Interfaces:**
- Consumes: `PRIMARY_NAV`, `useAside`, `useHideOnScroll` (inchangés).
- Produces: nav avec **wordmark `BILSKIRNIR`** (Bricolage) à gauche, liens, panier à droite ; `data-variant="overlay|solid"` sur le `<header>`.

- [ ] **Step 1: Écrire le test (échec attendu)**

Créer/compléter `app/components/__tests__/ImmersiveNav.test.tsx`. (Mocks usuels du projet : `~/components/Aside` et `~/hooks/useHideOnScroll`.)

```tsx
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {createRoutesStub} from 'react-router';
import {ImmersiveNav} from '../ImmersiveNav';

vi.mock('~/components/Aside', () => ({useAside: () => ({open: vi.fn()})}));
vi.mock('~/hooks/useHideOnScroll', () => ({
  useHideOnScroll: () => ({solid: false, hidden: false}),
}));

function renderNav(variant: 'overlay' | 'solid') {
  const Stub = createRoutesStub([
    {path: '/', Component: () => (
      <ImmersiveNav universes={[]} cartCount={0} variant={variant} />
    )},
  ]);
  return render(<Stub initialEntries={['/']} />);
}

describe('ImmersiveNav (encre)', () => {
  it('affiche le wordmark BILSKIRNIR', () => {
    renderNav('overlay');
    expect(screen.getByText('BILSKIRNIR')).toBeInTheDocument();
  });

  it('expose le variant via data-variant', () => {
    const {container} = renderNav('overlay');
    expect(container.querySelector('header')).toHaveAttribute('data-variant', 'overlay');
  });
});
```

- [ ] **Step 2: Lancer le test, vérifier l'échec**

Run: `npm test -- ImmersiveNav`
Expected: FAIL (pas de texte `BILSKIRNIR` / pas de `data-variant`).

- [ ] **Step 3: Restyler `ImmersiveNav.tsx`**

Dans `app/components/ImmersiveNav.tsx` : (a) ajouter `data-variant={isOverlay ? 'overlay' : isSolid ? 'solid' : 'top'}` sur le `<header>` ; (b) changer la grille pour aligner le wordmark à gauche (`gridTemplateColumns: 'auto 1fr auto'`) ; (c) remplacer le bloc central `Logo` par le wordmark à gauche. Concrètement :

Remplacer la ligne :

```ts
    gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
```

par :

```ts
    gridTemplateColumns: 'auto 1fr auto',
```

Remplacer la balise d'ouverture du header :

```tsx
      <header style={headerStyle}>
```

par :

```tsx
      <header style={headerStyle} data-variant={isOverlay ? 'overlay' : isSolid ? 'solid' : 'top'}>
```

Remplacer le bloc central (lignes du `<div style={{justifySelf: 'center'}}>` contenant `Logo`) par un wordmark à gauche **et** déplacer les liens au centre. Le 1ᵉʳ enfant du header (le `<div>` avec burger + `bsk-nav-links`) devient :

```tsx
        <div style={{justifySelf: 'start', display: 'flex', alignItems: 'center', gap: 'var(--bsk-space-4)', minWidth: 0}}>
          <button
            type="button"
            className="bsk-nav-burger"
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
          <Link to="/" aria-label="Accueil Bilskirnir" className="bsk-nav-wordmark">
            BILSKIRNIR
          </Link>
        </div>

        <nav className="bsk-nav-links" aria-label="Navigation principale" style={{justifySelf: 'center'}}>
          {PRIMARY_NAV.map((item) => (
            <Link key={item.label} className="bsk-nav-link" to={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
```

et **supprimer** l'ancien `<div style={{justifySelf: 'center'}}>…<Logo/>…</div>` (le wordmark le remplace). Le bloc panier (`justifySelf: 'end'`) reste inchangé mais sa pastille passe de `--bsk-accent-gold` à `var(--bsk-uni)` et la couleur de texte `#231603` → `var(--bsk-ink)`. L'import `Logo` devient inutilisé → le retirer.

- [ ] **Step 4: Ajouter les styles wordmark/links dans `nav.css`**

Ajouter à la fin de `app/styles/nav.css` :

```css
.bsk-nav-wordmark{font-family:var(--bsk-font-display);font-weight:800;font-size:18px;
  letter-spacing:-.01em;color:var(--bsk-cream);text-decoration:none}
.bsk-nav-links{display:flex;gap:18px}
.bsk-nav-link{font-family:var(--bsk-font-sans);font-size:12px;letter-spacing:.04em;
  color:var(--bsk-cream);opacity:.7;text-decoration:none}
.bsk-nav-link:hover{opacity:1}
@media (max-width: 760px){.bsk-nav-links{display:none}}
```

- [ ] **Step 5: Lancer le test, vérifier le succès**

Run: `npm test -- ImmersiveNav`
Expected: PASS.

- [ ] **Step 6: Suite complète + build + vérif dev**

Run: `npm test` puis `npm run build`
Expected: tout vert, build OK.
Run (manuel) : `npm run dev`, ouvrir `/` et une page non-immersive — la nav affiche le wordmark, état overlay sur la home, solide au scroll. Aucune régression SSR.

- [ ] **Step 7: Commit**

```bash
git add app/components/ImmersiveNav.tsx app/styles/nav.css app/components/__tests__/ImmersiveNav.test.tsx
git commit -m "feat(design): nav encre (wordmark BILSKIRNIR, data-variant overlay/solide)"
```

---

## Self-review — couverture du spec (Phase A)

- Palette encre/crème + accent neutre → Task 2. ✅
- Polices Bricolage + Inter auto-hébergées → Task 1. ✅
- Résolution couleur saga→univers→neutre → Task 3. ✅
- Atomes (boutons/badges/champs/stepper/puces/kicker/halo/grain) → Task 4. ✅
- Nav overlay/solide + wordmark → Task 5. ✅
- Les phases B/C/D (accueil vertical, surfaces, fiche) consommeront ces fondations → plans séparés.

## Notes

- **Compat assumée :** on garde les anciennes vars (`--bsk-bg-base`, `--bsk-accent-gold`, etc.) pour ne pas casser les pages non encore refondues ; elles seront retirées quand toutes les surfaces auront basculé (fin de phase D).
- **Wordmark vs emblème :** la nav passe au wordmark `BILSKIRNIR` (validé en maquette) ; le composant `Logo` (emblème) reste utilisé ailleurs (footer/maison) — ne pas le supprimer.
- `npm run typecheck` : erreurs de scaffold Hydrogen préexistantes hors périmètre.
