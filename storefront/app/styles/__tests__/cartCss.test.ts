import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const css = readFileSync(resolve(process.cwd(), 'app/styles/cart.css'), 'utf8');

describe('cart.css', () => {
  it('définit la barre de récompenses épurée (piste + remplissage + %)', () => {
    expect(css).toContain('.bsk-rw-track');
    expect(css).toContain('.bsk-rw-fill');
    expect(css).toContain('.bsk-rw-pct');
  });
  it('définit la ligne panier et le pied', () => {
    expect(css).toContain('.bsk-cart-line');
    expect(css).toContain('.bsk-cart-foot');
  });
  it('définit le conteneur du tiroir (overlay + panneau coulissant)', () => {
    expect(css).toContain('.overlay');
    expect(css).toContain('.overlay.expanded');
    expect(css).toContain('.close-outside');
    expect(css).toMatch(/translateX\(100%\)/);
  });
});
