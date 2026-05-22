import {describe, it, expect} from 'vitest';
import {HOME_UNIVERSE_FRAGMENT} from '../fragments';

describe('HOME_UNIVERSE_FRAGMENT', () => {
  it('inclut lore, couleur_theme, illustration_hero et les couvertures de tomes', () => {
    expect(HOME_UNIVERSE_FRAGMENT).toContain('fragment HomeUniverse on Collection');
    expect(HOME_UNIVERSE_FRAGMENT).toContain('key: "lore"');
    expect(HOME_UNIVERSE_FRAGMENT).toContain('key: "couleur_theme"');
    expect(HOME_UNIVERSE_FRAGMENT).toContain('key: "illustration_hero"');
    expect(HOME_UNIVERSE_FRAGMENT).toContain('key: "est_une_oeuvre_independante"');
    expect(HOME_UNIVERSE_FRAGMENT).toMatch(/products\(first:\s*\d+/);
    expect(HOME_UNIVERSE_FRAGMENT).toContain('featuredImage');
    expect(HOME_UNIVERSE_FRAGMENT).toContain('key: "numero_tome"');
  });
});
