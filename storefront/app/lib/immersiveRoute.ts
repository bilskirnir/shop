/** Forme minimale d'un match react-router (on ne lit que `handle`). */
export interface RouteMatchLike {
  handle?: unknown;
}

/** True si une des routes actives déclare `handle.immersive === true`. */
export function isImmersiveRoute(
  matches: ReadonlyArray<RouteMatchLike> | undefined | null,
): boolean {
  if (!matches) return false;
  return matches.some(
    (m) =>
      !!m.handle &&
      typeof m.handle === 'object' &&
      (m.handle as {immersive?: unknown}).immersive === true,
  );
}
