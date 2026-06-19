import {Link} from 'react-router';
import {CoverFan} from '~/components/CoverFan';
import {universeAccentStyle} from '~/lib/universeAccent';
import type {HomeScreen} from '~/lib/homeScreens';
import '~/styles/atoms.css';

export function SagaPanel({screen, index}: {screen: HomeScreen; index: number}) {
  return (
    <section
      className="bsk-saga-panel"
      style={universeAccentStyle(screen.accent ?? undefined)}
      aria-roledescription="diapositive"
      aria-label={screen.title}
    >
      <div className="bsk-saga-halo bsk-halo" aria-hidden="true" />
      <div className="bsk-saga-fan" data-parallax="fan">
        <CoverFan covers={screen.covers} />
      </div>
      <div className="bsk-grain" aria-hidden="true" />
      <div className="bsk-saga-mist" aria-hidden="true" />
      <div className="bsk-saga-text" data-parallax="text">
        <span className="bsk-kicker">{screen.kicker}</span>
        <h2 className="bsk-saga-title">{screen.title}</h2>
        {screen.lore ? <p className="bsk-saga-lore">{screen.lore}</p> : null}
        <Link to={screen.href} className="bsk-btn bsk-btn--cream bsk-saga-cta">
          {screen.ctaLabel} →
        </Link>
      </div>
      {index === 0 ? <div className="bsk-saga-cue" aria-hidden="true">↓ saga suivante</div> : null}
    </section>
  );
}
