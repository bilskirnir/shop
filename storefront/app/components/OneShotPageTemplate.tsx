import type {ReactNode} from 'react';
import {Container} from './Container';
import {ProductGallery} from './ProductGallery';
import {ValuesBadges} from './ValuesBadges';
import {TechSpecs, type TechRow} from './TechSpecs';
import type {CoverImage} from './Cover';

export interface OneShotPageTemplateProps {
  title: string;
  teaserShort?: string | null;
  description: string;
  cover: CoverImage;
  pillLabel: 'ROMAN' | 'RECUEIL' | 'GUIDE';
  ambiance?: string | null;
  techRows?: TechRow[];
  purchaseSlot: ReactNode;
  relatedSlot?: ReactNode;
}

export function OneShotPageTemplate({
  title,
  teaserShort,
  description,
  cover,
  pillLabel,
  ambiance,
  techRows = [],
  purchaseSlot,
  relatedSlot,
}: OneShotPageTemplateProps) {
  const images = [cover].filter((c) => c.url);
  // Pas de fallback sur teaserShort (sinon doublon avec le hero) : l'ambiance
  // vient d'un metafield dédié, sinon le bandeau n'affiche que son titre.
  const atmosphereText = ambiance ?? null;

  return (
    <>
      <section className="fiche-hero" style={{paddingTop: '40px'}}>
        <div className="fiche-hero-bg" />
        <div className="fiche-fog" />
        <ProductGallery images={images} alt={cover.altText} />
        <div className="fiche-rise" style={{position: 'relative', zIndex: 3, marginTop: 'var(--bsk-space-5)'}}>
          <span
            style={{
              display: 'inline-flex',
              fontSize: 'var(--bsk-text-xs)',
              letterSpacing: 'var(--bsk-tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--bsk-accent-gold)',
              border: '1px solid var(--bsk-border-gold)',
              borderRadius: '999px',
              padding: '6px 14px',
            }}
          >
            {pillLabel} INDÉPENDANT
          </span>
          <h1
            style={{
              fontFamily: 'var(--bsk-font-display)',
              fontWeight: 800,
              fontSize: 'clamp(40px, 12vw, 50px)',
              lineHeight: 0.94,
              letterSpacing: '-0.02em',
              margin: '14px 0 12px',
              color: 'var(--bsk-fg-primary)',
            }}
          >
            {title}
          </h1>
          {teaserShort ? (
            <p
              style={{
                fontStyle: 'italic',
                fontSize: 'var(--bsk-text-read)',
                lineHeight: 1.5,
                color: '#d7cdb6',
                maxWidth: '300px',
                margin: '0 auto',
              }}
            >
              {teaserShort}
            </p>
          ) : null}
        </div>
      </section>

      <Container width="reading">
        <div style={{padding: 'var(--bsk-space-6) 0'}}>{purchaseSlot}</div>
        <ValuesBadges />
        <section style={{padding: 'var(--bsk-space-8) 0'}}>
          <h2
            style={{
              fontFamily: 'var(--bsk-font-display)',
              fontWeight: 'var(--bsk-weight-bold)',
              fontSize: 'var(--bsk-text-lg)',
              color: 'var(--bsk-fg-primary)',
              marginBottom: 'var(--bsk-space-4)',
            }}
          >
            Le récit
          </h2>
          <div
            style={{
              fontSize: 'var(--bsk-text-read)',
              lineHeight: 1.72,
              color: 'var(--bsk-fg-primary)',
              whiteSpace: 'pre-line',
            }}
          >
            {description}
          </div>
        </section>
      </Container>

      <section
        style={{
          position: 'relative',
          margin: 'var(--bsk-space-4) 0',
          padding: '54px 26px',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <span
          aria-hidden="true"
          style={{position: 'absolute', inset: 0, background: 'radial-gradient(80% 90% at 50% 30%, var(--bsk-uni), #0c1018)'}}
        />
        <span
          aria-hidden="true"
          style={{position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(19,20,25,.6), rgba(19,20,25,.2), rgba(19,20,25,.85))'}}
        />
        <div style={{position: 'relative', zIndex: 2}}>
          <div style={{fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--bsk-accent-gold)', marginBottom: 'var(--bsk-space-4)'}}>
            L'atmosphère du livre
          </div>
          {atmosphereText ? (
            <p style={{fontFamily: 'var(--bsk-font-display)', fontWeight: 700, fontSize: 'var(--bsk-text-lg)', lineHeight: 1.25, maxWidth: '300px', margin: '0 auto', color: 'var(--bsk-fg-primary)'}}>
              {atmosphereText}
            </p>
          ) : null}
        </div>
      </section>

      <Container width="reading">
        <TechSpecs rows={techRows} />
      </Container>

      {relatedSlot ? <Container width="content">{relatedSlot}</Container> : null}
    </>
  );
}
