import { pickDemoVideo } from "./videoMock";

const PROFANITY = ["damn", "hell", "shit", "fuck"];

const hasProfanity = (text) =>
  PROFANITY.some((word) => text.toLowerCase().includes(word.toLowerCase()));

const blocked = (text) => hasProfanity(text);

export const generateScene = async ({ prompt, twist, memory, style }) => {
  const timedOut = Math.random() < 0.08;

  await new Promise((r) => setTimeout(r, 350 + Math.random() * 700));

  if (blocked(twist)) {
    return {
      safetyStatus: "blocked",
      generatedScene:
        "Content safety filter stepped in. The cameras cut to static, a dramatic gasp echoes, and the host quickly pivots to the next scene.",
      usedMemory: false,
      fallback: true,
      videoUrl: pickDemoVideo("safe fallback"),
      videoProvider: "veo3-mock",
    };
  }

  if (timedOut) {
    return {
      safetyStatus: "timeout",
      generatedScene: `In a sudden turn, ${twist}. The crowd gasps as this revelation reshapes the case in seconds.`,
      usedMemory: false,
      fallback: true,
      videoUrl: pickDemoVideo(twist),
      videoProvider: "veo3-mock",
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

  return {
    safetyStatus: "safe",
    generatedScene: narration,
    usedMemory,
    fallback: false,
    videoUrl: pickDemoVideo(twist),
    videoProvider: "veo3-mock",
  };
};
