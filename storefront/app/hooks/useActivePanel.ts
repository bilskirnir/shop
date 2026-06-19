import {useCallback, useEffect, useRef, useState} from 'react';

export function useActivePanel(count: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-panel]'));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.5) {
            const i = panels.indexOf(e.target as HTMLElement);
            if (i >= 0) setActiveIndex(i);
          }
        }
      },
      {root, threshold: [0.5, 0.9]},
    );
    panels.forEach((p) => io.observe(p));
    return () => io.disconnect();
  }, [count]);

  const jumpTo = useCallback((i: number) => {
    const panels = containerRef.current?.querySelectorAll<HTMLElement>('[data-panel]');
    panels?.[i]?.scrollIntoView({behavior: 'smooth'});
  }, []);

  return {activeIndex, containerRef, jumpTo};
}
