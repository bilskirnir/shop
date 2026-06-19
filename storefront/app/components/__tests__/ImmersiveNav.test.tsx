import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {createRoutesStub} from 'react-router';
import {renderWithRouter} from '~/test/render';
import {ImmersiveNav} from '../ImmersiveNav';
import {PRIMARY_NAV} from '~/data/nav';

vi.mock('~/components/Aside', () => ({
  useAside: () => ({open: vi.fn(), close: vi.fn(), type: 'closed'}),
}));

vi.mock('~/hooks/useHideOnScroll', () => ({
  useHideOnScroll: () => ({solid: false, hidden: false}),
}));

const universes = [
  {id: '1', handle: 'au-nom-des-dieux', title: 'Au Nom des Dieux', isStandalone: false},
];

function renderNav(variant: 'overlay' | 'solid') {
  const Stub = createRoutesStub([
    {path: '/', Component: () => (
      <ImmersiveNav universes={[]} cartCount={0} variant={variant} />
    )},
  ]);
  return render(<Stub initialEntries={['/']} />);
}

describe('ImmersiveNav (encre)', () => {
  it('affiche le wordmark BILSKIRNIR', () => {
    renderNav('overlay');
    expect(screen.getByText('BILSKIRNIR')).toBeInTheDocument();
  });

  it('expose le variant via data-variant', () => {
    const {container} = renderNav('overlay');
    expect(container.querySelector('header')).toHaveAttribute('data-variant', 'overlay');
  });
});

describe('ImmersiveNav', () => {
  it('affiche le wordmark BILSKIRNIR à gauche', () => {
    renderWithRouter(<ImmersiveNav universes={universes} cartCount={0} />);
    expect(screen.getByText('BILSKIRNIR')).toBeInTheDocument();
  });

  it('affiche la pastille de quantité quand le panier est non vide', () => {
    renderWithRouter(<ImmersiveNav universes={universes} cartCount={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('rend les liens principaux (inline desktop)', () => {
    const {container} = renderWithRouter(<ImmersiveNav universes={universes} cartCount={0} />);
    expect(container.querySelectorAll('.bsk-nav-link')).toHaveLength(PRIMARY_NAV.length);
  });

  it('le burger ouvre le tiroir de menu (avec les univers)', () => {
    const {container} = renderWithRouter(<ImmersiveNav universes={universes} cartCount={0} />);
    expect(container.querySelector('.bsk-nav-drawer.is-open')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: /ouvrir le menu/i}));
    expect(container.querySelector('.bsk-nav-drawer.is-open')).not.toBeNull();
    expect(screen.getByText('Au Nom des Dieux')).toBeInTheDocument();
  });

  it('le tiroir se ferme via le bouton fermer', () => {
    const {container} = renderWithRouter(<ImmersiveNav universes={universes} cartCount={0} />);
    fireEvent.click(screen.getByRole('button', {name: /ouvrir le menu/i}));
    fireEvent.click(screen.getByRole('button', {name: /fermer le menu/i}));
    expect(container.querySelector('.bsk-nav-drawer.is-open')).toBeNull();
  });

  it('variant solid → position sticky', () => {
    const {container} = renderWithRouter(
      <ImmersiveNav universes={universes} cartCount={0} variant="solid" />,
    );
    expect((container.querySelector('header') as HTMLElement).style.position).toBe('sticky');
  });

  it('variant overlay → position fixed', () => {
    const {container} = renderWithRouter(
      <ImmersiveNav universes={universes} cartCount={0} variant="overlay" />,
    );
    expect((container.querySelector('header') as HTMLElement).style.position).toBe('fixed');
  });
});
