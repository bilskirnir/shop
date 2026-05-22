import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const css = readFileSync(resolve(process.cwd(), 'app/styles/maison.css'), 'utf8');

describe('maison.css', () => {
  it('hero avec glow doré et cascade', () => {
    expect(css).toContain('.maison-hero');
    expect(css).toMatch(/@keyframes\s+maison-rise/);
  });
  it('grille de piliers', () => {
    expect(css).toContain('.maison-pillars');
  });
  it('reduced-motion', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });
});
