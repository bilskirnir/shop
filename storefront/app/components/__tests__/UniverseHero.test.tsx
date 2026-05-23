import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {UniverseHero} from '../UniverseHero';

describe('UniverseHero', () => {
  it('rend titre + genre + lore + stats + éventail', () => {
    const {container} = render(
      <UniverseHero
        title="Au Nom des Dieux"
        genre="Fantastique · Mythologie"
        lore="Quand les dieux se sont tus."
        stats="2 tomes"
        fanCovers={[
          {url: 'a', altText: 'A'},
          {url: 'b', altText: 'B'},
        ]}
      />,
    );
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Au Nom des Dieux');
    expect(screen.getByText('Fantastique · Mythologie')).toBeInTheDocument();
    expect(screen.getByText('Quand les dieux se sont tus.')).toBeInTheDocument();
    expect(screen.getByText('2 tomes')).toBeInTheDocument();
    expect(container.querySelectorAll('.uni-fan img')).toHaveLength(2);
  });

  it('omet genre et lore quand absents', () => {
    render(<UniverseHero title="Fracture" stats="1 tome" />);
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Fracture');
    expect(screen.queryByText('Fantastique · Mythologie')).not.toBeInTheDocument();
  });
});
