import {Container} from '~/components/Container';
import {Ornament} from '~/components/Ornament';
import {
  MAISON_HERO,
  MAISON_MANIFESTO,
  MAISON_PILLARS,
  MAISON_AUTHOR,
} from '~/data/maison';

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

export default function LaMaison() {
  return (
    <article>
      {/* Hero tagline */}
      <Container width="reading">
        <section
          style={{
            padding: 'var(--bsk-space-16) 0 var(--bsk-space-10)',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(var(--bsk-text-2xl), 5vw, var(--bsk-text-4xl))',
              color: 'var(--bsk-fg-primary)',
              marginBottom: 'var(--bsk-space-5)',
            }}
          >
            {MAISON_HERO.headline}
          </h1>
          <p
            style={{
              fontFamily: 'var(--bsk-font-serif)',
              fontStyle: 'italic',
              fontSize: 'var(--bsk-text-md)',
              color: 'var(--bsk-fg-secondary)',
            }}
          >
            « {MAISON_HERO.subhead} »
          </p>
        </section>
      </Container>

      <Ornament />

      {/* Manifesto */}
      <Container width="reading">
        <section style={{padding: 'var(--bsk-space-8) 0'}}>
          <h2
            style={{
              fontSize: 'var(--bsk-text-xs)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-accent-gold)',
              fontFamily: 'var(--bsk-font-sans)',
              textAlign: 'center',
              marginBottom: 'var(--bsk-space-6)',
            }}
          >
            Pourquoi nous existons
          </h2>
          {MAISON_MANIFESTO.map((para, i) => (
            <p
              key={i}
              style={{
                fontFamily: 'var(--bsk-font-serif)',
                fontSize: 'var(--bsk-text-md)',
                lineHeight: 1.8,
                color: 'var(--bsk-fg-primary)',
                marginBottom: 'var(--bsk-space-5)',
              }}
            >
              {para}
            </p>
          ))}
        </section>
      </Container>

      <Ornament />

      {/* 4 pillars */}
      <Container>
        <section style={{padding: 'var(--bsk-space-10) 0'}}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
              gap: 'var(--bsk-space-8)',
            }}
          >
            {MAISON_PILLARS.map((p) => (
              <div key={p.title} style={{textAlign: 'center'}}>
                <div
                  style={{
                    fontSize: 'var(--bsk-text-2xl)',
                    color: 'var(--bsk-accent-gold)',
                    marginBottom: 'var(--bsk-space-3)',
                  }}
                  aria-hidden="true"
                >
                  {p.icon}
                </div>
                <h3
                  style={{
                    fontSize: 'var(--bsk-text-lg)',
                    color: 'var(--bsk-fg-primary)',
                    marginBottom: 'var(--bsk-space-3)',
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    color: 'var(--bsk-fg-secondary)',
                    fontSize: 'var(--bsk-text-sm)',
                  }}
                >
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Container>

      <Ornament />

      {/* Author block */}
      <Container width="reading">
        <section
          id="auteur"
          style={{
            padding: 'var(--bsk-space-10) 0 var(--bsk-space-16)',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: 'var(--bsk-space-6)',
            alignItems: 'center',
          }}
        >
          <img
            src={MAISON_AUTHOR.photoUrl}
            alt={MAISON_AUTHOR.photoAlt}
            width={128}
            height={128}
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--bsk-accent-gold-dim)',
            }}
          />
          <div>
            <h3
              style={{
                fontSize: 'var(--bsk-text-xl)',
                color: 'var(--bsk-fg-primary)',
                marginBottom: 'var(--bsk-space-2)',
              }}
            >
              {MAISON_AUTHOR.name}
            </h3>
            <p
              style={{
                color: 'var(--bsk-fg-secondary)',
                marginBottom: 'var(--bsk-space-4)',
              }}
            >
              {MAISON_AUTHOR.bio}
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                display: 'flex',
                gap: 'var(--bsk-space-4)',
              }}
            >
              {MAISON_AUTHOR.links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="me noreferrer"
                    style={{
                      color: 'var(--bsk-accent-gold)',
                      fontSize: 'var(--bsk-text-sm)',
                      letterSpacing: 'var(--bsk-tracking-wide)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Container>
    </article>
  );
}
