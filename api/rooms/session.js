import { allowOptions, cors, json } from "../_lib/http.js";
import { loadRoomSession } from "../_lib/roomStore.js";

export default async function handler(req, res) {
  const trace = `[rooms/session ${Date.now()}]`;
  if (allowOptions(req, res)) return;
  cors(res);
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const url = new URL(req.url, "http://localhost");
    const code = String(url.searchParams.get("code") || "").toUpperCase();
    if (!code) {
      console.warn(trace, "missing-code");
      return json(res, 400, { error: "Missing room code" });
    }

    const session = await loadRoomSession(code);
    if (!session) {
      console.warn(trace, "room-missing", { code });
      return json(res, 404, { error: "Room not found" });
    }

    console.log(trace, "ok", { code, status: session.status, players: session.players?.length || 0 });
    return json(res, 200, { session });
  } catch (error) {
    console.error(trace, "error", { message: error.message, stack: error.stack });
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
