# The Ultimate Quiplash-Style Party Game Design Guide

**A comprehensive design system for building hilarious, fast-paced party games**

---

## Table of Contents

1. [Foundation Principles](#1-foundation-principles)
2. [Game Flow & Phases](#2-game-flow--phases)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Player Identity & Avatars](#5-player-identity--avatars)
6. [TV/Host Display Design](#6-tvhost-display-design)
7. [Mobile Controller UI](#7-mobile-controller-ui)
8. [Game Components Library](#8-game-components-library)
9. [Animations & Micro-interactions](#9-animations--micro-interactions)
10. [Sound & Haptic Design](#10-sound--haptic-design)
11. [Prompt & Answer Patterns](#11-prompt--answer-patterns)
12. [Voting & Results](#12-voting--results)
13. [Leaderboard & Scoring](#13-leaderboard--scoring)
14. [Responsive & Cross-Platform](#14-responsive--cross-platform)
15. [Design System Checklist](#15-design-system-checklist)

---

## 1. Foundation Principles

### The 5 Pillars of Party Game Design

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   1. INSTANT UNDERSTANDING  - No tutorials needed          │
│   2. VISUAL FEEDBACK        - Every action celebrates       │
│   3. READABLE FROM AFAR     - TV display clarity            │
│   4. MINIMAL FRICTION       - One-tap interactions          │
│   5. MAXIMUM DELIGHT        - Small moments create joy      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### The Party Game Equation

```
HILARITY = Simple Setup + Creative Freedom + Social Interaction + Comedy

GREAT UX = Clear Instructions + Instant Feedback + Snappy Transitions + Celebrations
```

### Two-Screen Architecture

Every party game has TWO distinct UIs:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  📺 TV DISPLAY (The Stage)                                  │
│  └── Large, bold, readable from 10ft                        │
│  └── Showcases prompts, answers, voting                     │
│  └── Reveals, animations, celebrations                      │
│  └── No player interaction here                            │
│                                                             │
│  📱 MOBILE DEVICES (The Controllers)                        │
│  └── Minimal, touch-optimized                               │
│  └── Text input, simple taps, swipes                        │
│  └── Private information (player's view only)                 │
│  └── Quick interactions (2-5 seconds max)                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Game Flow & Phases

### Core Game Loop

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   LOBBY → PROMPT → WRITE → VOTE → REVEAL → SCORE → NEXT    │
│     ↑___________________________________________________↓   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Phase Breakdown

#### 1. LOBBY PHASE
```
TV DISPLAY:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              JOIN THE GAME!                                 │
│              Go to: game.com                                │
│              Room Code: [ABCD]                              │
│                                                             │
│    ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐       │
│    │  😎   │ │  🤓   │ │  🤪   │ │  😈   │ │  👽   │       │
│    │Player1│ │Player2│ │  ...  │ │Player4│ │Player5│       │
│    └───────┘ └───────┘ └───────┘ └───────┘ └───────┘       │
│                                                             │
│              [START GAME] (host only)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

MOBILE (player):
┌─────────────────────────────────────────┐
│                                         │
│    Enter Room Code                      │
│    ┌─────────────────────────┐          │
│    │  A  B  C  D             │          │
│    └─────────────────────────┘          │
│                                         │
│    [JOIN]                               │
│                                         │
│    ────── or ──────                     │
│                                         │
│    Enter your name                      │
│    ┌─────────────────────────┐          │
│    │  Steve-O                │          │
│    └─────────────────────────┘          │
│                                         │
│    Choose Avatar                        │
│    😎 🤓 🤪 😈 👽 👻 🦄 🍕             │
│                                         │
└─────────────────────────────────────────┘
```

#### 2. PROMPT PHASE (TV Only)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              ROUND 1                                        │
│                                                             │
│         The hit song from the Broadway                      │
│         show Fart: The Musical                              │
│                                                             │
│              (dramatic pause)                               │
│                                                             │
│              3                                              │
│              2                                              │
│              1                                              │
│                                                             │
│              WRITE YOUR ANSWER!                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3. WRITE PHASE (Async)
```
TV DISPLAY:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              ROUND 1                                        │
│                                                             │
│         The hit song from the Broadway                      │
│         show Fart: The Musical                              │
│                                                             │
│              Waiting for players...                         │
│                                                             │
│    ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                 │
│    │  😎   │ │  🤓   │ │  ⏳   │ │  ⏳   │                 │
│    │ DONE  │ │ DONE  │ │WAITING│ │WAITING│                 │
│    └───────┘ └───────┘ └───────┘ └───────┘                 │
│                                                             │
│              [FORCE START]                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

MOBILE:
┌─────────────────────────────────────────┐
│                                         │
│    Round 1 of 3                         │
│                                         │
│    The hit song from the Broadway       │
│    show Fart: The Musical               │
│    _____________________________        │
│                                         │
│    ┌─────────────────────────┐          │
│    │  CROPDUST MY HEART      │          │
│    │  (42 chars)             │          │
│    └─────────────────────────┘          │
│                                         │
│    [SUBMIT]                             │
│                                         │
│    Time remaining: 45s                  │
│                                         │
└─────────────────────────────────────────┘
```

#### 4. VOTE PHASE
```
TV DISPLAY:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              VOTE FOR YOUR FAVORITE!                        │
│                                                             │
│              "The hit song from Fart:                        │
│               The Musical"                                  │
│                                                             │
│    ┌─────────────────────────────────────┐                  │
│    │  💚  CROPDUST MY HEART              │                  │
│    │      by SPENCER                     │                  │
│    └─────────────────────────────────────┘                  │
│                                                             │
│    ┌─────────────────────────────────────┐                  │
│    │  💙  SMELLS LIKE LOVE               │                  │
│    │      by EVAN                        │                  │
│    └─────────────────────────────────────┘                  │
│                                                             │
│              Waiting for votes...                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

MOBILE:
┌─────────────────────────────────────────┐
│                                         │
│    Vote for the funniest answer!        │
│                                         │
│    ┌─────────────────────────┐          │
│    │  CROPDUST MY HEART      │          │
│    │  by Player 1            │          │
│    │                         │          │
│    │  [👆 TAP TO VOTE]       │          │
│    └─────────────────────────┘          │
│                                         │
│    ─────── OR ───────                   │
│                                         │
│    ┌─────────────────────────┐          │
│    │  SMELLS LIKE LOVE       │          │
│    │  by Player 2            │          │
│    │                         │          │
│    │  [👆 TAP TO VOTE]       │          │
│    └─────────────────────────┘          │
│                                         │
│    Time remaining: 20s                  │
│                                         │
└─────────────────────────────────────────┘
```

#### 5. REVEAL PHASE
```
TV DISPLAY:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    ┌─────────────────────────────────────┐                  │
│    │  CROPDUST MY HEART                  │                  │
│    │      by SPENCER                     │                  │
│    │                                     │                  │
│    │      🎉 WINNER! 🎉                  │                  │
│    │      +200 BONUS                     │                  │
│    └─────────────────────────────────────┘                  │
│                                                             │
│    ┌─────────────────────────────────────┐                  │
│    │  SMELLS LIKE LOVE                   │                  │
│    │      by EVAN                        │                  │
│    └─────────────────────────────────────┘                  │
│                                                             │
│              Who voted for what...                          │
│                                                             │
│    😎 😈 → CROPDUST        🤓 👽 → SMELLS LIKE             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Color System

### Party Game Palette Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Party games need HIGH CONTRAST and                         │
│  DISTINCTIVE PLAYER COLORS for quick recognition            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Player Color System

Every player gets a distinct, vibrant color:

```css
:root {
  /* Player Colors - distinct and vibrant */
  --player-green:   #4ADE80;  /* Spencer */
  --player-blue:    #60A5FA;  /* Evan */
  --player-pink:    #F472B6;  /* Arnie */
  --player-purple:  #A78BFA;  /* RoboAndy */
  --player-orange:  #FB923C;  /* Steveo */
  --player-red:     #F87171;  /* Dave */
  --player-teal:    #2DD4BF;  /* Warren */
  --player-yellow:  #FACC15;  /* Whodey */
  
  /* Semantic Colors */
  --winner-gold:    #FFD600;
  --winner-bg:      #1A1A1A;
  --success:        #4ADE80;
  --timer-warning:  #F87171;
  --timer-urgent:   #EF4444;
}
```

### Game Phase Colors

```
LOBBY:      Calm purple/blue gradient
PROMPT:     White/neutral spotlight
WRITE:      Blue (thinking/creative)
VOTE:       Yellow/gold (decision time)
REVEAL:     Rainbow/confetti (celebration)
LEADERBOARD: Dark with neon accents
```

### Dark Theme (Recommended for TV)

```css
:root {
  --bg-primary: #1A1A2E;      /* Deep purple-blue */
  --bg-secondary: #16213E;    /* Elevated surfaces */
  --bg-tertiary: #0F3460;     /* Cards, panels */
  
  --text-primary: #FFFFFF;
  --text-secondary: rgba(255,255,255,0.7);
  --text-muted: rgba(255,255,255,0.5);
  
  /* Accent colors for emphasis */
  --accent-highlight: #FFD600;  /* Gold for winners */
  --accent-correct: #4ADE80;   /* Green for success */
  --accent-alert: #F87171;     /* Red for urgency */
  
  /* Borders */
  --border-subtle: rgba(255,255,255,0.1);
  --border-player: 3px solid;  /* Player color border */
}
```

### Light Theme (Alternative)

```css
:root {
  --bg-primary: #FAFAFA;
  --bg-secondary: #FFFFFF;
  --bg-tertiary: #F3F4F6;
  
  --text-primary: #1F2937;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  
  --accent-highlight: #EAB308;
  --accent-correct: #22C55E;
  --accent-alert: #EF4444;
  
  --border-subtle: #E5E7EB;
  --border-player: 3px solid;
}
```

### Color Usage Rules

| Element | Color Rule |
|---------|-----------|
| Player avatars | Assigned player color |
| Speech bubbles | Player color border |
| Winner reveal | Gold/yellow glow |
| Timer | Green → Yellow → Red gradient |
| Buttons | Player color or accent |
| Background | Dark gradient or pattern |

---

## 4. Typography

### TV Display Typography

Text must be readable from 10+ feet away:

```
TV TYPE SCALE:

Timer:          120-180px     (clamp for responsive)
Player Names:   48-72px
Answers:        36-64px       (depends on length)
Prompts:        32-48px
Scores:         64-96px
Round Headers:  24-32px
```

### Mobile Display Typography

```
MOBILE TYPE SCALE:

Input Text:     18-20px       (tap target friendly)
Labels:         14-16px
Buttons:        16-18px
Timer:          48-64px
```

### Font Recommendations

```css
/* DISPLAY: Bold, playful, readable */
@font-face {
  font-family: 'Bungee';
  src: url('/fonts/Bungee-Regular.woff2') format('woff2');
  /* Chunky, playful, great for headers */
}

@font-face {
  font-family: 'Fredoka One';
  src: url('/fonts/FredokaOne-Regular.woff2') format('woff2');
  /* Rounded, friendly, cartoonish */
}

@font-face {
  font-family: 'Righteous';
  src: url('/fonts/Righteous-Regular.woff2') format('woff2');
  /* Modern, bold, slightly retro */
}

/* BODY: Clear, readable */
@font-face {
  font-family: 'Nunito';
  src: url('/fonts/Nunito-Bold.woff2') format('woff2');
  /* Rounded, friendly, very readable */
}

@font-face {
  font-family: 'Poppins';
  src: url('/fonts/Poppins-Bold.woff2') format('woff2');
  /* Clean, modern, versatile */
}
```

### Typography Patterns

**Speech Bubble Text:**
```css
.speech-bubble-text {
  font-family: 'Fredoka One', sans-serif;
  font-size: clamp(24px, 4vw, 48px);
  line-height: 1.2;
  text-align: center;
  color: var(--text-primary);
}
```

**Player Name Tags:**
```css
.player-tag {
  font-family: 'Nunito', sans-serif;
  font-weight: 700;
  font-size: clamp(14px, 2vw, 20px);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: white;
  background: var(--player-color);
  padding: 4px 12px;
  border-radius: 4px;
}
```

**Score Display:**
```css
.score-display {
  font-family: 'Bungee', sans-serif;
  font-size: clamp(48px, 8vw, 96px);
  color: var(--accent-highlight);
  text-shadow: 3px 3px 0 rgba(0,0,0,0.3);
}
```

---

## 5. Player Identity & Avatars

### Avatar System

```css
/* Avatar container */
.avatar {
  width: clamp(48px, 8vw, 80px);
  height: clamp(48px, 8vw, 80px);
  border-radius: 50%;
  background: var(--player-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(24px, 4vw, 40px);
  border: 3px solid rgba(255,255,255,0.5);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* Avatar with status indicator */
.avatar-with-status {
  position: relative;
}

.avatar-status {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: clamp(16px, 2vw, 24px);
  height: clamp(16px, 2vw, 24px);
  border-radius: 50%;
  background: var(--status-color);
  border: 2px solid white;
}

.avatar-status.ready { background: var(--success); }
.avatar-status.waiting { background: #FACC15; }
.avatar-status.voted { background: #60A5FA; }
```

### Avatar Emoji Set

```javascript
const AVATARS = [
  { emoji: '😎', name: 'Cool' },
  { emoji: '🤓', name: 'Nerd' },
  { emoji: '🤪', name: 'Crazy' },
  { emoji: '😈', name: 'Devil' },
  { emoji: '👽', name: 'Alien' },
  { emoji: '👻', name: 'Ghost' },
  { emoji: '🦄', name: 'Unicorn' },
  { emoji: '🍕', name: 'Pizza' },
  { emoji: '🎸', name: 'Rocker' },
  { emoji: '🚀', name: 'Rocket' },
  { emoji: '🐱', name: 'Cat' },
  { emoji: '🐶', name: 'Dog' },
  { emoji: '🦊', name: 'Fox' },
  { emoji: '🐸', name: 'Frog' },
  { emoji: '🎭', name: 'Drama' },
  { emoji: '👑', name: 'King' },
];
```

### Player Card Component

```css
.player-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  background: var(--bg-secondary);
  border: 3px solid var(--player-color);
  transition: all 0.3s ease;
}

.player-card.current-turn {
  transform: scale(1.1);
  box-shadow: 0 0 20px var(--player-color);
}

.player-card.winner {
  border-color: var(--winner-gold);
  background: linear-gradient(
    135deg,
    var(--bg-secondary) 0%,
    rgba(255,214,0,0.1) 100%
  );
}
```

---

## 6. TV/Host Display Design

### Layout Principles

```
TV DISPLAY RULES:

1. CENTER ALIGN everything
2. LARGE text (readable from couch)
3. HIGH contrast colors
4. MINIMAL elements per screen
5. ANIMATE transitions between phases
```

### Screen Templates

**Full Screen Prompt:**
```css
.prompt-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px;
  text-align: center;
}

.prompt-round {
  font-size: clamp(24px, 4vw, 32px);
  color: var(--text-muted);
  margin-bottom: 20px;
}

.prompt-text {
  font-size: clamp(32px, 6vw, 64px);
  font-weight: 700;
  line-height: 1.3;
  max-width: 80%;
}

.prompt-instruction {
  font-size: clamp(18px, 3vw, 24px);
  color: var(--accent-highlight);
  margin-top: 40px;
  animation: pulse 2s infinite;
}
```

**Split Screen (Two Answers):**
```css
.vote-screen {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  padding: 40px;
  min-height: 100vh;
}

.answer-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border-radius: 20px;
  background: var(--bg-secondary);
  border: 4px solid var(--player-color);
}

.answer-card.voted {
  transform: scale(1.02);
  box-shadow: 0 0 40px var(--player-color);
}
```

**Leaderboard Screen:**
```css
.leaderboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 40px;
  min-height: 100vh;
}

.leaderboard-title {
  font-size: clamp(36px, 6vw, 64px);
  margin-bottom: 60px;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 800px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 30px;
  border-radius: 16px;
  background: var(--bg-secondary);
}

.leaderboard-item.first {
  background: linear-gradient(
    90deg,
    rgba(255,214,0,0.2) 0%,
    var(--bg-secondary) 100%
  );
  border: 2px solid var(--winner-gold);
}

.leaderboard-rank {
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 700;
  width: 60px;
  text-align: center;
}

.leaderboard-score {
  margin-left: auto;
  font-size: clamp(24px, 4vw, 48px);
  font-weight: 700;
  color: var(--accent-highlight);
}
```

### Background Effects

**Grid Pattern:**
```css
.tv-background {
  background-color: var(--bg-primary);
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}
```

**Radial Glow:**
```css
.tv-background-glow {
  background:
    radial-gradient(
      ellipse at center top,
      rgba(100,100,255,0.15) 0%,
      transparent 50%
    ),
    var(--bg-primary);
}
```

**Animated Gradient:**
```css
.tv-background-animated {
  background: linear-gradient(
    -45deg,
    #1a1a2e,
    #16213e,
    #0f3460,
    #1a1a2e
  );
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

---

## 7. Mobile Controller UI

### Design Principles

```
MOBILE RULES:

1. THUMB-FRIENDLY tap targets (min 44x44px)
2. REDUCE cognitive load - one action per screen
3. IMMEDIATE feedback for all interactions
4. CLEAR visual hierarchy
5. NO tiny text - 16px minimum
```

### Input Patterns

**Text Input Screen:**
```css
.mobile-input-screen {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20px;
  background: var(--bg-primary);
}

.mobile-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.mobile-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--player-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.mobile-prompt {
  font-size: 18px;
  line-height: 1.5;
  margin: 24px 0;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.mobile-textarea {
  flex: 1;
  min-height: 120px;
  padding: 16px;
  font-size: 18px;
  border: 2px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  resize: none;
}

.mobile-textarea:focus {
  outline: none;
  border-color: var(--player-color);
}

.mobile-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  gap: 16px;
}

.mobile-submit-btn {
  flex: 1;
  padding: 16px 24px;
  font-size: 18px;
  font-weight: 600;
  background: var(--player-color);
  color: white;
  border: none;
  border-radius: 12px;
}

.mobile-char-count {
  font-size: 14px;
  color: var(--text-muted);
}
```

**Voting Screen:**
```css
.mobile-vote-option {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  margin: 12px 0;
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 3px solid transparent;
  transition: all 0.2s ease;
}

.mobile-vote-option:active {
  transform: scale(0.98);
}

.mobile-vote-option.selected {
  border-color: var(--player-color);
  background: rgba(255,255,255,0.05);
}

.mobile-vote-content {
  flex: 1;
}

.mobile-vote-answer {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.mobile-vote-author {
  font-size: 14px;
  color: var(--text-muted);
}

.mobile-vote-check {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-vote-option.selected .mobile-vote-check {
  background: var(--player-color);
  border-color: var(--player-color);
}
```

### Waiting States

```css
.mobile-waiting {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px;
}

.mobile-waiting-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--border-subtle);
  border-top-color: var(--player-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.mobile-waiting-text {
  font-size: 18px;
  margin-top: 24px;
  color: var(--text-secondary);
}
```

---

## 8. Game Components Library

### Speech Bubbles

```css
.speech-bubble {
  position: relative;
  padding: clamp(20px, 4vw, 40px);
  background: white;
  border-radius: 20px;
  border: 4px solid var(--player-color);
  box-shadow: 8px 8px 0 rgba(0,0,0,0.2);
}

/* Triangle pointer */
.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 20px 20px 0;
  border-style: solid;
  border-color: var(--player-color) transparent transparent;
}

.speech-bubble-inner::after {
  content: '';
  position: absolute;
  bottom: -14px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 16px 16px 0;
  border-style: solid;
  border-color: white transparent transparent;
}

.speech-bubble-text {
  font-size: clamp(20px, 4vw, 36px);
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  line-height: 1.3;
}
```

### Timer Component

```css
.timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.timer-circle {
  width: clamp(120px, 20vw, 200px);
  height: clamp(120px, 20vw, 200px);
  border-radius: 50%;
  background: conic-gradient(
    var(--timer-color) var(--progress),
    var(--bg-secondary) var(--progress)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.timer-circle::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  background: var(--bg-primary);
}

.timer-value {
  position: relative;
  font-size: clamp(48px, 8vw, 96px);
  font-weight: 700;
  color: var(--timer-color);
}

.timer-label {
  font-size: clamp(16px, 2vw, 24px);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Timer color states */
.timer-normal { --timer-color: #4ADE80; }
.timer-warning { --timer-color: #FACC15; }
.timer-urgent { --timer-color: #EF4444; }
```

### Room Code Display

```css
.room-code {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.room-code-label {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--text-muted);
}

.room-code-value {
  display: flex;
  gap: 8px;
}

.room-code-letter {
  width: clamp(48px, 8vw, 72px);
  height: clamp(60px, 10vw, 90px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 700;
  background: white;
  color: #1a1a1a;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
```

### Winner Badge

```css
.winner-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(
    135deg,
    #FFD600 0%,
    #FFA000 100%
  );
  color: #1a1a1a;
  border-radius: 100px;
  font-weight: 700;
  font-size: clamp(14px, 2vw, 18px);
  text-transform: uppercase;
  animation: winner-pulse 2s infinite;
}

@keyframes winner-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.bonus-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: var(--success);
  color: white;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
}
```

---

## 9. Animations & Micro-interactions

### Entry Animations

```css
/* Pop in - for avatars, cards */
@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.pop-in {
  animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Slide up - for text, answers */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slide-up 0.5s ease-out;
}

/* Bounce - for winner reveal */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.bounce {
  animation: bounce 0.6s ease infinite;
}
```

### Vote Count Animation

```css
@keyframes vote-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.vote-count {
  animation: vote-pop 0.3s ease;
}
```

### Staggered Entry

```css
.stagger-children > * {
  opacity: 0;
  animation: slide-up 0.5s ease forwards;
}

.stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
.stagger-children > *:nth-child(4) { animation-delay: 0.4s; }
.stagger-children > *:nth-child(5) { animation-delay: 0.5s; }
.stagger-children > *:nth-child(6) { animation-delay: 0.6s; }
.stagger-children > *:nth-child(7) { animation-delay: 0.7s; }
.stagger-children > *:nth-child(8) { animation-delay: 0.8s; }
```

### Shake Animation (for wrong/elimination)

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.shake {
  animation: shake 0.4s ease-in-out;
}
```

### Confetti Effect (CSS-only fallback)

```css
.confetti-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 20px;
  animation: confetti-fall 3s ease-out forwards;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100%) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

/* Generate multiple confetti pieces with delays */
.confetti-piece:nth-child(1) { left: 10%; animation-delay: 0s; background: #FF6B6B; }
.confetti-piece:nth-child(2) { left: 20%; animation-delay: 0.1s; background: #4ECDC4; }
.confetti-piece:nth-child(3) { left: 30%; animation-delay: 0.2s; background: #45B7D1; }
/* ... continue pattern ... */
```

### Hover States (Mobile Friendly)

```css
/* Primary interaction: tap feedback */
.tap-feedback:active {
  transform: scale(0.95);
  opacity: 0.8;
}

/* Desktop hover enhancement */
@media (hover: hover) {
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  }
}
```

---

## 10. Sound & Haptic Design

### Sound Design Principles

```
SOUND CATEGORIES:

UI Sounds:
- Button tap: Short, satisfying "pop"
- Join game: Positive chime
- Submit: Confirmation tone
- Error: Gentle buzz

Game Sounds:
- Prompt reveal: Dramatic whoosh
- Timer tick: Clock-like ticking
- Time up: Attention tone
- Vote cast: Soft "ping"
- Winner reveal: Victory fanfare
- Score increase: Coin/money sound

Ambient:
- Lobby: Upbeat background music
- Writing phase: Tense waiting music
- Reveal: Exciting reveal music
```

### Haptic Feedback (Mobile)

```javascript
const HAPTIC_PATTERNS = {
  // Light tap for button presses
  TAP: [10],
  
  // Success feedback
  SUCCESS: [10, 50, 10],
  
  // Error/wrong answer
  ERROR: [50, 30, 50],
  
  // Winner celebration
  WIN: [10, 30, 10, 30, 10, 100],
  
  // Vote received
  VOTE: [5],
  
  // Timer warning
  URGENT: [20, 20, 20, 20, 20],
};

function triggerHaptic(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}
```

---

## 11. Prompt & Answer Patterns

### Prompt Categories

```javascript
const PROMPT_CATEGORIES = {
  FILL_IN_BLANK: {
    template: "The worst thing to say during {situation}",
    examples: [
      "The worst thing to say during a job interview",
      "The worst thing to say during a wedding proposal",
    ]
  },
  
  COMPARISON: {
    template: "What {thing} would make a terrible {role}?",
    examples: [
      "What food would make a terrible superhero?",
      "What animal would make a terrible taxi driver?",
    ]
  },
  
  NAMING: {
    template: "A rejected name for {product}",
    examples: [
      "A rejected name for a restaurant",
      "A rejected name for a baby",
    ]
  },
  
  SONG_TITLE: {
    template: "The hit song from {show}: The Musical",
    examples: [
      "The hit song from Fart: The Musical",
      "The hit song from Existential Dread: The Musical",
    ]
  },
  
  MOVIE_TITLE: {
    template: "If {thing} was a horror movie",
    examples: [
      "If IKEA furniture was a horror movie",
      "If tax season was a horror movie",
    ]
  },
};
```

### Answer Display Rules

```css
/* Auto-scale based on answer length */
.answer-text {
  --base-size: 48px;
  font-size: clamp(
    24px,
    calc(var(--base-size) - (var(--char-count) * 0.5px)),
    64px
  );
}

/* For very long answers */
.answer-text.long {
  font-size: 24px;
  line-height: 1.4;
}

/* Word wrapping */
.answer-text {
  word-wrap: break-word;
  hyphens: auto;
  overflow-wrap: break-word;
}
```

### Character Limits

```javascript
const GAME_LIMITS = {
  MIN_ANSWER_LENGTH: 3,
  MAX_ANSWER_LENGTH: 80,
  MAX_PLAYER_NAME: 15,
  MAX_ROOM_CODE: 4,
};
```

---

## 12. Voting & Results

### Vote Display Patterns

**Anonymous Voting:**
- Show vote counts updating in real-time
- Don't show who voted for what until reveal
- Build suspense with animated counters

**Revealed Voting:**
```
After voting closes:
1. Show vote totals
2. Reveal who voted for each option
3. Animate score changes
4. Celebrate winner
```

### Results Animation Sequence

```css
/* Step 1: Dim non-winners */
.results-step-1 .answer-card:not(.winner) {
  opacity: 0.5;
  filter: grayscale(0.5);
}

/* Step 2: Highlight winner */
.results-step-2 .answer-card.winner {
  transform: scale(1.1);
  box-shadow: 0 0 60px var(--winner-gold);
}

/* Step 3: Show voter avatars */
.results-step-3 .voter-avatars {
  opacity: 1;
  transform: translateY(0);
}

/* Step 4: Animate score */
.results-step-4 .score-change {
  animation: score-count-up 1s ease-out;
}
```

### Tie Handling

```
TIE SCENARIOS:

1. SPLIT POINTS: Both players get half points
2. BONUS ROUND: Sudden death prompt
3. AUDIENCE DECIDER: Let audience vote again
4. BOTH WIN: Celebrate both, move on
```

---

## 13. Leaderboard & Scoring

### Score Display

```css
.score-change {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--success);
  font-weight: 700;
  animation: score-float 1s ease-out forwards;
}

@keyframes score-float {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
    transform: translateY(-10px);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}
```

### Scoring Rules

```javascript
const SCORING = {
  // Base points for winning
  WINNER_POINTS: 1000,
  
  // Bonus for unanimous vote
  UNANIMOUS_BONUS: 500,
  
  // Bonus for "quiplash" (all other players vote for you)
  QUIPLASH_BONUS: 500,
  
  // Points for voting correctly (optional)
  CORRECT_VOTE_POINTS: 100,
  
  // Minimum players for quiplash bonus
  QUIPLASH_MIN_PLAYERS: 3,
};
```

### Final Leaderboard

```
FINAL SCREEN STRUCTURE:

1. "GAME OVER" or "FINAL SCORES"
2. Confetti/explosion effect
3. Rank players:
   - 1st: Large, gold, crown emoji
   - 2nd: Medium, silver
   - 3rd: Small, bronze
   - Others: Standard
4. Play again / New game buttons
5. Share results option
```

---

## 14. Responsive & Cross-Platform

### TV Display Breakpoints

```css
/* TV sizes */
--tv-small: 720p (1280x720);
--tv-medium: 1080p (1920x1080);
--tv-large: 4K (3840x2160);

/* Scale everything based on viewport */
html {
  font-size: calc(16px + 0.5vw);
}
```

### Mobile Breakpoints

```css
/* Mobile first */
--mobile-sm: 320px;   /* Small phones */
--mobile-md: 375px;   /* iPhone standard */
--mobile-lg: 414px;   /* iPhone Plus */
--tablet: 768px;      /* iPad Mini */
```

### Platform Detection

```javascript
const PLATFORM = {
  isTV: window.matchMedia('(min-width: 1280px)').matches && 
        !('ontouchstart' in window),
  isMobile: window.matchMedia('(max-width: 768px)').matches ||
            'ontouchstart' in window,
  isTablet: window.matchMedia('(min-width: 769px) and (max-width: 1024px)').matches,
};
```

---

## 15. Design System Checklist

### Pre-Launch Checklist

**Visual Design:**
- [ ] Player color system defined (8+ colors)
- [ ] Typography readable from 10ft (TV)
- [ ] Typography touch-friendly (mobile)
- [ ] Dark theme implemented
- [ ] All states have proper contrast

**Components:**
- [ ] Speech bubbles
- [ ] Avatar system
- [ ] Room code display
- [ ] Timer component
- [ ] Score display
- [ ] Winner badges
- [ ] Leaderboard
- [ ] Buttons (primary, secondary, outline)
- [ ] Input fields
- [ ] Loading states

**Animations:**
- [ ] Entry animations for all screens
- [ ] Hover/active states
- [ ] Vote count animation
- [ ] Winner celebration
- [ ] Score change animation
- [ ] Timer countdown
- [ ] Transition between phases

**Mobile:**
- [ ] Touch targets 44x44px minimum
- [ ] Text input optimized
- [ ] Keyboard doesn't break layout
- [ ] Haptic feedback implemented
- [ ] No horizontal scroll
- [ ] Works in landscape and portrait

**TV Display:**
- [ ] Text readable from couch
- [ ] No tiny UI elements
- [ ] Centered layout
- [ ] High contrast colors
- [ ] No reliance on hover states

**Game Flow:**
- [ ] Lobby phase works
- [ ] Players can join mid-game (or not)
- [ ] Reconnection handling
- [ ] Host controls
- [ ] Force start option
- [ ] Kick player option

**Performance:**
- [ ] 60fps animations
- [ ] Sub-100ms interaction response
- [ ] Lazy load non-critical assets
- [ ] WebSocket optimization

**Accessibility:**
- [ ] Color blind friendly
- [ ] Sufficient color contrast
- [ ] Screen reader support (mobile)
- [ ] Keyboard navigation (if applicable)

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│              QUIPLASH GAME DESIGN QUICK REF                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  COLORS                                                     │
│  • 8+ player colors: Green, Blue, Pink, Purple,              │
│    Orange, Red, Teal, Yellow                                │
│  • Winner: Gold #FFD600                                     │
│  • Dark BG: #1A1A2E                                         │
│  • Text: White (primary), 70% opacity (secondary)         │
│                                                             │
│  TYPOGRAPHY                                                 │
│  • TV Headlines: 48-120px (clamp)                          │
│  • Mobile: 16-20px minimum                                  │
│  • Fonts: Bungee, Fredoka One, Nunito                        │
│                                                             │
│  SPACING                                                    │
│  • TV padding: 40-80px                                    │
│  • Mobile padding: 16-24px                                  │
│  • Card padding: 24-40px                                    │
│                                                             │
│  ANIMATIONS                                                 │
│  • Entry: 0.3-0.5s with bounce                              │
│  • Hover: 0.15s                                             │
│  • Winner: Pulse + confetti                                 │
│                                                             │
│  MOBILE TARGETS                                             │
│  • Min tap: 44x44px                                         │
│  • Input height: 120px min                                  │
│  • Button height: 48px min                                  │
│                                                             │
│  GAME PHASES                                                │
│  Lobby → Prompt → Write → Vote → Reveal → Score             │
│                                                             │
│  KEY COMPONENTS                                             │
│  • Speech bubbles with player color border                  │
│  • Circular timer with color states                         │
│  • Avatar + name tag combo                                  │
│  • Room code letter blocks                                  │
│  • Winner badge + bonus points                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Final Words

The best party games:

1. **Get players laughing in 30 seconds**
2. **Require zero explanation**
3. **Celebrate every contribution**
4. **Keep everyone engaged, even when not their turn**
5. **End with everyone wanting to play again**

Remember: **The game is a stage for player creativity.** Your UI should get out of the way and let the funny happen.

---

**Inspired by:**
- Jackbox Quiplash (obviously)
- Jackbox Trivia Murder Party
- Among Us
- Kahoot

**Version:** 1.0
**Created:** January 2026

---

*Now go make something hilarious.* 🎮
