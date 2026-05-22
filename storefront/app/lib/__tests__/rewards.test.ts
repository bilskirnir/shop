import {describe, it, expect} from 'vitest';
import {parseRewardsConfig, computeRewards, DEFAULT_REWARDS} from '../rewards';

describe('parseRewardsConfig', () => {
  it('défauts si metafields absents', () => {
    expect(parseRewardsConfig(null, null)).toEqual(DEFAULT_REWARDS);
  });
  it('parse seuil livraison + paliers cadeaux JSON', () => {
    const c = parseRewardsConfig('49', '[{"seuil":75,"label":"un marque-page"}]');
    expect(c.freeShippingThreshold).toBe(49);
    expect(c.giftTiers).toEqual([{threshold: 75, label: 'un marque-page'}]);
  });
  it('JSON invalide → défaut paliers', () => {
    const c = parseRewardsConfig('40', 'pas-du-json');
    expect(c.freeShippingThreshold).toBe(40);
    expect(c.giftTiers).toEqual(DEFAULT_REWARDS.giftTiers);
  });
});

describe('computeRewards', () => {
  const config = {freeShippingThreshold: 49, giftTiers: [{threshold: 75, label: 'un marque-page'}]};

  it('sous le 1er seuil : message livraison + remplissage partiel', () => {
    const r = computeRewards(30, config);
    expect(r.message).toMatch(/livraison offerte/i);
    expect(r.message).toContain('19,00');
    expect(r.fillPct).toBeCloseTo((30 / 75) * 100, 1);
    expect(r.milestones[0].reached).toBe(false);
    expect(r.allUnlocked).toBe(false);
  });
  it('entre les deux seuils : livraison ok, message cadeau', () => {
    const r = computeRewards(60, config);
    expect(r.milestones[0].reached).toBe(true);
    expect(r.milestones[1].reached).toBe(false);
    expect(r.message).toMatch(/marque-page/);
    expect(r.message).toContain('15,00');
  });
  it('tout débloqué', () => {
    const r = computeRewards(80, config);
    expect(r.allUnlocked).toBe(true);
    expect(r.fillPct).toBe(100);
    expect(r.milestones.every((m) => m.reached)).toBe(true);
    expect(r.message).toMatch(/débloqué|🎉/);
  });
  it('positionne les jalons selon le seuil max', () => {
    const r = computeRewards(0, config);
    expect(r.milestones[0].leftPct).toBeCloseTo((49 / 75) * 100, 1);
    expect(r.milestones[1].leftPct).toBe(100);
  });
});
