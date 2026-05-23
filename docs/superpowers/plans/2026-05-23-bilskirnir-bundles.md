# Bundles (offres « arc complet ») Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afficher, sous le bouton d'ajout au panier d'une fiche produit, les bundles (metaobject `bundles`) contenant ce tome, avec un bouton « Ajouter l'arc complet » qui ajoute tous les tomes du bundle au panier (prix plein, attribut `_bundle`/`_cadeau`), et signaler le cadeau offert dans le panier.

**Architecture :** Un metaobject Shopify `bundles` (créé par l'auteur, champs `nom`/`accroche`/`articles`/`libelle_avantage`) est interrogé par le loader de la fiche via `metaobjects(type:"bundles")`. Un module pur `bundles.ts` parse les nœuds, filtre ceux contenant le produit courant, et fabrique les lignes panier. Un composant `BundleOffer` rend l'encart. L'avantage (cadeau) est *affiché* côté front et *appliqué* par une règle d'automatic discount Shopify côté admin (hors code).

**Tech Stack :** Hydrogen (React Router 7) + Storefront GraphQL, Vitest + Testing Library. Green bar = `npm test` + `npm run build` (lancés depuis `storefront/`). `npm run typecheck` a des erreurs de scaffold préexistantes hors périmètre — ne pas s'y fier.

**Pré-requis admin (hors code, à rappeler à Gautier) :** le metaobject `bundles` doit avoir l'**accès Storefront API** activé. L'application réelle du cadeau 0 € est une règle d'automatic discount Shopify ciblée sur l'attribut de ligne `_bundle`.

---

## File Structure

- **Create** `storefront/app/lib/bundles.ts` — types `BundleArticle`/`Bundle`, `parseBundles`, `bundlesForProduct`, `bundleAddLines`. Pur, sans réseau.
- **Modify** `storefront/app/lib/fragments.ts` — ajouter `BUNDLE_FRAGMENT` (fragment sur `Metaobject`).
- **Create** `storefront/app/components/BundleOffer.tsx` — encart d'une offre (CoverFan + infos + bouton ajout groupé).
- **Modify** `storefront/app/styles/fiche.css` — classes `.bsk-bundle-*`.
- **Modify** `storefront/app/routes/products.$handle.tsx` — query metaobjects, parse, composer `purchaseSlot` = achat + encarts bundles.
- **Modify** `storefront/app/lib/cartAttributes.ts` — `bundleGiftsFromCart` (lecture des cadeaux dans les lignes panier).
- **Modify** `storefront/app/components/CartMain.tsx` — mention cadeau dans le tiroir.
- **Create** `storefront/app/lib/__tests__/bundles.test.ts`
- **Modify** `storefront/app/lib/__tests__/cartAttributes.test.ts`
- **Create** `storefront/app/components/__tests__/BundleOffer.test.tsx`
- **Modify** `storefront/app/components/__tests__/CartMain.test.tsx` (si présent ; sinon assertions ajoutées dans un nouveau bloc)

> **Note clés metaobject :** ce plan suppose les clés `nom`, `accroche`, `articles`, `libelle_avantage`. **Étape 0 (à faire avant la Task 1) :** confirmer ces clés sur le metaobject live. Démarrer le storefront (`npm run dev` depuis `storefront/`) et, dans une route de debug ou via l'app GraphiQL Hydrogen, exécuter `{ metaobjects(type:"bundles", first:5){ nodes { handle fields { key } } } }`. Si une clé diffère (ex. `articles` → `tomes`), remplacer la constante correspondante dans `bundles.ts` et `BUNDLE_FRAGMENT`. Le reste du plan est inchangé.

---

## Task 1: Fragment GraphQL `BUNDLE_FRAGMENT`

**Files:**
- Modify: `storefront/app/lib/fragments.ts` (ajouter en fin de fichier)
- Test: `storefront/app/lib/__tests__/bundles.test.ts` (créé ici, bloc « fragment »)

- [ ] **Step 1: Écrire le test du fragment (échec attendu)**

Créer `storefront/app/lib/__tests__/bundles.test.ts` avec, pour l'instant, uniquement le bloc fragment :

```ts
import {describe, it, expect} from 'vitest';
import {BUNDLE_FRAGMENT} from '../fragments';

describe('BUNDLE_FRAGMENT', () => {
  it('cible le metaobject et expose les champs + références produits', () => {
    expect(BUNDLE_FRAGMENT).toContain('fragment BundleMetaobject on Metaobject');
    expect(BUNDLE_FRAGMENT).toContain('fields { key value');
    expect(BUNDLE_FRAGMENT).toContain('references(first: 20)');
    expect(BUNDLE_FRAGMENT).toContain('... on Product');
    expect(BUNDLE_FRAGMENT).toContain('variants(first: 1)');
    expect(BUNDLE_FRAGMENT).toContain('key: "statut_parution"');
  });
});
```

- [ ] **Step 2: Lancer le test, vérifier l'échec**

Run: `npm test -- bundles` (depuis `storefront/`)
Expected: FAIL — `BUNDLE_FRAGMENT` n'existe pas (import error).

- [ ] **Step 3: Ajouter le fragment dans `fragments.ts`**

Ajouter à la fin de `storefront/app/lib/fragments.ts` :

```ts
export const BUNDLE_FRAGMENT = `#graphql
  fragment BundleMetaobject on Metaobject {
    handle
    fields {
      key
      value
      references(first: 20) {
        nodes {
          ... on Product {
            id
            handle
            title
            featuredImage { url altText }
            priceRange { minVariantPrice { amount currencyCode } }
            statutParution: metafield(namespace: "custom", key: "statut_parution") { value }
            variants(first: 1) { nodes { id availableForSale } }
          }
        }
      }
    }
  }
` as const;
```

- [ ] **Step 4: Lancer le test, vérifier le succès**

Run: `npm test -- bundles`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add storefront/app/lib/fragments.ts storefront/app/lib/__tests__/bundles.test.ts
git commit -m "feat(bundles): fragment GraphQL BundleMetaobject"
```

---

## Task 2: `parseBundles` (types + parsing)

**Files:**
- Create: `storefront/app/lib/bundles.ts`
- Test: `storefront/app/lib/__tests__/bundles.test.ts` (ajouter le bloc `parseBundles`)

- [ ] **Step 1: Écrire le test (échec attendu)**

Ajouter dans `bundles.test.ts` (en haut, compléter les imports ; puis nouveau bloc) :

```ts
import {parseBundles, type BundleMetaobjectNode} from '../bundles';

function node(overrides: Partial<BundleMetaobjectNode> = {}): BundleMetaobjectNode {
  return {
    handle: 'integrale-eau-sang',
    fields: [
      {key: 'nom', value: "De l'Eau et du Sang — l'intégrale", references: null},
      {key: 'accroche', value: "Les 2 tomes de l'arc fondateur", references: null},
      {key: 'libelle_avantage', value: 'Marque-page collector offert', references: null},
      {
        key: 'articles',
        value: null,
        references: {
          nodes: [
            {
              id: 'gid://shopify/Product/1',
              handle: 'tome-1',
              title: 'Tome 1',
              featuredImage: {url: 'https://img/1.jpg', altText: 'T1'},
              priceRange: {minVariantPrice: {amount: '18.0', currencyCode: 'EUR'}},
              statutParution: {value: 'publié'},
              variants: {nodes: [{id: 'gid://shopify/ProductVariant/11', availableForSale: true}]},
            },
            {
              id: 'gid://shopify/Product/2',
              handle: 'tome-2',
              title: 'Tome 2',
              featuredImage: {url: 'https://img/2.jpg', altText: 'T2'},
              priceRange: {minVariantPrice: {amount: '18.0', currencyCode: 'EUR'}},
              statutParution: {value: 'publié'},
              variants: {nodes: [{id: 'gid://shopify/ProductVariant/22', availableForSale: true}]},
            },
          ],
        },
      },
    ],
    ...overrides,
  };
}

describe('parseBundles', () => {
  it('lit les champs, résout les articles et calcule le total', () => {
    const [b] = parseBundles([node()]);
    expect(b.handle).toBe('integrale-eau-sang');
    expect(b.nom).toBe("De l'Eau et du Sang — l'intégrale");
    expect(b.accroche).toBe("Les 2 tomes de l'arc fondateur");
    expect(b.libelleAvantage).toBe('Marque-page collector offert');
    expect(b.articles).toHaveLength(2);
    expect(b.articles[0].variantId).toBe('gid://shopify/ProductVariant/11');
    expect(b.covers).toHaveLength(2);
    expect(b.totalAmount).toBe(36);
    expect(b.totalFormatted).toContain('36');
    expect(b.allAvailable).toBe(true);
  });

  it('marque allAvailable=false si un variant est indisponible', () => {
    const n = node();
    const articles = n.fields.find((f) => f.key === 'articles')!;
    articles.references!.nodes[1].variants.nodes[0].availableForSale = false;
    const [b] = parseBundles([n]);
    expect(b.allAvailable).toBe(false);
  });

  it('ignore un bundle sans article', () => {
    const empty = node({
      fields: [{key: 'nom', value: 'Vide', references: null}],
    });
    expect(parseBundles([empty])).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Lancer le test, vérifier l'échec**

Run: `npm test -- bundles`
Expected: FAIL — module `../bundles` introuvable.

- [ ] **Step 3: Créer `bundles.ts`**

```ts
import type {OptimisticCartLineInput} from '@shopify/hydrogen';
import {metaobjectField, parseStatutParution} from '~/lib/tomeMetafields';
import type {ReleaseStatus} from '~/components/ReleaseStatusBadge';
import type {FanCover} from '~/lib/universeFan';

interface ProductRef {
  id: string;
  handle: string;
  title: string;
  featuredImage?: {url: string; altText?: string | null} | null;
  priceRange: {minVariantPrice: {amount: string; currencyCode: string}};
  statutParution?: {value?: string | null} | null;
  variants: {nodes: Array<{id: string; availableForSale: boolean}>};
}

export interface MetaobjectFieldNode {
  key: string;
  value?: string | null;
  references?: {nodes: ProductRef[]} | null;
}

export interface BundleMetaobjectNode {
  handle: string;
  fields: MetaobjectFieldNode[];
}

export interface BundleArticle {
  productId: string;
  handle: string;
  title: string;
  variantId: string | null;
  available: boolean;
  status: ReleaseStatus;
  cover: FanCover | null;
  priceAmount: number;
}

export interface Bundle {
  handle: string;
  nom: string;
  accroche: string | null;
  libelleAvantage: string | null;
  articles: BundleArticle[];
  covers: FanCover[];
  totalAmount: number;
  totalFormatted: string;
  currency: string;
  allAvailable: boolean;
}

function fieldReferences(fields: MetaobjectFieldNode[], key: string): ProductRef[] {
  return fields.find((f) => f.key === key)?.references?.nodes ?? [];
}

function toArticle(p: ProductRef): BundleArticle {
  const variant = p.variants?.nodes?.[0] ?? null;
  return {
    productId: p.id,
    handle: p.handle,
    title: p.title,
    variantId: variant?.id ?? null,
    available: variant?.availableForSale ?? false,
    status: parseStatutParution(p.statutParution?.value),
    cover: p.featuredImage?.url
      ? {url: p.featuredImage.url, altText: p.featuredImage.altText ?? p.title}
      : null,
    priceAmount: parseFloat(p.priceRange.minVariantPrice.amount) || 0,
  };
}

export function parseBundles(nodes: ReadonlyArray<BundleMetaobjectNode>): Bundle[] {
  const out: Bundle[] = [];
  for (const n of nodes) {
    const articles = fieldReferences(n.fields, 'articles').map(toArticle);
    if (articles.length === 0) continue;
    const refs = fieldReferences(n.fields, 'articles');
    const currency = refs[0]?.priceRange.minVariantPrice.currencyCode || 'EUR';
    const totalAmount = articles.reduce((s, a) => s + a.priceAmount, 0);
    out.push({
      handle: n.handle,
      nom: metaobjectField(n.fields, 'nom') ?? n.handle,
      accroche: metaobjectField(n.fields, 'accroche'),
      libelleAvantage: metaobjectField(n.fields, 'libelle_avantage'),
      articles,
      covers: articles.map((a) => a.cover).filter((c): c is FanCover => c !== null),
      totalAmount,
      totalFormatted: new Intl.NumberFormat('fr-FR', {style: 'currency', currency}).format(totalAmount),
      currency,
      allAvailable: articles.every((a) => a.available),
    });
  }
  return out;
}
```

- [ ] **Step 4: Lancer le test, vérifier le succès**

Run: `npm test -- bundles`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add storefront/app/lib/bundles.ts storefront/app/lib/__tests__/bundles.test.ts
git commit -m "feat(bundles): parseBundles (metaobject -> Bundle[])"
```

---

## Task 3: `bundlesForProduct`

**Files:**
- Modify: `storefront/app/lib/bundles.ts`
- Test: `storefront/app/lib/__tests__/bundles.test.ts`

- [ ] **Step 1: Écrire le test (échec attendu)**

Ajouter dans `bundles.test.ts` :

```ts
import {bundlesForProduct} from '../bundles';

describe('bundlesForProduct', () => {
  it('ne garde que les bundles contenant le produit', () => {
    const bundles = parseBundles([node()]);
    expect(bundlesForProduct(bundles, 'gid://shopify/Product/1')).toHaveLength(1);
    expect(bundlesForProduct(bundles, 'gid://shopify/Product/999')).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Lancer le test, vérifier l'échec**

Run: `npm test -- bundles`
Expected: FAIL — `bundlesForProduct` non exporté.

- [ ] **Step 3: Ajouter la fonction dans `bundles.ts`**

```ts
export function bundlesForProduct(
  bundles: ReadonlyArray<Bundle>,
  productId: string,
): Bundle[] {
  return bundles.filter((b) => b.articles.some((a) => a.productId === productId));
}
```

- [ ] **Step 4: Lancer le test, vérifier le succès**

Run: `npm test -- bundles`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add storefront/app/lib/bundles.ts storefront/app/lib/__tests__/bundles.test.ts
git commit -m "feat(bundles): bundlesForProduct (filtre par appartenance)"
```

---

## Task 4: `bundleAddLines`

**Files:**
- Modify: `storefront/app/lib/bundles.ts`
- Test: `storefront/app/lib/__tests__/bundles.test.ts`

- [ ] **Step 1: Écrire le test (échec attendu)**

Ajouter dans `bundles.test.ts` :

```ts
import {bundleAddLines} from '../bundles';

describe('bundleAddLines', () => {
  it('une ligne par tome disponible, avec attributs _bundle et _cadeau', () => {
    const [b] = parseBundles([node()]);
    const lines = bundleAddLines(b);
    expect(lines).toHaveLength(2);
    expect(lines[0].merchandiseId).toBe('gid://shopify/ProductVariant/11');
    expect(lines[0].quantity).toBe(1);
    expect(lines[0].attributes).toContainEqual({key: '_bundle', value: 'integrale-eau-sang'});
    expect(lines[0].attributes).toContainEqual({
      key: '_cadeau',
      value: 'Marque-page collector offert',
    });
  });

  it('exclut les tomes indisponibles ou sans variant', () => {
    const n = node();
    const articles = n.fields.find((f) => f.key === 'articles')!;
    articles.references!.nodes[1].variants.nodes[0].availableForSale = false;
    const [b] = parseBundles([n]);
    expect(bundleAddLines(b)).toHaveLength(1);
  });

  it("omet l'attribut _cadeau si pas de libellé", () => {
    const n = node({
      fields: [
        {key: 'nom', value: 'Sans cadeau', references: null},
        {
          key: 'articles',
          value: null,
          references: {
            nodes: [
              {
                id: 'gid://shopify/Product/1',
                handle: 't1',
                title: 'T1',
                featuredImage: null,
                priceRange: {minVariantPrice: {amount: '18.0', currencyCode: 'EUR'}},
                statutParution: {value: 'publié'},
                variants: {nodes: [{id: 'gid://shopify/ProductVariant/11', availableForSale: true}]},
              },
            ],
          },
        },
      ],
    });
    const [b] = parseBundles([n]);
    const lines = bundleAddLines(b);
    expect(lines[0].attributes?.some((a) => a.key === '_cadeau')).toBe(false);
  });
});
```

- [ ] **Step 2: Lancer le test, vérifier l'échec**

Run: `npm test -- bundles`
Expected: FAIL — `bundleAddLines` non exporté.

- [ ] **Step 3: Ajouter la fonction dans `bundles.ts`**

```ts
export function bundleAddLines(bundle: Bundle): OptimisticCartLineInput[] {
  return bundle.articles
    .filter((a) => a.available && a.variantId)
    .map((a) => {
      const attributes = [{key: '_bundle', value: bundle.handle}];
      if (bundle.libelleAvantage) {
        attributes.push({key: '_cadeau', value: bundle.libelleAvantage});
      }
      return {merchandiseId: a.variantId as string, quantity: 1, attributes};
    });
}
```

- [ ] **Step 4: Lancer le test, vérifier le succès**

Run: `npm test -- bundles`
Expected: PASS (tous les blocs `bundles`).

- [ ] **Step 5: Commit**

```bash
git add storefront/app/lib/bundles.ts storefront/app/lib/__tests__/bundles.test.ts
git commit -m "feat(bundles): bundleAddLines (ajout groupe + attributs panier)"
```

---

## Task 5: Composant `BundleOffer`

**Files:**
- Create: `storefront/app/components/BundleOffer.tsx`
- Test: `storefront/app/components/__tests__/BundleOffer.test.tsx`

- [ ] **Step 1: Écrire le test (échec attendu)**

Créer `storefront/app/components/__tests__/BundleOffer.test.tsx` :

```tsx
import {describe, it, expect, vi} from 'vitest';
import {screen, fireEvent} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import type {Bundle} from '~/lib/bundles';

vi.mock('@shopify/hydrogen', async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  const CartForm = ({
    children,
  }: {
    children: (f: {state: string; data: unknown}) => React.ReactNode;
  }) => <>{children({state: 'idle', data: null})}</>;
  (CartForm as unknown as {ACTIONS: Record<string, string>}).ACTIONS = {LinesAdd: 'LinesAdd'};
  return {...actual, CartForm};
});

const {openSpy} = vi.hoisted(() => ({openSpy: vi.fn()}));
vi.mock('~/components/Aside', () => ({
  useAside: () => ({open: openSpy, close: vi.fn(), type: 'closed'}),
}));

const {BundleOffer} = await import('../BundleOffer');

function bundle(overrides: Partial<Bundle> = {}): Bundle {
  return {
    handle: 'integrale',
    nom: "De l'Eau et du Sang — l'intégrale",
    accroche: 'Les 2 tomes',
    libelleAvantage: 'Marque-page collector offert',
    covers: [{url: 'https://img/1.jpg', altText: 'T1'}, {url: 'https://img/2.jpg', altText: 'T2'}],
    articles: [
      {productId: 'p1', handle: 't1', title: 'T1', variantId: 'v1', available: true, status: 'publié', cover: null, priceAmount: 18},
      {productId: 'p2', handle: 't2', title: 'T2', variantId: 'v2', available: true, status: 'publié', cover: null, priceAmount: 18},
    ],
    totalAmount: 36,
    totalFormatted: '36,00 €',
    currency: 'EUR',
    allAvailable: true,
    ...overrides,
  };
}

describe('BundleOffer', () => {
  it('affiche nom, accroche, avantage, total et le bouton', () => {
    renderWithRouter(<BundleOffer bundle={bundle()} />);
    expect(screen.getByText(/l'intégrale/)).toBeInTheDocument();
    expect(screen.getByText('Les 2 tomes')).toBeInTheDocument();
    expect(screen.getByText(/Marque-page collector offert/)).toBeInTheDocument();
    expect(screen.getByText(/36,00 €/)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Ajouter l'arc complet/})).toBeInTheDocument();
  });

  it('ouvre le tiroir au clic', () => {
    openSpy.mockClear();
    renderWithRouter(<BundleOffer bundle={bundle()} />);
    fireEvent.click(screen.getByRole('button', {name: /Ajouter l'arc complet/}));
    expect(openSpy).toHaveBeenCalledWith('cart');
  });

  it('désactive le bouton et signale l\'indisponibilité si un tome est épuisé', () => {
    renderWithRouter(<BundleOffer bundle={bundle({allAvailable: false})} />);
    expect(screen.getByRole('button', {name: /Ajouter l'arc complet/})).toBeDisabled();
    expect(screen.getByText(/momentanément indisponible/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Lancer le test, vérifier l'échec**

Run: `npm test -- BundleOffer`
Expected: FAIL — module `../BundleOffer` introuvable.

- [ ] **Step 3: Créer `BundleOffer.tsx`**

```tsx
import {useEffect, useRef, useState} from 'react';
import {CartForm} from '@shopify/hydrogen';
import type {FetcherWithComponents} from 'react-router';
import {CoverFan} from './CoverFan';
import {useAside} from './Aside';
import {bundleAddLines, type Bundle} from '~/lib/bundles';

function BundleAddButton({
  fetcher,
  disabled,
  onAdd,
}: {
  fetcher: FetcherWithComponents<unknown>;
  disabled: boolean;
  onAdd: () => void;
}) {
  const [showToast, setShowToast] = useState(false);
  const prev = useRef(fetcher.state);
  useEffect(() => {
    if (prev.current !== 'idle' && fetcher.state === 'idle' && fetcher.data) {
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 1800);
      prev.current = fetcher.state;
      return () => clearTimeout(t);
    }
    prev.current = fetcher.state;
  }, [fetcher.state, fetcher.data]);

  return (
    <>
      <button
        type="submit"
        onClick={onAdd}
        disabled={disabled || fetcher.state !== 'idle'}
        className="bsk-bundle-btn"
      >
        {fetcher.state !== 'idle' ? '…' : "Ajouter l'arc complet"}
      </button>
      <div className={`fiche-toast${showToast ? ' is-show' : ''}`} role="status" aria-live="polite">
        Ajouté au panier ✓
      </div>
    </>
  );
}

export function BundleOffer({bundle}: {bundle: Bundle}) {
  const {open} = useAside();
  const count = bundle.articles.length;
  const lines = bundleAddLines(bundle);

  return (
    <div className="bsk-bundle">
      <span className="bsk-bundle-badge">Offre · L'arc complet</span>
      <div className="bsk-bundle-head">
        <CoverFan covers={bundle.covers} />
        <div className="bsk-bundle-meta">
          <h3 className="bsk-bundle-nom">{bundle.nom}</h3>
          {bundle.accroche ? <p className="bsk-bundle-accroche">{bundle.accroche}</p> : null}
        </div>
      </div>
      {bundle.libelleAvantage ? (
        <p className="bsk-bundle-gift">✦ {bundle.libelleAvantage}</p>
      ) : null}
      <p className="bsk-bundle-price">
        Les {count} tome{count > 1 ? 's' : ''} : {bundle.totalFormatted}
      </p>
      <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
        {(fetcher: FetcherWithComponents<unknown>) => (
          <BundleAddButton
            fetcher={fetcher}
            disabled={!bundle.allAvailable}
            onAdd={() => open('cart')}
          />
        )}
      </CartForm>
      {!bundle.allAvailable ? (
        <p className="bsk-bundle-oos">Un tome de cet arc est momentanément indisponible.</p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Lancer le test, vérifier le succès**

Run: `npm test -- BundleOffer`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add storefront/app/components/BundleOffer.tsx storefront/app/components/__tests__/BundleOffer.test.tsx
git commit -m "feat(bundles): composant BundleOffer (encart ajout groupe)"
```

---

## Task 6: Styles de l'encart

**Files:**
- Modify: `storefront/app/styles/fiche.css` (ajouter en fin de fichier)

- [ ] **Step 1: Ajouter les styles `.bsk-bundle-*`**

Ajouter à la fin de `storefront/app/styles/fiche.css` :

```css
/* --- Bundle (offre arc complet) sous l'ajout au panier --- */
.bsk-bundle {
  margin-top: var(--bsk-space-5);
  padding: var(--bsk-space-4);
  border: 1px solid var(--bsk-accent-gold);
  border-radius: var(--bsk-radius);
  background: linear-gradient(180deg, rgba(200, 164, 77, 0.10), transparent);
}
.bsk-bundle-badge {
  display: inline-block;
  font-family: var(--bsk-font-sans);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--bsk-accent-gold);
  border: 1px solid var(--bsk-accent-gold);
  border-radius: 999px;
  padding: 3px 10px;
  margin-bottom: var(--bsk-space-3);
}
.bsk-bundle-head {
  display: flex;
  gap: var(--bsk-space-3);
  align-items: center;
}
.bsk-bundle-meta {
  min-width: 0;
}
.bsk-bundle-nom {
  font-family: var(--bsk-font-display);
  font-size: var(--bsk-text-lg);
  color: var(--bsk-fg-primary);
  margin: 0;
}
.bsk-bundle-accroche {
  font-size: var(--bsk-text-sm);
  color: var(--bsk-fg-secondary);
  margin: 4px 0 0;
}
.bsk-bundle-gift {
  font-size: var(--bsk-text-sm);
  color: var(--bsk-accent-gold);
  margin: var(--bsk-space-3) 0 0;
}
.bsk-bundle-price {
  font-family: var(--bsk-font-sans);
  font-size: var(--bsk-text-sm);
  color: var(--bsk-fg-secondary);
  margin: var(--bsk-space-2) 0 var(--bsk-space-3);
}
.bsk-bundle-btn {
  width: 100%;
  height: 48px;
  font-family: var(--bsk-font-sans);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: #231603;
  background: linear-gradient(135deg, var(--bsk-accent-gold), var(--bsk-accent-gold-dim));
  border: none;
  border-radius: var(--bsk-radius);
  cursor: pointer;
}
.bsk-bundle-btn:disabled {
  background: var(--bsk-fg-muted);
  cursor: not-allowed;
}
.bsk-bundle-oos {
  font-size: var(--bsk-text-xs);
  color: var(--bsk-fg-secondary);
  margin: var(--bsk-space-2) 0 0;
}
```

> Vérifier que les tokens utilisés existent dans `app/styles/tokens.css` (notamment `--bsk-accent-gold-dim`, déjà employé par `TomeAddToCart`). Si un token manque, réutiliser un équivalent présent.

- [ ] **Step 2: Vérifier que le build passe**

Run: `npm run build`
Expected: build OK (le CSS est importé par `fiche.css` déjà chargé dans la route produit).

- [ ] **Step 3: Commit**

```bash
git add storefront/app/styles/fiche.css
git commit -m "feat(bundles): styles encart .bsk-bundle"
```

---

## Task 7: Câblage dans la route produit

**Files:**
- Modify: `storefront/app/routes/products.$handle.tsx`

- [ ] **Step 1: Importer fragment, helpers et composant**

En haut de `products.$handle.tsx`, compléter les imports :

```ts
import {TOME_METAFIELDS_FRAGMENT, BUNDLE_FRAGMENT} from '~/lib/fragments';
import {bundlesForProduct, parseBundles} from '~/lib/bundles';
import {BundleOffer} from '~/components/BundleOffer';
```

(Remplacer la ligne d'import existante de `~/lib/fragments`.)

- [ ] **Step 2: Ajouter la requête metaobjects dans `PRODUCT_QUERY`**

Dans `PRODUCT_QUERY`, ajouter le champ `bundles` à côté de `standalone`, et le fragment à la fin :

```ts
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
    bundles: metaobjects(type: "bundles", first: 50) {
      nodes { ...BundleMetaobject }
    }
  }
  ${PRODUCT_FRAGMENT}
  ${BUNDLE_FRAGMENT}
` as const;
```

- [ ] **Step 3: Récupérer `bundles` dans le loader**

Modifier le loader :

```ts
export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw new Error('Expected product handle');
  const {product, standalone, bundles} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions: getSelectedProductOptions(request)},
  });
  if (!product?.id) throw new Response(null, {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: product});
  return {product, standalone, bundles, storeDomain: context.env.PUBLIC_STORE_DOMAIN};
}
```

- [ ] **Step 4: Composer `purchaseSlot` avec les encarts bundles**

Dans `ProductRoute`, après la destructuration `useLoaderData` (ajouter `bundles`) et après la définition de `purchase` :

```ts
const {product, standalone, bundles, storeDomain} = useLoaderData<typeof loader>();
```

puis, juste après la constante `purchase` :

```ts
const productBundles = bundlesForProduct(parseBundles(bundles?.nodes ?? []), product.id);
const purchaseWithBundles = (
  <>
    {purchase}
    {productBundles.map((b) => (
      <BundleOffer key={b.handle} bundle={b} />
    ))}
  </>
);
```

Puis remplacer **les deux** usages `purchaseSlot={purchase}` (one-shot et tome) par `purchaseSlot={purchaseWithBundles}`.

- [ ] **Step 5: Vérifier types + build**

Run: `npm run build`
Expected: build OK. (Le type généré `bundles` provient de `storefrontapi.generated` après le codegen intégré au build.)

- [ ] **Step 6: Vérifier en dev (manuel)**

Run: `npm run dev`, ouvrir une fiche produit (tome et one-shot).
Expected : si aucun bundle ne contient le produit → aucun encart (cas dev actuel, normal). Aucune erreur console/SSR. Une fois que Gautier aura créé un bundle `bundles` (avec accès Storefront API) référençant le tome, l'encart apparaît sous l'ajout au panier.

- [ ] **Step 7: Commit**

```bash
git add storefront/app/routes/products.$handle.tsx
git commit -m "feat(bundles): cablage fiche produit (query metaobjects + encarts sous l'achat)"
```

---

## Task 8: `bundleGiftsFromCart` (lecture des cadeaux au panier)

**Files:**
- Modify: `storefront/app/lib/cartAttributes.ts`
- Test: `storefront/app/lib/__tests__/cartAttributes.test.ts`

- [ ] **Step 1: Écrire le test (échec attendu)**

Ajouter dans `cartAttributes.test.ts` :

```ts
import {bundleGiftsFromCart} from '../cartAttributes';

describe('bundleGiftsFromCart', () => {
  it('renvoie les libellés cadeaux distincts présents sur les lignes', () => {
    const lines = [
      {attributes: [{key: '_bundle', value: 'a'}, {key: '_cadeau', value: 'Marque-page offert'}]},
      {attributes: [{key: '_bundle', value: 'a'}, {key: '_cadeau', value: 'Marque-page offert'}]},
      {attributes: [{key: 'Dédicace', value: 'Pour Léa'}]},
    ];
    expect(bundleGiftsFromCart(lines)).toEqual(['Marque-page offert']);
  });

  it('liste vide si aucun cadeau', () => {
    expect(bundleGiftsFromCart([{attributes: [{key: 'Dédicace', value: 'x'}]}])).toEqual([]);
  });
});
```

- [ ] **Step 2: Lancer le test, vérifier l'échec**

Run: `npm test -- cartAttributes`
Expected: FAIL — `bundleGiftsFromCart` non exporté.

- [ ] **Step 3: Ajouter la fonction dans `cartAttributes.ts`**

```ts
interface LineWithAttributes {
  attributes?: ReadonlyArray<CartAttribute> | null;
}

/** Libellés de cadeaux bundle distincts présents dans les lignes du panier. */
export function bundleGiftsFromCart(
  lines: ReadonlyArray<LineWithAttributes> | null | undefined,
): string[] {
  const seen = new Set<string>();
  for (const line of lines ?? []) {
    const gift = line.attributes?.find((a) => a.key === '_cadeau')?.value?.trim();
    if (gift) seen.add(gift);
  }
  return [...seen];
}
```

- [ ] **Step 4: Lancer le test, vérifier le succès**

Run: `npm test -- cartAttributes`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add storefront/app/lib/cartAttributes.ts storefront/app/lib/__tests__/cartAttributes.test.ts
git commit -m "feat(bundles): bundleGiftsFromCart (cadeaux dans les lignes panier)"
```

---

## Task 9: Mention cadeau dans le tiroir panier

**Files:**
- Modify: `storefront/app/components/CartMain.tsx`
- Modify: `storefront/app/styles/fiche.css` (ou `cart.css` si présent — utiliser le fichier déjà importé par le panier ; voir Step 3)
- Test: `storefront/app/components/__tests__/CartMain.test.tsx`

- [ ] **Step 1: Écrire/compléter le test (échec attendu)**

Ouvrir `CartMain.test.tsx`. S'inspirer du rendu existant (un cart avec des lignes portant `attributes`). Ajouter un cas :

```tsx
it('affiche la mention cadeau si une ligne porte un _cadeau', () => {
  const cart = {
    totalQuantity: 1,
    lines: {nodes: [{id: 'l1', quantity: 1, merchandise: {id: 'v1'}, attributes: [{key: '_cadeau', value: 'Marque-page offert'}]}]},
    cost: {subtotalAmount: {amount: '36.0', currencyCode: 'EUR'}},
    checkoutUrl: 'https://x',
  } as never;
  renderWithRouter(<CartMain layout="aside" cart={cart} />);
  expect(screen.getByText(/Marque-page offert/)).toBeInTheDocument();
});
```

> Adapter la forme du `cart` mock à celle déjà utilisée dans le fichier de test existant (réutiliser un helper local s'il y en a un). Si `CartMain.test.tsx` n'existe pas, créer le fichier avec le mock minimal ci-dessus + les `vi.mock` nécessaires (voir les autres tests panier comme `CartDrawerFooter.test.tsx`/`CartLineItem.test.tsx` pour les mocks `@shopify/hydrogen` et `~/components/Aside`).

- [ ] **Step 2: Lancer le test, vérifier l'échec**

Run: `npm test -- CartMain`
Expected: FAIL — la mention n'est pas rendue.

- [ ] **Step 3: Ajouter la mention dans `CartMain.tsx`**

Importer le helper en haut :

```ts
import {bundleGiftsFromCart} from '~/lib/cartAttributes';
```

Calculer les cadeaux (après la ligne `const subtotal = ...`) :

```ts
const gifts = bundleGiftsFromCart(cart?.lines?.nodes ?? []);
```

Puis, dans le rendu `aside`, juste après le `<RewardsBar />` :

```tsx
{cartHasItems && layout === 'aside' && gifts.length > 0 ? (
  <div className="bsk-cart-gifts" role="status">
    {gifts.map((g) => (
      <p key={g} className="bsk-cart-gift">✦ Cadeau offert : {g}</p>
    ))}
  </div>
) : null}
```

Ajouter les styles à la fin de `fiche.css` (importé globalement via les routes ; sinon ajouter dans le CSS du panier déjà chargé) :

```css
.bsk-cart-gifts {
  padding: 0 22px var(--bsk-space-3);
}
.bsk-cart-gift {
  font-size: var(--bsk-text-sm);
  color: var(--bsk-accent-gold);
  margin: 0;
}
```

> Vérifier où le CSS du tiroir est importé (`grep -rn "RewardsBar\|bsk-rw" app/styles`) et placer `.bsk-cart-*` dans le même fichier que `.bsk-rw` pour garantir le chargement dans le panier.

- [ ] **Step 4: Lancer le test, vérifier le succès**

Run: `npm test -- CartMain`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add storefront/app/components/CartMain.tsx storefront/app/styles/
git commit -m "feat(bundles): mention cadeau dans le tiroir panier"
```

---

## Task 10: Vérification finale + push

**Files:** aucun (vérification)

- [ ] **Step 1: Suite complète + build**

Run (depuis `storefront/`) : `npm test` puis `npm run build`
Expected : tous les tests verts (les ~201 existants + les nouveaux), build propre.

- [ ] **Step 2: Vérif dev des deux gabarits**

Run: `npm run dev`. Ouvrir une fiche tome et une fiche one-shot. Confirmer : aucune erreur SSR/console ; sans bundle correspondant, aucun encart (comportement dev attendu).

- [ ] **Step 3: Push**

```bash
git push
```

(Branche courante — voir la note ci-dessous sur la stratégie de branche.)

---

## Self-review — couverture de la spec

- Metaobject `bundles` (4 champs) → Task 1 (fragment) + Task 2 (parsing). ✅
- Découverte par appartenance → Task 3 (`bundlesForProduct`). ✅
- Encart sous l'ajout au panier (tome + one-shot) → Task 5 (composant) + Task 6 (styles) + Task 7 (câblage `purchaseSlot`, les deux gabarits). ✅
- Ajout groupé + attribut `_bundle` → Task 4 (`bundleAddLines`). ✅
- Prix indicatif = somme des tomes → Task 2 (`totalFormatted`) affiché en Task 5. ✅
- Cas limite épuisé → bouton désactivé → Task 4 (exclusion) + Task 5 (disabled + mention) + tests. ✅
- Précommande → ajout autorisé : `parseStatutParution`/`available` repose sur `availableForSale` du variant ; les précommandes restent `available` → incluses. ✅
- Pas de dédicace sur l'ajout groupé → `bundleAddLines` n'ajoute que `_bundle`/`_cadeau`. ✅
- Mention cadeau au panier → Task 8 (`bundleGiftsFromCart`) + Task 9 (CartMain). ✅
- Application réelle du cadeau (admin discount) + accès Storefront API du metaobject → hors code, rappelés en en-tête. ✅

## Notes

- **Stratégie de branche :** créer une feature branch (`feat/bundles`) avant la Task 1 si l'on veut isoler le travail de `main` ; sinon, suivre la pratique du dépôt (commits directs). À confirmer avec l'utilisateur au lancement de l'exécution.
- **DRY / duplication assumée :** `BundleAddButton` (toast + état fetcher) duplique le pattern de `TomeAddToCart.AddButton`. Extraction d'un composant partagé volontairement écartée (scope/risque) — à reconsidérer si un 3e usage apparaît.
- **`npm run typecheck`** : erreurs de scaffold Hydrogen préexistantes (PaginatedResourceSection, SearchForm) hors périmètre. Ne pas traiter ici.
