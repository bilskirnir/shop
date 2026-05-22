import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {UniverseHero} from '../UniverseHero';

describe('UniverseHero', () => {
  it('rend titre + citation + stats + pastille genre', () => {
    render(
      <UniverseHero
        title="Au Nom des Dieux"
        kicker="Fantastique · Mythologie"
        quote="« Et si les légendes antiques étaient vraies ? »"
        stats="4 sagas · 6 tomes"
      />,
    );
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Au Nom des Dieux');
    expect(screen.getByText('Fantastique · Mythologie')).toBeInTheDocument();
    expect(screen.getByText(/légendes antiques/)).toBeInTheDocument();
    expect(screen.getByText('4 sagas · 6 tomes')).toBeInTheDocument();
  });

  it('omet la pastille et la citation quand absentes', () => {
    render(<UniverseHero title="Fracture" stats="1 tome" />);
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Fracture');
    expect(screen.getByText('1 tome')).toBeInTheDocument();
    expect(screen.queryByText('Fantastique · Mythologie')).not.toBeInTheDocument();
    expect(screen.queryByText(/légendes antiques/)).not.toBeInTheDocument();
  });

  it("rend l'image hero quand fournie", () => {
    render(
      <UniverseHero
        title="Saga X"
        heroImage={{url: 'https://example.com/hero.jpg', altText: 'Saga X hero', width: 1920, height: 600}}
      />,
    );
    expect(screen.getByAltText('Saga X hero')).toBeInTheDocument();
  });
});
