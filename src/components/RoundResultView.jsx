import { playerName, voteCountBySubmission } from "../game/selectors";
import { Screen } from "./Layout";

export const RoundResultView = ({ session, round, onNextRound }) => {
  const votes = voteCountBySubmission(round);
  const sorted = [...round.submissions].sort(
    (a, b) => (votes.get(b.id) || 0) - (votes.get(a.id) || 0)
  );

  return (
    <Screen
      className="phase-screen phase-screen--results"
      title={`Round ${round.roundNumber} results`}
      subtitle="Votes are in. Scores updated. Continue the chaos." 
      actions={<button onClick={onNextRound}>Next round</button>}
    >
      <div className="card results-board-card">
        <ol className="results-ranking">
          {sorted.map((submission, index) => (
            <li key={submission.id} className={index === 0 ? "winner-row" : ""}>
              <strong>{playerName(session, submission.playerId)}</strong>: <span className="vote-count">{votes.get(submission.id) || 0} votes</span>
              {index === 0 ? <span className="winner-badge">🎉 Winner</span> : null}
            </li>
          ))}
        </ol>
      </div>
      <div className="card memory-chain-card">
        <h3>Memory chain</h3>
        <ul className="clean-list">
          {session.memory.map((item) => (
            <li key={item.id}>{item.twist}</li>
          ))}
        </ul>
      </div>
    </Screen>
  );
};
