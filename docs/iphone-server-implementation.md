# PlotTwist iPhone Companion — Server Implementation Guide

This document defines a production-ready backend contract for the iPhone controller app + host display.

## 1) Goals

- Real-time room join + stage sync across host/iPhone clients
- Authoritative game engine server-side (no trust in client)
- Gemini/Veo calls server-side only (no client API keys)
- Fast demo reliability with safe fallbacks

---

## 2) Recommended Stack

- **Runtime:** Node.js + TypeScript
- **API:** Fastify (or Express)
- **Realtime:** Socket.IO or raw WebSocket
- **Store:** Redis (room/session state + pub/sub)
- **DB:** Postgres (analytics/history) optional for MVP
- **Queue:** BullMQ (Gemini/Veo jobs) optional but ideal

For hackathon P0: Fastify + Socket.IO + Redis is enough.

---

## 3) High-Level Architecture

```text
[iPhone App] ----\
                  \   WebSocket (authoritative events)
[Host Web App] -----> [Realtime Gateway] ---> [Game Engine Service]
                  /                               |
[Audience Web] --/                                |---> [Gemini Scene Service]
                                                  |---> [Veo Video Service]
                                                  |---> [Redis State]
                                                  \---> [Postgres Analytics]
```

### Core rule
All game transitions must occur in the engine service only.
Clients emit intents; server validates and broadcasts state snapshots/events.

---

## 4) Data Models

```ts
type GameStage =
  | "lobby"
  | "prompt"
  | "submit"
  | "generate"
  | "vote"
  | "reveal"
  | "round-result"
  | "final-result";

interface Player {
  id: string;
  sessionId: string;
  name: string;
  avatar: string;
  color: string;
  score: number;
  isHost: boolean;
  connected: boolean;
  joinedAt: number;
}

interface Submission {
  id: string;
  playerId: string;
  text: string;
  generatedScene?: string;
  videoUrl?: string;
  videoProvider?: "veo3" | "veo3-mock";
  safetyStatus: "pending" | "safe" | "blocked" | "timeout";
  createdAt: number;
}

interface Vote {
  id: string;
  voterId: string;
  submissionId: string;
  createdAt: number;
}

interface Round {
  id: string;
  roundNumber: number;
  prompt: string;
  status: GameStage;
  submissions: Submission[];
  votes: Vote[];
  revealCursor: number;
  winnerSubmissionId?: string | null;
  scoredAt?: number | null;
  startedAt: number;
}

interface GameSession {
  id: string;
  roomCode: string;
  status: GameStage;
  roundIndex: number;
  settings: {
    rounds: number;
    submitSeconds: number;
    voteSeconds: number;
    revealStyle: "dramatic narration" | "mini screenplay";
    memoryLimit: number;
  };
  players: Player[];
  rounds: Round[];
  memory: Array<{
    id: string;
    sourceRoundId: string;
    twist: string;
    summary: string;
    entities: string[];
  }>;
}
```

---

## 5) REST Endpoints (minimal)

```http
POST /api/rooms
POST /api/rooms/:roomCode/join
GET  /api/rooms/:roomCode/state
POST /api/rooms/:roomCode/start
POST /api/rooms/:roomCode/next
POST /api/rooms/:roomCode/reset
```

Use REST for bootstrap and reconnect. Use WebSocket for gameplay actions.

---

## 6) WebSocket Contract

## Client -> Server

- `room:join` `{ roomCode, name, avatar? }`
- `room:leave` `{ roomCode }`
- `game:start` `{ roomCode }` (host only)
- `round:submit` `{ roomCode, playerId, text }`
- `round:close_submissions` `{ roomCode }` (host only)
- `round:vote` `{ roomCode, voterId, submissionId }`
- `round:close_voting` `{ roomCode }` (host only)
- `round:advance_reveal` `{ roomCode }` (host only)

## Server -> Clients

- `state:update` `{ session }` (authoritative snapshot)
- `stage:changed` `{ stage, roundNumber }`
- `timer:tick` `{ stage, secondsRemaining }`
- `submission:accepted` `{ playerId, roundId }`
- `generation:started` `{ roundId }`
- `generation:finished` `{ roundId }`
- `error` `{ code, message }`

### Idempotency rules

- `round:vote` must upsert by `(roundId, voterId)`
- `round:submit` must upsert by `(roundId, playerId)`
- `completeRound` must no-op if `scoredAt` already exists

---

## 7) Gemini + Veo Service Design

### Gemini Scene Request

Input:
- round prompt
- twist text
- bounded memory snippets
- style

Output:
- `generatedScene` (60-140 words target)
- `safetyStatus`

### Veo Video Request

Input:
- twist text
- prompt context
- style hint

Output:
- `videoUrl`
- `provider = "veo3"`

Fallback:
- If Veo fails/slow, return pre-approved stock clip URL and mark timeout.

### Safety

- profanity prefilter before Gemini/Veo
- Gemini safety settings on
- blocked content => fallback scene + fallback video

---

## 8) Timer Authority

Server owns all timers:
- prompt countdown (3,2,1)
- submit timer (default 30s)
- vote timer (default 20s)

Broadcast `timer:tick` every second.
At 0:
- auto-close submissions
- auto-close voting

Never trust client-side timer expiration.

---

## 9) iPhone Client Integration Notes

- Use token from `room:join` response for subsequent events.
- Keep one socket connection per app session.
- On reconnect:
  1. reconnect socket
  2. emit `room:join` with prior player identity token
  3. request fresh `state:update`
- UI should be stage-driven from server status only.

### iOS recommendation

- SwiftUI + URLSessionWebSocketTask (or Socket.IO client)
- Local view model with `@Published session`
- Reducer-style state updates from server events

---

## 10) Security Checklist

- Gemini/Veo keys server-only
- Validate room code format + payload schema (Zod)
- Rate limit join + submit + vote endpoints
- CORS locked to web host(s)
- Prevent self-vote server-side
- Reject host-only actions from non-host players

---

## 11) Deployment Options

### Vercel + External realtime

- Host static web on Vercel
- Run realtime API on Fly.io/Render/Railway
- Point web/iPhone client to realtime host env var

### Single-service option

- Deploy Node API+WS on Render/Fly
- Serve web build from CDN/static host separately

For hackathon speed, avoid serverless-only WebSocket complexity.

---

## 12) Suggested Env Vars

```bash
NODE_ENV=production
PORT=8080
REDIS_URL=redis://...
DATABASE_URL=postgres://...
GEMINI_API_KEY=...
VEO_API_KEY=...
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-domain.com
MAX_ROOM_PLAYERS=10
ROOM_TTL_SECONDS=7200
```

---

## 13) MVP Build Order

1. Room create/join + `state:update`
2. Stage transitions + timers server-side
3. Submit + vote idempotency
4. Scoring + memory chain
5. Gemini integration
6. Veo integration
7. Moderation/rate limiting

Ship reliable, then fancy.
