# UI Migration Design — old-app → Next.js (v2)

**Date:** 2026-04-17  
**Scope:** Primary nav pages + full store migration  
**Approach:** Feature-first (Option B)

---

## Goal

Migrate all primary-nav UI pages from `old-app/` (Vite + React Router) into the current Next.js 15 App Router project (`src/`), adopting clean architecture with real store logic, and applying the dark sci-fi orange theme throughout.

---

## Architecture & File Structure

### App Router pages (thin — just render feature components)

```
src/app/
├── page.tsx                        # redirect → /start
├── (auth)/
│   └── start/page.tsx              # StartPage (wallet connect)
└── (main)/
    ├── layout.tsx                  # NavigationBar (restyled)
    ├── home/page.tsx
    ├── game/page.tsx
    ├── shop/page.tsx
    ├── deck-builder/page.tsx
    ├── inventory/page.tsx
    ├── library/page.tsx
    ├── achievements/page.tsx
    ├── settings/page.tsx
    ├── multiplayer/page.tsx
    ├── trading/page.tsx
    └── tutorial/page.tsx
```

### Features (UI + local state per page)

```
src/features/
├── start/index.tsx                 # from StartPage
├── home/index.tsx                  # from HomePage
├── game/
│   ├── index.tsx                   # Game wrapper (loading, forfeit, audio toggle)
│   ├── components/                 # all 2D game components from old-app
│   │   ├── GameBoard2D.tsx
│   │   ├── Card2D.tsx
│   │   ├── Hand2D.tsx
│   │   ├── PlayerStats2D.tsx
│   │   ├── GameControls2D.tsx
│   │   ├── CardRevealModal.tsx
│   │   ├── DiscardSelectionModal.tsx
│   │   ├── PlacementModal.tsx
│   │   ├── TargetSelector.tsx
│   │   ├── SpellEffectAnimation.tsx
│   │   ├── CardDrawEffect.tsx
│   │   ├── CardPlacementEffect.tsx
│   │   ├── CardActivationPause.tsx
│   │   └── EquipmentActivationButton.tsx
│   ├── stores/
│   │   ├── useGameMode.ts
│   │   ├── useGameExitStore.ts
│   │   ├── useGameUIStore.ts
│   │   ├── useAnimationStore.ts
│   │   └── useSpellEffectsStore.ts
│   └── hooks/
│       ├── useGame.ts              # existing — keep
│       └── useGameState.ts         # existing — keep
├── shop/index.tsx                  # from ShopPage
├── deck-builder/index.tsx          # from DeckBuilderPage
├── inventory/index.tsx             # from InventoryPage
├── library/index.tsx               # from LibraryPage
├── achievements/index.tsx          # from AchievementsPage
├── settings/index.tsx              # from SettingsPage
├── multiplayer/index.tsx           # from MultiplayerPage
├── trading/index.tsx               # from TradingPage
└── tutorial/index.tsx              # from TutorialPage
```

### Global stores (real logic)

```
src/stores/
├── useWalletStore.ts               # from old-app/src/game/stores/useWalletStore.ts
├── useAudioStore.ts                # from old-app/src/lib/stores/useAudio.tsx
├── useDeckStore.ts                 # from old-app/src/game/stores/useDeckStore.ts
├── useInventoryStore.ts            # from old-app/src/game/stores/useInventoryStore.ts
├── useAchievementsStore.ts         # from old-app/src/game/stores/useAchievementsStore.ts
├── useMultiplayerStore.ts          # from old-app/src/stores/useMultiplayerStore.ts
└── useUIStore.ts                   # from old-app/src/lib/stores/useUIScale.ts
```

### Shared components

```
src/components/
├── layout/
│   ├── NavigationBar.tsx           # restyled dark + orange
│   └── Shell.tsx                   # transparent (body provides dark bg)
├── shared/
│   ├── SafeCardImage.tsx           # from old-app/src/components/SafeCardImage.tsx
│   ├── BackButton.tsx              # from old-app/src/components/BackButton.tsx
│   ├── LoadingScreen.tsx           # from old-app/src/components/LoadingScreen.tsx
│   └── SolanaWalletConnect.tsx     # from old-app/src/components/SolanaWalletConnect.tsx
└── ui/                             # shadcn — unchanged
```

### Domain layer

`src/domain/game/` — **untouched**. Pure game engine, AI, types. Features import from here.

---

## Theme & Styling

Dark sci-fi palette added to `globals.css`:

```css
:root {
  --color-page-bg:    #111827;            /* gray-900 */
  --color-surface:    #1f2937;            /* gray-800 */
  --color-surface-2:  #374151;            /* gray-700 */
  --color-accent:     #f97316;            /* orange-500 */
  --color-accent-hover: #fb923c;          /* orange-400 */
  --color-accent-glow: rgba(249,115,22,0.3);
  --color-text:       #f9fafb;            /* gray-50 */
  --color-text-muted: #9ca3af;            /* gray-400 */
}

body { background-color: var(--color-page-bg); color: var(--color-text); }
```

- `NavigationBar` — dark bg, `border-t-2 border-orange-500`, orange glow shadow, orange active states (matches old-app pixel-for-pixel)
- `Shell` — transparent background (inherits dark body)
- Buttons — orange gradient (`from-orange-600 to-orange-700`)
- Panels — `bg-gray-900 border border-orange-500` with `box-shadow: 0 0 30px var(--color-accent-glow)`
- `framer-motion` animations — preserved from old-app as-is
- shadcn `ui/` primitives — keep as-is, theme vars override colors

---

## Store Migration

### Global stores (replaced stubs with real logic)

| Store | Old-app source | Content |
|---|---|---|
| `useWalletStore` | `old-app/src/game/stores/useWalletStore.ts` | connect/disconnect, deeplinks, session, NFT cards |
| `useAudioStore` | `old-app/src/lib/stores/useAudio.tsx` | SFX, music, volume, audio context |
| `useDeckStore` | `old-app/src/game/stores/useDeckStore.ts` | decks, owned cards, DB sync |
| `useInventoryStore` | `old-app/src/game/stores/useInventoryStore.ts` | booster packs, opening logic |
| `useAchievementsStore` | `old-app/src/game/stores/useAchievementsStore.ts` | progress, unlock tracking |
| `useMultiplayerStore` | `old-app/src/stores/useMultiplayerStore.ts` | socket.io, rooms, matchmaking |
| `useUIStore` | `old-app/src/lib/stores/useUIScale.ts` | UI scale, mobile state |

### Game-feature stores (scoped to `src/features/game/stores/`)

`useGameMode`, `useGameExitStore`, `useGameUIStore`, `useAnimationStore`, `useSpellEffectsStore`

### Deprecated (not migrated)

`useGameStore`, `useGameStore2`, `useCardGame` — replaced by `src/domain/game/` engine.

---

## Routing Changes

| Old (React Router) | New (Next.js App Router) |
|---|---|
| `/` → `/start` | `src/app/page.tsx` redirect to `/start` |
| `/start` | `src/app/(auth)/start/page.tsx` (replaces `(auth)/login/page.tsx` which is deleted) |
| `/home` | `src/app/(main)/home/page.tsx` |
| `/game-mode` | folded into `/game` page (mode selection UI) |
| `/game` | `src/app/(main)/game/page.tsx` |
| `/shop` | `src/app/(main)/shop/page.tsx` |
| `/deck-builder` | `src/app/(main)/deck-builder/page.tsx` |
| `/shop/inventory` → `/inventory` | `src/app/(main)/inventory/page.tsx` |
| `/library` | `src/app/(main)/library/page.tsx` |
| `/achievements` | `src/app/(main)/achievements/page.tsx` |
| `/settings` | `src/app/(main)/settings/page.tsx` |
| `/multiplayer` | `src/app/(main)/multiplayer/page.tsx` |
| `/trading` | `src/app/(main)/trading/page.tsx` |
| `/tutorial` | `src/app/(main)/tutorial/page.tsx` |

**Hook replacements across all features:**
- `useNavigate()` → `useRouter()` from `next/navigation`
- `useLocation().pathname` → `usePathname()` from `next/navigation`
- All feature files marked `"use client"`

---

## Bootstrap / Providers

Bootstrap logic from old-app's `SoundLoader` component moves into a dedicated `<AppBootstrap>` client component (`src/components/shared/AppBootstrap.tsx`), which is imported into `src/app/providers.tsx`:

- Wallet auto-reconnect on mount
- Deeplink callback parsing (Phantom, Solflare, Backpack)
- Audio context initialization on first user interaction
- App initialization (store hydration)

---

## Constraints

- `src/domain/game/` — read-only, no changes
- `src/components/ui/` — read-only, no changes
- Game-specific stores stay inside `src/features/game/`, not promoted to global
- `old-app/` — read-only reference, not deleted
- Sub-pages (BoosterPacks, GameMode, InteractiveTutorial, etc.) — deferred to next phase
