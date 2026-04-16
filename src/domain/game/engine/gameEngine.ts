import type { Card, AvatarCard } from '../types/card'
import type { GameState, Player } from '../types/game'

const INITIAL_HAND_SIZE = 5
const INITIAL_LIFE_CARDS = 4

function createPlayer(id: string, name: string, deck: Card[], isActive: boolean): Player {
  const shuffled = [...deck].sort(() => Math.random() - 0.5)
  return {
    id,
    name,
    health: 20,
    maxHealth: 20,
    energy: { fire: 0, water: 0, ground: 0, air: 0, neutral: 0 },
    spektraPile: [],
    usedSpektraPile: [],
    lifeCards: shuffled.splice(0, INITIAL_LIFE_CARDS),
    hand: shuffled.splice(0, INITIAL_HAND_SIZE),
    deck: shuffled,
    discardPile: [],
    field: [],
    activeAvatar: null,
    reserveAvatars: [],
    counters: { bleed: 0, burn: 0, poison: 0, stun: 0, shield: 0 },
    discardedThisTurn: [],
    isActivePlayer: isActive,
  }
}

export function startGame(playerDeck: Card[], opponentDeck: Card[]): GameState {
  const firstPlayer = Math.random() < 0.5 ? 0 : 1
  return {
    currentTurn: 1,
    phase: 'draw',
    players: [
      createPlayer('player', 'Player', playerDeck, firstPlayer === 0),
      createPlayer('opponent', 'Opponent', opponentDeck, firstPlayer === 1),
    ],
    currentPlayerIndex: firstPlayer as 0 | 1,
    winner: null,
    turnTimer: 120,
    lastAction: 'Game started',
    battleLog: ['Game started'],
    effectStack: [],
  }
}

export function drawCard(state: GameState, playerIndex: 0 | 1): GameState {
  const player = state.players[playerIndex]
  if (player.deck.length === 0) return state

  const [drawn, ...remainingDeck] = player.deck
  return updatePlayer(state, playerIndex, {
    ...player,
    hand: [...player.hand, drawn],
    deck: remainingDeck,
  })
}

export function addToSpektra(state: GameState, playerIndex: 0 | 1, cardId: string): GameState {
  const player = state.players[playerIndex]
  const card = player.hand.find(c => c.id === cardId)
  if (!card) return state

  return updatePlayer(state, playerIndex, {
    ...player,
    hand: player.hand.filter(c => c.id !== cardId),
    spektraPile: [...player.spektraPile, card],
  })
}

export function playAvatar(
  state: GameState,
  playerIndex: 0 | 1,
  cardId: string,
  slot: 'active' | number
): GameState {
  const player = state.players[playerIndex]
  const card = player.hand.find(c => c.id === cardId) as AvatarCard | undefined
  if (!card || card.type !== 'avatar') return state

  const placed: AvatarCard = { ...card, turnPlayed: state.currentTurn, isTapped: false }

  if (slot === 'active') {
    return updatePlayer(state, playerIndex, {
      ...player,
      hand: player.hand.filter(c => c.id !== cardId),
      activeAvatar: placed,
    })
  }

  const reserve = [...player.reserveAvatars]
  reserve[slot as number] = placed
  return updatePlayer(state, playerIndex, {
    ...player,
    hand: player.hand.filter(c => c.id !== cardId),
    reserveAvatars: reserve,
  })
}

export function endPhase(state: GameState): GameState {
  const order: Array<GameState['phase']> = ['draw', 'main', 'battle', 'end']
  const idx = order.indexOf(state.phase)
  if (state.phase === 'end') return nextTurn(state)
  return { ...state, phase: order[idx + 1] ?? 'end' }
}

function nextTurn(state: GameState): GameState {
  const next: 0 | 1 = state.currentPlayerIndex === 0 ? 1 : 0
  return {
    ...state,
    currentTurn: state.currentTurn + 1,
    phase: 'draw',
    currentPlayerIndex: next,
    players: [
      { ...state.players[0], isActivePlayer: next === 0, discardedThisTurn: [] },
      { ...state.players[1], isActivePlayer: next === 1, discardedThisTurn: [] },
    ],
  }
}

export function checkWinner(state: GameState): string | null {
  for (const player of state.players) {
    const opp = state.players.find(p => p.id !== player.id)!
    if (opp.deck.length === 0 && opp.lifeCards.length === 0 && opp.hand.length === 0) {
      return player.id
    }
  }
  return null
}

function updatePlayer(state: GameState, index: 0 | 1, player: Player): GameState {
  const players: [Player, Player] = [state.players[0], state.players[1]]
  players[index] = player
  return { ...state, players }
}
