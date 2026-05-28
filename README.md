# spektrum-client

Next.js 16 frontend for [Spektrum TCG](https://github.com/<org-tbd>).

Carved from `spektrum-v2` monorepo at tag `pre-split`. Consumes `@spektrum/shared` via local file dependency. Talks to `spektrum-server` on `:3001`.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind 4 + shadcn
- Clerk auth (`@clerk/nextjs`)
- socket.io-client (real-time PvP)
- Vitest

## Setup

Layout expected:
```
/Users/theo/Documents/PROJECT/spektrum/
├── spektrum-shared/
├── spektrum-server/
└── spektrum-client/      ← you are here
```

1. Install:
   ```
   npm install
   ```
2. Copy `.env.example` → `.env.local` and fill in:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_API_URL=http://localhost:3001`
   - `API_URL=http://localhost:3001`
3. Boot `spektrum-server` in a separate terminal.
4. Start:
   ```
   npm run dev
   ```

App on `:3000`.

## API contract

The HTTP + socket.io contract this client consumes lives in `spektrum-server`. See its `src/docs/SERVER_API.md` (or the typed socket events in `@spektrum/shared/socket-events`).

## Carved from

`spektrum-v2` monorepo, tag `pre-split`.
