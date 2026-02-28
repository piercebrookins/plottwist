import { pickDemoImage } from "./imageMock";
import { pickDemoVideo } from "./videoMock";
import { pickPlaceholderMedia } from "./placeholderMock";
import { generateImage } from "./geminiImage";

// Re-export text-only helper unchanged
export { generateContinuationPrompt } from "./geminiMock";

const PROFANITY = ["damn", "hell", "shit", "fuck"];

const hasProfanity = (text) =>
  PROFANITY.some((word) => text.toLowerCase().includes(word.toLowerCase()));

const blocked = (text) => hasProfanity(text);

const TIMEOUT_MS = 30_000;

/** Call the enhance-prompt endpoint; returns enhanced text or null on failure. */
async function enhancePrompt({ prompt, twist, memory, style }) {
  try {
    const res = await fetch("/api/enhance-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, twist, memory, style }),
    });
    if (!res.ok) return null;
    const { enhancedPrompt } = await res.json();
    return enhancedPrompt || null;
  } catch {
    return null;
  }
}

/** Wrap a promise with a timeout. Rejects with "timeout" on expiry. */
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

export const generateScene = async ({ prompt, twist, memory, style, mediaMode = "video" }) => {
  // Placeholder mode — pass through unchanged
  if (mediaMode === "placeholder") {
    const placeholder = pickPlaceholderMedia(twist || prompt);
    return {
      safetyStatus: "safe",
      generatedScene: `${placeholder.generatedScene} Prompt: ${prompt} Twist: ${twist}.`,
      usedMemory: false,
      fallback: true,
      mediaType: placeholder.mediaType,
      mediaUrl: placeholder.mediaUrl,
      mediaProvider: placeholder.mediaProvider,
      imageUrl: placeholder.mediaUrl,
      videoUrl: null,
    };
  }

  // Profanity filter
  if (blocked(twist)) {
    const mediaUrl = mediaMode === "image" ? pickDemoImage("safe fallback") : pickDemoVideo("safe fallback");
    return {
      safetyStatus: "blocked",
      generatedScene:
        "Content safety filter stepped in. The cameras cut to static, a dramatic gasp echoes, and the host quickly pivots to the next scene.",
      usedMemory: false,
      fallback: true,
      mediaType: mediaMode,
      mediaUrl,
      mediaProvider: mediaMode === "image" ? "imagen-mock" : "veo3-mock",
      videoUrl: mediaMode === "video" ? mediaUrl : null,
      imageUrl: mediaMode === "image" ? mediaUrl : null,
    };
  }

  // For non-image modes, fall back to mock-style generation (video not yet supported via Gemini)
  if (mediaMode !== "image") {
    const mediaUrl = pickDemoVideo(twist);
    const memoryText = memory.length ? ` Callback echoes: ${memory.map((m) => m.twist).join("; ")}.` : "";
    const usedMemory = memory.length > 0 && Math.random() > 0.4;
    const narration =
      style === "mini screenplay"
        ? `INT. CHAOTIC SET - NIGHT\nPrompt: ${prompt}\nTwist: ${twist}.\nA beat of silence. Then everyone realizes this changes everything.${usedMemory ? memoryText : ""}`
        : `Under flickering lights, ${twist}. The narrator leans in, voice trembling, while the room recalculates fate.${usedMemory ? memoryText : ""}`;
    return {
      safetyStatus: "safe",
      generatedScene: narration,
      usedMemory,
      fallback: false,
      mediaType: mediaMode,
      mediaUrl,
      mediaProvider: "veo3-mock",
      videoUrl: mediaUrl,
      imageUrl: null,
    };
  }

  // IMAGE mode — real Gemini generation with timeout
  try {
    const result = await withTimeout(
      (async () => {
        // Step 1: enhance prompt (graceful fallback to simple concat)
        const enhanced = await enhancePrompt({ prompt, twist, memory, style });
        const imagePrompt = enhanced || `${prompt}. ${twist}. Cinematic, dramatic lighting.`;

        // Step 2: generate image via Gemini
        const dataUrl = await generateImage(imagePrompt);

        const memoryText = memory.length ? ` Callback echoes: ${memory.map((m) => m.twist).join("; ")}.` : "";
        const usedMemory = memory.length > 0 && Math.random() > 0.4;
        const narration =
          style === "mini screenplay"
            ? `INT. CHAOTIC SET - NIGHT\nPrompt: ${prompt}\nTwist: ${twist}.\nA beat of silence. Then everyone realizes this changes everything.${usedMemory ? memoryText : ""}`
            : `Under flickering lights, ${twist}. The narrator leans in, voice trembling, while the room recalculates fate.${usedMemory ? memoryText : ""}`;

        return {
          safetyStatus: "safe",
          generatedScene: narration,
          usedMemory,
          fallback: false,
          mediaType: "image",
          mediaUrl: dataUrl,
          mediaProvider: "gemini-image",
          imageUrl: dataUrl,
          videoUrl: null,
        };
      })(),
      TIMEOUT_MS,
    );

    return result;
  } catch (err) {
    // Timeout or generation failure — graceful fallback to demo image
    const mediaUrl = pickDemoImage(twist);
    return {
      safetyStatus: err.message === "timeout" ? "timeout" : "error",
      generatedScene: `In a sudden turn, ${twist}. The crowd gasps as this revelation reshapes the case in seconds.`,
      usedMemory: false,
      fallback: true,
      mediaType: "image",
      mediaUrl,
      mediaProvider: "imagen-mock",
      imageUrl: mediaUrl,
      videoUrl: null,
    };
  }
};
