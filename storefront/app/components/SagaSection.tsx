import {Link} from 'react-router';
import {Ornament} from './Ornament';
import {TomeCard, type TomeCardProps} from './TomeCard';

export interface SagaSectionProps {
  nom: string;
  type?: string | null;
  synopsis?: string | null;
  tomes: TomeCardProps[];
  bundleHref?: string | null;
}

export function SagaSection({
  nom,
  type,
  synopsis,
  tomes,
  bundleHref,
}: SagaSectionProps) {
  const labelParts = [
    'SAGA',
    type ? type.toUpperCase() : null,
    `${tomes.length} TOMES`,
  ].filter(Boolean);

  return (
    <section
      style={{
        padding: 'var(--bsk-space-12) 0',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--bsk-font-sans)',
          fontSize: 'var(--bsk-text-xs)',
          letterSpacing: 'var(--bsk-tracking-widest)',
          textTransform: 'uppercase',
          color: 'var(--bsk-fg-secondary)',
          marginBottom: 'var(--bsk-space-3)',
        }}
      >
        {labelParts.join(' · ')}
      </p>
      <Ornament />
      <h2
        style={{
          fontFamily: 'var(--bsk-font-serif)',
          fontSize: 'var(--bsk-text-2xl)',
          color: 'var(--bsk-fg-primary)',
          letterSpacing: 'var(--bsk-tracking-tight)',
          margin: 'var(--bsk-space-3) 0',
        }}
      >
        {nom}
      </h2>
      {synopsis && (
        <p
          style={{
            fontFamily: 'var(--bsk-font-serif)',
            fontStyle: 'italic',
            fontSize: 'var(--bsk-text-md)',
            color: 'var(--bsk-fg-secondary)',
            maxWidth: 'var(--bsk-width-reading)',
            margin: '0 auto var(--bsk-space-6)',
            whiteSpace: 'pre-line',
          }}
        >
          {synopsis}
        </p>
      )}
      {bundleHref && (
        <Link
          to={bundleHref}
          style={{
            display: 'inline-block',
            padding: 'var(--bsk-space-3) var(--bsk-space-6)',
            fontFamily: 'var(--bsk-font-sans)',
            fontSize: 'var(--bsk-text-sm)',
            letterSpacing: 'var(--bsk-tracking-wide)',
            textTransform: 'uppercase',
            color: 'var(--bsk-bg-base)',
            background: 'var(--bsk-accent-gold)',
            textDecoration: 'none',
            marginBottom: 'var(--bsk-space-8)',
            borderRadius: '2px',
          }}
        >
          Acheter la saga complète
        </Link>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--bsk-space-6)',
          textAlign: 'left',
          marginTop: 'var(--bsk-space-6)',
        }}
      >
        {tomes.map((t) => (
          <TomeCard key={t.handle} {...t} />
        ))}
      </div>
    </section>
  );
}
