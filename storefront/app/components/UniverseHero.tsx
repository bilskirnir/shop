import emblem from '~/assets/bilskirnir-emblem.png';

export interface HeroImage {
  url: string;
  altText: string;
  width: number;
  height: number;
}

export interface UniverseHeroProps {
  title: string;
  kicker?: string | null;
  quote?: string | null;
  stats?: string | null;
  heroImage?: HeroImage | null;
}

export function UniverseHero({title, kicker, quote, stats, heroImage}: UniverseHeroProps) {
  return (
    <header className="uni-hero">
      {heroImage ? (
        <img className="uni-hero-img" src={heroImage.url} alt={heroImage.altText} />
      ) : (
        <div className="uni-hero-bg" />
      )}
      <div className="uni-fog" />
      <img className="uni-emblem" src={emblem} alt="" aria-hidden="true" />

      <div className="uni-rise">
        {kicker ? (
          <span
            style={{
              display: 'inline-flex',
              fontSize: 'var(--bsk-text-xs)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-fg-primary)',
              border: '1px solid var(--bsk-border-subtle)',
              borderRadius: '999px',
              padding: '6px 13px',
            }}
          >
            {kicker}
          </span>
        ) : null}
        <h1
          style={{
            fontFamily: 'var(--bsk-font-display)',
            fontWeight: 800,
            fontSize: 'clamp(40px, 12vw, 52px)',
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
            margin: 'var(--bsk-space-4) 0 var(--bsk-space-3)',
            color: 'var(--bsk-fg-primary)',
          }}
        >
          {title}
        </h1>
        {quote ? (
          <p
            style={{
              fontStyle: 'italic',
              fontSize: 'var(--bsk-text-read)',
              lineHeight: 1.5,
              color: '#d7cdb6',
              maxWidth: '300px',
              margin: '0 auto var(--bsk-space-4)',
            }}
          >
            {quote}
          </p>
        ) : null}
        {stats ? (
          <p
            style={{
              fontFamily: 'var(--bsk-font-sans)',
              fontSize: 'var(--bsk-text-xs)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-accent-gold)',
            }}
          >
            {stats}
          </p>
        ) : null}
      </div>

      <div className="uni-cue" aria-hidden="true">↓ Les sagas</div>
    </header>
  );
}
