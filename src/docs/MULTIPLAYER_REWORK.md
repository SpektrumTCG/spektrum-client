# Multiplayer Rework — Progress & Plan

Tracks the v2 multiplayer redesign. v1 is reference only; v2 is being rebuilt around the shared `src/domain/game/engine/` helpers so the server and the AI client run the same gameplay logic.

Decisions:
- **Strategy**: v2 redesign, v1 as reference.
- **Hand size**: 6 (with guaranteed Level 1 avatar via mulligan).
- **Ante mode**: out of scope until core PvP is solid. Inherits engine fixes for free.

---

## Phase 1 — Server engine parity ✅ DONE

### Server (`server/gameEngine/ServerGameState.ts`)
- Hand size constant 5 → **6**.
- New `drawInitialHand(playerKey)`: pulls one random Level 1 avatar from deck first, then draws 5 more from top. Mulligans once if no L1 ended up in hand. Replaces the old plain `splice(0,5)` flow.
- New optional fields on `ServerPlayerState`: `needsToSelectReserveAvatar?: boolean`, `needsToDiscardCards?: boolean`. Currently default `false` and surfaced in `getPlayerView` via spread; reserved for Phase 2 reserve-selection flow.
- `validateUseAvatarSkill` now delegates to shared engine helpers (used by AI client too):
  - `checkSkillTrigger` + `getModifiedDamage` → tribe advantage / structured-condition damage modification
  - `getPassiveModifier` + `calculateModifierBonus` → passive `skill_damage_boost`
  - `resolveEffectTargets` → multi-target / reserve-target skills (was always opponent-active before)
  - `processGameEffect` → effect application via the same code path as AI engine
- Trigger messages now appear in battle log.

### Client mapper (`src/features/game/store.ts`)
- `applyServerGameState` reads real avatar HP/maxHP from `activeAvatar.health - counters.damage` (was hardcoded 20/20).
- Propagates `needsToDiscardCards` (alongside existing `needsToSelectReserveAvatar`).
- Drops stale frames via monotonic `_seq`: new `_lastServerSeq` field on the store, reset in `resetGame`.

### Verification
- `npx tsc --noEmit` clean.
- **Not yet smoke-tested live.** Run a multiplayer match end-to-end before starting Phase 2 — the deal flow + skill damage path both changed.

---

## Phase 2 — Client sync correctness & match flow

Goal: make a match feel reliable when things go wrong.

### 2.1 Deck-rejected hard error (small)
**Problem**: `useMultiplayerGameSync.ts` currently increments `submitAttempt` on `deck_rejected`, which retriggers the same submit — infinite loop on permanently-bad decks.

**Fix**:
- Treat `deck_rejected` as terminal: leave the room, route to `/cards` with a toast explaining which card(s) are invalid (server already includes the reason).
- Drop the `submitAttempt` retry counter.

Files: `src/features/game/hooks/useMultiplayerGameSync.ts`, possibly `src/features/multiplayer/index.tsx`.

### 2.2 Opponent-disconnect auto-forfeit timer (medium)
**Problem**: `opponentDisconnected` flag exists on the client but there's no resolution — the disconnected player can ghost forever.

**Fix**:
- Server side: on `disconnect`, start a 60s grace timer per room. If the player rejoins within the window, cancel. Otherwise emit `opponent_forfeited` and end the game with the remaining player as winner.
- Client side: show countdown overlay "Opponent disconnected — auto-win in N seconds". Cancel overlay if `opponent_reconnected`.

Files: `server/services/multiplayerWebSocket.ts`, `src/features/game/hooks/useMultiplayerGameSync.ts`, `src/features/game/components/GameBoard2D.tsx`.

### 2.3 Reconnect-into-running-game (medium)
**Problem**: If the user refreshes mid-match, they're not auto-rejoined.

**Fix**:
- On socket reconnect, if `currentRoom` is still set and status is `playing`, emit `request_game_state`. Server already handles this and emits `game_state_sync`.
- Show a "Reconnecting…" overlay between disconnect and `game_state_sync` arrival.
- Persist `currentRoom`/`currentPlayer` to localStorage in `useMultiplayerStore` so a hard refresh can rehydrate.

Files: `src/stores/useMultiplayerStore.ts`, `src/features/game/hooks/useMultiplayerGameSync.ts`.

### 2.4 Server turn timer (medium, optional for Phase 2)
**Problem**: A stalling player can hold the turn forever.

**Fix**:
- Add per-turn timer on the server (e.g. 90s). Broadcast `turn_timer_tick` every second. On expiry, force `endTurn`.
- Client shows the countdown.

Files: `server/services/multiplayerWebSocket.ts`, `server/gameEngine/ServerGameState.ts`, `src/features/game/components/GameBoard2D.tsx`.

---

## Phase 3 — Game board UX parity with interactive tutorial

Goal: bring the polished select-then-target UX from `src/features/tutorial/interactive/index.tsx` into PvP. Reuse for AI mode too.

### 3.1 Port spotlight + selection model
- Tutorial uses: `selectedId` (which card/zone is picked), `shakingId` (rejection animation), `spotlit` Set (highlights valid targets), `isDimmed` (greys out invalid zones).
- `GameBoard2D.tsx` already has multiplayer wiring but uses older interaction patterns. Lift the tutorial's pattern into a shared hook (`useSelectThenTarget`) and apply to PvP + PvAI.

### 3.2 Opponent-turn overlay
- Tutorial shows a banner during opponent's turn (`oppPhase`: `banner` → `spektra` → `attacking` → `result` → `player-banner`).
- For PvP, simplify: single "Opponent's Turn" banner, dismissed on `currentPlayer === self`.

### 3.3 Waiting-for-opponent overlay
- Already partially present (`waitingForGameStart`). Polish styling to match the tutorial's overlay aesthetic.

Files: `src/features/game/components/GameBoard2D.tsx`, possibly extract `src/features/game/hooks/useSelectThenTarget.ts`.

---

## Phase 4 — Ante mode + polish

### 4.1 Ante audit
Now that the shared engine works for PvP, walk through Ante to make sure:
- Wager flow stages correctly (escrow before match, transfer on win).
- `useAnteGameSync` delivers the same `applyServerGameState` shape.
- Disconnect during ante doesn't drop the wager (escrow timeout / refund path).

Files: `server/services/anteWebSocket.ts`, `server/services/blockchainAnte.ts`, `src/features/game/hooks/useAnteGameSync.ts`, `src/components/shared/ante/`.

### 4.2 Server security pass
Memory note `server_security.md` flags 12 open vulns from Apr 18 audit; **P0: PvP endpoints have zero auth.** Address before any non-friend-room traffic. Full list in `src/docs/SERVER_API.md`.

### 4.3 Spectator mode (stretch)
Settings already include `allowSpectators`. Wire a read-only socket subscription that gets the public view (no hidden hands).

---

## Known gaps to revisit

- **`applySkillEffect` (server)**: Phase 1 added `processGameEffect` for the primary effect path, but the older switch-statement `applySkillEffect` (heal/shield/bleed/draw) still exists in the file as a fallback. Once Phase 2 stabilizes, delete it and route everything through `processGameEffect`.
- **`spellEffectHandler.ts`**: v1 had this; v2 doesn't. Server-side `validateAddToSpektraPile` and spell-card play paths may diverge from AI client until ported. Audit during Phase 3.
- **Reserve auto-promotion vs. selection**: v2 server auto-promotes the first reserve on defeat. v1 surfaced a `needsToSelectReserveAvatar` flag and let the player choose. Fields exist in v2 now (Phase 1) but the choice flow isn't wired. Phase 2 candidate.

---

## Quick reference — key files

- `server/gameEngine/ServerGameState.ts` — authoritative engine
- `server/services/multiplayerWebSocket.ts` — socket handlers, room lifecycle
- `server/services/multiplayerMatchmaking.ts` — queue + room creation
- `src/domain/game/engine/` — shared helpers (`gameEngine.ts`, `effectProcessor.ts`, `skillTriggerChecker.ts`, `effectTargetResolver.ts`, `modifierUtils.ts`)
- `src/features/game/store.ts` — client GameState + `applyServerGameState` mapper
- `src/features/game/hooks/useMultiplayerGameSync.ts` — socket → store bridge
- `src/features/game/components/GameBoard2D.tsx` — main board UI
- `src/stores/useMultiplayerStore.ts` — connection + room state
- `src/features/multiplayer/index.tsx` — matchmaking + lobby UI
- `src/features/tutorial/interactive/index.tsx` — UX reference for select-then-target

Reference (read-only): `spektrum-v1/` mirror of the old project.
