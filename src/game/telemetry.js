export const sendLobbyHeartbeat = async (session) => {
  if (!session) return;

  const payload = {
    roomCode: session.roomCode,
    playerCount: session.players?.length || 0,
    status: session.status,
    roundIndex: session.roundIndex || 0,
    roundsConfigured: session.settings?.rounds || 3,
  };

  try {
    await fetch("/api/lobbies/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // telemetry failures should never break gameplay
  }
};
