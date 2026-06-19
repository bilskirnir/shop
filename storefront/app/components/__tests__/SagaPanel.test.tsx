import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {createRoutesStub} from 'react-router';
import {SagaPanel} from '../SagaPanel';
import type {HomeScreen} from '~/lib/homeScreens';

const base: HomeScreen = {
  key: 'k', kind: 'saga', kicker: 'Au Nom des Dieux — Saga', title: "De l'Eau et du Sang",
  lore: 'Le silence des dieux.', author: 'Gautier Durieux de Madron', accent: '#2fb6c4',
  covers: [{url: 'https://x/1.jpg', altText: 'T1'}], background: null, href: '/collections/au-nom-des-dieux#eau', ctaLabel: 'Entrer dans la saga',
};

function renderPanel(s: HomeScreen) {
  const Stub = createRoutesStub([{path: '/', Component: () => <SagaPanel screen={s} index={0} />}]);
  return render(<Stub initialEntries={['/']} />);
}

describe('SagaPanel', () => {
  it('rend le kicker, le titre, le lore et le CTA vers la cible', () => {
    renderPanel(base);
    expect(screen.getByRole('heading', {name: "De l'Eau et du Sang"})).toBeInTheDocument();
    expect(screen.getByText('Au Nom des Dieux — Saga')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Entrer dans la saga/})).toHaveAttribute('href', '/collections/au-nom-des-dieux#eau');
  });

  it("affiche l'auteur préfixé « Par »", () => {
    renderPanel(base);
    expect(screen.getByText(/Par Gautier Durieux de Madron/)).toBeInTheDocument();
  });

  it("applique la couleur d'accent de la saga via --bsk-uni", () => {
    const {container} = renderPanel(base);
    const section = container.querySelector('section');
    expect(section?.getAttribute('style')).toContain('--bsk-uni');
    expect(section?.getAttribute('style')).toContain('#2fb6c4');
  });

  it("reste neutre (pas de --bsk-uni inline) si accent null", () => {
    const {container} = renderPanel({...base, accent: null});
    expect(container.querySelector('section')?.getAttribute('style') ?? '').not.toContain('--bsk-uni');
  });
});
