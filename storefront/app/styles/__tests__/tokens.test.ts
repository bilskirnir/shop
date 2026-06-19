import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const css = readFileSync(resolve(__dirname, '../tokens.css'), 'utf8');

describe('tokens encre', () => {
  it('définit la palette encre/crème', () => {
    expect(css).toContain('--bsk-ink: #0b0b0c');
    expect(css).toContain('--bsk-cream: #f2efe7');
  });
  it('bascule les familles vers Bricolage + Inter', () => {
    expect(css).toMatch(/--bsk-font-display:\s*"Bricolage Grotesque"/);
    expect(css).toMatch(/--bsk-font-sans:\s*"Inter"/);
  });
  it("garde --bsk-uni avec un défaut crème neutre", () => {
    expect(css).toMatch(/--bsk-uni:\s*var\(--bsk-cream\)/);
  });
});
