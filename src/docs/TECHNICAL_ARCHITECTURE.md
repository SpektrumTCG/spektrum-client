# Spektrum TCG - Technical Architecture Document
## Version 1.1 | February 2026

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [API Reference](#api-reference)
4. [Frontend Architecture](#frontend-architecture)
5. [State Management](#state-management)
6. [Authentication & Security](#authentication--security)
7. [File Structure](#file-structure)
8. [Data Flow](#data-flow)
9. [Card ID System](#card-id-system)

---

## System Overview

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | UI framework |
| **3D Graphics** | Three.js + React Three Fiber | Card visualization |
| **Styling** | Tailwind CSS + Radix UI | Component styling |
| **State** | Zustand | Client state management |
| **Build** | Vite | Development & bundling |
| **Backend** | Node.js + Express | API server |
| **Database** | PostgreSQL (Neon) | Data persistence |
| **ORM** | Drizzle ORM | Database queries |
| **Blockchain** | Solana + Phantom | Wallet identity |
| **Payments** | PayPal SDK | Payment processing |

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  Pages → Components → Stores (Zustand) → API Calls             │
│                          ↓                                       │
│                    Phantom Wallet                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVER (Express)                          │
├─────────────────────────────────────────────────────────────────┤
│  Routes → Middleware → Storage Layer → Database                 │
│      ↓           ↓                                               │
│  Session     Rate Limiter                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                        │
├─────────────────────────────────────────────────────────────────┤
│  players │ player_cards │ player_decks │ cards │ purchases      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐
│     players      │       │      cards       │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ wallet_address   │◄──┐   │ card_id (UNIQUE) │◄─────────────┐
│ display_name     │   │   │ name             │              │
│ games_played     │   │   │ type             │              │
│ games_won        │   │   │ element          │              │
│ games_lost       │   │   │ sub_type         │              │
│ casual_rating    │   │   │ level            │              │
│ ranked_rating    │   │   │ attack           │              │
│ country          │   │   │ health           │              │
│ region           │   │   │ energy           │              │
│ city             │   │   │ rarity           │              │
│ timezone         │   │   │ skills (JSONB)   │              │
│ last_seen        │   │   │ passive_skill    │              │
│ total_uptime     │   │   └──────────────────┘              │
│ session_start    │   │                                      │
│ first_connection │   │                                      │
│ has_seen_welcome │   │                                      │
└──────────────────┘   │                                      │
         │             │                                      │
         │             │   ┌──────────────────┐              │
         │             │   │   player_cards   │              │
         │             │   ├──────────────────┤              │
         │             ├───│ wallet_address   │              │
         │             │   │ player_id        │──────────────│
         │             │   │ card_id          │──────────────┘
         │             │   │ quantity         │
         │             │   │ source           │
         │             │   │ metadata (JSONB) │
         │             │   │ acquired_at      │
         │             │   └──────────────────┘
         │             │
         │             │   ┌──────────────────┐
         │             │   │   player_decks   │
         │             │   ├──────────────────┤
         │             ├───│ wallet_address   │
         │             │   │ player_id        │
         │             │   │ deck_id (UNIQUE) │
         │             │   │ deck_name        │
         │             │   │ card_ids (JSONB) │
         │             │   │ element          │
         │             │   │ is_active        │
         │             │   └──────────────────┘
         │             │
         │             │   ┌──────────────────┐
         │             │   │ purchase_history │
         │             │   ├──────────────────┤
         │             ├───│ wallet_address   │
         │             │   │ player_id        │
         │             │   │ item_type        │
         │             │   │ item_name        │
         │             │   │ quantity         │
         │             │   │ metadata (JSONB) │
         │             │   │ purchased_at     │
         │             │   └──────────────────┘
         │             │
         │             │   ┌──────────────────┐
         │             │   │    deck_usage    │
         │             │   ├──────────────────┤
         │             ├───│ wallet_address   │
         │             │   │ player_id        │
         │             │   │ deck_id          │
         │             │   │ deck_name        │
         │             │   │ game_mode        │
         │             │   │ game_result      │
         │             │   │ used_at          │
         │             │   └──────────────────┘
         │             │
         │             │   ┌────────────────────────┐
         │             │   │  player_achievements   │
         │             │   ├────────────────────────┤
         │             └───│ wallet_address         │
                           │ achievement_id         │
                           │ progress               │
                           │ is_unlocked            │
                           │ unlocked_at            │
                           └────────────────────────┘
```

### Table Definitions

#### 1. `players` - Player Profiles

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | SERIAL | NO | auto | Internal ID |
| `wallet_address` | TEXT | NO | - | Solana wallet (UNIQUE) |
| `display_name` | TEXT | YES | - | Optional nickname |
| `games_played` | INTEGER | NO | 0 | Total games |
| `games_won` | INTEGER | NO | 0 | Wins |
| `games_lost` | INTEGER | NO | 0 | Losses |
| `casual_rating` | INTEGER | NO | 1000 | Casual ELO |
| `ranked_rating` | INTEGER | NO | 1000 | Ranked ELO |
| `country` | TEXT | YES | - | From IP geolocation |
| `region` | TEXT | YES | - | From IP geolocation |
| `city` | TEXT | YES | - | From IP geolocation |
| `timezone` | TEXT | YES | - | From IP geolocation |
| `last_seen` | TIMESTAMP | YES | - | Last activity |
| `total_uptime` | INTEGER | NO | 0 | Seconds played |
| `session_start` | TIMESTAMP | YES | - | Current session |
| `first_connection` | TIMESTAMP | YES | - | First ever login |
| `has_seen_welcome` | BOOLEAN | NO | false | Tutorial flag |
| `has_completed_ritual` | BOOLEAN | NO | false | Starter deck received |
| `chosen_faction` | TEXT | YES | - | 'guardians' or 'corrupted' |
| `chosen_element` | TEXT | YES | - | 'fire' or 'water' |
| `starter_deck_id` | TEXT | YES | - | ID of premade deck received |
| `created_at` | TIMESTAMP | NO | now() | - |
| `updated_at` | TIMESTAMP | NO | now() | - |

**Indexes:** PK on `id`, UNIQUE on `wallet_address`

---

#### 2. `cards` - Master Card Catalog

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | SERIAL | NO | auto | Internal numeric ID |
| `card_id` | TEXT | NO | - | Canonical ID (UNIQUE) |
| `name` | TEXT | NO | - | Display name |
| `type` | TEXT | NO | - | avatar/spell/quickSpell/equipment/field |
| `element` | TEXT | NO | - | fire/water/ground/air/neutral |
| `sub_type` | TEXT | YES | - | Tribe: kobar/borah/kuhaka/kujana/kuku |
| `level` | INTEGER | YES | 1 | Avatar level (1 or 2) |
| `attack` | INTEGER | YES | 0 | Attack stat |
| `health` | INTEGER | YES | 0 | Health stat |
| `energy` | INTEGER | YES | 0 | Legacy energy field |
| `rarity` | TEXT | NO | 'Common' | Common/Rare/Epic/Mythic |
| `description` | TEXT | YES | - | Card description |
| `image_path` | TEXT | YES | - | Image file path |
| `expansion` | TEXT | YES | 'Fire and Water' | Card set |
| `card_number` | TEXT | YES | - | Set number (GEN-001) |
| `spektra_cost` | JSONB | YES | - | Array of element strings for cost |
| `skills` | JSONB | YES | - | Array of skill objects |
| `passive_skill` | JSONB | YES | - | Passive skill object |
| `created_at` | TIMESTAMP | NO | now() | - |
| `updated_at` | TIMESTAMP | NO | now() | - |

**Indexes:** PK on `id`, UNIQUE on `card_id`

**Current Card Count:** 101 cards (29 Fire Avatars, 27 Water Avatars, 10 Fire Spells/QuickSpells, 14 Water Spells, 8 Field Cards, 13 Neutral Items/Equipment/Spells)

**spektra_cost JSONB Structure:**
```json
["fire", "fire", "neutral"]
```
Each element represents one spektra resource required to play the card. Elements can be: `fire`, `water`, `ground`, `air`, `neutral`.

**Skills JSONB Structure:**
```json
[
  {
    "id": "skill-fire-blast",
    "name": "Fire Blast",
    "description": "Deal 30 damage to target",
    "damage": 30,
    "spektraCost": ["fire", "neutral"],
    "target": "opponent_active",
    "conditions": []
  }
]
```

---

#### 3. `player_cards` - Card Ownership

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | SERIAL | NO | auto | - |
| `player_id` | INTEGER | NO | - | Links to players.id |
| `wallet_address` | TEXT | NO | - | Redundant for fast queries |
| `card_id` | TEXT | NO | - | References cards.card_id |
| `quantity` | INTEGER | NO | 1 | Copies owned |
| `source` | TEXT | YES | 'unknown' | booster_pack/premade_deck/trade |
| `metadata` | JSONB | YES | - | Pack name, variant info |
| `acquired_at` | TIMESTAMP | YES | now() | - |

**Note:** No FK constraint to `cards.card_id` - validated at application layer

---

#### 4. `player_decks` - Saved Decks

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | SERIAL | NO | auto | - |
| `player_id` | INTEGER | NO | - | Links to players.id |
| `wallet_address` | TEXT | NO | - | Redundant for fast queries |
| `deck_id` | TEXT | NO | - | Client UUID (UNIQUE) |
| `deck_name` | TEXT | NO | - | Display name |
| `card_ids` | JSONB | NO | - | Array of card_id strings |
| `element` | TEXT | YES | - | Primary element |
| `is_active` | INTEGER | NO | 0 | 1 = selected deck |
| `created_at` | TIMESTAMP | NO | now() | - |
| `updated_at` | TIMESTAMP | NO | now() | - |

**Indexes:** PK on `id`, UNIQUE on `deck_id`

**card_ids JSONB Structure:**
```json
["daisy", "daisy", "daisy", "fire-radja", "fire-radja", ...]
```

---

#### 5. `purchase_history` - Transactions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | SERIAL | NO | auto | - |
| `player_id` | INTEGER | NO | - | Links to players.id |
| `wallet_address` | TEXT | NO | - | - |
| `item_type` | TEXT | NO | - | booster_pack/premade_deck |
| `item_name` | TEXT | NO | - | Pack/deck name |
| `quantity` | INTEGER | NO | 1 | How many |
| `metadata` | JSONB | YES | - | Price, payment method |
| `purchased_at` | TIMESTAMP | NO | now() | - |

---

#### 6. `deck_usage` - Game Analytics

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | SERIAL | NO | auto | - |
| `player_id` | INTEGER | NO | - | Links to players.id |
| `wallet_address` | TEXT | NO | - | - |
| `deck_id` | TEXT | NO | - | Deck used |
| `deck_name` | TEXT | NO | - | Deck name |
| `game_mode` | TEXT | NO | - | casual/ranked/ante/ai |
| `game_result` | TEXT | YES | - | win/loss/draw |
| `used_at` | TIMESTAMP | NO | now() | - |

---

#### 7. `player_achievements` - Progress Tracking

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | SERIAL | NO | auto | - |
| `wallet_address` | TEXT | NO | - | - |
| `achievement_id` | TEXT | NO | - | Achievement identifier |
| `progress` | INTEGER | NO | 0 | Current progress |
| `is_unlocked` | BOOLEAN | NO | false | Completed? |
| `unlocked_at` | TIMESTAMP | YES | - | When unlocked |
| `created_at` | TIMESTAMP | NO | now() | - |
| `updated_at` | TIMESTAMP | NO | now() | - |

---

## API Reference

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.replit.app/api
```

### Authentication

All player-specific endpoints require a connected wallet. The wallet address is passed in the request body or URL parameter.

---

### Player Endpoints

#### `POST /api/player/connect`
**Purpose:** Register/authenticate player on wallet connection (MUST be called first)

**Request:**
```json
{
  "walletAddress": "ABC123...",
  "country": "US",
  "region": "California",
  "city": "San Francisco",
  "timezone": "America/Los_Angeles"
}
```

**Response:**
```json
{
  "success": true,
  "player": {
    "id": 1,
    "walletAddress": "ABC123...",
    "displayName": null,
    "gamesPlayed": 0,
    ...
  },
  "isNewPlayer": false
}
```

---

#### `PUT /api/player/profile`
**Purpose:** Update player profile

**Request:**
```json
{
  "walletAddress": "ABC123...",
  "displayName": "PlayerOne"
}
```

---

#### `GET /api/player/welcome-status/:walletAddress`
**Purpose:** Check if player has seen welcome tutorial

**Response:**
```json
{
  "hasSeenWelcome": false
}
```

---

#### `PUT /api/player/welcome-seen`
**Purpose:** Mark welcome tutorial as seen

**Request:**
```json
{
  "walletAddress": "ABC123..."
}
```

---

#### `POST /api/player/session/start`
**Purpose:** Start session tracking

---

#### `POST /api/player/session/end`
**Purpose:** End session, update uptime

---

#### `POST /api/player/game-result`
**Purpose:** Record game outcome

**Request:**
```json
{
  "walletAddress": "ABC123...",
  "result": "win",
  "gameMode": "casual"
}
```

---

### Card Endpoints

#### `GET /api/cards/catalog`
**Purpose:** Fetch all cards from database

**Response:**
```json
{
  "cards": [
    {
      "id": 1,
      "cardId": "daisy",
      "name": "Daisy",
      "type": "avatar",
      "element": "fire",
      "spektraCost": ["fire", "neutral"],
      "skills": [...],
      "imagePath": "/attached_assets/card_images/GENESIS/fire/avatars/...",
      ...
    }
  ],
  "count": 101
}
```

---

#### `POST /api/cards/add`
**Purpose:** Add cards to player's collection

**Request:**
```json
{
  "walletAddress": "ABC123...",
  "cards": [
    {
      "cardId": "daisy",
      "quantity": 3,
      "source": "booster_pack",
      "metadata": { "packName": "Fire Elemental Pack" }
    }
  ]
}
```

---

#### `GET /api/cards/:walletAddress`
**Purpose:** Get player's card collection

**Response:**
```json
{
  "cards": [
    {
      "cardId": "daisy",
      "quantity": 3,
      "source": "booster_pack"
    }
  ]
}
```

---

### Deck Endpoints

#### `POST /api/decks/save`
**Purpose:** Save or update a deck

**Request:**
```json
{
  "walletAddress": "ABC123...",
  "deckId": "uuid-here",
  "deckName": "Fire Kobar",
  "cardIds": ["daisy", "daisy", "daisy", ...],
  "element": "fire",
  "isActive": 1
}
```

**Validation Rules:**
- Minimum 40 cards
- Maximum 4 copies per card
- Maximum 5 decks per player

---

#### `GET /api/decks/:walletAddress`
**Purpose:** Get all player decks

---

#### `DELETE /api/decks/:deckId`
**Purpose:** Delete a deck

---

#### `PUT /api/decks/:deckId/activate`
**Purpose:** Set deck as active

---

#### `POST /api/decks/usage`
**Purpose:** Record deck usage in game

---

### Purchase Endpoints

#### `POST /api/purchases/booster-pack`
**Purpose:** Record booster pack purchase

**Request:**
```json
{
  "walletAddress": "ABC123...",
  "packName": "Fire Elemental Pack",
  "price": 150,
  "paymentMethod": "paypal"
}
```

---

#### `POST /api/purchases/premade-deck`
**Purpose:** Record premade deck purchase

---

#### `GET /api/purchases/premade-decks/:walletAddress`
**Purpose:** Get purchased premade decks (prevent duplicate purchases)

---

### Achievement Endpoints

#### `GET /api/achievements/:walletAddress`
**Purpose:** Get player's achievement progress

---

#### `POST /api/achievements/:walletAddress/:achievementId/progress`
**Purpose:** Update achievement progress

---

#### `POST /api/achievements/:walletAddress/:achievementId/unlock`
**Purpose:** Unlock an achievement

---

### Analytics Endpoints (Admin)

#### `GET /api/analytics/players`
**Purpose:** Get all player statistics

---

#### `GET /api/analytics/purchases`
**Purpose:** Get all purchase history

---

#### `GET /api/analytics/player/:walletAddress`
**Purpose:** Get specific player analytics

---

### System Endpoints

#### `GET /api/health`
**Purpose:** Health check

---

#### `POST /api/session/wallet`
**Purpose:** Store wallet in session

---

#### `DELETE /api/session`
**Purpose:** Clear session

---

## Frontend Architecture

### Page Structure

```
client/src/pages/
├── HomePage.tsx              # Landing page with wallet connect
├── BoosterPacksPage.tsx      # Buy/open booster packs
├── BoosterSelectionPage.tsx  # Pack selection
├── PremadeDecksPage.tsx      # Buy premade decks
├── InventoryPage.tsx         # View card collection
├── DeckBuilderPage.tsx       # Build/edit decks
├── BattlePage.tsx            # Main game screen
├── TutorialPage.tsx          # Tutorial hub
├── AchievementsPage.tsx      # Achievement tracking
├── ShopPage.tsx              # Shop hub
├── SettingsPage.tsx          # User settings
└── DevToolsPage.tsx          # Development tools
```

### Component Hierarchy

```
App.tsx
├── Router
│   ├── HomePage
│   │   ├── WalletSelectorModal
│   │   └── FirstTimeWelcomePopup
│   ├── BoosterPacksPage
│   │   ├── BoosterPackTearAnimation
│   │   └── BoosterOpeningAnimation
│   ├── DeckBuilderPage
│   │   └── DeckBuilder (3D)
│   └── BattlePage
│       └── GameCanvas (Three.js)
│           ├── CardMesh
│           ├── BoardLayout
│           └── EffectsSystem
└── Toaster (Sonner)
```

---

## State Management

### Zustand Stores

| Store | File | Purpose |
|-------|------|---------|
| `useWalletStore` | useWalletStore.ts | Phantom wallet connection |
| `useGameStore` | useGameStore.ts | Main game state (172KB) |
| `useDeckStore` | useDeckStore.ts | Deck management |
| `useInventoryStore` | useInventoryStore.ts | Card collection |
| `useBoosterVariantStore` | useBoosterVariantStore.ts | Booster pack opening |
| `usePremadeDecksStore` | usePremadeDecksStore.ts | Premade deck data |
| `useAchievementsStore` | useAchievementsStore.ts | Achievement tracking |
| `useCollectionStore` | useCollectionStore.ts | Collection view |

### State Flow

```
User Action
    │
    ▼
Zustand Store (optimistic update)
    │
    ▼
API Call (async)
    │
    ▼
Database Update
    │
    ▼
Store Sync (on success/failure)
```

---

## Authentication & Security

### Wallet-Based Authentication

1. **Connection Flow:**
   ```
   User clicks "Connect Wallet"
       │
       ▼
   Phantom extension/deeplink opens
       │
       ▼
   User approves connection
       │
       ▼
   Client receives wallet address
       │
       ▼
   POST /api/player/connect (REQUIRED FIRST)
       │
       ▼
   Player profile created/retrieved
       │
       ▼
   Session established
   ```

2. **Session Security:**
   - Sessions stored server-side with express-session
   - IP/User-Agent tracked but not strictly enforced (updates on change)
   - Session timeout configurable

### Middleware

| Middleware | Purpose |
|------------|---------|
| `sessionSecurity.ts` | Session validation, IP flexibility |
| `rateLimiter.ts` | API rate limiting |

---

## File Structure

```
spektrum-tcg/
├── client/
│   ├── src/
│   │   ├── pages/              # Route pages
│   │   ├── components/         # Reusable UI components
│   │   ├── game/
│   │   │   ├── stores/         # Zustand state stores
│   │   │   ├── data/           # Card definitions (TypeScript)
│   │   │   ├── gacha/          # Booster pack system
│   │   │   ├── ai/             # AI opponent logic
│   │   │   └── utils/          # Game utilities
│   │   ├── lib/                # Shared utilities
│   │   ├── blockchain/
│   │   │   └── solana/         # Wallet integration
│   │   └── assets/             # Static assets
│   └── public/
│       ├── textures/           # Card/game textures
│       └── sounds/             # Audio files
├── server/
│   ├── routes.ts               # API routes
│   ├── playerStorage.ts        # Database operations
│   ├── middleware/             # Express middleware
│   ├── services/               # Business logic
│   ├── gameEngine/             # Server game state
│   └── utils/                  # Server utilities
├── shared/
│   └── playerSchema.ts         # Drizzle ORM schema
├── scripts/
│   └── importCardsToDatabase.ts # Card import script
└── docs/
    ├── SPEKTRUM_LITEPAPER.md
    └── TECHNICAL_ARCHITECTURE.md
```

---

## Data Flow

### Card Purchase Flow (Booster Pack)

```
1. User selects pack
       │
       ▼
2. PayPal payment processed
       │
       ▼
3. POST /api/purchases/booster-pack
       │
       ▼
4. Client generates random cards (with cardId preservation)
       │
       ▼
5. POST /api/cards/add
       │
       ▼
6. Database: INSERT into player_cards (upsert quantity)
       │
       ▼
7. Client: useInventoryStore updated
       │
       ▼
8. Cards available in collection
```

### Deck Save Flow

```
1. User builds deck in DeckBuilder
       │
       ▼
2. Client validates: 40+ cards, max 4 copies
       │
       ▼
3. POST /api/decks/save
       │
       ▼
4. Server validates:
   - Player exists
   - Max 5 decks
   - Card IDs valid
       │
       ▼
5. Database: INSERT/UPDATE player_decks
       │
       ▼
6. Client: useDeckStore synced
```

---

## Card ID System

### Canonical vs Instance IDs

**Canonical ID** (stored in database):
```
daisy
fire-radja
water-maya-level2
GEN-039-MYTHIC
```

**Instance ID** (used in-game for unique references):
```
daisy-copy-1
daisy-copy-2
fire-radja-level2-kobar-1735123456789
daisy-copy-1-extra-35
```

### ID Canonicalization

The `getCanonicalCardId()` utility in `client/src/lib/utils.ts`:

```typescript
export function getCanonicalCardId(card: { id: string; cardId?: string }): string {
  // Fast path: use cardId if set
  if (card.cardId) {
    return card.cardId;
  }
  
  // Fallback: strip suffixes iteratively
  let id = card.id;
  
  // Strip prefixes
  if (id.startsWith('owned-')) id = id.replace('owned-', '');
  if (id.startsWith('deck-')) id = id.replace('deck-', '');
  
  // Strip suffixes (loop handles chained suffixes)
  const suffixPatterns = [/-pack-\d+$/, /-level2-\w+-\d+$/, /-extra-\d+$/, /-copy-\d+$/];
  
  let changed = true;
  while (changed) {
    changed = false;
    for (const pattern of suffixPatterns) {
      if (pattern.test(id)) {
        id = id.replace(pattern, '');
        changed = true;
      }
    }
  }
  
  return id;
}
```

### Card Generation (Preserving cardId)

When generating cards from packs/decks, always set `cardId`:

```typescript
// Correct: preserves canonical ID for database operations
cards.push({ 
  ...avatar, 
  id: `${avatar.id}-copy-1`,    // Instance ID for game
  cardId: avatar.id              // Canonical ID for database
});
```

---

## AI Battle System

### Overview

The AI opponent system provides single-player gameplay against computer-controlled opponents. It uses a state adapter pattern to interface with the game store.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      GameBoard2D Component                       │
├─────────────────────────────────────────────────────────────────┤
│  AI Adapter Functions (use useGameStore.getState() for live state)
│      │
│      ├── moveCardToSpektra(index)
│      ├── playAsActiveAvatar(index)
│      ├── playAsReserveAvatar(index)
│      ├── playSpell(index)
│      ├── useAvatarSkill(skillNumber: 1 | 2)
│      ├── nextPhase()
│      └── hasEnoughSpektra(cost)
│                          │
│                          ▼
│                   SimpleGameAI Class
│                          │
│                          ▼
│              AI Decision Logic (makeMove)
└─────────────────────────────────────────────────────────────────┘
```

### Key Implementation Details

**Fresh State Access:**
AI adapter functions use `useGameStore.getState()` instead of capturing state from closures. This ensures the AI always operates on the current game state:

```typescript
useAvatarSkill: (skillNumber: 1 | 2) => {
  // Get fresh state to avoid stale closures
  const freshGame = useGameStore.getState();
  
  const avatar = freshGame.opponent.activeAvatar;
  const skill = avatar.skills?.[0] || avatar.skill1;
  
  // Check spektra cost before using skill
  const spektraCost = skill.spektraCost || [];
  if (!freshGame.hasEnoughSpektra(spektraCost, 'opponent')) {
    return; // Cannot afford skill
  }
  
  // Deduct spektra and apply effect
  if (freshGame.useSpektra(spektraCost, 'opponent')) {
    // Apply damage, mark avatar as tapped, etc.
  }
}
```

**Skill Resolution:**
The AI uses a unified skill resolution pattern that supports both database format (skills array) and legacy format (skill1/skill2 properties):

```typescript
const skill = skillNumber === 1 
  ? (avatar.skills?.[0] || avatar.skill1)
  : (avatar.skills?.[1] || avatar.skill2);
```

**Spektra Cost Enforcement:**
All AI actions check spektra costs before execution:
1. `hasEnoughSpektra(cost, 'opponent')` validates the AI has sufficient resources
2. `useSpektra(cost, 'opponent')` deducts resources from spektra pile to used pile
3. Costs are validated against the card's `spektraCost` JSONB field from the database

### AI Turn Flow

1. **Refresh Phase** - AI's used spektra returns to spektra pile
2. **Draw Phase** - AI draws a card
3. **Main Phase 1** - AI decides to:
   - Add avatar to spektra pile (1 per turn max)
   - Play avatar as active/reserve
   - Play spells if spektra available
4. **Battle Phase** - AI uses avatar skills if:
   - Active avatar exists and is not tapped
   - Skill spektra cost can be paid
   - Player has valid targets
5. **End Phase** - Turn passes to player

---

## Appendix: SQL Queries

### Common Queries

**Get player's card collection with quantities:**
```sql
SELECT card_id, SUM(quantity) as total
FROM player_cards
WHERE wallet_address = $1
GROUP BY card_id;
```

**Get active deck for player:**
```sql
SELECT * FROM player_decks
WHERE wallet_address = $1 AND is_active = 1;
```

**Get player statistics:**
```sql
SELECT 
  wallet_address,
  games_played,
  games_won,
  games_lost,
  ROUND(games_won::numeric / NULLIF(games_played, 0) * 100, 2) as win_rate
FROM players
WHERE wallet_address = $1;
```

---

*Document generated: February 2026*
*Version: 1.1*

**Changelog:**
- v1.1 (Feb 2026): Added spektra_cost column to cards table, documented AI battle system, updated card count to 101, added player ritual tracking fields
