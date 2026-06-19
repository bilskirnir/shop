import {useEffect, useState} from 'react';
import type {CSSProperties} from 'react';
import {Link} from 'react-router';
import {Logo} from '~/components/Logo';
import type {UniverseItem} from '~/components/MegaMenu';
import {useAside} from '~/components/Aside';
import {useHideOnScroll} from '~/hooks/useHideOnScroll';
import {PRIMARY_NAV} from '~/data/nav';
import '~/styles/nav.css';

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
  const close = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const headerStyle: CSSProperties = {
    position: isOverlay ? 'fixed' : 'sticky',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 60,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: 'var(--bsk-space-4)',
    padding: '16px clamp(22px, 4vw, 48px)',
    transition: 'transform .35s var(--bsk-ease), background .3s, border-color .3s',
    transform: !isOverlay && hidden ? 'translateY(-104%)' : 'none',
    background: isOverlay
      ? 'linear-gradient(to bottom, rgba(14,15,19,.78), transparent)'
      : isSolid
        ? 'rgba(19,20,25,.94)'
        : 'linear-gradient(to bottom, rgba(14,15,19,.7), transparent)',
    backdropFilter: isSolid ? 'blur(12px)' : undefined,
    borderBottom: 'none',
  };

  const inProgressUniverses = universes.filter((u) => !u.isStandalone);

  return (
    <>
      <header style={headerStyle} data-variant={isOverlay ? 'overlay' : isSolid ? 'solid' : 'top'}>
        <div style={{justifySelf: 'start', display: 'flex', alignItems: 'center', gap: 'var(--bsk-space-4)', minWidth: 0}}>
          <button
            type="button"
            className="bsk-nav-burger"
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
          <Link to="/" aria-label="Accueil Bilskirnir" className="bsk-nav-wordmark">
            <Logo height={34} />
            BILSKIRNIR
          </Link>
        </div>

        <nav className="bsk-nav-links" aria-label="Navigation principale" style={{justifySelf: 'center'}}>
          {PRIMARY_NAV.map((item) => (
            <Link key={item.label} className="bsk-nav-link" to={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{justifySelf: 'end'}}>
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
                  background: 'var(--bsk-uni)',
                  color: 'var(--bsk-ink)',
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
        </div>
      </header>

      <div
        className={`bsk-nav-scrim${menuOpen ? ' is-open' : ''}`}
        aria-hidden="true"
        onClick={close}
      />
      <aside
        className={`bsk-nav-drawer${menuOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={menuOpen ? undefined : true}
      >
        <button type="button" className="bsk-nav-drawer-close" aria-label="Fermer le menu" onClick={close}>
          ×
        </button>
        <nav className="bsk-nav-drawer-links" aria-label="Navigation">
          {PRIMARY_NAV.map((item) => (
            <Link key={item.label} className="bsk-nav-drawer-link" to={item.href} onClick={close}>
              {item.label}
            </Link>
          ))}
        </nav>
        {inProgressUniverses.length > 0 ? (
          <>
            <div className="bsk-nav-drawer-k">Univers</div>
            <div className="bsk-nav-uni">
              {inProgressUniverses.map((u) => (
                <Link
                  key={u.id}
                  className="bsk-nav-uni-link"
                  to={`/collections/${u.handle}`}
                  onClick={close}
                >
                  {u.title}
                </Link>
              ))}
            </div>
          </>
        ) : null}
      </aside>
    </>
  );
}
