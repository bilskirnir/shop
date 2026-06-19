import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {createRoutesStub} from 'react-router';
import {SagaScroller} from '../SagaScroller';
import type {HomeScreen} from '~/lib/homeScreens';

vi.mock('~/components/Footer', () => ({Footer: () => <footer>FOOTER</footer>}));

const screens: HomeScreen[] = [
  {key: 'a', kind: 'saga', kicker: 'K', title: 'Saga A', lore: null, accent: null, covers: [{url: 'u', altText: 'a'}], background: null, href: '/c#a', ctaLabel: 'Entrer dans la saga'},
  {key: 'b', kind: 'oneshot', kicker: 'Roman indépendant', title: 'Œuvre B', lore: null, accent: null, covers: [{url: 'u', altText: 'b'}], background: null, href: '/products/b', ctaLabel: 'Découvrir le livre'},
];

function renderScroller(s: HomeScreen[]) {
  const Stub = createRoutesStub([{path: '/', Component: () => <SagaScroller screens={s} />}]);
  return render(<Stub initialEntries={['/']} />);
}

describe('SagaScroller', () => {
  it('rend un panneau par écran + le footer en panneau final', () => {
    const {container} = renderScroller(screens);
    expect(screen.getByRole('heading', {name: 'Saga A'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Œuvre B'})).toBeInTheDocument();
    expect(screen.getByText('FOOTER')).toBeInTheDocument();
    // 2 sagas + 1 footer = 3 panneaux
    expect(container.querySelectorAll('[data-panel]')).toHaveLength(3);
  });

  it('rend des puces de progression (1 par panneau)', () => {
    renderScroller(screens);
    expect(screen.getAllByRole('button', {name: /Aller à la saga/})).toHaveLength(3);
  });
});
