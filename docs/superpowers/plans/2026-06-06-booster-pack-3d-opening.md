# Booster Pack 3D Opening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Interactive 3D booster pack opening — drag the crimp strip sideways to tear, top flies off, cards eject, hand off to existing 2D flip-reveal.

**Architecture:** A new `PackOpener3D` component renders a user-supplied GLB twice with three.js world-space clipping planes (top crimp strip / pack body — Approach A from the spec, no mesh editing). A framer-motion `MotionValue` driven by a pointer-gesture overlay controls tear progress, read inside R3F `useFrame`. After ejection the component mounts the existing `SpektrumPackOpener` at its flipping stage. No WebGL or any load failure falls back to `SpektrumPackOpener` from the start.

**Tech Stack:** Next.js 16 / React 19, `three` + `@react-three/fiber` v9 + `@react-three/drei` v10 (new), `framer-motion` v12 (existing), Vitest (node env — pure-logic tests only; visual components verified by typecheck + manual run).

**Spec:** `docs/superpowers/specs/2026-06-06-booster-pack-3d-opening-design.md`

**Asset prerequisite:** User drops downloaded model at `public/models/booster-pack.glb` (Sketchfab "Booster Pack TCG", license verified by user). Tasks 1–9 do not need the file; Task 10 (manual verification) does.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `package.json` | Modify | Add `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` |
| `src/components/pack-opener-3d/tearLogic.ts` | Create | Pure tear-threshold + progress-clamp functions |
| `src/components/pack-opener-3d/openerStages.ts` | Create | Stage machine: types + `canTransition` |
| `src/components/pack-opener-3d/useWebGLSupport.ts` | Create | WebGL capability check (injectable for tests) |
| `src/components/pack-opener-3d/__tests__/tearLogic.test.ts` | Create | Threshold/clamp tests |
| `src/components/pack-opener-3d/__tests__/openerStages.test.ts` | Create | Transition tests |
| `src/components/pack-opener-3d/__tests__/useWebGLSupport.test.ts` | Create | Capability-check tests |
| `src/components/shared/SpektrumPackOpener.tsx` | Modify | Add optional `initialStage` prop; export `PackCard`, `Stage` |
| `src/components/pack-opener-3d/PackScene.tsx` | Create | R3F Canvas, lights, sweep light |
| `src/components/pack-opener-3d/BoosterPackModel.tsx` | Create | GLB ×2 with clipping planes, wobble, tear/fly transforms |
| `src/components/pack-opener-3d/CardEjection.tsx` | Create | Staggered card-back planes flying to camera |
| `src/components/pack-opener-3d/TearGestureOverlay.tsx` | Create | Pointer drag → tearProgress MotionValue |
| `src/components/pack-opener-3d/PackOpener3D.tsx` | Create | Orchestrator: stage machine, fallback, error boundary, load timeout |
| `src/features/inventory/index.tsx` | Modify | Swap `SpektrumPackOpener` → `PackOpener3D` in open flow |

---

### Task 1: Install 3D dependencies

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install runtime deps**

Run in `spektrum-client/`:
```bash
npm install three @react-three/fiber @react-three/drei
```
Expected: installs three@^0.1xx, @react-three/fiber@^9, @react-three/drei@^10 (R3F v9 line is the React 19 compatible one).

- [ ] **Step 2: Install types**

```bash
npm install -D @types/three
```

- [ ] **Step 3: Verify typecheck still passes**

```bash
npm run typecheck
```
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "build(deps): add three, react-three-fiber, drei for 3D pack opener"
```

---

### Task 2: Tear logic (pure functions, TDD)

**Files:**
- Create: `src/components/pack-opener-3d/tearLogic.ts`
- Test: `src/components/pack-opener-3d/__tests__/tearLogic.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/pack-opener-3d/__tests__/tearLogic.test.ts
import { describe, it, expect } from 'vitest';
import { resolveTearRelease, clampTearProgress, TEAR_THRESHOLD } from '../tearLogic';

describe('resolveTearRelease', () => {
  it('resets below threshold', () => {
    expect(resolveTearRelease(0)).toBe('reset');
    expect(resolveTearRelease(0.69)).toBe('reset');
  });

  it('completes at and above threshold', () => {
    expect(resolveTearRelease(TEAR_THRESHOLD)).toBe('complete');
    expect(resolveTearRelease(0.7)).toBe('complete');
    expect(resolveTearRelease(1)).toBe('complete');
  });
});

describe('clampTearProgress', () => {
  it('maps drag distance to 0..1 over 60% of track width', () => {
    // 600px track → full tear at 360px drag
    expect(clampTearProgress(0, 600)).toBe(0);
    expect(clampTearProgress(180, 600)).toBeCloseTo(0.5);
    expect(clampTearProgress(360, 600)).toBe(1);
  });

  it('clamps overshoot and negative (leftward) drag', () => {
    expect(clampTearProgress(9999, 600)).toBe(1);
    expect(clampTearProgress(-50, 600)).toBe(0);
  });

  it('returns 0 for zero or negative track width', () => {
    expect(clampTearProgress(100, 0)).toBe(0);
    expect(clampTearProgress(100, -10)).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/components/pack-opener-3d/__tests__/tearLogic.test.ts
```
Expected: FAIL — "Cannot find module '../tearLogic'" (or equivalent resolve error).

- [ ] **Step 3: Write implementation**

```ts
// src/components/pack-opener-3d/tearLogic.ts
export const TEAR_THRESHOLD = 0.7;

/** Fraction of overlay width a full tear requires. */
export const TEAR_TRACK_FRACTION = 0.6;

export type TearRelease = 'complete' | 'reset';

/** Decide what happens when the user releases the crimp strip. */
export function resolveTearRelease(progress: number): TearRelease {
  return progress >= TEAR_THRESHOLD ? 'complete' : 'reset';
}

/** Map horizontal drag distance (px) to tear progress 0..1. */
export function clampTearProgress(deltaX: number, trackWidth: number): number {
  if (trackWidth <= 0) return 0;
  const progress = deltaX / (trackWidth * TEAR_TRACK_FRACTION);
  return Math.min(1, Math.max(0, progress));
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/components/pack-opener-3d/__tests__/tearLogic.test.ts
```
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/pack-opener-3d/tearLogic.ts src/components/pack-opener-3d/__tests__/tearLogic.test.ts
git commit -m "feat(pack-opener): add tear threshold and progress clamp logic"
```

---

### Task 3: Stage machine (TDD)

**Files:**
- Create: `src/components/pack-opener-3d/openerStages.ts`
- Test: `src/components/pack-opener-3d/__tests__/openerStages.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/pack-opener-3d/__tests__/openerStages.test.ts
import { describe, it, expect } from 'vitest';
import { canTransition, type OpenerStage } from '../openerStages';

describe('canTransition', () => {
  it('allows the happy path', () => {
    expect(canTransition('idle', 'tearing')).toBe(true);
    expect(canTransition('tearing', 'torn')).toBe(true);
    expect(canTransition('torn', 'ejecting')).toBe(true);
    expect(canTransition('ejecting', 'reveal')).toBe(true);
  });

  it('allows spring-back from tearing to idle', () => {
    expect(canTransition('tearing', 'idle')).toBe(true);
  });

  it('rejects skips and reversals', () => {
    expect(canTransition('idle', 'torn')).toBe(false);
    expect(canTransition('idle', 'reveal')).toBe(false);
    expect(canTransition('torn', 'tearing')).toBe(false);
    expect(canTransition('reveal', 'idle')).toBe(false);
  });

  it('reveal is terminal', () => {
    const all: OpenerStage[] = ['idle', 'tearing', 'torn', 'ejecting', 'reveal'];
    for (const to of all) expect(canTransition('reveal', to)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/components/pack-opener-3d/__tests__/openerStages.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Write implementation**

```ts
// src/components/pack-opener-3d/openerStages.ts
export type OpenerStage = 'idle' | 'tearing' | 'torn' | 'ejecting' | 'reveal';

const TRANSITIONS: Record<OpenerStage, OpenerStage[]> = {
  idle: ['tearing'],
  tearing: ['idle', 'torn'], // idle = spring-back on under-threshold release
  torn: ['ejecting'],
  ejecting: ['reveal'],
  reveal: [], // terminal — 2D reveal takes over
};

export function canTransition(from: OpenerStage, to: OpenerStage): boolean {
  return TRANSITIONS[from].includes(to);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/components/pack-opener-3d/__tests__/openerStages.test.ts
```
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/pack-opener-3d/openerStages.ts src/components/pack-opener-3d/__tests__/openerStages.test.ts
git commit -m "feat(pack-opener): add opener stage machine"
```

---

### Task 4: WebGL support hook (TDD)

**Files:**
- Create: `src/components/pack-opener-3d/useWebGLSupport.ts`
- Test: `src/components/pack-opener-3d/__tests__/useWebGLSupport.test.ts`

Vitest runs in `node` env (no `document`), so the check function takes an injectable canvas factory.

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/pack-opener-3d/__tests__/useWebGLSupport.test.ts
import { describe, it, expect } from 'vitest';
import { isWebGLAvailable } from '../useWebGLSupport';

function fakeCanvas(contexts: Record<string, unknown>): HTMLCanvasElement {
  return {
    getContext: (name: string) => contexts[name] ?? null,
  } as unknown as HTMLCanvasElement;
}

describe('isWebGLAvailable', () => {
  it('true when webgl2 available', () => {
    expect(isWebGLAvailable(() => fakeCanvas({ webgl2: {} }))).toBe(true);
  });

  it('true when only webgl1 available', () => {
    expect(isWebGLAvailable(() => fakeCanvas({ webgl: {} }))).toBe(true);
  });

  it('false when no context available', () => {
    expect(isWebGLAvailable(() => fakeCanvas({}))).toBe(false);
  });

  it('false when canvas creation throws', () => {
    expect(isWebGLAvailable(() => { throw new Error('no DOM'); })).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/components/pack-opener-3d/__tests__/useWebGLSupport.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Write implementation**

```ts
// src/components/pack-opener-3d/useWebGLSupport.ts
"use client"

import { useState } from 'react';

export function isWebGLAvailable(
  createCanvas: () => HTMLCanvasElement = () => document.createElement('canvas')
): boolean {
  try {
    const canvas = createCanvas();
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Checked once on mount; the opener only renders client-side after user action. */
export function useWebGLSupport(): boolean {
  const [supported] = useState(
    () => typeof window !== 'undefined' && isWebGLAvailable()
  );
  return supported;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/components/pack-opener-3d/__tests__/useWebGLSupport.test.ts
```
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/pack-opener-3d/useWebGLSupport.ts src/components/pack-opener-3d/__tests__/useWebGLSupport.test.ts
git commit -m "feat(pack-opener): add WebGL capability detection"
```

---

### Task 5: `initialStage` prop on SpektrumPackOpener

**Files:**
- Modify: `src/components/shared/SpektrumPackOpener.tsx`

Additive change only: export `PackCard` + `Stage`, accept optional `initialStage` (default `'opening'`), and guard the opening-stage timer so a non-default start skips the pack animation.

- [ ] **Step 1: Export types and add prop**

In `src/components/shared/SpektrumPackOpener.tsx`, change the interface block (lines 8–22) to:

```ts
export interface PackCard {
  name: string;
  art?: string;
  imagePath?: string;
  rarity?: RarityType;
}

interface SpektrumPackOpenerProps {
  packImageUrl: string;
  packName: string;
  cards: PackCard[];
  onAnimationComplete: () => void;
  /** Start mid-sequence (e.g. 'flipping' when a 3D opener already played the tear). */
  initialStage?: Stage;
}

export type Stage = 'opening' | 'tearing' | 'revealing' | 'flipping' | 'complete';
```

- [ ] **Step 2: Use the prop**

Change the component signature + state init (lines 40–46):

```ts
export const SpektrumPackOpener: React.FC<SpektrumPackOpenerProps> = ({
  packImageUrl,
  packName,
  cards,
  onAnimationComplete,
  initialStage = 'opening',
}) => {
  const [stage, setStage] = useState<Stage>(initialStage);
```

- [ ] **Step 3: Guard the opening timer**

Change the first effect (lines 64–67) so it only fires from the `opening` stage:

```ts
useEffect(() => {
  if (stage !== 'opening') return;
  const t1 = setTimeout(() => setStage('tearing'), 600);
  return () => clearTimeout(t1);
}, [stage]);
```

- [ ] **Step 4: Typecheck + existing tests**

```bash
npm run typecheck && npm run test
```
Expected: both exit 0 (default behavior unchanged: `initialStage` defaults to `'opening'`).

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/SpektrumPackOpener.tsx
git commit -m "feat(pack-opener): allow SpektrumPackOpener to start mid-sequence"
```

---

### Task 6: PackScene + BoosterPackModel (clipping planes)

**Files:**
- Create: `src/components/pack-opener-3d/PackScene.tsx`
- Create: `src/components/pack-opener-3d/BoosterPackModel.tsx`

No unit tests (R3F needs a real GL context); verified by typecheck here and manual run in Task 10.

- [ ] **Step 1: Create PackScene**

```tsx
// src/components/pack-opener-3d/PackScene.tsx
"use client"

import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';

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
      {children}
    </Canvas>
  );
}
```

Note: `localClippingEnabled: true` is required or material `clippingPlanes` are ignored.

- [ ] **Step 2: Create BoosterPackModel**

```tsx
// src/components/pack-opener-3d/BoosterPackModel.tsx
"use client"

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import type { MotionValue } from 'framer-motion';

export const PACK_MODEL_URL = '/models/booster-pack.glb';

const PACK_HEIGHT = 3;                              // normalized world height
const TEAR_LINE = 0.88;                             // crimp starts at 88% of height
const TEAR_Y = PACK_HEIGHT * (TEAR_LINE - 0.5);     // world y of tear line (model centered)
const TEAR_TRAVEL_X = 2.2;                          // strip slide distance at progress 1

interface BoosterPackModelProps {
  tearProgress: MotionValue<number>; // 0..1, gesture-driven
  topFly: MotionValue<number>;       // 0..1, torn-stage fly-off
}

/**
 * Approach A (spec): same GLB rendered twice, world-space clipping planes split
 * it into crimp strip (top ~12%) and body. Planes stay fixed in world space, so
 * the strip's tear edge holds while it slides sideways/up and away.
 */
function useClippedPack(keepTop: boolean): THREE.Group {
  const { scene } = useGLTF(PACK_MODEL_URL);
  return useMemo(() => {
    const root = scene.clone(true);

    // Normalize: scale to PACK_HEIGHT, center at origin.
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    root.scale.setScalar(PACK_HEIGHT / size.y);
    const scaledBox = new THREE.Box3().setFromObject(root);
    root.position.sub(scaledBox.getCenter(new THREE.Vector3()));

    const plane = keepTop
      ? new THREE.Plane(new THREE.Vector3(0, 1, 0), -TEAR_Y)  // keep y > TEAR_Y
      : new THREE.Plane(new THREE.Vector3(0, -1, 0), TEAR_Y); // keep y < TEAR_Y

    root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mats = (Array.isArray(obj.material) ? obj.material : [obj.material]).map(
          (m: THREE.Material) => {
            const clone = m.clone();
            clone.clippingPlanes = [plane];
            clone.side = THREE.DoubleSide; // show interior at the cut
            return clone;
          }
        );
        obj.material = Array.isArray(obj.material) ? mats : mats[0];
      }
    });
    return root;
  }, [scene, keepTop]);
}

export function BoosterPackModel({ tearProgress, topFly }: BoosterPackModelProps) {
  const wobbleRef = useRef<THREE.Group>(null);
  const topRef = useRef<THREE.Group>(null);
  const body = useClippedPack(false);
  const top = useClippedPack(true);

  useFrame(({ clock }) => {
    const p = tearProgress.get();
    const f = topFly.get();
    const t = clock.getElapsedTime();

    if (wobbleRef.current) {
      // idle wobble, damped once interaction starts
      const damp = (1 - p) * (1 - f);
      wobbleRef.current.rotation.z = Math.sin(t * 1.6) * 0.03 * damp;
      wobbleRef.current.rotation.y = Math.sin(t * 0.9) * 0.08 * damp;
    }
    if (topRef.current) {
      topRef.current.position.x = p * TEAR_TRAVEL_X + f * 4;
      topRef.current.position.y = f * 3;
      topRef.current.rotation.z = -p * 0.12 - f * 1.2;
      topRef.current.visible = f < 1;
    }
  });

  return (
    <group ref={wobbleRef}>
      <primitive object={body} />
      <group ref={topRef}>
        <primitive object={top} />
      </group>
    </group>
  );
}

useGLTF.preload(PACK_MODEL_URL);
```

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/pack-opener-3d/PackScene.tsx src/components/pack-opener-3d/BoosterPackModel.tsx
git commit -m "feat(pack-opener): add 3D scene and clip-plane pack model"
```

---

### Task 7: CardEjection

**Files:**
- Create: `src/components/pack-opener-3d/CardEjection.tsx`

- [ ] **Step 1: Create component**

```tsx
// src/components/pack-opener-3d/CardEjection.tsx
"use client"

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

const EJECT_DURATION = 0.7; // seconds per card
const STAGGER = 0.12;       // seconds between cards

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface CardEjectionProps {
  count: number;
  active: boolean;
  onComplete: () => void;
}

/** Card-back planes rise from the pack mouth and fly toward the camera. */
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
      const t = Math.min(1, Math.max(0, (elapsed - i * STAGGER) / EJECT_DURATION));
      if (t < 1) allDone = false;
      const e = easeOutCubic(t);
      g.visible = t > 0;
      g.position.y = -0.4 + e * 2.6;
      g.position.z = 0.1 + e * 4.5; // toward camera at z=6
      g.position.x = (i - (count - 1) / 2) * 0.18 * e;
      g.rotation.z = (i - (count - 1) / 2) * 0.08 * e;
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

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/pack-opener-3d/CardEjection.tsx
git commit -m "feat(pack-opener): add staggered 3D card ejection"
```

---

### Task 8: TearGestureOverlay

**Files:**
- Create: `src/components/pack-opener-3d/TearGestureOverlay.tsx`

- [ ] **Step 1: Create component**

```tsx
// src/components/pack-opener-3d/TearGestureOverlay.tsx
"use client"

import React, { useCallback, useRef } from 'react';
import { animate, type MotionValue } from 'framer-motion';
import { clampTearProgress, resolveTearRelease } from './tearLogic';

interface TearGestureOverlayProps {
  tearProgress: MotionValue<number>;
  enabled: boolean;
  onTearStart: () => void;
  onTearComplete: () => void;
  onTearReset: () => void;
}

/** Invisible drag zone over the crimp strip (top third of the canvas). */
export function TearGestureOverlay({
  tearProgress,
  enabled,
  onTearStart,
  onTearComplete,
  onTearReset,
}: TearGestureOverlayProps) {
  const startX = useRef<number | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);

  const finish = useCallback(() => {
    if (startX.current === null) return;
    startX.current = null;
    if (resolveTearRelease(tearProgress.get()) === 'complete') {
      animate(tearProgress, 1, { duration: 0.15, ease: 'easeOut' });
      onTearComplete();
    } else {
      animate(tearProgress, 0, { type: 'spring', stiffness: 400, damping: 30 });
      onTearReset();
    }
  }, [tearProgress, onTearComplete, onTearReset]);

  if (!enabled) return null;

  return (
    <div
      ref={zoneRef}
      className="absolute inset-x-0 top-0 h-1/3 z-10 touch-none cursor-grab active:cursor-grabbing"
      onPointerDown={(e) => {
        startX.current = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
        onTearStart();
      }}
      onPointerMove={(e) => {
        if (startX.current === null || !zoneRef.current) return;
        tearProgress.set(
          clampTearProgress(e.clientX - startX.current, zoneRef.current.offsetWidth)
        );
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
    />
  );
}
```

Note: `setPointerCapture` keeps move/up events flowing even if the finger leaves the zone, so `pointerleave` handling is unnecessary; `pointercancel` covers OS interrupts.

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/pack-opener-3d/TearGestureOverlay.tsx
git commit -m "feat(pack-opener): add tear drag gesture overlay"
```

---

### Task 9: PackOpener3D orchestrator

**Files:**
- Create: `src/components/pack-opener-3d/PackOpener3D.tsx`

- [ ] **Step 1: Create component**

```tsx
// src/components/pack-opener-3d/PackOpener3D.tsx
"use client"

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { animate, useMotionValue } from 'framer-motion';
import { SpektrumPackOpener, type PackCard } from '@/components/shared/SpektrumPackOpener';
import { canTransition, type OpenerStage } from './openerStages';
import { useWebGLSupport } from './useWebGLSupport';
import { PackScene } from './PackScene';
import { BoosterPackModel } from './BoosterPackModel';
import { CardEjection } from './CardEjection';
import { TearGestureOverlay } from './TearGestureOverlay';

const LOAD_TIMEOUT_MS = 3000;

interface PackOpener3DProps {
  packImageUrl: string;
  packName: string;
  cards: PackCard[];
  onAnimationComplete: () => void;
}

interface BoundaryProps {
  onError: () => void;
  children: React.ReactNode;
}

/** Catches useGLTF load failures (404, parse error) → CSS fallback. */
class PackErrorBoundary extends React.Component<BoundaryProps, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.warn('3D pack opener failed, falling back to CSS opener:', error.message);
    this.props.onError();
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Mounts only once Suspense resolves — signals the GLB finished loading. */
function ModelReady({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

export function PackOpener3D({
  packImageUrl,
  packName,
  cards,
  onAnimationComplete,
}: PackOpener3DProps) {
  const webglSupported = useWebGLSupport();
  const [failed, setFailed] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [stage, setStageRaw] = useState<OpenerStage>('idle');
  const tearProgress = useMotionValue(0);
  const topFly = useMotionValue(0);

  const setStage = useCallback((to: OpenerStage) => {
    setStageRaw((from) => (canTransition(from, to) ? to : from));
  }, []);

  // Slow load → fallback after 3s
  useEffect(() => {
    if (modelReady || failed) return;
    const t = setTimeout(() => setFailed(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [modelReady, failed]);

  const handleTearComplete = useCallback(() => {
    setStage('torn');
    if (typeof navigator !== 'undefined') navigator.vibrate?.(40);
    animate(topFly, 1, { duration: 0.5, ease: 'easeIn' }).then(() => setStage('ejecting'));
  }, [setStage, topFly]);

  const handleModelReady = useCallback(() => setModelReady(true), []);
  const handleFail = useCallback(() => setFailed(true), []);
  const handleEjectComplete = useCallback(() => setStage('reveal'), [setStage]);

  // Fallback: no WebGL, load failed, or load timed out
  if (!webglSupported || failed) {
    return (
      <SpektrumPackOpener
        packImageUrl={packImageUrl}
        packName={packName}
        cards={cards}
        onAnimationComplete={onAnimationComplete}
      />
    );
  }

  // Handoff: cards flew to camera → existing flip-reveal takes over
  if (stage === 'reveal') {
    return (
      <SpektrumPackOpener
        packImageUrl={packImageUrl}
        packName={packName}
        cards={cards}
        onAnimationComplete={onAnimationComplete}
        initialStage="flipping"
      />
    );
  }

  const interactive = stage === 'idle' || stage === 'tearing';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-4 overflow-hidden">
      <div className="relative w-full max-w-sm h-[70vh]">
        <PackErrorBoundary onError={handleFail}>
          <Suspense fallback={null}>
            <PackScene>
              <BoosterPackModel tearProgress={tearProgress} topFly={topFly} />
              <CardEjection
                count={cards.length}
                active={stage === 'ejecting'}
                onComplete={handleEjectComplete}
              />
            </PackScene>
            <ModelReady onReady={handleModelReady} />
          </Suspense>
        </PackErrorBoundary>

        {!modelReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-400 border-t-transparent" />
          </div>
        )}

        <TearGestureOverlay
          tearProgress={tearProgress}
          enabled={interactive && modelReady}
          onTearStart={() => setStage('tearing')}
          onTearComplete={handleTearComplete}
          onTearReset={() => setStage('idle')}
        />

        {interactive && modelReady && (
          <p className="absolute top-4 inset-x-0 text-center text-orange-300 text-sm animate-pulse pointer-events-none">
            Slide the top strip to tear open →
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + all tests**

```bash
npm run typecheck && npm run test
```
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/pack-opener-3d/PackOpener3D.tsx
git commit -m "feat(pack-opener): add 3D opener orchestrator with CSS fallback"
```

---

### Task 10: Wire into InventoryFeature + manual verification

**Files:**
- Modify: `src/features/inventory/index.tsx:13` (import) and `:267-275` (render)
- Requires: `public/models/booster-pack.glb` (user-provided)

- [ ] **Step 1: Confirm asset exists**

```bash
ls -la public/models/booster-pack.glb
```
Expected: file present. **If missing, pause this task and ask the user — do not substitute another asset.**

- [ ] **Step 2: Swap component**

In `src/features/inventory/index.tsx`, replace the import on line 13:

```ts
import { PackOpener3D } from '@/components/pack-opener-3d/PackOpener3D';
```

(Remove the now-unused `SpektrumPackOpener` import — `PackOpener3D` owns the fallback internally.)

Replace the render block (lines 267–275):

```tsx
{/* 3D Pack Opener (falls back to CSS opener without WebGL) */}
{showOpeningAnimation && openingPack && (
  <PackOpener3D
    packImageUrl={getPackImageUrl(openingPack)}
    packName={openingPack.name}
    cards={animationCards}
    onAnimationComplete={handleOpeningAnimationComplete}
  />
)}
```

- [ ] **Step 3: Typecheck, lint, tests**

```bash
npm run typecheck && npm run lint && npm run test
```
Expected: all exit 0.

- [ ] **Step 4: Manual verification (dev server)**

```bash
npm run dev
```

Check in browser (mobile viewport, e.g. devtools iPhone profile):
1. Inventory → Open pack → confirm modal → 3D pack appears with wobble + light sweep
2. Drag top strip partway, release → springs back
3. Drag past ~60% of width, release → top rips off (vibration on device), cards eject toward camera
4. Flip-reveal UI appears with rarity glows → "Cards Revealed!" → reward popup
5. Fallback: temporarily rename `public/models/booster-pack.glb` → open another pack → CSS opener appears after ≤3s; rename back

- [ ] **Step 5: Production build check**

```bash
npm run build
```
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/features/inventory/index.tsx
git commit -m "feat(inventory): open packs with interactive 3D opener"
```

---

## Self-Review Notes

- Spec coverage: clipping-plane split (Task 6), drag gesture + 0.7 threshold + spring-back (Tasks 2, 8), stage machine (Task 3), eject → 2D handoff via `initialStage` (Tasks 5, 7, 9), WebGL/load/timeout fallback (Tasks 4, 9), haptic (`navigator.vibrate` — this client has no Capacitor packages; vibrate works in Android WebView, silently no-ops on iOS), `max-w-sm` layout (Task 9), Vitest pure-logic tests (Tasks 2–4), manual device check (Task 10).
- Spec deviation (minor): spec named Capacitor Haptics; client package.json has no Capacitor deps, so `navigator.vibrate` is used instead. Same intent, zero new deps.
- Out of scope honored: no jagged-edge shader, no 3D flip reveal, no API changes.
