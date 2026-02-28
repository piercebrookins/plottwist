import { allowOptions, cors, json } from "../_lib/http.js";
import { loadRoomSession } from "../_lib/roomStore.js";
import { createLogger } from "../_lib/vercelLog.js";

export default async function handler(req, res) {
  const logger = createLogger("rooms/session");
  if (allowOptions(req, res)) return;
  cors(res);
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const url = new URL(req.url, "http://localhost");
    const code = String(url.searchParams.get("code") || "").toUpperCase();
    if (!code) {
      logger.warn("missing-code");
      return json(res, 400, { error: "Missing room code" });
    }

    const session = await loadRoomSession(code);
    if (!session) {
      logger.warn("room-missing", { code });
      return json(res, 404, { error: "Room not found" });
    }

    logger.info("ok", { code, status: session.status, players: session.players?.length || 0 });
    return json(res, 200, { session });
  } catch (error) {
    logger.error("error", { message: error.message, stack: error.stack });
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
