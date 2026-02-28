import { redis } from "./redis.js";

const TTL_SECONDS = 60 * 60 * 2;
const roomKey = (code) => `room:${String(code || "").toUpperCase()}`;
const mediaKey = (roomCode, mediaId) =>
  `room-media:${String(roomCode || "").toUpperCase()}:${String(mediaId || "")}`;

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

export const saveRoomMedia = async ({ roomCode, mediaId, dataUrl, mimeType = "image/png" }) => {
  if (!roomCode || !mediaId || !dataUrl) throw new Error("Missing roomCode/mediaId/dataUrl");
  const payload = { roomCode, mediaId, dataUrl, mimeType, updatedAt: Date.now() };
  await redis.setex(mediaKey(roomCode, mediaId), TTL_SECONDS, JSON.stringify(payload));
  return payload;
};

export const loadRoomMedia = async ({ roomCode, mediaId }) => {
  if (!roomCode || !mediaId) return null;
  const raw = await redis.get(mediaKey(roomCode, mediaId));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
