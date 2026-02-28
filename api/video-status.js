import { allowOptions, cors, json } from "./_lib/http.js";
import { createLogger } from "./_lib/vercelLog.js";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

const extractVideoUrl = (operation) => {
  const response = operation?.response || {};
  const candidates = [
    response?.videoUri,
    response?.videoUrl,
    response?.uri,
    response?.output?.videoUri,
    response?.output?.videoUrl,
    response?.generatedVideo?.uri,
    response?.generatedVideo?.videoUri,
  ].filter(Boolean);

  const files = response?.generatedSamples || response?.videos || response?.outputs || [];
  for (const item of files) {
    if (!item) continue;
    if (item.video?.uri) candidates.push(item.video.uri);
    if (item.videoUri) candidates.push(item.videoUri);
    if (item.uri) candidates.push(item.uri);
  }

  return candidates.find(Boolean) || null;
};

export default async function handler(req, res) {
  const logger = createLogger("video-status");
  if (allowOptions(req, res)) return;
  cors(res);

  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.error("missing-gemini-api-key");
    return json(res, 500, { error: "GEMINI_API_KEY not configured" });
  }

  try {
    const url = new URL(req.url, "http://localhost");
    const op = String(url.searchParams.get("op") || "").trim();

    if (!op) return json(res, 400, { error: "op is required" });

    const operationPath = op.startsWith("operations/") || op.startsWith("models/") ? op : `operations/${op}`;
    logger.info("request", { operationPath });

    const response = await fetch(`${GEMINI_BASE}/${operationPath}?key=${apiKey}`);

    if (!response.ok) {
      const err = await response.text();
      logger.error("veo-http-error", { status: response.status, body: err?.slice?.(0, 400) });
      return json(res, response.status, { error: `Veo status error: ${err}` });
    }

    const data = await response.json();

    if (!data.done) {
      return json(res, 200, { ok: true, status: "running", done: false });
    }

    if (data.error) {
      logger.warn("failed", { error: data.error });
      return json(res, 200, { ok: true, status: "failed", done: true, error: data.error?.message || "Video generation failed" });
    }

    const videoUrl = extractVideoUrl(data);
    if (!videoUrl) {
      logger.error("missing-video-url", { keys: Object.keys(data.response || {}) });
      return json(res, 502, { error: "No video URL returned from Veo operation" });
    }

    logger.info("done", { hasVideoUrl: true });
    return json(res, 200, { ok: true, status: "done", done: true, videoUrl });
  } catch (error) {
    logger.error("error", { message: error.message, stack: error.stack });
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
