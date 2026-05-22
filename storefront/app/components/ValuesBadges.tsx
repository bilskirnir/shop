import type {ReactNode} from 'react';

function Badge({icon, label}: {icon: ReactNode; label: string}) {
  return (
    <div style={{textAlign: 'center', fontSize: '10.5px', color: 'var(--bsk-fg-secondary)', lineHeight: 1.35}}>
      <span
        style={{
          display: 'block',
          width: 24,
          height: 24,
          margin: '0 auto 8px',
          color: 'var(--bsk-accent-gold)',
        }}
      >
        {icon}
      </span>
      {label}
    </div>
  );
}

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  width: 24,
  height: 24,
};

export function ValuesBadges() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--bsk-space-2)',
        padding: 'var(--bsk-space-5) 0',
        borderTop: '1px solid var(--bsk-border-subtle)',
        borderBottom: '1px solid var(--bsk-border-subtle)',
      }}
    >
      <Badge
        label="Expédié sous 48 h"
        icon={
          <svg {...svgProps}>
            <rect x="1.5" y="6.5" width="12" height="9" rx="1.2" />
            <path d="M13.5 9.5h4l3 3v3h-7z" />
            <circle cx="6" cy="17.5" r="1.8" />
            <circle cx="17" cy="17.5" r="1.8" />
          </svg>
        }
      />
      <Badge
        label="Paiement sécurisé"
        icon={
          <svg {...svgProps}>
            <rect x="5" y="10.5" width="14" height="9" rx="2" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
          </svg>
        }
      />
      <Badge
        label="Dédicace offerte"
        icon={
          <svg {...svgProps}>
            <path d="M5 9h14v11H5z" />
            <path d="M3.5 9h17v3h-17z" />
            <path d="M12 9V6.5M12 6.5C12 5 10.8 4 9.4 4S7 5 7 6.5h5zM12 6.5C12 5 13.2 4 14.6 4S17 5 17 6.5h-5zM12 9v11" />
          </svg>
        }
      />
    </div>
  );
}
