<div align="center">
  <h1>🍿 PlotTwist</h1>
  <p>
    <b>A multiplayer party game where players write absurd plot twists and the app turns them into dramatic scene reveals.</b>
  </p>
  <p>
    Built with React + Vite, with serverless telemetry endpoints for live lobby monitoring.
  </p>
  <br />
</div>

## 📌 Table of Contents

- [🎮 Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🚀 Local Development](#-local-development)
  - [Environment Variables](#environment-variables)
  - [Commands](#commands)
- [🌐 Deployment](#-deployment-vercel)
- [📡 Telemetry API](#-telemetry-api)
- [🧪 Testing Media Modes](#-testing-media-modes)
- [🚧 Constraints & Roadmap](#-constraints--roadmap)

---

## 🎮 Features

- **Room-based multiplayer flow** with short 4-character join codes.
- **Host-controlled game settings** to fully customize rounds and features.
- **Interactive Round Pipeline**: `Prompt → Write → Generate → Showcase → Vote → Reveal → Scores`
- **Generative Media Modes**:
  - 🎬 `video` - Generate dramatic video clips
  - 🖼️ `image` - Render detailed cinematic images
  - 📝 `placeholder` - Quick, fully deterministic mock mode
- **Safe Generation** with predictable fallback handling and mock generation behavior.
- **Persistent Local State** synced seamlessly via `localStorage`.
- **Live Monitoring** with Vercel serverless telemetry APIs for tracking active lobbies.
- **Admin utilities** including a one-command lobby wipe (`npm run clear:games`).

---

## 🛠️ Tech Stack

### Frontend Core
- **Framework:** React 18, Vite
- **State Model:** Pure game engine transitions (see [`src/game/engine.js`](src/game/engine.js))
- **Storage:** Frontend session persistence via `localStorage`

### Backend / Telemetry
- **API Engine:** Vercel Serverless Functions
- **Database:** Upstash Redis REST API

---

## 📂 Project Structure

```text
src/
├── App.jsx            # Main view orchestrator
├── components/        # UI components for game stages
├── game/              # Core game mechanics and state
│   ├── engine.js      # Pure game state transitions
│   ├── constants.js   # Game variables & config
│   ├── geminiMock.js  # AI mocks
│   ├── videoMock.js   # Media rendering mocks
│   ├── imageMock.js
│   └── placeholderMock.js
└── hooks/             # Custom React hooks

api/                   # Vercel Serverless API
├── _lib/              # Shared backend logic
└── lobbies/           # Telemetry endpoints (heartbeat, ranking, clear)

scripts/               # CLI utilities
└── clearGames.mjs     # Dev-tool script to clear all sessions
```

---

## 🚀 Local Development

First, install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

For **LAN / Multi-device testing**, expose the local server to your network:

```bash
npm run dev:host
```
*(Then open the provided `Network` URL from host + phones on the same network.)*

### Environment Variables

#### Frontend (Local)
Copy the example environment file and modify as needed:
```bash
cp .env.example .env
```
*(Reference `.env.example` for required keys)*

#### Vercel (Telemetry APIs)
To run the serverless APIs properly, set these in your **Project Settings → Environment Variables**:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

*(Optional)* For the CLI helper script to target prod:
- `CLEAR_GAMES_BASE_URL` (Defaults to your deployed URL in the script)

### Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Starts local dev server |
| `npm run dev:host` | Starts local dev server exposed to network |
| `npm run build` | Builds app for production |
| `npm run preview` | Previews the prod build locally |
| `npm run preview:host`| Previews prod build exposed to network |
| `npm run clear:games` | Clears telemetry data (host wipe) |

*You can clear a remote prod environment with:*
```bash
CLEAR_GAMES_BASE_URL=https://your-deployment.vercel.app npm run clear:games
```

---

## 🌐 Deployment (Vercel)

This application is configured for a plug-and-play **Vite** deployment on Vercel.

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy project
vercel
```

After deploying, verify the telemetry endpoints are live:
- `GET /api/lobbies/most-active`
- `GET /api/lobbies/top?limit=3`
- `GET /api/lobbies/g1-widget`

---

## 📡 Telemetry API

The Vercel Serverless Functions push game data to an Upstash Redis store to monitor live lobbys:

### `POST /api/lobbies/heartbeat`
Host client heartbeat (sent every 5 seconds + on stage changes). Keeps the lobby marked as 'active'.

### `GET /api/lobbies/most-active`
Returns the single top active lobby. Returns `{ "roomCode": null }` when empty.

### `GET /api/lobbies/top?limit=3`
Returns ranked lobbies sorted by activity score.

### `GET /api/lobbies/g1-widget`
A compact, glasses-friendly text payload block:
```json
{
  "roomCode": "ABCD",
  "playerCount": 6,
  "stage": "VOTE",
  "round": "2/3",
  "line": "ABCD • 6p • VOTE • R2/3"
}
```

### `POST /api/lobbies/clear-all`
Clears all telemetry and lobby data from the Upstash Redis database.

---

## 🧪 Testing Media Modes

1. Create a room as a **host**.
2. Open the **lobby settings** and choose your desired media mode:
   - *Video mode*
   - *Image mode*
   - *Placeholder mode*
3. Start the game, add twists, and submit.
4. Confirm the Showcase & Reveal stages render the expected media type.

---

## 🚧 Constraints & Roadmap

### Current Constraints
- **Local-First Authority:** Gameplay sync is entirely local-first (we don't have a fully authoritative multiplayer backend yet).
- **Mocked Generations:** AI generation is mocked right out of the box for predictable demos without an active LLM backend.
- **Telem vs State:** Telemetry APIs are separate from core game-state authority.

### Next Up (Suggested)
- [ ] **Authoritative Game State:** Move room state strictly to a WebSocket or real-time backend.
- [ ] **AI Backend Integration:** Wire up actual real Gemini/Imagen/Veo API calls in place of the generation mocks.
- [ ] **Auth & Moderation:** Add proper auth, abuse controls, and content filtering for public rooms.
- [ ] **Analytics Dashboard:** Build a structured analytics dashboard for hosts/events.
