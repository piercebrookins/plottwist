import { INDEX_KEY } from "../_lib/constants";
import { allowOptions, cors, json } from "../_lib/http";
import { redis } from "../_lib/redis";
import { computeActivityScore } from "../_lib/score";

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

export default async function handler(req, res) {
  if (allowOptions(req, res)) return;
  cors(res);

  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const records = await readAll();
    if (!records.length) return json(res, 200, { roomCode: null });

    records.sort((a, b) => b.activityScore - a.activityScore || b.updatedAt - a.updatedAt);
    return json(res, 200, records[0]);
  } catch (error) {
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
