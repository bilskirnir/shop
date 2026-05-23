import {describe, it, expect} from 'vitest';
import {screen} from '@testing-library/react';
import {renderWithRouter} from '~/test/render';
import {RelatedRail, type RelatedItem} from '../RelatedRail';

const items: RelatedItem[] = [
  {
    handle: 'tome-2',
    title: 'Le Sel des Mers',
    cover: {url: 'https://x/2.webp', altText: 'Le Sel des Mers', width: 400, height: 600},
    priceLabel: '18,90 €',
  },
];

describe('RelatedRail', () => {
  it('rend le titre de section et un lien par item', () => {
    renderWithRouter(<RelatedRail heading="Dans le même univers" items={items} />);
    expect(screen.getByText('Dans le même univers')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Le Sel des Mers/})).toHaveAttribute(
      'href',
      '/products/tome-2',
    );
  });
  it('ne rend rien si vide', () => {
    const {container} = renderWithRouter(<RelatedRail heading="X" items={[]} />);
    expect(container.firstChild).toBeNull();
  });
  it('porte les classes ciblables (desktop)', () => {
    const {container} = renderWithRouter(<RelatedRail heading="X" items={items} />);
    expect(container.querySelector('.bsk-related-row')).not.toBeNull();
    expect(container.querySelector('.bsk-related-card')).not.toBeNull();
  });
});
