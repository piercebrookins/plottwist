const jsonHeaders = { "Content-Type": "application/json" };

const parse = async (res) => {
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || `Request failed (${res.status})`);
  return payload;
};

export const apiCreateRoom = async (hostName) => {
  const res = await fetch("/api/rooms/create", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ hostName }),
  });
  return parse(res);
};

export const apiJoinRoom = async ({ roomCode, name }) => {
  const res = await fetch("/api/rooms/join", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ roomCode, name }),
  });
  return parse(res);
};

export const apiGetRoomSession = async (roomCode) => {
  const res = await fetch(`/api/rooms/session?code=${encodeURIComponent(roomCode)}`);
  return parse(res);
};

export const apiUpdateRoomSession = async ({ session, expectedUpdatedAt }) => {
  const res = await fetch("/api/rooms/update", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ session, expectedUpdatedAt }),
  });
  return parse(res);
};
