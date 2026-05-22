export interface TechRow {
  label: string;
  value: string;
}

export function TechSpecs({rows}: {rows: TechRow[]}) {
  if (rows.length === 0) return null;
  return (
    <section style={{padding: 'var(--bsk-space-6) 0', borderTop: '1px solid var(--bsk-border-subtle)'}}>
      <h2
        style={{
          fontFamily: 'var(--bsk-font-display)',
          fontWeight: 'var(--bsk-weight-bold)',
          fontSize: 'var(--bsk-text-md)',
          color: 'var(--bsk-fg-primary)',
          marginBottom: 'var(--bsk-space-4)',
        }}
      >
        Fiche technique
      </h2>
      <dl style={{margin: 0}}>
        {rows.map((r) => (
          <div
            key={r.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: 'var(--bsk-space-2) 0',
              borderBottom: '1px solid rgba(236,228,211,.07)',
              fontSize: 'var(--bsk-text-sm)',
            }}
          >
            <dt style={{color: 'var(--bsk-fg-secondary)'}}>{r.label}</dt>
            <dd style={{margin: 0, color: 'var(--bsk-fg-primary)'}}>{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
