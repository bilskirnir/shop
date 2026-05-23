import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const css = readFileSync(resolve(process.cwd(), 'app/styles/fiche.css'), 'utf8');

describe('fiche.css', () => {
  it("définit le hero, la couverture flottante et le halo d'univers", () => {
    expect(css).toContain('.fiche-hero');
    expect(css).toContain('.fiche-cover');
    expect(css).toContain('var(--bsk-uni-soft)');
  });
  it('porte le flottement et la cascade', () => {
    expect(css).toMatch(/@keyframes\s+fiche-float/);
    expect(css).toMatch(/@keyframes\s+fiche-rise/);
  });
  it('a une classe toast', () => {
    expect(css).toContain('.fiche-toast');
  });
  it('neutralise les animations en reduced-motion', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });
  it('couche desktop : hero en grille 2 colonnes + bandeau univers', () => {
    expect(css).toMatch(/@media\s*\(min-width:\s*860px\)/);
    expect(css).toContain('.fiche-hero-inner');
    expect(css).toContain('.fiche-buy');
    expect(css).toContain('.fiche-univ-band');
  });
});
