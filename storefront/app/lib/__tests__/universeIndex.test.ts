import {describe, it, expect} from 'vitest';
import {buildUniverseIndex, type IndexCollection} from '../universeIndex';

const coll = (
  over: Partial<IndexCollection> & {handle: string; title: string},
): IndexCollection => ({
  couleurTheme: null,
  genre: null,
  lore: null,
  sagas: {references: {nodes: []}},
  products: {nodes: []},
  ...over,
});

describe('buildUniverseIndex', () => {
  it('exclut les collections techniques et vides', () => {
    const cards = buildUniverseIndex(
      [
        coll({handle: 'all', title: 'All', products: {nodes: [{id: '1'}]}}),
        coll({handle: 'goodies', title: 'Goodies', products: {nodes: [{id: '1'}]}}),
        coll({handle: 'vide', title: 'Vide'}),
        coll({handle: 'andd', title: 'Au Nom des Dieux', products: {nodes: [{id: '1'}, {id: '2'}]}}),
      ],
      ['all', 'goodies', 'a-paraitre'],
    );
    expect(cards.map((c) => c.handle)).toEqual(['andd']);
  });

  it('mappe couleur, genre, citation et stats', () => {
    const cards = buildUniverseIndex(
      [
        coll({
          handle: 'andd',
          title: 'Au Nom des Dieux',
          couleurTheme: {value: '#2f8a78'},
          genre: {value: 'Fantastique · Mythologie'},
          lore: {value: '« Et si les légendes ? »\n\nUn long paragraphe.'},
          sagas: {references: {nodes: [{id: 's1'}, {id: 's2'}]}},
          products: {nodes: [{id: '1'}, {id: '2'}, {id: '3'}]},
        }),
      ],
      [],
    );
    const c = cards[0];
    expect(c.accent).toBe('#2f8a78');
    expect(c.genre).toBe('Fantastique · Mythologie');
    expect(c.citation).toBe('« Et si les légendes ? »');
    expect(c.stats).toBe('2 sagas · 3 tomes');
    expect(c.href).toBe('/collections/andd');
  });

  it('stats sans saga : seulement les tomes', () => {
    const cards = buildUniverseIndex(
      [coll({handle: 'x', title: 'X', products: {nodes: [{id: '1'}]}})],
      [],
    );
    expect(cards[0].stats).toBe('1 tome');
    expect(cards[0].citation).toBeNull();
  });
});
