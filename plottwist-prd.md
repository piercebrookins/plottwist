# PlotTwist — Product Requirements Document (PRD)

## 1) Product Summary
**PlotTwist** is a party game ("Jackbox for Movies") where players submit funny or dramatic plot twists from their phones. The host screen reveals an initial movie setup prompt, Gemini transforms player submissions into mini cinematic scenes, and everyone votes on the best twist.

Think **Quiplash voting + AI-generated screenplay reveals** + persistent callback memory across rounds.
aa
---

## 1.1) Gemini 3 NYC Hackathon Alignment

### Target Problem Statement
- **Primary:** Gemini and Film ✅ (non-linear narrative + AI-native audience participation)
- **Secondary support:** Gemini and Gaming ✅ (persistent memory across rounds and evolving context)

### Hackathon Rule Compliance
- Project repo must be **public open source** before submission.
- Project must be **new work started during hackathon**.
- Team size capped at **4 members**.
- Must avoid banned categories (not mental-health advisor, not basic RAG, not Streamlit wrapper, etc.).

### Judging Strategy Fit
- **Demo (50%)**: real-time interaction + visible Gemini output.
- **Impact (25%)**: reusable framework for participatory film storytelling.
- **Creativity (15%)**: absurd player prompts become coherent mini scenes.
- **Pitch (10%)**: instantly understandable social game loop.

---

## 2) Goals & Non-Goals

### Goals (MVP)
1. Enable 3–10 players to join a room quickly with a code.
2. Run 3–5 rounds of prompts with timed submissions.
3. Generate one cinematic output per submission using Gemini.
4. Support audience/player voting each round.
5. Track points and display winner leaderboard.
6. Maintain non-linear story memory using previous winning twists.

### Non-Goals (MVP)
- Real-money prizes, player matchmaking, account systems.
- Advanced moderation dashboards.
- Full film-quality animation/video rendering.
- Fully custom prompt authoring by all players (host-only in v1 if needed).

---

## 3) Target Users
- **Primary:** Friends at parties/game nights (casual, social).
- **Secondary:** Hackathon judges, streamers, creators demoing Gemini creativity.

---

## 4) Core Experience

### Round Loop
1. Host screen shows setup prompt (e.g., "A detective discovers the killer is actually…").
2. Players submit plot twists on phone.
3. Submission window closes (timer).
4. Gemini rewrites each into a dramatic narration or mini screenplay.
5. Host reveals each generated scene one-by-one.
6. Players vote on their favorite (cannot vote for self).
7. Points awarded, leaderboard shown.
8. Winning twist updates story memory and influences next prompt.

### Example Memory Chain
- R1 prompt: "A detective discovers the killer is _____"
- R1 winner: "a pigeon"
- R2 prompt references winner: "The pigeon flies to _____"
- R2 winner: "a boat in Sweden"

Memory should be cumulative but bounded to avoid token bloat.

---

## 5) Functional Requirements

### FR-1 Room & Session Management
- Host can create a room and receives a short room code.
- Players join via room code + display name.
- Lobby displays joined players and ready status.
- Host starts game manually.

### FR-2 Prompt Management
- System provides curated starter prompt packs (movie genres/moods).
- Each round includes one active prompt.
- Prompt generator may optionally include prior winning twists.

### FR-3 Submission Collection
- Each player submits one twist per round under time limit.
- Empty/late submissions handled gracefully ("No twist submitted").
- Duplicate exact submissions allowed but flagged internally.

### FR-4 Gemini Scene Generation
- For each valid submission, system calls Gemini with:
  - round prompt
  - player twist
  - short memory context from prior winning twists
  - desired style: "dramatic narration" or "mini screenplay"
- Output length target: 60–140 words.
- Generation timeout fallback: render original submission with simple templated narration.

### FR-5 Reveal & Voting
- Scenes displayed sequentially on host screen.
- Players vote once per round after all reveals.
- Self-voting blocked.
- Tie-handling: split points or tie-break reveal (configurable).

### FR-6 Scoring
- Base points from votes received.
- Optional bonus points:
  - streak bonus (consecutive top-2 finishes)
  - callback bonus (uses memory element cleverly; manual or AI-detected)
- Final winner after configured round count.

### FR-7 Story Memory
- Persist structured memory per game session:
  - winning twist text
  - winning scene summary
  - entities/locations/themes extracted
- Keep top N memory items (default N=5).
- Inject only relevant memory snippets into next round prompt/generation context.

### FR-8 Moderation & Safety
- Basic profanity filtering pre-generation.
- Gemini safety settings enabled.
- If content blocked, show safe fallback card and continue flow.

---

## 6) Non-Functional Requirements

### Performance
- Room join latency: <1.5s typical.
- Submission post: <500ms ack.
- Gemini generation target: <4s per submission average (can parallelize).
- Full reveal-ready state within 8–12s for 8 players.

### Reliability
- Game state must survive host screen refresh/reconnect for at least 2 minutes.
- Idempotent vote submissions.

### Scalability (MVP-ish)
- Concurrent rooms: 100+ expected without degradation.

### Security
- Use server-side Gemini key only.
- Validate all client payloads.
- Prevent room-code brute force with rate limiting.

---

## 7) Suggested System Architecture

### Clients
- **Host Display**: web app full-screen TV/laptop mode.
- **Companion App**: iPhone app for player input/vote.
- **Optional audience web client**.

### Backend Services
- Real-time room service (WebSocket).
- Game engine state machine.
- Gemini generation service.
- Scoring and leaderboard service.

### Data Model (high-level)
- `GameSession(id, roomCode, status, roundIndex, settings)`
- `Player(id, sessionId, name, score, connected)`
- `Round(id, sessionId, prompt, status, startedAt)`
- `Submission(id, roundId, playerId, text, generatedScene, safetyStatus)`
- `Vote(id, roundId, voterId, submissionId)`
- `MemoryItem(id, sessionId, sourceRoundId, twist, summary, entities)`

---

## 8) UX Requirements
- One-tap join and obvious state transitions.
- Timer visible on phone + host display.
- Readability-first reveal cards (big type, high contrast).
- Humor-preserving pacing: no dead air between reveals.

---

## 9) Metrics (What Success Looks Like)
- Avg rounds completed per session ≥ 4.
- Median session duration 10–18 minutes.
- ≥ 80% of players submit every round.
- ≥ 90% vote participation rate.
- "Would play again" post-game score ≥ 4/5.

---

## 10) MVP Scope Checklist
- [ ] Room creation/join
- [ ] Lobby + start game
- [ ] Prompt + timed submissions
- [ ] Gemini per-submission generation
- [ ] Reveal queue
- [ ] Voting + scoring
- [ ] Story memory callbacks
- [ ] Endgame leaderboard

### Hackathon Prioritization (Brutally Practical)
**P0 (must ship before 5:00 PM):**
- Room join
- One full round end-to-end
- Gemini generation for at least top 3 submissions
- Voting + points update
- Leaderboard and clear winner

**P1 (ship if stable):**
- Non-linear memory affecting round 2+
- Style toggle (narration vs screenplay)
- G1 status indicator integration

**P2 (only if time remains):**
- Audience mode
- Bonus scoring heuristics

If anything breaks at 4:30 PM, cut to P0 immediately and preserve demo reliability.

---

## 11) Risks & Mitigations
1. **Slow generation** → parallel calls + fallback templating.
2. **Inappropriate content** → profanity filter + Gemini safety + blocklist.
3. **Players confused by flow** → explicit stage labels (SUBMIT / WATCH / VOTE).
4. **Memory quality drifts** → bounded memory and relevance ranking.

---

## 12) Open Questions
1. Should voting be players-only or include audience votes?
2. Should all outputs use one style per round, or mixed styles per submission?
3. Is host allowed to curate/skip generated scenes?
4. Should memory references be explicit (shown) or implicit (hidden)?
5. Do we support team mode (pairs) in v1 or later?

---

## 13) Demo Script (Judge-Friendly)
1. Start room, 4 mock players join.
2. Run 2 rounds with absurd twists.
3. Show Gemini screenplay transformations.
4. Show callback memory in round 2 prompt.
5. End on leaderboard + "play again".

Short, funny, reliable. Hackathon catnip.
