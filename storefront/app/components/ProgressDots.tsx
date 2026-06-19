import '~/styles/atoms.css';

export function ProgressDots({
  count,
  activeIndex,
  onJump,
}: {
  count: number;
  activeIndex: number;
  onJump?: (i: number) => void;
}) {
  return (
    <div className="bsk-dots" role="group" aria-label="Sagas">
      {Array.from({length: count}, (_, i) => (
        <button
          key={i}
          type="button"
          aria-current={i === activeIndex ? 'true' : 'false'}
          aria-label={`Aller à la saga ${i + 1}`}
          onClick={() => onJump?.(i)}
        />
      ))}
    </div>
  );
}
