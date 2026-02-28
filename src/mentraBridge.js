const ENV_HTTP_ENDPOINT = import.meta.env.VITE_MENTRA_BRIDGE_HTTP_URL || "";
const ENV_WS_ENDPOINT = import.meta.env.VITE_MENTRA_BRIDGE_WS_URL || "";
const BRIDGE_TOKEN = import.meta.env.VITE_MENTRA_BRIDGE_TOKEN || "";

const BRIDGE_HTTP_STORAGE_KEY = "plottwist_bridge_http_url";
const BRIDGE_WS_STORAGE_KEY = "plottwist_bridge_ws_url";

let socket = null;
let connectTimer = null;
let eventSeq = 0;
let warnedNoEndpoint = false;

const isBrowser = typeof window !== "undefined";

const readStoredValue = (key) => {
  if (!isBrowser) return "";
  try {
    return window.localStorage.getItem(key) || "";
  } catch {
    return "";
  }
};

const writeStoredValue = (key, value) => {
  if (!isBrowser) return;
  try {
    if (value) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // no-op
  }
};

const queryParam = (name) => {
  if (!isBrowser) return "";
  const value = new URLSearchParams(window.location.search).get(name) || "";
  return value.trim();
};

const resolveHttpEndpoint = () => {
  const fromQuery = queryParam("bridge_http");
  if (fromQuery) {
    writeStoredValue(BRIDGE_HTTP_STORAGE_KEY, fromQuery);
    return fromQuery;
  }

  const fromStorage = readStoredValue(BRIDGE_HTTP_STORAGE_KEY);
  if (fromStorage) {
    return fromStorage;
  }

  return ENV_HTTP_ENDPOINT.trim();
};

const resolveWsEndpoint = () => {
  const fromQuery = queryParam("bridge_ws");
  if (fromQuery) {
    writeStoredValue(BRIDGE_WS_STORAGE_KEY, fromQuery);
    return fromQuery;
  }

  const fromStorage = readStoredValue(BRIDGE_WS_STORAGE_KEY);
  if (fromStorage) {
    return fromStorage;
  }

  return ENV_WS_ENDPOINT.trim();
};

const safeClose = () => {
  if (!socket) return;
  try {
    socket.close();
  } catch {
    // no-op
  }
  socket = null;
};

const ensureSocket = () => {
  const wsEndpoint = resolveWsEndpoint();
  if (!wsEndpoint) {
    return;
  }

  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  safeClose();
  socket = new WebSocket(wsEndpoint);

  socket.addEventListener("close", () => {
    if (connectTimer) clearTimeout(connectTimer);
    connectTimer = setTimeout(() => {
      ensureSocket();
    }, 1200);
  });

  socket.addEventListener("error", () => {
    safeClose();
  });
};

const normalizePhase = (status) => {
  if (!status) return "lobby";
  if (status === "round-result") return "results";
  if (status === "final-result") return "final";
  if (status === "prompt") return "submit";
  if (status === "generate") return "watch";
  return status;
};

const toLeaderboard = (session, playerId) => {
  if (!session?.players?.length) return [];

  return [...session.players]
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .map((player, index) => ({
      playerId: player.id,
      name: player.name,
      score: player.score,
      rank: index + 1,
      isSelf: player.id === playerId,
    }));
};

const currentPlayerSummary = (session, playerId) => {
  const leaderboard = toLeaderboard(session, playerId);
  const me = leaderboard.find((entry) => entry.playerId === playerId);
  return {
    leaderboard,
    points: me?.score ?? 0,
    rank: me?.rank,
  };
};

const publishViaHttp = async (envelope) => {
  const httpEndpoint = resolveHttpEndpoint();
  if (!httpEndpoint) {
    return false;
  }

  try {
    const response = await fetch(httpEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(BRIDGE_TOKEN ? { "x-bridge-token": BRIDGE_TOKEN } : {}),
      },
      body: JSON.stringify(envelope),
      keepalive: true,
    });

    if (!response.ok) {
      console.warn("[mentra-bridge] HTTP publish failed", {
        status: response.status,
        endpoint: httpEndpoint,
      });
    }

    return response.ok;
  } catch (error) {
    console.warn("[mentra-bridge] HTTP publish error", {
      endpoint: httpEndpoint,
      error: String(error),
    });
    return false;
  }
};

const publishViaWs = (envelope) => {
  const wsEndpoint = resolveWsEndpoint();
  if (!wsEndpoint) {
    return false;
  }

  ensureSocket();
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false;
  }

  try {
    socket.send(JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
};

export const publishMentraStatus = ({ session, playerId }) => {
  if (!session?.roomCode) {
    return;
  }

  const httpEndpoint = resolveHttpEndpoint();
  const wsEndpoint = resolveWsEndpoint();
  if (!httpEndpoint && !wsEndpoint && !warnedNoEndpoint) {
    warnedNoEndpoint = true;
    console.warn(
      "[mentra-bridge] No bridge endpoint configured. Set VITE_MENTRA_BRIDGE_HTTP_URL or open with ?bridge_http=<url>."
    );
  }

  const { leaderboard, points, rank } = currentPlayerSummary(session, playerId);
  const payload = {
    roomCode: session.roomCode,
    phase: normalizePhase(session.status),
    connected: true,
    points,
    rank,
    lobbyPlayers: session.players?.length || 0,
    lobbyCapacity: 10,
    leaderboard,
  };

  eventSeq += 1;
  const envelope = {
    type: "status_update",
    eventSeq,
    ts: new Date().toISOString(),
    payload,
  };

  publishViaHttp(envelope).catch(() => {
    // no-op
  });
  publishViaWs(envelope);
};
