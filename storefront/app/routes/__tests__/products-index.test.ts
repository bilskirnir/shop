import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const src = readFileSync(resolve(process.cwd(), 'app/routes/products._index.tsx'), 'utf8');

describe('products._index', () => {
  it('redirige vers /collections/all', () => {
    expect(src).toContain('redirect');
    expect(src).toContain('/collections/all');
  });
});
