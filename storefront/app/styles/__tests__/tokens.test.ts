import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const css = readFileSync(resolve(process.cwd(), 'app/styles/tokens.css'), 'utf8');

describe('tokens.css — système refonte', () => {
  it('base anthracite grise', () => {
    expect(css).toContain('--bsk-bg-base: #131419');
  });
  it('police display Cabinet Grotesk', () => {
    expect(css).toMatch(/--bsk-font-display:\s*"Cabinet Grotesk"/);
  });
  it('police sans Switzer', () => {
    expect(css).toMatch(/--bsk-font-sans:\s*"Switzer"/);
  });
  it('variable accent univers avec défaut neutre (doré)', () => {
    expect(css).toMatch(/--bsk-uni:\s*var\(--bsk-accent-gold\)/);
  });
});
