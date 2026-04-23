export function Ornament({count = 3}: {count?: number}) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      style={{
        textAlign: 'center',
        color: 'var(--bsk-accent-gold)',
        letterSpacing: '0.5em',
        fontSize: 'var(--bsk-text-sm)',
        padding: 'var(--bsk-space-6) 0',
      }}
    >
      {Array.from({length: count}, () => '◈').join(' ')}
    </div>
  );
}
