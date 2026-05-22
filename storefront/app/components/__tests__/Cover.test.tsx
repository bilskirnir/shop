import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Cover} from '../Cover';

const img = {url: 'https://x/c.webp', altText: 'Tome 1', width: 800, height: 1170};

describe('Cover', () => {
  it('rend une image avec drop-shadow et sans background', () => {
    render(<Cover image={img} />);
    const el = screen.getByAltText('Tome 1') as HTMLImageElement;
    expect(el.style.filter).toContain('var(--bsk-cover-shadow)');
    expect(el.style.background).toBe('');
  });
  it('ne rend rien si image absente', () => {
    const {container} = render(<Cover image={null} />);
    expect(container.firstChild).toBeNull();
  });
  it('applique le débord en variante bleed', () => {
    render(<Cover image={img} bleed />);
    const el = screen.getByAltText('Tome 1') as HTMLImageElement;
    expect(el.style.width).toBe('114%');
  });
});
