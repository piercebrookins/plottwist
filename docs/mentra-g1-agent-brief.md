# Mentra G1 Agent Brief — PlotTwist Active Lobby Telemetry

Use this brief to implement a **read-only telemetry path** so Even Realities G1 / Mentra OS glasses can display the most active lobby from the deployed app:

- Deployment URL: `https://plottwist-nine.vercel.app`

## Context

Current app is frontend-only with `localStorage` sync, which means there is **no server-global state** available for glasses.

To support glasses, implement a tiny backend API on Vercel (serverless route) with lobby heartbeat writes and ranked reads.

---

## Objective

Create a telemetry service that can answer:

1. What is the most active lobby right now?
2. How many players are in it?
3. What stage is it in?
4. Last updated timestamp?
5. Optional: top 3 lobbies by activity score.

---

## Required Deliverables

### 1) New API routes (Vercel)

Implement API routes under `/api/lobbies/*`:

- `POST /api/lobbies/heartbeat`
- `GET /api/lobbies/most-active`
- `GET /api/lobbies/top?limit=3`
- `GET /api/lobbies/g1-widget` (compact, glasses-ready)

### 2) Telemetry schema

Lobby record fields:

```ts
interface LobbyTelemetry {
  roomCode: string;
  playerCount: number;
  status: "lobby" | "prompt" | "submit" | "generate" | "vote" | "reveal" | "round-result" | "final-result";
  roundIndex: number;
  roundsConfigured: number;
  updatedAt: number; // epoch ms
  activityScore: number; // computed
}
```

### 3) Activity score formula

Use deterministic formula:

```text
activityScore = (playerCount * 10)
              + (status != "lobby" ? 15 : 0)
              + freshnessBonus

freshnessBonus = max(0, 30 - ageSeconds)
```

where `ageSeconds = (now - updatedAt) / 1000`.

### 4) Data store

Use **Vercel KV (Redis)** or Upstash Redis.

Keys:
- `lobby:{ROOM}` -> JSON payload
- `lobbies:index` -> set of room codes

TTL per lobby record: `180s`.

### 5) Frontend heartbeat integration

In web app host client only:
- Send heartbeat every `5s`
- Send on stage change
- Send on player count change

Payload:

```json
{
  "roomCode": "ABCD",
  "playerCount": 6,
  "status": "submit",
  "roundIndex": 1,
  "roundsConfigured": 3
}
```

### 6) Mentra/G1 consumption endpoint

`GET /api/lobbies/most-active` response:

```json
{
  "roomCode": "ABCD",
  "playerCount": 6,
  "status": "vote",
  "roundIndex": 2,
  "roundsConfigured": 3,
  "updatedAt": 1760000000000,
  "activityScore": 74
}
```

If none active:

```json
{ "roomCode": null }
```

`GET /api/lobbies/g1-widget` compact response:

```json
{
  "roomCode": "ABCD",
  "playerCount": 6,
  "stage": "VOTE",
  "round": "2/3",
  "line": "ABCD • 6p • VOTE • R2/3"
}
```

---

## Non-Functional Requirements

- Validate payload schema (Zod)
- Rate limit heartbeat by IP + roomCode
- CORS allow Mentra client origins
- Never expose player names in telemetry endpoint
- Handle stale lobbies by TTL and ignore expired entries

---

## Acceptance Criteria

1. With two active rooms, endpoint returns the correct most active room.
2. If room stops heartbeating for >180s, it disappears from ranking.
3. G1 client can poll every 3–5s with stable JSON shape.
4. No auth key required for read endpoint (or optional static token via header).

---

## Suggested Minimal File Plan

```text
/api/lobbies/heartbeat.ts
/api/lobbies/most-active.ts
/api/lobbies/top.ts
/lib/lobbyStore.ts
/lib/activityScore.ts
/lib/validation.ts
```

Keep each file short (< 600 lines).

---

## Optional Nice-to-Haves

- `GET /api/lobbies/:roomCode` for direct room telemetry
- Return `playersExpected` and `submissionProgress` if available
- Add `region` field for multi-region scaling

---

## Notes for this codebase

Because current state is localStorage-based, this telemetry channel is intentionally separate and lightweight.
It does **not** replace game synchronization yet.
It only provides observability for glasses display.
