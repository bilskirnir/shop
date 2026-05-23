import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const css = readFileSync(resolve(process.cwd(), 'app/styles/catalogue.css'), 'utf8');

describe('catalogue.css', () => {
  it('grille 2 colonnes mobile, 4 desktop', () => {
    expect(css).toContain('.cat-grid');
    expect(css).toMatch(/grid-template-columns:\s*repeat\(2/);
    expect(css).toMatch(/@media\s*\(min-width/);
    expect(css).toMatch(/repeat\(4/);
  });
  it("halo de couleur d'univers", () => {
    expect(css).toContain('.cat-halo');
  });
  it('couverture à hauteur fixe en object-fit cover + hover', () => {
    expect(css).toContain('.tome-card-cover-box');
    expect(css).toMatch(/object-fit:\s*cover/);
    expect(css).toContain('.tome-card:hover');
    expect(css).toContain('--tome-cover-h');
  });
});
