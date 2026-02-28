import { useEffect, useState } from "react";
import { Screen } from "./Layout";

export const PromptView = ({ round, onCountdownDone }) => {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => setCount((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [round.id]);

  useEffect(() => {
    if (count < 0) onCountdownDone();
  }, [count, onCountdownDone]);

  const displayCount = count >= 0 ? count : "GO";
  const progress = `${(((3 - Math.max(count, 0)) / 3) * 100).toFixed(2)}%`;

  return (
    <Screen
      className="phase-screen phase-screen--prompt"
      title={`Round ${round.roundNumber}`}
      subtitle={round.prompt}
      actions={<p className="prompt-call">{count >= 0 ? count : "WRITE YOUR ANSWER!"}</p>}
    >
      <article className="card prompt-stage">
        <div className={`prompt-ring ${count <= 1 ? "is-urgent" : ""}`} style={{ "--ring-progress": progress }}>
          <span className="prompt-ring__value">{displayCount}</span>
        </div>
        <p className="prompt-stage__hint">Get ready. The writing phase starts in a heartbeat.</p>
      </article>
    </Screen>
  );
};
