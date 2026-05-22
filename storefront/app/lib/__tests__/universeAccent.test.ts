import {describe, it, expect} from 'vitest';
import {universeAccentStyle} from '../universeAccent';

describe('universeAccentStyle', () => {
  it('retourne les vars pour un hex valide', () => {
    const s = universeAccentStyle('#2f8a78') as Record<string, string>;
    expect(s['--bsk-uni']).toBe('#2f8a78');
    expect(s['--bsk-uni-soft']).toBe('rgba(47,138,120,0.16)');
  });
  it('retourne un objet vide (défaut neutre) si absent ou invalide', () => {
    expect(universeAccentStyle(null)).toEqual({});
    expect(universeAccentStyle(undefined)).toEqual({});
    expect(universeAccentStyle('pas-une-couleur')).toEqual({});
  });
});
