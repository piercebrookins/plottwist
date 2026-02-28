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

## Ngrok testing (reserved domain)

This repo is configured for your ngrok domain:
`unlicentiated-unsqueamishly-mahalia.ngrok-free.app`

1. Start Vite on all interfaces:
```bash
npm run dev:host
```

2. In another terminal, start ngrok:
```bash
ngrok http --domain=unlicentiated-unsqueamishly-mahalia.ngrok-free.app 5173
```

3. Open:
`https://unlicentiated-unsqueamishly-mahalia.ngrok-free.app`

### Environment config

- `.env` is already set for your domain.
- Copy `.env.example` if you need to reset defaults.

## Deploy to Vercel (quick)

```bash
npm i -g vercel
vercel
```

Set project framework to **Vite** when prompted.

## Lobby telemetry API (for Mentra G1)

This repo now includes serverless endpoints:
- `POST /api/lobbies/heartbeat`
- `GET /api/lobbies/most-active`
- `GET /api/lobbies/top?limit=3`
- `GET /api/lobbies/g1-widget` (compact glasses payload)

Set these environment variables in Vercel Project Settings:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Host client sends heartbeat every 5s + on state updates.

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
