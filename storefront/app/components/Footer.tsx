import {Link} from 'react-router';
import {Logo} from '~/components/Logo';
import {FOOTER_NAV} from '~/data/nav';
import '~/styles/footer.css';

const ALL_LINKS = [...FOOTER_NAV.boutique, ...FOOTER_NAV.maison, ...FOOTER_NAV.info];

export function Footer({asPanel = false}: {asPanel?: boolean}) {
  return (
    <footer className={`bsk-footer${asPanel ? ' bsk-footer--panel' : ''}`}>
      <div className="bsk-footer-bg" aria-hidden="true" />
      <div className="bsk-footer-halo bsk-halo" aria-hidden="true" />
      <div className="bsk-footer-inner">
        <div className="bsk-footer-emblem">
          <Logo height={68} />
        </div>
        <div className="bsk-footer-wordmark">BILSKIRNIR</div>
        <span className="bsk-kicker">Restez dans l'univers</span>
        <p className="bsk-footer-big">Reçois les annonces<br />de sortie.</p>
        <form className="bsk-footer-form bsk-mailrow" action="/api/newsletter" method="post">
          <label htmlFor="footer-email" className="visually-hidden">Adresse email</label>
          <input id="footer-email" name="email" type="email" required placeholder="votre@email.fr" />
          <button type="submit" className="bsk-btn bsk-btn--cream">S'inscrire</button>
        </form>
        <nav className="bsk-footer-links" aria-label="Liens de pied de page">
          {ALL_LINKS.map((l) => (
            <Link key={l.href} to={l.href}>{l.label}</Link>
          ))}
        </nav>
        <div className="bsk-footer-base">
          <small>© Bilskirnir — Éditeur indépendant</small>
          <span>
            <a href="https://tiktok.com/@bilskirnir" rel="me noreferrer" target="_blank">TikTok</a>
            {' · '}
            <a href="https://instagram.com/bilskirnir" rel="me noreferrer" target="_blank">Instagram</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
