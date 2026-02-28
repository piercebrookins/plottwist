import { redis } from "./redis.js";

const TTL_SECONDS = 60 * 60 * 2;
const roomKey = (code) => `room:${String(code || "").toUpperCase()}`;

export const saveRoomSession = async (session) => {
  if (!session?.roomCode) throw new Error("Missing roomCode on session");
  const next = { ...session, updatedAt: Date.now() };
  await redis.setex(roomKey(next.roomCode), TTL_SECONDS, JSON.stringify(next));
  return next;
};

export const loadRoomSession = async (roomCode) => {
  const raw = await redis.get(roomKey(roomCode));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
