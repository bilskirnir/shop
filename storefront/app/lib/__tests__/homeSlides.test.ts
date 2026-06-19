import {describe, it, expect} from 'vitest';
import {buildHomeSlides, type SlideUniverse, type SlideWork} from '../homeSlides';

const cover = (n: number) => ({
  url: `https://x/t${n}.webp`,
  altText: `Tome ${n}`,
  width: 800,
  height: 1170,
});

const universe: SlideUniverse = {
  id: 'gid://c/1',
  handle: 'au-nom-des-dieux',
  title: 'Au Nom des Dieux',
  estUneOeuvreIndependante: {value: 'false'},
  lore: {value: '« Et si les légendes antiques étaient vraies ? »'},
  couleurTheme: {value: '#2f8a78'},
  illustrationHero: null,
  products: {
    nodes: [
      {featuredImage: cover(2), numeroTome: {value: '2'}, statutParution: {value: 'publié'}},
      {featuredImage: cover(1), numeroTome: {value: '1'}, statutParution: {value: 'publié'}},
      {featuredImage: cover(3), numeroTome: {value: '3'}, statutParution: {value: 'publié'}},
      {featuredImage: cover(4), numeroTome: {value: '4'}, statutParution: {value: 'publié'}},
    ],
  },
};

const work: SlideWork = {
  id: 'gid://p/9',
  handle: 'berserker',
  title: 'Berserker',
  estUneOeuvreIndependante: {value: 'true'},
  featuredImage: cover(9),
  teaserCourt: {value: '« La rage, et la neige. »'},
  statutParution: {value: 'publié'},
  dateParution: null,
};

describe('buildHomeSlides', () => {
  it('produit un slide univers avec couvertures triées par n° de tome (max 3) et débord stack', () => {
    const slides = buildHomeSlides([universe], []);
    expect(slides).toHaveLength(1);
    const s = slides[0];
    expect(s.title).toBe('Au Nom des Dieux');
    expect(s.kicker).toBe('4 tomes');
    expect(s.lore).toBe('« Et si les légendes antiques étaient vraies ? »');
    expect(s.accent).toBe('#2f8a78');
    expect(s.covers.map((c) => c.altText)).toEqual(['Tome 1', 'Tome 2', 'Tome 3']);
    expect(s.primary.href).toBe('/collections/au-nom-des-dieux');
  });

  it('convertit un lore rich-text Shopify en texte simple', () => {
    const richText = JSON.stringify({
      type: 'root',
      children: [
        {type: 'paragraph', children: [{type: 'text', value: 'Quand les dieux se sont tus.'}]},
      ],
    });
    const u: SlideUniverse = {...universe, lore: {value: richText}};
    expect(buildHomeSlides([u], [])[0].lore).toBe('Quand les dieux se sont tus.');
  });

  it('exclut un univers sans couverture', () => {
    const empty: SlideUniverse = {...universe, products: {nodes: []}};
    expect(buildHomeSlides([empty], [])).toHaveLength(0);
  });

  it('exclut une collection marquée œuvre indépendante', () => {
    const standalone: SlideUniverse = {
      ...universe,
      estUneOeuvreIndependante: {value: 'true'},
    };
    expect(buildHomeSlides([standalone], [])).toHaveLength(0);
  });

  it('produit un slide œuvre (1 couverture, pill constante, teaser en lore)', () => {
    const slides = buildHomeSlides([], [work]);
    expect(slides).toHaveLength(1);
    const s = slides[0];
    expect(s.kicker).toBe('Roman indépendant');
    expect(s.covers).toHaveLength(1);
    expect(s.lore).toBe('« La rage, et la neige. »');
    expect(s.accent).toBeNull();
    expect(s.primary).toEqual({label: 'Découvrir le livre', href: '/products/berserker'});
  });

  it('CTA précommande pour une œuvre en précommande', () => {
    const preorder: SlideWork = {...work, statutParution: {value: 'précommande'}};
    expect(buildHomeSlides([], [preorder])[0].primary.label).toBe('Précommander');
  });

  it('ignore une œuvre indépendante sans image et un produit de saga (non indépendant)', () => {
    const noImg: SlideWork = {...work, featuredImage: null};
    const sagaProduct: SlideWork = {...work, estUneOeuvreIndependante: {value: 'false'}};
    expect(buildHomeSlides([], [noImg, sagaProduct])).toHaveLength(0);
  });

  it('ordonne univers avant œuvres indépendantes', () => {
    const slides = buildHomeSlides([universe], [work]);
    expect(slides.map((s) => s.title)).toEqual(['Au Nom des Dieux', 'Berserker']);
  });
});
