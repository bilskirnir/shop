import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const css = readFileSync(resolve(process.cwd(), 'app/styles/home.css'), 'utf8');

describe('home.css', () => {
  it('définit la piste et la translation par slide', () => {
    expect(css).toContain('.hs-track');
    expect(css).toContain('.hs-slide');
  });
  it("utilise l'accent univers pour la teinte", () => {
    expect(css).toContain('var(--bsk-uni-soft)');
  });
  it('porte les animations clés', () => {
    expect(css).toMatch(/@keyframes\s+bsk-rise/);
    expect(css).toMatch(/@keyframes\s+bsk-float/);
    expect(css).toMatch(/@keyframes\s+bsk-fill/);
  });
  it('neutralise les animations en reduced-motion', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });
  it('a un layout desktop en media query', () => {
    expect(css).toMatch(/@media\s*\(min-width/);
  });
});
