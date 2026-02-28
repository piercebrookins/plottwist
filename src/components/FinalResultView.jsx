import { sortedLeaderboard } from "../game/engine";
import { Screen } from "./Layout";
import { WinnerCelebration } from "./WinnerCelebration";

export const FinalResultView = ({ session, onReset }) => {
  const board = sortedLeaderboard(session);
  const winnerName = board[0]?.name || "Nobody";
  return (
    <Screen
      className="phase-screen phase-screen--final"
      title="Final leaderboard"
      subtitle={`Winner: ${winnerName}. Absolute cinema.`}
      actions={<button onClick={onReset}>Play again</button>}
    >
      <WinnerCelebration winnerName={winnerName} />
      <div className="card confetti-lite final-board-card">
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
