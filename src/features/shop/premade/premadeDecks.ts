import { cardRegistry } from "@spektrum/shared/data"
import type { Card, ElementType } from "@spektrum/shared"

/**
 * Hardcoded premade decks for the shop.
 *
 * Each deck is built at purchase time from real catalog cards (cardRegistry)
 * so the cards carry proper art, skills and rarity. The definitions below are
 * static — there is no DB/API dependency yet. Swap `buildDeckCards` for a
 * fetch later without touching the UI.
 */

export interface PremadeDeck {
  id: string
  name: string
  subtitle: string
  description: string
  /** Elements drawn from the catalog to fill the deck (+ neutral cards). */
  elements: ElementType[]
  /** Saved on the created deck for grouping/filtering. */
  tribe?: string
  price: number
  artUrl: string
  emoji: string
  /** Tailwind gradient classes for the fallback art tile. */
  color: string
}

const DECK_SIZE = 40
const MAX_COPIES = 4

export const PREMADE_DECKS: PremadeDeck[] = [
  {
    id: "genesis-fire",
    name: "Genesis Fire Starter",
    subtitle: "Aggro · Fire",
    description:
      "An aggressive Fire deck built to close games fast with high-tempo avatars and burn spells. A strong, ready-to-play starting point.",
    elements: ["fire"],
    tribe: "fire",
    price: 9.99,
    artUrl: "/boosters/beginner.png",
    emoji: "🔥",
    color: "from-red-600 to-orange-800",
  },
  {
    id: "genesis-water",
    name: "Genesis Water Control",
    subtitle: "Control · Water",
    description:
      "A defensive Water deck that grinds out value, stalls the board and wins the long game. Rewards patient, calculated play.",
    elements: ["water"],
    tribe: "water",
    price: 9.99,
    artUrl: "/boosters/advanced.png",
    emoji: "💧",
    color: "from-blue-600 to-cyan-800",
  },
  {
    id: "genesis-dual",
    name: "Genesis Tempo Dual",
    subtitle: "Midrange · Fire / Water",
    description:
      "A balanced Fire and Water midrange deck mixing burn pressure with sticky control tools. Flexible and forgiving for new pilots.",
    elements: ["fire", "water"],
    price: 12.99,
    artUrl: "/boosters/beginner.png",
    emoji: "⚡",
    color: "from-purple-600 to-indigo-800",
  },
]

export function getPremadeDeck(id: string): PremadeDeck | undefined {
  return PREMADE_DECKS.find((d) => d.id === id)
}

/**
 * Build a concrete, deck-builder-valid 40-card list from the catalog.
 * Avatars come first (catalog order), then spells/fields. Copies are capped at
 * MAX_COPIES per card to respect the same rule the deck builder enforces. Each
 * card instance gets a unique `-copy-N` id so duplicates are distinguishable.
 */
export function buildDeckCards(deck: PremadeDeck): Card[] {
  const seen = new Set<string>()
  const pool: Card[] = []
  for (const element of [...deck.elements, "neutral" as ElementType]) {
    for (const card of cardRegistry.getCardsByElement(element)) {
      if (seen.has(card.id)) continue
      seen.add(card.id)
      pool.push(card)
    }
  }

  const result: Card[] = []
  for (let copy = 1; copy <= MAX_COPIES && result.length < DECK_SIZE; copy++) {
    for (const card of pool) {
      if (result.length >= DECK_SIZE) break
      // Keep `cardId` = canonical catalog id so DB grant + deck-save ownership
      // checks resolve correctly; `id` stays unique per copy for the UI.
      result.push({ ...card, id: `${card.id}-copy-${copy}`, cardId: card.id } as unknown as Card)
    }
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
