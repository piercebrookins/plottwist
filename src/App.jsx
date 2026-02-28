import { useEffect, useMemo, useRef, useState } from "react";
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
import { GAME_STAGES, MAX_PLAYERS } from "./game/constants";
import { generateContinuationPrompt, generateScene } from "./game/geminiReal";
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
import { publishMentraStatus } from "./mentraBridge";
import { sendLobbyHeartbeat } from "./game/telemetry";
import { clearIdentityForTab, getIdentityForTab, saveIdentityForTab } from "./game/identity";

const BOT_NAMES = ["Pixel", "NoirNerd", "Captain Twist", "Glue Gun", "Soda Gremlin"];

function App() {
  const [roomCode, setRoomCode] = useState(() => getIdentityForTab().roomCode || null);
  const [playerId, setPlayerId] = useState(() => getIdentityForTab().playerId || null);
  const { session, update } = useSessionStore(roomCode);
  const generatingRoundRef = useRef(null);

  const me = useMemo(() => playerById(session, playerId), [session, playerId]);
  const round = currentRound(session);

  useEffect(() => {
    if (!session || !roomCode) return;
    publishMentraStatus({ session, playerId });
  }, [session, roomCode, playerId]);

  useEffect(() => {
    if (!session || !roomCode) return undefined;

    const intervalId = window.setInterval(() => {
      publishMentraStatus({ session, playerId });
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [session, roomCode, playerId]);

  useEffect(() => {
    if (!session || !me?.isHost) return undefined;

    sendLobbyHeartbeat(session);
    const intervalId = window.setInterval(() => sendLobbyHeartbeat(session), 5000);
    return () => window.clearInterval(intervalId);
  }, [session, me?.isHost]);

  useEffect(() => {
    if (!session) return;
    const stillExists = session.players.some((p) => p.id === playerId);
    if (stillExists) return;

    clearIdentityForTab();
    setRoomCode(null);
    setPlayerId(null);
  }, [session, playerId]);

  const createRoom = (hostName) => {
    const next = createSession(hostName);
    const nextPlayerId = next.players[0].id;

    saveSession(next);
    saveIdentityForTab({ roomCode: next.roomCode, playerId: nextPlayerId });

    setRoomCode(next.roomCode);
    setPlayerId(nextPlayerId);
  };

  const joinRoom = (code, name) => {
    const existing = loadSession(code);
    if (!existing) return alert("Room not found or expired");

    const joined = addPlayer(existing, name || "Player");
    const mePlayer = joined.players.find((p) => p.name.toLowerCase() === (name || "Player").toLowerCase());
    const nextPlayerId = mePlayer?.id || joined.players.at(-1).id;

    saveSession(joined);
    saveIdentityForTab({ roomCode: joined.roomCode, playerId: nextPlayerId });

    setRoomCode(joined.roomCode);
    setPlayerId(nextPlayerId);
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
            mediaMode: closed.settings.mediaMode,
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

  const goNextRound = async () => {
    if (!session || !me?.isHost) return;

    const roundsPlayed = session.roundIndex;
    if (roundsPlayed !== 1) {
      apply((s) => nextRoundOrFinal(s));
      return;
    }

    const roundOne = session.rounds[0];
    const winner = roundOne?.submissions?.find((s) => s.id === roundOne?.winnerSubmissionId);
    if (!roundOne || !winner) {
      apply((s) => nextRoundOrFinal(s));
      return;
    }

    const prompt = await generateContinuationPrompt({
      roundOnePrompt: roundOne.prompt,
      winningTwist: winner.text,
      problemStatement: session.settings.problemStatement,
    });

    apply((s) => nextRoundOrFinal(s, prompt));
  };

  const addMockPlayer = () => {
    if (!session) return;
    if (session.players.length >= MAX_PLAYERS) {
      alert("Room is full (10 players max).");
      return;
    }

    const used = new Set(session.players.map((p) => p.name.toLowerCase()));
    let name = "";
    for (let i = 0; i < 80; i += 1) {
      const candidate = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] + Math.floor(Math.random() * 99);
      if (!used.has(candidate.toLowerCase())) {
        name = candidate;
        break;
      }
    }
    if (!name) {
      name = `Bot${session.players.length + 1}-${Date.now().toString(36).slice(-3)}`;
    }

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
    return (
      <RoundResultView
        session={session}
        round={round}
        onNextRound={() => {
          if (me?.isHost) goNextRound();
        }}
      />
    );
  }

  return <FinalResultView session={session} onReset={playAgain} />;
}

export default App;
