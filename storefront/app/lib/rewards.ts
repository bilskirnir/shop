export interface GiftTier {
  threshold: number;
  label: string;
}
export interface RewardsConfig {
  freeShippingThreshold: number;
  giftTiers: GiftTier[];
}

export const DEFAULT_REWARDS: RewardsConfig = {
  freeShippingThreshold: 49,
  giftTiers: [],
};

export interface RewardMilestone {
  label: string;
  kind: 'shipping' | 'gift';
  threshold: number;
  leftPct: number;
  reached: boolean;
}
export interface RewardsState {
  fillPct: number;
  milestones: RewardMilestone[];
  message: string;
  allUnlocked: boolean;
}

const EUR = new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'EUR'});

export function parseRewardsConfig(
  freeShippingRaw: string | null | undefined,
  giftTiersRaw: string | null | undefined,
): RewardsConfig {
  const freeShippingThreshold = (() => {
    const n = parseFloat(freeShippingRaw ?? '');
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_REWARDS.freeShippingThreshold;
  })();

  const giftTiers = (() => {
    if (!giftTiersRaw) return DEFAULT_REWARDS.giftTiers;
    try {
      const parsed = JSON.parse(giftTiersRaw) as Array<{seuil?: number; label?: string}>;
      const tiers = parsed
        .filter((t) => Number.isFinite(t.seuil) && (t.seuil ?? 0) > 0)
        .map((t) => ({threshold: t.seuil as number, label: t.label ?? 'un cadeau'}))
        .sort((a, b) => a.threshold - b.threshold);
      return tiers.length > 0 ? tiers : DEFAULT_REWARDS.giftTiers;
    } catch {
      return DEFAULT_REWARDS.giftTiers;
    }
  })();

  return {freeShippingThreshold, giftTiers};
}

export function computeRewards(subtotal: number, config: RewardsConfig): RewardsState {
  const all = [
    {kind: 'shipping' as const, threshold: config.freeShippingThreshold, label: 'Livraison offerte'},
    ...config.giftTiers.map((t) => ({kind: 'gift' as const, threshold: t.threshold, label: t.label})),
  ].sort((a, b) => a.threshold - b.threshold);

  const max = all.reduce((m, x) => Math.max(m, x.threshold), 0) || 1;
  const fillPct = Math.min(subtotal / max, 1) * 100;

  const milestones: RewardMilestone[] = all.map((m) => ({
    label: m.kind === 'shipping' ? 'Livraison offerte' : m.label,
    kind: m.kind,
    threshold: m.threshold,
    leftPct: Math.min((m.threshold / max) * 100, 100),
    reached: subtotal >= m.threshold,
  }));

  const nextUnreached = all.find((m) => subtotal < m.threshold);
  let message: string;
  if (!nextUnreached) {
    message = config.giftTiers.length > 0 ? 'Tout débloqué 🎉' : 'Livraison offerte ✓';
  } else if (nextUnreached.kind === 'shipping') {
    message = `Plus que ${EUR.format(nextUnreached.threshold - subtotal)} pour la livraison offerte 🚚`;
  } else {
    message = `Livraison offerte ✓ · plus que ${EUR.format(nextUnreached.threshold - subtotal)} pour ${nextUnreached.label} offert 🎁`;
  }

  return {fillPct, milestones, message, allUnlocked: !nextUnreached};
}
