import {Link} from 'react-router';

export interface UniverseRailItem {
  handle: string;
  title: string;
  kicker: string;
  accent: string | null;
}

export function UniverseRail({items}: {items: UniverseRailItem[]}) {
  if (items.length === 0) return null;
  return (
    <section className="uni-rail" style={{padding: 'var(--bsk-space-10) 0 var(--bsk-space-8) var(--bsk-space-5)'}}>
      <h2
        style={{
          fontFamily: 'var(--bsk-font-display)',
          fontWeight: 'var(--bsk-weight-bold)',
          fontSize: 'var(--bsk-text-lg)',
          color: 'var(--bsk-fg-primary)',
          marginBottom: 'var(--bsk-space-5)',
        }}
      >
        Découvrir un autre univers
      </h2>
      <div className="uni-rail-row">
        {items.map((it) => (
          <Link
            key={it.handle}
            to={`/collections/${it.handle}`}
            style={{
              position: 'relative',
              flex: '0 0 auto',
              width: '200px',
              height: '130px',
              borderRadius: '14px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-end',
              padding: 'var(--bsk-space-4)',
              textDecoration: 'none',
              background: `radial-gradient(70% 80% at 60% 20%, ${it.accent ?? '#2a2c36'}, #0e1117)`,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,.82), transparent 70%)',
              }}
            />
            <span style={{position: 'relative', zIndex: 2}}>
              <span
                style={{
                  display: 'block',
                  fontSize: '9px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--bsk-accent-gold)',
                }}
              >
                {it.kicker}
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--bsk-font-display)',
                  fontWeight: 'var(--bsk-weight-bold)',
                  fontSize: 'var(--bsk-text-md)',
                  color: 'var(--bsk-fg-primary)',
                  marginTop: '3px',
                }}
              >
                {it.title}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
