import { INDEX_KEY } from "../_lib/constants.js";
import { allowOptions, cors, json } from "../_lib/http.js";
import { redis } from "../_lib/redis.js";
import { computeActivityScore } from "../_lib/score.js";

const readAll = async () => {
  const rooms = (await redis.smembers(INDEX_KEY)) || [];
  const records = await Promise.all(
    rooms.map(async (roomCode) => {
      const raw = await redis.get(`lobby:${roomCode}`);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        return { ...parsed, activityScore: computeActivityScore(parsed) };
      } catch {
        return null;
      }
    })
  );
  return records.filter(Boolean);
};

const stageShort = (status = "") =>
  ({
    lobby: "LOBBY",
    prompt: "PROMPT",
    submit: "WRITE",
    generate: "GEN",
    vote: "VOTE",
    reveal: "WINNER",
    "round-result": "SCORE",
    "final-result": "FINAL",
  }[status] || "LIVE");

export default async function handler(req, res) {
  if (allowOptions(req, res)) return;
  cors(res);

  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const records = await readAll();
    if (!records.length) {
      return json(res, 200, {
        roomCode: null,
        playerCount: 0,
        stage: "IDLE",
        round: "-",
        line: "No active lobbies",
      });
    }

    records.sort((a, b) => b.activityScore - a.activityScore || b.updatedAt - a.updatedAt);
    const top = records[0];
    const roundLabel = `${(top.roundIndex || 0) + 1}/${top.roundsConfigured || 3}`;
    const stage = stageShort(top.status);

    return json(res, 200, {
      roomCode: top.roomCode,
      playerCount: top.playerCount,
      stage,
      round: roundLabel,
      updatedAt: top.updatedAt,
      activityScore: top.activityScore,
      line: `${top.roomCode} • ${top.playerCount}p • ${stage} • R${roundLabel}`,
    });
  } catch (error) {
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
