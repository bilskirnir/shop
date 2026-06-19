import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const src = readFileSync(
  resolve(process.cwd(), 'app/routes/_index.tsx'),
  'utf8',
);

describe('_index (home slider)', () => {
  it('utilise HOME_SAGA_FRAGMENT et récupère les œuvres indépendantes', () => {
    expect(src).toContain('HOME_SAGA_FRAGMENT');
    expect(src).toContain('...HomeSaga');
    expect(src).toContain('TileProduct');
  });
  it('construit les screens et rend le SagaScroller', () => {
    expect(src).toContain('buildHomeScreens');
    expect(src).toContain('<SagaScroller');
  });
  it('déclare la route comme immersive', () => {
    expect(src).toMatch(/export const handle\s*=\s*\{[^}]*immersive:\s*true/s);
  });
});
