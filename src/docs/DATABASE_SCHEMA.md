# Spektrum TCG - Database Schema

Last updated: February 2026

---

## Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SPEKTRUM TCG DATABASE                        │
│                                                                     │
│   ┌──────────┐    ┌──────────────┐    ┌──────────────────────┐     │
│   │  CARDS   │    │   PLAYERS    │    │     PVP SYSTEM       │     │
│   │ CATALOG  │    │   SYSTEM     │    │                      │     │
│   │          │    │              │    │  pvp_matches          │     │
│   │ cards    │    │ players      │    │  match_actions        │     │
│   │          │    │ player_cards │    │  deck_usage           │     │
│   └────┬─────┘    │ player_decks │    └──────────────────────┘     │
│        │          │ player_      │                                   │
│        │          │  achievements│                                   │
│   ┌────┴─────┐    │ purchase_    │                                   │
│   │ STARTER  │    │  history     │                                   │
│   │ DECKS    │    └──────────────┘                                   │
│   │          │                                                       │
│   │ starter_ │                                                       │
│   │  decks   │                                                       │
│   │ starter_ │                                                       │
│   │  deck_   │                                                       │
│   │  cards   │                                                       │
│   └──────────┘                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Relationship Map

```
players.wallet_address ─────┬──→ player_cards.wallet_address
                            ├──→ player_decks.wallet_address
                            ├──→ player_achievements.wallet_address
                            ├──→ purchase_history.wallet_address
                            ├──→ deck_usage.wallet_address
                            ├──→ pvp_matches.player1_wallet
                            ├──→ pvp_matches.player2_wallet
                            └──→ match_actions.player_wallet

cards.card_id ──────────────┬──→ player_cards.card_id
                            └──→ player_decks.card_ids (JSONB array)

cards.card_number ──────────────→ starter_deck_cards.card_number

starter_decks.deck_id ──────┬──→ starter_deck_cards.deck_id
                            └──→ players.starter_deck_id

pvp_matches.match_id ───────────→ match_actions.match_id

players.id ─────────────────┬──→ player_cards.player_id
                            ├──→ player_decks.player_id
                            ├──→ purchase_history.player_id
                            └──→ deck_usage.player_id
```

---

## Tables

### 1. cards

Master card catalog. All 101 GENESIS expansion cards.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | serial | NO | auto | Primary key |
| card_id | text | NO | | Unique card identifier (e.g. `fire-kobar-trainee-a`) |
| name | text | NO | | Display name |
| type | text | NO | | `avatar`, `spell`, `quickSpell`, `equipment`, `field` |
| element | text | NO | | `fire`, `water`, `ground`, `air`, `neutral` |
| sub_type | text | YES | | Tribe: `kobar`, `borah`, `kuhaka`, `kujana`, `kuku` |
| level | integer | YES | 1 | Avatar level (1 or 2) |
| attack | integer | YES | 0 | Base attack power |
| health | integer | YES | 0 | Base health points |
| energy | integer | YES | 0 | Energy value |
| rarity | text | NO | `Common` | `Common`, `Uncommon`, `Rare`, `Super Rare`, `Mythic` |
| description | text | YES | | Card description text |
| image_path | text | YES | | Path to card artwork |
| expansion | text | YES | `Fire and Water` | Expansion set name |
| card_number | text | YES | | Card number (e.g. `GEN-001`) |
| spektra_cost | jsonb | YES | | Array of element strings (e.g. `["fire", "fire", "neutral"]`) |
| skills | jsonb | YES | | Array of skill objects |
| passive_skill | jsonb | YES | | Passive skill object |
| created_at | timestamp | NO | now() | |
| updated_at | timestamp | NO | now() | |

**Unique constraints:** `card_id`

---

### 2. players

Player profiles. Auto-created on first wallet connection.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | serial | NO | auto | Primary key |
| wallet_address | text | NO | | Phantom wallet address |
| display_name | text | YES | | Player display name |
| games_played | integer | NO | 0 | Total games played |
| games_won | integer | NO | 0 | Total wins |
| games_lost | integer | NO | 0 | Total losses |
| casual_rating | integer | NO | 1000 | Casual mode ELO |
| ranked_rating | integer | NO | 1000 | Ranked mode ELO |
| country | text | YES | | Player country (from IP) |
| region | text | YES | | Player region |
| city | text | YES | | Player city |
| timezone | text | YES | | Player timezone |
| last_seen | timestamp | YES | | Last activity time |
| total_uptime | integer | NO | 0 | Total seconds online |
| session_start | timestamp | YES | | Current session start |
| first_connection | timestamp | YES | | First ever connection |
| has_seen_welcome | boolean | NO | false | Welcome popup shown? |
| has_completed_ritual | boolean | NO | false | The Ritual completed? |
| chosen_faction | text | YES | | `guardians` or `corrupted` |
| chosen_element | text | YES | | `fire` or `water` |
| starter_deck_id | text | YES | | ID of received starter deck |
| created_at | timestamp | NO | now() | |
| updated_at | timestamp | NO | now() | |

**Unique constraints:** `wallet_address`

---

### 3. player_cards

Tracks card ownership per player. Each row = one card type owned.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | serial | NO | auto | Primary key |
| player_id | integer | NO | | FK → players.id |
| wallet_address | text | NO | | Player wallet |
| card_id | text | NO | | FK → cards.card_id |
| quantity | integer | NO | 1 | Number of copies owned |
| source | text | YES | `unknown` | How acquired: `booster_pack`, `premade_deck`, `starter_deck`, `trade` |
| metadata | jsonb | YES | | Extra info (pack name, variant, etc.) |
| acquired_at | timestamp | YES | now() | When acquired |

---

### 4. player_decks

Saved deck compositions per player.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | serial | NO | auto | Primary key |
| player_id | integer | NO | | FK → players.id |
| wallet_address | text | NO | | Player wallet |
| deck_id | text | NO | | Unique deck identifier |
| deck_name | text | NO | | Deck display name |
| card_ids | jsonb | NO | | Array of card IDs in the deck |
| element | text | YES | | Primary element |
| is_active | integer | NO | 0 | 1 = currently selected deck |
| created_at | timestamp | NO | now() | |
| updated_at | timestamp | NO | now() | |

**Unique constraints:** `deck_id`

---

### 5. player_achievements

Tracks achievement progress per player.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | serial | NO | auto | Primary key |
| wallet_address | text | NO | | Player wallet |
| achievement_id | text | NO | | Achievement identifier |
| progress | integer | NO | 0 | Current progress count |
| is_unlocked | boolean | NO | false | Achievement unlocked? |
| unlocked_at | timestamp | YES | | When unlocked |
| created_at | timestamp | NO | now() | |
| updated_at | timestamp | NO | now() | |

---

### 6. purchase_history

Records all purchases (booster packs, premade decks, bundles).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | serial | NO | auto | Primary key |
| player_id | integer | NO | | FK → players.id |
| wallet_address | text | NO | | Player wallet |
| item_type | text | NO | | `booster_pack`, `premade_deck`, `bundle` |
| item_name | text | NO | | Display name of purchased item |
| quantity | integer | NO | 1 | Number purchased |
| metadata | jsonb | YES | | Extra details (price, pack type, etc.) |
| purchased_at | timestamp | NO | now() | |

---

### 7. starter_decks

Starter deck definitions. Given free to new players via The Ritual.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | serial | NO | auto | Primary key |
| deck_id | text | NO | | Unique deck identifier |
| name | text | NO | | Deck display name |
| faction | text | NO | | `guardians` or `corrupted` |
| element | text | NO | | `fire` or `water` |
| tribes | text | NO | | Tribe names (e.g. `Kobar & Borah`) |
| description | text | NO | | Deck description |
| created_at | timestamp | NO | now() | |
| updated_at | timestamp | NO | now() | |

**Unique constraints:** `deck_id`

**Current data (4 decks):**
| deck_id | name | faction | element |
|---------|------|---------|---------|
| fire-kuhaka-kujana-deck | Corrupted Fire Starter | corrupted | fire |
| fire-kobar-borah-deck | Guardian Fire Starter | guardians | fire |
| water-kuhaka-kujana-deck | Corrupted Water Starter | corrupted | water |
| water-kobar-borah-deck | Guardian Water Starter | guardians | water |

---

### 8. starter_deck_cards

Card entries for each starter deck. Links to cards via card_number.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | serial | NO | auto | Primary key |
| deck_id | text | NO | | FK → starter_decks.deck_id |
| card_number | text | NO | | Card number (e.g. `GEN-001`) |
| card_name | text | NO | | Card display name |
| card_type | text | NO | | `Avatar Lv1`, `Avatar Lv2`, `Spell`, `Quick Spell`, `Item`, `Equipment` |
| quantity | integer | NO | 1 | Number of copies in deck |

---

### 9. pvp_matches

PvP match sessions between two players.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | serial | NO | auto | Primary key |
| match_id | text | NO | | Unique match UUID |
| player1_wallet | text | NO | | Host player wallet |
| player2_wallet | text | YES | | Joined player wallet (null until matched) |
| player1_deck_id | text | NO | | Host's deck ID |
| player2_deck_id | text | YES | | Opponent's deck ID |
| status | text | NO | `waiting` | `waiting`, `in_progress`, `completed`, `cancelled` |
| game_mode | text | NO | `casual` | `casual`, `ranked`, `ante` |
| current_turn | integer | NO | 1 | Current turn number |
| active_player | text | YES | | Wallet of player whose turn it is |
| game_state | jsonb | YES | | Full game state snapshot |
| winner_wallet | text | YES | | Winner's wallet |
| end_reason | text | YES | | `victory`, `surrender`, `timeout`, `disconnect` |
| created_at | timestamp | NO | now() | |
| started_at | timestamp | YES | | When both players ready |
| completed_at | timestamp | YES | | When match ended |
| updated_at | timestamp | NO | now() | |

**Unique constraints:** `match_id`

---

### 10. match_actions

Action log for each PvP match. Used for sync and replay.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | serial | NO | auto | Primary key |
| match_id | text | NO | | FK → pvp_matches.match_id |
| action_number | integer | NO | | Sequential action number |
| player_wallet | text | NO | | Who performed the action |
| action_type | text | NO | | `draw`, `play_card`, `attack`, `activate_skill`, `end_turn`, `end_phase`, `surrender` |
| card_id | text | YES | | Card involved |
| target_id | text | YES | | Target card/player |
| action_data | jsonb | YES | | Extra action details |
| game_state_before | jsonb | YES | | State snapshot before |
| game_state_after | jsonb | YES | | State snapshot after |
| created_at | timestamp | NO | now() | |

---

### 11. deck_usage

Tracks which decks are used in games and their results.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| **id** | serial | NO | auto | Primary key |
| player_id | integer | NO | | FK → players.id |
| wallet_address | text | NO | | Player wallet |
| deck_id | text | NO | | Deck identifier |
| deck_name | text | NO | | Deck display name |
| game_mode | text | NO | | `casual`, `ranked`, `ante`, `ai` |
| game_result | text | YES | | `win`, `loss`, `draw` |
| used_at | timestamp | NO | now() | |

---

## Data Flow Summary

```
NEW PLAYER FLOW:
  Connect Wallet → players (auto-create)
  → Welcome Popup (has_seen_welcome)
  → Tutorial
  → The Ritual (has_completed_ritual, chosen_faction, chosen_element)
  → starter_decks + starter_deck_cards → player_cards (add starter cards)

CARD ACQUISITION:
  Booster Pack → purchase_history + player_cards (source: booster_pack)
  Premade Deck → purchase_history + player_cards (source: premade_deck)
  Starter Deck → player_cards (source: starter_deck)

DECK BUILDING:
  player_cards (owned cards) → player_decks (saved deck compositions)

GAMEPLAY:
  pvp_matches (match session) → match_actions (action log)
  player_decks → deck_usage (track which deck was used + result)
  deck_usage → players (update games_played, games_won, games_lost, ratings)
```

---

## API Endpoints by Table

| Table | Endpoint | Method | Description |
|-------|----------|--------|-------------|
| cards | `/api/cards/catalog` | GET | Full card catalog |
| players | `/api/player/register` | POST | Create player |
| players | `/api/player/welcome-status/:wallet` | GET | Check welcome status |
| players | `/api/player/welcome-seen` | PUT | Mark welcome seen |
| players | `/api/player/ritual-status/:wallet` | GET | Check ritual status |
| players | `/api/player/complete-ritual` | PUT | Complete The Ritual |
| starter_decks | `/api/starter-decks` | GET | All starter decks |
| starter_decks | `/api/starter-decks/:deckId` | GET | Single starter deck |
| player_cards | `/api/cards/:wallet` | GET | Player's owned cards |
| player_cards | `/api/cards/add` | POST | Add cards to collection |
| player_decks | `/api/decks/:wallet` | GET | Player's saved decks |
| player_decks | `/api/decks/save` | POST | Save a deck |
| purchase_history | `/api/purchases/:wallet` | GET | Purchase history |
| purchase_history | `/api/purchases/record` | POST | Record purchase |
| pvp_matches | `/api/pvp/create` | POST | Create match |
| pvp_matches | `/api/pvp/waiting` | GET | Available matches |
| pvp_matches | `/api/pvp/join` | POST | Join match |
| pvp_matches | `/api/pvp/match/:matchId` | GET | Match state |
| match_actions | `/api/pvp/match/:matchId/action` | POST | Record action |
| match_actions | `/api/pvp/match/:matchId/actions` | GET | Get actions |
| deck_usage | via game result recording | | Auto-tracked |

---

## Schema File Location

All table definitions are in: `shared/playerSchema.ts` (Drizzle ORM)

To push schema changes to the database:
```bash
npm run db:push
```
