/** PRNG déterministe (mulberry32) → réordonne sans muter la source. */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const a = items.slice();
  let s = seed >>> 0 || 1;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Index du jour (UTC) — graine stable sur 24 h, différente chaque jour. */
export function todaySeed(now: number = Date.now()): number {
  return Math.floor(now / 86_400_000);
}
