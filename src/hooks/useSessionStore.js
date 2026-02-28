import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGetRoomSession, apiUpdateRoomSession } from "../game/roomApi";

export const useSessionStore = (roomCode) => {
  const [session, setSession] = useState(null);

  const refresh = useCallback(async () => {
    if (!roomCode) {
      setSession(null);
      return;
    }

    try {
      const { session: remote } = await apiGetRoomSession(roomCode);
      setSession(remote || null);
    } catch {
      setSession(null);
    }
  }, [roomCode]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!roomCode) return undefined;
    const timer = window.setInterval(refresh, 1000);
    return () => window.clearInterval(timer);
  }, [roomCode, refresh]);

  const actions = useMemo(
    () => ({
      async update(nextSession) {
        if (!nextSession?.roomCode) return;

        const expectedUpdatedAt = session?.updatedAt || 0;

        try {
          const { session: saved } = await apiUpdateRoomSession({
            session: nextSession,
            expectedUpdatedAt,
          });
          setSession(saved || nextSession);
        } catch {
          await refresh();
        }
      },
    }),
    [session?.updatedAt, refresh]
  );

  return { session, ...actions };
};
