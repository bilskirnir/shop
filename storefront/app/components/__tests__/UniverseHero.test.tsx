import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {UniverseHero} from '../UniverseHero';

describe('UniverseHero', () => {
  it('rend titre + lore + stats en mode fallback typo', () => {
    render(
      <UniverseHero
        title="Au Nom des Dieux"
        lore="Quand les dieux se sont tus, le monde n'a pas cessé de tourner."
        stats="4 sagas · 6 tomes · en cours"
      />,
    );
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent(
      'Au Nom des Dieux',
    );
    expect(screen.getByText(/Quand les dieux/)).toBeInTheDocument();
    expect(screen.getByText('4 sagas · 6 tomes · en cours')).toBeInTheDocument();
  });

  it('rend l\'image hero quand fournie', () => {
    render(
      <UniverseHero
        title="Saga X"
        heroImage={{
          url: 'https://example.com/hero.jpg',
          altText: 'Saga X hero',
          width: 1920,
          height: 600,
        }}
      />,
    );
    expect(screen.getByAltText('Saga X hero')).toBeInTheDocument();
  });

  it('applique themeColor en background fallback quand pas d\'image', () => {
    const {container} = render(
      <UniverseHero title="Fracture" themeColor="#2a4d5c" />,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.style.background).toContain('#2a4d5c');
  });
});
