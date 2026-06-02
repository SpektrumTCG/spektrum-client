# Spektrum Client — Architecture

> Next.js 16 (App Router) · React 19 · Zustand · TanStack Query · Clerk · shadcn/Tailwind.
> Talks to `spektrum-server` via REST proxy + Socket.IO. Game rules from `@spektrum/shared`.

---

## 1. System Context

```mermaid
graph TB
    User["User (mobile-first)"]
    App["spektrum-client<br/>Next.js 16 · React 19"]
    Clerk["Clerk<br/>(auth + web3 wallet)"]
    Server["spektrum-server"]
    Shared["@spektrum/shared<br/>(engine · types · AI · cards)"]
    Solana["Solana (read NFT meta)"]

    User --> App
    App -- "useUser / JWT" --> Clerk
    App -- "fetch /api/* (rewrite)" --> Server
    App -- "Socket.IO" --> Server
    App -- "AI mode runs engine locally" --> Shared
    App -- "cardNftService (mock)" --> Solana
```

---

## 2. Layered Architecture

```mermaid
graph TB
    subgraph Routing["App Router (src/app)"]
        Root["layout.tsx<br/>ClerkProvider + Providers"]
        AuthGrp["(auth)/ — centered 480px<br/>/start"]
        MainGrp["(main)/ — nav + ViewTransition<br/>/home /cards /game /shop …"]
    end
    subgraph Features["Feature modules (src/features)"]
        F["game · cards · deck-builder · shop ·<br/>inventory · multiplayer · tutorial · …"]
    end
    subgraph State["Zustand stores (src/stores) — 13"]
        Wallet["useWalletStore"]
        Deck["useDeckStore"]
        Mp["useMultiplayerStore"]
        Other["useInventory · useUI · useAudio ·<br/>useAuthGate · useCardCatalog · …"]
    end
    subgraph Data["Data access"]
        QC["queryClient (TanStack)"]
        Fetch["native fetch (credentials: include)"]
        Sock["multiplayerSocketBridge (Socket.IO)"]
        NFT["cardNftService (mock NFT)"]
    end
    Server["spektrum-server"]
    Shared["@spektrum/shared"]

    Routing --> Features
    Features --> State
    State --> Data
    Features --> Shared
    Fetch -->|"next.config rewrite /api/*"| Server
    Sock --> Server
```

Pattern: **page → feature module → Zustand store → fetch/socket → server**. Stores own their own requests (no central API client).

---

## 3. Routing & Layouts

```mermaid
graph TB
    R["app/layout.tsx<br/>ClerkProvider · fonts"] --> P["providers.tsx<br/>QueryClientProvider · Toaster"]
    P --> Land["page.tsx /<br/>landing · mobile→/start"]
    P --> Auth["(auth)/layout<br/>centered 480px"]
    P --> Main["(main)/layout<br/>header · nav · ViewTransition"]

    Auth --> Start["/start"]
    Main --> Home["/home"]
    Main --> Cards["/cards (library + deck tabs)"]
    Main --> Game["/game (vs AI)"]
    Main --> MpR["/multiplayer"]
    Main --> Shop["/shop · /booster · /premade · /battle-sets"]
    Main --> Inv["/inventory"]
    Main --> Misc["/achievements /settings /tutorial /dev-tools"]
```

Rendering: root layout = RSC (metadata/fonts). All interactive pages = `"use client"` (Zustand). No ISR/streaming.

---

## 4. Auth & Bootstrap Flow

```mermaid
sequenceDiagram
    participant U as User
    participant Clerk as ClerkProvider
    participant AB as AppBootstrap
    participant WS as useWalletStore
    participant API as /api (server)

    U->>Clerk: load app (proxy.ts clerkMiddleware)
    Clerk-->>AB: useUser() { isSignedIn, web3Wallets[0] }
    alt signed in
        AB->>WS: hydrateFromClerk(walletAddress)
        WS->>API: POST /api/player/connect (JWT cookie)
        WS->>API: sync cards · decks · packs · seeker
        AB->>API: POST /api/player/session/start
    else signed out
        AB->>WS: clearOnSignOut() (wipe localStorage)
    end
    Note over AB,API: visibility hidden → session/end<br/>wallet switch → clear stores
```

Auth gating is **modal-level** (`useAuthGateStore` → `AuthGateModal`), not middleware-blocked routes. JWT auto-sent via cookies (`credentials: 'include'`).

---

## 5. Data Flow — REST

```mermaid
graph LR
    UI["Feature component"] --> Store["Zustand store action"]
    Store --> Fetch["fetch('/api/...', credentials: include)"]
    Fetch --> Rewrite["next.config.ts rewrite<br/>/api/* → :3001/api/*"]
    Rewrite --> Server["Express handler"]
    Server --> Store2["store updates state"]
    Store2 --> UI2["re-render"]
```

Dev: Next :3000 + Express :3001 (rewrite bridges). Prod: unified server, same-origin.

---

## 6. Data Flow — Multiplayer (Socket.IO)

```mermaid
sequenceDiagram
    participant UI as Game UI
    participant MS as useMultiplayerStore
    participant SB as socketBridge
    participant Srv as server
    participant Shared as @spektrum/shared types

    UI->>MS: join / send action
    MS->>SB: emit register_player · join_room · send_action
    SB->>Srv: Socket.IO (JWT auth)
    Srv-->>SB: match_found · game_state_updated (_seq)
    SB->>MS: apply masked state at _seq
    MS->>UI: render board (read-only view)
    Note over UI,Shared: server authoritative · event<br/>contracts typed by socket-events.ts
```

---

## 7. Game Modes

```mermaid
graph TB
    subgraph Local["Single-player (vs AI)"]
        GS["useGameStore"]
        Eng1["@spektrum/shared engine<br/>(runs in browser)"]
        AI["AIFactory.create(difficulty)"]
        GS --> Eng1
        GS --> AI
    end
    subgraph Net["Multiplayer / Ante"]
        MS["useMultiplayerStore /<br/>useAnteBattleStore"]
        Sync["useMultiplayerGameSync /<br/>useAnteGameSync"]
        SrvEng["server runs engine"]
        MS --> Sync --> SrvEng
    end
```

AI mode: client executes the **same shared engine** locally. Net mode: server executes it, client renders masked views. Identical rules either way.

---

## 8. State Stores

```mermaid
graph LR
    subgraph Persisted["localStorage-persisted"]
        Deck["useDeckStore<br/>ownedCards · decks · activeDeckId"]
        Inv["useInventoryStore<br/>boosterPacks"]
        UIst["useUIStore (scale)"]
        Audio["useAudioStore"]
    end
    subgraph Session["session / derived"]
        Wallet["useWalletStore<br/>address · profile · nftCards"]
        Mp["useMultiplayerStore"]
        Catalog["useCardCatalogStore"]
        Gate["useAuthGateStore"]
        Seeker["useSeekerStore"]
        Ante["useAnteBattleStore"]
        Ach["useAchievementsStore"]
    end
    Wallet -- "hydrate triggers" --> Deck
    Wallet --> Inv
    Wallet --> Seeker
```

`useWalletStore.hydrateFromClerk` is the fan-out point: it syncs cards/decks/packs from the server and clears localStorage on wallet switch.

---

## 9. Shared Package Dependency

```mermaid
graph LR
    Shared["@spektrum/shared (file:../)"]
    Shared -->|"types: Card · GameState · AvatarCard"| Types["stores · UI · features"]
    Shared -->|"engine fns"| AIMode["useGameStore (AI mode)"]
    Shared -->|"AIFactory"| AIMode
    Shared -->|"cardRegistry"| DeckB["deck-builder · shop · inventory"]
    Shared -->|"socket-events contracts"| Sock["useMultiplayerStore · socketBridge"]
```

No build step — consumed as TS source, transpiled by Next. See `../spektrum-shared` for engine/type internals.

---

## 10. Key Files

| Concern | Path |
|---|---|
| Root layout + Clerk | `src/app/layout.tsx` |
| Providers (Query) | `src/app/providers.tsx` |
| Clerk middleware | `proxy.ts` |
| Auth/wallet bootstrap | `src/components/shared/AppBootstrap.tsx` |
| Wallet store | `src/stores/useWalletStore.ts` |
| Socket bridge | `src/services/multiplayerSocketBridge.ts` |
| API rewrite | `next.config.ts` |
| Game engine glue | `src/features/game/store.ts` |
| shadcn config | `components.json` |
