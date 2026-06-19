import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, act} from '@testing-library/react';
import {useActivePanel} from '../useActivePanel';

let lastCb: ((entries: any[]) => void) | null = null;
beforeEach(() => {
  lastCb = null;
  (globalThis as any).IntersectionObserver = class {
    constructor(cb: any) { lastCb = cb; }
    observe() {} unobserve() {} disconnect() {}
  };
});

function Harness() {
  const {activeIndex, containerRef, jumpTo} = useActivePanel(3);
  return (
    <div ref={containerRef} data-active={activeIndex}>
      <div data-panel /><div data-panel /><div data-panel />
      <button onClick={() => jumpTo(2)}>jump</button>
    </div>
  );
}

describe('useActivePanel', () => {
  it('met à jour activeIndex quand un panneau devient visible', () => {
    const {container} = render(<Harness />);
    const panels = container.querySelectorAll('[data-panel]');
    act(() => {
      lastCb?.([{isIntersecting: true, intersectionRatio: 0.9, target: panels[1]}]);
    });
    expect(container.firstElementChild?.getAttribute('data-active')).toBe('1');
  });

  it('jumpTo fait défiler le panneau ciblé', () => {
    const spy = vi.fn();
    const {getByText, container} = render(<Harness />);
    (container.querySelectorAll('[data-panel]')[2] as HTMLElement).scrollIntoView = spy;
    act(() => { getByText('jump').click(); });
    expect(spy).toHaveBeenCalled();
  });
});
