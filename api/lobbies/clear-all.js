import { INDEX_KEY } from "../_lib/constants.js";
import { allowOptions, cors, json } from "../_lib/http.js";
import { redis } from "../_lib/redis.js";

export default async function handler(req, res) {
  if (allowOptions(req, res)) return;
  cors(res);

  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const rooms = (await redis.smembers(INDEX_KEY)) || [];
    const roomKeys = rooms.map((roomCode) => `lobby:${roomCode}`);

    if (roomKeys.length) await redis.del(...roomKeys);
    await redis.del(INDEX_KEY);

    return json(res, 200, {
      ok: true,
      clearedLobbies: rooms.length,
    });
  } catch (error) {
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
