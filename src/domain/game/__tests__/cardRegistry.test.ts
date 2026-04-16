import { cardRegistry } from '../data/cardRegistry'

describe('cardRegistry', () => {
  it('getAllCards returns a non-empty array', () => {
    expect(cardRegistry.getAllCards().length).toBeGreaterThan(0)
  })

  it('getCardById returns the correct card', () => {
    const all = cardRegistry.getAllCards()
    const first = all[0]
    expect(cardRegistry.getCardById(first.id)).toEqual(first)
  })

  it('getCardById returns undefined for unknown id', () => {
    expect(cardRegistry.getCardById('nonexistent-id-xyz')).toBeUndefined()
  })

  it('getCardsByElement returns only cards of that element', () => {
    const fireCards = cardRegistry.getCardsByElement('fire')
    expect(fireCards.length).toBeGreaterThan(0)
    expect(fireCards.every(c => c.element === 'fire')).toBe(true)
  })

  it('getCardsByType returns only cards of that type', () => {
    const avatars = cardRegistry.getCardsByType('avatar')
    expect(avatars.length).toBeGreaterThan(0)
    expect(avatars.every(c => c.type === 'avatar')).toBe(true)
  })

  it('no duplicate card ids', () => {
    const all = cardRegistry.getAllCards()
    const ids = all.map(c => c.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})
