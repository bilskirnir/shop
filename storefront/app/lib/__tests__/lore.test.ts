import {describe, it, expect} from 'vitest';
import {splitLore} from '../lore';

describe('splitLore', () => {
  it('1er paragraphe = citation, reste = body', () => {
    expect(splitLore('Une question ?\n\nUn monde.\n\nDes héros.')).toEqual({
      quote: 'Une question ?',
      body: 'Un monde.\n\nDes héros.',
    });
  });
  it('un seul paragraphe : pas de citation, tout en body', () => {
    expect(splitLore('Un seul bloc de texte.')).toEqual({
      quote: null,
      body: 'Un seul bloc de texte.',
    });
  });
  it('vide : quote null, body vide', () => {
    expect(splitLore('')).toEqual({quote: null, body: ''});
    expect(splitLore('   ')).toEqual({quote: null, body: ''});
  });
});
