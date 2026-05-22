# Bilskirnir — Panier drawer à paliers de récompenses — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre le drawer panier selon la maquette validée : barre de progression à paliers (livraison offerte → cadeau) avec message dynamique et jalons qui se remplissent en doré, lignes panier restylées (couverture, note de dédicace, stepper quantité, prix, retirer) avec recalcul en direct, et pied de drawer (sous-total, mention frais de port, « Passer au paiement » doré + Shop Pay).

**Architecture:** La mécanique de récompenses est pilotée par des **metafields niveau boutique** (`cart.seuil_livraison_offerte`, `cart.paliers_cadeaux`) lus dans le loader racine et exposés via `useRouteLoaderData('root')`. Un module pur `rewards.ts` (`parseRewardsConfig` + `computeRewards`) calcule remplissage / jalons / message ; un composant présentiel `RewardsBar` les affiche. On restyle `CartLineItem` (note de dédicace lue dans `line.attributes`), on crée un pied de drawer (`CartDrawerFooter`), et on recompose `CartMain` (RewardsBar + liste + pied), avec une feuille `cart.css`. Drawer = layout `aside` ; la page `/cart` garde les remises/cartes cadeaux.

**Tech Stack:** Hydrogen (React Router v7), TypeScript, Vitest + Testing Library, Vanilla CSS (`--bsk-*` + `cart.css`). `ShopPayButton` (@shopify/hydrogen-react), `CartForm` (@shopify/hydrogen).

**Spec:** `docs/superpowers/specs/2026-05-22-bilskirnir-visual-redesign.md` (§3.6 panier)
**Maquette:** `docs/superpowers/mockups/2026-05-22-visual-redesign/07-panier-mobile.html`

---

## Décisions de cadrage (à valider en lisant)

1. **Barre de récompenses = affichage incitatif** (conforme spec §3.6 : « la barre est l'affichage incitatif ; la livraison offerte réelle reste gérée par les Shipping rates Shopify »). Le calcul remplissage/jalons/message est entièrement en code.
2. **Ajout automatique du cadeau en ligne à 0 € : DIFFÉRÉ.** L'API Storefront du panier ne permet pas de forcer un prix à 0 € ; un cadeau réellement gratuit nécessite une **remise automatique Shopify** ciblant le produit cadeau (config admin). Ce plan livre la barre + le message « cadeau débloqué » ; l'ajout de la ligne cadeau et sa config discount sont une tâche admin/suivi documentée.
3. **Pilotage par metafields boutique** : `cart.seuil_livraison_offerte` (number) et `cart.paliers_cadeaux` (JSON, ex. `[{"seuil":75,"label":"un marque-page"}]`). **Valeurs par défaut** si absents : livraison offerte à 49 €, cadeau « un marque-page » à 75 €. Pour la barre on n'a besoin que de `seuil` + `label`.
4. **Note de dédicace** lue depuis `line.attributes` (clé `Dédicace`, déjà posée au Plan 4). Le **libellé saga·tome** sur la ligne est **différé** (nécessiterait des metafields sur le `merchandise.product` du fragment panier).
5. **Drawer vs page** : le drawer (aside) reçoit la barre + pied épuré (sous-total, frais de port, paiement, Shop Pay). La page `/cart` conserve remises/cartes cadeaux (composant `CartSummary` existant).

---

## Prerequisites

- [ ] `cd storefront && npm test` est vert au départ.
- [ ] `CART_QUERY_FRAGMENT` (dans `app/lib/fragments.ts`) fournit déjà `cost.subtotalAmount`, `lines.nodes[].attributes {key value}`, `totalQuantity`, `checkoutUrl`, et `merchandise` (image, price, product).
- [ ] Le loader racine retourne déjà `publicStoreDomain` (vérifié, `root.tsx`).
- [ ] `ShopPayButton` exporté par `@shopify/hydrogen-react` (vérifié au Plan 4).
- [ ] Pattern de test pour `CartForm` : le mocker (cf. `TomeAddToCart.test.tsx`), car il exige un data router.

---

## File Structure

```
storefront/app/
├── lib/
│   ├── ✨ rewards.ts                  (parseRewardsConfig + computeRewards + defaults)
│   ├── ✨ cartAttributes.ts           (dedicaceFromAttributes : extrait la note de dédicace)
│   ├── ✏️ fragments.ts                (Shop fragment += metafields cart.* )
│   └── __tests__/
│       ├── ✨ rewards.test.ts
│       └── ✨ cartAttributes.test.ts
├── components/
│   ├── ✨ RewardsBar.tsx              (barre + jalons + message — présentiel pur)
│   ├── ✨ CartDrawerFooter.tsx        (sous-total, frais de port, paiement, Shop Pay)
│   ├── ✏️ CartLineItem.tsx            (couverture, dédicace, stepper, prix, retirer)
│   ├── ✏️ CartMain.tsx                (RewardsBar + liste + pied ; lit rewards/storeDomain du root)
│   └── __tests__/
│       ├── ✨ RewardsBar.test.tsx
│       ├── ✨ CartDrawerFooter.test.tsx
│       └── ✨ CartLineItem.test.tsx
├── styles/
│   ├── ✨ cart.css
│   └── __tests__/✨ cartCss.test.ts
└── ✏️ root.tsx                        (loader expose `rewards` ; heading drawer « Votre panier » ; import cart.css)
```

---

## Tasks

### Task 1: `cart.css` — drawer, barre, lignes, pied

**Files:**
- Create: `storefront/app/styles/cart.css`
- Test: `storefront/app/styles/__tests__/cartCss.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/styles/__tests__/cartCss.test.ts
import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const css = readFileSync(resolve(process.cwd(), 'app/styles/cart.css'), 'utf8');

describe('cart.css', () => {
  it('définit la barre de récompenses et son remplissage', () => {
    expect(css).toContain('.bsk-rw-track');
    expect(css).toContain('.bsk-rw-fill');
    expect(css).toContain('.bsk-rw-milestone');
  });
  it('définit la ligne panier et le pied', () => {
    expect(css).toContain('.bsk-cart-line');
    expect(css).toContain('.bsk-cart-foot');
  });
  it('jalon atteint en doré', () => {
    expect(css).toContain('.bsk-rw-milestone.is-reached');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- cartCss
```

- [ ] **Step 3: Create `cart.css`**

```css
/* app/styles/cart.css — panier drawer (récompenses + lignes + pied) */

/* ── Barre de récompenses ── */
.bsk-rw {
  padding: 16px 22px 20px;
  border-bottom: 1px solid var(--bsk-border-subtle);
  background: var(--bsk-bg-raised);
}
.bsk-rw-msg {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 16px;
  color: var(--bsk-fg-primary);
}
.bsk-rw-msg b {
  color: var(--bsk-accent-gold);
}
.bsk-rw-track {
  position: relative;
  height: 6px;
  background: rgba(236, 228, 211, 0.12);
  border-radius: 999px;
  margin: 30px 8px 8px;
}
.bsk-rw-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--bsk-accent-gold-dim), var(--bsk-accent-gold));
  transition: width 0.5s ease;
}
.bsk-rw-milestone {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.bsk-rw-milestone .bsk-rw-dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--bsk-bg-raised);
  border: 2px solid var(--bsk-border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bsk-fg-secondary);
  transition: 0.4s;
}
.bsk-rw-milestone .bsk-rw-dot svg {
  width: 13px;
  height: 13px;
}
.bsk-rw-milestone.is-reached .bsk-rw-dot {
  border-color: var(--bsk-accent-gold);
  color: var(--bsk-accent-gold);
  background: #241b0c;
}
.bsk-rw-milestone .bsk-rw-lbl {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 9.5px;
  letter-spacing: 0.04em;
  color: var(--bsk-fg-secondary);
}
.bsk-rw-milestone.is-reached .bsk-rw-lbl {
  color: var(--bsk-accent-gold);
}

/* ── Lignes panier ── */
.bsk-cart-line {
  display: flex;
  gap: 14px;
  padding: 18px 0;
  border-bottom: 1px solid var(--bsk-border-subtle);
  list-style: none;
}
.bsk-cart-line img {
  width: 64px;
  height: auto;
  flex: 0 0 auto;
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.55));
}
.bsk-cart-line-main {
  flex: 1;
  min-width: 0;
}
.bsk-cart-line-title {
  font-family: var(--bsk-font-display);
  font-weight: 600;
  font-size: 16px;
  margin: 0 0 6px;
  line-height: 1.15;
  color: var(--bsk-fg-primary);
}
.bsk-cart-ded {
  font-size: 12px;
  color: var(--bsk-accent-gold);
  margin-bottom: 10px;
}
.bsk-cart-line-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.bsk-qty {
  display: flex;
  align-items: center;
  border: 1px solid var(--bsk-border-subtle);
  border-radius: 999px;
}
.bsk-qty button {
  width: 30px;
  height: 32px;
  background: none;
  border: none;
  color: var(--bsk-fg-primary);
  cursor: pointer;
  font-size: 15px;
}
.bsk-qty button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.bsk-qty span {
  width: 24px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--bsk-fg-primary);
}
.bsk-cart-price {
  font-family: var(--bsk-font-display);
  font-weight: 600;
  font-size: 16px;
  color: var(--bsk-fg-primary);
}
.bsk-cart-remove {
  font-size: 11px;
  color: var(--bsk-fg-secondary);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 8px;
  padding: 0;
}

/* ── Pied du drawer ── */
.bsk-cart-foot {
  padding: 18px 22px 24px;
  border-top: 1px solid var(--bsk-border-subtle);
  background: var(--bsk-bg-raised);
}
.bsk-cart-subtotal {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}
.bsk-cart-subtotal .l {
  font-size: 14px;
  color: var(--bsk-fg-secondary);
}
.bsk-cart-subtotal .v {
  font-family: var(--bsk-font-display);
  font-weight: 700;
  font-size: 22px;
  color: var(--bsk-fg-primary);
}
.bsk-cart-shipnote {
  font-size: 12px;
  color: var(--bsk-fg-secondary);
  margin-bottom: 14px;
}
.bsk-cart-checkout {
  display: block;
  width: 100%;
  text-align: center;
  background: linear-gradient(135deg, var(--bsk-accent-gold), var(--bsk-accent-gold-dim));
  color: #231603;
  font-weight: 700;
  border: none;
  border-radius: 999px;
  padding: 16px;
  font-size: 15px;
  cursor: pointer;
  margin-bottom: 10px;
  text-decoration: none;
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- cartCss
```

- [ ] **Step 5: Commit**

```bash
git add app/styles/cart.css app/styles/__tests__/cartCss.test.ts
git commit -m "feat(panier): cart.css (barre recompenses + lignes + pied)"
```

---

### Task 2: `rewards.ts` — config + calcul (logique pure)

**Files:**
- Create: `storefront/app/lib/rewards.ts`
- Test: `storefront/app/lib/__tests__/rewards.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/lib/__tests__/rewards.test.ts
import {describe, it, expect} from 'vitest';
import {parseRewardsConfig, computeRewards, DEFAULT_REWARDS} from '../rewards';

describe('parseRewardsConfig', () => {
  it('défauts si metafields absents', () => {
    expect(parseRewardsConfig(null, null)).toEqual(DEFAULT_REWARDS);
  });
  it('parse seuil livraison + paliers cadeaux JSON', () => {
    const c = parseRewardsConfig('49', '[{"seuil":75,"label":"un marque-page"}]');
    expect(c.freeShippingThreshold).toBe(49);
    expect(c.giftTiers).toEqual([{threshold: 75, label: 'un marque-page'}]);
  });
  it('JSON invalide → défaut paliers', () => {
    const c = parseRewardsConfig('40', 'pas-du-json');
    expect(c.freeShippingThreshold).toBe(40);
    expect(c.giftTiers).toEqual(DEFAULT_REWARDS.giftTiers);
  });
});

describe('computeRewards', () => {
  const config = {freeShippingThreshold: 49, giftTiers: [{threshold: 75, label: 'un marque-page'}]};

  it('sous le 1er seuil : message livraison + remplissage partiel', () => {
    const r = computeRewards(30, config);
    expect(r.message).toMatch(/livraison offerte/i);
    expect(r.message).toContain('19,00');
    expect(r.fillPct).toBeCloseTo((30 / 75) * 100, 1);
    expect(r.milestones[0].reached).toBe(false);
    expect(r.allUnlocked).toBe(false);
  });
  it('entre les deux seuils : livraison ok, message cadeau', () => {
    const r = computeRewards(60, config);
    expect(r.milestones[0].reached).toBe(true); // livraison
    expect(r.milestones[1].reached).toBe(false); // cadeau
    expect(r.message).toMatch(/marque-page/);
    expect(r.message).toContain('15,00');
  });
  it('tout débloqué', () => {
    const r = computeRewards(80, config);
    expect(r.allUnlocked).toBe(true);
    expect(r.fillPct).toBe(100);
    expect(r.milestones.every((m) => m.reached)).toBe(true);
    expect(r.message).toMatch(/débloqué|🎉/);
  });
  it('positionne les jalons selon le seuil max', () => {
    const r = computeRewards(0, config);
    expect(r.milestones[0].leftPct).toBeCloseTo((49 / 75) * 100, 1);
    expect(r.milestones[1].leftPct).toBe(100);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- rewards
```

- [ ] **Step 3: Implement**

```ts
// storefront/app/lib/rewards.ts

export interface GiftTier {
  threshold: number;
  label: string;
}
export interface RewardsConfig {
  freeShippingThreshold: number;
  giftTiers: GiftTier[];
}

export const DEFAULT_REWARDS: RewardsConfig = {
  freeShippingThreshold: 49,
  giftTiers: [{threshold: 75, label: 'un marque-page'}],
};

export interface RewardMilestone {
  label: string;
  kind: 'shipping' | 'gift';
  threshold: number;
  leftPct: number;
  reached: boolean;
}
export interface RewardsState {
  fillPct: number;
  milestones: RewardMilestone[];
  message: string;
  allUnlocked: boolean;
}

const EUR = new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'});

export function parseRewardsConfig(
  freeShippingRaw: string | null | undefined,
  giftTiersRaw: string | null | undefined,
): RewardsConfig {
  const freeShippingThreshold = (() => {
    const n = parseFloat(freeShippingRaw ?? '');
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_REWARDS.freeShippingThreshold;
  })();

  const giftTiers = (() => {
    if (!giftTiersRaw) return DEFAULT_REWARDS.giftTiers;
    try {
      const parsed = JSON.parse(giftTiersRaw) as Array<{seuil?: number; label?: string}>;
      const tiers = parsed
        .filter((t) => Number.isFinite(t.seuil) && (t.seuil ?? 0) > 0)
        .map((t) => ({threshold: t.seuil as number, label: t.label ?? 'un cadeau'}))
        .sort((a, b) => a.threshold - b.threshold);
      return tiers.length > 0 ? tiers : DEFAULT_REWARDS.giftTiers;
    } catch {
      return DEFAULT_REWARDS.giftTiers;
    }
  })();

  return {freeShippingThreshold, giftTiers};
}

export function computeRewards(subtotal: number, config: RewardsConfig): RewardsState {
  const all = [
    {kind: 'shipping' as const, threshold: config.freeShippingThreshold, label: 'Livraison offerte'},
    ...config.giftTiers.map((t) => ({kind: 'gift' as const, threshold: t.threshold, label: t.label})),
  ].sort((a, b) => a.threshold - b.threshold);

  const max = all.reduce((m, x) => Math.max(m, x.threshold), 0) || 1;
  const fillPct = Math.min(subtotal / max, 1) * 100;

  const milestones: RewardMilestone[] = all.map((m) => ({
    label: m.kind === 'shipping' ? 'Livraison offerte' : m.label,
    kind: m.kind,
    threshold: m.threshold,
    leftPct: Math.min((m.threshold / max) * 100, 100),
    reached: subtotal >= m.threshold,
  }));

  const nextUnreached = all.find((m) => subtotal < m.threshold);
  let message: string;
  if (!nextUnreached) {
    message = 'Tout débloqué 🎉';
  } else if (nextUnreached.kind === 'shipping') {
    message = `Plus que ${EUR.format(nextUnreached.threshold - subtotal)} pour la livraison offerte 🚚`;
  } else {
    message = `Livraison offerte ✓ · plus que ${EUR.format(nextUnreached.threshold - subtotal)} pour ${nextUnreached.label} offert 🎁`;
  }

  return {fillPct, milestones, message, allUnlocked: !nextUnreached};
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- rewards
```

- [ ] **Step 5: Commit**

```bash
git add app/lib/rewards.ts app/lib/__tests__/rewards.test.ts
git commit -m "feat(panier): rewards (parseRewardsConfig + computeRewards)"
```

---

### Task 3: `cartAttributes.ts` — extraire la note de dédicace

**Files:**
- Create: `storefront/app/lib/cartAttributes.ts`
- Test: `storefront/app/lib/__tests__/cartAttributes.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/lib/__tests__/cartAttributes.test.ts
import {describe, it, expect} from 'vitest';
import {dedicaceFromAttributes} from '../cartAttributes';

describe('dedicaceFromAttributes', () => {
  it('retourne le nom de dédicace', () => {
    expect(
      dedicaceFromAttributes([
        {key: '_dedicace_activee', value: 'true'},
        {key: 'Dédicace', value: 'Pour Marie'},
      ]),
    ).toBe('Pour Marie');
  });
  it('null si pas de dédicace', () => {
    expect(dedicaceFromAttributes([{key: 'autre', value: 'x'}])).toBeNull();
    expect(dedicaceFromAttributes(null)).toBeNull();
    expect(dedicaceFromAttributes([])).toBeNull();
  });
  it('ignore une valeur vide', () => {
    expect(dedicaceFromAttributes([{key: 'Dédicace', value: ''}])).toBeNull();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- cartAttributes
```

- [ ] **Step 3: Implement**

```ts
// storefront/app/lib/cartAttributes.ts

export interface CartAttribute {
  key: string;
  value?: string | null;
}

/** Extrait la note de dédicace d'une ligne panier (clé « Dédicace »). */
export function dedicaceFromAttributes(
  attributes: ReadonlyArray<CartAttribute> | null | undefined,
): string | null {
  if (!attributes) return null;
  const found = attributes.find((a) => a.key === 'Dédicace');
  const value = found?.value?.trim();
  return value ? value : null;
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- cartAttributes
```

- [ ] **Step 5: Commit**

```bash
git add app/lib/cartAttributes.ts app/lib/__tests__/cartAttributes.test.ts
git commit -m "feat(panier): dedicaceFromAttributes (note de dedicace ligne)"
```

---

### Task 4: `RewardsBar` (présentiel)

**Files:**
- Create: `storefront/app/components/RewardsBar.tsx`
- Test: `storefront/app/components/__tests__/RewardsBar.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/RewardsBar.test.tsx
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {RewardsBar} from '../RewardsBar';

const config = {freeShippingThreshold: 49, giftTiers: [{threshold: 75, label: 'un marque-page'}]};

describe('RewardsBar', () => {
  it('affiche le message et les jalons', () => {
    const {container} = render(<RewardsBar subtotal={30} config={config} />);
    expect(screen.getByText(/livraison offerte/i)).toBeInTheDocument();
    expect(container.querySelectorAll('.bsk-rw-milestone')).toHaveLength(2);
  });
  it('marque les jalons atteints', () => {
    const {container} = render(<RewardsBar subtotal={60} config={config} />);
    const reached = container.querySelectorAll('.bsk-rw-milestone.is-reached');
    expect(reached).toHaveLength(1);
  });
  it('largeur de remplissage proportionnelle', () => {
    const {container} = render(<RewardsBar subtotal={75} config={config} />);
    const fill = container.querySelector('.bsk-rw-fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- RewardsBar
```

- [ ] **Step 3: Implement**

```tsx
// storefront/app/components/RewardsBar.tsx
import {computeRewards, type RewardsConfig} from '~/lib/rewards';

function Icon({kind}: {kind: 'shipping' | 'gift'}) {
  return kind === 'shipping' ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="6.5" width="12" height="9" rx="1.2" />
      <path d="M13.5 9.5h4l3 3v3h-7z" />
      <circle cx="6" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9h14v11H5z" />
      <path d="M3.5 9h17v3h-17z" />
      <path d="M12 9v11" />
    </svg>
  );
}

export function RewardsBar({subtotal, config}: {subtotal: number; config: RewardsConfig}) {
  const {fillPct, milestones, message} = computeRewards(subtotal, config);
  return (
    <div className="bsk-rw">
      <p className="bsk-rw-msg">{message}</p>
      <div className="bsk-rw-track">
        <div className="bsk-rw-fill" style={{width: `${fillPct}%`}} />
        {milestones.map((m) => (
          <div
            key={`${m.kind}-${m.threshold}`}
            className={`bsk-rw-milestone${m.reached ? ' is-reached' : ''}`}
            style={{left: `${m.leftPct}%`}}
          >
            <div className="bsk-rw-dot">
              <Icon kind={m.kind} />
            </div>
            <div className="bsk-rw-lbl">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- RewardsBar
```

- [ ] **Step 5: Commit**

```bash
git add app/components/RewardsBar.tsx app/components/__tests__/RewardsBar.test.tsx
git commit -m "feat(panier): RewardsBar (barre a paliers + message dynamique)"
```

---

### Task 5: Metafields boutique + exposition `rewards` dans le root

Ajouter les metafields `cart.*` au fragment `Shop`, parser dans le loader racine, exposer `rewards`. Importer `cart.css` et passer le heading « Votre panier ».

**Files:**
- Modify: `storefront/app/lib/fragments.ts` (fragment `Shop`)
- Modify: `storefront/app/root.tsx` (loader `rewards`, import `cart.css`, heading)
- Test: `storefront/app/lib/__tests__/shopRewardsFragment.test.ts` (create)

- [ ] **Step 1: Write the failing test**

```ts
// storefront/app/lib/__tests__/shopRewardsFragment.test.ts
import {describe, it, expect} from 'vitest';
import {HEADER_QUERY} from '../fragments';

describe('Shop fragment — metafields récompenses', () => {
  it('récupère seuil livraison + paliers cadeaux', () => {
    expect(HEADER_QUERY).toContain('key: "seuil_livraison_offerte"');
    expect(HEADER_QUERY).toContain('key: "paliers_cadeaux"');
    expect(HEADER_QUERY).toContain('namespace: "cart"');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- shopRewardsFragment
```

- [ ] **Step 3: Modifier le fragment `Shop`**

Dans `app/lib/fragments.ts`, dans `fragment Shop on Shop { ... }`, ajouter après `brand { logo { image { url } } }` :

```graphql
    seuilLivraisonOfferte: metafield(namespace: "cart", key: "seuil_livraison_offerte") { value }
    paliersCadeaux: metafield(namespace: "cart", key: "paliers_cadeaux") { value }
```

- [ ] **Step 4: Exposer `rewards` dans le loader racine**

Dans `app/root.tsx`, ajouter l'import en haut :

```ts
import {parseRewardsConfig, DEFAULT_REWARDS, type RewardsConfig} from '~/lib/rewards';
import './styles/cart.css';
```

Dans `loadCriticalData`, après le `const [header, megaMenu] = await Promise.all([...])`, calculer la config :

```ts
  const shop = header?.shop as
    | {seuilLivraisonOfferte?: {value?: string | null} | null; paliersCadeaux?: {value?: string | null} | null}
    | undefined;
  const rewards: RewardsConfig = shop
    ? parseRewardsConfig(shop.seuilLivraisonOfferte?.value, shop.paliersCadeaux?.value)
    : DEFAULT_REWARDS;

  return {header, megaMenu, rewards};
```

> `loadCriticalData` retourne désormais `{header, megaMenu, rewards}` ; comme le loader racine fait `...criticalData`, `rewards` est exposé dans les données racine.

- [ ] **Step 5: Regénérer les types + run**

```bash
cd storefront && npm run codegen && npm test -- shopRewardsFragment
```

Expected : codegen OK, test PASS.

- [ ] **Step 6: Heading drawer + build**

Dans `app/root.tsx`, remplacer `heading="Panier"` par `heading="Votre panier"` (dans le `<Aside type="cart" ...>`).

```bash
cd storefront && npm run build
```

Expected : build OK.

- [ ] **Step 7: Commit**

```bash
git add app/lib/fragments.ts app/root.tsx storefrontapi.generated.d.ts app/lib/__tests__/shopRewardsFragment.test.ts
git commit -m "feat(panier): metafields recompenses boutique + expose rewards (root)"
```

---

### Task 6: `CartDrawerFooter` (sous-total, frais de port, paiement, Shop Pay)

**Files:**
- Create: `storefront/app/components/CartDrawerFooter.tsx`
- Test: `storefront/app/components/__tests__/CartDrawerFooter.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// storefront/app/components/__tests__/CartDrawerFooter.test.tsx
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {CartDrawerFooter} from '../CartDrawerFooter';

describe('CartDrawerFooter', () => {
  it('affiche le sous-total formaté, la mention frais de port et le CTA paiement', () => {
    render(
      <CartDrawerFooter
        subtotalAmount="40.90"
        currencyCode="EUR"
        checkoutUrl="https://shop/checkout"
        lines={[{id: 'gid://v/1', quantity: 2}]}
        storeDomain={null}
      />,
    );
    expect(screen.getByText(/40,90/)).toBeInTheDocument();
    expect(screen.getByText(/Frais de port et taxes/i)).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Passer au paiement/})).toHaveAttribute(
      'href',
      'https://shop/checkout',
    );
  });
  it('pas de CTA si pas de checkoutUrl', () => {
    render(
      <CartDrawerFooter subtotalAmount="0" currencyCode="EUR" checkoutUrl={undefined} lines={[]} storeDomain={null} />,
    );
    expect(screen.queryByRole('link', {name: /Passer au paiement/})).toBeNull();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- CartDrawerFooter
```

- [ ] **Step 3: Implement**

```tsx
// storefront/app/components/CartDrawerFooter.tsx
import {ShopPayButton} from '@shopify/hydrogen-react';

export interface CartShopPayLine {
  id: string;
  quantity: number;
}

export function CartDrawerFooter({
  subtotalAmount,
  currencyCode,
  checkoutUrl,
  lines,
  storeDomain,
}: {
  subtotalAmount: string;
  currencyCode: string;
  checkoutUrl?: string;
  lines: CartShopPayLine[];
  storeDomain?: string | null;
}) {
  const subtotal = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currencyCode || 'EUR',
  }).format(parseFloat(subtotalAmount || '0'));

  return (
    <div className="bsk-cart-foot">
      <div className="bsk-cart-subtotal">
        <span className="l">Sous-total</span>
        <span className="v">{subtotal}</span>
      </div>
      <div className="bsk-cart-shipnote">Frais de port et taxes calculés au paiement.</div>
      {checkoutUrl ? (
        <a className="bsk-cart-checkout" href={checkoutUrl} target="_self">
          Passer au paiement
        </a>
      ) : null}
      {storeDomain && lines.length > 0 ? (
        <ShopPayButton
          variantIdsAndQuantities={lines.map((l) => ({id: l.id, quantity: l.quantity}))}
          storeDomain={storeDomain}
          width="100%"
        />
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- CartDrawerFooter
```

- [ ] **Step 5: Commit**

```bash
git add app/components/CartDrawerFooter.tsx app/components/__tests__/CartDrawerFooter.test.tsx
git commit -m "feat(panier): CartDrawerFooter (sous-total + paiement + Shop Pay)"
```

---

### Task 7: Restyle `CartLineItem`

Couverture (drop-shadow), titre display, **note de dédicace** (`dedicaceFromAttributes`), stepper quantité, prix de ligne, retirer. On garde la mécanique `CartForm` (LinesUpdate/LinesRemove).

**Files:**
- Modify: `storefront/app/components/CartLineItem.tsx`
- Test: `storefront/app/components/__tests__/CartLineItem.test.tsx` (create)

- [ ] **Step 1: Write the failing test (avec mocks CartForm + Aside)**

```tsx
// storefront/app/components/__tests__/CartLineItem.test.tsx
import {describe, it, expect, vi} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';

vi.mock('@shopify/hydrogen', async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  const CartForm = ({children}: {children: React.ReactNode}) => <div>{children}</div>;
  (CartForm as unknown as {ACTIONS: Record<string, string>}).ACTIONS = {
    LinesUpdate: 'LinesUpdate',
    LinesRemove: 'LinesRemove',
  };
  const Image = ({alt}: {alt?: string}) => <img alt={alt ?? ''} src="x" />;
  return {...actual, CartForm, Image};
});
vi.mock('~/components/Aside', () => ({useAside: () => ({close: vi.fn()})}));

const {CartLineItem} = await import('../CartLineItem');

const line = {
  id: 'gid://line/1',
  quantity: 1,
  attributes: [{key: 'Dédicace', value: 'Pour Marie'}],
  cost: {totalAmount: {amount: '18.90', currencyCode: 'EUR'}},
  merchandise: {
    title: 'Default',
    image: {url: 'https://x/c.webp', altText: 'Le Sang Versé', width: 400, height: 600},
    product: {handle: 'le-sang-verse', title: 'Le Sang Versé', vendor: 'Bilskirnir'},
    selectedOptions: [],
  },
} as never;

describe('CartLineItem', () => {
  it('affiche titre, note de dédicace et prix', () => {
    renderWithRouter(<CartLineItem line={line} layout="aside" childrenMap={{}} />);
    expect(screen.getByText('Le Sang Versé')).toBeInTheDocument();
    expect(screen.getByText(/Pour Marie/)).toBeInTheDocument();
    expect(screen.getByText(/18,90/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- CartLineItem
```

- [ ] **Step 3: Réécrire `CartLineItem.tsx`**

```tsx
// storefront/app/components/CartLineItem.tsx
import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {useAside} from './Aside';
import {dedicaceFromAttributes} from '~/lib/cartAttributes';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

function formatMoney(amount?: string, currency?: string) {
  if (!amount) return '';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency || 'EUR',
  }).format(parseFloat(amount));
}

export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const dedicace = dedicaceFromAttributes(line.attributes);
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;

  return (
    <li className="bsk-cart-line">
      {image?.url ? (
        <img src={image.url} alt={image.altText ?? product.title} loading="lazy" />
      ) : null}

      <div className="bsk-cart-line-main">
        <Link
          prefetch="intent"
          to={lineItemUrl}
          onClick={() => layout === 'aside' && close()}
          style={{textDecoration: 'none'}}
        >
          <p className="bsk-cart-line-title">{product.title}</p>
        </Link>

        {dedicace ? (
          <div className="bsk-cart-ded">Dédicace : « {dedicace} »</div>
        ) : null}

        <div className="bsk-cart-line-foot">
          <CartLineQuantity line={line} />
          <span className="bsk-cart-price">
            {formatMoney(line.cost?.totalAmount?.amount, line.cost?.totalAmount?.currencyCode)}
          </span>
        </div>
        <CartLineRemoveButton lineIds={[id]} disabled={!!line.isOptimistic} />
      </div>

      {lineItemChildren ? (
        <div>
          <p id={childrenLabelId} className="sr-only">
            Articles liés à {product.title}
          </p>
          <ul aria-labelledby={childrenLabelId}>
            {lineItemChildren.map((childLine) => (
              <CartLineItem childrenMap={childrenMap} key={childLine.id} line={childLine} layout={layout} />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="bsk-qty">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button aria-label="Diminuer la quantité" disabled={quantity <= 1 || !!isOptimistic} name="decrease-quantity" value={prevQuantity}>
          −
        </button>
      </CartLineUpdateButton>
      <span>{quantity}</span>
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button aria-label="Augmenter la quantité" name="increase-quantity" value={nextQuantity} disabled={!!isOptimistic}>
          +
        </button>
      </CartLineUpdateButton>
    </div>
  );
}

function CartLineRemoveButton({lineIds, disabled}: {lineIds: string[]; disabled: boolean}) {
  return (
    <CartForm fetcherKey={getUpdateKey(lineIds)} route="/cart" action={CartForm.ACTIONS.LinesRemove} inputs={{lineIds}}>
      <button className="bsk-cart-remove" disabled={disabled} type="submit">
        Retirer
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({children, lines}: {children: React.ReactNode; lines: CartLineUpdateInput[]}) {
  const lineIds = lines.map((line) => line.id);
  return (
    <CartForm fetcherKey={getUpdateKey(lineIds)} route="/cart" action={CartForm.ACTIONS.LinesUpdate} inputs={{lines}}>
      {children}
    </CartForm>
  );
}

function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- CartLineItem
```

- [ ] **Step 5: Commit**

```bash
git add app/components/CartLineItem.tsx app/components/__tests__/CartLineItem.test.tsx
git commit -m "feat(panier): CartLineItem restyle (couverture, dedicace, stepper, prix)"
```

---

### Task 8: Recomposer `CartMain` (barre + liste + pied)

Le drawer (layout `aside`) affiche : `RewardsBar` (sous-total + config lue du root), la liste de lignes, puis `CartDrawerFooter`. La page (`page`) garde le `CartSummary` existant (remises/cartes cadeaux). État vide conservé.

**Files:**
- Modify: `storefront/app/components/CartMain.tsx`
- Test: `storefront/app/components/__tests__/CartMain.test.tsx` (create)

- [ ] **Step 1: Write the failing test (mocks)**

```tsx
// storefront/app/components/__tests__/CartMain.test.tsx
import {describe, it, expect, vi} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';

vi.mock('@shopify/hydrogen', async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  return {...actual, useOptimisticCart: (c: unknown) => c};
});
vi.mock('react-router', async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  return {
    ...actual,
    useRouteLoaderData: () => ({
      rewards: {freeShippingThreshold: 49, giftTiers: [{threshold: 75, label: 'un marque-page'}]},
      publicStoreDomain: null,
    }),
  };
});
// CartLineItem dépend de CartForm — on le neutralise pour ce test de composition
vi.mock('~/components/CartLineItem', () => ({
  CartLineItem: ({line}: {line: {id: string}}) => <li data-testid="line">{line.id}</li>,
}));

const {CartMain} = await import('../CartMain');

const cart = {
  totalQuantity: 1,
  cost: {subtotalAmount: {amount: '30.00', currencyCode: 'EUR'}},
  checkoutUrl: 'https://shop/checkout',
  lines: {nodes: [{id: 'gid://line/1'}]},
  discountCodes: [],
} as never;

describe('CartMain (drawer)', () => {
  it('rend la barre de récompenses + une ligne + le pied', () => {
    renderWithRouter(<CartMain cart={cart} layout="aside" />);
    expect(screen.getByText(/livraison offerte/i)).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
    expect(screen.getByText('Sous-total')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd storefront && npm test -- CartMain
```

- [ ] **Step 3: Réécrire `CartMain.tsx`**

```tsx
// storefront/app/components/CartMain.tsx
import {useOptimisticCart} from '@shopify/hydrogen';
import {Link, useRouteLoaderData} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem, type CartLine} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {RewardsBar} from './RewardsBar';
import {CartDrawerFooter} from './CartDrawerFooter';
import {DEFAULT_REWARDS, type RewardsConfig} from '~/lib/rewards';

export type CartLayout = 'page' | 'aside';
export type CartMainProps = {cart: CartApiQueryFragment | null; layout: CartLayout};

export type LineItemChildrenMap = {[parentId: string]: CartLine[]};
function getLineItemChildrenMap(lines: CartLine[]): LineItemChildrenMap {
  const children: LineItemChildrenMap = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
  }
  return children;
}

export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);
  const rootData = useRouteLoaderData('root') as
    | {rewards?: RewardsConfig; publicStoreDomain?: string}
    | undefined;
  const rewards = rootData?.rewards ?? DEFAULT_REWARDS;
  const storeDomain = rootData?.publicStoreDomain ?? null;

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const cartHasItems = (cart?.totalQuantity ?? 0) > 0;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);
  const subtotal = parseFloat(cart?.cost?.subtotalAmount?.amount ?? '0');

  const shopPayLines = (cart?.lines?.nodes ?? [])
    .filter((l) => !('parentRelationship' in l && l.parentRelationship?.parent))
    .map((l) => ({id: l.merchandise?.id, quantity: l.quantity}))
    .filter((l): l is {id: string; quantity: number} => Boolean(l.id));

  return (
    <section aria-label={layout === 'page' ? 'Panier' : 'Tiroir panier'}>
      {!linesCount ? <CartEmpty /> : null}

      {cartHasItems && layout === 'aside' ? (
        <RewardsBar subtotal={subtotal} config={rewards} />
      ) : null}

      <div className="items" style={{padding: layout === 'aside' ? '8px 22px' : undefined}}>
        <ul aria-label="Lignes du panier" style={{listStyle: 'none', margin: 0, padding: 0}}>
          {(cart?.lines?.nodes ?? []).map((line) => {
            if ('parentRelationship' in line && line.parentRelationship?.parent) return null;
            return <CartLineItem key={line.id} line={line} layout={layout} childrenMap={childrenMap} />;
          })}
        </ul>
      </div>

      {cartHasItems && layout === 'aside' ? (
        <CartDrawerFooter
          subtotalAmount={cart?.cost?.subtotalAmount?.amount ?? '0'}
          currencyCode={cart?.cost?.subtotalAmount?.currencyCode ?? 'EUR'}
          checkoutUrl={cart?.checkoutUrl}
          lines={shopPayLines}
          storeDomain={storeDomain}
        />
      ) : null}

      {cartHasItems && layout === 'page' ? <CartSummary cart={cart} layout={layout} /> : null}
    </section>
  );
}

function CartEmpty() {
  const {close} = useAside();
  return (
    <div style={{padding: 'var(--bsk-space-6) var(--bsk-space-5)', color: 'var(--bsk-fg-secondary)'}}>
      <p>Votre panier est vide pour le moment.</p>
      <Link to="/collections" onClick={close} prefetch="viewport" style={{color: 'var(--bsk-accent-gold)'}}>
        Découvrir le catalogue →
      </Link>
    </div>
  );
}
```

> Note : on a retiré la récursion `lineComponents` de la version scaffold (non utilisée par le catalogue Bilskirnir — pas de bundles). Si des bundles sont ajoutés plus tard, réintroduire la collecte des enfants.

- [ ] **Step 4: Run — expect PASS**

```bash
cd storefront && npm test -- CartMain
```

- [ ] **Step 5: Commit**

```bash
git add app/components/CartMain.tsx app/components/__tests__/CartMain.test.tsx
git commit -m "feat(panier): CartMain recompose (RewardsBar + liste + pied drawer)"
```

---

### Task 9: Sanity check + revue visuelle

- [ ] **Step 1: Toute la suite verte**

```bash
cd storefront && npm test
```

- [ ] **Step 2: Build**

```bash
cd storefront && npm run build
```

- [ ] **Step 3: Revue visuelle (`npm run dev`)**

1. Ajouter un tome au panier depuis une fiche (avec dédicace), ouvrir le drawer.
- [ ] En-tête « Votre panier », barre de progression à paliers : message dynamique (« Plus que X € pour la livraison offerte 🚚 »), jalons camion/cadeau, barre dorée qui se remplit.
- [ ] Ligne : couverture (drop-shadow), titre, **note « Dédicace : « Pour Marie » »** en doré, stepper quantité (recalcul live du prix + de la barre), prix, « Retirer ».
- [ ] Pied : sous-total, « Frais de port et taxes calculés au paiement. », **Passer au paiement** (doré, → checkout), Shop Pay (si activé).
- [ ] Changer la quantité → la barre et le sous-total se mettent à jour ; franchir 49 € → jalon livraison doré + message cadeau ; franchir 75 € → « Tout débloqué 🎉 ».
- [ ] Aucune erreur console.

- [ ] **Step 4: Commit (si ajustements)**

```bash
cd storefront && npm test && git add -A && git commit -m "chore(panier): sanity pass panier recompenses"
```

---

## Self-review (couverture spec §3.6)

| Élément spec | Tâche |
|---|---|
| Barre de progression à paliers (message dynamique, jalons camion/cadeau dorés, MAJ au changement de quantité) | Task 2, 4 (+ recalcul via cart optimiste, Task 8) |
| Lignes : couverture drop-shadow, titre, note de dédicace dorée, stepper, prix, retirer, recalcul live | Task 3, 7 |
| Pied : sous-total, mention frais de port, Passer au paiement doré + Shop Pay | Task 6 |
| Pilotage par metafields boutique (seuil livraison, paliers cadeaux) + défauts raisonnables | Task 2, 5 |
| Livraison offerte réelle = Shopify (barre = incitatif) | Décision §1 (pas de code) |

**Différé (admin / plans suivants) :**
- **Ajout auto de la ligne cadeau à 0 €** : nécessite une **remise automatique Shopify** ciblant le produit cadeau (config admin) — non réalisable via l'API Storefront seule. Documenté ; la barre affiche déjà le palier.
- **Libellé saga·tome** sur la ligne panier : nécessite des metafields sur `merchandise.product` du fragment panier.
- Metafields admin à renseigner : `cart.seuil_livraison_offerte`, `cart.paliers_cadeaux` (JSON `[{"seuil":75,"label":"un marque-page"}]`) + la **shipping rate « gratuit > X € »** correspondante dans Shopify.
- Page `/cart` complète (desktop) : conserve remises/cartes cadeaux ; restyle desktop dédié différé.
```
