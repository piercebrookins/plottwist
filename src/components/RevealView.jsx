import { Screen } from "./Layout";

export const RevealView = ({ session, round, onNext }) => {
  const active = round.submissions[round.revealCursor];
  if (!active) {
    return (
      <Screen
        title="Reveal complete"
        subtitle="Votes revealed, winner crowned, points locked."
        actions={<button onClick={onNext}>Show round scoreboard</button>}
      />
    );
  }

  return (
    <Screen
      title={`Reveal ${round.revealCursor + 1}/${round.submissions.length}`}
      subtitle={active.text}
      actions={<button onClick={onNext}>Next reveal</button>}
    >
      <article className="card reveal">
        <p>{active.generatedScene || "Generating..."}</p>
        <small>Status: {active.safetyStatus}</small>
      </article>
    </Screen>
  );
};
