import { allowOptions, cors, json, readBody } from "../_lib/http.js";
import { loadRoomSession, saveRoomSession } from "../_lib/roomStore.js";

export default async function handler(req, res) {
  if (allowOptions(req, res)) return;
  cors(res);
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const body = await readBody(req);
    const session = body.session;
    if (!session?.roomCode) return json(res, 400, { error: "Missing session.roomCode" });

    const current = await loadRoomSession(session.roomCode);
    if (!current) return json(res, 404, { error: "Room not found" });

    const incomingVersion = Number(body.expectedUpdatedAt || 0);
    const currentVersion = Number(current.updatedAt || current.createdAt || 0);

    if (incomingVersion && incomingVersion !== currentVersion) {
      return json(res, 409, { error: "Version conflict", session: current });
    }

    const saved = await saveRoomSession(session);
    return json(res, 200, { session: saved });
  } catch (error) {
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
