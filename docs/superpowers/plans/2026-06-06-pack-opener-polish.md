# Pack Opener Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** TCG-Pocket-style tap-through card reveal with a match-cut 3D→2D crossfade, tier artwork + foil on the pack, jagged tear edge, and idle drag hints.

**Architecture:** A new pure `revealLogic.ts` state machine drives a new `CardRevealStack` DOM component (framer-motion `layoutId` moves cards stack → mini-row → summary grid). `CardEjection` converges cards into a centered 3D stack whose end frame matches the 2D stack; `PackOpener3D` crossfades the canvas out over the mounted 2D stack. `BoosterPackModel` gains an artwork decal (clipped like the pack halves), foil material settings + a PMREM room environment, and an `onBeforeCompile` jagged-discard band along the tear line whose uniforms track the flying strip.

**Tech Stack:** Next.js (app router), React 19, three ^0.184, @react-three/fiber 9, @react-three/drei 10, framer-motion, vitest, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-06-06-pack-opener-polish-design.md`

**Critical invariants (from PR #2 — do not regress):**
- Suspense stays INSIDE `<Canvas>` (`PackScene.tsx`). Never let asset loading suspend the Canvas itself — permanent WebGL context loss.
- `useClippedPack` uses `multiplyScalar` (not `setScalar`); cloned materials disposed on unmount.
- Tailwind v4: no `bg-opacity-*`; use slash syntax (`bg-black/95`).
- Do NOT touch `src/features/settings/index.tsx` (user's uncommitted work).
- Conventional Commits. Mobile-first, `max-w-sm` constraint.

**Gates after every task:** `npm run typecheck && npm run test` (full `npm run build` + eslint in final task).

---

### Task 1: Shared rarity styles module

Extract rarity constants + `PackCard` out of `SpektrumPackOpener.tsx` so `CardRevealStack` can use them without a circular import.

**Files:**
- Create: `src/components/shared/rarityStyles.ts`
- Modify: `src/components/shared/SpektrumPackOpener.tsx`

- [ ] **Step 1: Create `src/components/shared/rarityStyles.ts`**

```ts
export type RarityType = 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Mythic';

export interface PackCard {
  name: string;
  art?: string;
  imagePath?: string;
  rarity?: RarityType;
}

export const RARITY_GLOW: Record<string, string> = {
  Mythic:       '0 0 28px 6px rgba(255,215,0,0.85)',
  'Super Rare': '0 0 22px 4px rgba(168,85,247,0.75)',
  Rare:         '0 0 18px 3px rgba(59,130,246,0.65)',
  Uncommon:     '0 0 14px 2px rgba(34,197,94,0.55)',
  Common:       'none',
};

export const RARITY_BORDER: Record<string, string> = {
  Mythic:       '#FFD700',
  'Super Rare': '#A855F7',
  Rare:         '#3B82F6',
  Uncommon:     '#22C55E',
  Common:       '#6B7280',
};
```

- [ ] **Step 2: Update `SpektrumPackOpener.tsx` to consume + re-export**

Delete its local `RarityType`, `PackCard`, `RARITY_GLOW`, `RARITY_BORDER` definitions (lines 6–40) and add at the top:

```ts
import { RARITY_BORDER, RARITY_GLOW, type PackCard } from './rarityStyles';

export type { PackCard };
```

(`PackOpener3D.tsx` imports `PackCard` from `SpektrumPackOpener` — the re-export keeps that working.)

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run test`
Expected: PASS (35 existing tests across 3 files untouched).

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/rarityStyles.ts src/components/shared/SpektrumPackOpener.tsx
git commit -m "refactor(pack-opener): extract shared rarity styles module"
```

---

### Task 2: `revealLogic` state machine (TDD)

Pure tap-through state machine, mirrors the `tearLogic.ts` pattern.

**Files:**
- Create: `src/components/shared/revealLogic.ts`
- Test: `src/components/shared/__tests__/revealLogic.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/shared/__tests__/revealLogic.test.ts
import { describe, expect, it } from 'vitest';
import { advanceReveal, createRevealState } from '../revealLogic';

describe('createRevealState', () => {
  it('starts with all cards face-down and index 0', () => {
    const s = createRevealState(5);
    expect(s.phases).toEqual(['back', 'back', 'back', 'back', 'back']);
    expect(s.current).toBe(0);
    expect(s.done).toBe(false);
  });

  it('is immediately done for an empty pack', () => {
    expect(createRevealState(0).done).toBe(true);
  });
});

describe('advanceReveal', () => {
  it('first advance flips the top card', () => {
    const s = advanceReveal(createRevealState(3));
    expect(s.phases[0]).toBe('flipped');
    expect(s.current).toBe(0);
    expect(s.done).toBe(false);
  });

  it('second advance moves the flipped card aside and exposes the next', () => {
    const s = advanceReveal(advanceReveal(createRevealState(3)));
    expect(s.phases[0]).toBe('aside');
    expect(s.phases[1]).toBe('back');
    expect(s.current).toBe(1);
    expect(s.done).toBe(false);
  });

  it('completes after the last card moves aside', () => {
    let s = createRevealState(2);
    s = advanceReveal(s); // flip 0
    s = advanceReveal(s); // aside 0
    s = advanceReveal(s); // flip 1
    expect(s.done).toBe(false);
    s = advanceReveal(s); // aside 1
    expect(s.done).toBe(true);
    expect(s.phases).toEqual(['aside', 'aside']);
  });

  it('is a no-op once done', () => {
    let s = createRevealState(1);
    s = advanceReveal(advanceReveal(s));
    expect(advanceReveal(s)).toBe(s);
  });

  it('does not mutate the input state', () => {
    const s = createRevealState(2);
    advanceReveal(s);
    expect(s.phases[0]).toBe('back');
    expect(s.current).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/shared/__tests__/revealLogic.test.ts`
Expected: FAIL — `Cannot find module '../revealLogic'`

- [ ] **Step 3: Implement `src/components/shared/revealLogic.ts`**

```ts
export type CardPhase = 'back' | 'flipped' | 'aside';

export interface RevealState {
  phases: CardPhase[];
  /** Index of the top (interactive) card == number of cards already aside. */
  current: number;
  done: boolean;
}

export function createRevealState(count: number): RevealState {
  return {
    phases: new Array<CardPhase>(count).fill('back'),
    current: 0,
    done: count === 0,
  };
}

/** One tap: face-down top card flips; a flipped top card moves aside. */
export function advanceReveal(state: RevealState): RevealState {
  if (state.done) return state;
  const phases = [...state.phases];
  if (phases[state.current] === 'back') {
    phases[state.current] = 'flipped';
    return { ...state, phases };
  }
  phases[state.current] = 'aside';
  const current = state.current + 1;
  return { phases, current, done: current >= phases.length };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/shared/__tests__/revealLogic.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/revealLogic.ts src/components/shared/__tests__/revealLogic.test.ts
git commit -m "feat(pack-opener): add tap-through reveal state machine"
```

---

### Task 3: `CardRevealStack` component

Tap-through UI: centered stack → click 1 flips (rarity glow) → click 2 slides card into a mini-row up top (framer-motion `layoutId` handles the smooth move) → after last card, all cards fan into a summary grid → tap continues.

**Files:**
- Create: `src/components/shared/CardRevealStack.tsx`

- [ ] **Step 1: Create `src/components/shared/CardRevealStack.tsx`**

```tsx
"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RARITY_BORDER, RARITY_GLOW, type PackCard } from './rarityStyles';
import { advanceReveal, createRevealState, type RevealState } from './revealLogic';

interface CardRevealStackProps {
  cards: PackCard[];
  onComplete: () => void;
}

function CardFace({ card }: { card: PackCard }) {
  const src = card.art || card.imagePath;
  return src ? (
    <img src={src} alt={card.name} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full bg-gray-800 flex items-center justify-center px-1">
      <span className="text-[10px] text-gray-300 leading-tight text-center">{card.name}</span>
    </div>
  );
}

/**
 * TCG-Pocket-style reveal: tap the top card to flip it, tap again to slide it
 * into the mini-row above. Revealed cards fan into a summary grid at the end.
 * Content-only — the parent provides the fullscreen backdrop.
 */
export function CardRevealStack({ cards, onComplete }: CardRevealStackProps) {
  const [state, setState] = useState<RevealState>(() => createRevealState(cards.length));

  const handleAdvance = () => setState((s) => advanceReveal(s));

  if (state.done) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-6 h-full w-full max-w-sm mx-auto cursor-pointer"
        onClick={onComplete}
      >
        <motion.h2
          className="text-2xl sm:text-3xl font-bold text-white tracking-wide"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Cards Revealed!
        </motion.h2>
        <div className="flex justify-center flex-wrap gap-2">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              layoutId={`reveal-card-${i}`}
              className="relative w-20 h-28 rounded-lg overflow-hidden border-2 shadow-xl"
              style={{
                borderColor: RARITY_BORDER[card.rarity ?? 'Common'] ?? RARITY_BORDER.Common,
                boxShadow: RARITY_GLOW[card.rarity ?? 'Common'] ?? 'none',
              }}
            >
              <CardFace card={card} />
            </motion.div>
          ))}
        </div>
        <p className="text-sm text-orange-300 animate-pulse">Tap to continue</p>
      </div>
    );
  }

  const topIndex = state.current;
  const topFlipped = state.phases[topIndex] === 'flipped';

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full max-w-sm mx-auto">
      {/* mini-row: already-revealed cards */}
      <div className="absolute top-4 inset-x-0 flex justify-center gap-1.5">
        {cards.map((card, i) =>
          state.phases[i] === 'aside' ? (
            <motion.div
              key={i}
              layoutId={`reveal-card-${i}`}
              className="w-10 h-14 rounded overflow-hidden border shadow-md"
              style={{ borderColor: RARITY_BORDER[card.rarity ?? 'Common'] ?? RARITY_BORDER.Common }}
            >
              <CardFace card={card} />
            </motion.div>
          ) : null
        )}
      </div>

      {/* stack */}
      <div className="relative w-40 h-56" style={{ perspective: 1000 }}>
        {cards.map((card, i) => {
          if (state.phases[i] === 'aside') return null;
          const depth = i - topIndex; // 0 = top card
          const isTop = i === topIndex;
          const flipped = state.phases[i] === 'flipped';
          return (
            <motion.div
              key={i}
              layoutId={`reveal-card-${i}`}
              className={`absolute inset-0 ${isTop ? 'cursor-pointer' : ''}`}
              style={{ zIndex: cards.length - i }}
              animate={{ rotate: depth * 2, y: depth * 4 }}
              onClick={isTop ? handleAdvance : undefined}
            >
              <motion.div
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <div
                  className="absolute inset-0 rounded-lg overflow-hidden shadow-xl"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <img src="/cards/card_back.png" alt="Card Back" className="w-full h-full object-cover" />
                </div>
                <div
                  className="absolute inset-0 rounded-lg overflow-hidden shadow-xl border-2"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderColor: RARITY_BORDER[card.rarity ?? 'Common'] ?? RARITY_BORDER.Common,
                    boxShadow: flipped ? RARITY_GLOW[card.rarity ?? 'Common'] ?? 'none' : 'none',
                  }}
                >
                  <CardFace card={card} />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <p className="absolute bottom-6 inset-x-0 text-center text-orange-300 text-sm animate-pulse pointer-events-none">
        {topFlipped ? 'Tap to continue' : 'Tap the card'}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck && npm run test`
Expected: PASS (component not unit-tested per project pattern — pure logic is; visual check happens in Task 9).

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/CardRevealStack.tsx
git commit -m "feat(pack-opener): add tap-through CardRevealStack component"
```

---

### Task 4: Integrate reveal — rework `SpektrumPackOpener` + `PackOpener3D` crossfade

One atomic task (both files reference `initialStage`; changing them separately breaks typecheck between commits).

`SpektrumPackOpener` (CSS fallback path): keeps `opening` → `tearing`, then renders `CardRevealStack` instead of the auto-flip row. `initialStage` prop is removed.

`PackOpener3D` (3D path): on `reveal` stage, mounts `CardRevealStack` under the canvas and fades the canvas to 0 over 350 ms (match-cut), then unmounts the canvas.

**Files:**
- Modify: `src/components/shared/SpektrumPackOpener.tsx`
- Modify: `src/components/pack-opener-3d/PackOpener3D.tsx`

- [ ] **Step 1: Rewrite `SpektrumPackOpener.tsx`**

Full replacement:

```tsx
"use client"

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CardRevealStack } from './CardRevealStack';
import { type PackCard } from './rarityStyles';

export type { PackCard };

export type Stage = 'opening' | 'tearing' | 'reveal';

interface SpektrumPackOpenerProps {
  packImageUrl: string;
  packName: string;
  cards: PackCard[];
  onAnimationComplete: () => void;
}

export const SpektrumPackOpener: React.FC<SpektrumPackOpenerProps> = ({
  packImageUrl,
  packName,
  cards,
  onAnimationComplete,
}) => {
  const [stage, setStage] = useState<Stage>('opening');

  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const angle = -90 + (i - 5.5) * 18;
        const dist = 70 + Math.floor(Math.random() * 80);
        return {
          left: `${(i / 11) * 100}%`,
          dx: Math.cos((angle * Math.PI) / 180) * dist,
          dy: Math.sin((angle * Math.PI) / 180) * dist,
          delay: i * 0.03,
        };
      }),
    []
  );

  useEffect(() => {
    if (stage !== 'opening') return;
    const t = setTimeout(() => setStage('tearing'), 600);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'tearing') return;
    const t = setTimeout(() => setStage('reveal'), 700);
    return () => clearTimeout(t);
  }, [stage]);

  const packW = 'w-36 sm:w-44';
  const packH = 'h-48 sm:h-56';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 overflow-hidden">
      <div className="relative flex flex-col items-center w-full max-w-3xl h-full">

        {stage === 'opening' && (
          <div className="relative flex flex-1 items-center justify-center">
            <motion.div
              className="absolute rounded-full"
              style={{ width: 220, height: 280, background: 'radial-gradient(circle, rgba(251,146,60,0.35) 0%, transparent 70%)' }}
              animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.img
              src={packImageUrl}
              alt={packName}
              className={`${packW} ${packH} object-contain rounded-lg shadow-2xl relative z-10`}
              animate={{ rotate: [0, -4, 4, -3, 3, -1, 0], scale: [1, 1.06, 1] }}
              transition={{ duration: 0.55, ease: 'easeInOut' }}
            />
          </div>
        )}

        {stage === 'tearing' && (
          <div className="flex flex-1 items-center justify-center">
            <div className={`relative ${packW} ${packH}`}>
              <div className="absolute inset-0 flex items-end justify-center pb-2" style={{ zIndex: 2 }}>
                <div className="flex justify-center gap-1">
                  {cards.map((_, i) => (
                    <div key={i} className="w-10 h-14 rounded shadow-lg overflow-hidden">
                      <img src="/cards/card_back.png" alt="Card" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              <motion.div
                className={`absolute inset-0 ${packW} ${packH} overflow-hidden`}
                style={{ clipPath: 'polygon(0 25%, 100% 15%, 100% 100%, 0 100%)', zIndex: 8 }}
                animate={{ y: 90, opacity: 0 }}
                transition={{ duration: 0.65, ease: 'easeIn' }}
              >
                <img src={packImageUrl} alt={packName} className="w-full h-full object-contain" />
              </motion.div>

              <motion.div
                className={`absolute inset-0 ${packW} ${packH} overflow-hidden`}
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 15%, 0 25%)', zIndex: 9 }}
                animate={{ y: -280, x: 160, rotate: 28, opacity: 0 }}
                transition={{ duration: 0.55, ease: 'easeIn' }}
              >
                <img src={packImageUrl} alt={packName} className="w-full h-full object-contain" />
              </motion.div>

              <div className="absolute inset-0" style={{ zIndex: 20 }}>
                {particles.map((p, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-yellow-400"
                    style={{ left: p.left, top: '22%', marginLeft: -4, marginTop: -4 }}
                    initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.5, delay: p.delay, ease: 'easeOut' }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {stage === 'reveal' && (
          <CardRevealStack cards={cards} onComplete={onAnimationComplete} />
        )}
      </div>
    </div>
  );
};

export default SpektrumPackOpener;
```

- [ ] **Step 2: Rework `PackOpener3D.tsx` for the crossfade**

Changes: import `CardRevealStack` + `motion`; add `canvasGone` state; delete the `stage === 'reveal'` early-return branch (lines 114–125); keep the canvas mounted during `reveal` inside a fading `motion.div`; remove the now-unused `initialStage` usage.

New imports (replace the framer-motion + SpektrumPackOpener import lines):

```tsx
import { animate, motion, useMotionValue } from 'framer-motion';
import { SpektrumPackOpener } from '@/components/shared/SpektrumPackOpener';
import { type PackCard } from '@/components/shared/rarityStyles';
import { CardRevealStack } from '@/components/shared/CardRevealStack';
```

Add state next to the other `useState` calls:

```tsx
const [canvasGone, setCanvasGone] = useState(false);
```

Delete the `if (stage === 'reveal')` early-return block entirely. Replace the final `return` with:

```tsx
const interactive = stage === 'idle' || stage === 'tearing';
const revealing = stage === 'reveal';

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 overflow-hidden">
    <div className="relative w-full max-w-sm h-[70vh]">
      {revealing && (
        <CardRevealStack cards={cards} onComplete={onAnimationComplete} />
      )}

      {/* Canvas stays mounted through the crossfade so the eject end frame
          fades over the matching 2D stack (match-cut), then unmounts. */}
      {!canvasGone && (
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: revealing ? 0 : 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          onAnimationComplete={() => {
            if (revealing) setCanvasGone(true);
          }}
          style={{ pointerEvents: revealing ? 'none' : 'auto' }}
        >
          <PackErrorBoundary onError={handleFail}>
            <PackScene>
              <BoosterPackModel tearProgress={tearProgress} topFly={topFly} />
              <CardEjection
                count={cards.length}
                active={stage === 'ejecting'}
                onComplete={handleEjectComplete}
              />
              <ModelReady onReady={handleModelReady} />
            </PackScene>
          </PackErrorBoundary>
        </motion.div>
      )}

      {!modelReady && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-400 border-t-transparent" />
        </div>
      )}

      {!revealing && (
        <TearGestureOverlay
          tearProgress={tearProgress}
          enabled={interactive && modelReady}
          onTearStart={() => setStage('tearing')}
          onTearComplete={handleTearComplete}
          onTearReset={() => setStage('idle')}
        />
      )}

      {interactive && modelReady && (
        <p className="absolute top-4 inset-x-0 text-center text-orange-300 text-sm animate-pulse pointer-events-none">
          Slide the top strip to tear open →
        </p>
      )}
    </div>
  </div>
);
```

Keep the fallback early-return (`!webglSupported || failed` → `<SpektrumPackOpener …/>`) — just without `initialStage` (it no longer exists).

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run test && npx eslint src/components/pack-opener-3d/ src/components/shared/`
Expected: PASS, no lint errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/SpektrumPackOpener.tsx src/components/pack-opener-3d/PackOpener3D.tsx
git commit -m "feat(pack-opener): tap-through reveal with 3D-to-2D crossfade"
```

---

### Task 5: Ejection converge path (TDD) + `CardEjection` rework

Cards rise out of the pack mouth, then converge into a centered stack facing the camera. End frame ≈ the 2D `CardRevealStack` (card 1×1.4 world units at z=1.3 with camera z=6/fov 40 ≈ a 160×224 px card in the 70vh container).

**Files:**
- Create: `src/components/pack-opener-3d/ejectionPath.ts`
- Test: `src/components/pack-opener-3d/__tests__/ejectionPath.test.ts`
- Modify: `src/components/pack-opener-3d/CardEjection.tsx`

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/pack-opener-3d/__tests__/ejectionPath.test.ts
import { describe, expect, it } from 'vitest';
import {
  cardProgress,
  ejectPose,
  EJECT_DURATION,
  STACK_TILT,
  STACK_Z,
  STACK_Z_GAP,
  STAGGER,
} from '../ejectionPath';

describe('cardProgress', () => {
  it('staggers cards by STAGGER seconds', () => {
    expect(cardProgress(0, 0)).toBe(0);
    expect(cardProgress(STAGGER, 1)).toBe(0);
    expect(cardProgress(STAGGER + EJECT_DURATION, 1)).toBe(1);
  });

  it('clamps to [0, 1]', () => {
    expect(cardProgress(-1, 0)).toBe(0);
    expect(cardProgress(99, 0)).toBe(1);
  });
});

describe('ejectPose', () => {
  it('starts inside the pack mouth, hidden', () => {
    const p = ejectPose(0, 0, 5);
    expect(p.visible).toBe(false);
    expect(p.y).toBeCloseTo(-0.4);
    expect(p.z).toBeCloseTo(0.1);
  });

  it('ends centered at stack depth with its tilt', () => {
    const p = ejectPose(1, 2, 5); // middle card of 5 → tilt 0
    expect(p.x).toBe(0);
    expect(p.y).toBeCloseTo(0);
    expect(p.z).toBeCloseTo(STACK_Z + 2 * STACK_Z_GAP);
    expect(p.rotZ).toBeCloseTo(0);
  });

  it('tilts outer cards and z-orders card 0 on top', () => {
    const first = ejectPose(1, 0, 5);
    const last = ejectPose(1, 4, 5);
    expect(first.rotZ).toBeCloseTo(-2 * STACK_TILT);
    expect(last.rotZ).toBeCloseTo(2 * STACK_TILT);
    expect(first.z).toBeGreaterThan(last.z); // card 0 closest to camera = top
  });

  it('rises before it converges', () => {
    const mid = ejectPose(0.4, 0, 5);
    expect(mid.y).toBeGreaterThan(0.5); // up out of the pack
    expect(mid.z).toBeLessThan(1);      // not yet at stack depth
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/pack-opener-3d/__tests__/ejectionPath.test.ts`
Expected: FAIL — `Cannot find module '../ejectionPath'`

- [ ] **Step 3: Implement `src/components/pack-opener-3d/ejectionPath.ts`**

```ts
export const EJECT_DURATION = 0.7; // seconds per card
export const STAGGER = 0.12;       // seconds between cards

/** End-frame stack tuned to match the 2D CardRevealStack (see plan header). */
export const STACK_Z = 1.3;        // camera at z=6, fov 40
export const STACK_TILT = 0.035;   // rad ≈ 2°, matches the 2D `rotate: depth * 2`
export const STACK_Z_GAP = 0.012;  // per-card depth so card 0 lands on top

export interface EjectPose {
  x: number;
  y: number;
  z: number;
  rotZ: number;
  visible: boolean;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function cardProgress(elapsed: number, index: number): number {
  return Math.min(1, Math.max(0, (elapsed - index * STAGGER) / EJECT_DURATION));
}

/**
 * Two-beat path: rise out of the pack mouth (first half of the ease), then
 * converge into a centered stack facing the camera (second half). The end
 * frame approximates the 2D CardRevealStack so the crossfade reads as a
 * match-cut.
 */
export function ejectPose(t: number, index: number, count: number): EjectPose {
  const e = easeOutCubic(t);
  const rise = Math.min(1, e / 0.5);
  const converge = Math.max(0, (e - 0.5) / 0.5);
  const tilt = (index - (count - 1) / 2) * STACK_TILT;
  return {
    x: 0,
    y: -0.4 + rise * 2.2 - converge * 1.8,
    z: 0.1 + converge * (STACK_Z - 0.1) + (count - 1 - index) * STACK_Z_GAP * converge,
    rotZ: tilt * converge,
    visible: t > 0,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/pack-opener-3d/__tests__/ejectionPath.test.ts`
Expected: PASS

(Check the "ends centered" expectation: `-0.4 + 2.2 - 1.8 = 0` ✓.)

- [ ] **Step 5: Rework `CardEjection.tsx` to use the path**

Full replacement:

```tsx
"use client"

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { cardProgress, ejectPose } from './ejectionPath';

interface CardEjectionProps {
  count: number;
  active: boolean;
  onComplete: () => void;
}

/** Card-back planes rise from the pack mouth and converge into a centered stack. */
export function CardEjection({ count, active, onComplete }: CardEjectionProps) {
  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const startRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const texture = useTexture('/cards/card_back.png');

  useFrame(({ clock }) => {
    if (!active || doneRef.current) return;
    if (startRef.current === null) startRef.current = clock.getElapsedTime();
    const elapsed = clock.getElapsedTime() - startRef.current;

    let allDone = true;
    for (let i = 0; i < count; i++) {
      const g = groupRefs.current[i];
      if (!g) continue;
      const t = cardProgress(elapsed, i);
      if (t < 1) allDone = false;
      const pose = ejectPose(t, i, count);
      g.visible = pose.visible;
      g.position.set(pose.x, pose.y, pose.z);
      g.rotation.z = pose.rotZ;
    }
    if (allDone && elapsed > 0) {
      doneRef.current = true;
      onComplete();
    }
  });

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <group
          key={i}
          ref={(el) => { groupRefs.current[i] = el; }}
          visible={false}
          position={[0, -0.4, 0.1]}
        >
          <mesh>
            <planeGeometry args={[1, 1.4]} />
            <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </>
  );
}
```

- [ ] **Step 6: Verify**

Run: `npm run typecheck && npm run test`
Expected: PASS (all suites)

- [ ] **Step 7: Commit**

```bash
git add src/components/pack-opener-3d/ejectionPath.ts src/components/pack-opener-3d/__tests__/ejectionPath.test.ts src/components/pack-opener-3d/CardEjection.tsx
git commit -m "feat(pack-opener): converge ejected cards into match-cut stack"
```

---

### Task 6: Pack artwork decal + foil + environment

Tier artwork as a decal plane in front of the pack (one per clipped half, so it tears with the strip), foil material settings on the GLB clones, and a network-free PMREM room environment for reflections.

**Files:**
- Modify: `src/components/pack-opener-3d/BoosterPackModel.tsx`
- Modify: `src/components/pack-opener-3d/PackScene.tsx`
- Modify: `src/components/pack-opener-3d/PackOpener3D.tsx`
- Modify: `src/features/inventory/index.tsx` (preload line only — do NOT touch anything else in this file)

- [ ] **Step 1: Add foil settings in `useClippedPack` (`BoosterPackModel.tsx`)**

In the material-clone loop, after `clone.side = THREE.DoubleSide;` add:

```ts
if (clone instanceof THREE.MeshStandardMaterial) {
  // foil finish — reflects the PMREM room environment (PackScene)
  clone.metalness = 0.6;
  clone.roughness = 0.25;
  clone.envMapIntensity = 1.2;
}
```

- [ ] **Step 2: Add the artwork decal component (`BoosterPackModel.tsx`)**

Add import: `import { useTexture } from '@react-three/drei';`

Add below `useClippedPack`:

```tsx
interface PackArtDecalProps {
  packImageUrl: string;
  keepTop: boolean;
  packSize: THREE.Vector3;
}

/**
 * Tier artwork projected onto the pack front as a thin decal plane. Rendered
 * once per clipped half with the matching world-space clipping plane, so the
 * crimp-strip slice of the artwork slides and flies off with the strip.
 */
function PackArtDecal({ packImageUrl, keepTop, packSize }: PackArtDecalProps) {
  const texture = useTexture(packImageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = useMemo(() => {
    const plane = keepTop
      ? new THREE.Plane(new THREE.Vector3(0, 1, 0), -TEAR_Y)
      : new THREE.Plane(new THREE.Vector3(0, -1, 0), TEAR_Y);
    return new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      clippingPlanes: [plane],
      metalness: 0.4,
      roughness: 0.35,
      envMapIntensity: 1.0,
    });
  }, [texture, keepTop]);

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh material={material} position={[0, 0, packSize.z / 2 + 0.012]}>
      <planeGeometry args={[packSize.x * 0.94, PACK_HEIGHT * 0.97]} />
    </mesh>
  );
}
```

- [ ] **Step 3: Wire the decal into `BoosterPackModel`**

Add `packImageUrl: string;` to `BoosterPackModelProps`. In the component:

```tsx
export function BoosterPackModel({ tearProgress, topFly, packImageUrl }: BoosterPackModelProps) {
  // …existing refs/hooks…

  // full pack bounds (clipping is shader-level, Box3 sees the whole mesh)
  const packSize = useMemo(
    () => new THREE.Box3().setFromObject(body).getSize(new THREE.Vector3()),
    [body]
  );
```

And in the JSX, add a decal to each half:

```tsx
return (
  <group ref={wobbleRef}>
    <primitive object={body} />
    <PackArtDecal packImageUrl={packImageUrl} keepTop={false} packSize={packSize} />
    <group ref={topRef}>
      <primitive object={top} />
      <PackArtDecal packImageUrl={packImageUrl} keepTop={true} packSize={packSize} />
    </group>
  </group>
);
```

- [ ] **Step 4: Pass `packImageUrl` through `PackOpener3D.tsx`**

```tsx
<BoosterPackModel tearProgress={tearProgress} topFly={topFly} packImageUrl={packImageUrl} />
```

- [ ] **Step 5: Extend the asset preload**

In `PackOpener3D.tsx`:

```ts
export function preloadPackOpenerAssets(packImageUrl?: string) {
  useGLTF.preload(PACK_MODEL_URL);
  useTexture.preload('/cards/card_back.png');
  if (packImageUrl) useTexture.preload(packImageUrl);
}
```

In `src/features/inventory/index.tsx`, update ONLY the preload call (line ~78):

```ts
void import('@/components/pack-opener-3d/PackOpener3D')
  .then((m) => m.preloadPackOpenerAssets(getPackImageUrl(pack)))
  .catch(() => { /* preload is best-effort; opener falls back if needed */ });
```

- [ ] **Step 6: Add the room environment to `PackScene.tsx`**

`drei`'s `<Environment preset>` fetches HDRs from a CDN — use three's bundled `RoomEnvironment` instead (offline-safe). Full replacement of `PackScene.tsx`:

```tsx
"use client"

import React, { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** Sweeping light gives the foil an idle shimmer. */
function SweepLight() {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.x = Math.sin(clock.getElapsedTime() * 0.8) * 4;
    }
  });
  return <pointLight ref={ref} position={[0, 1, 3]} intensity={6} />;
}

/** Network-free env map (PMREM room) so metalness has something to reflect. */
function SceneEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    return () => {
      scene.environment = null;
      envTex.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

export function PackScene({ children }: { children: React.ReactNode }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ localClippingEnabled: true, antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <directionalLight position={[-4, 2, 2]} intensity={0.5} color="#fb923c" />
      <SweepLight />
      <SceneEnvironment />
      {/* Suspense INSIDE the Canvas: asset loading must never suspend the Canvas
          itself. If it bubbles up, React hides + re-shows the subtree, R3F tears
          down the renderer (forceContextLoss) and recreates it on the same canvas
          element whose context is now permanently lost → blank screen. */}
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
```

- [ ] **Step 7: Verify**

Run: `npm run typecheck && npm run test && npx eslint src/components/pack-opener-3d/`
Expected: PASS. (`useTexture(packImageUrl)` suspends inside PackScene's internal Suspense — the existing in-Canvas boundary covers it; a texture 404 throws into `PackErrorBoundary` → CSS fallback, same as a GLB failure.)

- [ ] **Step 8: Commit**

```bash
git add src/components/pack-opener-3d/BoosterPackModel.tsx src/components/pack-opener-3d/PackScene.tsx src/components/pack-opener-3d/PackOpener3D.tsx src/features/inventory/index.tsx
git commit -m "feat(pack-opener): tier artwork decal, foil finish, room env map"
```

**⚠️ `src/features/inventory/index.tsx` may show OTHER uncommitted changes — stage only if the diff is exactly the preload line. `git add -p` if unsure. NEVER stage `src/features/settings/index.tsx`.**

---

### Task 7: Jagged tear edge shader

`onBeforeCompile` injection: a noise-displaced discard band along the tear line replaces the flat clip edge. Clipping planes are widened by the jag amplitude so the shader owns the visible edge. The top strip's uniforms track its group position each frame so the jag pattern stays glued to the strip while it slides/flies (raw world-space coords would make the edge crawl). Known approximation: the strip's small z-rotation during slide/fly slightly skews its edge — acceptable, it's moving fast.

**Files:**
- Create: `src/components/pack-opener-3d/tearEdgeShader.ts`
- Modify: `src/components/pack-opener-3d/BoosterPackModel.tsx`

- [ ] **Step 1: Create `src/components/pack-opener-3d/tearEdgeShader.ts`**

```ts
import * as THREE from 'three';

export const JAG_AMP = 0.06;  // world units — tear jag amplitude
export const JAG_FREQ = 14.0; // jags per world unit

export interface TearEdgeUniforms {
  uTearY: { value: number };
  uOffsetX: { value: number };
}

/**
 * Injects a jagged discard band along the tear line into a built-in material.
 * Both halves use complementary discards (same threshold, opposite signs) so
 * the torn edges interlock. Update the returned uniforms each frame for the
 * moving top strip; leave them at defaults for the static body.
 */
export function applyTearEdge(
  material: THREE.Material,
  keepTop: boolean,
  tearY: number
): TearEdgeUniforms {
  const uniforms: TearEdgeUniforms = {
    uTearY: { value: tearY },
    uOffsetX: { value: 0 },
  };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTearY = uniforms.uTearY;
    shader.uniforms.uOffsetX = uniforms.uOffsetX;
    shader.uniforms.uKeepTop = { value: keepTop ? 1.0 : 0.0 };
    shader.uniforms.uJagAmp = { value: JAG_AMP };
    shader.uniforms.uJagFreq = { value: JAG_FREQ };

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vTearWorldPos;')
      .replace(
        '#include <worldpos_vertex>',
        '#include <worldpos_vertex>\nvTearWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;'
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vTearWorldPos;
uniform float uTearY;
uniform float uOffsetX;
uniform float uKeepTop;
uniform float uJagAmp;
uniform float uJagFreq;
float tearHash(float n) { return fract(sin(n) * 43758.5453); }
float tearJag(float x) {
  float p = (x - uOffsetX) * uJagFreq;
  float i = floor(p);
  float f = smoothstep(0.0, 1.0, fract(p));
  return mix(tearHash(i), tearHash(i + 1.0), f) - 0.5;
}`
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `float jaggedY = uTearY + tearJag(vTearWorldPos.x) * uJagAmp;
if (uKeepTop > 0.5) { if (vTearWorldPos.y < jaggedY) discard; }
else { if (vTearWorldPos.y > jaggedY) discard; }
#include <clipping_planes_fragment>`
      );
  };
  material.needsUpdate = true;
  return uniforms;
}
```

- [ ] **Step 2: Apply in `useClippedPack` (`BoosterPackModel.tsx`)**

Add import: `import { applyTearEdge, JAG_AMP, type TearEdgeUniforms } from './tearEdgeShader';`

Change the hook to widen the planes and collect uniforms. Replace the plane construction + traverse with:

```ts
function useClippedPack(keepTop: boolean): { root: THREE.Group; tearUniforms: TearEdgeUniforms[] } {
  const { scene } = useGLTF(PACK_MODEL_URL);
  return useMemo(() => {
    const root = scene.clone(true);

    // Normalize: scale to PACK_HEIGHT, center at origin.
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    // multiply into any baked root scale — setScalar would mis-size GLBs exported at scale ≠ 1
    root.scale.multiplyScalar(PACK_HEIGHT / size.y);
    const scaledBox = new THREE.Box3().setFromObject(root);
    root.position.sub(scaledBox.getCenter(new THREE.Vector3()));

    // Planes widened by JAG_AMP: the jagged shader discard owns the visible
    // edge; the plane is just a safety clip beyond the jag band.
    const plane = keepTop
      ? new THREE.Plane(new THREE.Vector3(0, 1, 0), -(TEAR_Y - JAG_AMP))
      : new THREE.Plane(new THREE.Vector3(0, -1, 0), TEAR_Y + JAG_AMP);

    const tearUniforms: TearEdgeUniforms[] = [];
    root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mats = (Array.isArray(obj.material) ? obj.material : [obj.material]).map(
          (m: THREE.Material) => {
            const clone = m.clone();
            clone.clippingPlanes = [plane];
            clone.side = THREE.DoubleSide; // show interior at the cut
            if (clone instanceof THREE.MeshStandardMaterial) {
              // foil finish — reflects the PMREM room environment (PackScene)
              clone.metalness = 0.6;
              clone.roughness = 0.25;
              clone.envMapIntensity = 1.2;
            }
            tearUniforms.push(applyTearEdge(clone, keepTop, TEAR_Y));
            return clone;
          }
        );
        obj.material = Array.isArray(obj.material) ? mats : mats[0];
      }
    });
    return { root, tearUniforms };
  }, [scene, keepTop]);
}
```

Update the call sites and disposal:

```tsx
const { root: body } = useClippedPack(false);
const { root: top, tearUniforms: topUniforms } = useClippedPack(true);
```

(The disposal `useEffect` deps become `[body, top]` — same traversal code works on the roots.)

- [ ] **Step 3: Track the strip in `useFrame`**

In `BoosterPackModel`'s `useFrame`, after the `topRef.current` block:

```ts
if (topRef.current) {
  // keep the jag band glued to the strip as it slides (x) and flies (y)
  for (const u of topUniforms) {
    u.uTearY.value = TEAR_Y + topRef.current.position.y;
    u.uOffsetX.value = topRef.current.position.x;
  }
}
```

- [ ] **Step 4: Apply to the decals too**

The decal must tear with the same jagged edge. Replace `PackArtDecal` (from Task 6) with this final version — widened plane, `applyTearEdge`, and a `useFrame` that keeps the top decal's jag glued to the flying strip:

```tsx
interface PackArtDecalProps {
  packImageUrl: string;
  keepTop: boolean;
  packSize: THREE.Vector3;
}

/**
 * Tier artwork projected onto the pack front as a thin decal plane. Rendered
 * once per clipped half with the matching (jag-widened) clipping plane and the
 * same jagged-discard shader, so the crimp-strip slice of the artwork tears
 * and flies off with the strip.
 */
function PackArtDecal({ packImageUrl, keepTop, packSize }: PackArtDecalProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(packImageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  const { material, uniforms } = useMemo(() => {
    const plane = keepTop
      ? new THREE.Plane(new THREE.Vector3(0, 1, 0), -(TEAR_Y - JAG_AMP))
      : new THREE.Plane(new THREE.Vector3(0, -1, 0), TEAR_Y + JAG_AMP);
    const m = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      clippingPlanes: [plane],
      metalness: 0.4,
      roughness: 0.35,
      envMapIntensity: 1.0,
    });
    const u = applyTearEdge(m, keepTop, TEAR_Y);
    return { material: m, uniforms: u };
  }, [texture, keepTop]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    if (!keepTop || !meshRef.current) return;
    // top decal sits inside topRef's group — track that group's transform
    const parent = meshRef.current.parent;
    if (parent) {
      uniforms.uTearY.value = TEAR_Y + parent.position.y;
      uniforms.uOffsetX.value = parent.position.x;
    }
  });

  return (
    <mesh ref={meshRef} material={material} position={[0, 0, packSize.z / 2 + 0.012]}>
      <planeGeometry args={[packSize.x * 0.94, PACK_HEIGHT * 0.97]} />
    </mesh>
  );
}
```

(`useFrame` and `useRef` are already imported in `BoosterPackModel.tsx`.)

- [ ] **Step 5: Verify**

Run: `npm run typecheck && npm run test && npx eslint src/components/pack-opener-3d/`
Expected: PASS. Visual check happens in Task 9 — if the edge looks wrong there, tune `JAG_AMP` / `JAG_FREQ` only.

- [ ] **Step 6: Commit**

```bash
git add src/components/pack-opener-3d/tearEdgeShader.ts src/components/pack-opener-3d/BoosterPackModel.tsx
git commit -m "feat(pack-opener): jagged tear edge via shader discard band"
```

---

### Task 8: Idle hints — glow pulse + finger hint

3D glow pulse behind the pack during `idle`, DOM finger hint sliding across the crimp zone until first interaction.

**Files:**
- Create: `src/components/pack-opener-3d/GlowPulse.tsx`
- Create: `src/components/pack-opener-3d/FingerHint.tsx`
- Modify: `src/components/pack-opener-3d/PackOpener3D.tsx`

- [ ] **Step 1: Create `src/components/pack-opener-3d/GlowPulse.tsx`**

```tsx
"use client"

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

function makeRadialTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/** Soft additive glow pulsing behind the pack while it waits to be torn. */
export function GlowPulse({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => makeRadialTexture(), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    const t = clock.getElapsedTime();
    const target = active ? 0.35 + Math.sin(t * 2.2) * 0.18 : 0;
    mat.opacity += (target - mat.opacity) * 0.1; // ease toward target
    ref.current.scale.setScalar(4 + Math.sin(t * 2.2) * 0.3);
  });

  return (
    <mesh ref={ref} position={[0, 0, -1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        color="#fb923c"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
```

- [ ] **Step 2: Create `src/components/pack-opener-3d/FingerHint.tsx`**

```tsx
"use client"

import React from 'react';
import { motion } from 'framer-motion';

/** Looping drag indicator over the crimp strip until the user interacts. */
export function FingerHint({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <motion.div
      className="absolute left-[22%] top-[16%] text-3xl pointer-events-none select-none"
      style={{ filter: 'drop-shadow(0 0 6px rgba(251,146,60,0.8))' }}
      animate={{ x: [0, 90, 0], opacity: [0, 1, 0] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      👆
    </motion.div>
  );
}
```

- [ ] **Step 3: Wire into `PackOpener3D.tsx`**

Imports:

```tsx
import { GlowPulse } from './GlowPulse';
import { FingerHint } from './FingerHint';
```

State (next to other `useState`):

```tsx
const [hasInteracted, setHasInteracted] = useState(false);
```

Inside `<PackScene>` (after `<ModelReady …/>`):

```tsx
<GlowPulse active={stage === 'idle'} />
```

In `onTearStart` (the `TearGestureOverlay` prop):

```tsx
onTearStart={() => {
  setHasInteracted(true);
  setStage('tearing');
}}
```

Next to the hint `<p>` (sibling, inside the same container):

```tsx
<FingerHint visible={stage === 'idle' && modelReady && !hasInteracted} />
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck && npm run test && npx eslint src/components/pack-opener-3d/`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/pack-opener-3d/GlowPulse.tsx src/components/pack-opener-3d/FingerHint.tsx src/components/pack-opener-3d/PackOpener3D.tsx
git commit -m "feat(pack-opener): idle glow pulse and finger drag hint"
```

---

### Task 9: Dev page, browser verification, final gates

The dev page is for iteration only — verify with the user, then DELETE it before the final commit (matches PR #2 behavior: dev route must not ship).

**Files:**
- Create (temporary, do NOT commit): `src/app/dev/pack-test/page.tsx`

- [ ] **Step 1: Create the temporary dev page**

```tsx
"use client"

import { useState } from 'react';
import { PackOpener3D } from '@/components/pack-opener-3d/PackOpener3D';
import type { PackCard } from '@/components/shared/rarityStyles';

const FAKE_CARDS: PackCard[] = [
  { name: 'Ignis Drake', rarity: 'Common' },
  { name: 'Aqua Sprite', rarity: 'Uncommon' },
  { name: 'Terra Golem', rarity: 'Rare' },
  { name: 'Volt Phoenix', rarity: 'Super Rare' },
  { name: 'Chrono Wyrm', rarity: 'Mythic' },
];

export default function PackTestPage() {
  const [run, setRun] = useState(1);
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      {open ? (
        <PackOpener3D
          key={run}
          packImageUrl="/boosters/beginner.png"
          packName="Beginner Pack"
          cards={FAKE_CARDS}
          onAnimationComplete={() => setOpen(false)}
        />
      ) : (
        <button
          className="text-white border border-orange-400 px-4 py-2 rounded"
          onClick={() => { setRun((r) => r + 1); setOpen(true); }}
        >
          Open again
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Browser verification with the user**

Dev server is usually already running on :3000 (check before starting another — `Another next dev server is already running`). Ask the user to open `http://localhost:3000/dev/pack-test` and verify:

1. Idle: pack has beginner artwork + foil sheen, glow pulses, finger hint loops over the crimp.
2. Drag crimp: jagged tear edge visible at the split; artwork tears with the strip.
3. Release ≥70%: strip flies off, cards rise and converge into one centered stack.
4. Crossfade: 3D stack fades into the 2D stack with no jarring jump (tune `STACK_Z` / `STACK_TILT` if mismatched).
5. Tap-through: click flips top card (rarity glow), click again slides it smoothly into the mini-row; repeat ×5.
6. Summary grid: cards fan from mini-row into the grid; "Tap to continue" exits.
7. Fallback: temporarily rename `public/models/booster-pack.glb` → CSS opener plays, ends in the SAME tap-through stack; rename back.

No headless browser on this machine — ask the user for screenshots/console output when something looks wrong.

- [ ] **Step 3: Fix visual tuning issues found**

Tuning knobs only (no architecture changes): `STACK_Z`, `STACK_TILT`, `STACK_Z_GAP` (`ejectionPath.ts`); `JAG_AMP`, `JAG_FREQ` (`tearEdgeShader.ts`); decal size factors + metalness/roughness (`BoosterPackModel.tsx`); crossfade duration (`PackOpener3D.tsx`); FingerHint position. Commit tuning as `fix(pack-opener): …` or `style(pack-opener): …`.

- [ ] **Step 4: Delete the dev page**

```bash
rm -rf src/app/dev
```

- [ ] **Step 5: Final gates**

Run: `npm run typecheck && npm run test && npm run build && npx eslint src/components/pack-opener-3d/ src/components/shared/`
Expected: ALL PASS.

- [ ] **Step 6: Final commit (if any uncommitted tuning remains)**

```bash
git status   # must NOT include src/features/settings/index.tsx
git add <only pack-opener related files>
git commit -m "fix(pack-opener): visual tuning from browser verification"
```
