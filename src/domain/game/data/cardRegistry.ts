import type { Card, ElementType, CardCategory } from '../types/card'
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

const ALL_CARDS: Card[] = [
  ...flatArray(allNewFireCards),
  ...flatArray(blueElementalCards),
  ...flatArray(blueElementalSpells),
  ...flatArray(blueElementalFieldCards),
  ...flatArray(redElementalCards),
  ...flatArray(allNeutralCards),
  ...flatArray(allNonElementalCards),
  ...flatArray(advancedSpellCards),
  ...flatArray(conditionalDamageCards),
]

// Deduplicate by id
const uniqueCards: Card[] = Array.from(
  new Map(ALL_CARDS.map(c => [c.id, c])).values()
)

export const cardRegistry = {
  getAllCards: (): Card[] => uniqueCards,
  getCardById: (id: string): Card | undefined => uniqueCards.find(c => c.id === id),
  getCardsByElement: (element: ElementType): Card[] => uniqueCards.filter(c => c.element === element),
  getCardsByType: (type: CardCategory): Card[] => uniqueCards.filter(c => c.type === type),
  shuffleDeck: (deck: Card[]): Card[] => [...deck].sort(() => Math.random() - 0.5),
}
