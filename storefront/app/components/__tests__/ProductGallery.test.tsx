import {describe, it, expect} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {ProductGallery} from '../ProductGallery';

const imgs = [
  {url: 'https://x/a.webp', altText: 'A', width: 400, height: 600},
  {url: 'https://x/b.webp', altText: 'B', width: 400, height: 600},
];

describe('ProductGallery', () => {
  it('affiche la couverture principale (1ère image)', () => {
    render(<ProductGallery images={imgs} alt="Le Sang Versé" />);
    const main = screen.getByAltText('Le Sang Versé') as HTMLImageElement;
    expect(main.src).toContain('a.webp');
  });
  it('cliquer une vignette change la couverture principale', () => {
    render(<ProductGallery images={imgs} alt="Le Sang Versé" />);
    fireEvent.click(screen.getByRole('button', {name: /image 2/i}));
    const main = screen.getByAltText('Le Sang Versé') as HTMLImageElement;
    expect(main.src).toContain('b.webp');
  });
  it('une seule image : pas de vignettes', () => {
    render(<ProductGallery images={[imgs[0]]} alt="X" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
  it('aucune image : ne rend rien', () => {
    const {container} = render(<ProductGallery images={[]} alt="X" />);
    expect(container.firstChild).toBeNull();
  });
});
