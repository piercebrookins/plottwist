# PlotTwist (React MVP)

A Quiplash-style party webapp for movie plot twists.

## Quick start

```bash
npm install
npm run dev
```

Open the local URL in multiple tabs/devices:
- one tab for host display
- others for player companion screens

## What’s implemented

- ✅ Room creation and join with 4-char room code
- ✅ Lobby with player list + host-controlled settings
- ✅ Timed submissions per round
- ✅ Graceful fallback for missing submissions
- ✅ AI scene generation layer (Gemini mocked locally)
- ✅ Safety filtering + timeout fallback narration
- ✅ Sequential reveal flow
- ✅ Voting with self-vote blocking
- ✅ Score calculation + leaderboard
- ✅ Story memory callbacks bounded by configurable memory limit
- ✅ Final winner screen + play again

## Architecture (frontend-only MVP)

- `src/game/engine.js`: pure state transitions (DRY/SOLID-ish)
- `src/game/geminiMock.js`: AI generation stub with safety/timeout behavior
- `src/game/storage.js`: localStorage session persistence + cross-tab sync
- `src/components/*`: stage-oriented presentational components
- `src/App.jsx`: flow orchestration

## Hackathon note

This build intentionally prioritizes demo reliability (P0/P1 from PRD).

Current limitations:
- No backend/WebSocket infra yet (state sync via `localStorage` events)
- Gemini integration is mocked, not calling server-side API key
- No authentication or production anti-abuse controls yet

## Suggested next steps

1. Replace `geminiMock` with backend Gemini service.
2. Move room/session state to WebSocket game server.
3. Add profanity blocklist service and request validation on backend.
4. Add idempotent vote endpoint and rate limiting.
