import {useState} from 'react';

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

  const updateActivated = (next: boolean) => {
    setActivated(next);
    onChange({activated: next, name});
  };
  const updateName = (next: string) => {
    setName(next);
    onChange({activated, name: next});
  };

  return (
    <div
      style={{
        border: '1px solid var(--bsk-border-subtle)',
        borderRadius: '14px',
        padding: '14px 16px',
        margin: 'var(--bsk-space-5) 0',
        background: 'var(--bsk-bg-raised)',
      }}
    >
      <label style={{display: 'flex', alignItems: 'center', gap: '11px', cursor: 'pointer'}}>
        <input
          type="checkbox"
          checked={activated}
          onChange={(e) => updateActivated(e.target.checked)}
          style={{
            width: 20,
            height: 20,
            accentColor: 'var(--bsk-accent-gold)',
            flex: '0 0 auto',
            cursor: 'pointer',
          }}
        />
        <span style={{fontSize: '14.5px', color: 'var(--bsk-fg-primary)'}}>
          <b style={{fontFamily: 'var(--bsk-font-display)'}}>Dédicacer ce livre</b>{' '}
          <span style={{fontSize: '11px', color: 'var(--bsk-accent-gold)', letterSpacing: '0.06em'}}>· offert</span>
        </span>
      </label>
      {activated ? (
        <input
          type="text"
          value={name}
          onChange={(e) => updateName(e.target.value)}
          placeholder="À qui dédicacer ? (ex. : Pour Marie)"
          style={{
            display: 'block',
            width: '100%',
            marginTop: '14px',
            background: 'rgba(0,0,0,.3)',
            border: '1px solid var(--bsk-border-subtle)',
            borderRadius: '9px',
            padding: '11px 13px',
            color: 'var(--bsk-fg-primary)',
            fontFamily: 'var(--bsk-font-sans)',
            fontSize: '14px',
          }}
        />
      ) : null}
    </div>
  );
}
