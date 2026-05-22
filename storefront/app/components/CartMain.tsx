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
