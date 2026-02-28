import { allowOptions, cors, json } from "../_lib/http.js";
import { loadRoomMedia } from "../_lib/roomStore.js";
import { createLogger } from "../_lib/vercelLog.js";

const parseDataUrl = (dataUrl) => {
  const [meta, base64] = String(dataUrl || "").split(",");
  if (!meta || !base64) return null;
  const mimeMatch = meta.match(/^data:([^;]+);base64$/);
  if (!mimeMatch) return null;
  return { mimeType: mimeMatch[1], base64 };
};

export default async function handler(req, res) {
  const logger = createLogger("rooms/media-get");
  if (allowOptions(req, res)) return;
  cors(res);
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const url = new URL(req.url, "http://localhost");
    const roomCode = String(url.searchParams.get("roomCode") || "").toUpperCase();
    const mediaId = String(url.searchParams.get("mediaId") || "");

    if (!roomCode || !mediaId) return json(res, 400, { error: "roomCode and mediaId required" });

    const media = await loadRoomMedia({ roomCode, mediaId });
    if (!media) {
      logger.warn("missing", { roomCode, mediaId });
      return json(res, 404, { error: "Media not found" });
    }

    const parsed = parseDataUrl(media.dataUrl);
    if (!parsed) return json(res, 500, { error: "Invalid media data" });

    const bytes = Buffer.from(parsed.base64, "base64");
    res.statusCode = 200;
    res.setHeader("Content-Type", media.mimeType || parsed.mimeType || "image/png");
    res.setHeader("Cache-Control", "public, max-age=60");
    res.end(bytes);
  } catch (error) {
    logger.error("error", { message: error.message, stack: error.stack });
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
