import {Link} from 'react-router';
import {TomeCard, type TomeCardProps} from './TomeCard';

export interface SagaSectionProps {
  nom: string;
  type?: string | null;
  synopsis?: string | null;
  tomes: TomeCardProps[];
  bundleHref?: string | null;
}

export function SagaSection({nom, type, synopsis, tomes, bundleHref}: SagaSectionProps) {
  const labelParts = [
    'SAGA',
    type ? type.toUpperCase() : null,
    `${tomes.length} TOMES`,
  ].filter(Boolean);

  return (
    <section style={{padding: 'var(--bsk-space-10) 0'}}>
      <div style={{textAlign: 'center', marginBottom: 'var(--bsk-space-6)'}}>
        <p
          style={{
            fontFamily: 'var(--bsk-font-sans)',
            fontSize: 'var(--bsk-text-xs)',
            letterSpacing: 'var(--bsk-tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--bsk-accent-gold)',
            marginBottom: 'var(--bsk-space-3)',
          }}
        >
          {labelParts.join(' · ')}
        </p>
        <h2
          style={{
            fontFamily: 'var(--bsk-font-display)',
            fontWeight: 'var(--bsk-weight-bold)',
            fontSize: 'var(--bsk-text-xl)',
            color: 'var(--bsk-fg-primary)',
            letterSpacing: 'var(--bsk-tracking-tight)',
            marginBottom: 'var(--bsk-space-3)',
          }}
        >
          {nom}
        </h2>
        {synopsis ? (
          <p
            style={{
              fontStyle: 'italic',
              fontSize: 'var(--bsk-text-base)',
              lineHeight: 1.6,
              color: 'var(--bsk-fg-secondary)',
              maxWidth: 'var(--bsk-width-reading)',
              margin: '0 auto',
              whiteSpace: 'pre-line',
            }}
          >
            {synopsis}
          </p>
        ) : null}
        {bundleHref ? (
          <Link
            to={bundleHref}
            style={{
              display: 'inline-block',
              marginTop: 'var(--bsk-space-5)',
              padding: 'var(--bsk-space-3) var(--bsk-space-6)',
              fontFamily: 'var(--bsk-font-sans)',
              fontSize: 'var(--bsk-text-sm)',
              letterSpacing: 'var(--bsk-tracking-wide)',
              textTransform: 'uppercase',
              color: 'var(--bsk-bg-base)',
              background: 'var(--bsk-accent-gold)',
              textDecoration: 'none',
              borderRadius: '999px',
            }}
          >
            Acheter la saga complète
          </Link>
        ) : null}
      </div>
      <div className="saga-grid">
        {tomes.map((t) => (
          <TomeCard key={t.handle} {...t} />
        ))}
      </div>
    </section>
  );
}
