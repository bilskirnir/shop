import {describe, it, expect} from 'vitest';
import {pickFanCovers, type FanProduct} from '../universeFan';

const prod = (over: Partial<FanProduct>): FanProduct => ({
  title: 'T',
  featuredImage: {url: 'u', altText: null},
  dateParution: null,
  ...over,
});

describe('pickFanCovers', () => {
  it('trie par date de parution décroissante, sans date en dernier', () => {
    const covers = pickFanCovers([
      prod({title: 'A', featuredImage: {url: 'a', altText: null}, dateParution: {value: '2025-01-01'}}),
      prod({title: 'B', featuredImage: {url: 'b', altText: null}, dateParution: {value: '2026-06-01'}}),
      prod({title: 'C', featuredImage: {url: 'c', altText: null}, dateParution: null}),
    ]);
    expect(covers.map((c) => c.url)).toEqual(['b', 'a', 'c']);
  });

  it('plafonne à 3 et ignore les produits sans couverture', () => {
    const covers = pickFanCovers([
      prod({featuredImage: null, dateParution: {value: '2026-01-01'}}),
      prod({featuredImage: {url: '1', altText: null}, dateParution: {value: '2025-05-01'}}),
      prod({featuredImage: {url: '2', altText: null}, dateParution: {value: '2025-04-01'}}),
      prod({featuredImage: {url: '3', altText: null}, dateParution: {value: '2025-03-01'}}),
      prod({featuredImage: {url: '4', altText: null}, dateParution: {value: '2025-02-01'}}),
    ]);
    expect(covers).toHaveLength(3);
    expect(covers.map((c) => c.url)).toEqual(['1', '2', '3']);
  });

  it('utilise le titre comme alt par défaut', () => {
    const covers = pickFanCovers([
      prod({title: 'Le Réveil', featuredImage: {url: 'x', altText: null}}),
    ]);
    expect(covers[0].altText).toBe('Le Réveil');
  });
});
