import {describe, it, expect, vi} from 'vitest';
import {screen, fireEvent} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';

// CartForm s'appuie sur useFetcher (data router) — on le mocke pour tester
// l'unité (stepper, libellés, branches) sans router de données.
vi.mock('@shopify/hydrogen', async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  const CartForm = ({
    children,
  }: {
    children: (f: {state: string; data: unknown}) => React.ReactNode;
  }) => <>{children({state: 'idle', data: null})}</>;
  (CartForm as unknown as {ACTIONS: Record<string, string>}).ACTIONS = {
    LinesAdd: 'LinesAdd',
  };
  return {...actual, CartForm};
});

// useAside dépend du provider Aside (contexte) — on le mocke pour capter open().
const {openSpy} = vi.hoisted(() => ({openSpy: vi.fn()}));
vi.mock('~/components/Aside', () => ({
  useAside: () => ({open: openSpy, close: vi.fn(), type: 'closed'}),
}));

const {TomeAddToCart} = await import('../TomeAddToCart');

describe('TomeAddToCart', () => {
  it('publié : prix + CTA Ajouter au panier + stepper quantité', () => {
    renderWithRouter(
      <TomeAddToCart variantId="gid://v/1" available status="publié" priceFormatted="18,90 €" />,
    );
    expect(screen.getByText('18,90 €')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Ajouter au panier/})).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /augmenter la quantité/i}));
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('ouvre le tiroir panier au clic sur Ajouter', () => {
    openSpy.mockClear();
    renderWithRouter(
      <TomeAddToCart variantId="gid://v/1" available status="publié" priceFormatted="18,90 €" />,
    );
    fireEvent.click(screen.getByRole('button', {name: /Ajouter au panier/}));
    expect(openSpy).toHaveBeenCalledWith('cart');
  });

  it('précommande : CTA Précommander', () => {
    renderWithRouter(
      <TomeAddToCart variantId="gid://v/1" available status="précommande" priceFormatted="18,90 €" />,
    );
    expect(screen.getByRole('button', {name: /Précommander/})).toBeInTheDocument();
  });

  it('annoncé : bloc à paraître non marchand (pas de CTA panier)', () => {
    renderWithRouter(
      <TomeAddToCart variantId="" available={false} status="annoncé" priceFormatted="0,00 €" />,
    );
    expect(screen.getByText(/À PARAÎTRE/)).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: /Ajouter au panier/})).toBeNull();
  });
});
