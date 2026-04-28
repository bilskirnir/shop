import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {TomeCard} from '../TomeCard';

const baseTome = {
  handle: 'tome-1',
  title: 'Le Sang Versé',
  cover: {
    url: 'https://example.com/c.jpg',
    altText: 'Le Sang Versé',
    width: 400,
    height: 600,
  },
};

describe('TomeCard', () => {
  it('rend titre + couverture + lien produit', () => {
    renderWithRouter(<TomeCard {...baseTome} status="publié" priceFormatted="18,90 €" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/products/tome-1');
    expect(screen.getByText('Le Sang Versé')).toBeInTheDocument();
    expect(screen.getByAltText('Le Sang Versé')).toBeInTheDocument();
  });

  it('affiche tome N quand fourni', () => {
    renderWithRouter(
      <TomeCard {...baseTome} tomeNumber={1} status="publié" priceFormatted="18,90 €" />,
    );
    expect(screen.getByText(/TOME 1/)).toBeInTheDocument();
  });

  it('affiche le prix pour publié', () => {
    renderWithRouter(<TomeCard {...baseTome} status="publié" priceFormatted="18,90 €" />);
    expect(screen.getByText('18,90 €')).toBeInTheDocument();
  });

  it('cache le prix pour précommande/annoncé et délègue à ReleaseStatusBadge', () => {
    renderWithRouter(
      <TomeCard
        {...baseTome}
        status="annoncé"
        priceFormatted="18,90 €"
      />,
    );
    expect(screen.queryByText('18,90 €')).not.toBeInTheDocument();
    expect(screen.getByText(/À PARAÎTRE/)).toBeInTheDocument();
  });
});
