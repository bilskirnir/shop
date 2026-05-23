import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {UniverseCard} from '../UniverseCard';

describe('UniverseCard', () => {
  it('rend le nom, les stats et le lien vers la page univers', () => {
    renderWithRouter(
      <UniverseCard
        handle="au-nom-des-dieux"
        name="Au Nom des Dieux"
        genre="Fantastique"
        citation="« Et si ? »"
        stats="4 sagas · 6 tomes"
        accent="#2f8a78"
        href="/collections/au-nom-des-dieux"
      />,
    );
    expect(screen.getByRole('link', {name: /Au Nom des Dieux/})).toHaveAttribute(
      'href',
      '/collections/au-nom-des-dieux',
    );
    expect(screen.getByText('4 sagas · 6 tomes')).toBeInTheDocument();
    expect(screen.getByText(/Et si/)).toBeInTheDocument();
  });
});
