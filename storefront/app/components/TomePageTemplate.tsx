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
      <Container width="reading">
        <Breadcrumbs items={breadcrumbs} />
      </Container>

      <section className="fiche-hero">
        <div className="fiche-hero-bg" />
        <ProductGallery images={images} alt={cover.altText} />
      </section>

      <Container width="reading">
        <div className="fiche-rise" style={{padding: 'var(--bsk-space-2) 0 var(--bsk-space-6)'}}>
          {pill ? (
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
              {pill}
            </span>
          ) : null}
          {tomeLabel ? (
            <div
              style={{
                fontSize: 'var(--bsk-text-xs)',
                letterSpacing: 'var(--bsk-tracking-widest)',
                textTransform: 'uppercase',
                color: 'var(--bsk-fg-secondary)',
                margin: '16px 0 6px',
              }}
            >
              {tomeLabel}
            </div>
          ) : null}
          <h1
            style={{
              fontFamily: 'var(--bsk-font-display)',
              fontWeight: 800,
              fontSize: 'var(--bsk-text-2xl)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: 'var(--bsk-fg-primary)',
            }}
          >
            {title}
          </h1>
          {teaserShort ? (
            <blockquote
              style={{
                margin: '18px 0',
                padding: '12px 16px',
                borderLeft: '2px solid var(--bsk-accent-gold)',
                fontStyle: 'italic',
                fontSize: 'var(--bsk-text-base)',
                lineHeight: 1.5,
                color: '#ddd2b8',
                background: 'rgba(216,166,87,.05)',
                whiteSpace: 'pre-line',
              }}
            >
              {teaserShort}
            </blockquote>
          ) : null}
          <div>{purchaseSlot}</div>
        </div>

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

      <Container width="reading">
        <Link
          to={`/collections/${universe.handle}`}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            minHeight: '170px',
            borderRadius: '16px',
            overflow: 'hidden',
            padding: '18px',
            textDecoration: 'none',
            background: 'radial-gradient(75% 85% at 60% 18%, var(--bsk-uni), #0c1a17)',
          }}
        >
          <span
            aria-hidden="true"
            style={{position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.82), transparent 70%)'}}
          />
          <span style={{position: 'relative', zIndex: 2}}>
            {universeKicker ? (
              <span style={{display: 'block', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--bsk-accent-gold)'}}>
                {universeKicker}
              </span>
            ) : null}
            <span style={{display: 'block', fontFamily: 'var(--bsk-font-display)', fontWeight: 700, fontSize: 'var(--bsk-text-lg)', color: 'var(--bsk-fg-primary)', margin: '4px 0 10px'}}>
              Dans l'univers de {universe.title}
            </span>
            <span style={{display: 'inline-block', fontSize: '12px', color: 'var(--bsk-fg-primary)', border: '1px solid rgba(236,228,211,.3)', borderRadius: '999px', padding: '7px 14px'}}>
              Explorer l'univers →
            </span>
          </span>
        </Link>

        <TechSpecs rows={techRows} />
      </Container>

      {relatedSlot ? <Container width="content">{relatedSlot}</Container> : null}
    </>
  );
}
