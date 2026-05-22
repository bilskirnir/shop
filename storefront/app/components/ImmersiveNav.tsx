import {useState} from 'react';
import {Link} from 'react-router';
import {Logo} from '~/components/Logo';
import {MegaMenu, type UniverseItem} from '~/components/MegaMenu';
import {useAside} from '~/components/Aside';

export function ImmersiveNav({
  universes,
  cartCount,
}: {
  universes: UniverseItem[];
  cartCount: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const {open} = useAside();

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 22px',
        background: 'linear-gradient(to bottom, rgba(14,15,19,.78), transparent)',
      }}
    >
      <button
        type="button"
        aria-label="Menu des univers"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 6,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 20,
              height: 1.8,
              background: 'var(--bsk-fg-primary)',
              borderRadius: 2,
            }}
          />
        ))}
      </button>

      <Link to="/" aria-label="Accueil Bilskirnir" style={{display: 'inline-flex'}}>
        <Logo height={38} />
      </Link>

      <button
        type="button"
        onClick={() => open('cart')}
        aria-label={`Panier (${cartCount} article${cartCount > 1 ? 's' : ''})`}
        style={{
          position: 'relative',
          width: 38,
          height: 38,
          borderRadius: '50%',
          border: '1px solid var(--bsk-border-subtle)',
          background: 'transparent',
          color: 'var(--bsk-fg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="17"
          height="17"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 7h12l-1.1 12.2a1 1 0 0 1-1 .8H8.1a1 1 0 0 1-1-.8L6 7Z" />
          <path d="M9 7V6a3 3 0 0 1 6 0v1" />
        </svg>
        {cartCount > 0 ? (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              minWidth: 16,
              height: 16,
              borderRadius: 999,
              background: 'var(--bsk-accent-gold)',
              color: '#231603',
              fontSize: 9,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
            }}
          >
            {cartCount}
          </span>
        ) : null}
      </button>

      {menuOpen ? (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(14,15,19,.97)',
            borderBottom: '1px solid var(--bsk-border-subtle)',
          }}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <MegaMenu universes={universes} />
        </div>
      ) : null}
    </header>
  );
}
