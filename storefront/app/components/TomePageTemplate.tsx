import {Link} from 'react-router';
import type {ReactNode} from 'react';
import {Container} from './Container';
import {ProductGallery} from './ProductGallery';
import {ValuesBadges} from './ValuesBadges';
import {TechSpecs, type TechRow} from './TechSpecs';
import type {CoverImage} from './Cover';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface TomePageTemplateProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  pill?: string | null;
  tomeLabel?: string | null;
  teaserShort?: string | null;
  description: string;
  cover: CoverImage;
  galleryImages?: CoverImage[];
  universe: {handle: string; title: string};
  universeKicker?: string | null;
  techRows?: TechRow[];
  purchaseSlot: ReactNode;
  relatedSlot?: ReactNode;
}

function Breadcrumbs({items}: {items: BreadcrumbItem[]}) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      style={{
        fontFamily: 'var(--bsk-font-sans)',
        fontSize: 'var(--bsk-text-xs)',
        color: 'var(--bsk-fg-secondary)',
        padding: 'var(--bsk-space-4) 0 0',
      }}
    >
      {items.map((item, i) => (
        <span key={i}>
          {item.href ? (
            <Link to={item.href} style={{color: 'var(--bsk-fg-secondary)', textDecoration: 'none'}}>
              {item.label}
            </Link>
          ) : (
            <span style={{color: 'var(--bsk-fg-primary)'}}>{item.label}</span>
          )}
          {i < items.length - 1 ? <span style={{margin: '0 var(--bsk-space-2)'}}>›</span> : null}
        </span>
      ))}
    </nav>
  );
}

export function TomePageTemplate({
  breadcrumbs,
  title,
  pill,
  tomeLabel,
  teaserShort,
  description,
  cover,
  galleryImages,
  universe,
  universeKicker,
  techRows = [],
  purchaseSlot,
  relatedSlot,
}: TomePageTemplateProps) {
  const images = (galleryImages && galleryImages.length > 0 ? galleryImages : [cover]).filter(
    (c) => c.url,
  );

  return (
    <>
      <section className="fiche-hero">
        <div className="fiche-hero-bg" />
        <div className="fiche-fog" aria-hidden="true" />
        <span className="fiche-emblem" aria-hidden="true">
          ✦
        </span>
        <Container width="content">
          <Breadcrumbs items={breadcrumbs} />
          <div className="fiche-hero-inner">
            <div className="fiche-hero-cover">
              <ProductGallery images={images} alt={cover.altText ?? title} />
            </div>
            <div className="fiche-buy fiche-rise">
              {pill ? <span className="fiche-pill">{pill}</span> : null}
              {tomeLabel ? <div className="fiche-tomelabel">{tomeLabel}</div> : null}
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
        <Link to={`/collections/${universe.handle}`} className="fiche-univ-band">
          <span className="fiche-univ-bg" aria-hidden="true" />
          <span className="fiche-univ-scrim" aria-hidden="true" />
          <span className="fiche-univ-inner">
            {universeKicker ? <span className="fiche-univ-k">{universeKicker}</span> : null}
            <span className="fiche-univ-name">Dans l'univers de {universe.title}</span>
            <span className="fiche-univ-cta">Explorer l'univers →</span>
          </span>
        </Link>
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
