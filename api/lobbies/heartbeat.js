import { INDEX_KEY, LOBBY_TTL_SECONDS, RATE_LIMIT_MAX_HITS, RATE_LIMIT_WINDOW_MS } from "../_lib/constants.js";
import { allowOptions, cors, json, readBody } from "../_lib/http.js";
import { redis } from "../_lib/redis.js";
import { computeActivityScore } from "../_lib/score.js";
import { validateHeartbeat } from "../_lib/validate.js";

const rateLimitKey = (ip, roomCode) => `ratelimit:${ip}:${roomCode}`;

const checkRateLimit = async (ip, roomCode) => {
  const key = rateLimitKey(ip, roomCode);
  const hits = await redis.incr(key);
  if (hits === 1) await redis.expire(key, Math.ceil(RATE_LIMIT_WINDOW_MS / 1000));
  return hits <= RATE_LIMIT_MAX_HITS;
};

export default async function handler(req, res) {
  if (allowOptions(req, res)) return;
  cors(res);

  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const body = await readBody(req);
    const parsed = validateHeartbeat(body);
    if (!parsed.ok) return json(res, 400, { error: parsed.error });

    const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || "unknown";
    const telemetry = {
      ...parsed.value,
      updatedAt: Date.now(),
    };
    telemetry.activityScore = computeActivityScore(telemetry);

    const allowed = await checkRateLimit(ip, telemetry.roomCode);
    if (!allowed) return json(res, 429, { error: "Rate limited" });

    const key = `lobby:${telemetry.roomCode}`;
    await redis.sadd(INDEX_KEY, telemetry.roomCode);
    await redis.setex(key, LOBBY_TTL_SECONDS, JSON.stringify(telemetry));

    return json(res, 200, { ok: true, lobby: telemetry });
  } catch (error) {
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
