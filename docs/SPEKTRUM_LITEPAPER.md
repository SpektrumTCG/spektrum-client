# Spektrum Trading Card Game
## Litepaper v1.4

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Vision & Mission](#vision--mission)
3. [Game Overview](#game-overview)
4. [Core Mechanics](#core-mechanics)
5. [Card System](#card-system)
6. [Blockchain Integration](#blockchain-integration)
7. [Economy & Tokenomics](#economy--tokenomics)
8. [Technical Architecture](#technical-architecture)
9. [PVP Architecture](#pvp-architecture)
10. [Roadmap](#roadmap)
11. [Team & Community](#team--community)

---

## Executive Summary

Spektrum is a next-generation trading card game (TCG) that combines the strategic depth of traditional card games with cutting-edge 3D visualization and live blockchain infrastructure. Using wallet-based identity through Solana, Spektrum delivers an immersive browser-based gaming experience with cloud-synced collections, on-chain SOL payments, and gasless card reveals powered by MagicBlock Ephemeral Rollups.

**Key Highlights:**
- Fully 3D card game experience in your browser
- Multi-wallet support (Phantom, Solflare, Backpack) via Wallet Standard protocol
- Cross-device gameplay with cloud-synced decks and collections
- Strategic depth with elemental synergies and tribal mechanics
- Server-authoritative deck validation and card ownership tracking
- Real-time multiplayer with WebSocket-based synchronization
- **On-chain SOL payments** via deployed Anchor smart contract (Solana devnet)
- **Gasless booster pack reveals** via MagicBlock Ephemeral Rollups with VRF randomness
- **Seeker Genesis Token (SGT) holder rewards** — exclusive Expert packs for verified Seeker device owners

**Live on Solana Devnet:**
- Anchor program deployed: `HPmXtAs37ShpfrmE55gWVDQB53KwZDf7jii1ppABRxXN`
- CardPool PDA (101 GENESIS cards): `5QTX5hn3eUykBkw68qUeu2X3iTQMxvbKQN7879qv2Y4L`
- Treasury: `7N57HGeEuVnzveE2G4vanJodnfXBGbAQdwFkwLPAUXnb`

**Future Vision:**
- True card ownership via Solana Compressed NFTs (cNFTs) on mainnet
- Player-to-player trading marketplace
- Competitive ranked seasons with rewards

---

## Vision & Mission

### Vision
To create the premier blockchain-based trading card game that bridges traditional TCG gameplay with the benefits of true digital ownership, creating a sustainable ecosystem where players can collect, trade, and compete with cards they truly own.

### Mission
- Deliver a polished, accessible TCG experience to both crypto-native and traditional gamers
- Establish fair and transparent card economics through blockchain verification and provably fair randomness
- Build a thriving competitive scene with ranked play and tournaments
- Foster a community-driven ecosystem where player feedback shapes the game

---

## Game Overview

### What is Spektrum?

Spektrum is a 1v1 turn-based trading card game where players build decks around powerful Avatars and support them with Action Cards. The game features five elemental types (Spektra), each with unique playstyles and synergies.

### Core Experience

**For Collectors:** Acquire rare and powerful cards through booster packs, premade decks, and "The Ritual" starter deck. Pay with SOL or mock USD. Every SOL purchase creates a verifiable on-chain record. Card reveals use MagicBlock Ephemeral Rollups for gasless, provably fair randomness.

**For Competitors:** Build optimized decks, master elemental synergies, and battle opponents in real-time multiplayer or against AI.

**For Traders:** *(Coming soon)* Future NFT integration will enable player-to-player trading where card values are determined by rarity, utility, and demand.

---

## Core Mechanics

### Turn Structure

Each turn consists of distinct phases:

1. **Setup Phase** - (First turn only) Place your starting Active Avatar
2. **Refresh Phase** - Refresh exhausted spektra and reset per-turn limits. Burn damage triggers here.
3. **Draw Phase** - Draw a card from your deck
4. **Main Phase 1** - Play cards, add to spektra pile, activate abilities, equip items
5. **Battle Phase** - Declare attacks with your active Avatar
6. **Damage Phase** - Resolve combat damage and trigger effects
7. **Main Phase 2** - Additional opportunity to play cards after combat
8. **Recheck Phase** - Check for defeated avatars, promote reserves
9. **End Phase** - Resolve end-of-turn effects (Poison damage), pass turn to opponent

### The Avatar System

Avatars are the heart of your deck. Each player has:
- **1 Active Avatar** - Your frontline fighter that attacks and defends
- **Up to 2 Reserve Avatars** - Backup fighters waiting in reserve

**Avatar Levels:**
- **Level 1 Avatars** - Basic fighters, easier to deploy
- **Level 2 Avatars** - Evolved forms with enhanced stats and abilities

**Placing Avatars:**
- During the **Setup Phase**, place your first Level 1 Avatar as your Active Avatar
- After Setup, playing an Avatar card when you already have an Active Avatar places it in **Reserve** (if slots available)
- Maximum 2 Reserve Avatars at any time

**Switching Avatars:**
- During Main Phases, you can manually switch your Active Avatar with a Reserve Avatar
- Switching costs **1 Spektra** from your Spektra Pile
- The current Active Avatar moves to Reserve, and the chosen Reserve becomes Active
- Damage counters persist during manual switches

**When Your Active Avatar is Defeated:**
- You **lose 1 Life Card** (it goes to your hand)
- If you have Reserve Avatars, you must **select one** to become your new Active Avatar
- If you have **no Reserve Avatars**, you **immediately lose the game**

**Damage Counter Persistence:**
- Damage counters persist when an Avatar **evolves** (Level 1 → Level 2)
- Damage counters persist when you **manually switch** between Active and Reserve positions
- When a Reserve Avatar is **automatically promoted** after your Active Avatar dies, its counters are reset
- Healing effects can also remove damage counters

**Passive Skills in Reserve:**
- Most passive skills only work when the Avatar is your **Active** fighter
- Some special passive skills have **"active_or_reserve"** scope - these continue working even while the Avatar is in Reserve
- Check each Avatar's passive skill description to see if it works from reserve

### Resource System: Spektra

Spektra is the primary resource used to:
- Play Avatar cards
- Cast Spell cards
- Activate equipment abilities
- Trigger special effects

**How to Generate Spektra:**
- During either Main Phase, you may place **1 Avatar card** from your hand into your **Spektra Pile**
- **Only Avatar cards** can be placed in the Spektra Pile (not spells or equipment)
- **Limit: 1 card per turn** - You can only add one Avatar to your Spektra Pile each turn
- Each Avatar provides spektra matching its **element** (Fire Avatar = Fire Spektra, Water Avatar = Water Spektra, etc.)

**Using Spektra:**
- When playing a card or activating an ability, its spektra cost is shown (e.g., `['fire', 'fire', 'neutral']`)
- You must have matching spektra in your pile to pay the cost
- Used spektra moves to your **Used Spektra Pile** until your next Refresh Phase

### Life Cards & Winning Conditions

At the start of each game, both players draw **4 cards face-down** as their **Life Cards**. These represent your life force in battle.

**Life Card Rules:**
- Life Cards are placed face-down and hidden from both players
- When your Avatar is defeated in battle, you lose 1 Life Card
- Lost Life Cards go to your **hand** (not the graveyard)
- This can give you a strategic advantage with more cards to play

**Winning the Game:**
- **You win** when your opponent loses all 4 of their Life Cards
- **You win** when your opponent's Active Avatar is defeated and they have no Reserve Avatars
- **You win** when your opponent cannot draw from an empty deck and has no Life Cards
- **You lose** when you lose all 4 of your Life Cards
- **You lose** when your Active Avatar is defeated and you have no Reserve Avatars
- **You lose** when you cannot draw from an empty deck and have no Life Cards
- The game ends immediately when any of these conditions are met

### Combat System

**Attack & Health:**
- Each Avatar has Attack and Health stats
- Damage dealt equals the attacking Avatar's Attack value
- When Health reaches 0, the Avatar is defeated

**Status Effects (Counters):**
| Counter | Effect | Trigger |
|---------|--------|---------|
| Bleed | Damage over time | When Active Avatar uses an Active Skill |
| Burn | Fire damage per turn | During Refresh Phase |
| Poison | Reduces max health | End Phase |
| Stun | Cannot attack | Immediate |
| Shield | Absorbs damage | When taking damage |

### Avatar Evolution

Level 1 Avatars can evolve into more powerful Level 2 forms, but evolution has strict rules:

**Evolution Requirements:**
1. **Summoning Sickness** - An Avatar cannot evolve on the same turn it enters the field; it must have been in play for at least 1 full turn. This rule is enforced in both vs-AI and multiplayer/wager modes.
2. **Same Tribe** - Must evolve into the same tribe (e.g., Kobar → Kobar, Borah → Borah)
3. **Target must be Level 1** - You can only evolve a Level 1 Avatar; you cannot evolve a Level 2 Avatar further.

**Evolution Examples:**
| From | To | Valid? | Reason |
|------|-----|--------|--------|
| Kobar Lv1 (in play ≥1 turn) | Kobar Lv2 | Yes | Same tribe, Level 1 target |
| Borah Lv1 (in play ≥1 turn) | Borah Lv2 | Yes | Same tribe, Level 1 target |
| Kobar Lv1 (placed this turn) | Kobar Lv2 | No | Summoning sickness |
| Kobar Lv2 | Kobar Lv2 | No | Target must be Level 1 |
| Kobar Lv1 | Borah Lv2 | No | Tribe mismatch |

### Hand & Resource Limits

**Opening Hand:**
- Each player begins the game with **6 cards** in hand
- The game guarantees at least **1 Level 1 Avatar** in your opening hand — one is pulled directly from the deck first, then 5 more cards are drawn
- If no Level 1 Avatar ends up in hand after the initial draw, an automatic **Mulligan** occurs: the hand is shuffled back into the deck and redrawn once
- This rule applies to both vs-AI and multiplayer modes

**Maximum Hand Size:**
- The maximum hand size is **10 cards**
- If a player holds more than 10 cards at the end of their turn, they must discard down to 10

**Deck Out:**
- If a player cannot draw a card from an empty deck (and has no Life Cards to move), they **immediately lose the game**

### Deck Building Restrictions

**Card Copy Limits:**
- All cards: Up to **4 copies** per deck

**Deck Size:** Minimum 40, Maximum 60 cards

**Life Card Origin:**
- At the start of the match, after decks are shuffled, players draw the top 4 cards of their deck
- These are placed face-down as Life Cards and removed from the drawable deck count

### Equipment & Item Rules

**Item Usage:**
- You may play **1 Item card per turn** during either Main Phase
- You must have the Spektra to pay for it

**Equipment Capacity:**
- An Avatar can hold a maximum of **2 Equipment Cards** at any time
- If an Avatar is at full capacity, the player must first remove an existing Equipment card before attaching a new one

### Turn Phasing & Death

**Main Phase 2 Resources:**
- Spektra does **not refresh** at the start of Main Phase 2
- Players must save unspent Spektra from Main Phase 1 if they wish to use cards after the Battle Phase

**Immediate Promotion:**
- If an Active Avatar is defeated during the Damage Phase, the "Recheck" happens instantaneously
- The player must promote a Reserve Avatar immediately before play proceeds to Main Phase 2
- There is never an "Empty Board" state during a Main Phase

### Card Zones & Interactions

**The Spektra Pile:**
- Cards placed in the Spektra Pile are considered "Exiled Energy"
- They lose their Avatar stats/types
- They cannot be targeted, destroyed, or returned to the hand/deck by any card effect

**Reserve Overflow:**
- If a player's Reserve slots are full (Max 2), any effect that attempts to summon or spawn a unit into the Reserve fails
- The spell fizzles or the card returns to hand

**Graveyard:**
- When an Avatar is defeated or an Equipment card is destroyed, it moves to the Graveyard

### Status & Stats Rules

**Negative Stat Floor:**
- An Avatar's Attack or Health cannot drop below **0**
- If a debuff would reduce stats below 0, they remain at 0
- Attacks with 0 Attack deal 0 damage

**Status Timing:**
- **Burn:** Triggers during the **Refresh Phase** at the start of turn
- **Bleed:** Triggers when the affected Active Avatar uses an **Active Skill**
- **Poison:** Triggers during the **End Phase**

**Evolution Math:**
- When an Avatar evolves, existing damage counters persist
- Calculation: New Current HP = Old Current HP + (New Max HP - Old Max HP)

### Field Cards

**Global Unique Rule:**
- Only one Field Card can be active at a time
- If a player plays a new Field Card, the existing Field Card (regardless of owner) is destroyed

**Override Cost:**
- To play a Field Card when one already exists, the cost is **+1 Spektra** from its card cost

---

## Card System

### Card Types

#### 1. Avatar Cards
Your fighters and the core of your deck.

| Attribute | Description |
|-----------|-------------|
| Element | Fire, Water, Ground, Air, or Neutral |
| Tribe | Kobar, Borah, Kuhaka, Kujana, or Kuku |
| Level | 1 (basic) or 2 (evolved) |
| Attack | Damage dealt in combat |
| Health | Damage absorbed before defeat |
| Skills | Active abilities (costs spektra) |
| Passive | Always-active effects |

#### 2. Spell Cards
One-time effects that can turn the tide of battle.

- **Standard Spells** - Play during your Main Phase
- **Quick Spells** - Can be played in response to opponent actions

#### 3. Equipment Cards
Attachments that enhance your Avatars.

- Provide stat bonuses
- Grant new abilities
- Have activation costs and usage limits

#### 4. Ritual Armor Cards
Protective gear that grants powerful effects when activated.

- **Activation** - Pay the spektra cost written on the card
- **Effects** - Additional damage, damage reduction, or special abilities
- **Strategic Use** - Time your activation for maximum impact

#### 5. Item Cards
Consumable cards for immediate one-time effects.

- **Single Use** - Discarded after use
- **1 Per Turn** - Limited to one Item card per turn (must have Spektra to pay for it)
- **Versatility** - Healing, buffs, or utility effects

#### 6. Field Cards
Environmental effects that impact both players.

### Elements (Spektra Types)

| Element | Playstyle | Strengths | Status |
|---------|-----------|-----------|--------|
| **Fire** | Aggressive | High damage, burn effects, AoE | Available |
| **Water** | Control | Healing, debuffs, board manipulation | Available |
| **Ground** | Defensive | High health, shields, stability | *Coming Soon* |
| **Air** | Speed | Draw power, evasion, flexibility | *Coming Soon* |
| **Neutral** | Support | Works with any element, utility | Available |

*Note: Ground and Air elements will be introduced in the full game launch. The current version features Fire, Water, and Neutral elements.*

### Tribes

Tribes define the origin and nature of Avatars. Each tribe has unique lore and gameplay synergies:

| Tribe | Lore | Gameplay Focus |
|-------|------|----------------|
| **Kobar** | Male Masked Avatars - Warriors who hide their identity behind sacred masks | Attack bonuses, aggressive skills |
| **Borah** | Female Masked Avatars - Guardians who channel power through ceremonial masks | Health synergies, defensive abilities |
| **Kuhaka** | Consumed Males - Men who embraced darkness and transformed into monsters | Spell enhancement, dark magic |
| **Kujana** | Consumed Females - Women who embraced darkness and transformed into monsters | Passive abilities, curse effects |
| **Kuku** | Pure Monsters - Creatures born from chaos itself | Unpredictable effects, wild power |

**Tribe Synergies:**
- Cards of the same tribe often have abilities that boost each other
- Some skills require specific tribes to be present on the field
- Evolution requires matching tribes (Kobar → Kobar, Borah → Borah, etc.)

### Card Rarity

| Rarity | Characteristics |
|--------|-----------------|
| Common | Basic cards, core mechanics |
| Uncommon | Slightly enhanced stats or effects |
| Rare | Enhanced stats or abilities |
| Super Rare | Powerful unique effects |
| Mythic | Game-changing abilities, special variants |

*Rarity distribution in packs varies by pack type. Mythic variants use special suffixes (e.g., GEN-039-MYTHIC).*

---

## Blockchain Integration

### Current Implementation (Live on Solana Devnet)

#### Multi-Wallet Support
Spektrum supports all major Solana wallets via the **Wallet Standard** protocol:

- **Phantom** — Desktop browser, mobile PWA deeplinks
- **Solflare** — Desktop and mobile
- **Backpack** — xNFT wallet
- **No Passwords** — Wallet signature-based authentication
- **Cross-Device Sync** — Collection and decks follow your wallet address across all devices

#### On-Chain SOL Payments

Booster packs and premade decks can be purchased with SOL via a deployed Anchor smart contract:

- **Program ID:** `HPmXtAs37ShpfrmE55gWVDQB53KwZDf7jii1ppABRxXN` (Solana devnet)
- **Treasury:** `7N57HGeEuVnzveE2G4vanJodnfXBGbAQdwFkwLPAUXnb`
- **Atomic transaction:** The `initialize_pack` instruction simultaneously transfers SOL to the treasury and creates a `BoosterPack` PDA in a single transaction — no partial-failure risk
- **Pre-flight balance check:** The client verifies sufficient SOL balance before asking the user to sign
- **PDA seeds:** `[b"booster_pack", owner_pubkey, pack_nonce_u64_le]` — nonce is generated client-side so the PDA address is known before signing

Payment flow:
```
User clicks "Pay ◎ X SOL"
  → Client checks wallet balance
  → Derives BoosterPack PDA
  → Builds initialize_pack instruction (priceLamports = packPrice)
  → User signs via wallet popup
  → Transaction confirmed on Solana devnet
  → Pack granted to inventory
```

#### MagicBlock Ephemeral Rollups (Live on Devnet)

When a player opens a booster pack from their inventory with a wallet connected, card reveals happen on **MagicBlock's Ephemeral Rollup** — a Layer 2 network for Solana that provides:

- **Gasless transactions** — Card reveal instructions cost no SOL
- **Sub-10ms state transitions** — Near-instant reveal response
- **VRF-based randomness** — Each card slot derives provably fair randomness from a VRF seed
- **Rarity floor enforcement** — Each slot stores a minimum rarity floor; the wild slot can never roll below its guaranteed floor (e.g. Expert pack wild slot floor = Super Rare)

**Pack reveal flow:**
```
User clicks "Open Pack"
  → Toast: "Starting Ephemeral Rollup reveal..."
  → initialize_pack (priceLamports=0, creates PDA for ER session)
  → Delegate BoosterPack PDA to MagicBlock ER validator
  → delegateAndOpen instruction on ER (sub-10ms)
  → revealCard × 5 on ER (gasless, each uses VRF seed)
  → finalizeSession on ER (commits back to Solana base layer)
  → Toast: "Cards revealed on-chain!"
  → ⚡ "Ephemeral Rollup" badge shows in reveal animation
```

If the ER is unreachable, the system silently falls back to server-side card generation — users always receive their cards.

**On-chain state:**
- `BoosterPack` account: stores pack type, 5 card slots, wild weights, delegation state
- `CardPool` PDA: `5QTX5hn3eUykBkw68qUeu2X3iTQMxvbKQN7879qv2Y4L`
  - Seeded with all **101 GENESIS cards** (Common: 47, Uncommon: 15, Rare: 26, Super Rare: 9, Mythic: 4)
  - Rarity distribution is proportional and verifiable on-chain

#### Seeker Genesis Token (SGT) Holder Rewards

Owners of Seeker devices can verify their SGT ownership to receive exclusive in-game rewards:

- **Verification:** Sign-In With Solana (SIWS) — prove wallet ownership without sharing private keys
- **On-chain check:** SGT ownership verified via DAS API (Helius) with standard RPC fallback
- **Reward:** Verified Seeker holders receive an exclusive **Expert booster pack** (≥ Super Rare guaranteed)
- **Server endpoints:** `/api/seeker/verify`, `/api/seeker/claim-reward`

#### Data Storage (Server-Authoritative)

All game data is stored in a PostgreSQL database linked to wallet addresses:

- Player profiles (linked to wallet address)
- Card collections (ownership tracked per wallet)
- Deck configurations (validated against owned cards)
- Game statistics and match history
- Achievement progress
- Purchase history (with on-chain tx signature for SOL purchases)

### Planned: NFT Card Ownership on Mainnet

*The following blockchain features are planned for future development:*

#### Solana Compressed NFTs (cNFTs)

Spektrum will use **Solana Compressed NFTs** for true card ownership on mainnet:

- **Low Cost** — Mint thousands of cards for pennies using state compression
- **Fast Transactions** — Sub-second confirmation times
- **Eco-Friendly** — Minimal energy consumption
- **True Ownership** — Cards you control, not rental licenses
- **Verifiable Scarcity** — Every card's rarity provable on-chain
- **Trade History** — Full provenance from first mint

---

## Economy & Tokenomics

### Card Acquisition

#### Booster Packs

Purchase randomized card packs with guaranteed card type distributions. Packs can be purchased with **SOL** (on-chain, devnet) or **mock USD** (off-chain, development mode):

**Rarity-Tier Packs (Slot System)** — Every pack guarantees specific slot allocations for consistent value:

| Pack Name | SOL Price | USD Price | Slot Breakdown (5 Cards) | Wild/Jackpot Slot Odds |
|-----------|-----------|-----------|--------------------------|------------------------|
| Beginner Pack | 0.01 SOL | $1.00 | 3x Common, 1x Uncommon, 1x Wild Slot | Wild: 90% Common, 9.9% Rare, 0.1% Super Rare |
| Advanced Pack | 0.03 SOL | $3.00 | 2x Common, 2x Uncommon, 1x Rare Slot | Rare: 90% Rare (Guaranteed), 9.9% Super Rare, 0.1% Mythic |
| Expert Pack | 0.05 SOL | $5.00 | 3x Uncommon, 1x Rare, 1x Super Rare Slot | Super Rare: 90% Super Rare (Guaranteed), 10% Mythic |

*SOL payments create a verifiable on-chain record. Card reveals via MagicBlock ER use provably fair VRF randomness.*

*Note: Expert Pack contains NO Common cards, ensuring higher value at every pull.*

### New Player Onboarding: "The Ritual"

Upon completing the Tutorial, players undergo **"The Ritual"** to receive their first **Starter Deck (40 cards)**. This ensures every new player can jump immediately into gameplay without needing to build a deck from scratch.

**Step 1 - Choose Your Path:**
The player selects their preferred Faction:
- **The Guardians (Kobar & Borah):** Focuses on high defense, healing, and physical prowess
- **The Corrupted (Kuhaka & Kujana):** Focuses on dark magic, debuffs, and aggressive combos

**Step 2 - Elemental Affinity:**
The game randomly assigns an Elemental Affinity (Fire or Water) to the chosen faction.

**Result:** The player receives a complete, battle-ready deck matching that specific Faction/Element combination.

#### Premade Decks
Ready-to-play 40-card decks with tribal synergy, available for purchase:

| Deck Name | Element | Tribes | SOL Price | USD Price | Difficulty |
|-----------|---------|--------|-----------|-----------|------------|
| Fire Kobar & Borah Tribal | Fire | Kobar + Borah | 0.05 SOL | $20 | Beginner |
| Fire Kuhaka & Kujana Tribal | Fire | Kuhaka + Kujana | 0.05 SOL | $20 | Intermediate |
| Water Kobar & Borah Tribal | Water | Kobar + Borah | 0.05 SOL | $20 | Intermediate |
| Water Kuhaka & Kujana Tribal | Water | Kuhaka + Kujana | 0.05 SOL | $20 | Advanced |

**Deck Composition Breakdown:**

Each 40-card premade deck contains:

| Card Type | Count | Description |
|-----------|-------|-------------|
| Level 1 Avatars | ~15 | 3 copies each of 5 different Level 1 Avatars |
| Level 2 Avatars | 2 | 1 copy each of 2 evolved tribal Avatars |
| Spells | ~14 | 2 copies each of 7 different spell cards |
| Equipment | ~6 | Element-focused gear and Ritual Armor |
| Items | ~3 | Utility and support cards |

*Exact composition varies by deck to optimize for each tribe's playstyle.*

### Deck Building Rules

| Rule | Requirement |
|------|-------------|
| Deck Size | Minimum 40, Maximum 60 |
| Copy Limit | Max 4 copies per card |
| Decks per Player | Max 5 decks |

### Trading & Marketplace (Planned)

*The following features are planned for future development:*

**Player-to-Player Trading:**
- Direct wallet-to-wallet transfers
- NFT-based card ownership verification
- Secure trading system

**Marketplace:**
- List cards for sale
- Browse and purchase cards
- Price history and market analytics

**Marketplace Fees:**
- **Ecosystem Royalties:** A standard 5% royalty fee applies to all player-to-player marketplace transactions
- These funds are reinvested into the ecosystem to support tournament prize pools, development, and server costs

### Achievements (Implemented)

**Achievement System:**
- Complete in-game challenges
- Track progress across multiple categories
- Unlock rewards for milestones

### Ranked Play (Planned)

*Competitive features in development:*
- Seasonal ranked ladder
- Rating-based matchmaking (Casual: 1000 ELO, Ranked: 1000 ELO starting)
- Leaderboards and seasonal rewards

---

## Technical Architecture

### System Overview

Spektrum is built as a modern full-stack web application with real-time multiplayer capabilities and live Solana blockchain integration:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   React 18  │  │  Three.js   │  │     Zustand Stores      │ │
│  │   + Router  │  │  + R3F      │  │  (Game, Deck, Player)   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                            │                                     │
│           ┌────────────────┼────────────────┐                   │
│    ┌───────┴───────┐       │        ┌────────┴────────┐         │
│    │   Socket.IO   │       │        │  Anchor Client  │         │
│    │    Client     │       │        │ (@coral-xyz)    │         │
│    └───────────────┘       │        └────────┬────────┘         │
└────────────────────────────┼────────────────┼──────────────────┘
                             │                │
               WebSocket + REST API     Solana RPC / ER RPC
                             │                │
┌────────────────────────────┼──────────────────────────────────┐
│                         SERVER             │                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Express.js                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │  │
│  │  │  REST API   │  │  Socket.IO  │  │   Game Engine   │  │  │
│  │  │  Endpoints  │  │   Server    │  │   (Server-Side) │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│  ┌─────────────────────────┴──────────────────────────────────┐ │
│  │                    Drizzle ORM                             │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┴─────────────────────────────────┐
│                      PostgreSQL                               │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  │
│  │  Players  │  │   Cards   │  │   Decks   │  │ Purchases │  │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘  │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                    SOLANA BLOCKCHAIN (Devnet)                  │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐ │
│  │   Anchor Program        │  │  MagicBlock Ephemeral Rollup│ │
│  │  (initialize_pack,      │  │  (delegateAndOpen,          │ │
│  │   reveal_card,          │  │   revealCard × 5,           │ │
│  │   finalize_session)     │  │   finalizeSession)          │ │
│  └─────────────────────────┘  └─────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

### Frontend Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework with hooks and concurrent features |
| TypeScript | Type safety across the codebase |
| React Router | Client-side routing and navigation |
| Three.js / React Three Fiber | 3D card rendering and game visualization |
| Drei | Three.js helpers and components |
| Tailwind CSS | Utility-first styling |
| Radix UI | Accessible UI components |
| Zustand | Lightweight state management |
| Vite | Fast development and production builds |
| Socket.IO Client | Real-time multiplayer communication |
| @solana/web3.js | Solana JavaScript SDK |
| @coral-xyz/anchor | Anchor client — builds and sends program instructions |
| @magicblock-labs/ephemeral-rollups-sdk | ER delegation, routing, and VRF |
| Wallet Standard | Multi-wallet detection (Phantom, Solflare, Backpack) |

### Backend Stack

| Technology | Purpose |
|------------|---------|
| Node.js 20 | JavaScript runtime |
| Express.js | HTTP server and REST API |
| Socket.IO | WebSocket server for real-time multiplayer |
| PostgreSQL | Relational database (Neon-hosted) |
| Drizzle ORM | Type-safe database queries and migrations |
| TypeScript | Server-side type safety |

### Blockchain Stack

| Technology | Purpose |
|------------|---------|
| Solana (Devnet) | Base layer blockchain for payments and state anchoring |
| Anchor 0.30 | Rust framework for smart contract development |
| MagicBlock Ephemeral Rollups | Layer 2 for gasless, sub-10ms card reveals |
| Phantom / Solflare / Backpack | Wallet integrations via Wallet Standard |
| Helius DAS API | NFT ownership queries (SGT verification) |
| Compressed NFTs | Cost-efficient card ownership (planned for mainnet) |

### Deployed Contracts

| Contract | Network | Address |
|----------|---------|---------|
| Spektrum Gacha Program | Solana Devnet | `HPmXtAs37ShpfrmE55gWVDQB53KwZDf7jii1ppABRxXN` |
| CardPool PDA | Solana Devnet | `5QTX5hn3eUykBkw68qUeu2X3iTQMxvbKQN7879qv2Y4L` |
| MagicBlock Delegation Program | Devnet ER | `DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh` |

### Database Schema

```
players
├── id (serial, primary key)
├── wallet_address (unique identifier)
├── display_name
├── games_played / won / lost
├── casual_wins / casual_losses
├── ranked_wins / ranked_losses
├── casual_rating / ranked_rating
├── country / region (geo data)
├── has_seen_welcome / has_completed_ritual
└── created_at / last_active_at

cards (master catalog)
├── id (serial, primary key)
├── card_id (canonical string identifier)
├── name, type, element, tribe
├── level, attack, health, energy_cost
├── rarity, skills (jsonb), passive_skill (jsonb)
├── image_path, expansion
└── card_number (e.g., GEN-001)

player_cards (ownership)
├── id (serial, primary key)
├── wallet_address → player
├── card_id → card catalog
├── quantity
├── source (booster_pack, premade_deck, starter, etc.)
└── metadata (jsonb)

player_decks (deck storage)
├── id (uuid, primary key)
├── wallet_address → player
├── deck_name
├── card_ids (text array)
├── is_active
└── created_at / updated_at

purchases (transaction history)
├── id (serial, primary key)
├── wallet_address → player
├── type (booster_pack, premade_deck)
├── item_name, price, sol_price
├── payment_method (sol, paypal, mock)
├── tx_signature (Solana tx hash, if SOL payment)
└── created_at

player_booster_packs
├── id (uuid, primary key)
├── wallet_address → player
├── pack_type, expansion
├── is_opened
└── created_at

seeker_claims
├── wallet_address → player
├── claimed_at
└── reward_pack_id
```

### Security Features

- **Wallet-Based Authentication** — No passwords, signature-based identity
- **Server-Side Deck Validation** — Decks verified against owned cards before matches
- **Card Ownership Verification** — Collections tracked per wallet address
- **Server-Authoritative Card Generation** — Rarity and card selection derived server-side, never from client input
- **On-Chain Payment Verification** — SOL purchases confirmed on Solana before granting inventory
- **Session Management** — Secure session tokens with IP flexibility
- **Rate Limiting** — API protection against abuse
- **Input Validation** — All user inputs sanitized and validated

---

## PVP Architecture

### Overview

Spektrum uses a **server-authoritative multiplayer architecture** where the server is the single source of truth for all game state. This prevents cheating and ensures fair gameplay.

```
┌────────────┐                                      ┌────────────┐
│  Player 1  │                                      │  Player 2  │
│   Client   │                                      │   Client   │
└─────┬──────┘                                      └──────┬─────┘
      │                                                    │
      │  1. Join Room / Set Ready                          │
      ├──────────────────────►                             │
      │                       ┌─────────────────┐          │
      │                       │   Matchmaking   │◄─────────┤
      │                       │     Service     │          │
      │                       └────────┬────────┘          │
      │                                │                   │
      │  2. game_starting              │                   │
      │◄───────────────────────────────┼───────────────────┤
      │                                │                   │
      │  3. Navigate to /game          │                   │
      │                                │                   │
      │  4. submit_deck                │                   │
      ├───────────────────────────────►│                   │
      │                                │◄──────────────────┤
      │                                │                   │
      │  5. Validate Decks             │                   │
      │                       ┌────────┴────────┐          │
      │                       │  Server Game    │          │
      │                       │    Engine       │          │
      │                       └────────┬────────┘          │
      │                                │                   │
      │  6. game_started (with state)  │                   │
      │◄───────────────────────────────┼───────────────────►
      │                                │                   │
      │  7. game_action (play card)    │                   │
      ├───────────────────────────────►│                   │
      │                                │                   │
      │  8. Validate & Process         │                   │
      │                                │                   │
      │  9. game_state_updated         │                   │
      │◄───────────────────────────────┼───────────────────►
      │                                │                   │
```

### Key Components

#### 1. Matchmaking Service
Handles player queuing and room management.

```typescript
// Queue management
interface QueuedPlayer {
  playerId: string;
  playerName: string;
  socketId: string;
  gameMode: 'casual' | 'ranked';
  rating?: number;
  joinedAt: number;
}

// Room states
type RoomStatus = 'waiting' | 'ready' | 'playing' | 'finished';

interface GameRoom {
  id: string;
  players: RoomPlayer[];
  status: RoomStatus;
  settings: GameSettings;
  createdAt: number;
}
```

**Matchmaking Flow:**
1. Player requests matchmaking (`start_matchmaking`)
2. Server adds player to appropriate queue (casual/ranked)
3. When two compatible players found, create room
4. Emit `match_found` to both players
5. Players set ready status
6. When both ready, emit `game_starting`

#### 2. Server Game Engine
Authoritative game state processor.

```typescript
class ServerGameEngine {
  private roomId: string;
  private player1: PlayerState;
  private player2: PlayerState;
  private currentTurn: 'player1' | 'player2';
  private gamePhase: GamePhase;
  
  // Initialize with validated decks
  initializeGame(player1Deck: Card[], player2Deck: Card[]);
  
  // Process validated actions
  processAction(playerId: string, action: GameAction): ActionResult;
  
  // Get player-specific view (hides opponent's hand)
  getPlayerView(playerId: string): ClientGameState;
}
```

#### 3. Deck Validation
Server-side validation ensures fair play.

```typescript
async function validateDeckFromDatabase(
  deck: Card[], 
  walletAddress: string
): Promise<ValidationResult> {
  // 1. Check minimum deck size (40 cards)
  // 2. Verify each card exists in master database
  // 3. Check copy limits (max 4 per card)
  // 4. Verify player owns the cards (if wallet connected)
  // 5. Return validated deck or error
}
```

#### 4. State Synchronization
Real-time state updates via WebSocket.

```typescript
// Client subscribes to events
socket.on('game_state_updated', (state) => {
  // Apply authoritative state from server
  gameStore.applyServerGameState(state);
});

// Client sends actions
socket.emit('game_action', {
  type: 'playCard',
  data: { handIndex: 0, target: 'opponent_active' }
});

// Server validates and broadcasts
socket.emit('game_state_updated', newState);
// OR
socket.emit('action_rejected', { error: 'Invalid action' });
```

### WebSocket Events

#### Client → Server

| Event | Description | Payload |
|-------|-------------|---------|
| `register_player` | Register player identity | `{ name, avatar, walletAddress }` |
| `start_matchmaking` | Join matchmaking queue | `{ gameMode: 'casual' \| 'ranked' }` |
| `stop_matchmaking` | Leave matchmaking queue | - |
| `create_room` | Create custom room | `{ name, settings }` |
| `join_room` | Join existing room | `roomId` |
| `leave_room` | Leave current room | - |
| `set_ready` | Toggle ready status | `boolean` |
| `submit_deck` | Submit deck for validation | `{ deck: Card[] }` or `{ deckId: string }` |
| `game_action` | Perform game action | `{ type, data }` |
| `request_game_state` | Request full state sync | - |

#### Server → Client

| Event | Description | Payload |
|-------|-------------|---------|
| `player_registered` | Registration confirmed | `{ id, name, avatar }` |
| `matchmaking_started` | Added to queue | `{ gameMode }` |
| `match_found` | Match found | `GameRoom` |
| `room_updated` | Room state changed | `GameRoom` |
| `game_starting` | Both players ready | `GameRoom` |
| `deck_accepted` | Deck validation passed | - |
| `deck_rejected` | Deck validation failed | `{ error }` |
| `game_started` | Game initialized | `{ room, gameState }` |
| `game_state_updated` | State changed | `ClientGameState` |
| `action_rejected` | Invalid action | `{ action, error }` |
| `game_ended` | Game finished | `{ winner, stats }` |

### Client-Side Multiplayer Hook

```typescript
// useMultiplayerGameSync.ts
export const useMultiplayerGameSync = () => {
  // Detect multiplayer mode
  const isMultiplayer = isMultiplayerSession || 
    (currentRoom?.status === 'ready' || currentRoom?.status === 'playing');
  
  // Wrap actions to route through server
  const wrappedActions = {
    playCard: (handIndex, target) => {
      if (isMultiplayer) {
        sendActionToServer({ type: 'playCard', data: { handIndex, target } });
      } else {
        gameStore.playCard(handIndex, target);  // Local AI mode
      }
    },
    // ... other wrapped actions
  };
  
  return { isMultiplayer, wrappedActions };
};
```

### Wager Mode (Ante) Architecture

Wager mode is a server-authoritative PvP mode where players stake NFT cards. The winner receives the loser's wagered card via an on-chain Solana transfer.

**How It Works:**

1. Both players join the ante matchmaking queue (`/ante-socket`) with their wagered card
2. Server matches players of the same rarity tier
3. Both players confirm the match and submit their decks (`confirm_battle`)
4. Server initializes a `ServerGameEngine` and emits `battle_start` with the initial game state
5. The game plays out fully server-authoritatively — identical rules to standard PvP
6. When the server detects a winner, it triggers an on-chain NFT transfer via the treasury wallet
7. Both players receive `battle_completed` with the result and blockchain signature

**Tie Handling:**
- A tie occurs when both players run out of avatars simultaneously (e.g., mutual KO) or both deck out on the same turn
- In a tie, no card is transferred — each player retains their wagered card
- The server records the tie result; no blockchain transaction is executed

**Wager Mode Socket Events (Client → Server, path: `/ante-socket`):**

| Event | Description | Payload |
|-------|-------------|---------|
| `join_queue` | Enter matchmaking | `{ playerId, walletAddress, wageredCard }` |
| `cancel_queue` | Leave queue | `{ playerId }` |
| `confirm_battle` | Confirm match + send deck | `{ battleId, playerId, deck }` |
| `ante_game_action` | Send game action | `{ battleId, action: { type, data } }` |

**Wager Mode Socket Events (Server → Client):**

| Event | Description | Payload |
|-------|-------------|---------|
| `match_found` | Opponent matched | `{ battleId, opponent, yourCard }` |
| `battle_start` | Both confirmed, game ready | `{ battleId, gameState }` |
| `ante_game_state_updated` | State after action | `{ gameState }` |
| `ante_action_rejected` | Invalid action | `{ action, error }` |
| `transfer_pending` | Blockchain transfer started | `{ battleId, winnerId, status }` |
| `battle_completed` | Transfer confirmed | `{ battleId, winnerId, wonCard, lostCard, blockchainSignature }` |
| `transfer_failed` | Blockchain error | `{ battleId, error }` |
| `battle_opponent_disconnected` | Forfeit win | `{ battleId, result, reason }` |

### Reconnection Handling

If a player disconnects during a match:

1. Server maintains game state for 60 seconds
2. Player reconnects with same socket
3. Server verifies identity via session/wallet
4. Server sends `game_state_sync` with full state
5. Client applies state and resumes play

### Security Considerations

- **All game logic runs server-side** — Clients are display-only
- **Deck validation before match** — Prevents invalid/cheated decks
- **Action validation** — Every action checked for legality
- **Hidden information** — Opponent's hand never sent to client
- **Rate limiting** — Prevents action spam
- **Session verification** — Each action verified against session

---

## Roadmap

### Phase 1: Foundation (Completed)
- [x] Core game engine with turn-based phases
- [x] 3D card visualization (Three.js / React Three Fiber)
- [x] Multi-wallet support (Phantom, Solflare, Backpack via Wallet Standard)
- [x] Card database (101 GENESIS cards in PostgreSQL)
- [x] Booster pack system (3 pack types with slot system)
- [x] Premade decks (4 tribal decks)
- [x] Basic AI opponent
- [x] Player profiles with geo-location
- [x] Session tracking and analytics
- [x] Server-authoritative deck validation
- [x] Cross-device card collection sync
- [x] Tutorial system (main + 4 interactive modules)
- [x] The Ritual onboarding system
- [x] Achievement system framework
- [x] Sound effects (background music, hit sounds)
- [x] PayPal payment integration
- [x] WebSocket multiplayer infrastructure
- [x] **On-chain SOL payments via Anchor smart contract (Solana devnet)**
- [x] **MagicBlock Ephemeral Rollup gasless card reveals with VRF**
- [x] **Seeker Genesis Token (SGT) holder verification and rewards**
- [x] **CardPool PDA seeded with all 101 GENESIS cards**

### Phase 2: Polish & Beta (In Progress)
- [ ] Complete card set (200+ cards)
- [ ] Multiplayer stability improvements
- [ ] Mobile PWA optimization
- [ ] Ranked matchmaking system
- [ ] Enhanced AI with difficulty levels
- [ ] Beta launch

### Phase 3: Competitive (Planned)
- [ ] Ranked seasons with ELO ratings
- [ ] Leaderboards
- [ ] Tournament system
- [ ] Spectator mode
- [ ] Replay system

### Phase 4: Blockchain Economy (Planned)
- [ ] NFT minting on Solana mainnet (cNFTs)
- [ ] Migrate from devnet to mainnet — on-chain payments and ER reveals go live for real value
- [ ] Card ownership fully on-chain (wallet = collection)
- [ ] Player marketplace with 5% ecosystem royalty
- [ ] Trading system (wallet-to-wallet)
- [ ] Card crafting/upgrading

### Phase 5: Expansion (Future)
- [ ] New card sets (Ground, Air elements)
- [ ] New tribes
- [ ] Multiplayer modes (2v2)
- [ ] Guild/clan system
- [ ] Mobile native apps (Capacitor iOS/Android)

---

## Team & Community

### Core Team
[Your team information here]

### Community Channels
- Discord: [Link]
- Twitter/X: [Link]
- Website: [Link]

### Contributing
Spektrum is built with community feedback in mind. Join our Discord to:
- Report bugs and suggest features
- Participate in balance discussions
- Get early access to new cards
- Compete in community tournaments

---

## Legal Disclaimer

This litepaper is for informational purposes only and does not constitute financial advice. The gaming and blockchain space involves risks, and users should conduct their own research before participating. Game mechanics, tokenomics, and features described are subject to change based on development progress and community feedback. All blockchain features currently operate on Solana Devnet and do not involve real monetary value.

---

## Contact

For business inquiries, partnerships, or press:
[Contact information]

---

*Last Updated: March 2026*
*Version: 1.3*

**Changelog:**
- v1.3 (Mar 2026): Major blockchain integration update — SOL payments via deployed Anchor program (HPmXtAs37ShpfrmE55gWVDQB53KwZDf7jii1ppABRxXN), MagicBlock Ephemeral Rollup gasless card reveals with VRF randomness, multi-wallet support (Phantom/Solflare/Backpack via Wallet Standard), Seeker Genesis Token holder rewards, CardPool PDA seeded with all 101 GENESIS cards, Buffer polyfill for Solana library browser compatibility
- v1.2 (Feb 2026): Updated spektra cost enforcement system, AI battle improvements, 101 cards in database with complete metadata, standardized card numbers (GEN-084 through GEN-096 for neutral cards)
