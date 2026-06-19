import {useCallback, useEffect, useRef, useState} from 'react';
import {SagaPanel} from '~/components/SagaPanel';
import {ProgressDots} from '~/components/ProgressDots';
import {Footer} from '~/components/Footer';
import type {HomeScreen} from '~/lib/homeScreens';
import '~/styles/home.css';

const TRANSITION_MS = 1000;

/**
 * Accueil « fullpage » : une section plein écran à la fois. La molette / les
 * flèches / le swipe changent de section, et toute la piste glisse verticalement
 * en douceur (la section courante part vers le haut, la suivante arrive). Pas de
 * scroll natif → rythme maîtrisé. Le footer est la dernière section.
 */
export function SagaScroller({screens}: {screens: HomeScreen[]}) {
  const total = screens.length + 1; // + footer final
  const [index, setIndex] = useState(0);
  const locked = useRef(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const move = useCallback(
    (target: number) => {
      if (locked.current) return;
      setIndex((cur) => {
        const next = Math.max(0, Math.min(total - 1, target));
        if (next === cur) return cur;
        locked.current = true;
        window.setTimeout(() => {
          locked.current = false;
        }, TRANSITION_MS);
        return next;
      });
    },
    [total],
  );

  // Curseur d'index courant pour les handlers (évite les closures périmées).
  const indexRef = useRef(0);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 6) return;
      move(indexRef.current + (e.deltaY > 0 ? 1 : -1));
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        move(indexRef.current + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        move(indexRef.current - 1);
      } else if (e.key === 'Home') {
        move(0);
      } else if (e.key === 'End') {
        move(total - 1);
      }
    };
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = touchY - (e.changedTouches[0]?.clientY ?? 0);
      if (Math.abs(dy) > 45) move(indexRef.current + (dy > 0 ? 1 : -1));
    };

    el.addEventListener('wheel', onWheel, {passive: false});
    el.addEventListener('touchstart', onTouchStart, {passive: true});
    el.addEventListener('touchend', onTouchEnd, {passive: true});
    window.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
    };
  }, [move, total]);

  return (
    <div className="bsk-scroller" ref={scrollerRef}>
      <div className="bsk-track" style={{transform: `translateY(${-index * 100}dvh)`}}>
        {screens.map((s, i) => (
          <div className="bsk-track-panel" data-panel key={s.key}>
            <SagaPanel
              screen={s}
              index={i}
              state={i < index ? 'above' : i === index ? 'active' : 'below'}
            />
          </div>
        ))}
        <div
          className={`bsk-track-panel bsk-track-panel--footer is-${
            index === screens.length ? 'active' : 'below'
          }`}
          data-panel
        >
          <Footer asPanel />
        </div>
      </div>
      <nav className="bsk-scroller-dots" aria-label="Navigation des sagas">
        <ProgressDots count={total} activeIndex={index} onJump={move} />
      </nav>
    </div>
  );
}
