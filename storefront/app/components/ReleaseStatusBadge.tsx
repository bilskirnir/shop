export type ReleaseStatus = 'publié' | 'précommande' | 'annoncé';

export interface ReleaseStatusBadgeProps {
  status: ReleaseStatus;
  releaseDate?: string | null;
  /** Posé en superposition sur une couverture (absolu, centré, au-dessus). */
  onImage?: boolean;
}

const FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function formatReleaseDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return FORMATTER.format(d);
}

export function ReleaseStatusBadge({
  status,
  releaseDate,
  onImage = false,
}: ReleaseStatusBadgeProps) {
  if (status === 'publié') return null;

  const formatted = formatReleaseDate(releaseDate);
  const label = status === 'précommande' ? 'PRÉCO' : 'À PARAÎTRE';

  const onImageStyle = onImage
    ? ({
        position: 'absolute',
        top: '7%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3,
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 12px rgba(0,0,0,.4)',
      } as const)
    : null;

  return (
    <span
      data-status={status}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--bsk-space-2)',
        padding: 'var(--bsk-space-1) var(--bsk-space-3)',
        fontFamily: 'var(--bsk-font-sans)',
        fontSize: 'var(--bsk-text-xs)',
        fontWeight: 'var(--bsk-weight-semibold)',
        letterSpacing: 'var(--bsk-tracking-widest)',
        textTransform: 'uppercase',
        color:
          status === 'précommande'
            ? 'var(--bsk-bg-base)'
            : 'var(--bsk-fg-secondary)',
        background:
          status === 'précommande'
            ? 'var(--bsk-accent-gold)'
            : onImage
              ? 'rgba(19,20,25,.82)'
              : 'transparent',
        border:
          status === 'précommande'
            ? 'none'
            : '1px solid var(--bsk-border-subtle)',
        borderRadius: '2px',
        ...onImageStyle,
      }}
    >
      {label}
      {formatted && status === 'précommande' && (
        <span style={{opacity: 0.85}}>· {formatted}</span>
      )}
    </span>
  );
}
