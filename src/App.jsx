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
import { apiCreateRoom, apiJoinRoom, apiSaveRoomMedia } from "./game/roomApi";
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
  const [generationLogs, setGenerationLogs] = useState([]);
  const [showRawGenerationLogs, setShowRawGenerationLogs] = useState(() => {
    try {
      return window.localStorage.getItem("plottwist:raw-generation-logs") === "1";
    } catch {
      return false;
    }
  });
  const { session, update } = useSessionStore(roomCode);
  const generatingRoundRef = useRef(null);

  const formatGenerationLog = (entry) => {
    if (typeof entry === "string") return entry;
    if (!entry || typeof entry !== "object") return String(entry);

    const { event } = entry;

    switch (event) {
      case "round-generation-start":
        return `🎬 Cameras rolling in room ${entry.roomCode}. Chaos engine warmed up for ${entry.mediaMode} mode.`;
      case "submissions-ready":
        return `📬 ${entry.count} twists collected. The nonsense buffet is officially open.`;
      case "submission-start":
        return `🧪 Brewing scene ${entry.index}... twist ingredient: "${entry.twist}".`;
      case "media-offload-start":
        return `📦 Compressing pixels for scene ${entry.index}. Courier pigeons dispatched.`;
      case "media-offload-done":
        return `✅ Scene ${entry.index} safely tucked into storage. No pixels were harmed.`;
      case "submission-done":
        return `✨ Scene ${entry.index} done in ${entry.ms}ms via ${entry.provider}${entry.fallback ? " (fallback rescue squad)" : ""}.`;
      case "submission-error":
        return `💥 Scene ${entry.index} tripped on a banana peel: ${entry.message}`;
      case "round-generation-complete":
        return `🏁 All ${entry.generated} scenes generated. Releasing the cinematic gremlins.`;
      case "stage-transition-ok":
        return `🚪 Transition successful. Voting arena is now open.`;
      case "stage-transition-failed":
        return `🚨 Transition jammed (${entry.actual || "unknown"}). Kicking the server gently.`;
      default:
        return JSON.stringify(entry);
    }
  };

  const pushGenerationLog = (entry) => {
    const logEntry = { ts: Date.now(), entry };
    setGenerationLogs((prev) => [...prev.slice(-15), logEntry]);
    console.log("[generation]", entry);
  };

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

  const createRoom = async (hostName) => {
    try {
      const { session: next, playerId: nextPlayerId } = await apiCreateRoom(hostName);
      saveIdentityForTab({ roomCode: next.roomCode, playerId: nextPlayerId });
      setRoomCode(next.roomCode);
      setPlayerId(nextPlayerId);
    } catch (error) {
      console.error("createRoom failed", error);
      alert(`Create room failed: ${error.message || "unknown error"}`);
    }
  };

  const joinRoom = async (code, name) => {
    try {
      const { session: joined, playerId: nextPlayerId } = await apiJoinRoom({
        roomCode: code,
        name: name || "Player",
      });

      saveIdentityForTab({ roomCode: joined.roomCode, playerId: nextPlayerId });
      setRoomCode(joined.roomCode);
      setPlayerId(nextPlayerId);
    } catch (error) {
      console.error("joinRoom failed", error);
      alert(`Join failed: ${error.message || "Room not found or expired"}`);
    }
  };

  const apply = async (fn) => {
    if (!session) return;
    await update(fn(session));
  };

  const startGame = () => apply((s) => beginRound(setStage(s, GAME_STAGES.PROMPT)));

  const submitTwist = (text) => apply((s) => withSubmission(s, { playerId: me.id, text }));

  const closeAndGenerate = async () => {
    if (!session || !me?.isHost) return;

    const roundId = currentRound(session)?.id;
    if (!roundId) return;
    if (generatingRoundRef.current === roundId) return;
    generatingRoundRef.current = roundId;

    try {
      setGenerationLogs([]);
      pushGenerationLog({ event: "round-generation-start", roomCode: session.roomCode, roundId, mediaMode: session.settings.mediaMode });

      const closed = closeSubmissions(session);
      const savedClosed = (await update(closed)) || closed;

      const r = currentRound(savedClosed);
      pushGenerationLog({
        event: "submissions-ready",
        count: r.submissions.length,
        mediaMode: savedClosed.settings.mediaMode,
        revealStyle: savedClosed.settings.revealStyle,
      });

      const generated = await Promise.all(
        r.submissions.map(async (submission, idx) => {
          const startedAt = performance.now();
          pushGenerationLog({ event: "submission-start", index: idx + 1, playerId: submission.playerId, twist: submission.text });

          try {
            const ai = await generateScene({
              prompt: r.prompt,
              twist: submission.text,
              memory: savedClosed.memory,
              style: savedClosed.settings.revealStyle,
              mediaMode: savedClosed.settings.mediaMode,
            });

            const normalized = { ...submission, ...ai };
            const isLargeDataUrl =
              normalized.mediaType === "image" &&
              typeof normalized.mediaUrl === "string" &&
              normalized.mediaUrl.startsWith("data:");

            if (isLargeDataUrl) {
              const mediaId = normalized.id;
              const mimeType = normalized.mediaUrl.slice(5, normalized.mediaUrl.indexOf(";")) || "image/png";

              pushGenerationLog({ event: "media-offload-start", index: idx + 1, mediaId });
              const { mediaUrl } = await apiSaveRoomMedia({
                roomCode: savedClosed.roomCode,
                mediaId,
                dataUrl: normalized.mediaUrl,
                mimeType,
              });

              normalized.mediaUrl = mediaUrl;
              normalized.imageUrl = mediaUrl;
              pushGenerationLog({ event: "media-offload-done", index: idx + 1, mediaId });
            }

            pushGenerationLog({
              event: "submission-done",
              index: idx + 1,
              ms: Math.round(performance.now() - startedAt),
              mediaType: normalized.mediaType,
              provider: normalized.mediaProvider,
              fallback: normalized.fallback,
              safetyStatus: normalized.safetyStatus,
            });

            return normalized;
          } catch (error) {
            pushGenerationLog({ event: "submission-error", index: idx + 1, message: error.message });
            throw error;
          }
        })
      );

      pushGenerationLog({ event: "round-generation-complete", generated: generated.length });
      const voteReady = withGeneratedScenes(savedClosed, generated);
      const persistedVote = await update(voteReady);
      if (!persistedVote || persistedVote.status !== GAME_STAGES.VOTE) {
        pushGenerationLog({
          event: "stage-transition-failed",
          expected: GAME_STAGES.VOTE,
          actual: persistedVote?.status || "unknown",
        });
      } else {
        pushGenerationLog({ event: "stage-transition-ok", status: persistedVote.status });
      }
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

    const justFinishedRound = session.rounds.at(-1);
    const winner = justFinishedRound?.submissions?.find(
      (s) => s.id === justFinishedRound?.winnerSubmissionId
    );

    if (!justFinishedRound || !winner) {
      apply((s) => nextRoundOrFinal(s));
      return;
    }

    const prompt = await generateContinuationPrompt({
      roundOnePrompt: justFinishedRound.prompt,
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
    return (
      <div className="loading">
        <div>
          <div>Generating cinematic chaos…</div>
          <div className="card" style={{ marginTop: 12, textAlign: "left", maxWidth: 780 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <h3 style={{ marginTop: 0 }}>Generation debug</h3>
              {me?.isHost ? (
                <button
                  type="button"
                  onClick={() => {
                    const next = !showRawGenerationLogs;
                    setShowRawGenerationLogs(next);
                    try {
                      window.localStorage.setItem("plottwist:raw-generation-logs", next ? "1" : "0");
                    } catch {
                      // no-op
                    }
                  }}
                >
                  {showRawGenerationLogs ? "Witty mode" : "Raw JSON mode"}
                </button>
              ) : null}
            </div>
            <ul className="clean-list">
              {(generationLogs.length ? generationLogs : [{ ts: Date.now(), entry: "Waiting for generation logs…" }]).map((item, idx) => {
                const time = new Date(item.ts).toLocaleTimeString();
                const text = showRawGenerationLogs
                  ? typeof item.entry === "string"
                    ? item.entry
                    : JSON.stringify(item.entry)
                  : formatGenerationLog(item.entry);

                return (
                  <li key={`${idx}-${time}-${text}`} style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.92 }}>
                    {`${time} · ${text}`}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    );
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
