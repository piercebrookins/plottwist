import { MIN_PLAYERS } from "../game/constants";
import { Screen, StatPill } from "./Layout";

export const LobbyView = ({ session, me, onAddBot, onStart, onSetSettings }) => {
  const isHost = me?.isHost;

  return (
    <Screen
      title="JOIN THE GAME"
      subtitle="One big screen. Tiny phone controllers. Maximum nonsense."
      actions={
        isHost ? (
          <>
            <button onClick={onAddBot}>Add mock player</button>
            <button disabled={session.players.length < MIN_PLAYERS} onClick={onStart}>
              Start game
            </button>
          </>
        ) : (
          <p>Waiting for host to start… dramatic, right?</p>
        )
      }
    >
      <div className="room-code" aria-label="room code">
        <span className="room-code-label">Room Code</span>
        <div className="room-code-value">
          {session.roomCode.split("").map((letter, idx) => (
            <span key={`${letter}-${idx}`} className="room-code-letter">
              {letter}
            </span>
          ))}
        </div>
      </div>

      <div className="grid three">
        <StatPill label="Players" value={`${session.players.length}/10`} />
        <StatPill label="Rounds" value={session.settings.rounds} />
        <StatPill label="Vote timer" value={`${session.settings.voteSeconds}s`} />
      </div>

      {isHost ? (
        <div className="card settings">
          <h3>Settings</h3>
          <label>
            Rounds
            <select
              value={session.settings.rounds}
              onChange={(e) => onSetSettings({ rounds: Number(e.target.value) })}
            >
              {[3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label>
            Prompt pack
            <select
              value={session.settings.promptPack}
              onChange={(e) => onSetSettings({ promptPack: e.target.value })}
            >
              <option value="noir">Noir</option>
              <option value="sciFi">Sci-Fi</option>
              <option value="fantasy">Fantasy</option>
            </select>
          </label>
          <label>
            Reveal style
            <select
              value={session.settings.revealStyle}
              onChange={(e) => onSetSettings({ revealStyle: e.target.value })}
            >
              <option value="dramatic narration">Dramatic narration</option>
              <option value="mini screenplay">Mini screenplay</option>
            </select>
          </label>
          <label>
            Vote timer
            <select
              value={session.settings.voteSeconds}
              onChange={(e) => onSetSettings({ voteSeconds: Number(e.target.value) })}
            >
              {[15, 20, 25, 30].map((n) => (
                <option key={n} value={n}>
                  {n}s
                </option>
              ))}
            </select>
          </label>
          <label>
            Media mode
            <select
              value={session.settings.mediaMode || "video"}
              onChange={(e) => onSetSettings({ mediaMode: e.target.value })}
            >
              <option value="video">Video mode</option>
              <option value="image">Image mode</option>
            </select>
          </label>
        </div>
      ) : null}

      <div className="card">
        <h3>Players</h3>
        <ul className="clean-list player-grid stagger-children">
          {session.players.map((player) => (
            <li key={player.id} className="player-card" style={{ "--player-color": player.color }}>
              <div className="avatar">{player.avatar}</div>
              <div className="player-name-tag">
                {player.name} {player.isHost ? "👑" : ""}
              </div>
              <span className="avatar-status ready" />
            </li>
          ))}
        </ul>
      </div>
    </Screen>
  );
};
