import {describe, it, expect} from 'vitest';
import {render} from '@testing-library/react';
import {createRoutesStub} from 'react-router';
import {CoverFan} from '../CoverFan';

function renderWithRouter(ui: React.ReactElement) {
  const Stub = createRoutesStub([{path: '/', Component: () => ui}]);
  return render(<Stub initialEntries={['/']} />);
}

describe('CoverFan', () => {
  it('rend jusqu’à 3 couvertures', () => {
    const covers = [1, 2, 3, 4, 5].map((n) => ({url: `u${n}`, altText: `A${n}`}));
    const {container} = render(<CoverFan covers={covers} />);
    expect(container.querySelectorAll('img')).toHaveLength(3);
  });
  it('rend ce qui est dispo si moins de 3', () => {
    const {container} = render(<CoverFan covers={[{url: 'u', altText: 'a'}]} />);
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(container.querySelector('.uni-fan--1')).not.toBeNull();
  });
  it('ne rend rien si vide', () => {
    const {container} = render(<CoverFan covers={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('rend un lien vers la fiche quand la couverture porte un href', () => {
    const {container} = renderWithRouter(
      <CoverFan covers={[{url: 'u', altText: 'Berserker', href: '/products/berserker'}]} />,
    );
    const link = container.querySelector('a.uni-fan-cover--link');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('/products/berserker');
    expect(container.querySelector('.uni-fan-cta')?.textContent).toBe('Découvrir ce livre');
  });

  it('reste une image décorative (aria-hidden) sans href', () => {
    const {container} = render(<CoverFan covers={[{url: 'u', altText: 'a'}]} />);
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('.uni-fan')?.getAttribute('aria-hidden')).toBe('true');
  });
});
