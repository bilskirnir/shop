import {useState} from 'react';
import {Link} from 'react-router';
import {MegaMenu, type UniverseItem} from './MegaMenu';
import {PRIMARY_NAV} from '~/data/nav';

type HeaderProps = {
  universes: UniverseItem[];
  cartCount: number;
};

export function Header({universes, cartCount}: HeaderProps) {
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bsk-bg-base)',
        borderBottom: '1px solid var(--bsk-border-subtle)',
      }}
      onMouseLeave={() => setMegaMenuOpen(false)}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 'var(--bsk-space-6)',
          padding: 'var(--bsk-space-4) var(--bsk-space-6)',
          maxWidth: 'var(--bsk-width-full)',
          margin: '0 auto',
        }}
      >
        <nav aria-label="Navigation principale">
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              gap: 'var(--bsk-space-6)',
              fontFamily: 'var(--bsk-font-sans)',
              fontSize: 'var(--bsk-text-sm)',
              letterSpacing: 'var(--bsk-tracking-wide)',
              textTransform: 'uppercase',
            }}
          >
            {PRIMARY_NAV.map((item) =>
              item.hasMegaMenu ? (
                <li key={item.label}>
                  <button
                    type="button"
                    aria-expanded={megaMenuOpen}
                    aria-haspopup="true"
                    onClick={() => setMegaMenuOpen(true)}
                    onMouseEnter={() => setMegaMenuOpen(true)}
                    onFocus={() => setMegaMenuOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: 'var(--bsk-fg-secondary)',
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      letterSpacing: 'inherit',
                      textTransform: 'inherit',
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              ) : (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    style={{color: 'var(--bsk-fg-secondary)'}}
                    onMouseEnter={() => setMegaMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <Link
          to="/"
          style={{
            fontFamily: 'var(--bsk-font-serif)',
            fontSize: 'var(--bsk-text-lg)',
            letterSpacing: 'var(--bsk-tracking-widest)',
            color: 'var(--bsk-accent-gold)',
            textTransform: 'uppercase',
            fontWeight: 'var(--bsk-weight-semibold)',
          }}
        >
          Bilskirnir
        </Link>

        <div
          style={{
            display: 'flex',
            gap: 'var(--bsk-space-5)',
            justifyContent: 'flex-end',
            alignItems: 'center',
            fontFamily: 'var(--bsk-font-sans)',
            fontSize: 'var(--bsk-text-sm)',
          }}
        >
          <Link to="/search" aria-label="Rechercher" style={{color: 'var(--bsk-fg-secondary)'}}>
            🔍
          </Link>
          <Link to="/account" style={{color: 'var(--bsk-fg-secondary)'}}>
            Compte
          </Link>
          <Link
            to="/cart"
            aria-label={`Panier (${cartCount} article${cartCount > 1 ? 's' : ''})`}
            style={{color: 'var(--bsk-accent-gold)', fontWeight: 'var(--bsk-weight-medium)'}}
          >
            Panier ({cartCount})
          </Link>
        </div>
      </div>

      {megaMenuOpen ? <MegaMenu universes={universes} /> : null}
    </header>
  );
}
