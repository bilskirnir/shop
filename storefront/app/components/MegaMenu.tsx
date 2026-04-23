import {Link} from 'react-router';

export type UniverseItem = {
  id: string;
  handle: string;
  title: string;
  isStandalone: boolean;
};

export function MegaMenu({universes}: {universes: UniverseItem[]}) {
  const inProgress = universes.filter((u) => !u.isStandalone);
  const standalone = universes.filter((u) => u.isStandalone);

  if (universes.length === 0) {
    return (
      <div
        style={{
          padding: 'var(--bsk-space-8)',
          color: 'var(--bsk-fg-secondary)',
          fontStyle: 'italic',
        }}
      >
        Les univers arrivent bientôt.
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bsk-bg-overlay)',
        borderTop: '1px solid var(--bsk-border-subtle)',
        padding: 'var(--bsk-space-8) var(--bsk-space-6)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 'var(--bsk-space-8)',
        maxWidth: 'var(--bsk-width-full)',
        margin: '0 auto',
      }}
    >
      <MegaMenuSection title="Univers en cours" items={inProgress} />
      <MegaMenuSection title="Romans indépendants" items={standalone} />
      <MegaMenuSection title="À paraître" items={[]} emptyLabel="Aucune annonce" />
    </div>
  );
}

function MegaMenuSection({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: UniverseItem[];
  emptyLabel?: string;
}) {
  return (
    <section aria-label={title}>
      <h3
        style={{
          fontFamily: 'var(--bsk-font-sans)',
          fontSize: 'var(--bsk-text-xs)',
          letterSpacing: 'var(--bsk-tracking-widest)',
          textTransform: 'uppercase',
          color: 'var(--bsk-accent-gold)',
          marginBottom: 'var(--bsk-space-4)',
        }}
      >
        {title}
      </h3>
      {items.length === 0 && emptyLabel ? (
        <p style={{color: 'var(--bsk-fg-muted)', fontStyle: 'italic'}}>
          {emptyLabel}
        </p>
      ) : (
        <ul style={{listStyle: 'none', padding: 0, display: 'grid', gap: 'var(--bsk-space-3)'}}>
          {items.map((u) => (
            <li key={u.id}>
              <Link
                to={`/collections/${u.handle}`}
                style={{
                  fontFamily: 'var(--bsk-font-serif)',
                  fontSize: 'var(--bsk-text-md)',
                  color: 'var(--bsk-fg-primary)',
                  transition: 'color var(--bsk-duration-fast) var(--bsk-ease)',
                }}
              >
                {u.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
