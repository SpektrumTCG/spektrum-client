import { startGame, drawCard, addToSpektra, playAvatar, endPhase, checkWinner } from '../../engine/gameEngine'
import { cardRegistry } from '../../data/cardRegistry'
import { AvatarCard } from '../../types'

function buildTestDeck() {
  const avatars = cardRegistry.getCardsByType('avatar').slice(0, 5) as AvatarCard[]
  const spells = cardRegistry.getCardsByType('spell').slice(0, 10)
  return cardRegistry.shuffleDeck([...avatars, ...spells])
}

describe('startGame', () => {
  it('creates game state with two players', () => {
    const state = startGame(buildTestDeck(), buildTestDeck())
    expect(state.players).toHaveLength(2)
  })

  it('each player starts with 5 cards in hand', () => {
    const state = startGame(buildTestDeck(), buildTestDeck())
    expect(state.players[0].hand).toHaveLength(5)
    expect(state.players[1].hand).toHaveLength(5)
  })

  it('starts in setup phase', () => {
    const state = startGame(buildTestDeck(), buildTestDeck())
    expect(state.phase).toBe('setup')
  })

  it('sets currentPlayerIndex to 0', () => {
    const state = startGame(buildTestDeck(), buildTestDeck())
    expect(state.currentPlayerIndex).toBe(0)
  })

  it('winner is null at start', () => {
    const state = startGame(buildTestDeck(), buildTestDeck())
    expect(state.winner).toBeNull()
  })
})

describe('drawCard', () => {
  it('moves top deck card to hand', () => {
    const initial = startGame(buildTestDeck(), buildTestDeck())
    const handBefore = initial.players[0].hand.length
    const deckBefore = initial.players[0].deck.length
    const next = drawCard(initial, 0)
    expect(next.players[0].hand).toHaveLength(handBefore + 1)
    expect(next.players[0].deck).toHaveLength(deckBefore - 1)
  })

  it('does not mutate original state', () => {
    const initial = startGame(buildTestDeck(), buildTestDeck())
    const originalHandLen = initial.players[0].hand.length
    drawCard(initial, 0)
    expect(initial.players[0].hand).toHaveLength(originalHandLen)
  })

  it('returns same state when deck is empty', () => {
    const initial = startGame(buildTestDeck(), buildTestDeck())
    const emptyDeck = { ...initial, players: [{ ...initial.players[0], deck: [] }, initial.players[1]] as typeof initial.players }
    const next = drawCard(emptyDeck, 0)
    expect(next.players[0].hand.length).toBe(emptyDeck.players[0].hand.length)
  })
})

describe('addToSpektra', () => {
  it('moves named card from hand to spektraPile', () => {
    const initial = startGame(buildTestDeck(), buildTestDeck())
    const cardId = initial.players[0].hand[0].id
    const next = addToSpektra(initial, 0, cardId)
    expect(next.players[0].hand.find(c => c.id === cardId)).toBeUndefined()
    expect(next.players[0].spektraPile.find(c => c.id === cardId)).toBeDefined()
  })

  it('returns same state when card not in hand', () => {
    const initial = startGame(buildTestDeck(), buildTestDeck())
    const next = addToSpektra(initial, 0, 'nonexistent')
    expect(next.players[0].hand.length).toBe(initial.players[0].hand.length)
  })
})

describe('playAvatar', () => {
  it('places avatar into active slot and removes from hand', () => {
    const initial = startGame(buildTestDeck(), buildTestDeck())
    const avatar = initial.players[0].hand.find(c => c.type === 'avatar' && Number((c as AvatarCard).level) === 1)
    if (!avatar) return
    const next = playAvatar(initial, 0, avatar.id, 'active')
    expect(next.players[0].activeAvatar?.id).toBe(avatar.id)
    expect(next.players[0].hand.find(c => c.id === avatar.id)).toBeUndefined()
  })
})

describe('endPhase', () => {
  it('main1 → battle', () => {
    const initial = startGame(buildTestDeck(), buildTestDeck())
    expect(endPhase({ ...initial, phase: 'main1' }).phase).toBe('battle')
  })

  it('battle → main2', () => {
    const initial = startGame(buildTestDeck(), buildTestDeck())
    expect(endPhase({ ...initial, phase: 'battle' }).phase).toBe('main2')
  })

  it('main2 → end (via recheck)', () => {
    const initial = startGame(buildTestDeck(), buildTestDeck())
    const next = endPhase({ ...initial, phase: 'main2' })
    // recheck auto-advances to end
    expect(next.phase).toBe('end')
  })

  it('end → main1 (next turn via refresh→draw)', () => {
    const initial = startGame(buildTestDeck(), buildTestDeck())
    const next = endPhase({ ...initial, phase: 'end' })
    // end triggers nextTurn which auto-processes refresh→draw→main1
    expect(next.phase).toBe('main1')
    expect(next.currentTurn).toBe(initial.currentTurn + 1)
  })

  it('switches active player on turn change', () => {
    const initial = startGame(buildTestDeck(), buildTestDeck())
    const next = endPhase({ ...initial, phase: 'end' })
    expect(next.currentPlayerIndex).not.toBe(initial.currentPlayerIndex)
  })
})

describe('checkWinner', () => {
  it('returns null when no winner', () => {
    const state = startGame(buildTestDeck(), buildTestDeck())
    expect(checkWinner(state)).toBeNull()
  })

  it('returns winner id when opponent has no avatars, life cards, or playable hand', () => {
    const state = startGame(buildTestDeck(), buildTestDeck())
    const terminal: typeof state = {
      ...state,
      players: [
        state.players[0],
        { ...state.players[1], deck: [], lifeCards: [], hand: [], activeAvatar: null, reserveAvatars: [] },
      ],
    }
    expect(checkWinner(terminal)).toBe(state.players[0].id)
  })
})
