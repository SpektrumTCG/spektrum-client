# Game Loop Migration Design
**Date:** 2026-04-16
**Scope:** Migrate Spektrum v1 core game loop to v2 — engine, card data, AI, and Zustand integration. UI components (`components2D/`) are out of scope for this phase.

---

## 1. Architecture Overview

Two layers with strict separation:

### Domain Layer — `src/domain/game/`
Pure TypeScript only. No React imports, no Zustand. The game engine is framework-agnostic and fully testable in isolation.

```
src/domain/game/
├── types/          ← card, game state, phase, effect, status interfaces
├── data/           ← all card definitions (fire, water, ground, air, neutral, genesis)
├── engine/         ← core game logic (turn flow, effect processing, skill triggers)
└── ai/             ← AI players (newbie, regular, enhanced)
```

### Feature Layer — `src/features/game/`
React/Zustand integration. A thin layer that holds state and exposes hooks. v1's 20+ stores are consolidated into one Zustand store.

```
src/features/game/
├── store.ts        ← single Zustand store wrapping the engine
├── hooks/          ← useGame(), useGameState() selectors
└── index.tsx       ← feature entry point (already exists)
```

---

## 2. Domain Layer — Types

**Location:** `src/domain/game/types/`

| File | Contents |
|------|----------|
| `card.ts` | `CardType`, `Element`, `Rarity`, `Skill`, `Effect`, `StatusCounter` |
| `game.ts` | `GameState`, `Player`, `Board`, `Hand`, `Deck`, `Zone` |
| `phase.ts` | `GamePhase` (Draw \| Main \| Battle \| End), `TurnState` |
| `index.ts` | Re-exports everything |

All types are migrated and consolidated from v1's scattered `game/types/`, `game/data/cardTypes.ts`, and inline definitions.

---

## 3. Domain Layer — Engine

**Location:** `src/domain/game/engine/`

All engine functions are **pure**: they take `GameState` and return a new `GameState`. No mutation, no side effects.

| File | Responsibility |
|------|---------------|
| `gameEngine.ts` | State machine: `startGame`, `drawCard`, `playCard`, `attackWith`, `endPhase`, `endTurn` |
| `effectProcessor.ts` | Spell effect resolution: damage, heal, draw, discard |
| `skillTriggerChecker.ts` | Passive skill triggers: `on_draw`, `on_skill_use`, scope checks |
| `fieldTriggerProcessor.ts` | Field card effects: passive board-wide triggers |
| `modifierUtils.ts` | Stat modifier calculations: damage boost, heal boost, cost reduction |
| `discardMechanicChecker.ts` | Discard bonus logic |

---

## 4. Domain Layer — Card Data

**Location:** `src/domain/game/data/`

Card definitions are migrated from v1's scattered files and organized by element/expansion.

```
data/
├── cards/
│   ├── fire.ts         ← migrated from newFireCards.ts
│   ├── water.ts        ← migrated from blueElementalCards.ts
│   ├── ground.ts
│   ├── air.ts
│   ├── neutral.ts      ← migrated from neutralCards.ts
│   └── genesis.ts      ← genesis expansion cards
├── cardRegistry.ts     ← unified lookup: getCardById(), getAllCards(), getCardsByElement()
└── index.ts
```

`cardRegistry.ts` provides a single source of truth for all card lookups, replacing ad-hoc array searches scattered through v1.

---

## 5. Domain Layer — AI

**Location:** `src/domain/game/ai/`

All AI classes are pure: they take `GameState` and return a `GameAction`. No React, no side effects.

```
ai/
├── BaseAI.ts       ← abstract class with shared decision helpers (score a card, evaluate board)
├── NewbieAI.ts     ← random valid play selection
├── RegularAI.ts    ← basic heuristics (play highest damage, heal when low HP)
├── EnhancedAI.ts   ← advanced strategy (element synergies, spell combos, board control)
└── index.ts        ← exports AIFactory.create(difficulty: 'newbie' | 'regular' | 'enhanced')
```

| AI Level | Strategy |
|----------|----------|
| Newbie | Randomly selects from valid plays |
| Regular | Basic heuristics: maximize damage, heal when HP low |
| Enhanced | Advanced: element synergies, spell combos, board control, lookahead |

---

## 6. Feature Layer — Zustand Store & Hooks

**Location:** `src/features/game/`

### Store Shape (`store.ts`)

```ts
interface GameStore {
  // state
  game: GameState | null
  aiDifficulty: 'newbie' | 'regular' | 'enhanced'

  // actions
  startGame: (playerDeck: CardType[], difficulty: AIDifficulty) => void
  playCard: (cardId: string, target?: string) => void
  attackWith: (attackerId: string, targetId: string) => void
  endPhase: () => void
  endTurn: () => void
  resetGame: () => void
}
```

The store calls pure engine functions, updates state immutably, then automatically triggers the AI turn when it becomes the opponent's turn.

### Hooks

| Hook | Purpose |
|------|---------|
| `useGame.ts` | Action dispatchers: `playCard`, `attack`, `endPhase`, etc. |
| `useGameState.ts` | State selectors: `useHand`, `useBoard`, `useCurrentPhase`, etc. |

---

## 7. Out of Scope (This Phase)

- `components2D/` — 2D board UI (GameBoard2D, Card2D, Hand2D, etc.)
- Placement/draw animations, card reveal modals, target selector UI
- Socket.io multiplayer
- Ante/wager mode
- Booster pack system
- Blockchain integration

These are separate phases that will wire into `useGame()` / `useGameState()` once the engine is in place.

---

## 8. Migration Strategy

1. Migrate types first — establishes the contract everything else depends on
2. Migrate card data — needed by engine and AI
3. Migrate engine utils (effectProcessor, modifierUtils, etc.) — pure logic
4. Migrate gameEngine.ts — ties utils together into a state machine
5. Migrate AI (BaseAI → NewbieAI → RegularAI → EnhancedAI)
6. Wire feature layer (store + hooks)
7. Verify existing `src/features/game/index.tsx` still exports correctly
