import type {CSSProperties} from 'react';

const HEX = /^#([0-9a-f]{6})$/i;

/**
 * Convertit une couleur maîtresse d'univers (metafield `couleur_theme`, hex)
 * en style inline portant les CSS vars d'accent, à poser sur le conteneur de
 * page. Retourne `{}` (donc défaut neutre doré des tokens) si absent/invalide.
 */
export function universeAccentStyle(
  color: string | null | undefined,
): CSSProperties {
  if (!color || !HEX.test(color)) return {};
  const hex = color.match(HEX)![1];
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return {
    ['--bsk-uni' as keyof CSSProperties]: color,
    ['--bsk-uni-soft' as keyof CSSProperties]: `rgba(${r},${g},${b},0.16)`,
  } as CSSProperties;
}

/**
 * Résout la couleur d'accent à appliquer : saga d'abord, puis univers, sinon
 * `null` (= accent crème neutre des tokens). Les valeurs non-hex sont ignorées.
 */
export function resolveAccentColor(
  sagaColor?: string | null,
  universeColor?: string | null,
): string | null {
  for (const c of [sagaColor, universeColor]) {
    if (c && HEX.test(c)) return c;
  }
  return null;
}
