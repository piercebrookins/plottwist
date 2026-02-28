import { VALID_STATUSES } from "./constants";

export const validateHeartbeat = (payload) => {
  const roomCode = String(payload.roomCode || "").trim().toUpperCase();
  const playerCount = Number(payload.playerCount);
  const status = String(payload.status || "").trim();
  const roundIndex = Number(payload.roundIndex);
  const roundsConfigured = Number(payload.roundsConfigured);

  if (!/^[A-Z0-9]{4}$/.test(roomCode)) return { ok: false, error: "Invalid roomCode" };
  if (!Number.isFinite(playerCount) || playerCount < 0 || playerCount > 10) {
    return { ok: false, error: "Invalid playerCount" };
  }
  if (!VALID_STATUSES.has(status)) return { ok: false, error: "Invalid status" };
  if (!Number.isFinite(roundIndex) || roundIndex < 0 || roundIndex > 20) {
    return { ok: false, error: "Invalid roundIndex" };
  }
  if (!Number.isFinite(roundsConfigured) || roundsConfigured < 1 || roundsConfigured > 20) {
    return { ok: false, error: "Invalid roundsConfigured" };
  }

  return {
    ok: true,
    value: { roomCode, playerCount, status, roundIndex, roundsConfigured },
  };
};
