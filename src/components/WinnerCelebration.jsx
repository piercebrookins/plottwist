const COLORS = ["#ffd166", "#63d7ff", "#ff6fa8", "#88f08d", "#a188ff", "#ff9f5d"];

const CONFETTI = Array.from({ length: 42 }, (_, idx) => ({
  id: idx,
  left: `${(idx / 42) * 100}%`,
  delay: `${(idx % 7) * 0.08}s`,
  duration: `${2.4 + (idx % 5) * 0.26}s`,
  rotation: `${(idx % 2 === 0 ? 1 : -1) * (16 + (idx % 6) * 8)}deg`,
  color: COLORS[idx % COLORS.length],
}));

export const WinnerCelebration = ({ winnerName }) => {
  if (!winnerName) return null;

  return (
    <section className="winner-celebration" aria-label={`Winner is ${winnerName}`}>
      <div className="winner-popup" role="status" aria-live="polite">
        <span className="winner-popup__kicker">Winner is...</span>
        <strong className="winner-popup__name">{winnerName}</strong>
      </div>
      <div className="winner-confetti" aria-hidden="true">
        {CONFETTI.map((piece) => (
          <span
            key={piece.id}
            className="confetti-piece"
            style={{
              "--left": piece.left,
              "--delay": piece.delay,
              "--duration": piece.duration,
              "--rotation": piece.rotation,
              "--color": piece.color,
            }}
          />
        ))}
      </div>
    </section>
  );
};
