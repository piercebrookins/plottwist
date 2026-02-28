import { useState } from "react";
import { GAME_LIMITS } from "../game/constants";

export const LandingView = ({ onCreate, onJoin }) => {
  const [hostName, setHostName] = useState("Host");
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");

  return (
    <main className="landing">
      <div className="sky-birds" aria-hidden="true">
        <span className="page-bird bird-a" />
        <span className="page-bird bird-b" />
        <span className="page-bird bird-c" />
        <span className="page-bird bird-d" />
        <span className="page-bird bird-e" />
      </div>
      <div className="landing__noise" aria-hidden="true" />
      <div className="landing__shell">
        <section className="landing__hero">
          <div className="landing__scene-wrap">
            <video
              className="landing-hero-video"
              src="/assets/merged-video.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          </div>
          <div className="landing__content">
            <p className="landing__eyebrow paper-float">Gemini Film + Party Game</p>
            <h1 className="landing__title title-bounce">
              <span className="paper-word">Plot</span>
              <span className="paper-word paper-word--accent twist-word" aria-label="Twist">
                <span className="twist-letter">T</span>
                <span className="twist-letter">w</span>
                <span className="twist-letter">i</span>
                <span className="twist-letter">s</span>
                <span className="twist-letter">t</span>
              </span>
            </h1>
            <p className="landing__tagline">
              Build a chaotic movie timeline with your friends. Submit absurd twists, watch AI cinematic reveals, and
              vote for the most cursed masterpiece.
            </p>
            <div className="landing__phases">
              <span className="paper-chip">Submit</span>
              <span className="paper-chip">Watch</span>
              <span className="paper-chip">Vote</span>
              <span className="paper-chip">Repeat</span>
            </div>
            <p className="landing__robot-note">
              Chaos mode on: genre shifts + rain, snow, flying birds, and a prowling lion.
            </p>
          </div>
        </section>

        <section className="landing__panels">
          <div className="landing-panel landing-panel--create">
            <h3>Create Room</h3>
            <p className="landing-panel__hint">Host a game for 3-10 players and start the story chaos.</p>
            <input
              value={hostName}
              maxLength={GAME_LIMITS.MAX_PLAYER_NAME}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Host name"
            />
            <button className="landing-button" onClick={() => onCreate(hostName)}>
              Start as Host
            </button>
          </div>

          <div className="landing-panel landing-panel--join">
            <h3>Join Room</h3>
            <p className="landing-panel__hint">Enter the code from the host screen and jump into the current round.</p>
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
            <button className="landing-button landing-button--secondary" onClick={() => onJoin(joinCode, joinName)}>
              Join Game
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};
