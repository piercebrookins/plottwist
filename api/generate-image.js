import { allowOptions, cors, json, readBody } from "./_lib/http.js";

const DEFAULT_MODEL = "gemini-3.1-flash-image-preview";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export default async function handler(req, res) {
  const trace = `[generate-image ${Date.now()}]`;
  if (allowOptions(req, res)) return;
  cors(res);

  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error(trace, "missing GEMINI_API_KEY");
    return json(res, 500, { error: "GEMINI_API_KEY not configured" });
  }

  try {
    const { prompt, aspectRatio = "16:9", model } = await readBody(req);
    console.log(trace, "request", {
      promptChars: (prompt || "").length,
      aspectRatio,
      model: model || process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL,
    });
    if (!prompt || typeof prompt !== "string") {
      return json(res, 400, { error: "prompt is required" });
    }

    const geminiModel = model || process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL;
    console.log(trace, "calling-gemini", { geminiModel });
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
      console.error(trace, "gemini-http-error", { status: response.status, body: err?.slice?.(0, 400) });
      return json(res, response.status, { error: `Gemini API error: ${err}` });
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData);

    if (!imagePart) {
      console.error(trace, "no-image-returned", { partsCount: parts.length });
      return json(res, 502, { error: "No image returned from Gemini" });
    }

    console.log(trace, "ok", {
      mimeType: imagePart.inlineData.mimeType || "image/png",
      base64Chars: (imagePart.inlineData.data || "").length,
    });

    return json(res, 200, {
      ok: true,
      image: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || "image/png",
    });
  } catch (error) {
    console.error(trace, "error", { message: error.message, stack: error.stack });
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
