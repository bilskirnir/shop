import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const src = readFileSync(resolve(process.cwd(), 'app/routes/collections._index.tsx'), 'utf8');

describe('collections._index (Nos univers)', () => {
  it('utilise buildUniverseIndex + UniverseCard + le fragment + denylist', () => {
    expect(src).toContain('buildUniverseIndex');
    expect(src).toContain('UniverseCard');
    expect(src).toContain('UNIVERSE_INDEX_FRAGMENT');
    expect(src).toContain("'goodies'");
  });
  it('importe univers.css et titre « Nos univers »', () => {
    expect(src).toContain("'~/styles/univers.css'");
    expect(src).toContain('Nos univers');
  });
});
