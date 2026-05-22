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
vi.mock('~/components/CartLineItem', () => ({
  CartLineItem: ({line}: {line: {id: string}}) => <li data-testid="line">{line.id}</li>,
}));

const {CartMain} = await import('../CartMain');

const cart = {
  totalQuantity: 1,
  cost: {subtotalAmount: {amount: '30.00', currencyCode: 'EUR'}},
  checkoutUrl: 'https://shop/checkout',
  lines: {nodes: [{id: 'gid://line/1', merchandise: {id: 'gid://v/1'}, quantity: 1}]},
  discountCodes: [],
} as never;

describe('CartMain (drawer)', () => {
  it('rend la barre de récompenses + une ligne + le pied', () => {
    renderWithRouter(<CartMain cart={cart} layout="aside" />);
    expect(screen.getByText(/Plus que/)).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
    expect(screen.getByText('Sous-total')).toBeInTheDocument();
  });
});
