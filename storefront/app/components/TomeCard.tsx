import {Link} from 'react-router';
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
      }}
    >
      <img
        src={cover.url}
        alt={cover.altText}
        width={cover.width}
        height={cover.height}
        loading="lazy"
        style={{
          width: '100%',
          height: 'auto',
          boxShadow: 'var(--bsk-shadow-cover)',
          borderRadius: '2px',
          background: 'var(--bsk-bg-raised)',
        }}
      />
      <div
        style={{
          marginTop: 'var(--bsk-space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--bsk-space-2)',
        }}
      >
        {tomeNumber != null && (
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
        )}
        <span
          style={{
            fontFamily: 'var(--bsk-font-serif)',
            fontSize: 'var(--bsk-text-lg)',
            color: 'var(--bsk-fg-primary)',
            letterSpacing: 'var(--bsk-tracking-tight)',
          }}
        >
          {title}
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--bsk-space-3)',
          }}
        >
          {status === 'publié' && priceFormatted && (
            <span
              style={{
                fontFamily: 'var(--bsk-font-sans)',
                fontSize: 'var(--bsk-text-base)',
                color: 'var(--bsk-fg-primary)',
              }}
            >
              {priceFormatted}
            </span>
          )}
          <ReleaseStatusBadge status={status} releaseDate={releaseDate} />
        </div>
      </div>
    </Link>
  );
}
