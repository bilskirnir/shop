import {describe, it, expect} from 'vitest';
import {computeNavState} from '../../hooks/useHideOnScroll';

describe('computeNavState', () => {
  it('top quand y < seuilTop', () => {
    expect(computeNavState({y: 0, lastY: 0})).toEqual({solid: false, hidden: false});
  });
  it('solide + caché au scroll bas', () => {
    expect(computeNavState({y: 200, lastY: 100})).toEqual({solid: true, hidden: true});
  });
  it('solide + visible au scroll haut', () => {
    expect(computeNavState({y: 150, lastY: 300})).toEqual({solid: true, hidden: false});
  });
});
