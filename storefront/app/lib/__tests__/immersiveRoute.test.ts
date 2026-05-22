import {describe, it, expect} from 'vitest';
import {isImmersiveRoute} from '../immersiveRoute';

describe('isImmersiveRoute', () => {
  it('true si une route active porte handle.immersive', () => {
    expect(
      isImmersiveRoute([
        {id: 'root', handle: undefined},
        {id: 'routes/_index', handle: {immersive: true}},
      ]),
    ).toBe(true);
  });
  it('false si aucune route immersive', () => {
    expect(
      isImmersiveRoute([
        {id: 'root', handle: undefined},
        {id: 'routes/collections.$handle', handle: {}},
      ]),
    ).toBe(false);
  });
  it('false sur une liste vide', () => {
    expect(isImmersiveRoute([])).toBe(false);
  });
});
