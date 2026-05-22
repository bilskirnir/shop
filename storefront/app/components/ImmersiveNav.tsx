import {useState} from 'react';
import type {CSSProperties} from 'react';
import {Link} from 'react-router';
import {Logo} from '~/components/Logo';
import {MegaMenu, type UniverseItem} from '~/components/MegaMenu';
import {useAside} from '~/components/Aside';
import {useHideOnScroll} from '~/hooks/useHideOnScroll';

export function ImmersiveNav({
  universes,
  cartCount,
  variant = 'solid',
}: {
  universes: UniverseItem[];
  cartCount: number;
  variant?: 'overlay' | 'solid';
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const {open} = useAside();
  const {solid, hidden} = useHideOnScroll(typeof window !== 'undefined' ? window : null);
  const isOverlay = variant === 'overlay';
  const isSolid = !isOverlay && solid;

  const headerStyle: CSSProperties = {
    position: isOverlay ? 'fixed' : 'sticky',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 22px',
    transition: 'transform .35s var(--bsk-ease), background .3s, border-color .3s',
    transform: !isOverlay && hidden ? 'translateY(-104%)' : 'none',
    background: isOverlay
      ? 'linear-gradient(to bottom, rgba(14,15,19,.78), transparent)'
      : isSolid
        ? 'rgba(19,20,25,.94)'
        : 'linear-gradient(to bottom, rgba(14,15,19,.7), transparent)',
    backdropFilter: isSolid ? 'blur(12px)' : undefined,
    borderBottom: `1px solid ${isSolid ? 'var(--bsk-border-subtle)' : 'transparent'}`,
  };

  return (
    <header style={headerStyle}>
      <button
        type="button"
        aria-label="Menu des univers"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
        style={{display: 'flex', flexDirection: 'column', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 6}}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} style={{width: 20, height: 1.8, background: 'var(--bsk-fg-primary)', borderRadius: 2}} />
        ))}
      </button>

      <Link to="/" aria-label="Accueil Bilskirnir" style={{display: 'inline-flex'}}>
        <Logo height="clamp(44px, 5.5vw, 58px)" />
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
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
          style={{position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(14,15,19,.97)', borderBottom: '1px solid var(--bsk-border-subtle)'}}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <MegaMenu universes={universes} />
        </div>
      ) : null}
    </header>
  );
}
