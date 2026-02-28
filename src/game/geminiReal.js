import { pickDemoImage } from "./imageMock";
import { pickDemoVideo } from "./videoMock";
import { pickPlaceholderMedia } from "./placeholderMock";
import { generateImage } from "./geminiImage";
import { generateVideo } from "./geminiVideo";

// Re-export text-only helper unchanged
export { generateContinuationPrompt } from "./geminiMock";

const PROFANITY = ["damn", "hell", "shit", "fuck"];

const hasProfanity = (text) =>
  PROFANITY.some((word) => text.toLowerCase().includes(word.toLowerCase()));

const blocked = (text) => hasProfanity(text);

const TIMEOUT_MS = 30_000;

/** Call the enhance-prompt endpoint; returns enhanced text or null on failure. */
async function enhancePrompt({ prompt, twist, memory, style, trace }) {
  const startedAt = performance.now();
  try {
    console.log(`[${trace}] enhance:start`, { memoryCount: memory?.length || 0, style });
    const res = await fetch("/api/enhance-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, twist, memory, style }),
    });
    if (!res.ok) {
      console.warn(`[${trace}] enhance:http-fail`, { status: res.status });
      return null;
    }
    const { enhancedPrompt } = await res.json();
    console.log(`[${trace}] enhance:ok`, {
      ms: Math.round(performance.now() - startedAt),
      chars: (enhancedPrompt || "").length,
    });
    return enhancedPrompt || null;
  } catch (error) {
    console.error(`[${trace}] enhance:error`, error);
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
  const trace = `gen-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const startedAt = performance.now();
  console.log(`[${trace}] generate:start`, {
    mediaMode,
    promptChars: (prompt || "").length,
    twistChars: (twist || "").length,
    memoryCount: memory?.length || 0,
    style,
  });

  // Placeholder mode — pass through unchanged
  if (mediaMode === "placeholder") {
    console.log(`[${trace}] generate:placeholder-mode`);
    const placeholder = pickPlaceholderMedia(twist || prompt);
    const result = {
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
    return result;
  }

  // Profanity filter
  if (blocked(twist)) {
    console.warn(`[${trace}] generate:blocked-by-safety`);
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

  // VIDEO mode — real Veo generation with polling
  if (mediaMode === "video") {
    try {
      const enhanced = await enhancePrompt({ prompt, twist, memory, style, trace });
      const videoPrompt = enhanced || `${prompt}. ${twist}. Cinematic, dramatic lighting.`;

      console.log(`[${trace}] video:start`, {
        videoPromptChars: videoPrompt.length,
        videoPromptPreview: videoPrompt.slice(0, 120),
      });
      const videoStart = performance.now();
      const videoUrl = await generateVideo(videoPrompt);
      console.log(`[${trace}] video:ok`, {
        ms: Math.round(performance.now() - videoStart),
      });

      const memoryText = memory.length ? ` Callback echoes: ${memory.map((m) => m.twist).join("; ")}.` : "";
      const usedMemory = memory.length > 0 && Math.random() > 0.4;
      const narration =
        style === "mini screenplay"
          ? `INT. CHAOTIC SET - NIGHT\nPrompt: ${prompt}\nTwist: ${twist}.\nA beat of silence. Then everyone realizes this changes everything.${usedMemory ? memoryText : ""}`
          : `Under flickering lights, ${twist}. The narrator leans in, voice trembling, while the room recalculates fate.${usedMemory ? memoryText : ""}`;

      const result = {
        safetyStatus: "safe",
        generatedScene: narration,
        usedMemory,
        fallback: false,
        mediaType: "video",
        mediaUrl: videoUrl,
        mediaProvider: "veo-3",
        videoUrl,
        imageUrl: null,
      };

      console.log(`[${trace}] generate:done`, {
        ms: Math.round(performance.now() - startedAt),
        provider: result.mediaProvider,
        fallback: result.fallback,
        safetyStatus: result.safetyStatus,
      });

      return result;
    } catch (err) {
      console.error(`[${trace}] video:error`, {
        message: err?.message,
        ms: Math.round(performance.now() - startedAt),
      });
      const mediaUrl = pickDemoVideo(twist);
      return {
        safetyStatus: err?.message === "timeout" ? "timeout" : "error",
        generatedScene: `In a sudden turn, ${twist}. The crowd gasps as this revelation reshapes the case in seconds.`,
        usedMemory: false,
        fallback: true,
        mediaType: "video",
        mediaUrl,
        mediaProvider: "veo3-mock",
        videoUrl: mediaUrl,
        imageUrl: null,
      };
    }
  }

  // IMAGE mode — real Gemini generation with timeout
  try {
    const result = await withTimeout(
      (async () => {
        // Step 1: enhance prompt (graceful fallback to simple concat)
        const enhanced = await enhancePrompt({ prompt, twist, memory, style, trace });
        const imagePrompt = enhanced || `${prompt}. ${twist}. Cinematic, dramatic lighting.`;

        // Step 2: generate image via Gemini
        console.log(`[${trace}] image:start`, {
          imagePromptChars: imagePrompt.length,
          imagePromptPreview: imagePrompt.slice(0, 120),
        });
        const imageStart = performance.now();
        const dataUrl = await generateImage(imagePrompt);
        console.log(`[${trace}] image:ok`, {
          ms: Math.round(performance.now() - imageStart),
          dataUrlChars: (dataUrl || "").length,
        });

        const memoryText = memory.length ? ` Callback echoes: ${memory.map((m) => m.twist).join("; ")}.` : "";
        const usedMemory = memory.length > 0 && Math.random() > 0.4;
        const narration =
          style === "mini screenplay"
            ? `INT. CHAOTIC SET - NIGHT\nPrompt: ${prompt}\nTwist: ${twist}.\nA beat of silence. Then everyone realizes this changes everything.${usedMemory ? memoryText : ""}`
            : `Under flickering lights, ${twist}. The narrator leans in, voice trembling, while the room recalculates fate.${usedMemory ? memoryText : ""}`;

        const result = {
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

        console.log(`[${trace}] generate:done`, {
          ms: Math.round(performance.now() - startedAt),
          provider: result.mediaProvider,
          fallback: result.fallback,
          safetyStatus: result.safetyStatus,
        });

        return result;
      })(),
      TIMEOUT_MS,
    );

    return result;
  } catch (err) {
    // Timeout or generation failure — graceful fallback to demo image
    console.error(`[${trace}] generate:error`, {
      message: err?.message,
      ms: Math.round(performance.now() - startedAt),
    });
    const mediaUrl = pickDemoImage(twist);
    const result = {
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
    console.warn(`[${trace}] generate:fallback`, {
      provider: result.mediaProvider,
      safetyStatus: result.safetyStatus,
      ms: Math.round(performance.now() - startedAt),
    });
    return result;
  }
};
