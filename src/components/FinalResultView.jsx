import { sortedLeaderboard } from "../game/engine";
import { Screen } from "./Layout";

export const FinalResultView = ({ session, onReset }) => {
  const board = sortedLeaderboard(session);
  return (
    <Screen
      title="Final leaderboard"
      subtitle={`Winner: ${board[0]?.name || "Nobody"}. Absolute cinema.`}
      actions={<button onClick={onReset}>Play again</button>}
    >
      <div className="card confetti-lite">
        <ol className="leaderboard-list">
          {board.map((player, idx) => (
            <li key={player.id} className={`leaderboard-item ${idx === 0 ? "first" : ""}`} style={{ "--player-color": player.color }}>
              <span className="leaderboard-rank">{idx + 1}</span>
              <span className="avatar">{player.avatar}</span>
              <span>{player.name}</span>
              <span className="leaderboard-score">{player.score}</span>
            </li>
          ))}
        </ol>
      </div>
    </Screen>
  );
};
