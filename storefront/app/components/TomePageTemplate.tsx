import {Link} from 'react-router';
import type {ReactNode} from 'react';
import {Container} from './Container';
import {Ornament} from './Ornament';
import type {CoverImage} from './WorkTile';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface TomePageTemplateProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  teaserShort?: string | null;
  description: string;
  cover: CoverImage;
  universe: {handle: string; title: string};
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
        letterSpacing: 'var(--bsk-tracking-wide)',
        textTransform: 'uppercase',
        color: 'var(--bsk-fg-secondary)',
        padding: 'var(--bsk-space-5) 0',
      }}
    >
      {items.map((item, i) => (
        <span key={i}>
          {item.href ? (
            <Link
              to={item.href}
              style={{
                color: 'var(--bsk-fg-secondary)',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          ) : (
            <span style={{color: 'var(--bsk-fg-primary)'}}>{item.label}</span>
          )}
          {i < items.length - 1 && (
            <span style={{margin: '0 var(--bsk-space-2)'}}> › </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function TomePageTemplate({
  breadcrumbs,
  title,
  teaserShort,
  description,
  cover,
  universe,
  purchaseSlot,
  relatedSlot,
}: TomePageTemplateProps) {
  return (
    <>
      <Container width="content">
        <Breadcrumbs items={breadcrumbs} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '55fr 45fr',
            gap: 'var(--bsk-space-10)',
            alignItems: 'start',
            padding: 'var(--bsk-space-6) 0 var(--bsk-space-12)',
          }}
        >
          <div>
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
          </div>
          <div>
            <h1
              style={{
                fontFamily: 'var(--bsk-font-serif)',
                fontSize: 'var(--bsk-text-2xl)',
                color: 'var(--bsk-fg-primary)',
                letterSpacing: 'var(--bsk-tracking-tight)',
                marginBottom: 'var(--bsk-space-5)',
              }}
            >
              {title}
            </h1>
            {teaserShort && (
              <blockquote
                style={{
                  fontFamily: 'var(--bsk-font-serif)',
                  fontStyle: 'italic',
                  fontSize: 'var(--bsk-text-md)',
                  color: 'var(--bsk-fg-secondary)',
                  borderLeft: '2px solid var(--bsk-accent-gold)',
                  padding: 'var(--bsk-space-3) var(--bsk-space-5)',
                  margin: '0 0 var(--bsk-space-6)',
                  whiteSpace: 'pre-line',
                }}
              >
                {teaserShort}
              </blockquote>
            )}
            <div>{purchaseSlot}</div>
          </div>
        </div>
      </Container>

      <Container width="reading">
        <section
          style={{
            padding: 'var(--bsk-space-10) 0',
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
            Dans l'univers de {universe.title}
          </h2>
          <Link
            to={`/collections/${universe.handle}`}
            style={{
              color: 'var(--bsk-accent-gold)',
              fontFamily: 'var(--bsk-font-sans)',
              fontSize: 'var(--bsk-text-sm)',
              letterSpacing: 'var(--bsk-tracking-wide)',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            Explorer l'univers complet →
          </Link>
        </section>
      </Container>

      {relatedSlot && <Container width="content">{relatedSlot}</Container>}
    </>
  );
}
