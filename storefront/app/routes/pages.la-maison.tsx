import {Container} from '~/components/Container';
import {Ornament} from '~/components/Ornament';
import {Logo} from '~/components/Logo';
import {
  MAISON_HERO,
  MAISON_MANIFESTO,
  MAISON_PILLARS,
  MAISON_AUTHOR,
} from '~/data/maison';
import '~/styles/maison.css';

export function meta() {
  return [
    {title: 'La maison — Bilskirnir'},
    {
      name: 'description',
      content:
        'Bilskirnir édite des récits héroïques sans compromis. Maison d’édition française indépendante.',
    },
  ];
}

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const PILLAR_ICONS = [
  <svg key="0" {...svgProps}><path d="M14.5 4.5L20 10l-2 2-5.5-5.5zM12.5 6.5L5 14l-1 5 5-1 7.5-7.5" /></svg>,
  <svg key="1" {...svgProps}><path d="M12 3v18M12 8c0-2 2-3 4-3M12 8c0-2-2-3-4-3M12 13c0-2 2-3 4-3M12 13c0-2-2-3-4-3M8 21h8" /></svg>,
  <svg key="2" {...svgProps}><path d="M5 19l9-9 1.5 1.5-9 9H5zM14 10l3-3a2 2 0 0 0-3-3l-3 3" /></svg>,
  <svg key="3" {...svgProps}><path d="M5 4v16l7-3 7 3V4z" /></svg>,
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => /^[A-ZÀ-Ý]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
}

export default function LaMaison() {
  return (
    <article>
      <header className="maison-hero">
        <div className="maison-hero-bg" />
        <div className="maison-rise">
          <div style={{marginBottom: '22px'}}>
            <span style={{display: 'inline-block'}}>
              <Logo height={96} />
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--bsk-font-display)',
              fontWeight: 800,
              fontSize: 'clamp(36px, 9vw, 42px)',
              lineHeight: 0.98,
              letterSpacing: '-0.02em',
              marginBottom: '14px',
              color: 'var(--bsk-fg-primary)',
            }}
          >
            {MAISON_HERO.headline}
          </h1>
          <p
            style={{
              fontStyle: 'italic',
              fontSize: 'var(--bsk-text-read)',
              lineHeight: 1.5,
              color: '#d7cdb6',
              maxWidth: '320px',
              margin: '0 auto',
            }}
          >
            « {MAISON_HERO.subhead} »
          </p>
        </div>
      </header>

      <Container width="reading">
        <section style={{padding: 'var(--bsk-space-8) 0', textAlign: 'center'}}>
          <div
            style={{
              fontSize: 'var(--bsk-text-xs)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-accent-gold)',
              marginBottom: 'var(--bsk-space-4)',
            }}
          >
            Pourquoi nous existons
          </div>
          {MAISON_MANIFESTO.map((para, i) => (
            <p
              key={i}
              style={{
                fontSize: 'var(--bsk-text-read)',
                lineHeight: 1.78,
                color: 'var(--bsk-fg-primary)',
                marginBottom: 'var(--bsk-space-4)',
                textAlign: 'left',
              }}
            >
              {para}
            </p>
          ))}
        </section>
      </Container>

      <Ornament />

      <Container width="content">
        <section style={{padding: 'var(--bsk-space-8) 0'}}>
          <h2
            style={{
              fontFamily: 'var(--bsk-font-display)',
              fontWeight: 700,
              fontSize: 'var(--bsk-text-xl)',
              textAlign: 'center',
              marginBottom: 'var(--bsk-space-6)',
              color: 'var(--bsk-fg-primary)',
            }}
          >
            Nos quatre piliers
          </h2>
          <div className="maison-pillars">
            {MAISON_PILLARS.map((p, i) => (
              <div key={p.title} className="maison-pillar">
                {PILLAR_ICONS[i] ?? null}
                <h3
                  style={{
                    fontFamily: 'var(--bsk-font-display)',
                    fontWeight: 600,
                    fontSize: 'var(--bsk-text-base)',
                    margin: '0 0 7px',
                    color: 'var(--bsk-fg-primary)',
                  }}
                >
                  {p.title}
                </h3>
                <div style={{fontSize: 'var(--bsk-text-sm)', lineHeight: 1.45, color: 'var(--bsk-fg-secondary)'}}>
                  {p.body}
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>

      <Ornament />

      <Container width="reading">
        <section id="auteur" style={{padding: 'var(--bsk-space-10) 0 var(--bsk-space-12)', textAlign: 'center'}}>
          <div
            style={{
              fontSize: 'var(--bsk-text-xs)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-accent-gold)',
              marginBottom: 'var(--bsk-space-3)',
            }}
          >
            L'auteur fondateur
          </div>
          <div className="maison-avatar">{initials(MAISON_AUTHOR.name)}</div>
          <h3
            style={{
              fontFamily: 'var(--bsk-font-display)',
              fontWeight: 700,
              fontSize: 'var(--bsk-text-xl)',
              marginBottom: 'var(--bsk-space-3)',
              color: 'var(--bsk-fg-primary)',
            }}
          >
            {MAISON_AUTHOR.name}
          </h3>
          <p
            style={{
              fontSize: 'var(--bsk-text-base)',
              lineHeight: 1.65,
              color: 'var(--bsk-fg-primary)',
              maxWidth: '320px',
              margin: '0 auto var(--bsk-space-5)',
            }}
          >
            {MAISON_AUTHOR.bio}
          </p>
          <ul style={{listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '12px', justifyContent: 'center'}}>
            {MAISON_AUTHOR.links.map((l) => (
              <li key={l.href}>
                <a
                  className="maison-soc"
                  href={l.href}
                  target="_blank"
                  rel="me noreferrer"
                  aria-label={l.label}
                >
                  {l.label === 'TikTok' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.3 2.2 1.6 3.7 3.8 4v2.6c-1.3 0-2.6-.4-3.8-1.1V15a5.4 5.4 0 1 1-5.4-5.4c.3 0 .5 0 .8.06v2.7a2.7 2.7 0 1 0 1.9 2.6V3z" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></svg>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </article>
  );
}
