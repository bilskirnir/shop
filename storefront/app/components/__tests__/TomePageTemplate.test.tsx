import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {TomePageTemplate} from '../TomePageTemplate';

const baseProps = {
  breadcrumbs: [
    {label: 'Accueil', href: '/'},
    {label: 'Au Nom des Dieux', href: '/collections/au-nom-des-dieux'},
    {label: 'Tome 1'},
  ],
  title: 'Le Sang Versé',
  teaserShort: 'Quand les dieux se taisent…',
  description: 'Synopsis long\n\nDeuxième paragraphe.',
  cover: {
    url: 'https://x/c.jpg',
    altText: 'Le Sang Versé',
    width: 400,
    height: 600,
  },
  universe: {handle: 'au-nom-des-dieux', title: 'Au Nom des Dieux'},
  purchaseSlot: <div data-testid="purchase">CTA</div>,
};

describe('TomePageTemplate', () => {
  it('rend le breadcrumb avec les bons liens', () => {
    renderWithRouter(<TomePageTemplate {...baseProps} />);
    expect(screen.getByRole('link', {name: 'Accueil'})).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', {name: 'Au Nom des Dieux'})).toHaveAttribute(
      'href',
      '/collections/au-nom-des-dieux',
    );
  });

  it('rend titre + teaser + couverture', () => {
    renderWithRouter(<TomePageTemplate {...baseProps} />);
    expect(screen.getByRole('heading', {name: 'Le Sang Versé'})).toBeInTheDocument();
    expect(screen.getByText(/dieux se taisent/)).toBeInTheDocument();
    expect(screen.getByAltText('Le Sang Versé')).toBeInTheDocument();
  });

  it('monte le purchaseSlot', () => {
    renderWithRouter(<TomePageTemplate {...baseProps} />);
    expect(screen.getByTestId('purchase')).toBeInTheDocument();
  });

  it('rend le synopsis pleine largeur en plain text', () => {
    renderWithRouter(<TomePageTemplate {...baseProps} />);
    expect(screen.getByText(/Synopsis long/)).toBeInTheDocument();
    expect(screen.getByText(/Deuxième paragraphe/)).toBeInTheDocument();
  });

  it('rend le bloc "Dans l\'univers de"', () => {
    renderWithRouter(<TomePageTemplate {...baseProps} />);
    expect(screen.getByText(/Dans l'univers de Au Nom des Dieux/)).toBeInTheDocument();
  });
});
