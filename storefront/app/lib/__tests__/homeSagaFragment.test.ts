import {describe, it, expect} from 'vitest';
import {HOME_SAGA_FRAGMENT} from '../fragments';

describe('HOME_SAGA_FRAGMENT', () => {
  it('cible le metaobject saga et résout tomes + univers + hero', () => {
    expect(HOME_SAGA_FRAGMENT).toContain('fragment HomeSaga on Metaobject');
    expect(HOME_SAGA_FRAGMENT).toContain('references(first: 8)');
    expect(HOME_SAGA_FRAGMENT).toContain('... on Product');
    expect(HOME_SAGA_FRAGMENT).toContain('... on Collection');
    expect(HOME_SAGA_FRAGMENT).toContain('key: "couleur_theme"');
    expect(HOME_SAGA_FRAGMENT).toContain('key: "illustration_hero"');
    expect(HOME_SAGA_FRAGMENT).toContain('... on MediaImage');
    expect(HOME_SAGA_FRAGMENT).toContain('featuredImage { url altText }');
  });
});
