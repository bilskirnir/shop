export interface CoverImage {
  url: string;
  altText?: string | null;
  width?: number;
  height?: number;
}

/**
 * Couverture de livre. Les fichiers fournis sont des mock-ups 3D détourés
 * (fond transparent) : on n'encadre JAMAIS dans une boîte avec fond — on
 * applique une ombre `drop-shadow` qui suit la forme réelle du livre.
 * `bleed` fait légèrement déborder l'image pour combler la marge transparente
 * dans les grilles.
 */
export function Cover({
  image,
  bleed = false,
  className,
}: {
  image: CoverImage | null | undefined;
  bleed?: boolean;
  className?: string;
}) {
  if (!image?.url) return null;
  return (
    <img
      className={className}
      src={image.url}
      alt={image.altText ?? ''}
      width={image.width}
      height={image.height}
      loading="lazy"
      style={{
        display: 'block',
        height: 'auto',
        ...(bleed ? {width: '114%', margin: '0 -7%'} : {width: '100%'}),
        filter: 'var(--bsk-cover-shadow)',
      }}
    />
  );
}
