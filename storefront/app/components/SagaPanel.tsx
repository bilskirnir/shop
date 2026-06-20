import {Link} from 'react-router';
import {CoverFan} from '~/components/CoverFan';
import {universeAccentStyle} from '~/lib/universeAccent';
import type {HomeScreen} from '~/lib/homeScreens';
import '~/styles/atoms.css';

/** Note FR (4.7 → « 4,7 »). */
const fmtNote = (n: number) => String(n).replace('.', ',');
/** Entier FR avec séparateur de milliers (espace fine), déterministe SSR/client. */
const fmtInt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export function SagaPanel({
  screen,
  index,
  state = 'active',
}: {
  screen: HomeScreen;
  index: number;
  /** Position relative au panneau actif : 'above' (parti vers le haut), 'active' (révélé), 'below' (en attente). */
  state?: 'above' | 'active' | 'below';
}) {
  return (
    <section
      className={`bsk-saga-panel is-${state}`}
      style={universeAccentStyle(screen.accent ?? undefined)}
      aria-label={screen.title}
    >
      {screen.background ? (
        <div
          className="bsk-saga-bg"
          style={{backgroundImage: `url(${screen.background})`}}
          aria-hidden="true"
        />
      ) : null}
      <div className="bsk-saga-halo bsk-halo" aria-hidden="true" />
      <div className="bsk-saga-fan" data-parallax="fan">
        <CoverFan covers={screen.covers} />
        {screen.rating ? (
          <div
            className="bsk-rating"
            aria-label={`Note moyenne ${fmtNote(screen.rating.note)} sur 5${
              screen.rating.readers ? `, ${screen.rating.readers} lecteurs` : ''
            }`}
          >
            <svg className="bsk-rating-star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.2l2.95 5.98 6.6.96-4.77 4.65 1.13 6.57L12 17.27l-5.9 3.1 1.13-6.57L2.46 9.14l6.6-.96L12 2.2z" />
            </svg>
            <span className="bsk-rating-body">
              <span className="bsk-rating-top">
                <span className="bsk-rating-note">{fmtNote(screen.rating.note)}</span>
                <span className="bsk-rating-max">/5</span>
              </span>
              {screen.rating.readers ? (
                <span className="bsk-rating-readers">{fmtInt(screen.rating.readers)}+ lecteurs</span>
              ) : null}
            </span>
          </div>
        ) : null}
      </div>
      <div className="bsk-grain" aria-hidden="true" />
      <div className="bsk-saga-mist" aria-hidden="true" />
      <div className="bsk-saga-text" data-parallax="text">
        <span className="bsk-kicker">{screen.kicker}</span>
        <h2 className="bsk-saga-title">{screen.title}</h2>
        {screen.author ? <p className="bsk-saga-author">Par {screen.author}</p> : null}
        {screen.lore ? <p className="bsk-saga-lore">{screen.lore}</p> : null}
        <Link to={screen.href} className="bsk-btn bsk-btn--cream bsk-saga-cta">
          {screen.ctaLabel} →
        </Link>
      </div>
      {index === 0 ? <div className="bsk-saga-cue" aria-hidden="true">↓ suite</div> : null}
    </section>
  );
}
