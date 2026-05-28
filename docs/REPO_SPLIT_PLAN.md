# Repo Split Plan — `spektrum-client` + `spektrum-server`

Split current monorepo (`spektrum-v2`) into two repos under future GitHub org. Keep git history. Minimize runtime coupling. Communicate via HTTP + socket.io only.

---

## 1. Current State (snapshot)

- Single repo. Next.js 16 (`src/`) + Express 4 + socket.io (`server/`). Shared `package.json`.
- Two run modes: dev = 2 processes (`npm run app` → Next 3000 + Express 3001, proxied via `next.config.ts` rewrites). prod = `server/unified.ts` (one HTTP server, Next + Express + socket.io).
- Drizzle ORM schema at `server/schema.ts`. Postgres (Neon). Migrations in `migrations/`.
- Anchor program in `programs/`, helper scripts in `scripts/`.
- Auth: Clerk (`@clerk/nextjs` client, `@clerk/express` server).

**Cross-boundary imports** (only coupling):

```
server/gameEngine/ServerGameState.ts → ../../src/domain/game/engine/gameEngine
                                     → ../../src/domain/game/types/{game,card}
```

No `src/` imports from `server/`. Good — one-way dep only.

---

## 2. Target Topology

```
spektrum-client/        (Next.js app, deploy: Vercel / static)
spektrum-server/        (Express + socket.io, deploy: Fly / Railway / Cloud Run)
spektrum-shared/        (game engine + shared types) — option A: npm pkg, option B: git submodule
spektrum-contracts/     (optional split of programs/) — defer
```

Recommend **option A (npm package)**. Publish `@spektrum/shared` to GitHub Packages (private). Cleaner versioning. Submodules cause CI pain.

Three repos minimum to start: `client`, `server`, `shared`. Contracts stays in server repo or its own — defer decision.

---

## 3. What Goes Where

### `spektrum-shared` (new package `@spektrum/shared`)
- `src/domain/game/engine/**` → `engine/`
- `src/domain/game/types/**` → `types/`
- Card data constants if pure (no React/Next imports)
- `package.json` exports both ESM types + JS. `tsup` or plain `tsc` build.
- Zero runtime deps if possible. No React. No Next. No Express.

### `spektrum-client`
- `src/app/**`, `src/components/**`, `src/features/**`, `src/stores/**`, `src/services/**`, `src/lib/**`, `src/data/**` (non-shared)
- `public/`, `next.config.ts`, `proxy.ts` (Clerk middleware), `components.json`, `postcss.config.mjs`, `eslint.config.mjs`, `tsconfig.json`
- `docs/` UI-related
- Drops: `server/`, `migrations/`, `drizzle.config.ts`, `programs/`, `Anchor.toml`, `scripts/import*`, `cards-details.csv` (move to server if it seeds DB)
- Add dep: `@spektrum/shared`

### `spektrum-server`
- `server/**` (all)
- `migrations/`, `drizzle.config.ts`, `server/schema.ts`
- `scripts/importCardsToDatabase.ts`, `scripts/initializeCardPool.ts`, `cards-details.csv`
- `programs/`, `Anchor.toml` (or split later)
- Drops: anything Next-specific. Delete `server/unified.ts` (Next no longer in this repo). Delete `server/vite.ts` if it imports Next.
- Add dep: `@spektrum/shared`

---

## 4. Pre-Split Cleanup (do in current repo first)

Goal: reduce coupling before split so each new repo lands clean.

1. **Carve `src/domain/game/` into a workspace package** while still monorepo.
   - Convert root to npm workspaces. Add `packages/shared/` with `engine/` + `types/` moved in.
   - Update both `src/` and `server/` to import from `@spektrum/shared` instead of relative paths.
   - Verify: `npm run app`, `npm test`, `npm run build` all green.
2. **Kill `server/unified.ts`** path or fence it behind `if (process.env.UNIFIED)`. Split repos won't use it.
3. **Document API surface**. `src/docs/SERVER_API.md` already exists — audit it matches reality. This becomes the contract between repos.
4. **Lock socket.io event shape**. Define types in `@spektrum/shared/socket-events.ts`. Both sides import.
5. **Audit env vars**. List in `.env.example` per future repo. Currently mixed in one `.env`.
6. **Fix P0 auth gaps first** (PvP endpoints zero-auth per memory). Splitting an insecure server makes audit harder later.

---

## 5. Split Execution (per repo)

Use `git filter-repo` (not `filter-branch`) to preserve history.

### 5a. `spektrum-shared`
```bash
git clone spektrum-v2 spektrum-shared
cd spektrum-shared
git filter-repo --path packages/shared/ --path-rename packages/shared/:
# add package.json, tsconfig, build script
# publish v0.1.0 to GitHub Packages
```

### 5b. `spektrum-server`
```bash
git clone spektrum-v2 spektrum-server
cd spektrum-server
git filter-repo \
  --path server/ \
  --path migrations/ \
  --path drizzle.config.ts \
  --path scripts/ \
  --path programs/ \
  --path Anchor.toml \
  --path cards-details.csv
# move server/* to repo root (or keep server/ prefix)
# new package.json — only server deps
# add @spektrum/shared as dep
# Dockerfile, fly.toml / railway.json
```

### 5c. `spektrum-client`
```bash
git clone spektrum-v2 spektrum-client
cd spektrum-client
git filter-repo \
  --path src/ \
  --path public/ \
  --path next.config.ts \
  --path proxy.ts \
  --path components.json \
  --path postcss.config.mjs \
  --path eslint.config.mjs \
  --path tsconfig.json \
  --path docs/
# remove src/domain/game/ remnants (now in shared)
# new package.json — client deps only
# add @spektrum/shared as dep
# rewrites in next.config.ts → point to NEXT_PUBLIC_API_URL
```

Order: shared first (publish), server second, client last. Each consumes the prior.

---

## 6. Runtime Wiring After Split

### Dev
- Server: `npm run dev` on `:3001`. CORS allowlist `http://localhost:3000`.
- Client: `npm run dev` on `:3000`. `next.config.ts` rewrites `/api/*` → `http://localhost:3001/api/*`.
- Socket.io: client connects to `NEXT_PUBLIC_API_URL`. Server CORS allows client origin.

### Prod
- Server: own host, public URL. Clerk JWT verification on every `/api/*` + on socket connection.
- Client: Vercel. Env `NEXT_PUBLIC_API_URL=https://api.spektrum.gg`. Same-site cookies break across origins → use Clerk session token in `Authorization` header (already supported by `@clerk/express`).
- Drop the Next rewrite proxy in prod (CORS direct).

### Breaking changes vs current
- Cookie auth via subdomain (set Clerk `cookieDomain`) OR header-only auth. Pick one early.
- `unified.ts` deployment mode gone. Update Replit/Cloud Run target docs.
- Static assets under `/attached_assets/*` (served by Express today) — decide: move to client `public/` or keep server-served.

---

## 7. CI/CD

Each repo gets its own pipeline:

- `spektrum-shared`: build + publish on tag push (`v*`) to GitHub Packages.
- `spektrum-server`: lint, vitest, `tsc --noEmit`, Docker build, deploy on `main`.
- `spektrum-client`: lint, vitest, `next build`, deploy to Vercel on `main`.

Renovate or Dependabot to bump `@spektrum/shared` in client + server.

---

## 8. Risks / Open Questions

| Risk | Mitigation |
|---|---|
| Shared engine churn → version drift between client/server | Semver discipline on `@spektrum/shared`. Both pin same version. Add CI check. |
| Clerk cross-origin session | Decide cookie subdomain vs header auth before split. |
| Socket.io event drift | Type-only export from shared (`ClientToServerEvents`, `ServerToClientEvents`). Compile-time check. |
| History bloat from filter-repo | Acceptable. `git filter-repo` keeps only relevant paths' history. |
| Anchor program coupling | Keep in server repo for now. Split later if SDK consumers emerge. |
| `cards-details.csv` truth source | Move with server (DB seed). Client reads via API. |
| `programs/` IDL needed in client? | If yes, generate types into `@spektrum/shared` during build. |
| Old `src/docs/` paths break | Move docs to whichever repo owns the subject. |

---

## 9. Milestones

- **M0** (1–2 days): Pre-split cleanup steps 1–4 in §4. Land in current repo. Tag `pre-split`.
- **M1** (1 day): Carve `spektrum-shared`, publish v0.1.0.
- **M2** (1–2 days): Spin `spektrum-server`. Deploy to staging URL. Verify socket + DB work.
- **M3** (1–2 days): Spin `spektrum-client`. Point at staging server. Verify full game flow.
- **M4**: Cut DNS, deploy prod. Archive monorepo (read-only) with pointer README.
- **M5** (optional): Split `programs/` into `spektrum-contracts`.

---

## 10. Do Not Do

- Do **not** copy-paste files between repos manually — lose history.
- Do **not** vendored-copy game engine into both repos — drift guaranteed.
- Do **not** split before P0 auth fixes land (PvP endpoints).
- Do **not** delete monorepo until both new repos have run in prod for ≥1 week.
