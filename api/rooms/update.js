import { allowOptions, cors, json, readBody } from "../_lib/http.js";
import { loadRoomSession, saveRoomSession } from "../_lib/roomStore.js";

export default async function handler(req, res) {
  const trace = `[rooms/update ${Date.now()}]`;
  if (allowOptions(req, res)) return;
  cors(res);
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const body = await readBody(req);
    const session = body.session;
    if (!session?.roomCode) {
      console.warn(trace, "missing-roomcode");
      return json(res, 400, { error: "Missing session.roomCode" });
    }

    const current = await loadRoomSession(session.roomCode);
    if (!current) {
      console.warn(trace, "room-missing", { roomCode: session.roomCode });
      return json(res, 404, { error: "Room not found" });
    }

    const incomingVersion = Number(body.expectedUpdatedAt || 0);
    const currentVersion = Number(current.updatedAt || current.createdAt || 0);

    if (incomingVersion && incomingVersion !== currentVersion) {
      console.warn(trace, "version-conflict", {
        roomCode: session.roomCode,
        incomingVersion,
        currentVersion,
      });
      return json(res, 409, { error: "Version conflict", session: current });
    }

    const saved = await saveRoomSession(session);
    console.log(trace, "saved", {
      roomCode: saved.roomCode,
      status: saved.status,
      players: saved.players?.length || 0,
    });
    return json(res, 200, { session: saved });
  } catch (error) {
    console.error(trace, "error", { message: error.message, stack: error.stack });
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
