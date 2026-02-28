import { allowOptions, cors, json, readBody } from "../_lib/http.js";
import { saveRoomMedia } from "../_lib/roomStore.js";
import { createLogger } from "../_lib/vercelLog.js";

export default async function handler(req, res) {
  const logger = createLogger("rooms/media-save");
  if (allowOptions(req, res)) return;
  cors(res);
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const { roomCode, mediaId, dataUrl, mimeType } = await readBody(req);
    if (!roomCode || !mediaId || !dataUrl) {
      return json(res, 400, { error: "roomCode, mediaId, dataUrl required" });
    }

    const saved = await saveRoomMedia({ roomCode, mediaId, dataUrl, mimeType });
    logger.info("saved", { roomCode, mediaId, chars: dataUrl.length });

    return json(res, 200, {
      ok: true,
      mediaUrl: `/api/rooms/media-get?roomCode=${encodeURIComponent(roomCode)}&mediaId=${encodeURIComponent(mediaId)}`,
      mimeType: saved.mimeType,
    });
  } catch (error) {
    logger.error("error", { message: error.message, stack: error.stack });
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
