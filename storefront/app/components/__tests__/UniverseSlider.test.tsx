import {describe, it, expect} from 'vitest';
import {screen, fireEvent} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {UniverseSlider} from '../UniverseSlider';
import type {HomeSlide} from '~/lib/homeSlides';

const slides: HomeSlide[] = [
  {
    key: 'u1',
    kicker: '4 tomes',
    title: 'Au Nom des Dieux',
    lore: '« légendes »',
    accent: '#2f8a78',
    heroImage: null,
    covers: [
      {url: 'https://x/1.webp', altText: 'Tome 1', width: 800, height: 1170},
      {url: 'https://x/2.webp', altText: 'Tome 2', width: 800, height: 1170},
    ],
    primary: {label: "Explorer l'univers", href: '/collections/au-nom-des-dieux'},
    secondary: {label: 'Voir les tomes', href: '/collections/au-nom-des-dieux'},
  },
  {
    key: 'w1',
    kicker: 'Roman indépendant',
    title: 'Berserker',
    lore: '« neige »',
    accent: null,
    heroImage: null,
    covers: [{url: 'https://x/9.webp', altText: 'Berserker', width: 800, height: 1170}],
    primary: {label: 'Découvrir le livre', href: '/products/berserker'},
    secondary: null,
  },
];

describe('UniverseSlider', () => {
  it('rend tous les slides avec leurs titres et CTAs', () => {
    const {container} = renderWithRouter(<UniverseSlider slides={slides} />);
    const titles = [...container.querySelectorAll('.hs-title')].map(
      (el) => el.textContent,
    );
    expect(titles).toEqual(['Au Nom des Dieux', 'Berserker']);
    expect(screen.getByRole('link', {name: "Explorer l'univers"})).toHaveAttribute(
      'href',
      '/collections/au-nom-des-dieux',
    );
  });

  it('le premier slide est actif par défaut', () => {
    const {container} = renderWithRouter(<UniverseSlider slides={slides} />);
    const active = container.querySelectorAll('.hs-slide.is-active');
    expect(active).toHaveLength(1);
    expect(active[0]).toHaveTextContent('Au Nom des Dieux');
  });

  it('un clic sur un point change le slide actif', () => {
    const {container} = renderWithRouter(<UniverseSlider slides={slides} />);
    const dots = container.querySelectorAll('.hs-dot');
    expect(dots).toHaveLength(2);
    fireEvent.click(dots[1]);
    const active = container.querySelector('.hs-slide.is-active');
    expect(active).toHaveTextContent('Berserker');
  });

  it("applique l'accent univers en CSS var sur le slide", () => {
    const {container} = renderWithRouter(<UniverseSlider slides={slides} />);
    const first = container.querySelector('.hs-slide') as HTMLElement;
    expect(first.style.getPropertyValue('--bsk-uni')).toBe('#2f8a78');
  });

  it('le slide à plusieurs couvertures porte la classe stack', () => {
    const {container} = renderWithRouter(<UniverseSlider slides={slides} />);
    const first = container.querySelector('.hs-slide') as HTMLElement;
    expect(first.className).toContain('hs-stack');
  });

  it('dimensionne les couvertures par CSS (hauteur), sans largeur inline forcée (anti couvertures géantes)', () => {
    const {container} = renderWithRouter(<UniverseSlider slides={slides} />);
    const cov = container.querySelector('.hs-cov') as HTMLImageElement;
    expect(cov.tagName).toBe('IMG');
    // la taille est pilotée par home.css (.hs-cov height) — pas d'inline width:100%
    expect(cov.style.width).toBe('');
  });
});
