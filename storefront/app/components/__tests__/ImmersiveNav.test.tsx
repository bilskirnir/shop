import {describe, it, expect, vi} from 'vitest';
import {screen, fireEvent} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {ImmersiveNav} from '../ImmersiveNav';

vi.mock('~/components/Aside', () => ({
  useAside: () => ({open: vi.fn(), close: vi.fn(), type: 'closed'}),
}));

const universes = [
  {id: '1', handle: 'au-nom-des-dieux', title: 'Au Nom des Dieux', isStandalone: false},
];

describe('ImmersiveNav', () => {
  it('rend le logo de la maison', () => {
    renderWithRouter(<ImmersiveNav universes={universes} cartCount={0} />);
    expect(screen.getByRole('img', {name: /bilskirnir/i})).toBeInTheDocument();
  });

  it('affiche la pastille de quantité quand le panier est non vide', () => {
    renderWithRouter(<ImmersiveNav universes={universes} cartCount={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('le burger ouvre le menu des univers', () => {
    renderWithRouter(<ImmersiveNav universes={universes} cartCount={0} />);
    expect(screen.queryByText('Au Nom des Dieux')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /menu/i}));
    expect(screen.getByText('Au Nom des Dieux')).toBeInTheDocument();
  });
});
