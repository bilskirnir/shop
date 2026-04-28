import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {SagaSection} from '../SagaSection';

const tome = (n: number) => ({
  handle: `tome-${n}`,
  title: `Tome ${n}`,
  cover: {
    url: 'https://example.com/c.jpg',
    altText: `T${n}`,
    width: 400,
    height: 600,
  },
  status: 'publié' as const,
  tomeNumber: n,
  priceFormatted: '18,90 €',
});

describe('SagaSection', () => {
  it('rend le label SAGA · TYPE · N TOMES', () => {
    renderWithRouter(
      <SagaSection
        nom="L'Eau et du Sang"
        type="Duologie"
        synopsis="La saga fondatrice de l'univers."
        tomes={[tome(1), tome(2)]}
      />,
    );
    expect(screen.getByText(/SAGA · DUOLOGIE · 2 TOMES/)).toBeInTheDocument();
  });

  it('rend le titre serif et le synopsis', () => {
    renderWithRouter(
      <SagaSection
        nom="L'Eau et du Sang"
        synopsis="La saga fondatrice de l'univers."
        tomes={[tome(1)]}
      />,
    );
    expect(
      screen.getByRole('heading', {name: "L'Eau et du Sang"}),
    ).toBeInTheDocument();
    expect(screen.getByText(/saga fondatrice/)).toBeInTheDocument();
  });

  it('rend tous les TomeCard de la grille', () => {
    renderWithRouter(
      <SagaSection nom="X" tomes={[tome(1), tome(2), tome(3)]} />,
    );
    expect(screen.getByText('Tome 1')).toBeInTheDocument();
    expect(screen.getByText('Tome 2')).toBeInTheDocument();
    expect(screen.getByText('Tome 3')).toBeInTheDocument();
  });

  it('rend CTA bundle si bundleHref fourni', () => {
    renderWithRouter(
      <SagaSection
        nom="X"
        tomes={[tome(1)]}
        bundleHref="/products/saga-x-bundle"
      />,
    );
    expect(
      screen.getByRole('link', {name: /saga complète/i}),
    ).toHaveAttribute('href', '/products/saga-x-bundle');
  });

  it('omet CTA bundle si bundleHref absent', () => {
    renderWithRouter(<SagaSection nom="X" tomes={[tome(1)]} />);
    expect(
      screen.queryByRole('link', {name: /saga complète/i}),
    ).not.toBeInTheDocument();
  });
});
