import {describe, it, expect} from 'vitest';
import {universeAccentStyle, resolveAccentColor} from '../universeAccent';

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

describe('resolveAccentColor', () => {
  it('priorise la couleur de saga', () => {
    expect(resolveAccentColor('#2fb6c4', '#e0533f')).toBe('#2fb6c4');
  });
  it("retombe sur la couleur d'univers si pas de saga", () => {
    expect(resolveAccentColor(null, '#e0533f')).toBe('#e0533f');
  });
  it('ignore une couleur invalide et descend dans la cascade', () => {
    expect(resolveAccentColor('rouge', '#e0533f')).toBe('#e0533f');
    expect(resolveAccentColor('rouge', 'aussi-invalide')).toBeNull();
  });
  it('retourne null si rien (= neutre crème)', () => {
    expect(resolveAccentColor(null, null)).toBeNull();
  });
});
