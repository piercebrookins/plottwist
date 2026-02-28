import { useEffect, useMemo, useState } from "react";
import { GAME_LIMITS } from "../game/constants";
import { pickDemoVideo } from "../game/videoMock";
import { Screen, StatPill } from "./Layout";

export const SubmitView = ({ session, me, round, onSubmit, onForceClose }) => {
  const [text, setText] = useState("");
  const [seconds, setSeconds] = useState(session.settings.submitSeconds);

  useEffect(() => {
    setSeconds(session.settings.submitSeconds);
    const timer = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [session.settings.submitSeconds, round.id]);

  useEffect(() => {
    if (seconds === 0 && me?.isHost) onForceClose();
  }, [seconds, me?.isHost, onForceClose]);

  useEffect(() => {
    if (!me?.isHost) return;
    const nonHostPlayers = session.players.filter((p) => !p.isHost);
    if (!nonHostPlayers.length) return;
    const allSubmitted = nonHostPlayers.every((p) =>
      round.submissions.some((s) => s.playerId === p.id)
    );
    if (allSubmitted) onForceClose();
  }, [me?.isHost, session.players, round.submissions, onForceClose]);

  const mine = round.submissions.find((s) => s.playerId === me.id);
  const timerClass = seconds <= 10 ? "timer-urgent" : seconds <= 20 ? "timer-warning" : "timer-normal";

  const nonHostPlayers = useMemo(() => session.players.filter((p) => !p.isHost), [session.players]);
  const submittedIds = useMemo(() => new Set(round.submissions.map((s) => s.playerId)), [round.submissions]);

  if (me.isHost) {
    return (
      <Screen
        title={`Round ${round.roundNumber}: Collecting submissions`}
        subtitle={round.prompt}
        actions={<button onClick={onForceClose}>Force start generation</button>}
      >
        <div className={`timer ${timerClass}`}>
          <div className="timer-circle" style={{ "--progress": `${(seconds / session.settings.submitSeconds) * 100}%` }}>
            <span className="timer-value">{seconds}</span>
          </div>
          <span className="timer-label">seconds left</span>
        </div>

        <div className="grid three">
          <StatPill label="Stage" value="WRITE" />
          <StatPill label="Submitted" value={`${round.submissions.length}/${nonHostPlayers.length}`} />
          <StatPill label="Waiting" value={Math.max(nonHostPlayers.length - round.submissions.length, 0)} />
        </div>

        <div className="card">
          <h3>Player submission status</h3>
          <ul className="clean-list host-status-grid">
            {nonHostPlayers.map((player) => {
              const done = submittedIds.has(player.id);
              return (
                <li key={player.id} className={`host-status-card ${done ? "done" : "waiting"}`}>
                  <span className="avatar" style={{ "--player-color": player.color }}>{player.avatar}</span>
                  <strong>{player.name}</strong>
                  <span className="host-state-pill">{done ? "DONE ✅" : "WAITING ⏳"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </Screen>
    );
  }

  return (
    <Screen
      title={`Round ${round.roundNumber}: Submit your twist`}
      subtitle={round.prompt}
      actions={
        <button
          disabled={text.trim().length > 0 && text.trim().length < GAME_LIMITS.MIN_ANSWER_LENGTH}
          onClick={() => onSubmit(text)}
        >
          Send twist
        </button>
      }
    >
      <div className={`timer ${timerClass}`}>
        <div className="timer-circle" style={{ "--progress": `${(seconds / session.settings.submitSeconds) * 100}%` }}>
          <span className="timer-value">{seconds}</span>
        </div>
        <span className="timer-label">seconds left</span>
      </div>

      <div className="grid three">
        <StatPill label="Phase" value="WRITE" />
        <StatPill label="Submitted" value={round.submissions.length} />
        <StatPill label="Memory" value={session.memory.length} />
      </div>

      <div className="card mobile-input-screen">
        <textarea
          className="mobile-textarea"
          rows={5}
          value={text}
          maxLength={GAME_LIMITS.MAX_ANSWER_LENGTH}
          onChange={(e) => setText(e.target.value)}
          placeholder="Your absurd twist goes here..."
        />
        <p className="mobile-char-count">
          {text.length}/{GAME_LIMITS.MAX_ANSWER_LENGTH} chars
        </p>

        {mine ? (
          <>
            <p className="ok">Submitted: {mine.text}</p>
            <div className="video-wrap">
              <video className="scene-video" src={pickDemoVideo(mine.text)} controls muted playsInline />
              <small>Demo Veo preview based on your twist</small>
            </div>
          </>
        ) : (
          <p>Submit from your phone, then watch the host screen for reveals.</p>
        )}
      </div>
    </Screen>
  );
};
