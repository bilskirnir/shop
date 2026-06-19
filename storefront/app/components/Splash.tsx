import {Logo} from '~/components/Logo';

/**
 * Loader court au chargement : couvre l'écran avec l'emblème Bilskirnir et
 * s'efface TOUT SEUL en CSS (~1,25 s, voir le CSS critique dans `root.tsx`).
 * Masque le FOUC du premier paint (CSS injecté tardivement en dev, images,
 * polices). Aucun JS requis → ne peut jamais rester bloqué.
 */
export function Splash() {
  return (
    <div className="bsk-splash" aria-hidden="true">
      <div className="bsk-splash-mark">
        <Logo height={72} />
      </div>
    </div>
  );
}
