import {useState, useEffect} from 'react';

export interface DedicaceState {
  activated: boolean;
  name: string;
}

export interface DedicaceFieldProps {
  onChange: (state: DedicaceState) => void;
}

export function DedicaceField({onChange}: DedicaceFieldProps) {
  const [activated, setActivated] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    onChange({activated, name});
  }, [activated, name, onChange]);

  return (
    <div
      style={{
        padding: 'var(--bsk-space-4) 0',
        borderTop: '1px solid var(--bsk-border-subtle)',
        borderBottom: '1px solid var(--bsk-border-subtle)',
        margin: 'var(--bsk-space-5) 0',
      }}
    >
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--bsk-space-3)',
          fontFamily: 'var(--bsk-font-sans)',
          fontSize: 'var(--bsk-text-sm)',
          color: 'var(--bsk-fg-primary)',
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={activated}
          onChange={(e) => setActivated(e.target.checked)}
        />
        <span>Dédicacer ce livre</span>
        <span
          style={{
            color: 'var(--bsk-fg-secondary)',
            fontSize: 'var(--bsk-text-xs)',
            letterSpacing: 'var(--bsk-tracking-wide)',
            textTransform: 'uppercase',
          }}
        >
          Gratuit
        </span>
      </label>
      {activated && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="À qui dédicacer ?"
          style={{
            display: 'block',
            width: '100%',
            padding: 'var(--bsk-space-3)',
            marginTop: 'var(--bsk-space-3)',
            background: 'var(--bsk-bg-raised)',
            border: '1px solid var(--bsk-border-subtle)',
            color: 'var(--bsk-fg-primary)',
            fontFamily: 'var(--bsk-font-sans)',
            fontSize: 'var(--bsk-text-sm)',
            borderRadius: '2px',
          }}
        />
      )}
    </div>
  );
}
