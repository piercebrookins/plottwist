const COOKIE_KEY = "plottwist_identity_v1";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const TAB_KEY = "plottwist_tab_id_v1";

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const getTabId = () => {
  const existing = sessionStorage.getItem(TAB_KEY);
  if (existing) return existing;
  const created = uid();
  sessionStorage.setItem(TAB_KEY, created);
  return created;
};

const parseCookie = () => {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_KEY}=`));
  if (!match) return {};

  try {
    return JSON.parse(decodeURIComponent(match.split("=")[1]));
  } catch {
    return {};
  }
};

const writeCookie = (value) => {
  const encoded = encodeURIComponent(JSON.stringify(value));
  document.cookie = `${COOKIE_KEY}=${encoded}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

export const getIdentityForTab = () => {
  const tabId = getTabId();
  const all = parseCookie();
  const entry = all[tabId];
  if (!entry) return { tabId, roomCode: null, playerId: null };
  return {
    tabId,
    roomCode: entry.roomCode || null,
    playerId: entry.playerId || null,
  };
};

export const saveIdentityForTab = ({ roomCode, playerId }) => {
  const tabId = getTabId();
  const all = parseCookie();
  all[tabId] = { roomCode: roomCode || null, playerId: playerId || null, updatedAt: Date.now() };
  writeCookie(all);
};

export const clearIdentityForTab = () => {
  const tabId = getTabId();
  const all = parseCookie();
  delete all[tabId];
  writeCookie(all);
};
