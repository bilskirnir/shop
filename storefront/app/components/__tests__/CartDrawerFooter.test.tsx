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
