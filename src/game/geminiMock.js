import { pickDemoVideo } from "./videoMock";
import { pickDemoImage } from "./imageMock";
import { pickPlaceholderMedia } from "./placeholderMock";

const PROFANITY = ["damn", "hell", "shit", "fuck"];

const hasProfanity = (text) =>
  PROFANITY.some((word) => text.toLowerCase().includes(word.toLowerCase()));

const blocked = (text) => hasProfanity(text);

const oneSentence = (text) => {
  const clean = text.replace(/\n+/g, " ").trim();
  const first = clean.match(/[^.!?]+[.!?]?/);
  const sentence = (first?.[0] || clean).trim();
  return sentence.endsWith(".") || sentence.endsWith("!") || sentence.endsWith("?")
    ? sentence
    : `${sentence}.`;
};

const normalizeTwistPhrase = (text) => {
  const raw = String(text || "").trim();
  if (!raw) return "the winning twist";
  return raw.replace(/^["'“”‘’]+|["'“”‘’]+$/g, "");
};

export const generateContinuationPrompt = async ({
  roundOnePrompt,
  winningTwist,
  problemStatement,
}) => {
  await new Promise((r) => setTimeout(r, 250 + Math.random() * 500));

  const lensByProblem = {
    music: "as a music-driven interactive beat drop",
    film: "as a non-linear cinematic escalation",
    gaming: "as a persistent game-world consequence",
  };

  const lens = lensByProblem[problemStatement] || lensByProblem.film;
  const twist = normalizeTwistPhrase(winningTwist);
  const basePrompt = String(roundOnePrompt || "the original setup").trim();
  const draft = `Round 2: Build the next scene ${lens}. Continue from "${basePrompt}" and escalate the winning twist "${twist}" into a bigger, unexpected consequence.`;
  return oneSentence(draft);
};

export const generateScene = async ({ prompt, twist, memory, style, mediaMode = "video" }) => {
  const timedOut = Math.random() < 0.08;

  await new Promise((r) => setTimeout(r, 350 + Math.random() * 700));

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

  if (timedOut) {
    const mediaUrl = mediaMode === "image" ? pickDemoImage(twist) : pickDemoVideo(twist);
    return {
      safetyStatus: "timeout",
      generatedScene: `In a sudden turn, ${twist}. The crowd gasps as this revelation reshapes the case in seconds.`,
      usedMemory: false,
      fallback: true,
      mediaType: mediaMode,
      mediaUrl,
      mediaProvider: mediaMode === "image" ? "imagen-mock" : "veo3-mock",
      videoUrl: mediaMode === "video" ? mediaUrl : null,
      imageUrl: mediaMode === "image" ? mediaUrl : null,
    };
  }

  const memoryText = memory.length ? ` Callback echoes: ${memory.map((m) => m.twist).join("; ")}.` : "";
  const usedMemory = memory.length > 0 && Math.random() > 0.4;

  const narration =
    style === "mini screenplay"
      ? `INT. CHAOTIC SET - NIGHT\nPrompt: ${prompt}\nTwist: ${twist}.\nA beat of silence. Then everyone realizes this changes everything.${
          usedMemory ? memoryText : ""
        }`
      : `Under flickering lights, ${twist}. The narrator leans in, voice trembling, while the room recalculates fate.${
          usedMemory ? memoryText : ""
        }`;

  const mediaUrl = mediaMode === "image" ? pickDemoImage(twist) : pickDemoVideo(twist);
  return {
    safetyStatus: "safe",
    generatedScene: narration,
    usedMemory,
    fallback: false,
    mediaType: mediaMode,
    mediaUrl,
    mediaProvider: mediaMode === "image" ? "imagen-mock" : "veo3-mock",
    videoUrl: mediaMode === "video" ? mediaUrl : null,
    imageUrl: mediaMode === "image" ? mediaUrl : null,
  };
};
