# Pack Opener Polish — TCG-Pocket Reveal, Pack Look, Tear Edge, Idle Hints

**Date:** 2026-06-06
**Status:** Approved
**Builds on:** `2026-06-06-booster-pack-3d-opening-design.md` (shipped in PR #2)

## Goal

Polish the 3D booster-pack opening experience end to end:

1. Replace the auto-flip card reveal with a TCG-Pocket-style tap-through stack.
2. Smooth the 3D→2D handoff with a match-cut + crossfade.
3. Give the flat-color GLB pack its tier artwork and a foil finish.
4. Make the tear edge look torn (jagged shader edge) instead of a clean slice.
5. Teach the drag gesture during idle (glow pulse + finger hint).

## 1. Tap-Through Reveal — `CardRevealStack`

New shared component: `src/components/shared/CardRevealStack.tsx`.

**Props:** `cards: PackCard[]`, `onComplete: () => void`.

**Interaction (two-step, per card):**

- Cards render as a centered stack of card-backs, slightly offset/rotated for depth. Only the top card is interactive.
- **Click 1:** top card flips face-up (framer-motion `rotateY`), rarity border + glow appear.
- **Click 2:** card slides aside smoothly and shrinks into a mini-row at the top of the screen (acts as progress indicator of revealed cards). The next card-back becomes the top card.
- **After the last card:** all revealed cards fan into a centered summary grid with rarity glows, "Cards Revealed!" text, and a tap-to-continue that fires `onComplete`.

**State machine:** pure module `src/components/shared/revealLogic.ts` (mirrors the `tearLogic.ts` pattern) — current index, per-card phase (`back → flipped → aside`), completion. Unit-tested.

**Shared rarity styles:** extract `RARITY_GLOW` / `RARITY_BORDER` from `SpektrumPackOpener.tsx` into a shared module consumed by both components.

**`SpektrumPackOpener` rework:**

- Keeps CSS `opening` / `tearing` stages (fallback path for no-WebGL / GLB failure).
- The `revealing` / `flipping` / `complete` auto-flip row is replaced by rendering `CardRevealStack`.
- `initialStage="flipping"` (the 3D handoff entry) goes straight to the stack.
- Both the 3D path and the CSS fallback path get the identical reveal UX.

## 2. Ejection Rework + Match-Cut Seam

**`CardEjection.tsx`:** cards pop up out of the torn pack, then converge into a single centered stack facing the camera (small offsets matching the 2D stack layout) — replacing the current spread-toward-camera paths. Timing constants (`EJECT_DURATION`, `STAGGER`) retained as tuning knobs.

**`PackOpener3D.tsx`:** when ejection ends, the 2D `CardRevealStack` mounts underneath the canvas and the canvas fades to opacity 0 over ~300 ms. The 3D end frame is tuned to approximate the 2D stack's size/position; the crossfade hides residual mismatch. No precise 3D→2D coordinate projection — visual tuning only.

## 3. Pack Look — Artwork + Foil

**`BoosterPackModel.tsx`:**

- **Tier artwork:** a decal plane positioned slightly in front of the pack's front face, textured with `packImageUrl` (already passed into the opener). The decal uses the same world-space clipping planes, so it tears and flies off with the top strip.
- **Foil finish:** pack materials upgraded to `meshPhysicalMaterial` (metalness ≈ 0.6, roughness ≈ 0.25) plus a drei `<Environment>` (small preset) for reflections. Existing SweepLight shimmer stays.
- **Failure handling:** texture loads inside the in-Canvas Suspense (gotcha: Suspense must stay INSIDE Canvas — see `r3f-suspense-context-loss`). Texture failure falls back to current flat-color look; the 3 s timeout → CSS fallback path is unchanged.

## 4. Jagged Tear Edge

Shader injection via `onBeforeCompile` on both clipped halves:

- Fragment shader computes distance to the tear line (world-space clip plane Y), offsets it by a noise function of world X (jag), and `discard`s fragments within the band.
- Opposite signs on top/bottom halves → complementary torn edges.
- Jag frequency/amplitude constants live alongside `TEAR_LINE` in `BoosterPackModel.tsx`.

## 5. Idle Hints

- **Glow pulse:** soft emissive/sprite pulse behind the pack, animated in `useFrame`, active only during the `idle` stage.
- **Finger hint:** DOM overlay (framer-motion loop) — a hand/chevron indicator sliding across the crimp-strip zone. Hidden permanently on first pointer-down. DOM, not 3D: cheaper and crisper.

## Testing & Verification

- Unit tests: `revealLogic.ts` state machine; eject path math where extracted as pure functions. Existing 32 tests must keep passing.
- Gates: `npm run typecheck && npm run test && npm run build`, `npx eslint src/components/pack-opener-3d/`.
- Dev page recreated at `src/app/dev/pack-test/page.tsx` (renders `PackOpener3D` with 5 fake cards) for browser iteration. 3D visuals verified by the user in browser (no headless browser on this machine).
- Mobile-first: reveal stack constrained per `max-w-sm` convention.

## Out of Scope

- GLB meshopt/draco compression (separate perf task).
- Tear sound / particle burst (not selected).
- Tailwind `bg-opacity-*` cleanup elsewhere in codebase.
- `src/features/settings/index.tsx` — user's uncommitted Privy work; do not touch.
