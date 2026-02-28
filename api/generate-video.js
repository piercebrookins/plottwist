import { allowOptions, cors, json, readBody } from "./_lib/http.js";
import { createLogger } from "./_lib/vercelLog.js";

const DEFAULT_MODEL = "veo-3.0-generate-001";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export default async function handler(req, res) {
  const logger = createLogger("generate-video");
  if (allowOptions(req, res)) return;
  cors(res);

  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.error("missing-gemini-api-key");
    return json(res, 500, { error: "GEMINI_API_KEY not configured" });
  }

  try {
    const { prompt, aspectRatio = "16:9", durationSeconds = 8, model } = await readBody(req);
    if (!prompt || typeof prompt !== "string") {
      return json(res, 400, { error: "prompt is required" });
    }

    const veoModel = model || process.env.VEO_MODEL || DEFAULT_MODEL;
    logger.info("request", {
      promptChars: prompt.length,
      aspectRatio,
      durationSeconds,
      model: veoModel,
    });

    const response = await fetch(`${GEMINI_BASE}/${veoModel}:predictLongRunning?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { aspectRatio, durationSeconds },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      logger.error("veo-http-error", { status: response.status, body: err?.slice?.(0, 400) });
      return json(res, response.status, { error: `Veo API error: ${err}` });
    }

    const data = await response.json();
    const operationId = data?.name || null;

    if (!operationId) {
      logger.error("missing-operation-id", { keys: Object.keys(data || {}) });
      return json(res, 502, { error: "No operation id returned from Veo" });
    }

    logger.info("started", { operationId });
    return json(res, 200, { ok: true, operationId, done: Boolean(data.done) });
  } catch (error) {
    logger.error("error", { message: error.message, stack: error.stack });
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
