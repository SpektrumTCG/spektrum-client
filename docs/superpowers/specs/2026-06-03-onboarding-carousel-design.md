# Onboarding Carousel — Design

**Date:** 2026-06-03
**Status:** Approved pending implementation

## Goal

Insert a first-time onboarding/tutorial carousel **before** the connect-wallet screen.

- **Old flow:** mobile visit → `/start` (connect wallet / guest) → `/home`
- **New flow:** first mobile visit → `/onboarding` (4 slides) → `GET STARTED` → `/start` → `/home`

Reference layout: cfl.fun/home onboarding (art on top, title, body copy, full-width button). Styled with Spektrum's existing clean white + orange UI (NOT cfl's dark pixel-art). Copy adapted to Spektrum's actual TCG mechanics.

## Slides (4, NEXT-only — no skip)

| # | Title | Body | Art (existing asset) | CTA |
|---|-------|------|----------------------|-----|
| 1 | Welcome to Spektrum | A strategic trading card game. Build a deck, outsmart opponents, and rise through the ranks. | `/ui/logo.png` | NEXT |
| 2 | 1. Build Your Deck | Collect Avatars and Action cards from packs. Craft a deck that fits your strategy. | `/boosters/beginner.png` | NEXT |
| 3 | 2. Battle Opponents | Duel in AI practice, casual, ranked, or high-stakes Ante matches. The better play wins. | `/character-stocks-v2/1.png` | NEXT |
| 4 | 3. Win Rewards | Earn cards, climb the leaderboards, and unlock achievements. | `/ui/home/4.webp` | GET STARTED |

Final art per slide confirmed during implementation by viewing candidates; copy is fixed above.

## Architecture (~3 files)

- **`src/app/(auth)/onboarding/page.tsx`** — route, renders `<OnboardingFeature />`. Inherits the `(auth)` phone-frame layout (max-width 420 white card).
- **`src/features/onboarding/index.tsx`** — `"use client"` carousel:
  - Slide data array (`{ title, body, image }[]`) inline.
  - State: current slide index.
  - framer-motion `AnimatePresence` slide transition (horizontal fade/slide).
  - Progress dots (one per slide), active = orange.
  - Touch swipe left/right (reuse touch-delta pattern from `landing-page.tsx`).
  - Bottom full-width button: `NEXT` on slides 0-2 (advance), `GET STARTED` on slide 3 (finish).
  - No skip control.
- **`src/app/page.tsx`** — change mobile redirect target from `/start` → `/onboarding`.

### Persistence (show once)

- localStorage key: `spektrum:onboarded` (value `"1"`).
- On `OnboardingFeature` mount: read flag.
  - If set → `router.replace("/start")` immediately; render `null` until the check resolves (avoids flashing slides for return users).
  - If unset → render carousel.
- On `GET STARTED` → set flag → `router.push("/start")`.

### Unaffected

- Desktop `LandingPage` (page.tsx returns it for non-mobile UA) — untouched.
- Direct deep-links to `/start` still work and skip onboarding (acceptable).
- Existing `FirstTimeWelcomePopup` / `/tutorial` (in-game deck tutorial) — separate concern, unchanged.

## Testing

- First mobile load → lands on `/onboarding` slide 1.
- NEXT advances 1→2→3→4; dots track; swipe works both directions.
- GET STARTED → `/start`, flag set.
- Reload → bounces straight to `/start` (no slide flash).
- Desktop UA → still `LandingPage`.
