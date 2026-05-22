import {describe, it, expect} from 'vitest';
import {dedicaceFromAttributes} from '../cartAttributes';

describe('dedicaceFromAttributes', () => {
  it('retourne le nom de dédicace', () => {
    expect(
      dedicaceFromAttributes([
        {key: '_dedicace_activee', value: 'true'},
        {key: 'Dédicace', value: 'Pour Marie'},
      ]),
    ).toBe('Pour Marie');
  });
  it('null si pas de dédicace', () => {
    expect(dedicaceFromAttributes([{key: 'autre', value: 'x'}])).toBeNull();
    expect(dedicaceFromAttributes(null)).toBeNull();
    expect(dedicaceFromAttributes([])).toBeNull();
  });
  it('ignore une valeur vide', () => {
    expect(dedicaceFromAttributes([{key: 'Dédicace', value: ''}])).toBeNull();
  });
});
