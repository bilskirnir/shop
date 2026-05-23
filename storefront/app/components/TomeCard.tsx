import {Link} from 'react-router';
import {Cover} from './Cover';
import {ReleaseStatusBadge, type ReleaseStatus} from './ReleaseStatusBadge';
import type {CoverImage} from './WorkTile';

export interface TomeCardProps {
  handle: string;
  title: string;
  cover: CoverImage;
  status: ReleaseStatus;
  releaseDate?: string | null;
  tomeNumber?: number | null;
  priceFormatted?: string | null;
  /** Couleur d'accent : rend un halo derrière la couverture (catalogue). */
  halo?: string | null;
  /** Couverture à hauteur fixe (object-fit contain) + hover (catalogue). */
  coverFixed?: boolean;
}

export function TomeCard({
  handle,
  title,
  cover,
  status,
  releaseDate,
  tomeNumber,
  priceFormatted,
  halo,
  coverFixed = false,
}: TomeCardProps) {
  return (
    <Link
      className="tome-card"
      to={`/products/${handle}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
        textAlign: 'center',
      }}
    >
      <div className="cat-cover-wrap" style={{position: 'relative'}}>
        {halo ? (
          <span
            className="cat-halo"
            aria-hidden="true"
            style={{background: `radial-gradient(60% 50% at 50% 40%, ${halo}, transparent 70%)`}}
          />
        ) : null}
        <ReleaseStatusBadge status={status} releaseDate={releaseDate} onImage />
        {coverFixed ? (
          <div className="tome-card-cover-box">
            {cover.url ? (
              <img
                className="tome-card-cover"
                src={cover.url}
                alt={cover.altText}
                loading="lazy"
              />
            ) : null}
          </div>
        ) : (
          <Cover image={cover} bleed />
        )}
      </div>
      <div
        style={{
          marginTop: 'var(--bsk-space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--bsk-space-1)',
        }}
      >
        {tomeNumber != null ? (
          <span
            style={{
              fontFamily: 'var(--bsk-font-sans)',
              fontSize: 'var(--bsk-text-xs)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-fg-secondary)',
            }}
          >
            TOME {tomeNumber}
          </span>
        ) : null}
        <span
          style={{
            fontFamily: 'var(--bsk-font-display)',
            fontWeight: 'var(--bsk-weight-medium)',
            fontSize: 'var(--bsk-text-lg)',
            color: 'var(--bsk-fg-primary)',
            letterSpacing: 'var(--bsk-tracking-tight)',
            lineHeight: 1.15,
          }}
        >
          {title}
        </span>
        {status === 'publié' && priceFormatted ? (
          <span
            style={{
              fontFamily: 'var(--bsk-font-sans)',
              fontSize: 'var(--bsk-text-base)',
              color: 'var(--bsk-accent-gold)',
            }}
          >
            {priceFormatted}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
