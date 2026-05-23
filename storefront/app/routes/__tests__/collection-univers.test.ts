import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const src = readFileSync(resolve(process.cwd(), 'app/routes/collections.$handle.tsx'), 'utf8');

describe('collections.$handle (page univers)', () => {
  it("porte l'accent d'univers et importe univers.css", () => {
    expect(src).toContain('universeAccentStyle');
    expect(src).toContain("'~/styles/univers.css'");
  });
  it('utilise pickFanCovers, UniverseRail et la query otherUniverses', () => {
    expect(src).toContain('pickFanCovers');
    expect(src).toContain('UniverseRail');
    expect(src).toContain('otherUniverses');
    expect(src).toContain('UNIVERSE_RAIL_FRAGMENT');
  });
  it('ne dépend plus de heroImage', () => {
    expect(src).not.toContain('heroImage');
  });
  it('sépare les sagas par un Ornament', () => {
    expect(src).toContain('<Ornament');
  });
});
