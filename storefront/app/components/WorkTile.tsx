import {Link} from 'react-router';

export interface CoverImage {
  url: string;
  altText: string;
  width: number;
  height: number;
}

export type WorkTileProps =
  | {
      kind: 'single';
      href: string;
      title: string;
      cover: CoverImage;
      meta?: string;
    }
  | {
      kind: 'stack';
      href: string;
      title: string;
      covers: CoverImage[];
      meta?: string;
    }
  | {
      kind: 'stack-many';
      href: string;
      title: string;
      covers: CoverImage[];
      extraCount: number;
      meta?: string;
    }
  | {
      kind: 'standalone';
      href: string;
      title: string;
      cover: CoverImage;
      pillLabel: 'ROMAN' | 'RECUEIL' | 'GUIDE';
      meta?: string;
    };

const tileLink: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textDecoration: 'none',
  color: 'inherit',
  width: '14rem',
  flex: '0 0 auto',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--bsk-font-serif)',
  fontSize: 'var(--bsk-text-md)',
  color: 'var(--bsk-fg-primary)',
  textAlign: 'center',
  marginTop: 'var(--bsk-space-4)',
  letterSpacing: 'var(--bsk-tracking-tight)',
};

const metaStyle: React.CSSProperties = {
  fontFamily: 'var(--bsk-font-sans)',
  fontSize: 'var(--bsk-text-xs)',
  letterSpacing: 'var(--bsk-tracking-wide)',
  textTransform: 'uppercase',
  color: 'var(--bsk-fg-secondary)',
  marginTop: 'var(--bsk-space-1)',
};

const coverFloat: React.CSSProperties = {
  width: '100%',
  height: 'auto',
  boxShadow: 'var(--bsk-shadow-cover)',
  borderRadius: '2px',
  background: 'var(--bsk-bg-raised)',
};

function Cover({src}: {src: CoverImage}) {
  return (
    <img
      src={src.url}
      alt={src.altText}
      width={src.width}
      height={src.height}
      style={coverFloat}
      loading="lazy"
    />
  );
}

function StackedCovers({
  covers,
  extraCount,
}: {
  covers: CoverImage[];
  extraCount?: number;
}) {
  const visible = covers.slice(0, 3);
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '20rem',
      }}
    >
      {visible.map((c, i) => (
        <div
          key={c.url + i}
          style={{
            position: 'absolute',
            top: 0,
            left: `${i * 8}%`,
            width: '70%',
            transform: `rotate(${(i - 1) * 2.5}deg)`,
            transformOrigin: 'bottom center',
          }}
        >
          <Cover src={c} />
        </div>
      ))}
      {extraCount && extraCount > 0 ? (
        <span
          style={{
            position: 'absolute',
            bottom: '-0.5rem',
            right: '-0.25rem',
            background: 'var(--bsk-accent-gold)',
            color: 'var(--bsk-bg-base)',
            fontFamily: 'var(--bsk-font-sans)',
            fontWeight: 'var(--bsk-weight-bold)',
            fontSize: 'var(--bsk-text-sm)',
            padding: 'var(--bsk-space-1) var(--bsk-space-3)',
            borderRadius: '999px',
          }}
        >
          +{extraCount}
        </span>
      ) : null}
    </div>
  );
}

function StandalonePill({label}: {label: string}) {
  return (
    <span
      style={{
        position: 'absolute',
        top: 'var(--bsk-space-3)',
        right: 'var(--bsk-space-3)',
        background: 'var(--bsk-accent-gold)',
        color: 'var(--bsk-bg-base)',
        fontFamily: 'var(--bsk-font-sans)',
        fontSize: 'var(--bsk-text-xs)',
        fontWeight: 'var(--bsk-weight-semibold)',
        letterSpacing: 'var(--bsk-tracking-widest)',
        padding: 'var(--bsk-space-1) var(--bsk-space-3)',
        borderRadius: '2px',
      }}
    >
      {label}
    </span>
  );
}

export function WorkTile(props: WorkTileProps) {
  return (
    <Link to={props.href} style={tileLink} data-kind={props.kind}>
      <div style={{position: 'relative', width: '100%'}}>
        {props.kind === 'single' && <Cover src={props.cover} />}
        {props.kind === 'stack' && <StackedCovers covers={props.covers} />}
        {props.kind === 'stack-many' && (
          <StackedCovers covers={props.covers} extraCount={props.extraCount} />
        )}
        {props.kind === 'standalone' && (
          <>
            <Cover src={props.cover} />
            <StandalonePill label={props.pillLabel} />
          </>
        )}
      </div>
      <span style={titleStyle}>{props.title}</span>
      {props.meta && <span style={metaStyle}>{props.meta}</span>}
    </Link>
  );
}
