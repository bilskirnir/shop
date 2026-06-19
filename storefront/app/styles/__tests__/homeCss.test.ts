import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const css = readFileSync(resolve(process.cwd(), 'app/styles/home.css'), 'utf8');

describe('home.css', () => {
  it('définit le scroller et les panneaux avec scroll-snap', () => {
    expect(css).toContain('.bsk-scroller');
    expect(css).toContain('.bsk-scroller-panel');
    expect(css).toContain('scroll-snap-type:y mandatory');
  });
  it("utilise les tokens Refonte 2 (ink, cream, ease)", () => {
    expect(css).toContain('var(--bsk-ink)');
    expect(css).toContain('var(--bsk-cream)');
    expect(css).toContain('var(--bsk-ease)');
  });
  it('porte les animations clés', () => {
    expect(css).toMatch(/@keyframes\s+bsk-rise/);
  });
  it('neutralise les animations en reduced-motion', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });
  it('a un layout desktop en media query', () => {
    expect(css).toMatch(/@media\s*\(min-width/);
  });
});
