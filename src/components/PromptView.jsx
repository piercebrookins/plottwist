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

  return (
    <Screen
      title={`Round ${round.roundNumber}`}
      subtitle={round.prompt}
      actions={<p className="prompt-call">{count >= 0 ? count : "WRITE YOUR ANSWER!"}</p>}
    />
  );
};
