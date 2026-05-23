import {Link} from 'react-router';
import {TomeCard, type TomeCardProps} from './TomeCard';
import {universeAccentStyle} from '~/lib/universeAccent';

export interface CatalogueSectionProps {
  name: string;
  accent: string | null;
  href: string | null;
  tomes: TomeCardProps[];
}

export function CatalogueSection({name, accent, href, tomes}: CatalogueSectionProps) {
  return (
    <section style={{...universeAccentStyle(accent), padding: 'var(--bsk-space-6) 0'}}>
      <div className="cat-sec-head">
        <h2 className="cat-sec-name">
          <span className="cat-star" aria-hidden="true">
            ✦
          </span>{' '}
          {name}
        </h2>
        {href ? (
          <Link className="cat-sec-link" to={href}>
            Explorer l'univers →
          </Link>
        ) : null}
      </div>
      <ul className="cat-grid">
        {tomes.map((t) => (
          <li key={t.handle}>
            <TomeCard {...t} halo={accent} />
          </li>
        ))}
      </ul>
    </section>
  );
}
