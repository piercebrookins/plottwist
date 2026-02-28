# PlotTwist

A multiplayer party game where players write absurd plot twists and the app turns them into dramatic scene reveals (video, image, or placeholder mode).

Built with React + Vite, with serverless telemetry endpoints for live lobby monitoring (including Mentra / G1 display use cases).

---

## Features

- Room-based multiplayer flow with short join codes
- Host-controlled game settings
- Round pipeline: prompt → write → generate → showcase → vote → reveal → scores
- Three media output modes:
  - `video`
  - `image`
  - `placeholder` (fully hardcoded deterministic mock mode)
- Safe mock generation behavior with fallback handling
- Local session sync via `localStorage`
- Vercel serverless telemetry APIs for active lobbies
- One-command lobby wipe utility (`npm run clear:games`)

---

## Tech Stack

- **Frontend:** React 18, Vite
- **State model:** Pure game engine transitions in `src/game/engine.js`
- **Storage:** localStorage (frontend session persistence)
- **Backend (telemetry):** Vercel Serverless Functions + Upstash Redis REST API

---

## Project Structure

```text
src/
  App.jsx
  components/
  game/
    engine.js
    constants.js
    geminiMock.js
    videoMock.js
    imageMock.js
    placeholderMock.js
  hooks/

api/
  _lib/
  lobbies/
    heartbeat.js
    most-active.js
    top.js
    g1-widget.js
    clear-all.js

scripts/
  clearGames.mjs
```

---

## Local Development

```bash
npm install
npm run dev
```

For LAN/device testing:

```bash
npm run dev:host
```

Then open from host + phones on the same network.

---

## Environment Variables

### Frontend / local
See `.env.example`.

### Vercel (required for telemetry APIs)
Set these in **Project Settings → Environment Variables**:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Optional for CLI helper:
- `CLEAR_GAMES_BASE_URL` (defaults to deployed URL in script)

---

## Deploy (Vercel)

```bash
npm i -g vercel
vercel
```

Framework: **Vite**

After deploy, verify telemetry endpoints:

- `GET /api/lobbies/most-active`
- `GET /api/lobbies/top?limit=3`
- `GET /api/lobbies/g1-widget`

---

## Telemetry API

### `POST /api/lobbies/heartbeat`
Host client heartbeat (sent every 5 seconds + stage changes).

### `GET /api/lobbies/most-active`
Returns top active lobby (or `{ "roomCode": null }` when empty).

### `GET /api/lobbies/top?limit=3`
Returns ranked lobbies by activity score.

### `GET /api/lobbies/g1-widget`
Compact glasses-friendly payload, e.g.:

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
Clears all lobby telemetry data from Redis.

---

## Commands

```bash
npm run dev
npm run dev:host
npm run build
npm run preview
npm run preview:host
npm run clear:games
```

Clear command with custom target:

```bash
CLEAR_GAMES_BASE_URL=https://your-deployment.vercel.app npm run clear:games
```

---

## Testing Media Modes

1. Create a room as host
2. In lobby settings, choose media mode:
   - Video mode
   - Image mode
   - Placeholder mode
3. Start game and submit twists
4. Confirm showcase/reveal render expected media type

---

## Current Constraints

- Gameplay sync is local-first (not a full authoritative multiplayer backend yet)
- AI generation is mocked for predictable demos
- Telemetry APIs are separate from core game-state authority

---

## Next Up (Suggested)

- Server-authoritative room state (WebSocket or realtime backend)
- Real Gemini/Imagen/Veo backend integration
- Auth and abuse controls for public rooms
- Structured analytics dashboard for hosts/events
