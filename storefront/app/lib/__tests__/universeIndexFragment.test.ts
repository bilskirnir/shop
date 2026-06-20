import {describe, it, expect} from 'vitest';
import {UNIVERSE_INDEX_FRAGMENT} from '../fragments';

describe('UNIVERSE_INDEX_FRAGMENT', () => {
  it('récupère couleur, genre, lore, sagas, produits', () => {
    expect(UNIVERSE_INDEX_FRAGMENT).toContain('fragment UniverseIndexCard on Collection');
    expect(UNIVERSE_INDEX_FRAGMENT).toContain('key: "couleur"');
    expect(UNIVERSE_INDEX_FRAGMENT).toContain('key: "genre"');
    expect(UNIVERSE_INDEX_FRAGMENT).toContain('key: "lore"');
    expect(UNIVERSE_INDEX_FRAGMENT).toContain('key: "sagas"');
    expect(UNIVERSE_INDEX_FRAGMENT).toMatch(/products\(first:/);
  });
});
