import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {UniverseRail, type UniverseRailItem} from '../UniverseRail';

const items: UniverseRailItem[] = [
  {handle: 'fracture', title: 'Fracture', kicker: 'Univers', accent: '#46638f'},
  {handle: 'berserker', title: 'Berserker', kicker: 'Roman indépendant', accent: null},
];

describe('UniverseRail', () => {
  it('rend une carte par univers avec lien et nom', () => {
    renderWithRouter(<UniverseRail items={items} />);
    expect(screen.getByRole('link', {name: /Fracture/})).toHaveAttribute(
      'href',
      '/collections/fracture',
    );
    expect(screen.getByText('Berserker')).toBeInTheDocument();
  });

  it('ne rend rien si la liste est vide', () => {
    const {container} = renderWithRouter(<UniverseRail items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('porte les classes ciblables (desktop)', () => {
    const {container} = renderWithRouter(<UniverseRail items={items} />);
    expect(container.querySelector('.uni-rail-row')).not.toBeNull();
  });
});
