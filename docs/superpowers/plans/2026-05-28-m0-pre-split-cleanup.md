# M0 — Pre-Split Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce client/server coupling inside the existing monorepo so the future split into `spektrum-client` / `spektrum-server` / `spektrum-shared` is a mechanical `git filter-repo` operation, not a refactor.

**Architecture:** Convert root to npm workspaces. Move the shared game engine + types into `packages/shared/` as the npm package `@spektrum/shared`. Both `src/` (Next.js) and `server/` (Express) consume the workspace package via the package name instead of relative paths or `@/domain/game/*` aliases. Add a typed socket.io event contract in shared so client and server cannot drift. Fence the obsolete unified-server path. Document env vars per future repo. Audit the HTTP API doc against reality.

**Tech Stack:** Next.js 16, React 19, Express 4, socket.io 4, Drizzle ORM, Vitest 4, npm workspaces, TypeScript 5.

**Source spec:** `docs/REPO_SPLIT_PLAN.md` §4 (M0 milestone).

**Scope guard:** This plan touches only files needed to carve the shared package, type sockets, fence unified mode, and document env/API. It does **not** split the repo (M1–M3) and does **not** fix the open P0 PvP auth gaps (separate security work; flagged in §Risks of source plan).

---

## File Structure

### New
- `packages/shared/package.json` — workspace package manifest (`@spektrum/shared`).
- `packages/shared/tsconfig.json` — package TS config.
- `packages/shared/src/index.ts` — barrel re-export of engine + types + sockets.
- `packages/shared/src/socket-events.ts` — typed socket.io contract (`ClientToServerEvents`, `ServerToClientEvents`, `SocketData`).
- `packages/shared/.gitignore` — ignore `dist/`, `*.tsbuildinfo`.
- `.env.example.client` — vars consumed by Next.js after split.
- `.env.example.server` — vars consumed by Express after split.

### Moved (preserve git history with `git mv`)
- `src/domain/game/engine/**` → `packages/shared/src/engine/**`
- `src/domain/game/types/**` → `packages/shared/src/types/**`
- `src/domain/game/ai/**` → `packages/shared/src/ai/**`
- `src/domain/game/data/**` → `packages/shared/src/data/**`
- `src/domain/game/__tests__/**` → `packages/shared/src/__tests__/**`

### Modified
- `package.json` — add `workspaces`, hoist root scripts that delegate.
- `tsconfig.json` — add path mapping `"@spektrum/shared": ["./packages/shared/src"]`, drop `@/domain/game/*` references (now resolves through shared).
- `vitest.config.ts` — add alias for `@spektrum/shared` pointing at `packages/shared/src`.
- ~31 files under `src/` importing `@/domain/game/*` → import `@spektrum/shared` (subpath imports allowed via package `exports`).
- `server/gameEngine/ServerGameState.ts` — replace 3 relative imports (`../../src/domain/game/...`) with `@spektrum/shared`.
- `server/services/anteWebSocket.ts`, `server/services/multiplayerWebSocket.ts` — type socket.io `Server` with shared event maps.
- `src/services/anteMatchmaking.ts`, `src/services/multiplayerSocketBridge.ts`, `src/stores/useMultiplayerStore.ts` — type socket.io-client `Socket` with shared event maps.
- `server/unified.ts` — gate behind `process.env.UNIFIED === "1"`, log deprecation on startup.
- `src/docs/SERVER_API.md` — audit pass; add any missing routes / mark stale ones.

### Untouched
- `programs/`, `Anchor.toml`, `migrations/`, `drizzle.config.ts`, `scripts/`, `public/`, `proxy.ts`, Next config, `cards-details.csv`, all UI components, Clerk wiring.

---

## Task 1: Create empty workspace package skeleton

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/.gitignore`
- Create: `packages/shared/src/index.ts`
- Modify: `package.json` (add `workspaces` field)

- [ ] **Step 1: Create `packages/shared/package.json`**

```json
{
  "name": "@spektrum/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./engine": "./src/engine/index.ts",
    "./types": "./src/types/index.ts",
    "./ai": "./src/ai/index.ts",
    "./data": "./src/data/index.ts",
    "./socket-events": "./src/socket-events.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5"
  }
}
```

Note: source-only package (no build step). Next + tsx + vitest all consume TS directly. Avoids a build phase during M0; if a later milestone needs publishing, add `tsup` then.

- [ ] **Step 2: Create `packages/shared/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "composite": false,
    "noEmit": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/__tests__/**"]
}
```

- [ ] **Step 3: Create `packages/shared/.gitignore`**

```
dist/
*.tsbuildinfo
```

- [ ] **Step 4: Create `packages/shared/src/index.ts` placeholder**

```ts
export {};
```

Empty for now — Task 2 fills it after files move.

- [ ] **Step 5: Add `workspaces` to root `package.json`**

Edit `/Users/theo/Documents/PROJECT/spektrum-v2/package.json`. Insert immediately after the `"private": true,` line:

```json
  "workspaces": [
    "packages/*"
  ],
```

- [ ] **Step 6: Run `npm install` to wire the workspace symlink**

Run: `npm install`
Expected: completes without error. After completion `node_modules/@spektrum/shared` exists as a symlink to `packages/shared`.

Verify: `ls -la node_modules/@spektrum/shared`
Expected: symlink → `../../packages/shared`.

- [ ] **Step 7: Commit**

```bash
git add packages/shared/ package.json package-lock.json
git commit -m "chore: scaffold @spektrum/shared workspace package"
```

---

## Task 2: Move game engine + types + ai + data into shared

Pure code move. No behavior change. Use `git mv` so history follows.

**Files:**
- Move: `src/domain/game/engine/` → `packages/shared/src/engine/`
- Move: `src/domain/game/types/` → `packages/shared/src/types/`
- Move: `src/domain/game/ai/` → `packages/shared/src/ai/`
- Move: `src/domain/game/data/` → `packages/shared/src/data/`
- Move: `src/domain/game/__tests__/` → `packages/shared/src/__tests__/`
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Move the four source dirs with `git mv`**

```bash
cd /Users/theo/Documents/PROJECT/spektrum-v2
git mv src/domain/game/engine packages/shared/src/engine
git mv src/domain/game/types packages/shared/src/types
git mv src/domain/game/ai packages/shared/src/ai
git mv src/domain/game/data packages/shared/src/data
git mv src/domain/game/__tests__ packages/shared/src/__tests__
```

- [ ] **Step 2: Verify the now-empty `src/domain/game/` is gone**

Run: `ls src/domain/`
Expected: directory `game` is empty (or already removed). If empty, remove it:

```bash
rmdir src/domain/game src/domain 2>/dev/null || true
```

- [ ] **Step 3: Rewrite `packages/shared/src/index.ts` as a barrel**

```ts
export * from "./engine";
export * from "./types";
export * from "./ai";
export * from "./data";
export * from "./socket-events";
```

(socket-events file is added in Task 5; the export will resolve once Task 5 lands. If you intend to run tests between Tasks 2 and 5, comment out that single line and uncomment in Task 5.)

- [ ] **Step 4: Check intra-package imports still work**

Files inside `packages/shared/src/engine/` and `packages/shared/src/ai/` previously imported sibling files via relative paths like `../types/game`. Those still work since they moved together. Spot-check one:

Run: `grep -rEn "from ['\"]\\.\\./" packages/shared/src/engine | head`
Expected: relative imports like `../types/game`, `../data/cardRegistry`. All targets exist under the new tree.

If any import points outside `packages/shared/src/` (e.g. `from "@/...`), it must be inlined or made into a parameter — shared cannot depend on the client. Search for offenders:

```bash
grep -rEn "from ['\"]@/" packages/shared/src
```

Expected: zero results. If non-zero, **stop**: those files have a hidden coupling that must be resolved before the package can stand alone. Document the offender and resolve before continuing.

- [ ] **Step 5: Do not run tests yet**

Tests will still pass moves but the import-rewrite tasks (3, 4) come next; running now reports false breakage from the 31 unresolved imports under `src/`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: move domain/game into @spektrum/shared (no behavior change)"
```

---

## Task 3: Rewrite client imports to use `@spektrum/shared`

31 files under `src/` import `@/domain/game/...`. Rewrite them all to import the package by name.

**Files:**
- Modify: every file matching `grep -lE "from ['\"]@/domain/game" src -r`

- [ ] **Step 1: List affected files**

Run:
```bash
grep -rlE "from ['\"]@/domain/game" src
```

Expected: ~31 paths. Capture the list — every one must be updated.

- [ ] **Step 2: Map old import paths to new subpaths**

Rewrite rules (apply in order, **not** with a single global regex — order matters):

| From | To |
|---|---|
| `@/domain/game/engine/gameEngine` | `@spektrum/shared` |
| `@/domain/game/engine/<x>` | `@spektrum/shared` (if `<x>` is re-exported by `engine/index.ts`) or `@spektrum/shared/engine` |
| `@/domain/game/types` | `@spektrum/shared` |
| `@/domain/game/types/<x>` | `@spektrum/shared` (if `<x>` is re-exported by `types/index.ts`) |
| `@/domain/game/data/cards/<x>` | `@spektrum/shared/data` (named export from `data/index.ts`) |
| `@/domain/game/ai/<x>` | `@spektrum/shared` (if re-exported) or `@spektrum/shared/ai` |

Rule of thumb: prefer the package root (`@spektrum/shared`) for any symbol the barrel re-exports. Fall back to a subpath only if the original deep import bypassed the index (e.g. for a non-exported helper).

- [ ] **Step 3: Verify the engine, types, ai, data each have an `index.ts` barrel**

Run:
```bash
ls packages/shared/src/engine/index.ts packages/shared/src/types/index.ts packages/shared/src/ai/index.ts packages/shared/src/data/index.ts 2>&1
```

If any is missing, create it now. Example for engine if missing:

```ts
// packages/shared/src/engine/index.ts
export * from "./gameEngine";
export * from "./passiveSkillUtils";
export * from "./discardMechanicChecker";
export * from "./effectTargetResolver";
export * from "./getValidEvolutionTargets";
export * from "./effectConditionChecker";
export * from "./modifierUtils";
export * from "./destroyAvatar";
export * from "./fieldTriggerProcessor";
export * from "./skillTriggerChecker";
```

(Add only files actually present. Use `ls packages/shared/src/engine/*.ts` to enumerate.)

Same shape for `types/index.ts`, `ai/index.ts`, `data/index.ts`. If `types/index.ts` already exists from the move (it did — `src/domain/game/types/index.ts` was moved in Task 2), leave it.

- [ ] **Step 4: Apply the rewrites with `sed` per file**

For each file from Step 1, run the sed rules. Example for one file:

```bash
sed -i.bak -E \
  -e 's|from ([\x27"])@/domain/game/engine/gameEngine\1|from \1@spektrum/shared\1|g' \
  -e 's|from ([\x27"])@/domain/game/engine/([a-zA-Z]+)\1|from \1@spektrum/shared/engine\1|g' \
  -e 's|from ([\x27"])@/domain/game/types/?([a-zA-Z]*)\1|from \1@spektrum/shared\1|g' \
  -e 's|from ([\x27"])@/domain/game/data/cards/([a-zA-Z]+)\1|from \1@spektrum/shared/data\1|g' \
  -e 's|from ([\x27"])@/domain/game/ai/?([a-zA-Z]*)\1|from \1@spektrum/shared\1|g' \
  <file>
rm <file>.bak
```

Or, in one pass against the listed files:

```bash
files=$(grep -rlE "from ['\"]@/domain/game" src)
for f in $files; do
  sed -i.bak -E \
    -e 's|from ([\x27"])@/domain/game/engine/gameEngine\1|from \1@spektrum/shared\1|g' \
    -e 's|from ([\x27"])@/domain/game/engine/([a-zA-Z]+)\1|from \1@spektrum/shared/engine\1|g' \
    -e 's|from ([\x27"])@/domain/game/types/?([a-zA-Z]*)\1|from \1@spektrum/shared\1|g' \
    -e 's|from ([\x27"])@/domain/game/data/cards/([a-zA-Z]+)\1|from \1@spektrum/shared/data\1|g' \
    -e 's|from ([\x27"])@/domain/game/ai/?([a-zA-Z]*)\1|from \1@spektrum/shared\1|g' \
    "$f"
  rm "${f}.bak"
done
```

- [ ] **Step 5: Verify zero residual `@/domain/game` imports**

Run:
```bash
grep -rE "from ['\"]@/domain/game" src && echo "REMAINING - STOP" || echo "clean"
```
Expected: `clean`.

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors. Any unresolved `@spektrum/shared/...` subpath import = missing export. Add to the corresponding barrel.

- [ ] **Step 7: Run tests**

Run: `npm test`
Expected: all pre-existing tests pass (the moved `__tests__` now live under `packages/shared/src/__tests__/`; vitest discovers them via the root config since vitest globs the whole tree by default).

If vitest fails to find them, explicitly extend the include glob in `vitest.config.ts` — see Task 6 Step 2.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(client): import game engine via @spektrum/shared"
```

---

## Task 4: Rewrite server import to use `@spektrum/shared`

Single file. Three relative imports → one package import.

**Files:**
- Modify: `server/gameEngine/ServerGameState.ts:33-35`

- [ ] **Step 1: Read the current import block**

Run: `sed -n '30,40p' server/gameEngine/ServerGameState.ts`
Expected output includes:
```
} from '../../src/domain/game/engine/gameEngine';
import type { GameState, Player } from '../../src/domain/game/types/game';
import type { Card } from '../../src/domain/game/types/card';
```

- [ ] **Step 2: Apply the replacements**

In `server/gameEngine/ServerGameState.ts`:
- Replace `'../../src/domain/game/engine/gameEngine'` with `'@spektrum/shared'`.
- Replace `'../../src/domain/game/types/game'` with `'@spektrum/shared'`.
- Replace `'../../src/domain/game/types/card'` with `'@spektrum/shared'`.

If TypeScript flags duplicate `from '@spektrum/shared'` statements, merge them into one import block (named values from the first, `import type {...}` from the second/third).

- [ ] **Step 3: Verify no other `../../src/domain` references survive**

Run:
```bash
grep -rEn "src/domain|@/domain" server && echo "REMAINING - STOP" || echo "clean"
```
Expected: `clean`.

- [ ] **Step 4: Typecheck server tsx-style**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 5: Boot both processes and smoke-test**

Run: `npm run app`
Expected: Next dev server on `:3000`, Express on `:3001`, no import errors on either side.

Open `http://localhost:3000` → home page loads. Open the multiplayer page → socket connects (check browser console: no 404 on `/socket.io`). Kill with Ctrl-C.

- [ ] **Step 6: Commit**

```bash
git add server/gameEngine/ServerGameState.ts
git commit -m "refactor(server): import game engine via @spektrum/shared"
```

---

## Task 5: Define the typed socket.io event contract

Both client and server speak socket.io ad-hoc today (untyped event strings). Lock the contract in shared so a future drift between repos is a compile error, not a runtime one.

**Files:**
- Create: `packages/shared/src/socket-events.ts`
- Modify: `packages/shared/src/index.ts` (uncomment socket-events re-export from Task 2 Step 3)
- Modify: `server/services/anteWebSocket.ts`
- Modify: `server/services/multiplayerWebSocket.ts`
- Modify: `src/services/anteMatchmaking.ts`
- Modify: `src/services/multiplayerSocketBridge.ts`
- Modify: `src/stores/useMultiplayerStore.ts`

- [ ] **Step 1: Enumerate every emit/on in server + client socket files**

Run:
```bash
grep -nE "(socket|io|this\.io)\.(emit|on|to|in)\(" server/services/anteWebSocket.ts server/services/multiplayerWebSocket.ts server/services/gameActionHandler.ts src/services/anteMatchmaking.ts src/services/multiplayerSocketBridge.ts src/stores/useMultiplayerStore.ts
```

Capture every unique event name and its payload type. This produces two sets: server→client events, client→server events.

- [ ] **Step 2: Write the contract**

Create `packages/shared/src/socket-events.ts`. Template (fill from Step 1 enumeration — every event captured must appear):

```ts
// Generated from current socket usage. Single source of truth for
// client/server socket contracts. Add events here first, then wire them.

import type { GameState } from "./types/game";

export interface ServerToClientEvents {
  // Example — replace with actual events from Step 1.
  // "match:found": (payload: { matchId: string; opponentId: string }) => void;
  // "game:state": (state: GameState) => void;
  // "error": (payload: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  // "match:join-queue": (payload: { mode: "ante" | "pvp" }) => void;
  // "game:action": (payload: { matchId: string; action: unknown }, ack: (ok: boolean) => void) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId: string;
  matchId?: string;
}
```

Then **populate** the two empty interfaces from Step 1. Each event name must appear in exactly one direction with its real payload type. Acks: model as the last callback parameter. Where a payload type already exists in `@spektrum/shared`, import and reuse — do not redeclare.

- [ ] **Step 3: Restore the barrel export**

Edit `packages/shared/src/index.ts`. Ensure this line is present (uncomment if commented in Task 2):

```ts
export * from "./socket-events";
```

- [ ] **Step 4: Type the server socket.io instances**

In `server/services/anteWebSocket.ts` and `server/services/multiplayerWebSocket.ts`, change the `Server` import and instantiation:

```ts
import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "@spektrum/shared";

// where the Server is constructed:
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, { /* existing options */ });
```

Read each file first; the existing `new Server(...)` call is the only line that changes (plus the import). Do not alter middleware, namespaces, CORS config, or any handler bodies.

- [ ] **Step 5: Type the client socket instances**

In `src/services/anteMatchmaking.ts`, `src/services/multiplayerSocketBridge.ts`, `src/stores/useMultiplayerStore.ts`:

```ts
import { io, type Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@spektrum/shared";

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
// Use AppSocket wherever Socket was previously used.
```

The order on the client side is reversed (`ServerToClientEvents` first, then `ClientToServerEvents`) — this is socket.io-client's signature, not a typo.

- [ ] **Step 6: Typecheck — this surfaces every mismatched event name or payload**

Run: `npx tsc --noEmit`
Expected: zero errors. If errors appear, they are real bugs (a server emits an event the client doesn't handle, or a payload disagrees). Fix the contract (`socket-events.ts`) to match the truth on both sides, **not** the call sites — the contract documents reality.

- [ ] **Step 7: Run tests**

Run: `npm test`
Expected: all pass. Pay special attention to `src/services/__tests__/multiplayerSocketBridge.test.ts` (mentioned in recon) — it consumes socket types.

- [ ] **Step 8: Smoke test a multiplayer flow**

Run: `npm run app`. In two browser windows, open the multiplayer matchmaking page. Verify the queue → match-found → game-start sequence still works end-to-end. Kill with Ctrl-C.

- [ ] **Step 9: Commit**

```bash
git add packages/shared/src/socket-events.ts packages/shared/src/index.ts server/services/anteWebSocket.ts server/services/multiplayerWebSocket.ts src/services/anteMatchmaking.ts src/services/multiplayerSocketBridge.ts src/stores/useMultiplayerStore.ts
git commit -m "feat(shared): typed socket.io contract in @spektrum/shared"
```

---

## Task 6: Update vitest + tsconfig to resolve the workspace package

Both `tsc` and `vitest` need to know how to resolve `@spektrum/shared` without going through `node_modules` symlink magic (which can drift across tools).

**Files:**
- Modify: `tsconfig.json`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Add path mapping to root `tsconfig.json`**

In `tsconfig.json`, replace:
```json
    "paths": {
      "@/*": ["./src/*"]
    },
```
with:
```json
    "paths": {
      "@/*": ["./src/*"],
      "@spektrum/shared": ["./packages/shared/src/index.ts"],
      "@spektrum/shared/*": ["./packages/shared/src/*"]
    },
```

Also append `"packages/shared/src/**/*.ts"` to the `include` array so the engine sources are part of the program (they are anyway via the workspace, but being explicit avoids tooling differences).

- [ ] **Step 2: Add alias to `vitest.config.ts`**

Replace the `alias` block with:
```ts
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@spektrum/shared': path.resolve(__dirname, './packages/shared/src'),
    },
  },
```

If tests under `packages/shared/src/__tests__/` are not auto-discovered, also add:
```ts
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.{test,spec}.{ts,tsx}'],
  },
```
(The default already globs `**/*` so this is only needed if discovery breaks.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: all pass, including the moved tests under `packages/shared/src/__tests__/`.

- [ ] **Step 5: Run Next build**

Run: `npm run build`
Expected: build succeeds. If Next complains about `@spektrum/shared` resolution, add to `next.config.ts`:

```ts
transpilePackages: ["@spektrum/shared"],
```

inside the `nextConfig` object. Then re-run `npm run build` — expected to pass.

- [ ] **Step 6: Commit**

```bash
git add tsconfig.json vitest.config.ts next.config.ts 2>/dev/null
git commit -m "build: wire @spektrum/shared into tsc, vitest, next"
```

---

## Task 7: Fence `server/unified.ts` behind an opt-in flag

After the split, `unified.ts` (Next + Express in one process) is dead. Until then it stays runnable for any current deploy target, but it must not be the default.

**Files:**
- Modify: `server/unified.ts`
- Modify: `package.json` (`start:unified` script noop guard)

- [ ] **Step 1: Read the current top of `server/unified.ts`**

Run: `sed -n '1,30p' server/unified.ts`

- [ ] **Step 2: Add the gate at the top of the `main()` body**

Inside `server/unified.ts`, immediately after `async function main() {` (around the existing first line of the function body), insert:

```ts
  if (process.env.UNIFIED !== "1") {
    logger.error(
      "unified.ts is deprecated. Set UNIFIED=1 to opt in. See docs/REPO_SPLIT_PLAN.md §4.2."
    );
    process.exit(2);
  }
```

This makes accidental invocation fail loudly without removing the file.

- [ ] **Step 3: Make the `start:unified` script self-describing**

In root `package.json`, update the `start:unified` script:

```json
    "start:unified": "UNIFIED=1 node --env-file-if-exists=.env --import tsx/esm server/unified.ts",
```

(Adds the env var so the deprecation gate passes when this script is explicitly used.)

- [ ] **Step 4: Verify default `server` script is unaffected**

Run: `npm run server`
Expected: standalone Express boots on `:3001`. No deprecation warning. Kill with Ctrl-C.

- [ ] **Step 5: Verify unified gate triggers without the flag**

Run: `node --import tsx/esm server/unified.ts`
Expected: process exits with code 2 and the deprecation message above. Confirms the gate.

- [ ] **Step 6: Verify unified still boots with the flag**

Run: `UNIFIED=1 npm run start:unified`
Expected: unified server starts (Next + Express bind to `:3000`). Kill with Ctrl-C.

- [ ] **Step 7: Commit**

```bash
git add server/unified.ts package.json
git commit -m "chore(server): deprecate unified.ts behind UNIFIED=1 flag"
```

---

## Task 8: Split env vars into per-future-repo example files

Single `.env` today mixes client (`NEXT_PUBLIC_*`, Clerk publishable key) and server (Clerk secret, DB url, Solana keys) values. Future client repo has no business knowing the server's `.env` shape, and vice versa.

**Files:**
- Create: `.env.example.client`
- Create: `.env.example.server`

- [ ] **Step 1: Enumerate every env var actually referenced**

Run:
```bash
grep -rE "process\.env\.[A-Z0-9_]+" server packages/shared/src 2>/dev/null | grep -oE "process\.env\.[A-Z0-9_]+" | sort -u
```
Captures server-side vars. Then:
```bash
grep -rE "process\.env\.[A-Z0-9_]+" src 2>/dev/null | grep -oE "process\.env\.[A-Z0-9_]+" | sort -u
```
Captures client-side vars. A `NEXT_PUBLIC_*` var seen in `server/` is wrong (would not be embedded in the server build); flag it.

- [ ] **Step 2: Write `.env.example.client`**

Include only the vars consumed by client code (from Step 1's second list) plus any `NEXT_PUBLIC_*` referenced. Group with comments. Use placeholder values — never paste real secrets:

```
# Public — embedded in the browser bundle
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_REPLACE_ME
# add others from Step 1
```

- [ ] **Step 3: Write `.env.example.server`**

```
# Private — server-only
DATABASE_URL=postgres://REPLACE_ME
CLERK_SECRET_KEY=sk_test_REPLACE_ME
CLERK_PUBLISHABLE_KEY=pk_test_REPLACE_ME
API_PORT=3001
# Solana / Anchor wallet — see programs/
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
# add others from Step 1
```

- [ ] **Step 4: Confirm no overlap of *secret* vars**

A var with `SECRET`, `PRIVATE_KEY`, or `_KEY` (without `NEXT_PUBLIC_` prefix) must appear **only** in `.env.example.server`. Grep both files; if any secret leaks into the client example, fix it.

- [ ] **Step 5: Commit**

```bash
git add .env.example.client .env.example.server
git commit -m "docs: split .env.example into client/server pairs for repo split"
```

---

## Task 9: Audit `src/docs/SERVER_API.md` against actual routes

The HTTP API doc becomes the inter-repo contract. Drift is silent today. Audit and patch.

**Files:**
- Modify: `src/docs/SERVER_API.md`

- [ ] **Step 1: Enumerate registered routes**

Run:
```bash
grep -rnE "app\.(get|post|put|patch|delete)\(['\"]|router\.(get|post|put|patch|delete)\(['\"]" server | sed -E "s/.*\.(get|post|put|patch|delete)\(['\"]([^'\"]+).*/\1 \2/I" | sort -u
```

Produces a list like `get /api/cards`, `post /api/match/start`, etc.

- [ ] **Step 2: Diff against `SERVER_API.md`**

Open `src/docs/SERVER_API.md`. For each route from Step 1, find the matching documented section. For each documented route, find the matching real route.

Three buckets:
1. **Documented + real** → leave alone.
2. **Documented but not real** → mark `**STALE — removed**` or delete.
3. **Real but undocumented** → add a stub: method, path, auth requirement (Clerk JWT? open?), request body shape, response shape, status codes.

For undocumented PvP routes, **flag auth status explicitly**. The memory file notes 12 open vulns including zero-auth PvP — document the current (broken) reality, not the wished-for state, so a future fix is visible as a diff.

- [ ] **Step 3: Add a contract-stability header**

At the top of `src/docs/SERVER_API.md`, add:

```markdown
> **Contract status:** This document is the source of truth for the HTTP/socket
> contract between `spektrum-client` and `spektrum-server` after the split
> (see `docs/REPO_SPLIT_PLAN.md`). Any breaking change to a route shape
> requires a coordinated PR across both future repos.
```

- [ ] **Step 4: Commit**

```bash
git add src/docs/SERVER_API.md
git commit -m "docs(server): audit SERVER_API.md against real routes"
```

---

## Task 10: Run the full pre-flight matrix

One final pass with every tool before tagging.

- [ ] **Step 1: Clean install from scratch**

```bash
rm -rf node_modules packages/shared/node_modules .next
npm install
```
Expected: clean install, no peer-dep warnings about `@spektrum/shared`.

- [ ] **Step 2: Typecheck root + shared**

```bash
npx tsc --noEmit
npm --workspace @spektrum/shared run typecheck
```
Expected: both pass.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: passes. If new lint errors appear inside `packages/shared/`, decide: extend eslint config to cover the workspace, or add a per-package eslint config. M0 default: extend root config to glob `packages/**/*.ts`.

- [ ] **Step 4: Tests**

Run: `npm test`
Expected: all pass. Compare test count before and after M0 — should be equal (no tests deleted, none added beyond what was moved).

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: Next build succeeds.

- [ ] **Step 6: Manual smoke — two-process dev mode**

Run: `npm run app`
Walk through:
1. Home page loads at `:3000`.
2. Sign in via Clerk.
3. Open deck builder; cards render (proves `@spektrum/shared/data` works in client).
4. Start an AI match; play one turn (proves engine + ai imports work).
5. Open multiplayer; queue + match-found event arrives (proves typed socket).

Kill with Ctrl-C.

- [ ] **Step 7: Manual smoke — unified mode**

Run: `UNIFIED=1 npm run start:unified`
Verify the home page loads at `:3000` and `/api/health` (or any known route) responds. Kill with Ctrl-C.

- [ ] **Step 8: Tag the pre-split state**

```bash
git tag -a pre-split -m "M0 complete: workspace package + socket contracts + env split"
```

(Do **not** push the tag yet — push happens when the user is ready to start M1.)

- [ ] **Step 9: Final commit (if anything was tweaked during smoke)**

If Step 6 or 7 surfaced a config tweak, commit it now:

```bash
git add -A
git commit -m "chore: post-M0 smoke-test tweaks"
```

If nothing changed, skip this step.

---

## Done state

After Task 10:
- `packages/shared/` is a self-contained workspace package with engine, types, ai, data, and the socket event contract.
- `src/` and `server/` both import from `@spektrum/shared` — no relative paths cross the future repo boundary.
- `unified.ts` only runs with `UNIFIED=1`. Default scripts use the two-process layout that mirrors the post-split topology.
- `.env.example.client` and `.env.example.server` enumerate the env surface per future repo.
- `src/docs/SERVER_API.md` matches the real routes.
- Repo tagged `pre-split`.

The repo is now structurally ready for M1 (`spektrum-shared` carve via `git filter-repo --path packages/shared/`), M2 (`spektrum-server` carve), and M3 (`spektrum-client` carve), each of which becomes its own short plan once M0 lands.

---

## Out of scope (do not do in M0)

- Publishing `@spektrum/shared` to GitHub Packages — happens in M1.
- Any `git filter-repo` operation — happens in M1–M3.
- Fixing P0 PvP auth gaps — separate security plan; do **not** bundle.
- Splitting `programs/` into `spektrum-contracts` — deferred to M5.
- Migrating Clerk auth to header-only across origins — happens during M3 when the client gains a different origin from the server.
- Moving `attached_assets/` between repos — decide during M3.
