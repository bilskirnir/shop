import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {RewardsBar} from '../RewardsBar';

const config = {freeShippingThreshold: 49, giftTiers: []};

describe('RewardsBar', () => {
  it('affiche le message livraison + le pourcentage (barre épurée, sans pastilles)', () => {
    const {container} = render(<RewardsBar subtotal={36.75} config={config} />);
    expect(container.querySelector('.bsk-rw-msg')?.textContent).toMatch(/livraison offerte/i);
    expect(container.querySelectorAll('.bsk-rw-milestone')).toHaveLength(0);
    expect(container.querySelector('.bsk-rw-pct')?.textContent).toBe('75%');
  });
  it('atteint : remplissage 100% et coche', () => {
    const {container} = render(<RewardsBar subtotal={50} config={config} />);
    const fill = container.querySelector('.bsk-rw-fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
    expect(container.querySelector('.bsk-rw-pct')?.textContent).toBe('✓');
  });
});
