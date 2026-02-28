export const GAME_STAGES = {
  LOBBY: "lobby",
  PROMPT: "prompt",
  SUBMIT: "submit",
  GENERATE: "generate",
  VOTE: "vote",
  REVEAL: "reveal",
  ROUND_RESULT: "round-result",
  FINAL_RESULT: "final-result",
};

export const PROMPT_PACKS = {
  noir: [
    "A detective discovers the killer is actually…",
    "The missing briefcase contains…",
    "At midnight, the city lights reveal…",
    "The suspect’s alibi falls apart when…",
    "The final clue points to…",
  ],
  sciFi: [
    "The spaceship AI suddenly confesses…",
    "On Mars, the colony uncovers…",
    "The time machine only works if…",
    "First contact goes wrong when…",
    "The galaxy’s oldest signal says…",
  ],
  fantasy: [
    "The royal wizard has been hiding…",
    "In the forbidden forest, we find…",
    "The dragon only obeys someone who…",
    "The prophecy was mistranslated as…",
    "At the castle gates appears…",
  ],
};

export const HACKATHON_PROBLEM_STATEMENTS = {
  music: "Gemini and Music",
  film: "Gemini and Film",
  gaming: "Gemini and Gaming",
};

export const MEDIA_MODES = {
  VIDEO: "video",
  IMAGE: "image",
  PLACEHOLDER: "placeholder",
};

export const DEFAULT_SETTINGS = {
  rounds: 3,
  submitSeconds: 30,
  voteSeconds: 20,
  revealStyle: "dramatic narration",
  memoryLimit: 5,
  tieMode: "split",
  promptPack: "noir",
  problemStatement: "film",
  mediaMode: MEDIA_MODES.VIDEO,
};

export const FALLBACK_TWIST = "No twist submitted";
export const MAX_PLAYERS = 10;
export const MIN_PLAYERS = 3;

export const GAME_LIMITS = {
  MIN_ANSWER_LENGTH: 3,
  MAX_ANSWER_LENGTH: 80,
  MAX_PLAYER_NAME: 15,
  MAX_ROOM_CODE: 4,
};

export const AVATARS = [
  "😎",
  "🤓",
  "🤪",
  "😈",
  "👽",
  "👻",
  "🦄",
  "🍕",
  "🎸",
  "🚀",
  "🐱",
  "🐶",
  "🦊",
  "🐸",
  "🎭",
  "👑",
];

export const PLAYER_COLORS = [
  "#4ADE80",
  "#60A5FA",
  "#F472B6",
  "#A78BFA",
  "#FB923C",
  "#F87171",
  "#2DD4BF",
  "#FACC15",
];
