import {Link} from 'react-router';
import type {FanCover} from '~/lib/universeFan';

/**
 * Éventail de 1 à 3 couvertures. Si une couverture porte un `href`, elle devient
 * un lien survolable (passe devant, grandit, s'assombrit + CTA) vers la fiche ;
 * sinon elle reste une image décorative (éventail de la page univers).
 */
export function CoverFan({
  covers,
  ctaLabel = 'Découvrir ce livre',
}: {
  covers: FanCover[];
  ctaLabel?: string;
}) {
  const shown = covers.slice(0, 3);
  if (shown.length === 0) return null;
  const interactive = shown.some((c) => c.href);
  return (
    <div
      className={`uni-fan uni-fan--${shown.length}`}
      aria-hidden={interactive ? undefined : 'true'}
    >
      {shown.map((c, i) =>
        c.href ? (
          <Link
            key={i}
            to={c.href}
            className="uni-fan-cover uni-fan-cover--link"
            aria-label={c.altText}
          >
            <img className="uni-fan-img" src={c.url} alt={c.altText} loading="lazy" />
            <span className="uni-fan-veil" aria-hidden="true">
              <span className="uni-fan-cta">{ctaLabel}</span>
            </span>
          </Link>
        ) : (
          <img
            key={i}
            className="uni-fan-cover"
            src={c.url}
            alt={c.altText}
            loading="lazy"
          />
        ),
      )}
    </div>
  );
}
