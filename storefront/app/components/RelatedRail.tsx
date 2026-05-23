import {Link} from 'react-router';
import {Cover, type CoverImage} from './Cover';

export interface RelatedItem {
  handle: string;
  title: string;
  cover: CoverImage | null;
  priceLabel: string | null;
}

export function RelatedRail({heading, items}: {heading: string; items: RelatedItem[]}) {
  if (items.length === 0) return null;
  return (
    <section
      className="bsk-related"
      style={{
        padding: 'var(--bsk-space-6) 0 var(--bsk-space-6) var(--bsk-space-5)',
        borderTop: '1px solid var(--bsk-border-subtle)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--bsk-font-display)',
          fontWeight: 'var(--bsk-weight-bold)',
          fontSize: 'var(--bsk-text-md)',
          color: 'var(--bsk-fg-primary)',
          marginBottom: 'var(--bsk-space-4)',
        }}
      >
        {heading}
      </h2>
      <div
        className="bsk-related-row"
        style={{display: 'flex', gap: 'var(--bsk-space-4)', overflowX: 'auto', paddingBottom: 'var(--bsk-space-2)'}}
      >
        {items.map((it) => (
          <Link
            key={it.handle}
            to={`/products/${it.handle}`}
            className="bsk-related-card"
            style={{textDecoration: 'none', color: 'inherit', textAlign: 'center'}}
          >
            <div className="bsk-related-cover">
              <Cover image={it.cover} />
            </div>
            <div
              style={{
                fontFamily: 'var(--bsk-font-display)',
                fontSize: 'var(--bsk-text-sm)',
                color: 'var(--bsk-fg-primary)',
                marginTop: 'var(--bsk-space-3)',
                lineHeight: 1.2,
              }}
            >
              {it.title}
            </div>
            {it.priceLabel ? (
              <div style={{fontSize: 'var(--bsk-text-xs)', color: 'var(--bsk-accent-gold)', marginTop: '2px'}}>
                {it.priceLabel}
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
