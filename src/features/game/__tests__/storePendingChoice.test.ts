import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '../store'
import { startGame, playSpell } from '@spektrum/shared'
import { cardRegistry } from '@spektrum/shared/data'
import type { Card, AvatarCard, GameState } from '@spektrum/shared'

function buildDeck(): Card[] {
  const avatars = (cardRegistry.getCardsByType('avatar') as AvatarCard[])
    .filter(a => Number(a.level) === 1)
    .slice(0, 10)
  const spells = cardRegistry.getCardsByType('spell').slice(0, 10)
  return cardRegistry.shuffleDeck([...avatars, ...spells])
}

const revealSpell = {
  id: 'test-reveal',
  name: 'Test Insight',
  type: 'spell',
  element: 'water',
  spektraCost: [],
  effectType: 'reveal_choose',
  effectValue: 3,
} as unknown as Card

function deckCard(id: string): Card {
  return { id, name: `Deck ${id}`, type: 'spell', element: 'neutral', spektraCost: [] } as unknown as Card
}

/** Game state for player 0 with a resolved reveal_choose pending. */
function pendingGameState(): GameState {
  const base = startGame(buildDeck(), buildDeck())
  const state: GameState = {
    ...base,
    phase: 'main1',
    players: [
      { ...base.players[0], hand: [revealSpell], deck: ['d1', 'd2', 'd3', 'd4'].map(deckCard) },
      base.players[1],
    ] as GameState['players'],
  }
  return playSpell(state, 0, 'test-reveal')
}

describe('useGameStore pendingChoice', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
  })

  it('resolveChoice applies the engine resolution in single-player', () => {
    const game = pendingGameState()
    expect(game.pendingChoice).toBeTruthy()
    useGameStore.setState({ game })

    useGameStore.getState().resolveChoice(['d2'])

    const after = useGameStore.getState().game!
    expect(after.pendingChoice ?? null).toBeNull()
    expect(after.players[0].hand.some(c => c.id === 'd2')).toBe(true)
  })

  it('resolveChoice with invalid ids leaves state unchanged', () => {
    const game = pendingGameState()
    useGameStore.setState({ game })

    useGameStore.getState().resolveChoice(['nope'])

    const after = useGameStore.getState().game!
    expect(after.pendingChoice).toBeTruthy()
  })

  it('applyServerGameState passes pendingChoice through', () => {
    const game = pendingGameState()
    const serverView = { ...game, _seq: 5, _selfIndex: 0 }

    useGameStore.getState().applyServerGameState(serverView)

    const after = useGameStore.getState().game!
    expect(after.pendingChoice).toBeTruthy()
    expect(after.pendingChoice!.cards.map(c => c.id)).toEqual(['d1', 'd2', 'd3'])
  })
})
