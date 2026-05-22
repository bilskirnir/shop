import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ValuesBadges} from '../ValuesBadges';

describe('ValuesBadges', () => {
  it('rend les 3 valeurs de la maison', () => {
    render(<ValuesBadges />);
    expect(screen.getByText(/Expédié sous 48/)).toBeInTheDocument();
    expect(screen.getByText(/Paiement sécurisé/)).toBeInTheDocument();
    expect(screen.getByText(/Dédicace offerte/)).toBeInTheDocument();
  });
});
