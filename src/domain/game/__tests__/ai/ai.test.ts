import { AIFactory } from '../../ai'
import { startGame } from '../../engine/gameEngine'
import { cardRegistry } from '../../data/cardRegistry'
import type { AvatarCard } from '../../types'

function buildTestDeck() {
  const avatars = cardRegistry.getCardsByType('avatar').slice(0, 5) as AvatarCard[]
  const spells = cardRegistry.getCardsByType('spell').slice(0, 10)
  return cardRegistry.shuffleDeck([...avatars, ...spells])
}

describe.each(['newbie', 'regular', 'advanced'] as const)('%s AI', (difficulty) => {
  it('returns a valid AIDecision for main phase', () => {
    const ai = AIFactory.create(difficulty)
    const state = startGame(buildTestDeck(), buildTestDeck())
    const decision = ai.decide({ ...state, phase: 'main1' }, 1)
    expect(decision).toBeDefined()
    expect(decision.type).toBeDefined()
    expect(typeof decision.reasoning).toBe('string')
    expect(decision.priority).toBeGreaterThanOrEqual(0)
  })

  it('returns endPhase when hand is empty', () => {
    const ai = AIFactory.create(difficulty)
    const state = startGame(buildTestDeck(), buildTestDeck())
    const emptyHand: typeof state = {
      ...state,
      players: [
        state.players[0],
        { ...state.players[1], hand: [] },
      ],
    }
    const decision = ai.decide({ ...emptyHand, phase: 'main1' }, 1)
    expect(decision.type).toBe('endPhase')
  })

  it('always returns endPhase for non-main phases', () => {
    const ai = AIFactory.create(difficulty)
    const state = startGame(buildTestDeck(), buildTestDeck())
    const drawPhase = ai.decide({ ...state, phase: 'draw' }, 1)
    expect(drawPhase.type).toBe('endPhase')
  })
})
