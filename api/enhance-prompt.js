import { allowOptions, cors, json, readBody } from "./_lib/http.js";
import { createLogger } from "./_lib/vercelLog.js";

const DEFAULT_MODEL = "gemini-2.5-flash-lite";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const SYSTEM_INSTRUCTION =
  "You are an image-prompt engineer. Given a game scenario (prompt + twist + optional memory), " +
  "write a vivid 2-3 sentence image generation prompt. Focus on visual details, lighting, " +
  "composition, and mood. Do NOT include any text-in-image instructions. Output ONLY the prompt.";

export default async function handler(req, res) {
  const logger = createLogger("enhance-prompt");
  if (allowOptions(req, res)) return;
  cors(res);

  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.error("missing-gemini-api-key");
    return json(res, 500, { error: "GEMINI_API_KEY not configured" });
  }

  try {
    const { prompt, twist, memory, style } = await readBody(req);
    logger.info("request", {
      promptChars: (prompt || "").length,
      twistChars: (twist || "").length,
      memoryCount: Array.isArray(memory) ? memory.length : 0,
      style,
    });
    if (!prompt || !twist) {
      return json(res, 400, { error: "prompt and twist are required" });
    }

    const memoryText = Array.isArray(memory) && memory.length
      ? ` Previous callbacks: ${memory.map((m) => m.twist).join("; ")}.`
      : "";

    const userMessage =
      `Game prompt: "${prompt}"\n` +
      `Player twist: "${twist}"\n` +
      (style ? `Style: ${style}\n` : "") +
      (memoryText ? `Memory:${memoryText}\n` : "") +
      `\nWrite a vivid image generation prompt for this scene.`;

    const geminiModel = process.env.GEMINI_ENHANCE_MODEL || DEFAULT_MODEL;
    logger.info("calling-gemini", { model: geminiModel });
    const response = await fetch(`${GEMINI_BASE}/${geminiModel}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ parts: [{ text: userMessage }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 200 },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      logger.error("gemini-http-error", { status: response.status, body: err?.slice?.(0, 400) });
      return json(res, response.status, { error: `Gemini API error: ${err}` });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      logger.error("no-text-returned");
      return json(res, 502, { error: "No text returned from Gemini" });
    }

    logger.info("ok", { enhancedChars: text.trim().length });
    return json(res, 200, { ok: true, enhancedPrompt: text.trim() });
  } catch (error) {
    logger.error("error", { message: error.message, stack: error.stack });
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
