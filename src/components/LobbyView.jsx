import { useEffect, useMemo } from "react";
import { MIN_PLAYERS } from "../game/constants";
import { Screen, StatPill } from "./Layout";

const ARENA_NAMES = ["Breeze", "Icebox", "Haven", "Lotus", "Ascent", "Sunset", "Bind", "Split"];

const seedFromId = (id = "", fallback = 1) =>
  id.split("").reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 3), fallback);

export const LobbyView = ({ session, me, onAddBot, onStart, onSetSettings }) => {
  const isHost = me?.isHost;
  useEffect(() => {
    document.body.classList.add("page-lobby");
    return () => document.body.classList.remove("page-lobby");
  }, []);

  const playerRows = useMemo(
    () =>
      session.players.map((player, index) => {
        const seed = seedFromId(player.id, index + 1);
        const leftScore = 7 + (seed % 8) + Math.min(player.score, 4);
        const rightScore = 5 + ((seed >> 3) % 8);
        return {
          ...player,
          arena: ARENA_NAMES[index % ARENA_NAMES.length],
          leftScore,
          rightScore,
        };
      }),
    [session.players]
  );

  return (
    <Screen
      className="join-game-screen"
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
      <div className="room-code join-room-code" aria-label="room code">
        <span className="room-code-label">Room Code</span>
        <div className="room-code-value">
          {session.roomCode.split("").map((letter, idx) => (
            <span key={`${letter}-${idx}`} className="room-code-letter join-room-code-letter">
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
        <section className="join-game-settings" aria-label="settings">
          <h3>Settings</h3>
          <div className="join-settings-grid">
            <label className="join-setting-card join-setting-card--rounds">
              <span className="join-setting-price">Config A</span>
              <span className="join-setting-label">Rounds</span>
              <select
                value={session.settings.rounds}
                onChange={(e) => onSetSettings({ rounds: Number(e.target.value) })}
              >
                {[2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="join-setting-meta">Total rounds</span>
            </label>

            <label className="join-setting-card join-setting-card--prompt">
              <span className="join-setting-price">Config B</span>
              <span className="join-setting-label">Prompt pack</span>
              <select
                value={session.settings.promptPack}
                onChange={(e) => onSetSettings({ promptPack: e.target.value })}
              >
                <option value="noir">Noir</option>
                <option value="sciFi">Sci-Fi</option>
                <option value="fantasy">Fantasy</option>
              </select>
              <span className="join-setting-meta">Genre mood</span>
            </label>

            <label className="join-setting-card join-setting-card--reveal">
              <span className="join-setting-price">Config C</span>
              <span className="join-setting-label">Reveal style</span>
              <select
                value={session.settings.revealStyle}
                onChange={(e) => onSetSettings({ revealStyle: e.target.value })}
              >
                <option value="dramatic narration">Dramatic narration</option>
                <option value="mini screenplay">Mini screenplay</option>
              </select>
              <span className="join-setting-meta">Output format</span>
            </label>

            <label className="join-setting-card join-setting-card--timer">
              <span className="join-setting-price">Config D</span>
              <span className="join-setting-label">Vote timer</span>
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
              <span className="join-setting-meta">Per vote phase</span>
            </label>

            <label className="join-setting-card join-setting-card--media">
              <span className="join-setting-price">Config E</span>
              <span className="join-setting-label">Media mode</span>
              <select
                value={session.settings.mediaMode || "video"}
                onChange={(e) => onSetSettings({ mediaMode: e.target.value })}
              >
                <option value="video">Video mode</option>
                <option value="image">Image mode</option>
                <option value="placeholder">Placeholder mode</option>
              </select>
              <span className="join-setting-meta">Generation mode</span>
            </label>
          </div>
        </section>
      ) : null}

      <div className="card join-game-players-card">
        <div className="join-match-header">
          <h3>Players</h3>
          <span>Live board</span>
        </div>
        <ul className="clean-list join-match-list">
          {playerRows.map((player) => (
            <li key={player.id} className="join-match-row">
              <div className="join-match-avatar">
                <span>{player.avatar}</span>
              </div>
              <div className="join-match-main">
                <div className="join-match-name">
                  {player.name}
                  {player.isHost ? <span className="join-host-dot">HOST</span> : null}
                </div>
                <div className="join-match-arena">{player.arena}</div>
              </div>
              <div className="join-match-score">
                <span className="join-score-a">{player.leftScore}</span>
                <span className="join-score-sep">:</span>
                <span className="join-score-b">{player.rightScore}</span>
              </div>
              <div className="join-rank-badge" aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>
    </Screen>
  );
};
