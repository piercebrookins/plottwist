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

const QUIPLASH_PROMPTS = [
  "A terrible name for a luxury hotel",
  "The worst thing to hear from your barber",
  "Something you should never say on a first date",
  "A weird thing to keep in your wallet",
  "A bad slogan for a new toothpaste",
  "The strangest thing found in a lost-and-found box",
  "A terrible app to use during a wedding",
  "A secret your neighbor definitely should not share",
  "A terrible flavor for cough syrup",
  "The worst place to suddenly hear applause",
  "Something suspicious to whisper on an elevator",
  "A bad thing to shout at a spelling bee",
  "A strange item to bring to a job interview",
  "The least helpful message from customer support",
  "A terrible mascot for a bank",
  "A bad name for a superhero",
  "The worst song to play at a funeral",
  "A weird rule for using public bathrooms",
  "A terrible thing to engrave on a wedding ring",
  "A suspicious thing to keep in your fridge",
  "A bad theme for a family reunion",
  "A weird thing to hear from your GPS",
  "The worst person to sit beside on a plane",
  "A terrible hobby to brag about",
  "A bad reason to be late to work",
  "A weird thing to find under your bed",
  "A terrible opening line for a speech",
  "The worst thing to accidentally text your boss",
  "A strange item sold in a vending machine",
  "A bad gift for someone you just met",
  "A weird thing to hear during yoga class",
  "A terrible title for a romance movie",
  "A suspicious thing to label as organic",
  "The worst thing to yell at a magic show",
  "A bad password people probably still use",
  "A weird reason someone calls 911",
  "A terrible mascot for a daycare",
  "A bad item to throw at a parade",
  "Something awkward to hear at a baby shower",
  "A weird warning label for socks",
  "A terrible thing to write in a yearbook",
  "A bad job for someone afraid of heights",
  "A strange thing to bring to a potluck",
  "The least inspiring quote for a calendar",
  "A terrible thing to hide in a piñata",
  "A weird side effect of drinking too much coffee",
  "A bad name for a meditation app",
  "A suspicious thing to order at midnight",
  "A terrible thing to yell during hide and seek",
  "A weird place to lose your shoes",
];

export const PROMPT_PACKS = {
  quiplash: QUIPLASH_PROMPTS,
  noir: QUIPLASH_PROMPTS,
  sciFi: QUIPLASH_PROMPTS,
  fantasy: QUIPLASH_PROMPTS,
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
  promptPack: "quiplash",
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
