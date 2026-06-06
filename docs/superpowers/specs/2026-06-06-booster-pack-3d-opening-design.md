# Booster Pack 3D Opening — Design

**Date:** 2026-06-06
**Status:** Approved

## Goal

Replace the default booster pack opening animation with an interactive 3D experience: the user drags the pack's crimp strip sideways to tear it open (like real foil), the top rips off, and the cards eject from the pack before handing off to the existing flip-reveal UI.

## Decisions

| Question | Decision |
|---|---|
| 3D asset | User downloads GLB from Sketchfab ([Booster Pack TCG](https://sketchfab.com/3d-models/booster-pack-tcg-pack-3b9affa6b3d647fdb35487ee7bc34525)) into `public/models/booster-pack.glb`. User verifies license permits use. |
| Tear mechanic | **Approach A — clipping planes.** Render the GLB twice: copy 1 clipped to the top ~12% (crimp strip), copy 2 clipped to the bottom ~88% (body). No mesh editing or Blender step. Tear edge is a straight line (jagged shader edge is a possible future enhancement). |
| Gesture | Drag crimp strip horizontally. Tear progress follows finger; release ≥ 0.7 progress → tear completes; < 0.7 → springs back. |
| Card reveal | 3D eject → hand off to existing 2D flip-reveal (rarity glow kept). Cards are blank-backed planes in 3D; the real reveal stays in `SpektrumPackOpener`'s flipping stage. |
| Fallback | Keep `SpektrumPackOpener` (CSS) as fallback for no-WebGL devices and GLB load failures. 3D opener is the default. |

## Stack

- `three` + `@react-three/fiber` + `@react-three/drei` (new dependencies, ~150KB gz)
- `framer-motion` (existing) — `useMotionValue` for tear progress, 2D handoff crossfade
- Capacitor Haptics (if available) on tear completion

## Components

```
src/components/pack-opener-3d/
  PackOpener3D.tsx        — orchestrator: stage machine, WebGL detect, fallback routing
  PackScene.tsx           — R3F <Canvas>: camera, lights, environment
  BoosterPackModel.tsx    — GLB rendered twice with clipping planes (top strip / body)
  TearGestureOverlay.tsx  — invisible div over canvas; pointer drag → tearProgress MotionValue
  CardEjection.tsx        — 5 card-back planes, staggered eject + fly-to-camera
  useWebGLSupport.ts      — WebGL capability check hook
public/models/booster-pack.glb — user-provided asset
```

`SpektrumPackOpener` remains untouched except for one additive change: accept an optional `initialStage` prop (default `"opening"`); the 3D opener mounts it with `initialStage="flipping"` to skip straight to the reveal.

## Stage Machine

```
idle → tearing → torn → ejecting → reveal
```

- **idle**: pack wobble loop, foil light sweep
- **tearing**: tearProgress 0–1 follows drag X. Release < 0.7 → spring back to 0; ≥ 0.7 → `torn`. Pointer cancel/leave → spring back.
- **torn**: top piece animates off (translate + rotate + fade, ~500ms). Haptic fire.
- **ejecting**: 5 card planes rise from pack mouth, 120ms stagger, fly toward camera; canvas fades out.
- **reveal**: existing flip-reveal UI mounts (rarity glow: Mythic gold, Super Rare purple, Rare blue, Uncommon green).

Threshold logic lives in a pure function `resolveTearRelease(progress)` for testability.

## Data Flow

`InventoryFeature` open flow unchanged:

1. `openBoosterPack(packId)` → cards from API (existing store action)
2. Pass `cards` to `PackOpener3D` instead of `SpektrumPackOpener`
3. `onComplete` callback identical to current contract

WebGL unsupported (hook) or GLB load error (`useGLTF` throws → ErrorBoundary) → render `SpektrumPackOpener` directly with same props.

## Error Handling

- GLB missing/404 → ErrorBoundary → CSS fallback, `console.warn`
- Slow load: pack silhouette + spinner, max 3s → fallback
- Mid-gesture interrupt (pointercancel/pointerleave) → spring back to 0

## Layout

Mobile-first per project convention: canvas constrained to `max-w-sm`, full-height modal overlay. Not full viewport width.

## Testing

- **Vitest**: stage machine transitions; `resolveTearRelease(progress)` threshold; WebGL detect mocked both ways (fallback routing)
- **Manual**: Capacitor device test — confirm old Android WebView takes fallback path; haptics fire on tear

## Out of Scope

- Jagged/procedural tear edge shader (future)
- Full-3D card flip reveal (rejected in favor of 2D handoff)
- Changes to pack purchase flow or card generation API
