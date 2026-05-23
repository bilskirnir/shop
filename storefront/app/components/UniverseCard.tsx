import {Link} from 'react-router';
import {universeAccentStyle} from '~/lib/universeAccent';
import type {UniverseCardProps} from '~/lib/universeIndex';

export function UniverseCard({name, genre, citation, stats, accent, href}: UniverseCardProps) {
  return (
    <Link to={href} className="uni-card" style={universeAccentStyle(accent)}>
      <span className="uni-card-bg" aria-hidden="true" />
      <span className="uni-card-scrim" aria-hidden="true" />
      <span className="uni-card-emblem" aria-hidden="true">
        ✦
      </span>
      <span className="uni-card-inner">
        {genre ? <span className="uni-card-pill">{genre}</span> : null}
        <span className="uni-card-name">{name}</span>
        {citation ? <span className="uni-card-lore">{citation}</span> : null}
        <span className="uni-card-stats">{stats}</span>
        <span className="uni-card-cta">Entrer dans l'univers →</span>
      </span>
    </Link>
  );
}
