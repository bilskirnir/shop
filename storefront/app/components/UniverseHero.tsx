import emblem from '~/assets/bilskirnir-emblem.png';
import {CoverFan} from '~/components/CoverFan';
import type {FanCover} from '~/lib/universeFan';

export interface UniverseHeroProps {
  title: string;
  genre?: string | null;
  lore?: string | null;
  stats?: string | null;
  fanCovers?: FanCover[];
}

export function UniverseHero({title, genre, lore, stats, fanCovers = []}: UniverseHeroProps) {
  return (
    <header className="uni-hero">
      <div className="uni-hero-bg" />
      <div className="uni-fog" />
      <img className="uni-emblem" src={emblem} alt="" aria-hidden="true" />

      <div className="uni-hero-inner">
        <CoverFan covers={fanCovers} />
        <div className="uni-hero-text uni-rise">
          {genre ? <span className="uni-hero-pill">{genre}</span> : null}
          <h1 className="uni-hero-title">{title}</h1>
          {lore ? <p className="uni-hero-lore">{lore}</p> : null}
          {stats ? <p className="uni-hero-stats">{stats}</p> : null}
        </div>
      </div>
    </header>
  );
}
