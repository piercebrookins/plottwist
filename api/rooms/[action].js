import { allowOptions, cors, json, readBody } from "../_lib/http.js";
import {
  loadRoomMedia,
  loadRoomSession,
  saveRoomMedia,
  saveRoomSession,
} from "../_lib/roomStore.js";
import { createLogger } from "../_lib/vercelLog.js";

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
  promptPack: "quiplash",
  problemStatement: "film",
  mediaMode: "video",
};

const parseDataUrl = (dataUrl) => {
  const [meta, base64] = String(dataUrl || "").split(",");
  if (!meta || !base64) return null;
  const mimeMatch = meta.match(/^data:([^;]+);base64$/);
  if (!mimeMatch) return null;
  return { mimeType: mimeMatch[1], base64 };
};

const getAction = (req) => {
  const value = req.query?.action;
  if (Array.isArray(value)) return value[0] || "";
  return String(value || "");
};

const requireMethod = (req, res, method) => {
  if (req.method === method) return true;
  json(res, 405, { error: "Method not allowed" });
  return false;
};

const handlers = {
  async create(req, res, logger) {
    if (!requireMethod(req, res, "POST")) return;
    const body = await readBody(req);
    const hostName = String(body.hostName || "Host").trim().slice(0, 20) || "Host";
    logger.info("request", { hostName });

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
    logger.info("created", { roomCode: saved.roomCode, hostPlayerId: hostPlayer.id });
    return json(res, 200, { session: saved, playerId: hostPlayer.id });
  },

  async join(req, res, logger) {
    if (!requireMethod(req, res, "POST")) return;
    const body = await readBody(req);
    const rc = String(body.roomCode || "").toUpperCase();
    const name = String(body.name || "Player").trim().slice(0, 20) || "Player";
    logger.info("request", { roomCode: rc, name });

    const session = await loadRoomSession(rc);
    if (!session) {
      logger.warn("room-missing", { roomCode: rc });
      return json(res, 404, { error: "Room not found" });
    }

    const existingName = session.players.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (existingName) {
      logger.info("existing-player", { roomCode: rc, playerId: existingName.id });
      return json(res, 200, { session, playerId: existingName.id });
    }

    if ((session.players?.length || 0) >= 10) {
      logger.warn("room-full", { roomCode: rc, playerCount: session.players?.length || 0 });
      return json(res, 400, { error: "Room is full" });
    }

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
    logger.info("joined", { roomCode: saved.roomCode, playerId: player.id });
    return json(res, 200, { session: saved, playerId: player.id });
  },

  async session(req, res, logger) {
    if (!requireMethod(req, res, "GET")) return;
    const url = new URL(req.url, "http://localhost");
    const code = String(url.searchParams.get("code") || "").toUpperCase();

    if (!code) {
      logger.warn("missing-code");
      return json(res, 400, { error: "Missing room code" });
    }

    const session = await loadRoomSession(code);
    if (!session) {
      logger.warn("room-missing", { code });
      return json(res, 404, { error: "Room not found" });
    }

    logger.info("ok", { code, status: session.status, players: session.players?.length || 0 });
    return json(res, 200, { session });
  },

  async update(req, res, logger) {
    if (!requireMethod(req, res, "POST")) return;
    const body = await readBody(req);
    const session = body.session;

    if (!session?.roomCode) {
      logger.warn("missing-roomcode");
      return json(res, 400, { error: "Missing session.roomCode" });
    }

    const current = await loadRoomSession(session.roomCode);
    if (!current) {
      logger.warn("room-missing", { roomCode: session.roomCode });
      return json(res, 404, { error: "Room not found" });
    }

    const incomingVersion = Number(body.expectedUpdatedAt || 0);
    const currentVersion = Number(current.updatedAt || current.createdAt || 0);

    if (incomingVersion && incomingVersion !== currentVersion) {
      logger.warn("version-conflict", { roomCode: session.roomCode, incomingVersion, currentVersion });
      return json(res, 409, { error: "Version conflict", session: current });
    }

    const saved = await saveRoomSession(session);
    logger.info("saved", { roomCode: saved.roomCode, status: saved.status, players: saved.players?.length || 0 });
    return json(res, 200, { session: saved });
  },

  async "media-save"(req, res, logger) {
    if (!requireMethod(req, res, "POST")) return;
    const { roomCode: rc, mediaId, dataUrl, mimeType } = await readBody(req);

    if (!rc || !mediaId || !dataUrl) {
      return json(res, 400, { error: "roomCode, mediaId, dataUrl required" });
    }

    const saved = await saveRoomMedia({ roomCode: rc, mediaId, dataUrl, mimeType });
    logger.info("saved", { roomCode: rc, mediaId, chars: dataUrl.length });

    return json(res, 200, {
      ok: true,
      mediaUrl: `/api/rooms/media-get?roomCode=${encodeURIComponent(rc)}&mediaId=${encodeURIComponent(mediaId)}`,
      mimeType: saved.mimeType,
    });
  },

  async "media-get"(req, res, logger) {
    if (!requireMethod(req, res, "GET")) return;
    const url = new URL(req.url, "http://localhost");
    const rc = String(url.searchParams.get("roomCode") || "").toUpperCase();
    const mediaId = String(url.searchParams.get("mediaId") || "");

    if (!rc || !mediaId) return json(res, 400, { error: "roomCode and mediaId required" });

    const media = await loadRoomMedia({ roomCode: rc, mediaId });
    if (!media) {
      logger.warn("missing", { roomCode: rc, mediaId });
      return json(res, 404, { error: "Media not found" });
    }

    const parsed = parseDataUrl(media.dataUrl);
    if (!parsed) return json(res, 500, { error: "Invalid media data" });

    const bytes = Buffer.from(parsed.base64, "base64");
    res.statusCode = 200;
    res.setHeader("Content-Type", media.mimeType || parsed.mimeType || "image/png");
    res.setHeader("Cache-Control", "public, max-age=60");
    return res.end(bytes);
  },
};

export default async function handler(req, res) {
  if (allowOptions(req, res)) return;
  cors(res);

  const action = getAction(req);
  const logger = createLogger(`rooms/${action || "unknown"}`);

  try {
    const fn = handlers[action];
    if (!fn) return json(res, 404, { error: "Unknown rooms action" });
    return await fn(req, res, logger);
  } catch (error) {
    logger.error("unhandled", { message: error.message, stack: error.stack });
    return json(res, 500, { error: error.message || "Internal error" });
  }
}
