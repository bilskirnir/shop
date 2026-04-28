export interface HeroImage {
  url: string;
  altText: string;
  width: number;
  height: number;
}

export interface UniverseHeroProps {
  title: string;
  lore?: string | null;
  stats?: string | null;
  heroImage?: HeroImage | null;
  themeColor?: string | null;
}

export function UniverseHero({
  title,
  lore,
  stats,
  heroImage,
  themeColor,
}: UniverseHeroProps) {
  const hasImage = !!heroImage;
  const fallbackColor = themeColor || '#1a140e';

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '420px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--bsk-space-12) var(--bsk-space-5)',
        overflow: 'hidden',
        background: hasImage
          ? 'var(--bsk-bg-base)'
          : `radial-gradient(ellipse at 50% 0%, ${fallbackColor} 0%, var(--bsk-bg-base) 75%)`,
      }}
    >
      {hasImage && (
        <img
          src={heroImage.url}
          alt={heroImage.altText}
          width={heroImage.width}
          height={heroImage.height}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.55,
          }}
        />
      )}
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          maxWidth: 'var(--bsk-width-content)',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--bsk-font-serif)',
            fontSize: 'var(--bsk-text-3xl)',
            color: 'var(--bsk-fg-primary)',
            letterSpacing: 'var(--bsk-tracking-tight)',
            marginBottom: 'var(--bsk-space-5)',
          }}
        >
          {title}
        </h1>
        {lore && (
          <p
            style={{
              fontFamily: 'var(--bsk-font-serif)',
              fontStyle: 'italic',
              fontSize: 'var(--bsk-text-md)',
              color: 'var(--bsk-fg-secondary)',
              maxWidth: 'var(--bsk-width-reading)',
              margin: '0 auto var(--bsk-space-5)',
              whiteSpace: 'pre-line',
            }}
          >
            {lore}
          </p>
        )}
        {stats && (
          <p
            style={{
              fontFamily: 'var(--bsk-font-sans)',
              fontSize: 'var(--bsk-text-sm)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-accent-gold)',
            }}
          >
            {stats}
          </p>
        )}
      </div>
    </section>
  );
}
