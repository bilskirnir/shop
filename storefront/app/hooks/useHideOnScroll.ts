import {useEffect, useState} from 'react';

export interface NavState {
  solid: boolean;
  hidden: boolean;
}

const TOP = 12;
const HIDE_AFTER = 90;
const DELTA = 4;

/** Logique pure (testable) : état de la nav selon la position de scroll. */
export function computeNavState({y, lastY}: {y: number; lastY: number}): NavState {
  if (y < TOP) return {solid: false, hidden: false};
  const scrollingDown = y > lastY + DELTA;
  const scrollingUp = y < lastY - DELTA;
  return {
    solid: true,
    hidden: scrollingDown && y > HIDE_AFTER ? true : scrollingUp ? false : false,
  };
}

/**
 * Nav transparente en haut ; se masque au scroll bas ; réapparaît (avec fond
 * solide) au scroll haut. `target` = élément scrollable (sinon window).
 */
export function useHideOnScroll(
  target?: HTMLElement | Window | null,
): NavState {
  const [state, setState] = useState<NavState>({solid: false, hidden: false});
  useEffect(() => {
    const el = target ?? (typeof window !== 'undefined' ? window : null);
    if (!el) return;
    let lastY = 0;
    let hidden = false;
    const getY = () =>
      el === window ? window.scrollY : (el as HTMLElement).scrollTop;
    const onScroll = () => {
      const y = getY();
      const next = computeNavState({y, lastY});
      // conserver l'état "hidden" tant qu'on ne franchit pas le seuil DELTA
      if (y >= TOP && !(y > lastY + DELTA) && !(y < lastY - DELTA)) {
        next.hidden = hidden;
      }
      hidden = next.hidden;
      lastY = y;
      setState(next);
    };
    el.addEventListener('scroll', onScroll, {passive: true});
    return () => el.removeEventListener('scroll', onScroll);
  }, [target]);
  return state;
}
