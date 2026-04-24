# Deck Lists - Starter Decks (Database-Driven)

Starter deck data is now stored in the PostgreSQL database and served via the API.

**API Endpoints:**
- `GET /api/starter-decks` - Returns all 4 starter decks with their card lists
- `GET /api/starter-decks/:deckId` - Returns a specific starter deck

**Database Tables:**
- `starter_decks` - Deck definitions (name, faction, element, tribes, description)
- `starter_deck_cards` - Card entries per deck (card_number, card_name, card_type, quantity)

---

## Current Starter Decks

### 1. Corrupted Fire Starter (Kuhaka & Kujana)
**Deck ID:** `fire-kuhaka-kujana-deck`

| Card Number | Card Name | Type | Quantity |
|-------------|-----------|------|----------|
| GEN-001 | Witch Trainee | Avatar Lv1 | 3 |
| GEN-002 | Shaman | Avatar Lv1 | 3 |
| GEN-003 | Repo Girl | Avatar Lv1 | 3 |
| GEN-004 | Thug | Avatar Lv1 | 3 |
| GEN-005 | Shaman | Avatar Lv1 | 3 |
| GEN-006 | Goldie | Avatar Lv1 | 3 |
| GEN-026 | Banaspati | Avatar Lv2 | 1 |
| GEN-029 | Banaspati Fem | Avatar Lv2 | 1 |
| GEN-030 | Flame Flicker | Spell | 3 |
| GEN-031 | Heat Resonance | Spell | 2 |
| GEN-032 | Inferno Fuel | Spell | 2 |
| GEN-033 | Searing Flame | Spell | 1 |
| GEN-037 | Ember Spark | Quick Spell | 3 |
| GEN-038 | Volcanic Boost | Quick Spell | 3 |
| GEN-089 | Battle Preparation | Item | 1 |
| GEN-091 | Jamu Jahe Merah | Item | 2 |
| GEN-092 | Jamu Kencur | Item | 1 |
| GEN-094 | Prize | Item | 2 |
| **Total:** | | | **40** |

---

### 2. Guardian Fire Starter (Kobar & Borah)
**Deck ID:** `fire-kobar-borah-deck`

| Card Number | Card Name | Type | Quantity |
|-------------|-----------|------|----------|
| GEN-007 | Borah Trainee | Avatar Lv1 | 3 |
| GEN-008 | Borah Trainee | Avatar Lv1 | 3 |
| GEN-009 | Borah Trainee | Avatar Lv1 | 3 |
| GEN-010 | Kobar Trainee | Avatar Lv1 | 3 |
| GEN-011 | Kobar Trainee | Avatar Lv1 | 3 |
| GEN-012 | Kobar Trainee | Avatar Lv1 | 3 |
| GEN-013 | Radja | Avatar Lv2 | 1 |
| GEN-018 | Daisy | Avatar Lv2 | 1 |
| GEN-030 | Flame Flicker | Spell | 3 |
| GEN-031 | Heat Resonance | Spell | 2 |
| GEN-032 | Inferno Fuel | Spell | 2 |
| GEN-033 | Searing Flame | Spell | 1 |
| GEN-037 | Ember Spark | Quick Spell | 3 |
| GEN-038 | Volcanic Boost | Quick Spell | 3 |
| GEN-089 | Battle Preparation | Item | 1 |
| GEN-091 | Jamu Jahe Merah | Item | 2 |
| GEN-092 | Jamu Kencur | Item | 1 |
| GEN-094 | Prize | Item | 2 |
| **Total:** | | | **40** |

---

### 3. Corrupted Water Starter (Kuhaka & Kujana)
**Deck ID:** `water-kuhaka-kujana-deck`

| Card Number | Card Name | Type | Quantity |
|-------------|-----------|------|----------|
| GEN-060 | Fisherman | Avatar Lv1 | 3 |
| GEN-061 | Rich Tug | Avatar Lv1 | 3 |
| GEN-062 | Shaman | Avatar Lv1 | 3 |
| GEN-068 | Fishmonger | Avatar Lv1 | 3 |
| GEN-069 | Shaman | Avatar Lv1 | 3 |
| GEN-070 | Gal | Avatar Lv1 | 3 |
| GEN-064 | The Count | Avatar Lv2 | 1 |
| GEN-067 | The Count | Avatar Lv2 | 1 |
| GEN-082 | Check | Spell | 3 |
| GEN-073 | Ocean Memory | Spell | 2 |
| GEN-074 | Liquid Book | Spell | 2 |
| GEN-076 | Healing Current | Spell | 1 |
| GEN-077 | Deepsea Insight | Quick Spell | 3 |
| GEN-081 | Relearn | Quick Spell | 3 |
| GEN-089 | Battle Preparation | Item | 1 |
| GEN-091 | Jamu Jahe Merah | Item | 2 |
| GEN-092 | Jamu Kencur | Item | 1 |
| GEN-094 | Prize | Item | 2 |
| **Total:** | | | **40** |

---

### 4. Guardian Water Starter (Kobar & Borah)
**Deck ID:** `water-kobar-borah-deck`

| Card Number | Card Name | Type | Quantity |
|-------------|-----------|------|----------|
| GEN-046 | Borah Trainee | Avatar Lv1 | 3 |
| GEN-047 | Borah Trainee | Avatar Lv1 | 3 |
| GEN-048 | Borah Trainee | Avatar Lv1 | 3 |
| GEN-053 | Kobar Trainee | Avatar Lv1 | 3 |
| GEN-054 | Kobar Trainee | Avatar Lv1 | 3 |
| GEN-055 | Kobar Trainee | Avatar Lv1 | 3 |
| GEN-057 | Sapphire | Avatar Lv2 | 1 |
| GEN-050 | Maya | Avatar Lv2 | 1 |
| GEN-082 | Check | Spell | 3 |
| GEN-073 | Ocean Memory | Spell | 2 |
| GEN-074 | Liquid Book | Spell | 2 |
| GEN-076 | Healing Current | Spell | 1 |
| GEN-077 | Deepsea Insight | Quick Spell | 3 |
| GEN-081 | Relearn | Quick Spell | 3 |
| GEN-089 | Battle Preparation | Item | 1 |
| GEN-091 | Jamu Jahe Merah | Item | 2 |
| GEN-092 | Jamu Kencur | Item | 1 |
| GEN-094 | Prize | Item | 2 |
| **Total:** | | | **40** |

---

## Premade Decks (To Be Added)

Premade deck lists will be added here once provided. These are purchasable decks ($20 each).

- Fire Kobar & Borah Tribal
- Fire Kuhaka & Kujana Tribal
- Water Kobar & Borah Tribal
- Water Kuhaka & Kujana Tribal

---

## How to Update Deck Lists

To update deck data, modify directly in the database:
- `starter_decks` table for deck definitions
- `starter_deck_cards` table for card entries

Changes will be reflected immediately via the API without code deployments.
