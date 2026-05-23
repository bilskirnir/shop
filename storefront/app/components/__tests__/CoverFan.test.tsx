import {describe, it, expect} from 'vitest';
import {render} from '@testing-library/react';
import {CoverFan} from '../CoverFan';

describe('CoverFan', () => {
  it('rend jusqu’à 3 couvertures', () => {
    const covers = [1, 2, 3, 4, 5].map((n) => ({url: `u${n}`, altText: `A${n}`}));
    const {container} = render(<CoverFan covers={covers} />);
    expect(container.querySelectorAll('img')).toHaveLength(3);
  });
  it('rend ce qui est dispo si moins de 3', () => {
    const {container} = render(<CoverFan covers={[{url: 'u', altText: 'a'}]} />);
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(container.querySelector('.uni-fan--1')).not.toBeNull();
  });
  it('ne rend rien si vide', () => {
    const {container} = render(<CoverFan covers={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
