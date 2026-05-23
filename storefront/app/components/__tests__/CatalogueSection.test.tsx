import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {CatalogueSection} from '../CatalogueSection';

const tome = {
  handle: 'tome-1',
  title: 'Le Sang Versé',
  cover: {url: 'https://x/c.webp', altText: 'Le Sang Versé', width: 400, height: 600},
  status: 'publié' as const,
  tomeNumber: 1,
  priceFormatted: '18,90 €',
};

describe('CatalogueSection', () => {
  it('rend le nom, le lien et les tomes', () => {
    renderWithRouter(
      <CatalogueSection name="Au Nom des Dieux" accent="#2f8a78" href="/collections/andd" tomes={[tome]} />,
    );
    expect(screen.getByRole('heading', {name: /Au Nom des Dieux/})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Explorer l'univers/i})).toHaveAttribute('href', '/collections/andd');
    expect(screen.getByText('Le Sang Versé')).toBeInTheDocument();
  });

  it('sans href : pas de lien explorer', () => {
    renderWithRouter(<CatalogueSection name="Romans indépendants" accent={null} href={null} tomes={[tome]} />);
    expect(screen.queryByRole('link', {name: /Explorer l'univers/i})).toBeNull();
  });
});
