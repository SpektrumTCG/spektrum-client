import { cardRegistry } from "@spektrum/shared/data"
import type { Card, ElementType } from "@spektrum/shared"

/**
 * Hardcoded premade decks for the shop.
 *
 * Card lists mirror spektrum-shared/list_premade_decks.csv. Each entry references
 * a card by its canonical catalog id (cardRegistry id / `card_id` slug). Decks are
 * built at purchase time from real catalog cards so they carry proper art, skills
 * and rarity.
 *
 * RANDOM SLOTS: some Avatar Lv2 slots give the buyer 1 card chosen at random from
 * a set of options (see `randomSlots`).
 */

/** A fixed quantity of one catalog card. */
export interface PremadeDeckEntry {
  cardId: string
  quantity: number
}

/** A slot resolved at purchase time: `quantity` cards picked from `choices`. */
export interface PremadeRandomSlot {
  choices: string[]
  quantity: number
}

export interface PremadeDeck {
  id: string
  name: string
  subtitle: string
  description: string
  /** Saved on the created deck for grouping/filtering. */
  elements: ElementType[]
  tribe?: string
  price: number
  artUrl: string
  emoji: string
  /** Tailwind gradient classes for the fallback art tile. */
  color: string
  /** Fixed cards. */
  cards: PremadeDeckEntry[]
  /** Random-slot cards (1 of N), resolved per purchase. */
  randomSlots: PremadeRandomSlot[]
}

const DECK_SIZE = 40

export const PREMADE_DECKS: PremadeDeck[] = [
  {
    id: "fire-kuhaka-kujana",
    name: "Fire Kuhaka & Kujana Tribal",
    subtitle: "Aggro · Fire · Kuhaka/Kujana",
    description:
      "An aggressive Fire deck built around Kuhaka and Kujana avatars, closing games fast with high-tempo pressure and burn. Ready to play out of the box.",
    elements: ["fire"],
    tribe: "kuhaka-kujana",
    price: 9.99,
    artUrl: "/decks/fire-kuhaka-kujana.png",
    emoji: "🔥",
    color: "from-red-600 to-orange-800",
    cards: [
      { cardId: "fire-witch-trainee", quantity: 3 },
      { cardId: "fire-shaman-kujana", quantity: 3 },
      { cardId: "fire-repo-girl", quantity: 3 },
      { cardId: "fire-thug", quantity: 3 },
      { cardId: "fire-shaman-kuhaka", quantity: 3 },
      { cardId: "fire-goldie", quantity: 3 },
      { cardId: "fire-flame-flicker", quantity: 2 },
      { cardId: "fire-heat-resonance", quantity: 2 },
      { cardId: "fire-inferno-fuel", quantity: 2 },
      { cardId: "fire-searing-flame", quantity: 2 },
      { cardId: "fire-burning-sight", quantity: 2 },
      { cardId: "fire-ember-spark", quantity: 2 },
      { cardId: "neutral-haunted-stage", quantity: 1 },
      { cardId: "fire-volcanic-boost", quantity: 2 },
      { cardId: "fire-ashen-battlefield", quantity: 1 },
      { cardId: "neutral-battle-preparation", quantity: 1 },
      { cardId: "neutral-jamu-jahe-merah", quantity: 1 },
      { cardId: "neutral-jamu-kencur", quantity: 1 },
      { cardId: "neutral-prize", quantity: 1 },
    ],
    randomSlots: [
      { choices: ["fire-blood-demon", "fire-boar-berserker", "fire-banaspati"], quantity: 1 },
      { choices: ["fire-blood-eater", "fire-boar-witch", "fire-banaspati-female"], quantity: 1 },
    ],
  },
  {
    id: "fire-kobar-borah",
    name: "Fire Kobar & Borah Tribal",
    subtitle: "Midrange · Fire · Kobar/Borah",
    description:
      "A Fire fighter deck led by Kobar and Borah trainees that scale into heavy Lv2 hitters. Trades early, then closes with raw damage.",
    elements: ["fire"],
    tribe: "kobar-borah",
    price: 9.99,
    artUrl: "/decks/fire-kobar-borah.png",
    emoji: "🔥",
    color: "from-red-600 to-orange-800",
    cards: [
      { cardId: "fire-borah-trainee-a", quantity: 3 },
      { cardId: "fire-borah-trainee-b", quantity: 3 },
      { cardId: "fire-borah-trainee-c", quantity: 3 },
      { cardId: "fire-kobar-trainee-a", quantity: 3 },
      { cardId: "fire-kobar-trainee-b", quantity: 3 },
      { cardId: "fire-kobar-trainee-c", quantity: 3 },
      { cardId: "fire-flame-flicker", quantity: 2 },
      { cardId: "fire-heat-resonance", quantity: 2 },
      { cardId: "fire-inferno-fuel", quantity: 2 },
      { cardId: "fire-searing-flame", quantity: 1 },
      { cardId: "fire-burning-sight", quantity: 2 },
      { cardId: "fire-ember-spark", quantity: 2 },
      { cardId: "fire-volcanic-boost", quantity: 2 },
      { cardId: "fire-ashen-battlefield", quantity: 1 },
      { cardId: "neutral-battle-preparation", quantity: 1 },
      { cardId: "neutral-jamu-jahe-merah", quantity: 2 },
      { cardId: "neutral-jamu-kencur", quantity: 1 },
      { cardId: "neutral-recruitment-scroll", quantity: 1 },
      { cardId: "neutral-prize", quantity: 1 },
    ],
    randomSlots: [
      { choices: ["fire-radja", "fire-mera", "fire-crimson"], quantity: 1 },
      { choices: ["fire-dara", "fire-daisy", "fire-scarlet"], quantity: 1 },
    ],
  },
  {
    id: "water-kuhaka-kujana",
    name: "Water Kuhaka & Kujana Tribal",
    subtitle: "Tempo · Water · Kuhaka/Kujana",
    description:
      "A flexible Water deck of Kuhaka and Kujana avatars backed by card draw and control spells. Grinds value and dictates the pace.",
    elements: ["water"],
    tribe: "kuhaka-kujana",
    price: 9.99,
    artUrl: "/decks/water-kuhaka-kujana.png",
    emoji: "💧",
    color: "from-blue-600 to-cyan-800",
    cards: [
      { cardId: "water-fisherman", quantity: 3 },
      { cardId: "water-rich-thug", quantity: 3 },
      { cardId: "water-shaman-kuhaka", quantity: 3 },
      { cardId: "water-fishmonger", quantity: 3 },
      { cardId: "water-shaman-kujana", quantity: 3 },
      { cardId: "water-gal", quantity: 3 },
      { cardId: "water-check", quantity: 2 },
      { cardId: "water-blink", quantity: 2 },
      { cardId: "water-ocean-memory", quantity: 2 },
      { cardId: "water-dew-drop", quantity: 2 },
      { cardId: "water-healing-current", quantity: 1 },
      { cardId: "water-deepsea-insight", quantity: 2 },
      { cardId: "water-relearn", quantity: 2 },
      { cardId: "water-city-river", quantity: 1 },
      { cardId: "neutral-battle-preparation", quantity: 1 },
      { cardId: "neutral-jamu-jahe-merah", quantity: 2 },
      { cardId: "neutral-jamu-kencur", quantity: 1 },
      { cardId: "neutral-prize", quantity: 2 },
    ],
    randomSlots: [
      { choices: ["water-banyu-ghost-kuhaka", "water-lake-guardian", "water-the-count"], quantity: 1 },
      { choices: ["water-banyu-ghost-kujana", "water-pontia", "water-whirlpool-demon"], quantity: 1 },
    ],
  },
  {
    id: "water-kobar-borah",
    name: "Water Kobar & Borah Tribal",
    subtitle: "Control · Water · Kobar/Borah",
    description:
      "A defensive Water deck of Kobar and Borah avatars that stalls with armor and healing, then wins the long game with powerful Lv2 finishers.",
    elements: ["water"],
    tribe: "kobar-borah",
    price: 9.99,
    artUrl: "/decks/water-kobar-borah.png",
    emoji: "💧",
    color: "from-blue-600 to-cyan-800",
    cards: [
      { cardId: "water-borah-trainee-a", quantity: 3 },
      { cardId: "water-borah-trainee-b", quantity: 3 },
      { cardId: "water-borah-trainee-c", quantity: 3 },
      { cardId: "water-kobar-trainee-a", quantity: 3 },
      { cardId: "water-kobar-trainee-b", quantity: 3 },
      { cardId: "water-kobar-trainee-c", quantity: 3 },
      { cardId: "water-check", quantity: 2 },
      { cardId: "water-telang-tea", quantity: 1 },
      { cardId: "water-ocean-memory", quantity: 2 },
      { cardId: "water-dew-drop", quantity: 2 },
      { cardId: "water-healing-current", quantity: 1 },
      { cardId: "water-deepsea-insight", quantity: 2 },
      { cardId: "water-glacier-armor", quantity: 1 },
      { cardId: "water-relearn", quantity: 2 },
      { cardId: "water-lake-stage", quantity: 1 },
      { cardId: "neutral-battle-preparation", quantity: 1 },
      { cardId: "neutral-jamu-jahe-merah", quantity: 2 },
      { cardId: "neutral-jamu-kencur", quantity: 1 },
      { cardId: "neutral-crates", quantity: 2 },
    ],
    randomSlots: [
      { choices: ["water-arctic", "water-langit", "water-sapphire"], quantity: 1 },
      { choices: ["water-alice", "water-clear", "water-maya"], quantity: 1 },
    ],
  },
]

export function getPremadeDeck(id: string): PremadeDeck | undefined {
  return PREMADE_DECKS.find((d) => d.id === id)
}

/**
 * Build a concrete, deck-builder-valid 40-card list from the catalog.
 *
 * Fixed entries expand to `quantity` copies; each random slot resolves to
 * `quantity` cards chosen at random from its options. Every card instance gets a
 * unique `-copy-N` id so duplicates are distinguishable, while `cardId` stays the
 * canonical catalog id so DB grant + deck-save ownership checks resolve correctly.
 */
export function buildDeckCards(deck: PremadeDeck): Card[] {
  const picks: string[] = []

  for (const entry of deck.cards) {
    for (let i = 0; i < entry.quantity; i++) picks.push(entry.cardId)
  }

  for (const slot of deck.randomSlots) {
    for (let i = 0; i < slot.quantity; i++) {
      const choice = slot.choices[Math.floor(Math.random() * slot.choices.length)]
      picks.push(choice)
    }
  }

  const copies = new Map<string, number>()
  const result: Card[] = []
  for (const cardId of picks) {
    const base = cardRegistry.getCardById(cardId)
    if (!base) {
      console.warn(`[premade] unknown card id "${cardId}" in deck "${deck.id}" — skipped`)
      continue
    }
    const n = (copies.get(cardId) || 0) + 1
    copies.set(cardId, n)
    result.push({ ...base, id: `${cardId}-copy-${n}`, cardId } as unknown as Card)
  }

  return result.slice(0, DECK_SIZE)
}

/** Collapse a built deck to canonical catalog ids with owned quantities. */
export function deckCardQuantities(cards: Card[]): Array<{ cardId: string; quantity: number }> {
  const counts = new Map<string, number>()
  for (const card of cards) {
    const cardId = (card as { cardId?: string }).cardId || card.id
    counts.set(cardId, (counts.get(cardId) || 0) + 1)
  }
  return Array.from(counts, ([cardId, quantity]) => ({ cardId, quantity }))
}
