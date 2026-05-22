import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {RewardsBar} from '../RewardsBar';

const config = {freeShippingThreshold: 49, giftTiers: [{threshold: 75, label: 'un marque-page'}]};

describe('RewardsBar', () => {
  it('affiche le message et les jalons', () => {
    const {container} = render(<RewardsBar subtotal={30} config={config} />);
    expect(container.querySelector('.bsk-rw-msg')?.textContent).toMatch(/livraison offerte/i);
    expect(container.querySelectorAll('.bsk-rw-milestone')).toHaveLength(2);
  });
  it('marque les jalons atteints', () => {
    const {container} = render(<RewardsBar subtotal={60} config={config} />);
    expect(container.querySelectorAll('.bsk-rw-milestone.is-reached')).toHaveLength(1);
  });
  it('largeur de remplissage proportionnelle', () => {
    const {container} = render(<RewardsBar subtotal={75} config={config} />);
    const fill = container.querySelector('.bsk-rw-fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });
});
