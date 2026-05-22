import {describe, it, expect} from 'vitest';
import {HEADER_QUERY} from '../fragments';

describe('Shop fragment — metafields récompenses', () => {
  it('récupère seuil livraison + paliers cadeaux', () => {
    expect(HEADER_QUERY).toContain('key: "seuil_livraison_offerte"');
    expect(HEADER_QUERY).toContain('key: "paliers_cadeaux"');
    expect(HEADER_QUERY).toContain('namespace: "cart"');
  });
});
