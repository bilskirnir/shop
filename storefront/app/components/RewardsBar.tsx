import {computeRewards, type RewardsConfig} from '~/lib/rewards';

export function RewardsBar({subtotal, config}: {subtotal: number; config: RewardsConfig}) {
  const {fillPct, message, allUnlocked} = computeRewards(subtotal, config);
  return (
    <div className="bsk-rw">
      <p className="bsk-rw-msg">{message}</p>
      <div className="bsk-rw-track">
        <div className="bsk-rw-fill" style={{width: `${fillPct}%`}} />
      </div>
      <span className="bsk-rw-pct">{allUnlocked ? '✓' : `${Math.round(fillPct)}%`}</span>
    </div>
  );
}
