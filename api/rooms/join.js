import { allowOptions, cors, json, readBody } from "../_lib/http.js";
import { loadRoomSession, saveRoomSession } from "../_lib/roomStore.js";

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const AVATARS = ["😎", "🤓", "🤪", "😈", "👽", "👻", "🦄", "🍕", "🎸", "🚀", "🐱", "🐶", "🦊", "🐸"];
const PLAYER_COLORS = ["#4ADE80", "#60A5FA", "#F472B6", "#A78BFA", "#FB923C", "#F87171", "#2DD4BF", "#FACC15"];

export default async function handler(req, res) {
  if (allowOptions(req, res)) return;
  cors(res);
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const body = await readBody(req);
    const roomCode = String(body.roomCode || "").toUpperCase();
    const name = String(body.name || "Player").trim().slice(0, 20) || "Player";

    const session = await loadRoomSession(roomCode);
    if (!session) return json(res, 404, { error: "Room not found" });

    const existingName = session.players.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (existingName) return json(res, 200, { session, playerId: existingName.id });

    if ((session.players?.length || 0) >= 10) return json(res, 400, { error: "Room is full" });

    const idx = session.players.length;
    const player = {
      id: uid(),
      name,
      score: 0,
      connected: true,
      isHost: false,
      streak: 0,
      callbackBonusCount: 0,
      avatar: AVATARS[idx % AVATARS.length],
      color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
    };

    const next = { ...session, players: [...session.players, player] };
    const saved = await saveRoomSession(next);
    return json(res, 200, { session: saved, playerId: player.id });
  } catch (error) {
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
