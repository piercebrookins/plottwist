import { useMemo, useRef, useState } from "react";
import {
  addPlayer,
  advanceRevealCursor,
  beginRound,
  closeSubmissions,
  closeVoting,
  createSession,
  openVotingPhase,
  advanceVoteShowcase,
  nextRoundOrFinal,
  resetGame,
  setStage,
  startWritingPhase,
  updateSettings,
  withGeneratedScenes,
  withSubmission,
  withVote,
} from "./game/engine";
import { GAME_STAGES } from "./game/constants";
import { generateScene } from "./game/geminiMock";
import { loadSession, saveSession } from "./game/storage";
import { currentRound, playerById } from "./game/selectors";
import { useSessionStore } from "./hooks/useSessionStore";
import { LandingView } from "./components/LandingView";
import { LobbyView } from "./components/LobbyView";
import { PromptView } from "./components/PromptView";
import { SubmitView } from "./components/SubmitView";
import { RevealView } from "./components/RevealView";
import { VoteView } from "./components/VoteView";
import { RoundResultView } from "./components/RoundResultView";
import { FinalResultView } from "./components/FinalResultView";

const BOT_NAMES = ["Pixel", "NoirNerd", "Captain Twist", "Glue Gun", "Soda Gremlin"];

function App() {
  const [roomCode, setRoomCode] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const { session, update } = useSessionStore(roomCode);
  const generatingRoundRef = useRef(null);

  const me = useMemo(() => playerById(session, playerId), [session, playerId]);
  const round = currentRound(session);

  const createRoom = (hostName) => {
    const next = createSession(hostName);
    saveSession(next);
    setRoomCode(next.roomCode);
    setPlayerId(next.players[0].id);
  };

  const joinRoom = (code, name) => {
    const existing = loadSession(code);
    if (!existing) return alert("Room not found or expired");
    const joined = addPlayer(existing, name || "Player");
    const mePlayer = joined.players.find((p) => p.name.toLowerCase() === (name || "Player").toLowerCase());
    saveSession(joined);
    setRoomCode(joined.roomCode);
    setPlayerId(mePlayer?.id || joined.players.at(-1).id);
  };

  const apply = (fn) => session && update(fn(session));

  const startGame = () => apply((s) => beginRound(setStage(s, GAME_STAGES.PROMPT)));

  const submitTwist = (text) => apply((s) => withSubmission(s, { playerId: me.id, text }));

  const closeAndGenerate = async () => {
    if (!session || !me?.isHost) return;

    const roundId = currentRound(session)?.id;
    if (!roundId) return;
    if (generatingRoundRef.current === roundId) return;
    generatingRoundRef.current = roundId;

    try {
      const closed = closeSubmissions(session);
      update(closed);

      const r = currentRound(closed);
      const generated = await Promise.all(
        r.submissions.map(async (submission) => {
          const ai = await generateScene({
            prompt: r.prompt,
            twist: submission.text,
            memory: closed.memory,
            style: closed.settings.revealStyle,
          });
          return { ...submission, ...ai };
        })
      );

      update(withGeneratedScenes(closed, generated));
    } finally {
      generatingRoundRef.current = null;
    }
  };

  const vote = (submissionId) => apply((s) => withVote(s, { voterId: me.id, submissionId }));

  const scoreRound = () => apply((s) => closeVoting(s));
  const nextShowcaseClip = () => apply((s) => advanceVoteShowcase(s));
  const startVoting = () => apply((s) => openVotingPhase(s));

  const goNextRound = () => apply((s) => nextRoundOrFinal(s));

  const addMockPlayer = () => {
    const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] + Math.floor(Math.random() * 9);
    apply((s) => addPlayer(s, name));
  };

  const playAgain = () => apply((s) => resetGame(s));

  if (!session || !me) {
    return <LandingView onCreate={createRoom} onJoin={joinRoom} />;
  }

  if (session.status === GAME_STAGES.LOBBY) {
    return (
      <LobbyView
        session={session}
        me={me}
        onAddBot={addMockPlayer}
        onStart={startGame}
        onSetSettings={(partial) => apply((s) => updateSettings(s, partial))}
      />
    );
  }

  if (session.status === GAME_STAGES.PROMPT && round) {
    return <PromptView round={round} onCountdownDone={() => apply((s) => startWritingPhase(s))} />;
  }

  if (session.status === GAME_STAGES.SUBMIT && round) {
    return (
      <SubmitView
        session={session}
        me={me}
        round={round}
        onSubmit={submitTwist}
        onForceClose={closeAndGenerate}
      />
    );
  }

  if (session.status === GAME_STAGES.GENERATE) {
    return <div className="loading">Generating cinematic chaos…</div>;
  }

  if (session.status === GAME_STAGES.VOTE && round) {
    return (
      <VoteView
        session={session}
        me={me}
        round={round}
        onVote={vote}
        onFinishVoting={scoreRound}
        onNextClip={nextShowcaseClip}
        onStartVoting={startVoting}
      />
    );
  }

  if (session.status === GAME_STAGES.REVEAL && round) {
    return <RevealView session={session} round={round} onNext={() => apply((s) => advanceRevealCursor(s))} />;
  }

  if (session.status === GAME_STAGES.ROUND_RESULT && round) {
    return <RoundResultView session={session} round={round} onNextRound={goNextRound} />;
  }

  return <FinalResultView session={session} onReset={playAgain} />;
}

export default App;
