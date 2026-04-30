import type { Card, AvatarCard } from '../types/card'
import type { GameState, Player } from '../types/game'

const INITIAL_HAND_SIZE = 5
const INITIAL_LIFE_CARDS = 4

function createPlayer(id: string, name: string, deck: Card[], isActive: boolean): Player {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
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
  return {
    currentTurn: 1,
    phase: 'setup',
    players: [
      createPlayer('player', 'Player', playerDeck, true),
      createPlayer('opponent', 'Opponent', opponentDeck, false),
    ],
    currentPlayerIndex: 0 as 0 | 1,
    winner: null,
    turnTimer: 120,
    lastAction: 'Game started — deploy your Active Avatar!',
    battleLog: ['Game started', 'Setup Phase: Deploy your Active Avatar from your hand.'],
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
  const card = player.hand.find(c => c.id === cardId)
  if (!card || card.type !== 'avatar') return state

  const placed: AvatarCard = { ...(card as AvatarCard), turnPlayed: state.currentTurn, isTapped: false }

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
  if (state.phase === 'end') return nextTurn(state)

  // Setup phase: both players must have an active avatar before moving on
  if (state.phase === 'setup') {
    const player = state.players[state.currentPlayerIndex]
    if (!player.activeAvatar) return state // can't leave setup without deploying

    // If opponent also needs setup, switch to them
    const oppIndex: 0 | 1 = state.currentPlayerIndex === 0 ? 1 : 0
    const opponent = state.players[oppIndex]
    if (!opponent.activeAvatar) {
      return { ...state, currentPlayerIndex: oppIndex }
    }

    // Both have avatars — move to draw phase for player 0 (first turn)
    let next: GameState = {
      ...state,
      phase: 'draw',
      currentPlayerIndex: 0,
      currentTurn: 1,
    }
    // Auto-draw a card for the active player
    next = drawCard(next, 0)
    return next
  }

  const order: Array<GameState['phase']> = ['draw', 'main', 'battle', 'end']
  const idx = order.indexOf(state.phase)
  if (idx === -1) return state
  return { ...state, phase: order[idx + 1] ?? 'end' }
}

function nextTurn(state: GameState): GameState {
  const next: 0 | 1 = state.currentPlayerIndex === 0 ? 1 : 0
  let newState: GameState = {
    ...state,
    currentTurn: state.currentTurn + 1,
    phase: 'draw',
    currentPlayerIndex: next,
    players: [
      { ...state.players[0], isActivePlayer: next === 0, discardedThisTurn: [] },
      { ...state.players[1], isActivePlayer: next === 1, discardedThisTurn: [] },
    ],
  }
  // Auto-draw a card for the new active player
  newState = drawCard(newState, next)
  return newState
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
