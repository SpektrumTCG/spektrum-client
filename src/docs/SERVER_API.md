# Spektrum Server API Documentation

> **Contract status:** This document is the source of truth for the HTTP/socket
> contract between `spektrum-client` and `spektrum-server` after the split
> (see `docs/REPO_SPLIT_PLAN.md`). Any breaking change to a route shape
> requires a coordinated PR across both future repos.

> **Stack:** Express.js + TypeScript · Neon (PostgreSQL via Drizzle ORM) · Cookie-based sessions · Wallet auth  
> **Base URL:** `http://localhost:5000` (dev) / production host  
> **Auth:** Session cookie (`sessionId`) issued automatically. Wallet association required for protected routes.

---

## Authentication Model

| Middleware | What it checks | Applied to |
|---|---|---|
| `sessionAuth` | Creates or validates `sessionId` cookie on every request | All routes (global) |
| `walletAuth` | Requires session to have an associated wallet address | Sensitive mutation routes |
| Rate limiting | `generalRateLimit` (100/min), `authRateLimit` (10/min), `strictRateLimit` (30/min) | `/api`, `/api/auth`, `/api/admin`, `/api/wallet` |

---

## Endpoint Reference

### Health

#### `GET /api/health`
Returns server health status including rate limit and session statistics.

**Auth:** None  
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-18T...",
  "rateLimitStats": { "totalClients": 0, "activeClients": 0 },
  "sessionStats": { "totalSessions": 0, "activeSessions": 0, "averageSessionAge": 0 },
  "security": { "cspEnabled": true, "sessionManagement": true, "inputValidation": true, "rateLimiting": true }
}
```

---

### Session

#### `POST /api/session/wallet` **STALE — removed**
Previously associated a wallet address with the current session. Wallet linkage is now handled by Clerk Solana sign-in; no equivalent server route exists.

#### `DELETE /api/session` **STALE — removed**
Previously destroyed the session cookie. Session lifecycle is now owned by Clerk on the client.

---

### Email Auth **STALE — removed**

#### `POST /api/auth/email/register` **STALE — removed**
Email/password registration is no longer exposed by the server. Identity is owned by Clerk.

#### `POST /api/auth/email/login` **STALE — removed**
Email/password login is no longer exposed by the server. Identity is owned by Clerk.

---

### Player

#### `POST /api/player/connect`
Registers or updates a player on wallet connect. Records geo-location and associates wallet with session.

**Auth:** None ⚠️  
**Body:** `{ walletAddress: string }`  
**Response:** `{ success: true, isNewPlayer: bool, player: { id, walletAddress, displayName, gamesPlayed, gamesWon, gamesLost, country, region } }`

#### `PUT /api/player/profile`
Updates the player's display name.

**Auth:** `walletAuth` (required)  
**Body:** `{ displayName: string }` (1–100 chars)  
**Response:** `{ success: true, player: Player, message: "Display name updated successfully" }`  
**Errors:** `400` invalid name · `401` no session/wallet

#### `GET /api/player/welcome-status/:walletAddress`
Returns whether the player has seen the welcome popup.

**Auth:** None  
**Response:** `{ isNewPlayer: bool, hasSeenWelcome: bool }`

#### `PUT /api/player/welcome-seen`
Marks the welcome popup as seen for the authenticated wallet.

**Auth:** `walletAuth` (required)  
**Response:** `{ success: true, hasSeenWelcome: true }`

#### `GET /api/player/ritual-status/:walletAddress`
Returns the player's Ritual completion status and choices.

**Auth:** None  
**Response:** `{ hasCompletedRitual: bool, chosenFaction: string|null, chosenElement: string|null, starterDeckId: string|null }`

#### `PUT /api/player/complete-ritual`
Records The Ritual faction/element choices for the authenticated wallet.

**Auth:** `walletAuth` (required)  
**Body:** `{ faction: "guardians"|"corrupted", element: "fire"|"water", starterDeckId: string }`  
**Response:** `{ success: true, hasCompletedRitual: true, chosenFaction, chosenElement, starterDeckId }`  
**Errors:** `400` invalid faction/element or ritual already completed

#### `GET /api/player/tutorial-status/:walletAddress`
Returns tutorial progress from the database.

**Auth:** None  
**Response:** `{ hasCompletedTutorial: bool, currentStep: number, completedSteps: number[] }`

#### `PUT /api/player/tutorial-progress`
Saves tutorial progress. **No session authentication — walletAddress supplied in body.**

**Auth:** None ⚠️  
**Body:** `{ walletAddress: string, currentStep?: number, completedSteps?: number[], completed?: bool }`  
**Response:** `{ success: true }`

#### `POST /api/player/add-starter-cards`
Adds starter deck cards to the player's collection. Uses DB-authoritative card list (client list ignored).

**Auth:** `walletAuth` (required)  
**Body:** `{ deckId: string }`  
**Response:** `{ success: true, cardsAdded: number }`  
**Errors:** `400` deck not found

#### `POST /api/player/game-result`
Records a win/loss for the session-authenticated player.

**Auth:** Session (wallet from session, not body)  
**Body:** `{ won: boolean, isRanked?: boolean }`  
**Response:** `{ success: true, player: Player, message: "Game result recorded" }`

#### `POST /api/player/session/start`
Records a session start timestamp for uptime tracking. **No auth — wallet from body.**

**Auth:** None ⚠️  
**Body:** `{ walletAddress: string }`  
**Response:** `{ success: true }`

#### `POST /api/player/session/end`
Records session end and accumulates `totalUptime`. **No auth — wallet from body.**

**Auth:** None ⚠️  
**Body:** `{ walletAddress: string }`  
**Response:** `{ success: true, sessionDuration: number, totalUptime: number }`

---

### Cards

#### `GET /api/cards/catalog`
Returns all cards in the master card database.

**Auth:** None  
**Response:** `{ success: true, cards: Card[], total: number }`

#### `GET /api/card-catalog`
Alias for `/api/cards/catalog` (used by `useCardCatalogStore`).

**Auth:** None  
**Response:** Same as `/api/cards/catalog`

#### `POST /api/cards/add`
Adds cards to the session-authenticated player's collection.

**Auth:** Session (wallet from session)  
**Body:** `{ cards: Array<{ cardId: string, quantity?: number, source?: string, metadata?: any }> }`  
**Validation:** Zod schema — cards array min length 1  
**Response:** `{ success: true, cards: PlayerCard[] }`

#### `GET /api/cards/:walletAddress`
Returns the player's card collection, hydrated with full catalog data.

**Auth:** None ⚠️ (wallet from URL param — no ownership check)  
**Response:** `{ success: true, cards: HydratedPlayerCard[] }`

---

### Decks

#### `POST /api/decks/save`
Creates or updates a deck. Validates ownership, card count (≥ 40), max 5 decks per user, max 4 copies per card, and card ownership.

**Auth:** Session (wallet from session)  
**Body:** `{ deckId: string, deckName: string, cardIds: string[], coverCardId?: string|null, element?: string, isActive?: 0|1 }`  
**Validation:** Zod schema  
**Response:** `{ success: true, deck: PlayerDeck, message: "..." }` — `200` update / `201` create  
**Errors:** `400` deck too small/too many copies/insufficient cards · `403` wrong owner · `401` no session

#### `GET /api/decks/:walletAddress`
Returns all decks for a wallet, with each deck's cards hydrated from the catalog.

**Auth:** None ⚠️  
**Response:** `{ success: true, decks: HydratedPlayerDeck[] }`

#### `DELETE /api/decks/:deckId`
Deletes a deck. Verifies deck belongs to session wallet.

**Auth:** Session (wallet from session)  
**Response:** `204 No Content`  
**Errors:** `403` wrong owner · `404` not found

#### `PUT /api/decks/:deckId/activate`
Sets a deck as the active deck. Verifies ownership.

**Auth:** Session (wallet from session)  
**Response:** `{ success: true, deck: PlayerDeck, message: "Deck activated successfully" }`

#### `POST /api/decks/set-active`
Alternative activation endpoint using POST body instead of URL param.

**Auth:** Session (wallet from session)  
**Body:** `{ deckId: string }`  
**Response:** `{ success: true, deck: PlayerDeck }`

#### `POST /api/decks/usage`
Records deck usage with a game result.

**Auth:** Session (wallet from session)  
**Body:** `{ deckId: string, result: "win"|"loss"|"draw" }`  
**Response:** `{ success: true, usage: DeckUsage, message: "Deck usage recorded" }`

---

### Starter Decks

#### `GET /api/starter-decks`
Returns all starter decks with their card lists.

**Auth:** None  
**Response:** `Array<{ id, name, faction, element, tribes, description, cards: [...] }>`

#### `GET /api/starter-decks/:deckId`
Returns a single starter deck with full card data joined from the cards catalog.

**Auth:** None  
**Response:** `{ id, name, faction, element, tribes, description, cards: [...] }`

---

### Premade Decks

#### `GET /api/premade-decks`
Returns all premade decks available for purchase.

**Auth:** None  
**Response:** `Array<{ id, name, expansion, element, tribe, description, price, cardCount, strategy, difficulty, coverCardName, keyCards, artUrl, deckBoxImageUrl, cards: [...] }>`

#### `GET /api/premade-decks/:deckId`
Returns a single premade deck with full card data.

**Auth:** None  
**Response:** Same shape as above for one deck

---

### Purchases

#### `POST /api/purchases/claim-premade-deck`
**Server-authoritative** premade deck purchase. Resolves random card slots, adds cards to collection, saves deck record, and records the purchase atomically.

**Auth:** Session (wallet from session)  
**Body:** `{ deckId: string }`  
**Response:** `{ success: true, deckName, deckId, cards: [...], totalCards: number }`  
**Errors:** `400` already purchased · `404` deck not found

#### `POST /api/purchases/claim-starter-deck`
**Server-authoritative** starter deck claim. Maps `cardNumber → cardId` from DB. Prevents duplicate claims via `source = 'starter_deck'` check.

**Auth:** None ⚠️ (walletAddress from body)  
**Body:** `{ walletAddress: string, deckId: string }`  
**Response:** `{ success: true, deckName, deckId, cards: [...], totalCards: number }`  
**Errors:** `400` already claimed · `404` deck not found

#### `POST /api/purchases/premade-deck`
*Legacy* — records a premade deck purchase without adding cards. Superseded by `/api/purchases/claim-premade-deck`.

**Auth:** Session (wallet from session)  
**Body:** `{ deckId: string, deckName: string }`  
**Response:** `{ success: true, purchase, message }`

#### `POST /api/purchases/booster-pack`
Records a booster pack purchase (does not generate cards).

**Auth:** Session (wallet from session)  
**Body:** `{ packName: string, packId?: string, price?: number, metadata?: any }`  
**Response:** `{ success: true, purchase, message }`

#### `GET /api/purchases/premade-decks/:walletAddress`
Returns the list of premade decks purchased by a wallet.

**Auth:** None ⚠️  
**Response:** `{ success: true, premadeDecks: Array<{ deckId, deckName, purchasedAt }> }`

---

### Booster Packs

#### `POST /api/booster-packs/save`
Saves a booster pack to the player's inventory (after purchase flow).

**Auth:** Session (wallet from session)  
**Body:** `{ packId: string, packName: string, purchasePrice?: number, variantData?: any, packData?: any, artUrl?: string }`  
**Response:** `{ success: true, pack: PlayerBoosterPack }`

#### `GET /api/booster-packs/:walletAddress`
Returns player's booster pack inventory. Enforces session wallet must match URL wallet.

**Auth:** Session (wallet must match URL param)  
**Response:** `{ packs: PlayerBoosterPack[] }`

#### `PUT /api/booster-packs/open`
Marks a pack as opened. Verifies pack belongs to session wallet.

**Auth:** Session (wallet from session)  
**Body:** `{ packId: string }`  
**Response:** `{ success: true, pack: PlayerBoosterPack }`

#### `POST /api/booster-packs/generate-cards`
Server-side card generation for pack opening. Pulls stored rarity/element from pack record, applies weighted random selection, marks pack as opened, returns generated cards.

**Auth:** Session (wallet from session)  
**Body:** `{ packId: string }`  
**Rarity templates:** `Beginner` (4C+1W) · `Advanced` (4C+1W) · `Expert` (4C+1W) with different weight distributions  
**Response:** `{ success: true, cards: GeneratedCard[], packId, template: string }`

---

### Achievements

#### `GET /api/achievements/:walletAddress`
Returns all achievements and progress for a wallet.

**Auth:** None  
**Response:** `{ achievements: PlayerAchievement[] }`

#### `POST /api/achievements/:walletAddress/:achievementId/progress`
Updates achievement progress. Verifies session wallet matches URL wallet.

**Auth:** `walletAuth` (required)  
**Body:** `{ progress: number }`  
**Response:** `{ achievement: PlayerAchievement }`

#### `POST /api/achievements/:walletAddress/:achievementId/unlock`
Unlocks an achievement. Verifies session wallet matches URL wallet.

**Auth:** `walletAuth` (required)  
**Response:** `{ achievement: PlayerAchievement }`

---

### PvP Matches

> **Note:** These REST endpoints exist but appear unused by the frontend. PvP gameplay is handled via WebSocket (`/ws/multiplayer`).

#### `POST /api/pvp/create`
Creates a new PvP match (host waiting for opponent).

**Auth:** `walletAuth` (required)  
**Body:** `{ deckId: string, gameMode?: "casual"|"ranked" }`  
**Response:** `{ success: true, match: PvpMatch }`

#### `GET /api/pvp/waiting`
Lists matches in `waiting` status (matchmaking queue).

**Auth:** None  
**Query:** `?gameMode=casual`  
**Response:** `{ matches: PvpMatch[] }`

#### `POST /api/pvp/join`
Joins a waiting match as player 2.

**Auth:** None ⚠️ (walletAddress from body)  
**Body:** `{ matchId: string, walletAddress: string, deckId: string }`  
**Response:** `{ success: true, match: PvpMatch }`

#### `GET /api/pvp/match/:matchId`
Returns full match state including both players' decks.

**Auth:** None  
**Response:** `{ match: PvpMatch, player1Deck: PlayerDeck|null, player2Deck: PlayerDeck|null }`

#### `PUT /api/pvp/match/:matchId/state`
Updates the in-progress game state.

**Auth:** None ⚠️  
**Body:** `{ gameState?: any, currentTurn?: number, activePlayer?: string }`  
**Response:** `{ success: true, match: PvpMatch }`

#### `POST /api/pvp/match/:matchId/end`
Ends a match, records the winner, updates both players' stats.

**Auth:** None ⚠️  
**Body:** `{ winnerWallet?: string, endReason?: string }`  
**Response:** `{ success: true, match: PvpMatch }`

#### `POST /api/pvp/match/:matchId/action`
Records a game action for replay/sync purposes.

**Auth:** None ⚠️  
**Body:** `{ playerWallet: string, actionType: string, cardId?: string, targetId?: string, actionData?: any, gameStateAfter?: any }`  
**Response:** `{ success: true, action: MatchAction }`

#### `GET /api/pvp/match/:matchId/actions`
Returns all actions for a match, optionally filtered by `since` action number.

**Auth:** None  
**Query:** `?since=<actionNumber>`  
**Response:** `{ actions: MatchAction[] }`

#### `GET /api/pvp/active/:walletAddress`
Returns the player's current active match, if any.

**Auth:** None  
**Response:** `{ match: PvpMatch|null }`

#### `GET /api/pvp/history/:walletAddress`
Returns the player's match history.

**Auth:** None  
**Query:** `?limit=20`  
**Response:** `{ matches: PvpMatch[] }`

#### `POST /api/pvp/match/:matchId/cancel`
Cancels a waiting match. Verifies `walletAddress` from body matches match host.

**Auth:** None ⚠️ (walletAddress from body — no session check)  
**Body:** `{ walletAddress: string }`  
**Response:** `{ success: true, match: PvpMatch }`

---

### Analytics

#### `GET /api/analytics/players`
**Stub** — always returns an empty player list with a message to use individual endpoints.

**Auth:** None ⚠️  
**Response:** `{ success: true, players: [], message: "..." }`

#### `GET /api/analytics/purchases`
Returns full purchase history for a wallet.

**Auth:** None ⚠️  
**Query:** `?walletAddress=<address>`  
**Response:** `{ success: true, walletAddress, totalPurchases, purchases, summary: { boosterPacks, premadeDecks, bundles } }`

#### `GET /api/analytics/player/:walletAddress`
Returns detailed player analytics including game stats, location, session data, purchase summary, and deck usage.

**Auth:** None ⚠️  
**Response:** `{ success: true, player, location, session, purchases, deckUsage }`

---

### Seeker Genesis Token

#### `POST /api/seeker/nonce` **STALE — removed**
Previously generated a SIWS nonce for wallet ownership verification. Not registered in the current server; `POST /api/seeker/verify` is now invoked under Clerk-authenticated context without a separate nonce step.

#### `POST /api/seeker/verify`
Verifies the SIWS signature, checks Seeker Genesis Token (SGT) ownership on-chain, and updates player record if verified.

**Auth:** None (self-authenticating via signature)  
**Body:** `{ walletAddress: string, message: string, signature: number[]|object }`  
**Response:** `{ verified: bool, hasSGT: bool, mintAddress?: string, rewardAvailable?: bool }`

#### `GET /api/seeker/status/:walletAddress`
Returns a player's Seeker verification status and reward claim state.

**Auth:** None  
**Response:** `{ isSeekerVerified: bool, seekerVerifiedAt, seekerTokenMint, seekerRewardClaimed: bool }`

#### `POST /api/seeker/claim-nonce` **STALE — removed**
Previously generated a claim message and nonce. Not registered in the current server; `POST /api/seeker/claim-reward` is now invoked under Clerk-authenticated context without a separate nonce step.

#### `POST /api/seeker/claim-reward`
Verifies claim signature and grants a `Seeker Genesis Reward Pack` booster pack. One-time claim, idempotent check.

**Auth:** None (self-authenticating via signature)  
**Body:** `{ walletAddress: string, message: string, signature: number[]|object }`  
**Requires:** `isSeekerVerified = true` on player record  
**Response:** `{ success: true, reward: { type, name, packId } }`

---

### Design Tokens *(dev only for mutations)*

#### `GET /api/design-tokens`
Returns current design tokens from `docs/design-tokens.json`.

**Auth:** None  
**Response:** Token JSON object · `404` if no custom tokens set

#### `PUT /api/design-tokens` *(dev only)*
Saves new design tokens to disk.

**Auth:** None · blocked in production  
**Body:** Token JSON object  
**Response:** `{ success: true, message: "..." }`

#### `POST /api/design-tokens/reset` *(dev only)*
Deletes the custom tokens file, restoring defaults.

**Auth:** None · blocked in production  
**Response:** `{ success: true, message: "..." }`

#### `GET /api/design-tokens/export`
Returns the tokens file as a downloadable JSON attachment.

**Auth:** None  
**Response:** `Content-Disposition: attachment; filename="spektrum-design-tokens.json"`

---

### Schema *(dev only)*

#### `GET /api/schema` *(dev only)*
Queries PostgreSQL `information_schema` to return full live schema with column types, constraints, and row counts.

**Auth:** None · blocked in production  
**Response:** `{ tables: TableSchema[] }`

#### `POST /api/schema/save` *(dev only)*
Saves schema JSON to `docs/schema-model.json`.

**Auth:** None · blocked in production  
**Body:** `{ schema: any }`  
**Response:** `{ success: true, path: "docs/schema-model.json" }`

#### `GET /api/schema/load` *(dev only)*
Loads previously saved schema from `docs/schema-model.json`.

**Auth:** None · blocked in production  
**Response:** `{ schema: any|null }`

---

### Card Modifications *(dev only for writes)*

#### `POST /api/save-modifications` *(dev only)*
Saves card modification data to `card-modifications-export.json` in the working directory.

**Auth:** None · blocked in production  
**Body:** `{ modifications: any[], deletedIds?: string[], totalModifications: number }`  
**Response:** `{ success: true, saved: number, backupPath, summary }`

#### `GET /api/card-modifications`
Returns saved card modifications from `card-modifications-export.json`. Returns empty mods if file doesn't exist.

**Auth:** None  
**Response:** `{ success: true, modifications: [], deletedIds: [], totalModifications: 0 }`

---

### Misc

#### `POST /api/validate-input`
Generic input validation endpoint — echoes back sanitized input. **No known frontend callers.**

**Auth:** None  
**Body:** `{ input: string }` (max 1000 chars)  
**Response:** `{ message: "Input validated", sanitized: string }`

---

## WebSocket Endpoints

| Path | Handler | Purpose |
|---|---|---|
| `/ws/ante` | `setupAnteWebSocket` | Ante battle real-time game loop |
| `/ws/multiplayer` | `setupMultiplayerWebSocket` | Multiplayer matchmaking and game sync |

---

## Security Audit Report

> **Mode:** Daily (8/10 confidence gate)  
> **Scope:** `server/`  
> **Date:** 2026-04-18

---

### ⚠️ UNUSED ENDPOINTS

The following endpoints have no callers in `src/` and should be reviewed for removal or future use:

| Endpoint | Status | Notes |
|---|---|---|
| `POST /api/validate-input` | Unused | No frontend callers. Generic echo endpoint with no downstream consumers. |
| `GET /api/analytics/players` | Unused stub | Always returns `players: []`. Never implemented. |
| All `POST/PUT/GET /api/pvp/*` | Likely unused | No frontend callers found. PvP uses WebSocket. REST endpoints still active. |
| `GET /api/design-tokens/export` | No frontend callers | Dev tooling only. |
| `POST /api/purchases/premade-deck` | Superseded | Legacy recording-only route. Superseded by `/api/purchases/claim-premade-deck`. Both are active. |

---

### 🔴 HIGH — Missing Authentication

---

#### [HIGH] VULN-01: PvP match state/end/action endpoints have no authentication

**Confidence:** 9/10  
**Location:** `server/routes.ts:2277, 2301, 2337`

**Description:**  
`PUT /api/pvp/match/:matchId/state`, `POST /api/pvp/match/:matchId/end`, and `POST /api/pvp/match/:matchId/action` accept mutations from any caller with no session or wallet verification.

**Exploit Scenario:**  
1. Attacker discovers a `matchId` (sequential timestamp-based ID, e.g. `match_1713400000000_abc123`)
2. Calls `POST /api/pvp/match/:matchId/end` with `{ "winnerWallet": "<attacker_wallet>" }`
3. Server calls `recordGameResult(winner, true)` and `recordGameResult(loser, false)` — fraudulent win recorded
4. Repeat to farm ranked rating

**Remediation:**  
Add `walletAuth` to all three endpoints and validate that `req.walletAddress` is one of the two players in the match.

---

#### [HIGH] VULN-02: `PUT /api/player/tutorial-progress` has no authentication

**Confidence:** 8/10  
**Location:** `server/routes.ts:393`

**Description:**  
`walletAddress` is read from `req.body` with no session verification. Any caller can write tutorial progress for any wallet.

**Exploit Scenario:**  
An attacker can mark tutorial as complete for any wallet or reset `tutorialCompletedSteps` to `[]`, corrupting progression data.

**Remediation:**  
Add `walletAuth` middleware. Remove `walletAddress` from body; derive it from `req.walletAddress`.

---

#### [HIGH] VULN-03: `POST /api/pvp/join` accepts wallet from body with no session check

**Confidence:** 8/10  
**Location:** `server/routes.ts:2208`

**Description:**  
A player can join a match claiming to be any wallet address. There is no session ownership check.

**Exploit Scenario:**  
Attacker joins a match using `{ "walletAddress": "<victim_wallet>", ... }`, impersonating another player.

**Remediation:**  
Add session auth. Derive `walletAddress` from session, not body.

---

### 🟡 MEDIUM — Missing Authentication or Information Disclosure

---

#### [MEDIUM] VULN-04: `POST /api/purchases/claim-starter-deck` accepts wallet from body

**Confidence:** 8/10  
**Location:** `server/routes.ts:1360`

**Description:**  
`walletAddress` comes from `req.body` with no session check. Anyone can claim a starter deck on behalf of any wallet (provided that wallet hasn't already claimed one).

**Remediation:**  
Add session auth. Derive wallet from `req.walletAddress`.

---

#### [MEDIUM] VULN-05: `POST /api/player/session/start` and `POST /api/player/session/end` have no authentication

**Confidence:** 8/10  
**Location:** `server/routes.ts:2005, 2031`

**Description:**  
`walletAddress` is taken from the request body. Attackers can manipulate `totalUptime` and `sessionStart` values for any wallet.

**Remediation:**  
Add `walletAuth`. Derive wallet from session.

---

#### [MEDIUM] VULN-06: `POST /api/player/connect` has no auth — associates any wallet with caller's session

**Confidence:** 8/10  
**Location:** `server/routes.ts:1940`

**Description:**  
Any caller can supply any wallet address and have it associated with their session. This is by design for wallet login, but there is no signature challenge — the server trusts the supplied address without proof of ownership. An attacker can claim ownership of any known wallet address.

**Remediation:**  
Require a signature challenge (SIWS) before associating a wallet with a session, similar to the Seeker verification flow already implemented.

---

#### [MEDIUM] VULN-07: Analytics endpoints expose purchase history and player data without auth

**Confidence:** 8/10  
**Location:** `server/routes.ts:1842, 1869`

**Description:**  
`GET /api/analytics/purchases?walletAddress=<addr>` and `GET /api/analytics/player/:walletAddress` return detailed purchase history, game stats, location data, and session info for any wallet with no authentication.

**Remediation:**  
Require session auth and enforce that `req.walletAddress === params.walletAddress` (or add an admin role).

---

#### [MEDIUM] VULN-08: `POST /api/pvp/match/:matchId/cancel` trusts wallet from body

**Confidence:** 8/10  
**Location:** `server/routes.ts:2420`

**Description:**  
The "only the host can cancel" check reads `walletAddress` from `req.body` — an attacker can spoof as the host of any waiting match.

**Remediation:**  
Add session auth. Compare `req.walletAddress` (from session) against `match.player1Wallet`.

---

### 🔵 LOW / INFO

---

#### [LOW] VULN-09: `GET /api/health` exposes operational internals

**Confidence:** 8/10  
**Location:** `server/routes.ts:121`

**Description:**  
The health endpoint returns real-time session counts, active client counts, and security feature flags — useful for an attacker profiling the server.

**Remediation:**  
Return only `{ status: "healthy", timestamp }` in production. Gate detailed stats behind admin auth.

---

#### [LOW] VULN-10: `GET /api/card-modifications` available in production with no auth

**Confidence:** 8/10  
**Location:** `server/routes.ts:2066`

**Description:**  
Reads and returns `card-modifications-export.json` from the working directory with no authentication. This is a dev artifact that should be blocked in production like the sibling `POST /api/save-modifications`.

**Remediation:**  
Add `if (process.env.NODE_ENV === 'production') return res.status(404)...` guard.

---

#### [INFO] In-memory session store is not restart-safe

**Location:** `server/middleware/sessionSecurity.ts`

**Description:**  
Sessions are stored in a `Map<string, SessionData>`. All sessions are lost on server restart, logging out all users. Also does not scale across multiple processes.

**Recommendation:**  
Use Redis or PostgreSQL for session persistence if uptime/multi-instance deployment is required.

---

#### [INFO] Rate limiter identifier includes attacker-controlled `User-Agent`

**Location:** `server/middleware/rateLimiter.ts:88`

**Description:**  
`getClientIdentifier` appends `User-Agent` to the IP. Attackers can bypass rate limits by rotating `User-Agent` headers from the same IP.

**Recommendation:**  
Use IP address alone as the rate limit key, or add a secondary per-session limit.

---

### Confidence Calibration

| Severity | Count | Avg Confidence |
|---|---|---|
| HIGH | 3 | 8.7/10 |
| MEDIUM | 5 | 8/10 |
| LOW | 2 | 8/10 |
| INFO | 2 | — |
| **Total** | **12** | |
| False positives filtered | ~5 | (test creds, dev guards, PDA patterns) |
| Mode | Daily (8/10 gate) | |

---

### Remediation Roadmap

**P0 — Fix immediately**
- [ ] VULN-01: Add `walletAuth` to `pvp/match/:id/state`, `pvp/match/:id/end`, `pvp/match/:id/action`
- [ ] VULN-03: Add session auth to `POST /api/pvp/join`

**P1 — Fix this sprint**
- [ ] VULN-02: Add `walletAuth` to `PUT /api/player/tutorial-progress`
- [ ] VULN-04: Add session auth to `POST /api/purchases/claim-starter-deck`
- [ ] VULN-06: Add SIWS challenge to `POST /api/player/connect` or document accepted risk
- [ ] VULN-07: Add auth to analytics endpoints
- [ ] VULN-08: Fix `POST /api/pvp/match/:id/cancel` to use session wallet

**P2 — Fix this month**
- [ ] VULN-05: Add auth to session start/end endpoints
- [ ] VULN-09: Gate health details in production
- [ ] VULN-10: Block `GET /api/card-modifications` in production

**P3 — Backlog**
- [ ] Migrate session store to Redis/DB for restart safety
- [ ] Harden rate limiter key to IP-only
- [ ] Remove or implement `GET /api/analytics/players` stub
- [ ] Remove `POST /api/validate-input` if unused
- [ ] Evaluate whether PvP REST endpoints should be removed in favour of WebSocket-only
