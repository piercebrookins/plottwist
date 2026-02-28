import { allowOptions, cors, json, readBody } from "./_lib/http.js";
import { createLogger } from "./_lib/vercelLog.js";

const DEFAULT_MODEL = "gemini-3.1-flash-image-preview";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export default async function handler(req, res) {
  const logger = createLogger("generate-image");
  if (allowOptions(req, res)) return;
  cors(res);

  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.error("missing-gemini-api-key");
    return json(res, 500, { error: "GEMINI_API_KEY not configured" });
  }

  try {
    const { prompt, aspectRatio = "16:9", model } = await readBody(req);
    logger.info("request", {
      promptChars: (prompt || "").length,
      aspectRatio,
      model: model || process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL,
    });
    if (!prompt || typeof prompt !== "string") {
      return json(res, 400, { error: "prompt is required" });
    }

    const geminiModel = model || process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL;
    logger.info("calling-gemini", { geminiModel });
    const response = await fetch(`${GEMINI_BASE}/${geminiModel}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          ...(aspectRatio ? { imageConfig: { aspectRatio } } : {}),
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      logger.error("gemini-http-error", { status: response.status, body: err?.slice?.(0, 400) });
      return json(res, response.status, { error: `Gemini API error: ${err}` });
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData);

    if (!imagePart) {
      logger.error("no-image-returned", { partsCount: parts.length });
      return json(res, 502, { error: "No image returned from Gemini" });
    }

    logger.info("ok", {
      mimeType: imagePart.inlineData.mimeType || "image/png",
      base64Chars: (imagePart.inlineData.data || "").length,
    });

    return json(res, 200, {
      ok: true,
      image: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || "image/png",
    });
  } catch (error) {
    logger.error("error", { message: error.message, stack: error.stack });
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
