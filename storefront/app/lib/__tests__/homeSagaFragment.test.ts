import {describe, it, expect} from 'vitest';
import {HOME_SAGA_FRAGMENT} from '../fragments';

describe('HOME_SAGA_FRAGMENT', () => {
  it('cible la collection, ses sagas metaobjects et les couvertures', () => {
    expect(HOME_SAGA_FRAGMENT).toContain('fragment HomeSaga on Collection');
    expect(HOME_SAGA_FRAGMENT).toContain('key: "couleur_theme"');
    expect(HOME_SAGA_FRAGMENT).toContain('key: "sagas"');
    expect(HOME_SAGA_FRAGMENT).toContain('... on Metaobject');
    expect(HOME_SAGA_FRAGMENT).toContain('fields { key value');
    expect(HOME_SAGA_FRAGMENT).toContain('references(first: 6)');
    expect(HOME_SAGA_FRAGMENT).toContain('featuredImage { url altText }');
  });
});
