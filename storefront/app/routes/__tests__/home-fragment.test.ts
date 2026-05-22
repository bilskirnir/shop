import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const src = readFileSync(
  resolve(process.cwd(), 'app/routes/_index.tsx'),
  'utf8',
);

describe('_index (home slider)', () => {
  it('utilise HOME_UNIVERSE_FRAGMENT et récupère les œuvres indépendantes', () => {
    expect(src).toContain('HOME_UNIVERSE_FRAGMENT');
    expect(src).toContain('...HomeUniverse');
    expect(src).toContain('TileProduct');
  });
  it('construit les slides et rend le slider', () => {
    expect(src).toContain('buildHomeSlides');
    expect(src).toContain('<UniverseSlider');
  });
  it('déclare la route comme immersive', () => {
    expect(src).toMatch(/export const handle\s*=\s*\{[^}]*immersive:\s*true/s);
  });
});
