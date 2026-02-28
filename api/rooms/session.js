import { allowOptions, cors, json } from "../_lib/http.js";
import { loadRoomSession } from "../_lib/roomStore.js";

export default async function handler(req, res) {
  if (allowOptions(req, res)) return;
  cors(res);
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const url = new URL(req.url, "http://localhost");
    const code = String(url.searchParams.get("code") || "").toUpperCase();
    if (!code) return json(res, 400, { error: "Missing room code" });

    const session = await loadRoomSession(code);
    if (!session) return json(res, 404, { error: "Room not found" });

    return json(res, 200, { session });
  } catch (error) {
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
