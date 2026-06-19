import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {ProgressDots} from '../ProgressDots';

describe('ProgressDots', () => {
  it('rend une puce par item et marque l\'active', () => {
    render(<ProgressDots count={3} activeIndex={1} />);
    const dots = screen.getAllByRole('button');
    expect(dots).toHaveLength(3);
    expect(dots[1]).toHaveAttribute('aria-current', 'true');
    expect(dots[0]).toHaveAttribute('aria-current', 'false');
    expect(dots[2]).toHaveAttribute('aria-current', 'false');
  });

  it('appelle onJump avec l\'index au clic', () => {
    const onJump = vi.fn();
    render(<ProgressDots count={3} activeIndex={0} onJump={onJump} />);
    fireEvent.click(screen.getAllByRole('button')[2]);
    expect(onJump).toHaveBeenCalledWith(2);
  });
});
