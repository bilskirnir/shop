import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const css = readFileSync(resolve(process.cwd(), 'app/styles/univers.css'), 'utf8');

describe('univers.css', () => {
  it("définit le hero et la teinte d'univers", () => {
    expect(css).toContain('.uni-hero');
    expect(css).toContain('var(--bsk-uni-soft)');
  });
  it('porte la cascade et la brume', () => {
    expect(css).toMatch(/@keyframes\s+uni-rise/);
    expect(css).toMatch(/@keyframes\s+uni-drift/);
  });
  it('neutralise les animations en reduced-motion', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });
  it('couche desktop : grille tomes 4 colonnes + carte univers + éventail', () => {
    expect(css).toMatch(/@media\s*\(min-width:\s*860px\)/);
    expect(css).toContain('.saga-grid');
    expect(css).toContain('repeat(4');
    expect(css).toContain('.uni-card');
    expect(css).toContain('.uni-fan');
  });
});
