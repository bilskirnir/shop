import {computeRewards, type RewardsConfig} from '~/lib/rewards';

function Icon({kind}: {kind: 'shipping' | 'gift'}) {
  return kind === 'shipping' ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="6.5" width="12" height="9" rx="1.2" />
      <path d="M13.5 9.5h4l3 3v3h-7z" />
      <circle cx="6" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9h14v11H5z" />
      <path d="M3.5 9h17v3h-17z" />
      <path d="M12 9v11" />
    </svg>
  );
}

export function RewardsBar({subtotal, config}: {subtotal: number; config: RewardsConfig}) {
  const {fillPct, milestones, message} = computeRewards(subtotal, config);
  return (
    <div className="bsk-rw">
      <p className="bsk-rw-msg">{message}</p>
      <div className="bsk-rw-track">
        <div className="bsk-rw-fill" style={{width: `${fillPct}%`}} />
        {milestones.map((m) => (
          <div
            key={`${m.kind}-${m.threshold}`}
            className={`bsk-rw-milestone${m.reached ? ' is-reached' : ''}`}
            style={{left: `${m.leftPct}%`}}
          >
            <div className="bsk-rw-dot">
              <Icon kind={m.kind} />
            </div>
            <div className="bsk-rw-lbl">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
