import type {FanCover} from '~/lib/universeFan';

export function CoverFan({covers}: {covers: FanCover[]}) {
  const shown = covers.slice(0, 3);
  if (shown.length === 0) return null;
  return (
    <div className={`uni-fan uni-fan--${shown.length}`} aria-hidden="true">
      {shown.map((c, i) => (
        <img key={i} className="uni-fan-cover" src={c.url} alt={c.altText} loading="lazy" />
      ))}
    </div>
  );
}
