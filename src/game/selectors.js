export const currentRound = (session) => session?.rounds?.at(-1) || null;

export const playerById = (session, id) => session?.players?.find((p) => p.id === id) || null;

export const playerName = (session, id) => playerById(session, id)?.name || "Unknown";

export const voteCountBySubmission = (round) => {
  const map = new Map();
  (round?.votes || []).forEach((v) => {
    map.set(v.submissionId, (map.get(v.submissionId) || 0) + 1);
  });
  return map;
};
