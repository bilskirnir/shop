import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const src = readFileSync(resolve(process.cwd(), 'app/routes/collections.$handle.tsx'), 'utf8');

describe('collections.$handle (page univers)', () => {
  it("porte l'accent d'univers et importe univers.css", () => {
    expect(src).toContain('universeAccentStyle');
    expect(src).toContain("'~/styles/univers.css'");
  });
  it('utilise splitLore, UniverseRail et la query otherUniverses', () => {
    expect(src).toContain('splitLore');
    expect(src).toContain('UniverseRail');
    expect(src).toContain('otherUniverses');
    expect(src).toContain('UNIVERSE_RAIL_FRAGMENT');
  });
  it('sépare les sagas par un Ornament', () => {
    expect(src).toContain('<Ornament');
  });
});
