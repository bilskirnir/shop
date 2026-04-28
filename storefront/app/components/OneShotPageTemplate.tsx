import type {ReactNode} from 'react';
import {Container} from './Container';
import {Ornament} from './Ornament';
import type {CoverImage} from './WorkTile';

export interface OneShotPageTemplateProps {
  title: string;
  teaserShort?: string | null;
  description: string;
  cover: CoverImage;
  pillLabel: 'ROMAN' | 'RECUEIL' | 'GUIDE';
  purchaseSlot: ReactNode;
  relatedSlot?: ReactNode;
}

export function OneShotPageTemplate({
  title,
  teaserShort,
  description,
  cover,
  pillLabel,
  purchaseSlot,
  relatedSlot,
}: OneShotPageTemplateProps) {
  return (
    <>
      <section
        style={{
          position: 'relative',
          minHeight: '380px',
          padding: 'var(--bsk-space-12) var(--bsk-space-5)',
          background: 'var(--bsk-bg-gradient-warm)',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontFamily: 'var(--bsk-font-sans)',
            fontSize: 'var(--bsk-text-xs)',
            letterSpacing: 'var(--bsk-tracking-widest)',
            textTransform: 'uppercase',
            color: 'var(--bsk-bg-base)',
            background: 'var(--bsk-accent-gold)',
            padding: 'var(--bsk-space-1) var(--bsk-space-3)',
            marginBottom: 'var(--bsk-space-5)',
          }}
        >
          {pillLabel} INDÉPENDANT
        </span>
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
        {teaserShort && (
          <p
            style={{
              fontFamily: 'var(--bsk-font-serif)',
              fontStyle: 'italic',
              fontSize: 'var(--bsk-text-md)',
              color: 'var(--bsk-fg-secondary)',
              maxWidth: 'var(--bsk-width-reading)',
              margin: '0 auto',
              whiteSpace: 'pre-line',
            }}
          >
            {teaserShort}
          </p>
        )}
      </section>

      <Container width="content">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '45fr 55fr',
            gap: 'var(--bsk-space-10)',
            alignItems: 'start',
            padding: 'var(--bsk-space-10) 0',
          }}
        >
          <img
            src={cover.url}
            alt={cover.altText}
            width={cover.width}
            height={cover.height}
            style={{
              width: '100%',
              height: 'auto',
              boxShadow: 'var(--bsk-shadow-cover)',
              borderRadius: '2px',
            }}
          />
          <div>{purchaseSlot}</div>
        </div>
      </Container>

      <Container width="content">
        <section
          style={{
            padding: 'var(--bsk-space-10) 0',
            textAlign: 'center',
          }}
        >
          <Ornament />
          <h2
            style={{
              fontFamily: 'var(--bsk-font-serif)',
              fontSize: 'var(--bsk-text-xl)',
              color: 'var(--bsk-fg-primary)',
              margin: 'var(--bsk-space-5) 0',
            }}
          >
            L'atmosphère du livre
          </h2>
        </section>
      </Container>

      <Container width="reading">
        <section
          style={{
            padding: '0 0 var(--bsk-space-12)',
            fontFamily: 'var(--bsk-font-serif)',
            fontSize: 'var(--bsk-text-md)',
            lineHeight: 1.7,
            color: 'var(--bsk-fg-primary)',
            whiteSpace: 'pre-line',
          }}
        >
          {description}
        </section>
      </Container>

      {relatedSlot && <Container width="content">{relatedSlot}</Container>}
    </>
  );
}
