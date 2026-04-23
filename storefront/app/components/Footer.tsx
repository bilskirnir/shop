import {Link} from 'react-router';
import {FOOTER_NAV} from '~/data/nav';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        background: 'var(--bsk-bg-raised)',
        borderTop: '1px solid var(--bsk-border-subtle)',
        marginTop: 'var(--bsk-space-16)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--bsk-width-full)',
          margin: '0 auto',
          padding: 'var(--bsk-space-10) var(--bsk-space-6)',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 'var(--bsk-space-8)',
        }}
      >
        <NewsletterBlock />
        <FooterColumn title="Boutique" items={FOOTER_NAV.boutique} />
        <FooterColumn title="La maison" items={FOOTER_NAV.maison} />
        <FooterColumn title="Info" items={FOOTER_NAV.info} />
      </div>
      <div
        style={{
          borderTop: '1px solid var(--bsk-border-subtle)',
          padding: 'var(--bsk-space-5) var(--bsk-space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--bsk-fg-muted)',
          fontSize: 'var(--bsk-text-xs)',
          maxWidth: 'var(--bsk-width-full)',
          margin: '0 auto',
        }}
      >
        <small>© {year} Bilskirnir. Éditeur indépendant.</small>
        <div style={{display: 'flex', gap: 'var(--bsk-space-4)'}}>
          <a href="https://tiktok.com/@bilskirnir" rel="me noreferrer" target="_blank">
            TikTok
          </a>
          <a href="https://instagram.com/bilskirnir" rel="me noreferrer" target="_blank">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}

function NewsletterBlock() {
  return (
    <div>
      <h3
        style={{
          fontFamily: 'var(--bsk-font-serif)',
          fontSize: 'var(--bsk-text-xl)',
          color: 'var(--bsk-fg-primary)',
          marginBottom: 'var(--bsk-space-2)',
        }}
      >
        Restez dans l’univers
      </h3>
      <p
        style={{
          color: 'var(--bsk-fg-secondary)',
          marginBottom: 'var(--bsk-space-4)',
          maxWidth: '28rem',
        }}
      >
        Annonces de sortie, précommandes, behind-the-scenes. Pas de spam. Pas de tracking.
      </p>
      <form
        style={{display: 'flex', gap: 'var(--bsk-space-2)', maxWidth: '28rem'}}
        action="/api/newsletter"
        method="post"
      >
        <label htmlFor="newsletter-email" className="visually-hidden">
          Adresse email
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="votre@email.fr"
          style={{
            flex: 1,
            background: 'var(--bsk-bg-base)',
            color: 'var(--bsk-fg-primary)',
            border: '1px solid var(--bsk-border-subtle)',
            padding: 'var(--bsk-space-3) var(--bsk-space-4)',
          }}
        />
        <button
          type="submit"
          style={{
            background: 'var(--bsk-accent-gold)',
            color: 'var(--bsk-bg-base)',
            border: 'none',
            padding: 'var(--bsk-space-3) var(--bsk-space-5)',
            fontFamily: 'var(--bsk-font-sans)',
            fontSize: 'var(--bsk-text-xs)',
            letterSpacing: 'var(--bsk-tracking-widest)',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontWeight: 'var(--bsk-weight-semibold)',
          }}
        >
          S’inscrire
        </button>
      </form>
    </div>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: {label: string; href: string}[];
}) {
  return (
    <div>
      <h4
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
      </h4>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          display: 'grid',
          gap: 'var(--bsk-space-3)',
        }}
      >
        {items.map((item) => (
          <li key={item.href}>
            <Link
              to={item.href}
              style={{color: 'var(--bsk-fg-secondary)', fontSize: 'var(--bsk-text-sm)'}}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
