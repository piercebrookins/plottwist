import { useEffect, useMemo, useState } from "react";
import { loadSession, saveSession, syncListener } from "../game/storage";

export const useSessionStore = (roomCode) => {
  const [session, setSession] = useState(() => (roomCode ? loadSession(roomCode) : null));

  useEffect(() => {
    if (!roomCode) return;
    setSession(loadSession(roomCode));
  }, [roomCode]);

  useEffect(() => {
    if (!roomCode) return;
    return syncListener(() => {
      const next = loadSession(roomCode);
      if (next) setSession(next);
    });
  }, [roomCode]);

  const actions = useMemo(
    () => ({
      update(nextSession) {
        setSession(nextSession);
        saveSession(nextSession);
      },
    }),
    []
  );

  return { session, ...actions };
};
