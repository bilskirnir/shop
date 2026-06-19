import {SagaPanel} from '~/components/SagaPanel';
import {ProgressDots} from '~/components/ProgressDots';
import {Footer} from '~/components/Footer';
import {useActivePanel} from '~/hooks/useActivePanel';
import type {HomeScreen} from '~/lib/homeScreens';
import '~/styles/home.css';

export function SagaScroller({screens}: {screens: HomeScreen[]}) {
  const total = screens.length + 1; // + footer final
  const {activeIndex, containerRef, jumpTo} = useActivePanel(total);

  return (
    <div className="bsk-scroller" ref={containerRef}>
      {screens.map((s, i) => (
        <div className="bsk-scroller-panel" data-panel key={s.key}>
          <SagaPanel screen={s} index={i} />
        </div>
      ))}
      <div className="bsk-scroller-panel bsk-scroller-panel--footer" data-panel>
        <Footer asPanel />
      </div>
      <nav className="bsk-scroller-dots" aria-label="Navigation des sagas">
        <ProgressDots count={total} activeIndex={activeIndex} onJump={jumpTo} />
      </nav>
    </div>
  );
}
