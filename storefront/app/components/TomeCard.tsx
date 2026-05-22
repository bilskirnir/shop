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
}

export function TomeCard({
  handle,
  title,
  cover,
  status,
  releaseDate,
  tomeNumber,
  priceFormatted,
}: TomeCardProps) {
  return (
    <Link
      to={`/products/${handle}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
        textAlign: 'center',
      }}
    >
      <div style={{position: 'relative'}}>
        <ReleaseStatusBadge status={status} releaseDate={releaseDate} onImage />
        <Cover image={cover} bleed />
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
