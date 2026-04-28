import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it} from 'vitest';
import {renderWithRouter} from '~/test/render';
import {Header} from '../Header';
import {Aside} from '../Aside';
import type {UniverseItem} from '../MegaMenu';

const universes: UniverseItem[] = [
  {id: '1', handle: 'au-nom-des-dieux', title: 'Au Nom des Dieux', isStandalone: false},
];

type HeaderProps = {
  universes: UniverseItem[];
  cartCount: number;
};

const renderHeader = (props: HeaderProps) =>
  renderWithRouter(
    <Aside.Provider>
      <Header {...props} />
    </Aside.Provider>,
  );

describe('<Header />', () => {
  it('renders the Bilskirnir logo as a link to home', () => {
    renderHeader({universes, cartCount: 0});
    const logo = screen.getByRole('link', {name: /bilskirnir/i});
    expect(logo).toHaveAttribute('href', '/');
  });

  it('renders the primary nav items', () => {
    renderHeader({universes, cartCount: 0});
    expect(screen.getByRole('link', {name: 'Œuvres'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Goodies'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'La maison'})).toBeInTheDocument();
  });

  it('shows the cart count in the aria-label', () => {
    renderHeader({universes, cartCount: 3});
    const cart = screen.getByLabelText(/panier \(3/i);
    expect(cart).toBeInTheDocument();
  });

  it('reveals the mega-menu when the Univers trigger is activated', async () => {
    const user = userEvent.setup();
    renderHeader({universes, cartCount: 0});
    expect(screen.queryByRole('region', {name: /univers en cours/i})).toBeNull();
    const trigger = screen.getByRole('button', {name: /univers/i});
    await user.click(trigger);
    expect(screen.getByRole('region', {name: /univers en cours/i})).toBeInTheDocument();
  });
});
