export function Ornament({count = 1}: {count?: number}) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--bsk-space-4)',
        padding: 'var(--bsk-space-6) 0',
        color: 'var(--bsk-accent-gold)',
      }}
    >
      <span style={{flex: 1, height: 1, background: 'var(--bsk-border-subtle)'}} />
      <span style={{fontSize: 'var(--bsk-text-md)', opacity: 0.8, letterSpacing: '0.4em'}}>
        {Array.from({length: count}, () => '✦').join(' ')}
      </span>
      <span style={{flex: 1, height: 1, background: 'var(--bsk-border-subtle)'}} />
    </div>
  );
}
