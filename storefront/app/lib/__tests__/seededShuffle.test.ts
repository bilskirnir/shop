import {describe, it, expect} from 'vitest';
import {seededShuffle, todaySeed} from '../seededShuffle';

describe('seededShuffle', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8];

  it('déterministe : même graine → même ordre', () => {
    expect(seededShuffle(items, 42)).toEqual(seededShuffle(items, 42));
  });
  it('conserve exactement les mêmes éléments', () => {
    expect([...seededShuffle(items, 7)].sort((a, b) => a - b)).toEqual(items);
  });
  it('graines différentes → ordres (généralement) différents', () => {
    expect(seededShuffle(items, 1)).not.toEqual(seededShuffle(items, 2));
  });
  it('ne mute pas le tableau source', () => {
    const src = [1, 2, 3];
    seededShuffle(src, 5);
    expect(src).toEqual([1, 2, 3]);
  });
  it('gère 0 et 1 élément', () => {
    expect(seededShuffle([], 1)).toEqual([]);
    expect(seededShuffle(['x'], 1)).toEqual(['x']);
  });
});

describe('todaySeed', () => {
  it('même jour → même graine, jour suivant → graine différente', () => {
    const day = 1_700_000_000_000;
    expect(todaySeed(day)).toBe(todaySeed(day + 1000));
    expect(todaySeed(day)).not.toBe(todaySeed(day + 86_400_000));
  });
});
