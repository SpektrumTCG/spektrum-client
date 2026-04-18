# Spektrum TCG — Popup & Modal Reference

> **Last updated:** March 2026  
> **Scope:** All 13 popup/modal components in the client codebase.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Design-System Base: Modal](#1-modal--design-system-base)
3. [In-Game Modals (GameBoard2D)](#in-game-modals)
   - [PlacementModal](#2-placementmodal)
   - [CardRevealModal](#3-cardrevealmodal)
   - [DiscardSelectionModal](#4-discardselectionmodal)
4. [Game-Adjacent Popups](#game-adjacent-popups)
   - [DiscardConfirmationPopup](#5-discardconfirmationpopup)
   - [AdditionalDamagePopup](#6-additionaldamagepopup)
   - [CardRewardPopup](#7-cardrewardpopup)
   - [FirstTimeWelcomePopup](#8-firsttimewelcomepopup)
5. [Wallet / Blockchain Modals](#wallet--blockchain-modals)
   - [WalletSelectorModal](#9-walletselectormodal)
   - [WalletTransactionModal](#10-wallettransactionmodal)
   - [PurchaseConfirmationModal](#11-purchaseconfirmationmodal)
6. [Meta / Account Modals](#meta--account-modals)
   - [TheRitualModal](#12-theritualmodal)
   - [MatchConfirmationModal](#13-matchconfirmationmodal)
7. [State Management: useGameStore spell modals](#state-management)
8. [Z-Index & Layering](#z-index--layering)
9. [Border Color Conventions](#border-color-conventions)
10. [Quick-Reference Table](#quick-reference-table)

---

## Architecture Overview

All popups and modals follow the same rendering pattern:

```
fixed inset-0          ← full-screen overlay (z-50)
  └─ flex centered div ← modal card
       ├─ header
       ├─ content
       └─ action buttons
```

**Visibility gate:** Every component returns `null` when its `isOpen` prop is `false` (or the equivalent guard). There are no CSS `display:none` toggles — unmounting is used throughout.

**State sources:** The three in-game modals (Placement, CardReveal, DiscardSelection) are driven by fields inside `useGameStore`'s `spellModals` object. All other popups are controlled by local state in their parent page/component.

---

## 1. Modal — Design-System Base

| Field | Value |
|-------|-------|
| **File** | `client/src/components/design-system/Modal.tsx` |
| **Exported as** | named export `Modal` + default |
| **Purpose** | Reusable primitive for building any future modal |
| **Used by** | Not yet used by production modals — available for new work |

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | — | Controls visibility |
| `onClose` | `() => void` | — | Called on close button, overlay click, or Escape key |
| `title` | `string` | — | Optional header title |
| `subtitle` | `string` | — | Optional header subtitle |
| `children` | `ReactNode` | — | Body content |
| `footer` | `ReactNode` | — | Footer content |
| `theme` | `ModalTheme` | `defaultTheme` | Override any CSS class slot |
| `className` | `string` | `''` | Extra class on the container div |
| `size` | `'small' \| 'medium' \| 'large' \| 'fullscreen'` | `'medium'` | Width preset |
| `closeOnOverlayClick` | `boolean` | `true` | Whether clicking the dark backdrop closes the modal |

### Size Presets

| Size | Max Width |
|------|-----------|
| `small` | `max-w-md` (448px) |
| `medium` | `max-w-2xl` (672px) |
| `large` | `max-w-4xl` (896px) |
| `fullscreen` | `w-full h-full` (no rounding) |

### Theming

Pass a `ModalTheme` object to override any visual slot:

```ts
interface ModalTheme {
  overlay?: string;      // the dark backdrop
  container?: string;    // the white/dark card
  header?: string;       // title area border-bottom section
  title?: string;        // h2 text
  subtitle?: string;     // p text
  content?: string;      // body padding
  footer?: string;       // border-top action area
  closeButton?: string;  // absolute ✕ button
}
```

### Buttons

| Button | Trigger | Behavior |
|--------|---------|----------|
| ✕ (close) | Click | Calls `onClose` |
| Overlay | Click (if `closeOnOverlayClick=true`) | Calls `onClose` |
| Keyboard | `Escape` key | Calls `onClose` |

---

## In-Game Modals

All three are rendered at the bottom of `GameBoard2D.tsx` and are driven by `useGameStore`'s `spellModals` state.

---

## 2. PlacementModal

| Field | Value |
|-------|-------|
| **File** | `client/src/game/components2D/PlacementModal.tsx` |
| **Mounted in** | `GameBoard2D.tsx` (line ~2508) |
| **Border color** | `border-green-500` (4px) |
| **Trigger** | Skill effects of type `deck_top` or `deck_bottom` |

### When It Appears

When a card effect requires the player to choose where to place a card — top or bottom of their deck. Controlled by `game.spellModals.placement`.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✓ | Visibility gate |
| `card` | `Card \| null` | ✓ | The card being placed |
| `title` | `string` | ✓ | Modal heading |
| `instruction` | `string` | ✓ | Instruction text beneath heading |
| `onPlacement` | `(placement: 'top' \| 'bottom') => void` | ✓ | Called when player chooses placement |
| `onCancel` | `() => void` | — | Optional cancel button |

### Buttons

| Button | Color | Behavior |
|--------|-------|----------|
| ⬆️ Place on Top | Blue (`bg-blue-600`) | Calls `onPlacement('top')` |
| ⬇️ Place on Bottom | Purple (`bg-purple-600`) | Calls `onPlacement('bottom')` |
| Cancel | Gray | Calls `onCancel` (only rendered if prop provided) |

---

## 3. CardRevealModal

| Field | Value |
|-------|-------|
| **File** | `client/src/game/components2D/CardRevealModal.tsx` |
| **Mounted in** | `GameBoard2D.tsx` (line ~2494) |
| **Border color** | `border-blue-500` (4px) |
| **Trigger** | Skill effects of type `reveal_choose`, `peek_place`, `peek_place_draw` |

### When It Appears

When a skill reveals top cards of the deck and requires the player to pick one (or more). Controlled by `game.spellModals.cardReveal`.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | — | Visibility gate |
| `revealedCards` | `Card[]` | — | The revealed card objects |
| `title` | `string` | — | Modal heading |
| `instruction` | `string` | — | Instruction text |
| `onCardSelected` | `(cardIndex: number) => void` | — | Called when a card is chosen |
| `onCancel` | `() => void` | — | Optional cancel button |
| `allowMultiSelect` | `boolean` | `false` | Enable multi-card selection |
| `maxSelectCount` | `number` | `1` | Maximum cards selectable at once |

### Buttons

| Button | Color | Condition | Behavior |
|--------|-------|-----------|----------|
| Confirm (N/M) | Blue | `allowMultiSelect=true`, ≥1 selected | Calls `onCardSelected` for each selected index |
| Cancel | Gray | `onCancel` prop provided | Calls `onCancel` |
| Individual cards | Ring highlight on select | Always clickable | Single-select: immediate `onCardSelected`; Multi-select: toggles selection |

### Selection Indicators

- Selected cards show a **yellow ring** (`ring-4 ring-yellow-400`) and a **✓ badge** (top-right, yellow).
- Each card also shows an **index badge** (top-left, blue) numbered from `#1`.

---

## 4. DiscardSelectionModal

| Field | Value |
|-------|-------|
| **File** | `client/src/game/components2D/DiscardSelectionModal.tsx` |
| **Mounted in** | `GameBoard2D.tsx` (line ~2478) |
| **Border color** | `border-red-500` (4px) |
| **Trigger** | Skill effects of type `discard`, `draw_discard`, `discard_draw`, `discard_retrieve`, `discard_search` |

### When It Appears

When a skill requires the player to choose one or more cards from their hand to discard. Controlled by `game.spellModals.discardSelection`.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✓ | Visibility gate |
| `hand` | `Card[]` | ✓ | Cards currently in player's hand |
| `title` | `string` | ✓ | Modal heading |
| `instruction` | `string` | ✓ | Instruction text |
| `minCards` | `number` | ✓ | Minimum cards that must be selected |
| `maxCards` | `number` | ✓ | Maximum cards that can be selected |
| `onConfirm` | `(selectedIndices: number[]) => void` | ✓ | Called with array of chosen indices |
| `onCancel` | `() => void` | — | Optional cancel button |

### Buttons

| Button | Color | Condition | Behavior |
|--------|-------|-----------|----------|
| Confirm Discard (N) | Red (`bg-red-600`) | `minCards ≤ selection ≤ maxCards` | Calls `onConfirm(selectedIndices)` |
| Cancel | Gray | `onCancel` prop provided | Resets selection, calls `onCancel` |
| Individual cards | Red ring on select | Always clickable | Toggles selection (capped at `maxCards`) |

### Selection Indicators

- Selected cards show a **red ring** (`ring-4 ring-red-400`) and a **✗ badge** (top-right, red circle).

---

## Game-Adjacent Popups

---

## 5. DiscardConfirmationPopup

| Field | Value |
|-------|-------|
| **File** | `client/src/components/DiscardConfirmationPopup.tsx` |
| **Mounted in** | `GameBoard2D.tsx` (line ~2435) |
| **Border color** | `border-gray-600` |
| **Trigger** | Automatic — skill effects that contain "you may discard" in their effect text |

### When It Appears

When a card has an optional discard mechanic. The player chooses whether to trigger the bonus effect by discarding a card or skip it.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✓ | Visibility gate |
| `card` | `Card \| null` | ✓ | The card being considered for discard |
| `onConfirm` | `() => void` | ✓ | Player chose to discard |
| `onCancel` | `() => void` | ✓ | Player chose to keep the card |
| `bonusEffect` | `string` | — | Human-readable description of the bonus |

### Buttons

| Button | Color | Behavior |
|--------|-------|----------|
| Keep Card | Gray (`bg-gray-600`) | Calls `onCancel` — card played normally, no bonus |
| Discard for Bonus | Orange (`bg-spektrum-orange`) | Calls `onConfirm` — triggers bonus effect |

---

## 6. AdditionalDamagePopup

| Field | Value |
|-------|-------|
| **File** | `client/src/components/AdditionalDamagePopup.tsx` |
| **Mounted in** | `GameBoard2D.tsx` (line ~2456) |
| **Border color** | `border-spektrum-orange` |
| **Trigger** | Player plays "Energy Dagger" or equivalent card that allows spending extra spektra for bonus damage |

### When It Appears

After the base attack is declared, this popup lets the attacker optionally spend additional spektra cards to boost the damage by +1 per spektra paid.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✓ | Visibility gate |
| `availableSpektra` | `number` | ✓ | How many extra spektra the player can spend |
| `onConfirm` | `(extraSpektraAmount: number) => void` | ✓ | Called with number of extra spektra to spend |
| `onCancel` | `() => void` | ✓ | Called when player cancels the boost |
| `currentDamage` | `number` | ✓ | Base damage before bonus |

### Internal State

| State | Type | Description |
|-------|------|-------------|
| `extraSpektra` | `number` | Current spektra the player has chosen to spend |

### Buttons

| Button | Color | Behavior |
|--------|-------|----------|
| − | Gray | Decrements `extraSpektra` (min 0) |
| + | Gray | Increments `extraSpektra` (max `availableSpektra`) |
| Cancel | Gray | Resets to 0, calls `onCancel` |
| Attack (+N) | Orange | Calls `onConfirm(extraSpektra)`, resets to 0 |

---

## 7. CardRewardPopup

| Field | Value |
|-------|-------|
| **File** | `client/src/components/CardRewardPopup.tsx` |
| **Mounted in** | `BoosterPacksPage.tsx`, `InventoryPage.tsx`, `PremadeDecksPage.tsx` |
| **Border color** | `border-orange-500` (2px, with orange glow shadow) |
| **Trigger** | After a successful pack open or deck purchase |

### When It Appears

Shown to the player after they receive new cards — from booster packs or premade deck claims. Displays all earned cards with artwork, name, and rarity badge.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | — | Visibility gate |
| `onClose` | `() => void` | — | Closes the popup |
| `title` | `string` | — | Heading (e.g. "Cards Received!") |
| `subtitle` | `string` | — | Sub-heading (e.g. pack name) |
| `cards` | `Card[]` | — | Array of cards to display |
| `onMintCards` | `() => Promise<void>` | — | Optional mint callback |
| `showMintButton` | `boolean` | `false` | Whether to show a Mint button |

### Rarity Badge Colors

| Rarity | Background | Text |
|--------|-----------|------|
| Mythic | Gold `#FFD700` | Black |
| Super Rare | Purple `#A855F7` | White |
| Rare | Blue `#3B82F6` | White |
| Uncommon | Green `#22C55E` | White |
| Common | Gray `#9CA3AF` | White |

### Notes on Mint Props

`onMintCards` and `showMintButton` are present in the props interface but **no mint button is rendered** in the current UI. The footer always shows only "View Collection". These props exist for future use if on-demand minting is added; the footer currently displays a static note: *"All cards automatically minted as cNFTs and added to your wallet"*.

### Buttons

| Button | Color | Behavior |
|--------|-------|----------|
| ✕ (header) | Ghost/white | Calls `onClose` |
| View Collection | Yellow→Orange gradient | Calls `onClose` |

---

## 8. FirstTimeWelcomePopup

| Field | Value |
|-------|-------|
| **File** | `client/src/components/FirstTimeWelcomePopup.tsx` |
| **Mounted in** | `HomePage.tsx` (line ~91) |
| **Border color** | `border-orange-500/60` (2px) |
| **Trigger** | First visit — triggered by `HomePage` when it detects a first-time user session |

### When It Appears

Shown once to new players on the home screen. Encourages them to complete the tutorial to receive a free starter deck.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✓ | Visibility gate |
| `onClose` | `() => void` | ✓ | Closes the popup |
| `onDismiss` | `() => void` | ✓ | Marks the popup as permanently dismissed (stored in parent state) |

### Buttons

| Button | Color | Behavior |
|--------|-------|----------|
| ✕ (corner) | Gray text | Calls `onDismiss()` then `onClose()` |
| Start Tutorial | Orange gradient | Calls `onDismiss()`, navigates to `/tutorial` |
| Skip for Now | Gray/muted | Calls `onDismiss()` then `onClose()` |

---

## Wallet / Blockchain Modals

---

## 9. WalletSelectorModal

| Field | Value |
|-------|-------|
| **File** | `client/src/components/WalletSelectorModal.tsx` |
| **Mounted in** | `SolanaWalletConnect.tsx` (line ~82) |
| **Border color** | `border-orange-500` (2px, with orange glow shadow) |
| **Trigger** | User clicks any "Connect Wallet" button in the app |

### When It Appears

Opens when the player attempts to connect their Solana wallet. Scans `window` for installed wallet adapters (Phantom, Solflare, Backpack, Trust Wallet, etc.) and renders a button for each detected wallet. If none are installed, shows install links for the top three recommended wallets.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✓ | Visibility gate |
| `onClose` | `() => void` | ✓ | Closes the modal |
| `onSelectWallet` | `(walletName: string) => void` | ✓ | Called with the key of the chosen wallet |

### Supported Wallets

| Wallet Key | Install URL |
|------------|-------------|
| `phantom` | https://phantom.app/download |
| `solflare` | https://solflare.com/download |
| `backpack` | https://backpack.app/downloads |
| `trustWallet` | https://trustwallet.com/download |
| `jupiter` | https://jup.ag/mobile |
| `magicEden` | https://wallet.magiceden.io |
| `glow` | https://glow.app |
| `slope` | https://slope.finance |
| `coin98` | https://coin98.com/wallet |
| `seeker` | https://seeker.solana.com |

### Buttons

| Button | Color | Behavior |
|--------|-------|----------|
| ✕ (corner) | Orange text | Calls `onClose` |
| [Wallet name] | Orange-bordered card | Calls `onSelectWallet(key)` then `onClose` |
| [Install link] | Orange-bordered anchor | Opens install URL in new tab |

### PWA Note

When running as a standalone PWA (`isStandalonePWA()` returns true), the modal shows an info banner about deep-link mode.

---

## 10. WalletTransactionModal

| Field | Value |
|-------|-------|
| **File** | `client/src/components/WalletTransactionModal.tsx` |
| **Mounted in** | Not yet wired to a page — available for use |
| **Border color** | `border-gray-300 / border-gray-600` (dark mode toggle) |
| **Trigger** | Any generic SOL/USDC purchase flow |

### When It Appears

A reusable single-payment confirmation modal. Supports both SOL and USDC pricing, shows the connected wallet's balance, blocks confirmation if funds are insufficient, and transitions to a success/error state after the `onConfirm` async call resolves.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | — | Visibility gate |
| `onClose` | `() => void` | — | Closes the modal |
| `onConfirm` | `() => Promise<void>` | — | Async transaction handler; must resolve/reject |
| `item` | `TransactionItem` | — | `{ name, description?, imageUrl?, quantity? }` |
| `costInSol` | `number` | — | *(deprecated)* Legacy SOL price |
| `costInUsdc` | `number` | — | USDC price (preferred over `costInSol`) |
| `title` | `string` | `'Confirm Purchase'` | Modal heading |

### States

| State | Description |
|-------|-------------|
| `idle` | Default — shows price, balance, and action buttons |
| Processing | Spinner replaces "Confirm Purchase" text; close button hidden |
| `success` | ✓ icon shown; modal auto-closes after 2 seconds |
| `error` | Red error banner shown; `isProcessing` reset to `false` |

### Buttons

| Button | Color | Condition | Behavior |
|--------|-------|-----------|----------|
| Cancel | Gray border | Not processing | Calls `onClose` |
| Confirm Purchase | Orange | Wallet connected & has balance | Calls `onConfirm()`, sets processing state |

---

## 11. PurchaseConfirmationModal

| Field | Value |
|-------|-------|
| **File** | `client/src/components/PurchaseConfirmationModal.tsx` |
| **Mounted in** | `BoosterPacksPage.tsx` (line ~692), `InventoryPage.tsx`, `PremadeDecksPage.tsx` (line ~382) |
| **Border color** | `border-orange-500` (2px, with orange + purple glow) |
| **Trigger** | Player clicks "Buy" on a booster pack or premade deck |

### When It Appears

The primary purchase modal for the shop. Offers two payment paths — a mock USD path (dev/testing) and a real on-chain SOL path. The SOL path executes the `initializePack` instruction on the Spektrum Gacha smart contract.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | — | Visibility gate |
| `onClose` | `() => void` | — | Closes the modal |
| `onConfirm` | `() => void` | — | Mock USD purchase callback |
| `onConfirmSol` | `() => void` | — | Optional override for SOL path (skips in-modal signing) |
| `item` | `PurchaseItem` | — | Product details (see below) |
| `title` | `string` | `'Confirm Purchase'` | Modal heading |
| `isProcessing` | `boolean` | `false` | Locks USD button into spinner state |

### PurchaseItem Interface

```ts
interface PurchaseItem {
  name: string;
  description?: string;
  imageUrl?: string;
  quantity?: number;
  price: number;         // USD price
  solPrice?: number;     // SOL price (overrides hardcoded defaults)
  packType?: 'beginner' | 'advanced' | 'expert';
}
```

### Default SOL Prices (if `solPrice` not provided)

| Key | SOL |
|-----|-----|
| `booster` | 0.01 SOL |
| `premade` | 0.05 SOL |

### On-Chain SOL Flow (in-modal)

1. Checks wallet connection; re-authorizes if stale (error code 4100).
2. Derives `BoosterPack` PDA using seeds: `["booster_pack", owner_pubkey, pack_nonce]`.
3. Pre-flight balance check — aborts before showing wallet UI if funds are insufficient.
4. Builds and sends the `initializePack` Anchor instruction.
5. Awaits confirmation at `'confirmed'` commitment.
6. Calls `onConfirm()` on success.

**Program ID:** `HPmXtAs37ShpfrmE55gWVDQB53KwZDf7jii1ppABRxXN`  
**Treasury:** `7N57HGeEuVnzveE2G4vanJodnfXBGbAQdwFkwLPAUXnb`

### Buttons

| Button | Color | Behavior |
|--------|-------|----------|
| Cancel | Gray border | Calls `onClose` (disabled while processing) |
| Pay USD (Mock) | Yellow→Orange gradient | Calls `onConfirm()` — mock dev flow |
| Pay ◎ N SOL (Devnet) | Purple gradient | Executes on-chain `initializePack` |

---

## Meta / Account Modals

---

## 12. TheRitualModal

| Field | Value |
|-------|-------|
| **File** | `client/src/components/TheRitualModal.tsx` |
| **Mounted in** | `TutorialPage.tsx` (line ~901) |
| **Border color** | `border-orange-500/50` (2px) |
| **Trigger** | Fired after the player completes the tutorial |

### When It Appears

A 3-step onboarding wizard that assigns a new player their first faction and element, then claims their free starter deck from the server.

### Steps

| Step | Name | Description |
|------|------|-------------|
| 1 | **Choose Your Path** | Player picks a faction: "The Guardians" (Kobar & Borah) or "The Corrupted" (Kuhaka & Kujana) |
| 2 | **Elemental Affinity** | Animated coin-spin randomly assigns Fire or Water element to the player |
| 3 | **Complete** | Confirmation screen; "Start Building Your Deck" navigates to `/deck-builder` |

### Deck ID Mapping

| Faction | Element | Deck ID |
|---------|---------|---------|
| Guardians | Fire | `starter-genesis-fire-kobar-borah-deck` |
| Guardians | Water | `starter-genesis-water-kobar-borah-deck` |
| Corrupted | Fire | `starter-genesis-fire-kuhaka-kujana-deck` |
| Corrupted | Water | `starter-genesis-water-kuhaka-kujana-deck` |

### API Call

`POST /api/purchases/claim-starter-deck` — body `{ walletAddress, deckId }`  
Handles `"Starter deck already claimed"` gracefully by syncing from the database and continuing.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✓ | Visibility gate |
| `onClose` | `() => void` | ✓ | Closes the modal |
| `onComplete` | `(faction, element, deckId) => void` | ✓ | Called when deck is successfully claimed |

### Buttons

| Button | Step | Color | Behavior |
|--------|------|-------|----------|
| ✕ (corner) | All | Gray | Calls `onClose` |
| [Faction card] | 1 | Border highlight | Selects faction |
| Confirm Your Path | 1 | Orange gradient | Advances to step 2, starts spin |
| Claim Your Deck | 2 | Orange gradient | POSTs claim request, advances to step 3 |
| Start Building Your Deck | 3 | Orange gradient | Calls `onClose`, navigates to `/deck-builder` |

---

## 13. MatchConfirmationModal

| Field | Value |
|-------|-------|
| **File** | `client/src/components/ante/MatchConfirmationModal.tsx` |
| **Mounted in** | `AnteModeManager.tsx` (line ~208) |
| **Border color** | `bg-spektrum-dark` header, `bg-white` body |
| **Trigger** | Ante matchmaking finds a match (`MatchFoundData` received from server) |

### When It Appears

When the ante matchmaking system pairs two players, this modal shows both wagered cards side-by-side, warns about permanent NFT loss on defeat, and requires the player to check a checkbox before the Accept button is enabled.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `matchData` | `MatchFoundData` | ✓ | Contains `battleId`, `yourCard`, and `opponent` data |
| `onConfirm` | `() => void` | ✓ | Called when player accepts the battle |
| `onCancel` | `() => void` | ✓ | Called when player declines |

### MatchFoundData Shape

```ts
{
  battleId: string;
  yourCard: { cardName, rarity, imagePath };
  opponent: {
    playerId: string;
    walletAddress: string;
    wageredCard: { cardName, rarity, imagePath };
  };
}
```

### Internal State

| State | Type | Description |
|-------|------|-------------|
| `confirmed` | `boolean` | Tracks checkbox acknowledgement |

### On Accept

1. Calls `useAnteBattleStore.setAnteBattle(battleId, yourCard, opponentCard, 'player', opponentPlayerId)`
2. Calls `onConfirm()`
3. Navigates to `/game` after 500ms delay

### Buttons

| Button | Color | Condition | Behavior |
|--------|-------|-----------|----------|
| Decline & Cancel | Gray | Always | Calls `onCancel` |
| Accept & Battle | Orange | Checkbox checked | Triggers ante battle flow |

---

## State Management

### useGameStore — spellModals

The three in-game modals are controlled by a single `spellModals` object inside `useGameStore`. Each modal slot has its own open/data fields and a corresponding hide method.

```ts
// Exact shape from useGameStore.ts interface (lines 92–110)
spellModals: {
  discardSelection: {
    isOpen: boolean;
    cards: Card[];           // cards currently in hand available for selection
    count: number;           // how many must be discarded
    onConfirm: ((selectedIndices: number[]) => void) | null;
  };
  cardReveal: {
    isOpen: boolean;
    cards: Card[];           // the revealed card objects
    canChoose: boolean;      // if false, Cancel button is hidden
    onChoose: ((selectedIndex: number) => void) | null;
  };
  placement: {
    isOpen: boolean;
    card: Card | null;       // the card being placed
    onPlacement: ((placement: 'top' | 'bottom') => void) | null;
  };
}

// Note: the modal components receive these fields mapped to their own prop names
// (e.g., cardReveal.cards → revealedCards prop, cardReveal.onChoose → onCardSelected prop)

// Hide (close) methods
game.hideDiscardSelectionModal();
game.hideCardRevealModal();
game.hidePlacementModal();
```

These are populated by `gameEffectProcessor.ts` and `spellEffectHandler.ts` when processing spell effects.

---

## Z-Index & Layering

All popups and modals use `z-50` (Tailwind = `z-index: 50`). There is no explicit z-stacking hierarchy between them — the expectation is that only one modal is visible at a time.

| Layer | z-index | Usage |
|-------|---------|-------|
| Game board | `z-0` to `z-10` | Cards, avatars, field |
| HUD / game UI | `z-20` | Phase bar, hand area |
| Toast notifications | `z-40` | Sonner toast stack |
| **Modals / Popups** | **`z-50`** | All 13 components |

---

## Border Color Conventions

Border color is a reliable indicator of a modal's category at a glance:

| Color | Category | Components |
|-------|----------|------------|
| `border-orange-500` | Wallet / shop / reward | WalletSelectorModal, PurchaseConfirmationModal, CardRewardPopup |
| `border-spektrum-orange` | In-game boost popup | AdditionalDamagePopup |
| `border-red-500` | Destructive / discard | DiscardSelectionModal |
| `border-blue-500` | Information / reveal | CardRevealModal |
| `border-green-500` | Placement / neutral choice | PlacementModal |
| `border-gray-600` | Mild / optional action | DiscardConfirmationPopup |
| `border-orange-500/50–60` | Onboarding / meta | TheRitualModal, FirstTimeWelcomePopup |
| `bg-spektrum-dark header` | Competitive / ante | MatchConfirmationModal |

---

## Quick-Reference Table

| # | Component | File | Mounted In | Trigger | Buttons |
|---|-----------|------|-----------|---------|---------|
| 1 | `Modal` | `design-system/Modal.tsx` | (base primitive) | Programmatic | ✕, overlay click, Escape |
| 2 | `PlacementModal` | `game/components2D/PlacementModal.tsx` | GameBoard2D | deck_top / deck_bottom effects | Place on Top, Place on Bottom, Cancel |
| 3 | `CardRevealModal` | `game/components2D/CardRevealModal.tsx` | GameBoard2D | reveal_choose / peek_place effects | Card clicks, Confirm, Cancel |
| 4 | `DiscardSelectionModal` | `game/components2D/DiscardSelectionModal.tsx` | GameBoard2D | discard-type effects | Card clicks, Confirm Discard, Cancel |
| 5 | `DiscardConfirmationPopup` | `components/DiscardConfirmationPopup.tsx` | GameBoard2D | "you may discard" skill text | Keep Card, Discard for Bonus |
| 6 | `AdditionalDamagePopup` | `components/AdditionalDamagePopup.tsx` | GameBoard2D | Energy Dagger card | −, +, Cancel, Attack |
| 7 | `CardRewardPopup` | `components/CardRewardPopup.tsx` | BoosterPacksPage, InventoryPage, PremadeDecksPage | Pack open / deck claim | ✕, View Collection |
| 8 | `FirstTimeWelcomePopup` | `components/FirstTimeWelcomePopup.tsx` | HomePage | First-time user flag | ✕, Start Tutorial, Skip |
| 9 | `WalletSelectorModal` | `components/WalletSelectorModal.tsx` | SolanaWalletConnect | "Connect Wallet" clicked | ✕, Wallet buttons, Install links |
| 10 | `WalletTransactionModal` | `components/WalletTransactionModal.tsx` | (available, not wired) | Generic purchase | Cancel, Confirm Purchase |
| 11 | `PurchaseConfirmationModal` | `components/PurchaseConfirmationModal.tsx` | BoosterPacksPage, InventoryPage, PremadeDecksPage | "Buy" clicked | Cancel, Pay USD, Pay SOL |
| 12 | `TheRitualModal` | `components/TheRitualModal.tsx` | TutorialPage | Tutorial completion | Faction pick, Confirm, Claim, Finish |
| 13 | `MatchConfirmationModal` | `components/ante/MatchConfirmationModal.tsx` | AnteModeManager | Ante match found | Decline, Accept & Battle |
