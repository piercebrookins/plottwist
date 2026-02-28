import { useState } from "react";
import { GAME_LIMITS } from "../game/constants";
import { Screen } from "./Layout";

export const LandingView = ({ onCreate, onJoin }) => {
  const [hostName, setHostName] = useState("Host");
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");

  return (
    <Screen
      title="PlotTwist"
      subtitle="Jackbox-for-movies chaos machine. Make twists. Farm votes. Create cursed cinema."
    >
      <div className="grid two">
        <div className="card">
          <h3>Create room</h3>
          <input
            value={hostName}
            maxLength={GAME_LIMITS.MAX_PLAYER_NAME}
            onChange={(e) => setHostName(e.target.value)}
            placeholder="Host name"
          />
          <button onClick={() => onCreate(hostName)}>Start as host</button>
        </div>
        <div className="card">
          <h3>Join room</h3>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Room code"
            maxLength={4}
          />
          <input
            value={joinName}
            maxLength={GAME_LIMITS.MAX_PLAYER_NAME}
            onChange={(e) => setJoinName(e.target.value)}
            placeholder="Display name"
          />
          <button onClick={() => onJoin(joinCode, joinName)}>Join game</button>
        </div>
      </div>
    </Screen>
  );
};
