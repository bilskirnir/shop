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
});
