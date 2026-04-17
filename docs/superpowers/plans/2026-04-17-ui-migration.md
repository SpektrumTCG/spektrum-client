# UI Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all primary-nav UI pages from `old-app/` (Vite + React Router) into the current Next.js 15 App Router project with dark sci-fi orange theme and real Zustand store logic.

**Architecture:** Feature-first — each page lives in `src/features/<name>/index.tsx`, thin Next.js pages just render feature components, shared global stores in `src/stores/`, game-scoped stores inside `src/features/game/stores/`.

**Tech Stack:** Next.js 15 App Router, React, Zustand 5, framer-motion 12, lucide-react, shadcn/ui, Tailwind CSS 4, Howler.js (audio), socket.io-client (multiplayer), TypeScript.

---

## Reference

- Old-app source: `old-app/src/` — read only, never modify
- Design spec: `docs/superpowers/specs/2026-04-17-ui-migration-design.md`
- Type check command: `npx tsc --noEmit`
- Dev server: `npm run dev`

### Hook migration cheat-sheet (apply everywhere)
| Old (React Router) | New (Next.js) |
|---|---|
| `import { useNavigate } from 'react-router-dom'` | `import { useRouter } from 'next/navigation'` |
| `const navigate = useNavigate()` | `const router = useRouter()` |
| `navigate('/path')` | `router.push('/path')` |
| `import { useLocation } from 'react-router-dom'` | `import { usePathname } from 'next/navigation'` |
| `useLocation().pathname` | `usePathname()` |

### Import path migration cheat-sheet
| Old path | New path |
|---|---|
| `'../game/stores/useWalletStore'` | `'@/stores/useWalletStore'` |
| `'../game/stores/useDeckStore'` | `'@/stores/useDeckStore'` |
| `'../game/stores/useInventoryStore'` | `'@/stores/useInventoryStore'` |
| `'../game/stores/useAchievementsStore'` | `'@/stores/useAchievementsStore'` |
| `'../stores/useMultiplayerStore'` | `'@/stores/useMultiplayerStore'` |
| `'../lib/stores/useAudio'` | `'@/stores/useAudioStore'` |
| `'../lib/stores/useUIScale'` | `'@/stores/useUIStore'` |
| `'../components/BackButton'` | `'@/components/shared/BackButton'` |
| `'../components/LoadingScreen'` | `'@/components/shared/LoadingScreen'` |
| `'../components/SafeCardImage'` | `'@/components/shared/SafeCardImage'` |
| `'../components/SolanaWalletConnect'` | `'@/components/shared/SolanaWalletConnect'` |
| `'../game/data/cardTypes'` | `'@/domain/game/types'` |
| `'../../lib/queryClient'` | `'@/lib/queryClient'` |
| `'../../blockchain/solana/cardNftService'` | `'@/features/blockchain/solana/cardNftService'` |
| `'../blockchain/solana/cardNftService'` | `'@/features/blockchain/solana/cardNftService'` |

---

## Task 1: Dark Sci-Fi Theme

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add dark sci-fi CSS variables and body defaults**

Open `src/app/globals.css` and add the following immediately after the `:root { ... }` block (around line 67, after the existing closing brace of `:root`):

```css
/* Dark sci-fi palette */
:root {
  --spektrum-bg: #111827;
  --spektrum-surface: #1f2937;
  --spektrum-surface-2: #374151;
  --spektrum-accent: #f97316;
  --spektrum-accent-hover: #fb923c;
  --spektrum-accent-glow: rgba(249, 115, 22, 0.3);
  --spektrum-text: #f9fafb;
  --spektrum-text-muted: #9ca3af;
}

body {
  background-color: var(--spektrum-bg);
  color: var(--spektrum-text);
  font-family: 'Noto Sans', Inter, sans-serif;
}
```

- [ ] **Step 2: Verify type check passes**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add dark sci-fi orange theme variables"
```

---

## Task 2: Restyle NavigationBar

**Files:**
- Modify: `src/components/layout/NavigationBar.tsx`

- [ ] **Step 1: Replace NavigationBar with dark sci-fi styled version**

Replace the entire content of `src/components/layout/NavigationBar.tsx` with:

```tsx
"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { NAV_HEIGHT } from "@/lib/constants"

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 9.5L12 3l9 6.5v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9z"/>
    <path d="M9 22V12h6v10"/>
  </svg>
)

const GameIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8"/><path d="M12 17v4"/>
  </svg>
)

const ShopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57l1.65-7.43H5.12"/>
  </svg>
)

const DeckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    <path d="M8 7h8"/><path d="M8 11h6"/>
  </svg>
)

const LibraryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
)

const AchievementsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
)

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.6 9a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
)

const MoreGridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="5" cy="5" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="19" cy="5" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="19" cy="19" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
)

const PRIMARY_NAV = [
  { path: "/home", label: "Home", icon: <HomeIcon /> },
  { path: "/game", label: "Play", icon: <GameIcon /> },
  { path: "/shop", label: "Shop", icon: <ShopIcon /> },
  { path: "/deck-builder", label: "Deck", icon: <DeckIcon /> },
]

const MORE_NAV = [
  { path: "/inventory", label: "Inventory", icon: <ShopIcon /> },
  { path: "/library", label: "Library", icon: <LibraryIcon /> },
  { path: "/achievements", label: "Achievements", icon: <AchievementsIcon /> },
  { path: "/multiplayer", label: "Multiplayer", icon: <GameIcon /> },
  { path: "/trading", label: "Trading", icon: <ShopIcon /> },
  { path: "/settings", label: "Settings", icon: <SettingsIcon /> },
]

export function NavigationBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  const navigate = (path: string) => {
    setShowMore(false)
    router.push(path)
  }

  const isActive = (path: string) => pathname === path
  const isMoreActive = MORE_NAV.some(item => pathname === item.path)

  const navBtnClass = (active: boolean) =>
    cn(
      "flex flex-col items-center justify-center flex-1 gap-1 min-h-[44px] min-w-[44px] transition-colors rounded-lg",
      active ? "text-orange-400" : "text-gray-400 hover:text-orange-400"
    )

  return (
    <>
      <AnimatePresence>
        {showMore && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMore(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMore && (
          <motion.div
            className="fixed left-0 right-0 z-50 flex justify-center"
            style={{ bottom: NAV_HEIGHT }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div
              className="w-full max-w-sm bg-gray-900 border-t-2 border-orange-500 px-6 pt-4 pb-4"
              style={{ boxShadow: "0 -4px 24px rgba(249, 115, 22, 0.25)" }}
            >
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3 px-1">More</p>
              <div className="grid grid-cols-4 gap-2">
                {MORE_NAV.map(item => (
                  <motion.button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors",
                      isActive(item.path)
                        ? "text-orange-400 bg-orange-500/20"
                        : "text-gray-400 hover:text-orange-400 hover:bg-orange-500/10"
                    )}
                    whileTap={{ scale: 0.93 }}
                  >
                    <div className="w-5 h-5">{item.icon}</div>
                    <span className="text-[10px] font-medium leading-none">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
        style={{ height: NAV_HEIGHT }}
      >
        <div
          className="w-full max-w-sm h-full border-t-2 border-orange-500 bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-around px-2"
          style={{ boxShadow: "0 0 25px rgba(249, 115, 22, 0.4), inset 0 0 15px rgba(249, 115, 22, 0.1)" }}
        >
          {PRIMARY_NAV.map(item => (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={navBtnClass(isActive(item.path))}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={cn(
                  "transition-all",
                  isActive(item.path) ? "p-1.5 rounded-lg bg-orange-500/20" : ""
                )}
                animate={isActive(item.path) ? { scale: 1.15 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {item.icon}
              </motion.div>
              <span className={cn("text-[9px] font-medium leading-none", isActive(item.path) && "text-orange-400 font-semibold")}>
                {item.label}
              </span>
            </motion.button>
          ))}

          <motion.button
            onClick={() => setShowMore(v => !v)}
            className={navBtnClass(isMoreActive || showMore)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label="More navigation options"
          >
            <motion.div
              className={cn("transition-all", (isMoreActive || showMore) ? "p-1.5 rounded-lg bg-orange-500/20" : "")}
              animate={(isMoreActive || showMore) ? { scale: 1.15 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MoreGridIcon />
            </motion.div>
            <span className={cn("text-[9px] font-medium leading-none", (isMoreActive || showMore) && "text-orange-400 font-semibold")}>
              More
            </span>
          </motion.button>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/NavigationBar.tsx
git commit -m "feat: restyle NavigationBar with dark sci-fi orange theme"
```

---

## Task 3: Layout & Routing Updates

**Files:**
- Modify: `src/components/layout/Shell.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/(main)/layout.tsx`
- Delete: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/start/page.tsx` (placeholder — filled in Task 11)

- [ ] **Step 1: Update Shell to be transparent (dark body provides background)**

Replace `src/components/layout/Shell.tsx`:

```tsx
import { cn } from "@/lib/utils"
import { NAV_HEIGHT } from "@/lib/constants"

interface ShellProps {
  children: React.ReactNode
  className?: string
  maxWidth?: "max-w-sm" | "max-w-md" | "max-w-lg"
  withNav?: boolean
}

export function Shell({
  children,
  className,
  maxWidth = "max-w-sm",
  withNav = true,
}: ShellProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4", maxWidth, className)}
      style={{ paddingBottom: withNav ? NAV_HEIGHT + 16 : undefined }}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Update root page to redirect to /start**

Replace `src/app/page.tsx`:

```tsx
import { redirect } from "next/navigation"

export default function RootPage() {
  redirect("/start")
}
```

- [ ] **Step 3: Update main layout to center content**

Replace `src/app/(main)/layout.tsx`:

```tsx
import { NavigationBar } from "@/components/layout/NavigationBar"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full">
      <div className="relative mx-auto w-full max-w-sm">
        <main>{children}</main>
      </div>
      <NavigationBar />
    </div>
  )
}
```

- [ ] **Step 4: Create start route placeholder and delete old login route**

Create `src/app/(auth)/start/page.tsx`:

```tsx
export default function StartPage() {
  return <div />
}
```

Delete `src/app/(auth)/login/page.tsx` — remove the file entirely.

- [ ] **Step 5: Update auth layout to center content on dark background**

Replace `src/app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center">
      <div className="relative w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/Shell.tsx src/app/page.tsx src/app/\(main\)/layout.tsx src/app/\(auth\)/layout.tsx src/app/\(auth\)/start/page.tsx
git rm src/app/\(auth\)/login/page.tsx
git commit -m "feat: update layout and routing — redirect to /start, dark bg, centered"
```

---

## Task 4: Shared Components

**Files:**
- Create: `src/components/shared/BackButton.tsx`
- Create: `src/components/shared/LoadingScreen.tsx`
- Create: `src/components/shared/SafeCardImage.tsx`
- Create: `src/components/shared/SolanaWalletConnect.tsx`
- Create: `src/components/shared/WalletSelectorModal.tsx`
- Create: `src/components/shared/index.ts`

- [ ] **Step 1: Create BackButton**

Create `src/components/shared/BackButton.tsx`:

```tsx
"use client"

import { useRouter } from "next/navigation"

interface BackButtonProps {
  to?: string
  onClick?: () => void
}

export function BackButton({ to = "/home", onClick }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push(to)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="fixed top-4 right-4 z-50 bg-gray-800 bg-opacity-80 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
      title="Back"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6"/>
      </svg>
    </button>
  )
}
```

- [ ] **Step 2: Create LoadingScreen**

Create `src/components/shared/LoadingScreen.tsx`:

```tsx
"use client"

import { useMemo } from "react"

interface LoadingScreenProps {
  message?: string
  backgroundImage?: string
}

const CHARACTER_IMAGES = [
  "/attached_assets/Alpha-Loading-ScreenCrimson-Loading-Screen_1755442684371.png",
  "/attached_assets/Alpha-Loading-ScreenMaya-Loading-Screen_1755442684373.png",
  "/attached_assets/Alpha-Loading-ScreenMustard-Loading-Screen_1755442684373.png",
  "/attached_assets/Alpha-Loading-ScreenPine-Loading-Screen_1755442684374.png",
  "/attached_assets/Alpha-Loading-ScreenRadja-Loading-Screen_1755442684374.png",
]

export function LoadingScreen({ message = "Loading...", backgroundImage }: LoadingScreenProps) {
  const randomCharacter = useMemo(
    () => CHARACTER_IMAGES[Math.floor(Math.random() * CHARACTER_IMAGES.length)],
    []
  )
  const finalBg = backgroundImage || randomCharacter

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900"
      style={{ backgroundImage: `url(${finalBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 text-center px-4">
        <div className="mb-6">
          <img
            src="/attached_assets/Logo Spektrum_1760084011907.png"
            alt="Spektrum"
            className="w-48 h-auto mx-auto opacity-95"
            onError={e => { e.currentTarget.style.display = "none" }}
          />
        </div>
        <div className="mb-6 flex justify-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-orange-500 border-r-orange-500"
            style={{ boxShadow: "0 0 20px rgba(249, 115, 22, 0.6)" }}
          />
        </div>
        <p className="text-white text-lg font-bold tracking-wide">{message}</p>
        <div className="mt-3 text-orange-400 text-sm font-medium" style={{ textShadow: "0 0 10px rgba(249, 115, 22, 0.5)" }}>
          Preparing your adventure...
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create SafeCardImage**

Copy `old-app/src/components/SafeCardImage.tsx` to `src/components/shared/SafeCardImage.tsx`, then:
1. Add `"use client"` at the top
2. Change `export default SafeCardImage` → `export { SafeCardImage }` (and add `export function SafeCardImage` or keep the component name the same but named export)
3. Remove any React Router imports (there should be none in this file)

The component signature is:
```tsx
"use client"

interface SafeCardImageProps {
  src?: string | null
  alt: string
  className?: string
  style?: React.CSSProperties
  onError?: () => void
}

export function SafeCardImage({ src, alt, className, style, onError }: SafeCardImageProps) {
  // copy body from old-app/src/components/SafeCardImage.tsx
}
```

- [ ] **Step 4: Create WalletSelectorModal**

Copy `old-app/src/components/WalletSelectorModal.tsx` to `src/components/shared/WalletSelectorModal.tsx`, then:
1. Add `"use client"` at the top
2. Change `import { useWalletStore } from '../game/stores/useWalletStore'` → `import { useWalletStore } from '@/stores/useWalletStore'`
3. Change default export to named export: `export function WalletSelectorModal`

- [ ] **Step 5: Create SolanaWalletConnect**

Copy `old-app/src/components/SolanaWalletConnect.tsx` to `src/components/shared/SolanaWalletConnect.tsx`, then apply these changes:
1. Add `"use client"` at the top
2. `import { useWalletStore } from '../game/stores/useWalletStore'` → `import { useWalletStore } from '@/stores/useWalletStore'`
3. `import WalletSelectorModal from './WalletSelectorModal'` → `import { WalletSelectorModal } from '@/components/shared/WalletSelectorModal'`
4. `import { isStandalonePWA } from '../utils/pwaUtils'` → `import { isStandalonePWA } from '@/lib/pwaUtils'`
5. Change default export to named export: `export function SolanaWalletConnect`

- [ ] **Step 6: Create pwaUtils in lib**

Create `src/lib/pwaUtils.ts`:

```ts
export function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  )
}
```

- [ ] **Step 7: Create shared index**

Create `src/components/shared/index.ts`:

```ts
export { BackButton } from "./BackButton"
export { LoadingScreen } from "./LoadingScreen"
export { SafeCardImage } from "./SafeCardImage"
export { SolanaWalletConnect } from "./SolanaWalletConnect"
export { WalletSelectorModal } from "./WalletSelectorModal"
```

- [ ] **Step 8: Verify**

```bash
npx tsc --noEmit
```

Fix any type errors before continuing.

- [ ] **Step 9: Commit**

```bash
git add src/components/shared/ src/lib/pwaUtils.ts
git commit -m "feat: add shared components (BackButton, LoadingScreen, SafeCardImage, SolanaWalletConnect)"
```

---

## Task 5: Migrate useWalletStore

**Files:**
- Modify: `src/stores/useWalletStore.ts`

The current file is a stub. Replace it with the real logic from `old-app/src/game/stores/useWalletStore.ts`.

- [ ] **Step 1: Copy and adapt the wallet store**

Copy the full content of `old-app/src/game/stores/useWalletStore.ts` into `src/stores/useWalletStore.ts`, then apply these import path changes:

```ts
// BEFORE
import { cardNftService, type WalletStatus } from '../../blockchain/solana/cardNftService'
import { parsePhantomCallback, hasPhantomSession } from '../../blockchain/solana/phantomDeeplink'
import { parseSolflareCallback, hasSolflareSession } from '../../blockchain/solana/solflareDeeplink'
import { parseBackpackCallback, hasBackpackSession } from '../../blockchain/solana/backpackDeeplink'
import { Card } from '../data/cardTypes'

// AFTER
import { cardNftService, type WalletStatus } from '@/features/blockchain/solana/cardNftService'
import { parsePhantomCallback, hasPhantomSession } from '@/features/blockchain/solana/phantomDeeplink'
import { parseSolflareCallback, hasSolflareSession } from '@/features/blockchain/solana/solflareDeeplink'
import { parseBackpackCallback, hasBackpackSession } from '@/features/blockchain/solana/backpackDeeplink'
import type { Card } from '@/domain/game/types'
```

No other changes needed — the store logic is framework-agnostic.

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 3: Commit**

```bash
git add src/stores/useWalletStore.ts
git commit -m "feat: migrate useWalletStore with real wallet/deeplink logic"
```

---

## Task 6: Migrate useAudioStore

**Files:**
- Modify: `src/stores/useAudioStore.ts`

- [ ] **Step 1: Install howler if not present**

```bash
npm list howler 2>/dev/null || npm install howler && npm install -D @types/howler
```

- [ ] **Step 2: Copy and adapt the audio store**

Copy the full content of `old-app/src/lib/stores/useAudio.tsx` into `src/stores/useAudioStore.ts`, then:

1. Remove the `.tsx` extension specifics — rename the file is already `.ts`, no JSX needed
2. The export name changes: the old file exports `useAudio` — keep that name OR export as `useAudioStore` with an alias. Add both for compatibility:

```ts
// At the bottom of the file, after the existing export:
export { useAudio } from './useAudioStore'  // NOT needed — just keep the name useAudio in the store itself
```

Actually, keep the export as `useAudio` to match old-app usage (most pages import `useAudio`). No rename needed.

3. No import path changes needed — the audio store has no internal imports from old-app paths.

The final file should export `useAudio` (not `useAudioStore`) and `registerLegacyMusicStop`.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/stores/useAudioStore.ts
git commit -m "feat: migrate useAudioStore with Howler.js audio logic"
```

---

## Task 7: Migrate useDeckStore

**Files:**
- Modify: `src/stores/useDeckStore.ts`

The old-app deck store imports from several internal stores. We need to handle `useCardCatalogStore` and `useBoosterVariantStore` which don't exist in the new project yet — create minimal stubs for them.

- [ ] **Step 1: Create useCardCatalogStore stub**

Create `src/stores/useCardCatalogStore.ts`:

```ts
import { create } from 'zustand'

interface CardCatalogEntry {
  id: string
  imagePath?: string
  skills?: any[]
  passiveSkill?: any
}

interface CardCatalogStore {
  catalog: Map<string, CardCatalogEntry>
  isLoaded: boolean
  loadCatalog: () => Promise<void>
}

export const useCardCatalogStore = create<CardCatalogStore>((set) => ({
  catalog: new Map(),
  isLoaded: false,
  loadCatalog: async () => {
    try {
      const res = await fetch('/api/card-catalog')
      if (!res.ok) return
      const data = await res.json()
      const catalog = new Map<string, CardCatalogEntry>()
      if (Array.isArray(data)) {
        data.forEach((entry: CardCatalogEntry) => {
          catalog.set(entry.id, entry)
        })
      }
      set({ catalog, isLoaded: true })
    } catch {
      set({ isLoaded: true })
    }
  },
}))
```

- [ ] **Step 2: Create useBoosterVariantStore stub**

Create `src/stores/useBoosterVariantStore.ts` by copying `old-app/src/game/stores/useBoosterVariantStore.ts` and applying import changes:

```ts
// BEFORE
import { Card } from '../data/cardTypes'
// AFTER
import type { Card } from '@/domain/game/types'
```

- [ ] **Step 3: Copy and adapt useDeckStore**

Copy the full content of `old-app/src/game/stores/useDeckStore.ts` into `src/stores/useDeckStore.ts`, then apply these import changes:

```ts
// BEFORE
import { Card, AvatarCard, ActionCard } from '../data/cardTypes'
import { allNewFireCards } from '../data/newFireCards'
import { allNonElementalCards } from '../data/nonElementalCards'
import { blueElementalCards, blueElementalSpells, blueElementalFieldCards } from '../data/blueElementalCards'
import { advancedSpellCards } from '../data/advancedSpellCards'
import { cardNftService } from '../../blockchain/solana/cardNftService'
import { toast } from 'sonner'
import { isSameBaseCard, getBaseCardId } from '../utils/rarityUtils'
import { useAchievementsStore } from './useAchievementsStore'
import { useCardCatalogStore } from './useCardCatalogStore'

// AFTER
import type { Card, AvatarCard, ActionCard } from '@/domain/game/types'
import { cardNftService } from '@/features/blockchain/solana/cardNftService'
import { toast } from 'sonner'
import { useAchievementsStore } from '@/stores/useAchievementsStore'
import { useCardCatalogStore } from '@/stores/useCardCatalogStore'
```

For the card data imports (`allNewFireCards`, `blueElementalCards`, etc.) — these come from the old-app card data files. The new project has them at `@/domain/game/data/`. Check which files exist:

```bash
ls src/domain/game/data/cards/
```

Replace each import:
```ts
// The new project's data files expose cards via the registry:
import { getAllCards } from '@/domain/game/data'
```

Then in `getAvailableCards()`, replace direct array concatenation with `getAllCards()` from the domain layer.

For `isSameBaseCard` and `getBaseCardId` — copy `old-app/src/game/utils/rarityUtils.ts` to `src/lib/rarityUtils.ts` and import from there:
```ts
import { isSameBaseCard, getBaseCardId } from '@/lib/rarityUtils'
```

- [ ] **Step 4: Copy rarityUtils**

Create `src/lib/rarityUtils.ts` by copying `old-app/src/game/utils/rarityUtils.ts` and applying:
```ts
// BEFORE
import { Card } from '../data/cardTypes'
// AFTER
import type { Card } from '@/domain/game/types'
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit
```

Fix type errors.

- [ ] **Step 6: Commit**

```bash
git add src/stores/useDeckStore.ts src/stores/useCardCatalogStore.ts src/stores/useBoosterVariantStore.ts src/lib/rarityUtils.ts
git commit -m "feat: migrate useDeckStore, useCardCatalogStore, useBoosterVariantStore"
```

---

## Task 8: Migrate useInventoryStore & useAchievementsStore

**Files:**
- Modify: `src/stores/useInventoryStore.ts`
- Modify: `src/stores/useAchievementsStore.ts`

- [ ] **Step 1: Copy and adapt useInventoryStore**

Copy `old-app/src/game/stores/useInventoryStore.ts` into `src/stores/useInventoryStore.ts` and apply:

```ts
// BEFORE
import { Card } from '../data/cardTypes'
import { BoosterVariant, BoosterPack, fetchCardCatalog, variantTemplates } from './useBoosterVariantStore'
import { useDeckStore } from './useDeckStore'
import { useWalletStore } from './useWalletStore'
import { apiRequest } from '../../lib/queryClient'

// AFTER
import type { Card } from '@/domain/game/types'
import type { BoosterVariant, BoosterPack } from '@/stores/useBoosterVariantStore'
import { useBoosterVariantStore } from '@/stores/useBoosterVariantStore'
import { useDeckStore } from '@/stores/useDeckStore'
import { useWalletStore } from '@/stores/useWalletStore'
import { apiRequest } from '@/lib/queryClient'
```

- [ ] **Step 2: Copy and adapt useAchievementsStore**

Copy `old-app/src/game/stores/useAchievementsStore.ts` into `src/stores/useAchievementsStore.ts` and apply:

```ts
// BEFORE
import { ACHIEVEMENTS, Achievement, AchievementCategory } from '../data/achievements'

// AFTER — copy old-app/src/game/data/achievements.ts to src/lib/achievements.ts first
import { ACHIEVEMENTS, type Achievement, type AchievementCategory } from '@/lib/achievements'
```

- [ ] **Step 3: Copy achievements data**

Copy `old-app/src/game/data/achievements.ts` to `src/lib/achievements.ts`. No import path changes needed (it has no local imports).

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/stores/useInventoryStore.ts src/stores/useAchievementsStore.ts src/lib/achievements.ts
git commit -m "feat: migrate useInventoryStore and useAchievementsStore"
```

---

## Task 9: Migrate useMultiplayerStore & useUIStore

**Files:**
- Modify: `src/stores/useMultiplayerStore.ts`
- Modify: `src/stores/useUIStore.ts`

- [ ] **Step 1: Install socket.io-client if not present**

```bash
npm list socket.io-client 2>/dev/null || npm install socket.io-client
```

- [ ] **Step 2: Copy and adapt useMultiplayerStore**

Copy `old-app/src/stores/useMultiplayerStore.ts` into `src/stores/useMultiplayerStore.ts`. Apply:

```ts
// BEFORE
import { io, Socket } from 'socket.io-client'
// AFTER — same, socket.io-client is now installed
import { io, type Socket } from 'socket.io-client'
```

No other import path changes needed.

- [ ] **Step 3: Copy and adapt useUIStore**

Copy `old-app/src/lib/stores/useUIScale.ts` into `src/stores/useUIStore.ts`. The file has no internal imports.

Export the store as both `useUIScale` (for backward compat) and `useUIStore`:

```ts
// At the bottom, after the existing create() call, add:
export { useUIScale as useUIStore }
```

Keep the original `export const useUIScale = create<UIScaleState>()(...)` line as-is.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/stores/useMultiplayerStore.ts src/stores/useUIStore.ts
git commit -m "feat: migrate useMultiplayerStore and useUIStore"
```

---

## Task 10: AppBootstrap Component

**Files:**
- Create: `src/components/shared/AppBootstrap.tsx`
- Modify: `src/app/providers.tsx`
- Create: `src/hooks/useAudioContextSwitcher.ts` (if not exists)

- [ ] **Step 1: Copy useAudioContextSwitcher hook**

The file already exists at `src/hooks/useAudioContextSwitcher.ts`. Open it and compare against `old-app/src/hooks/useAudioContextSwitcher.tsx`. If it's a stub, replace with:

Copy content of `old-app/src/hooks/useAudioContextSwitcher.tsx` and apply:
```ts
// BEFORE
import { useAudio } from '../lib/stores/useAudio'
import { useLocation } from 'react-router-dom'
// AFTER
import { useAudio } from '@/stores/useAudioStore'
import { usePathname } from 'next/navigation'
```

Replace `const location = useLocation()` with `const pathname = usePathname()` and update all `location.pathname` references to `pathname`.

- [ ] **Step 2: Create AppBootstrap**

Create `src/components/shared/AppBootstrap.tsx`:

```tsx
"use client"

import { useEffect, useRef } from "react"
import { useAudio } from "@/stores/useAudioStore"
import { useWalletStore } from "@/stores/useWalletStore"
import { parsePhantomCallback } from "@/features/blockchain/solana/phantomDeeplink"
import { parseSolflareCallback } from "@/features/blockchain/solana/solflareDeeplink"
import { parseBackpackCallback } from "@/features/blockchain/solana/backpackDeeplink"
import { toast } from "sonner"

export function AppBootstrap() {
  const hasProcessedCallback = useRef(false)
  const hasAttemptedReconnect = useRef(false)
  const { initializeAudio, setAudioContext } = useAudio()
  const { connectWallet, attemptAutoReconnect, isConnected, walletAddress, isReconnecting } = useWalletStore()

  // Handle wallet deeplink callbacks (Phantom, Solflare, Backpack)
  useEffect(() => {
    if (hasProcessedCallback.current) return

    const handleWalletCallbacks = async () => {
      const phantomCb = parsePhantomCallback()
      if (phantomCb) {
        hasProcessedCallback.current = true
        const success = await connectWallet("phantom")
        if (success) toast.success("Phantom wallet connected!")
        else toast.error("Wallet connection failed")
        window.history.replaceState({}, document.title, window.location.pathname)
        return
      }

      const solflareCb = parseSolflareCallback()
      if (solflareCb) {
        hasProcessedCallback.current = true
        const success = await connectWallet("solflare")
        if (success) toast.success("Solflare wallet connected!")
        else toast.error("Wallet connection failed")
        window.history.replaceState({}, document.title, window.location.pathname)
        return
      }

      const backpackCb = parseBackpackCallback()
      if (backpackCb) {
        hasProcessedCallback.current = true
        const success = await connectWallet("backpack")
        if (success) toast.success("Backpack wallet connected!")
        else toast.error("Wallet connection failed")
        window.history.replaceState({}, document.title, window.location.pathname)
        return
      }
    }

    handleWalletCallbacks()
  }, [connectWallet])

  // Auto-reconnect wallet on app startup
  useEffect(() => {
    if (hasAttemptedReconnect.current) return
    hasAttemptedReconnect.current = true

    const attemptReconnect = async () => {
      if (useWalletStore.getState().isConnected) return

      const url = new URL(window.location.href)
      const hasCallback =
        url.searchParams.get("phantom_action") ||
        url.searchParams.get("solflare_action") ||
        url.searchParams.get("backpack_action")
      if (hasCallback) return

      await new Promise(r => setTimeout(r, 1500))
      const success = await attemptAutoReconnect()
      if (success) toast.success("Wallet reconnected!", { duration: 2000 })
    }

    attemptReconnect()
  }, [attemptAutoReconnect])

  // Session tracking
  useEffect(() => {
    if (!isConnected || !walletAddress || isReconnecting) return

    let sessionActive = true

    const startSession = async () => {
      try {
        await fetch("/api/player/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress }),
        })
      } catch {}
    }

    const endSession = async () => {
      if (!sessionActive) return
      sessionActive = false
      try {
        await fetch("/api/player/session/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress }),
        })
      } catch {}
    }

    startSession()

    const handleVisibility = () => {
      if (document.hidden) endSession()
      else { sessionActive = true; startSession() }
    }

    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("beforeunload", endSession)

    return () => {
      endSession()
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("beforeunload", endSession)
    }
  }, [isConnected, walletAddress, isReconnecting])

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      try {
        initializeAudio()
        setAudioContext("menu")
      } catch {}
      document.removeEventListener("click", handleInteraction)
      document.removeEventListener("keydown", handleInteraction)
    }

    document.addEventListener("click", handleInteraction)
    document.addEventListener("keydown", handleInteraction)

    return () => {
      document.removeEventListener("click", handleInteraction)
      document.removeEventListener("keydown", handleInteraction)
    }
  }, [initializeAudio, setAudioContext])

  return null
}
```

- [ ] **Step 3: Add AppBootstrap to providers**

Replace `src/app/providers.tsx`:

```tsx
"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { Toaster } from "@/components/ui/sonner"
import { AppBootstrap } from "@/components/shared/AppBootstrap"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppBootstrap />
      {children}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  )
}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/AppBootstrap.tsx src/app/providers.tsx src/hooks/useAudioContextSwitcher.ts
git commit -m "feat: add AppBootstrap for wallet reconnect, deeplinks, audio init"
```

---

## Task 11: Start Feature (Login / Wallet Connect Page)

**Files:**
- Create: `src/features/start/index.tsx`
- Modify: `src/app/(auth)/start/page.tsx`

- [ ] **Step 1: Create start feature**

Create `src/features/start/index.tsx` by adapting `old-app/src/pages/StartPage.tsx`:

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SolanaWalletConnect } from "@/components/shared/SolanaWalletConnect"
import { LoadingScreen } from "@/components/shared/LoadingScreen"

export function StartFeature() {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleWalletConnected = () => {
    setIsConnected(true)
  }

  const handlePlayGame = () => {
    setIsLoading(true)
    setTimeout(() => {
      router.push("/home")
    }, 2000)
  }

  if (isLoading) {
    return <LoadingScreen message="Entering the world of Spektrum..." />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24 overflow-y-auto">
      <div className="max-w-md w-full mx-auto text-center flex flex-col items-center">
        {/* Logo */}
        <div className="mb-12">
          <img
            src="/attached_assets/Logo Spektrum_1760084011907.png"
            alt="Spektrum Trading Card Game"
            className="w-full max-w-md mx-auto h-auto drop-shadow-lg"
            onError={e => { e.currentTarget.style.display = "none" }}
          />
        </div>

        {/* Wallet Connect */}
        <div className="w-full mb-6">
          <SolanaWalletConnect onConnected={handleWalletConnected} />
        </div>

        {/* Play button — shown once wallet is connected */}
        {isConnected && (
          <button
            onClick={handlePlayGame}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all border border-orange-400 mt-4"
            style={{ boxShadow: "0 0 25px rgba(249, 115, 22, 0.6)" }}
          >
            ▶ ENTER THE ARENA
          </button>
        )}

        <p className="text-gray-500 text-xs mt-8">
          Connect your Solana wallet to begin your journey
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire page**

Replace `src/app/(auth)/start/page.tsx`:

```tsx
import { StartFeature } from "@/features/start"

export default function StartPage() {
  return <StartFeature />
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/features/start/index.tsx src/app/\(auth\)/start/page.tsx
git commit -m "feat: migrate Start/Login page with wallet connect UI"
```

---

## Task 12: Home Feature

**Files:**
- Create: `src/features/home/index.tsx`
- Create: `src/components/shared/ProgressTracker.tsx`
- Create: `src/components/shared/FirstTimeWelcomePopup.tsx`
- Modify: `src/app/(main)/home/page.tsx`

- [ ] **Step 1: Copy ProgressTracker**

Copy `old-app/src/components/ProgressTracker.tsx` to `src/components/shared/ProgressTracker.tsx`. Apply:
1. Add `"use client"` at top
2. `import { useNavigate } from 'react-router-dom'` → `import { useRouter } from 'next/navigation'`
3. `const navigate = useNavigate()` → `const router = useRouter()`
4. `navigate(...)` → `router.push(...)`
5. Store imports → `@/stores/` paths
6. Change default export to named: `export function ProgressTracker`

- [ ] **Step 2: Copy FirstTimeWelcomePopup**

Copy `old-app/src/components/FirstTimeWelcomePopup.tsx` to `src/components/shared/FirstTimeWelcomePopup.tsx`. Apply:
1. Add `"use client"` at top
2. Change default export to named: `export function FirstTimeWelcomePopup`
3. No router imports in this file — keep as-is

- [ ] **Step 3: Create home feature**

Create `src/features/home/index.tsx` by adapting `old-app/src/pages/HomePage.tsx`:

```tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useWalletStore } from "@/stores/useWalletStore"
import { useAudio } from "@/stores/useAudioStore"
import { ProgressTracker } from "@/components/shared/ProgressTracker"
import { FirstTimeWelcomePopup } from "@/components/shared/FirstTimeWelcomePopup"

const ROLLING_IMAGES = [
  "/textures/cards/Home Screen_1.webp",
  "/textures/cards/Home Screen_2.webp",
  "/textures/cards/Home Screen_3.webp",
  "/textures/cards/Home Screen_4.webp",
]

export function HomeFeature() {
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set())
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [welcomeCheckDone, setWelcomeCheckDone] = useState(false)

  const { walletAddress, isConnected } = useWalletStore()
  const { playBackgroundMusic } = useAudio()

  useEffect(() => { playBackgroundMusic() }, [])

  useEffect(() => {
    setWelcomeCheckDone(false)
    setShowWelcomePopup(false)
  }, [walletAddress])

  useEffect(() => {
    const check = async () => {
      if (!isConnected || !walletAddress || welcomeCheckDone) return
      try {
        const res = await fetch(`/api/player/welcome-status/${walletAddress}`)
        if (res.ok) {
          const data = await res.json()
          if (!data.hasSeenWelcome) setShowWelcomePopup(true)
        }
      } catch {}
      finally { setWelcomeCheckDone(true) }
    }
    check()
  }, [isConnected, walletAddress, welcomeCheckDone])

  const handleWelcomeDismiss = async () => {
    if (!walletAddress) return
    try {
      await fetch("/api/player/welcome-seen", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      })
    } catch {}
    setShowWelcomePopup(false)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % ROLLING_IMAGES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto">
      <FirstTimeWelcomePopup
        isOpen={showWelcomePopup}
        onClose={() => setShowWelcomePopup(false)}
        onDismiss={handleWelcomeDismiss}
      />

      <motion.div className="max-w-md mx-auto p-4" initial={{ opacity: 1, y: 0 }}>
        {/* Logo */}
        <div className="text-center mb-6">
          <img
            src="/attached_assets/Logo Spektrum_1760084011907.png"
            alt="Spektrum Trading Card Game"
            className="w-full max-w-sm mx-auto h-auto"
            onError={e => { e.currentTarget.style.display = "none" }}
          />
          <p className="text-gray-400 text-sm mb-4 mt-2">Ready to battle in the world of Spektrum</p>

          {/* Image carousel */}
          <div
            className="relative h-64 bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl overflow-hidden mb-6 border-2 border-orange-500 shadow-lg"
            style={{ boxShadow: "0 0 30px rgba(249, 115, 22, 0.3)" }}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {ROLLING_IMAGES.map((image, index) => (
                <div key={index} className="w-full h-full flex-shrink-0 flex items-center justify-center bg-gray-900">
                  {imageLoadErrors.has(index) ? (
                    <div className="text-center text-orange-400">
                      <div className="text-4xl mb-2">🃏</div>
                      <p className="text-sm">Card {index + 1}</p>
                    </div>
                  ) : (
                    <img
                      src={image}
                      alt={`Card ${index + 1}`}
                      className="w-full h-full object-contain"
                      onError={() => setImageLoadErrors(prev => new Set(prev).add(index))}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Carousel dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {ROLLING_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all ${index === currentImageIndex ? "bg-orange-400 w-6" : "bg-gray-600 w-2"}`}
                  style={index === currentImageIndex ? { boxShadow: "0 0 10px rgba(249, 115, 22, 0.8)" } : {}}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Tutorial CTA */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/tutorial")}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-4 px-4 rounded-xl font-bold text-lg hover:from-yellow-400 hover:to-orange-500 transition-all flex items-center justify-center shadow-lg border border-orange-400"
            style={{ boxShadow: "0 0 25px rgba(249, 115, 22, 0.6)", letterSpacing: "0.05em" }}
          >
            <span className="text-orange-100">▶ START TUTORIAL</span>
          </button>
        </div>

        {/* Progress Tracker */}
        <ProgressTracker />
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 4: Wire page**

Replace `src/app/(main)/home/page.tsx`:

```tsx
import { HomeFeature } from "@/features/home"

export default function HomePage() {
  return <HomeFeature />
}
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/features/home/ src/components/shared/ProgressTracker.tsx src/components/shared/FirstTimeWelcomePopup.tsx src/app/\(main\)/home/page.tsx
git commit -m "feat: migrate Home page"
```

---

## Task 13: Shop Feature

**Files:**
- Modify: `src/features/shop/index.tsx`
- Modify: `src/app/(main)/shop/page.tsx`

- [ ] **Step 1: Create shop feature**

Replace `src/features/shop/index.tsx` with content adapted from `old-app/src/pages/ShopPage.tsx`:

```tsx
"use client"

import { useRouter } from "next/navigation"
import { BackButton } from "@/components/shared/BackButton"

export function ShopFeature() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto">
      <BackButton />
      <div className="max-w-md mx-auto p-4 w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-100">Shop</h1>
          <p className="text-gray-400 text-sm mb-4">Expand your collection and power up your gameplay</p>
        </div>

        <div
          className="bg-gray-900 rounded-xl p-6 border-2 border-orange-500 shadow-lg mb-6 flex flex-col space-y-3"
          style={{ boxShadow: "0 0 30px rgba(249, 115, 22, 0.2)" }}
        >
          {[
            { label: "Booster Packs", sub: "Randomized card packs", path: "/shop/booster" },
            { label: "Premade Decks", sub: "Ready-to-play decks", path: "/shop/premade" },
            { label: "Battle Sets", sub: "Themed card collections", path: "/shop/battle-sets" },
            { label: "My Inventory", sub: "View purchased items", path: "/inventory" },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white py-4 px-4 rounded-lg shadow-lg transition-all flex flex-col items-center border border-orange-400"
              style={{ boxShadow: "0 0 15px rgba(249, 115, 22, 0.4)" }}
            >
              <div className="text-lg font-bold mb-0.5">{item.label}</div>
              <div className="text-xs opacity-90">{item.sub}</div>
            </button>
          ))}

          <button
            onClick={() => window.open("https://www.tensor.trade/", "_blank")}
            className="w-full bg-gray-800 hover:bg-gray-700 text-orange-400 py-4 px-4 rounded-lg shadow-lg transition-all flex flex-col items-center border border-orange-500/50"
          >
            <div className="text-lg font-bold mb-0.5">NFT Marketplace</div>
            <div className="text-xs opacity-90 text-gray-400">Trade cards on Tensor</div>
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire page**

Replace `src/app/(main)/shop/page.tsx`:

```tsx
import { ShopFeature } from "@/features/shop"

export default function ShopPage() {
  return <ShopFeature />
}
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit
git add src/features/shop/index.tsx src/app/\(main\)/shop/page.tsx
git commit -m "feat: migrate Shop page"
```

---

## Task 14: Inventory Feature

**Files:**
- Modify: `src/features/inventory/index.tsx`
- Modify: `src/app/(main)/inventory/page.tsx`

- [ ] **Step 1: Create inventory feature**

Copy `old-app/src/pages/InventoryPage.tsx` and adapt it into `src/features/inventory/index.tsx`:

1. Add `"use client"` at top
2. Apply hook replacements (useNavigate → useRouter)
3. Apply import path changes per the cheat-sheet at the top of this plan
4. `import BackButton from '../components/BackButton'` → `import { BackButton } from '@/components/shared/BackButton'`
5. All card/modal component imports from old-app — copy those components to `src/components/shared/` following the same pattern (add `"use client"`, named export, fix paths)
6. Export as `export function InventoryFeature`

Components to copy if referenced in InventoryPage:
- `CardRewardPopup` → `src/components/shared/CardRewardPopup.tsx`
- `PurchaseConfirmationModal` → `src/components/shared/PurchaseConfirmationModal.tsx`
- `AnimatedCardReveal` → `src/components/shared/AnimatedCardReveal.tsx`
- `SpektrumPackOpener` → `src/components/shared/SpektrumPackOpener.tsx`
- `CollectionBadges` → `src/components/shared/CollectionBadges.tsx`

For each: copy from `old-app/src/components/<Name>.tsx`, add `"use client"`, fix import paths, named export.

- [ ] **Step 2: Wire page**

Replace `src/app/(main)/inventory/page.tsx`:

```tsx
import { InventoryFeature } from "@/features/inventory"

export default function InventoryPage() {
  return <InventoryFeature />
}
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit
git add src/features/inventory/ src/app/\(main\)/inventory/page.tsx src/components/shared/
git commit -m "feat: migrate Inventory page"
```

---

## Task 15: Library Feature

**Files:**
- Modify: `src/features/library/index.tsx` (create if not exists)
- Modify: `src/app/(main)/library/page.tsx`

- [ ] **Step 1: Create library feature**

Create `src/features/library/index.tsx` by adapting `old-app/src/pages/LibraryPage.tsx`:

1. Add `"use client"` at top
2. Apply hook replacements (useNavigate → useRouter)
3. `import { useDeckStore } from '../game/stores/useDeckStore'` → `import { useDeckStore } from '@/stores/useDeckStore'`
4. `import { cardNftService } from '../blockchain/solana/cardNftService'` → `import { cardNftService } from '@/features/blockchain/solana/cardNftService'`
5. `import SafeCardImage from '../components/SafeCardImage'` → `import { SafeCardImage } from '@/components/shared/SafeCardImage'`
6. `import { getRarityColor, getRarityTextColor, getOriginalCardId, countOwnedCopies } from '../game/utils/rarityUtils'` → `import { getRarityColor, getRarityTextColor, getOriginalCardId, countOwnedCopies } from '@/lib/rarityUtils'`
7. `import { Card, ElementType, AvatarCard } from '../game/data/cardTypes'` → `import type { Card, ElementType, AvatarCard } from '@/domain/game/types'`
8. Export as `export function LibraryFeature`

- [ ] **Step 2: Wire page**

Replace `src/app/(main)/library/page.tsx`:

```tsx
import { LibraryFeature } from "@/features/library"

export default function LibraryPage() {
  return <LibraryFeature />
}
```

- [ ] **Step 3: Create feature index**

Create `src/features/library/index.ts` (if the component is in `index.tsx`, this is automatic via the file).

- [ ] **Step 4: Verify and commit**

```bash
npx tsc --noEmit
git add src/features/library/ src/app/\(main\)/library/page.tsx
git commit -m "feat: migrate Library page"
```

---

## Task 16: Deck Builder Feature

**Files:**
- Modify: `src/features/deck-builder/index.tsx`
- Modify: `src/app/(main)/deck-builder/page.tsx`

- [ ] **Step 1: Create deck builder feature**

Replace `src/features/deck-builder/index.tsx` by adapting `old-app/src/pages/DeckBuilderPage.tsx`:

1. Add `"use client"` at top
2. Apply hook replacements (useNavigate → useRouter)
3. `import { useDeckStore, Deck } from '../game/stores/useDeckStore'` → `import { useDeckStore } from '@/stores/useDeckStore'` and `import type { Deck } from '@/stores/useDeckStore'`
4. `import { Card, ElementType, AvatarCard, RarityType } from '../game/data/cardTypes'` → `import type { Card, ElementType, AvatarCard, RarityType } from '@/domain/game/types'`
5. `import SafeCardImage from '../components/SafeCardImage'` → `import { SafeCardImage } from '@/components/shared/SafeCardImage'`
6. `import BackButton from '../components/BackButton'` → `import { BackButton } from '@/components/shared/BackButton'`
7. `import { getRarityColor, getRarityTextColor, getOriginalCardId, countOwnedCopies } from '../game/utils/rarityUtils'` → `import { getRarityColor, ... } from '@/lib/rarityUtils'`
8. `import { apiRequest } from '../lib/queryClient'` → `import { apiRequest } from '@/lib/queryClient'`
9. `import { useWalletStore } from '../game/stores/useWalletStore'` → `import { useWalletStore } from '@/stores/useWalletStore'`
10. Export as `export function DeckBuilderFeature`

- [ ] **Step 2: Wire page**

Replace `src/app/(main)/deck-builder/page.tsx`:

```tsx
import { DeckBuilderFeature } from "@/features/deck-builder"

export default function DeckBuilderPage() {
  return <DeckBuilderFeature />
}
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit
git add src/features/deck-builder/ src/app/\(main\)/deck-builder/page.tsx
git commit -m "feat: migrate Deck Builder page"
```

---

## Task 17: Achievements Feature

**Files:**
- Modify: `src/features/achievements/index.tsx` (create if not exists)
- Modify: `src/app/(main)/achievements/page.tsx`

- [ ] **Step 1: Create achievements feature**

Create `src/features/achievements/index.tsx` by adapting `old-app/src/pages/AchievementsPage.tsx`:

1. Add `"use client"` at top
2. `import { useAchievementsStore } from '../game/stores/useAchievementsStore'` → `import { useAchievementsStore } from '@/stores/useAchievementsStore'`
3. `import { ACHIEVEMENTS, AchievementCategory, getCategoryName, getRarityColor, getRarityBg } from '../game/data/achievements'` → `import { ACHIEVEMENTS, type AchievementCategory, getCategoryName, getRarityColor, getRarityBg } from '@/lib/achievements'`
4. Export as `export function AchievementsFeature`

- [ ] **Step 2: Wire page**

Replace `src/app/(main)/achievements/page.tsx`:

```tsx
import { AchievementsFeature } from "@/features/achievements"

export default function AchievementsPage() {
  return <AchievementsFeature />
}
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit
git add src/features/achievements/ src/app/\(main\)/achievements/page.tsx
git commit -m "feat: migrate Achievements page"
```

---

## Task 18: Settings Feature

**Files:**
- Modify: `src/features/settings/index.tsx` (create if not exists)
- Modify: `src/app/(main)/settings/page.tsx`

- [ ] **Step 1: Create settings feature**

Create `src/features/settings/index.tsx` by adapting `old-app/src/pages/SettingsPage.tsx`:

1. Add `"use client"` at top
2. `import { useNavigate } from 'react-router-dom'` → `import { useRouter } from 'next/navigation'`
3. `import { useAudio } from '../lib/stores/useAudio'` → `import { useAudio } from '@/stores/useAudioStore'`
4. `import { useUIScale } from '../lib/stores/useUIScale'` → `import { useUIScale } from '@/stores/useUIStore'`
5. `import { useWalletStore } from '../game/stores/useWalletStore'` → `import { useWalletStore } from '@/stores/useWalletStore'`
6. `import BackButton from '../components/BackButton'` → `import { BackButton } from '@/components/shared/BackButton'`
7. Export as `export function SettingsFeature`

- [ ] **Step 2: Wire page**

Replace `src/app/(main)/settings/page.tsx`:

```tsx
import { SettingsFeature } from "@/features/settings"

export default function SettingsPage() {
  return <SettingsFeature />
}
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit
git add src/features/settings/ src/app/\(main\)/settings/page.tsx
git commit -m "feat: migrate Settings page"
```

---

## Task 19: Multiplayer Feature

**Files:**
- Modify: `src/features/multiplayer/index.tsx` (create if not exists)
- Modify: `src/app/(main)/multiplayer/page.tsx`

- [ ] **Step 1: Create multiplayer feature**

Create `src/features/multiplayer/index.tsx` by adapting `old-app/src/pages/MultiplayerPage.tsx`:

1. Add `"use client"` at top
2. Apply hook replacements (useNavigate → useRouter, useLocation → usePathname)
3. `import { useMultiplayerStore } from '../stores/useMultiplayerStore'` → `import { useMultiplayerStore } from '@/stores/useMultiplayerStore'`
4. `import { useAudio } from '../lib/stores/useAudio'` → `import { useAudio } from '@/stores/useAudioStore'`
5. `import { useDeckStore } from '../game/stores/useDeckStore'` → `import { useDeckStore } from '@/stores/useDeckStore'`
6. `import BackButton from '../components/BackButton'` → `import { BackButton } from '@/components/shared/BackButton'`
7. `import SolanaWalletConnect from '../components/SolanaWalletConnect'` → `import { SolanaWalletConnect } from '@/components/shared/SolanaWalletConnect'`
8. `import AnteModeManager from '../components/ante/AnteModeManager'` — copy the ante components to `src/components/shared/ante/` following same pattern
9. Old-app UI components (ResponsiveGameLayout, AnimatedButton, Card3D, LoadingSpinner, AnimatedCounter, FadeInView) — copy from `old-app/src/components/ui/` to `src/components/ui/` (non-shadcn custom ones)
10. Export as `export function MultiplayerFeature`

- [ ] **Step 2: Copy ante components**

Copy these from `old-app/src/components/ante/`:
- `AnteModeManager.tsx` → `src/components/shared/ante/AnteModeManager.tsx`
- `AnteBattleResults.tsx` → `src/components/shared/ante/AnteBattleResults.tsx`
- `AnteBattleResultScreen.tsx` → `src/components/shared/ante/AnteBattleResultScreen.tsx`
- `MatchConfirmationModal.tsx` → `src/components/shared/ante/MatchConfirmationModal.tsx`
- `MatchmakingScreen.tsx` → `src/components/shared/ante/MatchmakingScreen.tsx`
- `WagerCardSelector.tsx` → `src/components/shared/ante/WagerCardSelector.tsx`

For each: add `"use client"`, fix import paths (stores → `@/stores/`, cards → `@/domain/game/types`), named export.

- [ ] **Step 3: Copy custom UI components**

Copy these from `old-app/src/components/ui/` to `src/components/ui/` (only the custom ones not already in shadcn):
- `AnimatedButton.tsx`
- `AnimatedCounter.tsx`
- `Card3D.tsx`
- `FadeInView.tsx`
- `FloatingNotification.tsx`
- `LoadingSpinner.tsx`
- `ProgressBar.tsx`
- `ResponsiveGameLayout.tsx`

For each: add `"use client"`, change default to named exports.

- [ ] **Step 4: Wire page**

Replace `src/app/(main)/multiplayer/page.tsx`:

```tsx
import { MultiplayerFeature } from "@/features/multiplayer"

export default function MultiplayerPage() {
  return <MultiplayerFeature />
}
```

- [ ] **Step 5: Verify and commit**

```bash
npx tsc --noEmit
git add src/features/multiplayer/ src/app/\(main\)/multiplayer/page.tsx src/components/shared/ante/ src/components/ui/
git commit -m "feat: migrate Multiplayer page with ante mode components"
```

---

## Task 20: Trading Feature

**Files:**
- Modify: `src/features/trading/index.tsx` (create if not exists)
- Modify: `src/app/(main)/trading/page.tsx`

- [ ] **Step 1: Create trading feature**

Create `src/features/trading/index.tsx` by adapting `old-app/src/pages/TradingPage.tsx`:

1. Add `"use client"` at top
2. `import { useWalletStore } from '../game/stores/useWalletStore'` → `import { useWalletStore } from '@/stores/useWalletStore'`
3. `import { cardNftService, CardNftMetadata } from '../blockchain/solana/cardNftService'` → `import { cardNftService, type CardNftMetadata } from '@/features/blockchain/solana/cardNftService'`
4. `import { marketplaceService, MarketplaceListing } from '../blockchain/solana/marketplaceService'` → `import { marketplaceService, type MarketplaceListing } from '@/features/blockchain/solana/marketplaceService'`
5. `import { Card } from '../game/data/cardTypes'` → `import type { Card } from '@/domain/game/types'`
6. `import SafeCardImage from '../components/SafeCardImage'` → `import { SafeCardImage } from '@/components/shared/SafeCardImage'`
7. Export as `export function TradingFeature`

- [ ] **Step 2: Wire page**

Replace `src/app/(main)/trading/page.tsx`:

```tsx
import { TradingFeature } from "@/features/trading"

export default function TradingPage() {
  return <TradingFeature />
}
```

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit
git add src/features/trading/ src/app/\(main\)/trading/page.tsx
git commit -m "feat: migrate Trading page"
```

---

## Task 21: Tutorial Feature

**Files:**
- Modify: `src/features/tutorial/index.tsx`
- Modify: `src/app/(main)/tutorial/page.tsx`

- [ ] **Step 1: Create tutorial feature**

Replace `src/features/tutorial/index.tsx` by adapting `old-app/src/pages/TutorialPage.tsx`:

1. Add `"use client"` at top
2. Apply hook replacements (useNavigate → useRouter)
3. `import { useDeckStore } from '../game/stores/useDeckStore'` → `import { useDeckStore } from '@/stores/useDeckStore'`
4. `import { useAchievementsStore } from '../game/stores/useAchievementsStore'` → `import { useAchievementsStore } from '@/stores/useAchievementsStore'`
5. `import { useWalletStore } from '../game/stores/useWalletStore'` → `import { useWalletStore } from '@/stores/useWalletStore'`
6. `import Card2D from '../game/components2D/Card2D'` → handled in Task 22 — for now import from `@/features/game/components/Card2D`
7. `import TheRitualModal from '../components/TheRitualModal'` → copy to `src/components/shared/TheRitualModal.tsx` (add `"use client"`, named export)
8. `import { Card } from '../game/data/cardTypes'` → `import type { Card } from '@/domain/game/types'`
9. Export as `export function TutorialFeature`

- [ ] **Step 2: Copy TheRitualModal**

Copy `old-app/src/components/TheRitualModal.tsx` to `src/components/shared/TheRitualModal.tsx`:
1. Add `"use client"` at top
2. Named export: `export function TheRitualModal`
3. Fix any store imports using the cheat-sheet

- [ ] **Step 3: Wire page**

Replace `src/app/(main)/tutorial/page.tsx`:

```tsx
import { TutorialFeature } from "@/features/tutorial"

export default function TutorialPage() {
  return <TutorialFeature />
}
```

- [ ] **Step 4: Verify and commit**

```bash
npx tsc --noEmit
git add src/features/tutorial/ src/app/\(main\)/tutorial/page.tsx src/components/shared/TheRitualModal.tsx
git commit -m "feat: migrate Tutorial page"
```

---

## Task 22: Game Feature (Stores + 2D Components + Page)

**Files:**
- Create: `src/features/game/stores/useGameMode.ts`
- Create: `src/features/game/stores/useGameExitStore.ts`
- Create: `src/features/game/stores/useGameUIStore.ts`
- Create: `src/features/game/stores/useAnimationStore.ts`
- Create: `src/features/game/stores/useSpellEffectsStore.ts`
- Create: `src/features/game/components/` (all 2D game components)
- Modify: `src/features/game/index.tsx`
- Modify: `src/app/(main)/game/page.tsx`

- [ ] **Step 1: Create game-scoped stores directory**

```bash
mkdir -p src/features/game/stores src/features/game/components
```

- [ ] **Step 2: Migrate game-scoped stores**

For each store below, copy from `old-app/src/game/stores/` to `src/features/game/stores/` and apply import path fixes:

**`useGameMode.ts`** — copy `old-app/src/game/stores/useGameMode.ts`:
- `import { Card } from '../data/cardTypes'` → `import type { Card } from '@/domain/game/types'`

**`useGameExitStore.ts`** — copy `old-app/src/game/stores/useGameExitStore.ts` (no external imports typically)

**`useGameUIStore.ts`** — copy `old-app/src/game/stores/useGameUIStore.ts`:
- `import { Card } from '../data/cardTypes'` → `import type { Card } from '@/domain/game/types'`

**`useAnimationStore.ts`** — copy `old-app/src/game/stores/useAnimationStore.ts`:
- `import { Card } from '../data/cardTypes'` → `import type { Card } from '@/domain/game/types'`

**`useSpellEffectsStore.ts`** — copy `old-app/src/game/stores/useSpellEffectsStore.ts`:
- `import { Card } from '../data/cardTypes'` → `import type { Card } from '@/domain/game/types'`

- [ ] **Step 3: Migrate 2D game components**

For each file in `old-app/src/game/components2D/`, copy to `src/features/game/components/` and apply:

1. Add `"use client"` at top
2. `import { Card, AvatarCard, ... } from '../../data/cardTypes'` → `import type { Card, AvatarCard, ... } from '@/domain/game/types'`
3. Store imports from `'../stores/useXxx'` → `import { useXxx } from '@/features/game/stores/useXxx'`
4. Store imports from `'../../game/stores/'` or `'../../stores/'` → `@/stores/` or `@/features/game/stores/`
5. `import { ... } from '../../utils/rarityUtils'` → `import { ... } from '@/lib/rarityUtils'`
6. Change default exports to named exports

Files to migrate:
- `GameBoard2D.tsx` → `src/features/game/components/GameBoard2D.tsx`
- `Card2D.tsx` → `src/features/game/components/Card2D.tsx`
- `Hand2D.tsx` → `src/features/game/components/Hand2D.tsx`
- `PlayerStats2D.tsx` → `src/features/game/components/PlayerStats2D.tsx`
- `GameControls2D.tsx` → `src/features/game/components/GameControls2D.tsx`
- `CardRevealModal.tsx` → `src/features/game/components/CardRevealModal.tsx`
- `DiscardSelectionModal.tsx` → `src/features/game/components/DiscardSelectionModal.tsx`
- `PlacementModal.tsx` → `src/features/game/components/PlacementModal.tsx`
- `TargetSelector.tsx` → `src/features/game/components/TargetSelector.tsx`
- `SpellEffectAnimation.tsx` → `src/features/game/components/SpellEffectAnimation.tsx`
- `CardDrawEffect.tsx` → `src/features/game/components/CardDrawEffect.tsx`
- `CardPlacementEffect.tsx` → `src/features/game/components/CardPlacementEffect.tsx`
- `CardActivationPause.tsx` → `src/features/game/components/CardActivationPause.tsx`
- `EquipmentActivationButton.tsx` → `src/features/game/components/EquipmentActivationButton.tsx`
- `PreviewButton.tsx` → `src/features/game/components/PreviewButton.tsx`

- [ ] **Step 4: Create game feature index**

Replace `src/features/game/index.tsx` with:

```tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAudio } from "@/stores/useAudioStore"
import { useMultiplayerStore } from "@/stores/useMultiplayerStore"
import { useGameMode } from "@/features/game/stores/useGameMode"
import { useGameExitStore } from "@/features/game/stores/useGameExitStore"
import { useAnteBattleStore } from "@/features/game/stores/useAnteBattleStore"
import { GameBoard2D } from "@/features/game/components/GameBoard2D"
import { LoadingScreen } from "@/components/shared/LoadingScreen"

export function GameFeature() {
  const router = useRouter()
  const { sfxEnabled, toggleSfx } = useAudio()
  const gameMode = useGameMode()
  const [isLoading, setIsLoading] = useState(true)
  const anteBattle = useAnteBattleStore()

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleForfeit = () => {
    const { socket, isMultiplayerSession } = useMultiplayerStore.getState()
    if (isMultiplayerSession && socket?.connected) {
      socket.emit("forfeit_game")
    }

    if (anteBattle.isAnteMode && anteBattle.opponentId) {
      anteBattle.reportVictory(anteBattle.opponentId)
      toast.error("You forfeited. Your opponent wins the ante card!")
    } else {
      toast.info("You forfeited the match")
    }

    gameMode.resetState()
    anteBattle.resetAnteMode()
    router.push("/home")
  }

  if (isLoading) {
    return <LoadingScreen message="Preparing your battle..." />
  }

  return (
    <div className="w-full h-screen flex items-center justify-center p-2 pb-28">
      <div className="w-full h-full max-w-full rounded-lg overflow-hidden shadow-2xl">
        <GameBoard2D
          onAction={(action, data) => console.log(action, data)}
          onForfeit={handleForfeit}
        />
      </div>
      <button
        onClick={toggleSfx}
        className="absolute top-2 right-2 z-50 p-2 bg-opacity-70 bg-gray-800 text-white rounded-full"
        style={{ width: 40, height: 40, display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        {!sfxEnabled ? "🔇" : "🔊"}
      </button>
    </div>
  )
}

export { useGameStore } from "./store"
export { useGame } from "./hooks/useGame"
export {
  useGameState,
  useCurrentPlayer,
  useOpponent,
  useGamePhase,
  useIsAIThinking,
} from "./hooks/useGameState"
export type { GameState, Player, Card, AvatarCard, AIDifficulty } from "./types"
```

**Copy `useAnteBattleStore`** before creating the feature index:

Copy `old-app/src/game/stores/useAnteBattleStore.ts` to `src/features/game/stores/useAnteBattleStore.ts` and apply:
```ts
// BEFORE
import { Card } from '../data/cardTypes'
import { useWalletStore } from './useWalletStore'
import { useDeckStore } from './useDeckStore'
// AFTER
import type { Card } from '@/domain/game/types'
import { useWalletStore } from '@/stores/useWalletStore'
import { useDeckStore } from '@/stores/useDeckStore'
```

- [ ] **Step 5: Wire page**

Replace `src/app/(main)/game/page.tsx`:

```tsx
import { GameFeature } from "@/features/game"

export default function GamePage() {
  return <GameFeature />
}
```

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
```

Fix any type errors — the game components are the most complex, expect some type mismatches between old `cardTypes` and new `@/domain/game/types`. When there's a mismatch, prefer the new domain types and update the component prop accordingly.

- [ ] **Step 7: Commit**

```bash
git add src/features/game/ src/app/\(main\)/game/page.tsx
git commit -m "feat: migrate Game page with 2D board components and game stores"
```

---

## Task 23: Final Verification & Export Cleanup

**Files:**
- Various `src/components/shared/index.ts` (update exports)
- Various feature `index.ts` barrel files

- [ ] **Step 1: Full type check**

```bash
npx tsc --noEmit 2>&1 | head -50
```

Fix any remaining errors.

- [ ] **Step 2: Build check**

```bash
npm run build
```

Fix any build errors — common ones:
- Missing `"use client"` on files using hooks
- Server component importing client component without boundary
- Missing exports

- [ ] **Step 3: Update shared index exports**

Ensure `src/components/shared/index.ts` exports every component added across all tasks:

```ts
export { BackButton } from "./BackButton"
export { LoadingScreen } from "./LoadingScreen"
export { SafeCardImage } from "./SafeCardImage"
export { SolanaWalletConnect } from "./SolanaWalletConnect"
export { WalletSelectorModal } from "./WalletSelectorModal"
export { AppBootstrap } from "./AppBootstrap"
export { ProgressTracker } from "./ProgressTracker"
export { FirstTimeWelcomePopup } from "./FirstTimeWelcomePopup"
export { CardRewardPopup } from "./CardRewardPopup"
export { PurchaseConfirmationModal } from "./PurchaseConfirmationModal"
export { AnimatedCardReveal } from "./AnimatedCardReveal"
export { SpektrumPackOpener } from "./SpektrumPackOpener"
export { CollectionBadges } from "./CollectionBadges"
export { TheRitualModal } from "./TheRitualModal"
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete primary-nav UI migration from old-app"
```
