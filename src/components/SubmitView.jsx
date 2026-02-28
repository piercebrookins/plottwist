import { useEffect, useState } from "react";
import { GAME_LIMITS } from "../game/constants";
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

  const mine = round.submissions.find((s) => s.playerId === me.id);
  const timerClass = seconds <= 10 ? "timer-urgent" : seconds <= 20 ? "timer-warning" : "timer-normal";

  return (
    <Screen
      title={`Round ${round.roundNumber}: Submit`}
      subtitle={round.prompt}
      actions={
        <>
          <button disabled={text.trim().length > 0 && text.trim().length < GAME_LIMITS.MIN_ANSWER_LENGTH} onClick={() => onSubmit(text)}>
            Send twist
          </button>
          {me?.isHost ? <button onClick={onForceClose}>Close submissions</button> : null}
        </>
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
      <div className="card">
        <textarea
          className="mobile-textarea"
          rows={5}
          value={text}
          maxLength={GAME_LIMITS.MAX_ANSWER_LENGTH}
          onChange={(e) => setText(e.target.value)}
          placeholder="Your absurd twist goes here..."
        />
        <p className="mobile-char-count">{text.length}/{GAME_LIMITS.MAX_ANSWER_LENGTH} chars</p>
        {mine ? <p className="ok">Submitted: {mine.text}</p> : <p>Not submitted yet. Panic politely.</p>}
      </div>
    </Screen>
  );
};
