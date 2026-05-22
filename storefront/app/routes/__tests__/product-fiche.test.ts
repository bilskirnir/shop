import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const src = readFileSync(resolve(process.cwd(), 'app/routes/products.$handle.tsx'), 'utf8');

describe('products.$handle (fiche)', () => {
  it("importe fiche.css et porte l'accent", () => {
    expect(src).toContain("'~/styles/fiche.css'");
    expect(src).toContain('universeAccentStyle');
  });
  it('récupère images + métadonnées techniques + produits liés + storeDomain', () => {
    expect(src).toContain('images(first:');
    expect(src).toContain('key: "isbn"');
    expect(src).toContain('storeDomain');
    expect(src).toContain('RelatedRail');
  });
});
