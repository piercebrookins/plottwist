import { allowOptions, cors, json, readBody } from "./_lib/http.js";

const DEFAULT_MODEL = "gemini-2.0-flash";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const SYSTEM_INSTRUCTION =
  "You are an image-prompt engineer. Given a game scenario (prompt + twist + optional memory), " +
  "write a vivid 2-3 sentence image generation prompt. Focus on visual details, lighting, " +
  "composition, and mood. Do NOT include any text-in-image instructions. Output ONLY the prompt.";

export default async function handler(req, res) {
  if (allowOptions(req, res)) return;
  cors(res);

  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json(res, 500, { error: "GEMINI_API_KEY not configured" });

  try {
    const { prompt, twist, memory, style } = await readBody(req);
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
      return json(res, response.status, { error: `Gemini API error: ${err}` });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return json(res, 502, { error: "No text returned from Gemini" });
    }

    return json(res, 200, { ok: true, enhancedPrompt: text.trim() });
  } catch (error) {
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
