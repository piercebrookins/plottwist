import {
  AVATARS,
  DEFAULT_SETTINGS,
  FALLBACK_TWIST,
  GAME_STAGES,
  MAX_PLAYERS,
  PLAYER_COLORS,
  PROMPT_PACKS,
} from "./constants";

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const roomCode = () => Math.random().toString(36).slice(2, 6).toUpperCase();

const playerSkin = (index) => ({
  avatar: AVATARS[index % AVATARS.length],
  color: PLAYER_COLORS[index % PLAYER_COLORS.length],
});

export const createSession = (hostName) => ({
  id: uid(),
  roomCode: roomCode(),
  createdAt: Date.now(),
  status: GAME_STAGES.LOBBY,
  roundIndex: 0,
  settings: { ...DEFAULT_SETTINGS },
  players: [
    {
      id: uid(),
      name: hostName || "Host",
      score: 0,
      connected: true,
      isHost: true,
      streak: 0,
      callbackBonusCount: 0,
      ...playerSkin(0),
    },
  ],
  rounds: [],
  memory: [],
});

export const addPlayer = (session, name) => {
  const trimmed = (name || "").trim();
  if (!trimmed || session.players.length >= MAX_PLAYERS) return session;
  if (session.players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
    return session;
  }

  return {
    ...session,
    players: [
      ...session.players,
      {
        id: uid(),
        name: trimmed,
        score: 0,
        connected: true,
        isHost: false,
        streak: 0,
        callbackBonusCount: 0,
        ...playerSkin(session.players.length),
      },
    ],
  };
};

export const updateSettings = (session, partial) => ({
  ...session,
  settings: { ...session.settings, ...partial },
});

export const buildRoundPrompt = (session) => {
  const prompts = PROMPT_PACKS[session.settings.promptPack] || PROMPT_PACKS.noir;
  const seedPrompt = prompts[session.roundIndex % prompts.length];

  if (!session.memory.length) return seedPrompt;

  const callback = session.memory
    .slice(-2)
    .map((m) => m.twist)
    .join(" then ");

  return `${seedPrompt} (Callback memory: ${callback})`;
};

const makeRound = (session, prompt) => ({
  id: uid(),
  roundNumber: session.roundIndex + 1,
  prompt,
  status: GAME_STAGES.PROMPT,
  startedAt: Date.now(),
  submissions: [],
  votes: [],
  revealCursor: 0,
  winnerSubmissionId: null,
  scoredAt: null,
  votePhase: "showcase",
  showcaseIndex: 0,
  voteEndsAt: null,
});

export const beginRound = (session) => ({
  ...session,
  status: GAME_STAGES.PROMPT,
  rounds: [...session.rounds, makeRound(session, buildRoundPrompt(session))],
});

export const beginRoundWithPrompt = (session, prompt) => ({
  ...session,
  status: GAME_STAGES.PROMPT,
  rounds: [...session.rounds, makeRound(session, prompt || buildRoundPrompt(session))],
});

export const withSubmission = (session, { playerId, text }) => {
  const round = session.rounds.at(-1);
  if (!round) return session;

  const player = session.players.find((p) => p.id === playerId);
  if (!player || player.isHost) return session;

  const sanitizedText = (text || "").trim();
  const value = sanitizedText || FALLBACK_TWIST;

  const alreadySubmitted = round.submissions.some((s) => s.playerId === playerId);
  const nextSubmissions = alreadySubmitted
    ? round.submissions.map((s) =>
        s.playerId === playerId ? { ...s, text: value, updatedAt: Date.now() } : s
      )
    : [
        ...round.submissions,
        {
          id: uid(),
          playerId,
          text: value,
          generatedScene: null,
          safetyStatus: "pending",
          isDuplicateExact: round.submissions.some((s) => s.text === value),
          createdAt: Date.now(),
        },
      ];

  return {
    ...session,
    rounds: [...session.rounds.slice(0, -1), { ...round, submissions: nextSubmissions }],
  };
};

export const setStage = (session, stage) => ({ ...session, status: stage });

export const closeSubmissions = (session) => {
  const round = session.rounds.at(-1);
  if (!round) return session;

  const knownPlayerIds = new Set(round.submissions.map((s) => s.playerId));
  const missing = session.players
    .filter((p) => !p.isHost)
    .filter((p) => !knownPlayerIds.has(p.id))
    .map((p) => ({
      id: uid(),
      playerId: p.id,
      text: FALLBACK_TWIST,
      generatedScene: null,
      safetyStatus: "pending",
      isDuplicateExact: true,
      createdAt: Date.now(),
    }));

  return {
    ...session,
    status: GAME_STAGES.GENERATE,
    rounds: [
      ...session.rounds.slice(0, -1),
      {
        ...round,
        status: GAME_STAGES.GENERATE,
        submissions: [...round.submissions, ...missing],
      },
    ],
  };
};

export const startWritingPhase = (session) => {
  const round = session.rounds.at(-1);
  if (!round) return session;

  return {
    ...session,
    status: GAME_STAGES.SUBMIT,
    rounds: [
      ...session.rounds.slice(0, -1),
      {
        ...round,
        status: GAME_STAGES.SUBMIT,
      },
    ],
  };
};

export const withGeneratedScenes = (session, generatedSubmissions) => {
  const round = session.rounds.at(-1);
  if (!round) return session;

  return {
    ...setStage(session, GAME_STAGES.VOTE),
    rounds: [
      ...session.rounds.slice(0, -1),
      {
        ...round,
        status: GAME_STAGES.VOTE,
        submissions: generatedSubmissions,
        votePhase: "showcase",
        showcaseIndex: 0,
        voteEndsAt: null,
      },
    ],
  };
};

export const advanceVoteShowcase = (session) => {
  const round = session.rounds.at(-1);
  if (!round || round.status !== GAME_STAGES.VOTE) return session;

  if (round.votePhase !== "showcase") return session;

  const nextIndex = Math.min((round.showcaseIndex || 0) + 1, round.submissions.length);
  return {
    ...session,
    rounds: [
      ...session.rounds.slice(0, -1),
      {
        ...round,
        showcaseIndex: nextIndex,
      },
    ],
  };
};

export const openVotingPhase = (session) => {
  const round = session.rounds.at(-1);
  if (!round || round.status !== GAME_STAGES.VOTE) return session;

  return {
    ...session,
    rounds: [
      ...session.rounds.slice(0, -1),
      {
        ...round,
        votePhase: "voting",
        voteEndsAt: Date.now() + (session.settings.voteSeconds || 20) * 1000,
      },
    ],
  };
};

export const closeVoting = (session) => {
  const round = session.rounds.at(-1);
  if (!round) return session;

  const votes = getSubmissionVotes(round);
  const nonHostIds = new Set(session.players.filter((p) => !p.isHost).map((p) => p.id));
  const ranked = [...round.submissions]
    .filter((s) => nonHostIds.has(s.playerId))
    .sort((a, b) => (votes.get(b.id) || 0) - (votes.get(a.id) || 0));
  const winner = ranked[0] || null;

  return {
    ...session,
    status: GAME_STAGES.REVEAL,
    rounds: [
      ...session.rounds.slice(0, -1),
      {
        ...round,
        status: GAME_STAGES.REVEAL,
        revealCursor: 0,
        votePhase: "closed",
        winnerSubmissionId: winner?.id || null,
      },
    ],
  };
};

export const advanceRevealCursor = (session) => {
  const round = session.rounds.at(-1);
  if (!round) return session;

  const maxRevealCount = round.winnerSubmissionId ? 1 : round.submissions.length;
  const nextCursor = Math.min(round.revealCursor + 1, maxRevealCount);
  const done = nextCursor >= maxRevealCount;

  const progressed = {
    ...session,
    status: done ? GAME_STAGES.ROUND_RESULT : GAME_STAGES.REVEAL,
    rounds: [
      ...session.rounds.slice(0, -1),
      {
        ...round,
        revealCursor: nextCursor,
        status: done ? GAME_STAGES.ROUND_RESULT : GAME_STAGES.REVEAL,
      },
    ],
  };

  return done ? completeRound(progressed) : progressed;
};

export const withVote = (session, { voterId, submissionId }) => {
  const round = session.rounds.at(-1);
  if (!round) return session;

  const target = round.submissions.find((s) => s.id === submissionId);
  if (!target || target.playerId === voterId) return session;

  const existingVote = round.votes.find((v) => v.voterId === voterId);
  const votes = existingVote
    ? round.votes.map((v) => (v.voterId === voterId ? { ...v, submissionId } : v))
    : [...round.votes, { id: uid(), voterId, submissionId }];

  return {
    ...session,
    rounds: [...session.rounds.slice(0, -1), { ...round, votes }],
  };
};

const getSubmissionVotes = (round) => {
  const bySubmissionId = new Map();
  round.votes.forEach((v) => {
    bySubmissionId.set(v.submissionId, (bySubmissionId.get(v.submissionId) || 0) + 1);
  });
  return bySubmissionId;
};

export const completeRound = (session) => {
  const round = session.rounds.at(-1);
  if (!round || round.scoredAt) return session;

  const votes = getSubmissionVotes(round);
  const nonHostIds = new Set(session.players.filter((p) => !p.isHost).map((p) => p.id));
  const ranked = [...round.submissions]
    .filter((s) => nonHostIds.has(s.playerId))
    .sort((a, b) => (votes.get(b.id) || 0) - (votes.get(a.id) || 0));
  const winners = ranked.filter(
    (s) => (votes.get(s.id) || 0) === (votes.get(ranked[0]?.id) || 0)
  );

  const players = session.players.map((p) => {
    const playerSubmission = round.submissions.find((s) => s.playerId === p.id);
    const voteCount = playerSubmission ? votes.get(playerSubmission.id) || 0 : 0;
    const placement = ranked.findIndex((s) => s.playerId === p.id);
    const isTopTwo = placement > -1 && placement < 2;
    const callbackBonus = playerSubmission?.usedMemory ? 1 : 0;

    return {
      ...p,
      score: p.score + voteCount * 100 + callbackBonus * 25 + (isTopTwo ? 15 : 0),
      streak: isTopTwo ? p.streak + 1 : 0,
      callbackBonusCount: p.callbackBonusCount + callbackBonus,
    };
  });

  const winnerSubmission = winners[0] || ranked[0];
  const nextMemory = winnerSubmission
    ? [
        ...session.memory,
        {
          id: uid(),
          sourceRoundId: round.id,
          twist: winnerSubmission.text,
          summary: winnerSubmission.generatedScene?.slice(0, 120) || winnerSubmission.text,
          entities: extractEntities(winnerSubmission.text),
        },
      ].slice(-session.settings.memoryLimit)
    : session.memory;

  const nextRoundIndex = session.roundIndex + 1;
  const done = nextRoundIndex >= session.settings.rounds;

  return {
    ...session,
    players,
    memory: nextMemory,
    roundIndex: nextRoundIndex,
    status: done ? GAME_STAGES.FINAL_RESULT : GAME_STAGES.ROUND_RESULT,
    rounds: [
      ...session.rounds.slice(0, -1),
      {
        ...round,
        status: done ? GAME_STAGES.FINAL_RESULT : GAME_STAGES.ROUND_RESULT,
        winnerSubmissionId: winnerSubmission?.id || null,
        scoredAt: Date.now(),
      },
    ],
  };
};

export const sortedLeaderboard = (session) =>
  [...session.players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

export const nextRoundOrFinal = (session, explicitPrompt = null) => {
  if (session.status === GAME_STAGES.FINAL_RESULT) return session;
  return explicitPrompt
    ? beginRoundWithPrompt(setStage(session, GAME_STAGES.PROMPT), explicitPrompt)
    : beginRound(setStage(session, GAME_STAGES.PROMPT));
};

export const resetGame = (session) => ({
  ...createSession(session.players.find((p) => p.isHost)?.name || "Host"),
  roomCode: session.roomCode,
});

export const extractEntities = (text) => {
  const words = (text.match(/[A-Za-z]{4,}/g) || []).slice(0, 3);
  return [...new Set(words)].map((word) => word.toLowerCase());
};
