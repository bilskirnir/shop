import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

// tests run from the storefront/ directory (cwd)
const src = readFileSync(
  resolve(process.cwd(), 'app/routes/products.$handle.tsx'),
  'utf8',
);

describe('PRODUCT_FRAGMENT', () => {
  it('récupère options + valeurs (requis par getProductOptions)', () => {
    expect(src).toMatch(/options\s*\{[^}]*name[^}]*optionValues\s*\{[^}]*name/s);
  });
  it('récupère les champs encodés de variantes', () => {
    expect(src).toContain('encodedVariantExistence');
    expect(src).toContain('encodedVariantAvailability');
  });
});
