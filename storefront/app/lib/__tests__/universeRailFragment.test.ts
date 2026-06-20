import {describe, it, expect} from 'vitest';
import {UNIVERSE_RAIL_FRAGMENT, UNIVERSE_DETAIL_FRAGMENT} from '../fragments';

describe('fragments univers', () => {
  it('UNIVERSE_RAIL_FRAGMENT : id/handle/title + couleur + flag indépendant', () => {
    expect(UNIVERSE_RAIL_FRAGMENT).toContain('fragment UniverseRailCard on Collection');
    expect(UNIVERSE_RAIL_FRAGMENT).toContain('key: "couleur"');
    expect(UNIVERSE_RAIL_FRAGMENT).toContain('key: "est_une_oeuvre_independante"');
  });
  it('UNIVERSE_DETAIL_FRAGMENT expose le genre (optionnel)', () => {
    expect(UNIVERSE_DETAIL_FRAGMENT).toContain('key: "genre"');
  });
});
