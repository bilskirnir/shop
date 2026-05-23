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
  const atmosphereText = ambiance ?? null;

  return (
    <>
      <section className="fiche-hero">
        <div className="fiche-hero-bg" />
        <div className="fiche-fog" aria-hidden="true" />
        <span className="fiche-emblem" aria-hidden="true">
          ✦
        </span>
        <Container width="content">
          <div className="fiche-hero-inner">
            <div className="fiche-hero-cover">
              <ProductGallery images={images} alt={cover.altText ?? title} />
            </div>
            <div className="fiche-buy fiche-rise">
              <span
                className="fiche-pill"
                style={{color: 'var(--bsk-accent-gold)', borderColor: 'var(--bsk-border-gold)'}}
              >
                {pillLabel} INDÉPENDANT
              </span>
              <h1 className="fiche-title">{title}</h1>
              {teaserShort ? <blockquote className="fiche-teaser">{teaserShort}</blockquote> : null}
              <div>{purchaseSlot}</div>
            </div>
          </div>
        </Container>
      </section>

      <div className="fiche-values-band">
        <Container width="content">
          <ValuesBadges />
        </Container>
      </div>

      <Container width="content">
        <section className="fiche-section fiche-section--read">
          <div className="fiche-k">Le récit</div>
          <div className="fiche-recit-body">{description}</div>
        </section>
      </Container>

      <Container width="content">
        <section className="fiche-univ-band">
          <span className="fiche-univ-bg" aria-hidden="true" />
          <span className="fiche-univ-scrim" aria-hidden="true" />
          <span className="fiche-univ-inner">
            <span className="fiche-univ-k">L'atmosphère du livre</span>
            {atmosphereText ? <span className="fiche-univ-name">{atmosphereText}</span> : null}
          </span>
        </section>
      </Container>

      <Container width="content">
        <section className="fiche-section fiche-section--tech">
          <TechSpecs rows={techRows} />
        </section>
      </Container>

      {relatedSlot ? (
        <Container width="content">
          <div className="fiche-related">{relatedSlot}</div>
        </Container>
      ) : null}
    </>
  );
}
