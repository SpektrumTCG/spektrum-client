import type { Card, ElementType, CardCategory } from '../types/card'
import { allCsvCards } from './cards/generated'
// Legacy imports kept for reference / fallback
import { allNewFireCards } from './cards/fire'
import { blueElementalCards, blueElementalSpells, blueElementalFieldCards } from './cards/water'
import { redElementalCards } from './cards/red'
import { allNeutralCards } from './cards/neutral'
import { allNonElementalCards } from './cards/nonElemental'
import { advancedSpellCards } from './cards/advanced'
import { conditionalDamageCards } from './cards/conditional'

function flatArray(val: unknown): Card[] {
  if (!val) return []
  if (Array.isArray(val)) return val as Card[]
  return [val as Card]
}

// Primary source: CSV-generated cards (source of truth)
// Falls back to legacy hand-written cards for any IDs not in CSV
const CSV_CARDS: Card[] = flatArray(allCsvCards)
const csvIds = new Set(CSV_CARDS.map(c => c.id))

const LEGACY_CARDS: Card[] = [
  ...flatArray(allNewFireCards),
  ...flatArray(blueElementalCards),
  ...flatArray(blueElementalSpells),
  ...flatArray(blueElementalFieldCards),
  ...flatArray(redElementalCards),
  ...flatArray(allNeutralCards),
  ...flatArray(allNonElementalCards),
  ...flatArray(advancedSpellCards),
  ...flatArray(conditionalDamageCards),
].filter(c => !csvIds.has(c.id))

const ALL_CARDS: Card[] = [...CSV_CARDS, ...LEGACY_CARDS]

// Deduplicate by id
const uniqueCards: Card[] = Array.from(
  new Map(ALL_CARDS.map(c => [c.id, c])).values()
)

export const cardRegistry = {
  getAllCards: (): Card[] => uniqueCards,
  getCardById: (id: string): Card | undefined => uniqueCards.find(c => c.id === id),
  getCardsByElement: (element: ElementType): Card[] => uniqueCards.filter(c => c.element === element),
  getCardsByType: (type: CardCategory): Card[] => uniqueCards.filter(c => c.type === type),
  shuffleDeck: (deck: Card[]): Card[] => {
    const shuffled = [...deck]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  },
}
