import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const css = readFileSync(resolve(process.cwd(), 'app/styles/legal.css'), 'utf8');

describe('legal.css', () => {
  it('numérote les h2 via compteur CSS', () => {
    expect(css).toContain('counter-reset');
    expect(css).toMatch(/counter-increment:\s*legal-art/);
    expect(css).toContain('counter(legal-art');
  });
  it('puces ✦ sur les li', () => {
    expect(css).toContain('.legal-body li::before');
    expect(css).toContain('"✦"');
  });
  it('classe en-tête', () => {
    expect(css).toContain('.legal-head');
  });
});
