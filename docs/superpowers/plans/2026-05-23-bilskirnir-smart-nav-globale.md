# Bilskirnir — Smart nav globale — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promouvoir la nav immersive (emblème centré, panier sac + pastille dorée, menu univers) sur **toutes** les pages internes (univers, fiches, maison, légal, recherche, compte…), en remplacement du `Header` texte hérité du Plan 2 : transparente en haut, **fond solide + masquage au scroll bas / réapparition au scroll haut** (spec §2.5), comportement standard partout.

**Architecture:** On généralise `ImmersiveNav` avec une prop `variant` : `'overlay'` (accueil — `position: fixed`, transparent permanent au-dessus du slider) et `'solid'` (pages internes — `position: sticky`, transparent en haut puis solide/masquée au scroll via le hook `useHideOnScroll` du Plan 1). `root.tsx` rend `ImmersiveNav` pour **toutes** les routes (variant selon `isImmersiveRoute`) et supprime l'ancien `Header`. Le `Footer` reste masqué uniquement sur les routes immersives.

**Tech Stack:** Hydrogen (React Router v7), TypeScript, Vitest + Testing Library.

**Spec:** §2.5 (nav intelligente, standard sur toutes les pages).
**Plan consommé :** `useHideOnScroll` (design-foundation, déjà testé via `computeNavState`).

---

## Décisions de cadrage

1. **Nav sticky (pas fixed) sur les pages internes** : la barre occupe le flux normal en haut puis colle au scroll — pas de chevauchement du contenu (plus sûr que l'overlay à marge négative du mockup, rendu identique sur fond sombre).
2. **Suppression du `Header` texte** (logo « Bilskirnir » + « Panier (0) ») : remplacé partout par `ImmersiveNav`. `Header.tsx` + son test sont supprimés (seul `root.tsx` l'importait).
3. `data/nav.ts` (`PRIMARY_NAV`) devient inutilisé mais est conservé (sans risque) — le menu univers passe par `MegaMenu`.

---

## Prerequisites

- [ ] `cd storefront && npm test` vert.
- [ ] `~/hooks/useHideOnScroll` exporte `useHideOnScroll(target?)` → `{solid, hidden}`.
- [ ] `ImmersiveNav` existe (emblème, panier+pastille, burger→MegaMenu) et est rendu par `root.tsx` sur les routes immersives.
- [ ] `isImmersiveRoute` (lib) utilisé dans `root.tsx`.

---

## File Structure

```
storefront/app/
├── components/
│   ├── ✏️ ImmersiveNav.tsx            (prop variant overlay|solid + hide-on-scroll)
│   ├── 🗑️ Header.tsx                  (supprimé)
│   └── __tests__/
│       ├── ✏️ ImmersiveNav.test.tsx   (cas variant)
│       └── 🗑️ Header.test.tsx         (supprimé)
└── ✏️ root.tsx                        (ImmersiveNav partout selon variant ; plus de Header)
```

---

## Tasks

### Task 1: `ImmersiveNav` — variant + hide-on-scroll

**Files:**
- Modify: `storefront/app/components/ImmersiveNav.tsx`
- Modify: `storefront/app/components/__tests__/ImmersiveNav.test.tsx`

- [ ] **Step 1: Ajouter le test de variant**

Ajouter au fichier de test existant (qui mocke déjà `~/components/Aside`) :

```tsx
it('variant solid → position sticky ; overlay → fixed', () => {
  const {container, rerender} = renderWithRouter(
    <ImmersiveNav universes={universes} cartCount={0} variant="solid" />,
  );
  const header = container.querySelector('header') as HTMLElement;
  expect(header.style.position).toBe('sticky');
  rerender(<ImmersiveNav universes={universes} cartCount={0} variant="overlay" />);
  expect((container.querySelector('header') as HTMLElement).style.position).toBe('fixed');
});
```

> `rerender` vient de `renderWithRouter` (Testing Library `render` le fournit). Si `renderWithRouter` ne renvoie pas `rerender`, faire deux `renderWithRouter` séparés et lire `container.querySelector('header')` à chaque fois.

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- ImmersiveNav
```

- [ ] **Step 3: Mettre à jour `ImmersiveNav.tsx`**

```tsx
// storefront/app/components/ImmersiveNav.tsx
import {useState} from 'react';
import type {CSSProperties} from 'react';
import {Link} from 'react-router';
import {Logo} from '~/components/Logo';
import {MegaMenu, type UniverseItem} from '~/components/MegaMenu';
import {useAside} from '~/components/Aside';
import {useHideOnScroll} from '~/hooks/useHideOnScroll';

export function ImmersiveNav({
  universes,
  cartCount,
  variant = 'solid',
}: {
  universes: UniverseItem[];
  cartCount: number;
  variant?: 'overlay' | 'solid';
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const {open} = useAside();
  const {solid, hidden} = useHideOnScroll(typeof window !== 'undefined' ? window : null);
  const isOverlay = variant === 'overlay';
  const isSolid = !isOverlay && solid;

  const headerStyle: CSSProperties = {
    position: isOverlay ? 'fixed' : 'sticky',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 22px',
    transition: 'transform .35s var(--bsk-ease), background .3s, border-color .3s',
    transform: !isOverlay && hidden ? 'translateY(-104%)' : 'none',
    background: isOverlay
      ? 'linear-gradient(to bottom, rgba(14,15,19,.78), transparent)'
      : isSolid
        ? 'rgba(19,20,25,.94)'
        : 'linear-gradient(to bottom, rgba(14,15,19,.7), transparent)',
    backdropFilter: isSolid ? 'blur(12px)' : undefined,
    borderBottom: `1px solid ${isSolid ? 'var(--bsk-border-subtle)' : 'transparent'}`,
  };

  return (
    <header style={headerStyle}>
      <button
        type="button"
        aria-label="Menu des univers"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
        style={{display: 'flex', flexDirection: 'column', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 6}}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} style={{width: 20, height: 1.8, background: 'var(--bsk-fg-primary)', borderRadius: 2}} />
        ))}
      </button>

      <Link to="/" aria-label="Accueil Bilskirnir" style={{display: 'inline-flex'}}>
        <Logo height="clamp(44px, 5.5vw, 58px)" />
      </Link>

      <button
        type="button"
        onClick={() => open('cart')}
        aria-label={`Panier (${cartCount} article${cartCount > 1 ? 's' : ''})`}
        style={{
          position: 'relative',
          width: 38,
          height: 38,
          borderRadius: '50%',
          border: '1px solid var(--bsk-border-subtle)',
          background: 'transparent',
          color: 'var(--bsk-fg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 7h12l-1.1 12.2a1 1 0 0 1-1 .8H8.1a1 1 0 0 1-1-.8L6 7Z" />
          <path d="M9 7V6a3 3 0 0 1 6 0v1" />
        </svg>
        {cartCount > 0 ? (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              minWidth: 16,
              height: 16,
              borderRadius: 999,
              background: 'var(--bsk-accent-gold)',
              color: '#231603',
              fontSize: 9,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
            }}
          >
            {cartCount}
          </span>
        ) : null}
      </button>

      {menuOpen ? (
        <div
          style={{position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(14,15,19,.97)', borderBottom: '1px solid var(--bsk-border-subtle)'}}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <MegaMenu universes={universes} />
        </div>
      ) : null}
    </header>
  );
}
```

- [ ] **Step 4: Run — expect PASS (anciens + nouveau test)**

```bash
cd storefront && npm test -- ImmersiveNav
```

- [ ] **Step 5: Commit**

```bash
git add app/components/ImmersiveNav.tsx app/components/__tests__/ImmersiveNav.test.tsx
git commit -m "feat(nav): ImmersiveNav variant overlay|solid + hide-on-scroll"
```

---

### Task 2: `root.tsx` — ImmersiveNav partout, suppression de Header

**Files:**
- Modify: `storefront/app/root.tsx`

- [ ] **Step 1: Retirer l'import `Header`** (Edit)

Supprimer la ligne `import {Header} from '~/components/Header';`.

- [ ] **Step 2: Rendre `ImmersiveNav` pour toutes les routes** (Edit)

Remplacer le bloc nav (le `<Suspense>` qui choisissait `ImmersiveNav`/`Header` selon `immersive`) par un rendu unique d'`ImmersiveNav` avec la prop `variant` :

```tsx
        <Suspense
          fallback={
            <ImmersiveNav
              universes={universes}
              cartCount={0}
              variant={immersive ? 'overlay' : 'solid'}
            />
          }
        >
          <Await resolve={data.cart}>
            {(cart) => (
              <ImmersiveNav
                universes={universes}
                cartCount={cart?.totalQuantity ?? 0}
                variant={immersive ? 'overlay' : 'solid'}
              />
            )}
          </Await>
        </Suspense>
```

> Le `{immersive ? null : <Footer />}` et le reste restent inchangés.

- [ ] **Step 3: Build**

```bash
cd storefront && npm run build
```

Expected : OK (plus aucune référence à `Header`).

- [ ] **Step 4: Commit**

```bash
git add app/root.tsx
git commit -m "feat(nav): ImmersiveNav sur toutes les pages (variant), retire Header global"
```

---

### Task 3: Supprimer `Header` (composant + test)

**Files:**
- Delete: `storefront/app/components/Header.tsx`
- Delete: `storefront/app/components/__tests__/Header.test.tsx`

- [ ] **Step 1: Vérifier qu'aucun fichier n'importe plus `Header`**

```bash
cd storefront && grep -rn "components/Header'" app | grep -v "__tests__/Header.test" || echo "aucune référence — OK"
```

Expected : aucune référence (hors le test qu'on supprime).

- [ ] **Step 2: Supprimer les fichiers**

```bash
cd storefront && rm app/components/Header.tsx app/components/__tests__/Header.test.tsx
```

- [ ] **Step 3: Suite + build**

```bash
cd storefront && npm test && npm run build
```

Expected : tout vert, build OK.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(nav): supprime le Header texte (remplace par ImmersiveNav)"
```

---

### Task 4: Sanity + revue visuelle (toutes pages)

- [ ] **Step 1: Suite + build**

```bash
cd storefront && npm test && npm run build
```

- [ ] **Step 2: Dev** — vérifier la nav sur :
- [ ] **Accueil** (`/`) : nav overlay transparente sur le slider (inchangé).
- [ ] **Univers** (`/collections/<handle>`), **fiche** (`/products/<handle>`), **maison** (`/pages/la-maison`), **légal** (`/policies/...`) : nav **sticky transparente en haut**, puis **fond solide + flou + bordure au scroll bas, masquée**, **réapparaît au scroll haut**. Emblème centré, panier sac + pastille dorée, burger ouvre le menu univers.
- [ ] Aucune page ne montre l'ancien header texte « Bilskirnir / Panier (0) ».
- [ ] `prefers-reduced-motion` : la nav reste fonctionnelle (transition rapide acceptable).

- [ ] **Step 3: Commit (si ajustements)**

```bash
cd storefront && npm test && git add -A && git commit -m "chore(nav): sanity pass smart nav globale"
```

---

## Self-review (couverture §2.5)

| Élément | Tâche |
|---|---|
| Nav transparente en haut, solide + masquage au scroll, réapparition au scroll haut | Task 1 (useHideOnScroll + variant solid) |
| Comportement standard sur toutes les pages | Task 2 (ImmersiveNav partout) |
| Emblème + panier sac + pastille dorée | déjà dans ImmersiveNav |
| Overlay sur l'accueil (slider) | Task 1 (variant overlay) |

**Différé :** menu mobile plein écran enrichi (le burger ouvre `MegaMenu` — suffisant) ; liens compte/recherche dans la nav (accessibles via menu/routes) ; version desktop dédiée (barre + liens horizontaux).
