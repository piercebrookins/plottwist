import { allowOptions, cors, json, readBody } from "../_lib/http.js";
import { saveRoomSession } from "../_lib/roomStore.js";

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const roomCode = () => Math.random().toString(36).slice(2, 6).toUpperCase();

const AVATARS = ["😎", "🤓", "🤪", "😈", "👽", "👻", "🦄", "🍕", "🎸", "🚀", "🐱", "🐶", "🦊", "🐸"];
const PLAYER_COLORS = ["#4ADE80", "#60A5FA", "#F472B6", "#A78BFA", "#FB923C", "#F87171", "#2DD4BF", "#FACC15"];

const DEFAULT_SETTINGS = {
  rounds: 3,
  submitSeconds: 30,
  voteSeconds: 20,
  revealStyle: "dramatic narration",
  memoryLimit: 5,
  tieMode: "split",
  promptPack: "noir",
  problemStatement: "film",
  mediaMode: "video",
};

export default async function handler(req, res) {
  const trace = `[rooms/create ${Date.now()}]`;
  if (allowOptions(req, res)) return;
  cors(res);
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const body = await readBody(req);
    const hostName = String(body.hostName || "Host").trim().slice(0, 20) || "Host";
    console.log(trace, "request", { hostName });

    const hostPlayer = {
      id: uid(),
      name: hostName,
      score: 0,
      connected: true,
      isHost: true,
      streak: 0,
      callbackBonusCount: 0,
      avatar: AVATARS[0],
      color: PLAYER_COLORS[0],
    };

    const session = {
      id: uid(),
      roomCode: roomCode(),
      createdAt: Date.now(),
      status: "lobby",
      roundIndex: 0,
      settings: { ...DEFAULT_SETTINGS },
      players: [hostPlayer],
      rounds: [],
      memory: [],
    };

    const saved = await saveRoomSession(session);
    console.log(trace, "created", { roomCode: saved.roomCode, hostPlayerId: hostPlayer.id });
    return json(res, 200, { session: saved, playerId: hostPlayer.id });
  } catch (error) {
    console.error(trace, "error", { message: error.message, stack: error.stack });
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
