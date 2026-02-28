import { allowOptions, cors, json, readBody } from "./_lib/http.js";

const DEFAULT_MODEL = "gemini-3.1-flash-image-preview";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export default async function handler(req, res) {
  if (allowOptions(req, res)) return;
  cors(res);

  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json(res, 500, { error: "GEMINI_API_KEY not configured" });

  try {
    const { prompt, aspectRatio = "16:9", model } = await readBody(req);
    if (!prompt || typeof prompt !== "string") {
      return json(res, 400, { error: "prompt is required" });
    }

    const geminiModel = model || process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL;
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
      return json(res, response.status, { error: `Gemini API error: ${err}` });
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData);

    if (!imagePart) {
      return json(res, 502, { error: "No image returned from Gemini" });
    }

    return json(res, 200, {
      ok: true,
      image: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || "image/png",
    });
  } catch (error) {
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
