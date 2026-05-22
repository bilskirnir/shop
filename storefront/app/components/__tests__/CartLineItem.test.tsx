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
  return {...actual, CartForm};
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
