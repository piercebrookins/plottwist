export const LOBBY_TTL_SECONDS = 180;
export const INDEX_KEY = "lobbies:index";
export const RATE_LIMIT_WINDOW_MS = 5000;
export const RATE_LIMIT_MAX_HITS = 2;

export const VALID_STATUSES = new Set([
  "lobby",
  "prompt",
  "submit",
  "generate",
  "vote",
  "reveal",
  "round-result",
  "final-result",
]);
