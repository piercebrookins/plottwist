const STORAGE_KEY = "plottwist_sessions_v1";
const TTL_MS = 2 * 60 * 1000;

const readRaw = () => {
  const text = localStorage.getItem(STORAGE_KEY);
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

const writeRaw = (obj) => localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));

export const saveSession = (session) => {
  const all = readRaw();
  all[session.roomCode] = { session, touchedAt: Date.now() };
  writeRaw(all);
};

export const loadSession = (roomCode) => {
  const all = readRaw();
  const record = all[roomCode];
  if (!record) return null;
  if (Date.now() - record.touchedAt > TTL_MS) {
    delete all[roomCode];
    writeRaw(all);
    return null;
  }
  return record.session;
};

export const syncListener = (callback) => {
  const handler = (event) => {
    if (event.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
};
