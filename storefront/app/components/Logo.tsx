import emblem from '~/assets/bilskirnir-emblem.png';

/**
 * Emblème « Bilskirnir — Le Hall de Force ». L'asset est monochrome noir :
 * on le rend en blanc via filtre pour le fond sombre.
 * (À terme, remplacer par un SVG `currentColor` propre.)
 */
export function Logo({
  height = 40,
  white = true,
}: {
  /** Hauteur CSS : nombre (px) ou chaîne (ex. `clamp(...)` pour du responsive). */
  height?: number | string;
  white?: boolean;
}) {
  return (
    <img
      src={emblem}
      alt="Bilskirnir — Le Hall de Force"
      style={{
        height,
        width: 'auto',
        display: 'block',
        filter: white ? 'brightness(0) invert(1)' : undefined,
      }}
    />
  );
}
