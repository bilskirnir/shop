import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const src = readFileSync(resolve(process.cwd(), 'app/routes/collections.all.tsx'), 'utf8');

describe('collections.all (catalogue)', () => {
  it('utilise buildCatalogue + todaySeed et les fragments produits/univers', () => {
    expect(src).toContain('buildCatalogue');
    expect(src).toContain('todaySeed');
    expect(src).toContain('...TileProduct');
    expect(src).toContain('UNIVERSE_RAIL_FRAGMENT');
  });
  it('rend CatalogueSection + importe catalogue.css', () => {
    expect(src).toContain('CatalogueSection');
    expect(src).toContain("'~/styles/catalogue.css'");
  });
});
