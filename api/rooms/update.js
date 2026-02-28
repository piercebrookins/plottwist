import { allowOptions, cors, json, readBody } from "../_lib/http.js";
import { loadRoomSession, saveRoomSession } from "../_lib/roomStore.js";
import { createLogger } from "../_lib/vercelLog.js";

export default async function handler(req, res) {
  const logger = createLogger("rooms/update");
  if (allowOptions(req, res)) return;
  cors(res);
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const body = await readBody(req);
    const session = body.session;
    if (!session?.roomCode) {
      logger.warn("missing-roomcode");
      return json(res, 400, { error: "Missing session.roomCode" });
    }

    const current = await loadRoomSession(session.roomCode);
    if (!current) {
      logger.warn("room-missing", { roomCode: session.roomCode });
      return json(res, 404, { error: "Room not found" });
    }

    const incomingVersion = Number(body.expectedUpdatedAt || 0);
    const currentVersion = Number(current.updatedAt || current.createdAt || 0);

    if (incomingVersion && incomingVersion !== currentVersion) {
      logger.warn("version-conflict", {
        roomCode: session.roomCode,
        incomingVersion,
        currentVersion,
      });
      return json(res, 409, { error: "Version conflict", session: current });
    }

    const saved = await saveRoomSession(session);
    logger.info("saved", {
      roomCode: saved.roomCode,
      status: saved.status,
      players: saved.players?.length || 0,
    });
    return json(res, 200, { session: saved });
  } catch (error) {
    logger.error("error", { message: error.message, stack: error.stack });
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
