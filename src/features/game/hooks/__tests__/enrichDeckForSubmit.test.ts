import { describe, it, expect } from 'vitest'
import { enrichDeckForSubmit } from '../useMultiplayerGameSync'
import { cardRegistry } from '@spektrum/shared/data'

// Regression: DB-hydrated deck cards arrive with level: null (cards catalog
// rows historically lacked gameplay fields). A null/0 level must never
// override the registry's level — otherwise the server engine silently
// rejects avatar deploys with "Action rejected by engine".
describe('enrichDeckForSubmit', () => {
  interface TestCard {
    id: string
    type: string
    level?: number
    attack?: number
    health?: number
  }
  const registryAvatar = cardRegistry
    .getAllCards()
    .find((c) => c.type === 'avatar' && (c as unknown as TestCard).level === 1) as unknown as TestCard

  it('has a level-1 avatar in the registry to test against', () => {
    expect(registryAvatar).toBeTruthy()
  })

  it('restores registry level when deck card has level: null', () => {
    const [enriched] = enrichDeckForSubmit([
      { id: `${registryAvatar.id}-copy-0`, cardId: registryAvatar.id, level: null },
    ])
    expect(enriched.level).toBe(1)
    expect(enriched.type).toBe('avatar')
  })

  it('restores registry level when deck card has level: 0 (Number(null) coercion)', () => {
    const [enriched] = enrichDeckForSubmit([
      { id: `${registryAvatar.id}-copy-0`, cardId: registryAvatar.id, level: 0 },
    ])
    expect(enriched.level).toBe(1)
  })

  it('keeps a valid explicit level from the deck card', () => {
    const [enriched] = enrichDeckForSubmit([
      { id: `${registryAvatar.id}-copy-0`, cardId: registryAvatar.id, level: 2 },
    ])
    expect(enriched.level).toBe(2)
  })

  it('does not let other null fields override registry data', () => {
    const [enriched] = enrichDeckForSubmit([
      { id: `${registryAvatar.id}-copy-0`, cardId: registryAvatar.id, attack: null, health: null },
    ])
    expect(enriched.attack).toBe(registryAvatar.attack)
    expect(enriched.health).toBe(registryAvatar.health)
  })
})
