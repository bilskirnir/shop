import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const src = readFileSync(resolve(process.cwd(), 'app/routes/policies._index.tsx'), 'utf8');

describe('policies._index', () => {
  it('importe legal.css et stylise la liste (classe legal-toc / legal-head)', () => {
    expect(src).toContain("'~/styles/legal.css'");
    expect(src).toContain('legal-toc');
  });
});
