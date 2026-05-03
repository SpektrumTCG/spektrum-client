import type { Card, AvatarCard, ElementType, Skill } from '../types/card'
import type { GameState, Player, GamePhaseType } from '../types/game'
import type { SkillCheckState, SkillCheckPlayerState } from '../types/card'
import { destroyAvatar } from './destroyAvatar'
import { getValidEvolutionTargets } from './getValidEvolutionTargets'

const INITIAL_HAND_SIZE = 5
const INITIAL_LIFE_CARDS = 4
const MAX_HAND_SIZE = 8

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
    graveyard: [],
    field: [],
    activeAvatar: null,
    reserveAvatars: [],
    counters: { bleed: 0, burn: 0, poison: 0, stun: 0, shield: 0 },
    discardedThisTurn: [],
    isActivePlayer: isActive,
    avatarToSpektraCount: 0,
    hasPlayedItemThisTurn: false,
    equipmentActivations: {},
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

// ─── Phase progression ───────────────────────────────────────────────────────

const PHASE_ORDER: GamePhaseType[] = ['refresh', 'draw', 'main1', 'battle', 'main2', 'recheck', 'end']

export function endPhase(state: GameState): GameState {
  if (state.phase === 'game_over') return state
  if (state.phase === 'end') return nextTurn(state)

  // Setup phase: both players must have an active avatar before moving on
  if (state.phase === 'setup') {
    const player = state.players[state.currentPlayerIndex]
    if (!player.activeAvatar) return state

    const oppIndex: 0 | 1 = state.currentPlayerIndex === 0 ? 1 : 0
    const opponent = state.players[oppIndex]
    if (!opponent.activeAvatar) {
      return { ...state, currentPlayerIndex: oppIndex }
    }

    // Both have avatars — start the game with refresh phase for player 0
    return refreshPhase({ ...state, currentPlayerIndex: 0, currentTurn: 1 })
  }

  const idx = PHASE_ORDER.indexOf(state.phase)
  if (idx === -1) return state
  const nextPhaseType = PHASE_ORDER[idx + 1]
  if (!nextPhaseType) return { ...state, phase: 'end' }

  // Auto-process certain phases
  if (nextPhaseType === 'refresh') return refreshPhase(state)
  if (nextPhaseType === 'draw') return drawPhase(state)
  if (nextPhaseType === 'recheck') return recheckPhase(state)

  return { ...state, phase: nextPhaseType }
}

// ─── Refresh phase ───────────────────────────────────────────────────────────

export function refreshPhase(state: GameState): GameState {
  const pi = state.currentPlayerIndex
  const player = state.players[pi]

  // Used spektra are consumed permanently — do NOT restore them
  const refreshedPlayer: Player = {
    ...player,
    // spektraPile stays as-is (already reduced by consumeSpektra)
    usedSpektraPile: [],
    avatarToSpektraCount: 0,
    hasPlayedItemThisTurn: false,
    equipmentActivations: {},
    discardedThisTurn: [],
  }

  // Untap all avatars
  const untapped = untapAvatars(refreshedPlayer)

  let next = updatePlayer(state, pi, untapped)
  next = { ...next, phase: 'draw' }

  // Auto-advance to draw
  return drawPhase(next)
}

// ─── Draw phase ──────────────────────────────────────────────────────────────

export function drawPhase(state: GameState): GameState {
  let next = { ...state, phase: 'draw' as GamePhaseType }
  // Draw 1 card for active player (skip on turn 1 since they already drew in setup)
  next = drawCard(next, next.currentPlayerIndex)
  return { ...next, phase: 'main1' }
}

// ─── Recheck phase ───────────────────────────────────────────────────────────

export function recheckPhase(state: GameState): GameState {
  const pi = state.currentPlayerIndex
  const player = state.players[pi]

  // Enforce max hand size — discard excess for AI, player handles via UI
  if (player.hand.length > MAX_HAND_SIZE && player.id === 'opponent') {
    const excess = player.hand.length - MAX_HAND_SIZE
    const discarded = player.hand.slice(-excess)
    const remaining = player.hand.slice(0, MAX_HAND_SIZE)
    const updated: Player = {
      ...player,
      hand: remaining,
      graveyard: [...player.graveyard, ...discarded],
    }
    return { ...updatePlayer(state, pi, updated), phase: 'end' }
  }

  return { ...state, phase: 'end' }
}

// ─── Card operations ─────────────────────────────────────────────────────────

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
  if (player.avatarToSpektraCount >= 1) return state // Limit: 1 per turn

  const card = player.hand.find(c => c.id === cardId)
  if (!card) return state

  return updatePlayer(state, playerIndex, {
    ...player,
    hand: player.hand.filter(c => c.id !== cardId),
    spektraPile: [...player.spektraPile, card],
    avatarToSpektraCount: player.avatarToSpektraCount + 1,
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

  const avatar = card as AvatarCard
  if (Number(avatar.level) !== 1) return state // Only Level 1 can be placed directly

  const placed: AvatarCard = { ...avatar, turnPlayed: state.currentTurn, isTapped: false }

  if (slot === 'active') {
    if (player.activeAvatar) return state // Slot occupied
    return updatePlayer(state, playerIndex, {
      ...player,
      hand: player.hand.filter(c => c.id !== cardId),
      activeAvatar: placed,
    })
  }

  const reserveIdx = slot as number
  if (reserveIdx < 0 || reserveIdx >= 2) return state
  if (player.reserveAvatars[reserveIdx]) return state // Slot occupied

  const reserve = [...player.reserveAvatars]
  reserve[reserveIdx] = placed
  return updatePlayer(state, playerIndex, {
    ...player,
    hand: player.hand.filter(c => c.id !== cardId),
    reserveAvatars: reserve,
  })
}

// ─── Spektra cost ────────────────────────────────────────────────────────────

export function hasEnoughSpektra(player: Player, cost: ElementType[]): boolean {
  if (!cost || cost.length === 0) return true

  // Count available elements in spektra pile
  const available: Record<string, number> = {}
  let neutralAvailable = 0
  for (const card of player.spektraPile) {
    const el = card.element ?? 'neutral'
    if (el === 'neutral') {
      neutralAvailable++
    } else {
      available[el] = (available[el] ?? 0) + 1
    }
  }

  // Count needed elements — "neutral" in cost = wildcard (any element pays)
  let neutralNeeded = 0
  const needed: Record<string, number> = {}
  for (const el of cost) {
    if (el === 'neutral') {
      neutralNeeded++
    } else {
      needed[el] = (needed[el] ?? 0) + 1
    }
  }

  // Match specific element costs first; shortfall can be covered by neutral cards
  let neutralRemaining = neutralAvailable
  for (const [element, count] of Object.entries(needed)) {
    const have = available[element] ?? 0
    const shortfall = count - have
    if (shortfall > 0) {
      // Try to cover shortfall with neutral cards (neutral pays for any element)
      if (neutralRemaining >= shortfall) {
        neutralRemaining -= shortfall
      } else {
        return false
      }
    }
  }

  // "Neutral" cost entries are wildcards — any remaining card (including neutral) can pay
  const totalRemaining =
    Object.values(available).reduce((sum, v) => sum + v, 0)
    - Object.values(needed).reduce((sum, v) => sum + v, 0)
    + neutralRemaining
  // totalRemaining = leftover specific cards + leftover neutral cards
  // Specific cards that were over-allocated from the needed check above still count
  const leftoverSpecific = Object.entries(available).reduce((sum, [el, v]) => {
    return sum + Math.max(0, v - (needed[el] ?? 0))
  }, 0)

  return (leftoverSpecific + neutralRemaining) >= neutralNeeded
}

export function consumeSpektra(state: GameState, playerIndex: 0 | 1, cost: ElementType[]): GameState {
  if (!cost || cost.length === 0) return state
  const player = state.players[playerIndex]
  const remaining = [...player.spektraPile]
  const consumed: Card[] = []

  // Pay specific element costs first, then wildcards (neutral costs)
  const specificCosts = cost.filter(el => el !== 'neutral')
  const neutralCostCount = cost.length - specificCosts.length

  for (const element of specificCosts) {
    // Try exact element match first
    let idx = remaining.findIndex(c => (c.element ?? 'neutral') === element)
    // Fall back to neutral card (neutral pays for any element)
    if (idx === -1) idx = remaining.findIndex(c => (c.element ?? 'neutral') === 'neutral')
    if (idx === -1) return state
    consumed.push(remaining.splice(idx, 1)[0])
  }

  // Neutral cost = wildcard, any remaining card can pay
  for (let i = 0; i < neutralCostCount; i++) {
    if (remaining.length === 0) return state
    consumed.push(remaining.splice(0, 1)[0])
  }

  // Consumed spektra are permanently spent — go to graveyard
  return updatePlayer(state, playerIndex, {
    ...player,
    spektraPile: remaining,
    graveyard: [...player.graveyard, ...consumed],
  })
}

// ─── Skill execution ─────────────────────────────────────────────────────────

export function executeSkill(
  state: GameState,
  playerIndex: 0 | 1,
  skillIndex: number,
  targetPlayerIndex?: 0 | 1,
): GameState {
  const player = state.players[playerIndex]
  const avatar = player.activeAvatar
  if (!avatar || avatar.isTapped) return state

  // Get the skill
  const skills = avatar.skills ?? [avatar.skill1, avatar.skill2].filter(Boolean)
  const skill = skills[skillIndex] as Skill | undefined
  if (!skill) return state

  // Check spektra cost
  const cost = skill.spektraCost ?? []
  if (!hasEnoughSpektra(player, cost)) return state

  // Consume spektra
  let next = consumeSpektra(state, playerIndex, cost)

  // Calculate damage
  const baseDamage = skill.damage ?? 0
  const oppIdx = targetPlayerIndex ?? (playerIndex === 0 ? 1 : 0) as 0 | 1
  const opponent = next.players[oppIdx]

  // Process bleed-on-attack: if attacker has bleed, take bleed damage before attacking
  if (avatar.counters?.bleed && avatar.counters.bleed > 0) {
    const bleedDmg = avatar.counters.bleed
    const currentDmg = avatar.counters?.damage ?? 0
    const updatedAvatar: AvatarCard = {
      ...avatar,
      counters: { ...avatar.counters, damage: currentDmg + bleedDmg },
    }
    const updatedPlayer = { ...next.players[playerIndex], activeAvatar: updatedAvatar }
    next = updatePlayer(next, playerIndex, updatedPlayer)

    // Check if avatar died from bleed
    if ((updatedAvatar.counters?.damage ?? 0) >= updatedAvatar.health) {
      next = {
        ...next,
        battleLog: [...next.battleLog, `${avatar.name} collapsed from bleed damage!`],
      }
      return checkDefeatedAvatars(next)
    }
  }

  // Apply damage to opponent's active avatar
  if (baseDamage > 0 && opponent.activeAvatar) {
    const oppAvatar = opponent.activeAvatar
    const currentDmg = oppAvatar.counters?.damage ?? 0
    const updatedOppAvatar: AvatarCard = {
      ...oppAvatar,
      counters: { ...(oppAvatar.counters ?? { damage: 0, bleed: 0, shield: 0 }), damage: currentDmg + baseDamage },
    }
    const updatedOpp = { ...opponent, activeAvatar: updatedOppAvatar }
    next = updatePlayer(next, oppIdx, updatedOpp)
  }

  // Apply additional effects based on effectType
  if (skill.effectType && skill.effectType !== 'none') {
    next = applySkillEffect(next, playerIndex, oppIdx, skill)
  }

  // Mark avatar as tapped
  const tappedAvatar: AvatarCard = { ...(next.players[playerIndex].activeAvatar!), isTapped: true }
  next = updatePlayer(next, playerIndex, { ...next.players[playerIndex], activeAvatar: tappedAvatar })

  // Add battle log
  next = {
    ...next,
    battleLog: [...next.battleLog, `${avatar.name} used ${skill.name}${baseDamage > 0 ? ` for ${baseDamage} damage` : ''}!`],
    lastAction: `${avatar.name} used ${skill.name}!`,
  }

  // Check for defeated avatars
  next = checkDefeatedAvatars(next)

  return next
}

function applySkillEffect(state: GameState, playerIdx: 0 | 1, oppIdx: 0 | 1, skill: Skill): GameState {
  const effectValue = skill.effectValue ?? 0
  const player = state.players[playerIdx]
  const opponent = state.players[oppIdx]

  switch (skill.effectType) {
    case 'heal': {
      if (!player.activeAvatar) return state
      const currentDmg = player.activeAvatar.counters?.damage ?? 0
      const healed = Math.max(0, currentDmg - effectValue)
      const updatedAvatar: AvatarCard = {
        ...player.activeAvatar,
        counters: { ...(player.activeAvatar.counters ?? { damage: 0, bleed: 0, shield: 0 }), damage: healed },
      }
      return updatePlayer(state, playerIdx, { ...player, activeAvatar: updatedAvatar })
    }
    case 'shield': {
      if (!player.activeAvatar) return state
      const currentShield = player.activeAvatar.counters?.shield ?? 0
      const updatedAvatar: AvatarCard = {
        ...player.activeAvatar,
        counters: { ...(player.activeAvatar.counters ?? { damage: 0, bleed: 0, shield: 0 }), shield: currentShield + effectValue },
      }
      return updatePlayer(state, playerIdx, { ...player, activeAvatar: updatedAvatar })
    }
    case 'bleed': {
      if (!opponent.activeAvatar) return state
      const currentBleed = opponent.activeAvatar.counters?.bleed ?? 0
      const updatedOppAvatar: AvatarCard = {
        ...opponent.activeAvatar,
        counters: { ...(opponent.activeAvatar.counters ?? { damage: 0, bleed: 0, shield: 0 }), bleed: currentBleed + effectValue },
      }
      return updatePlayer(state, oppIdx, { ...opponent, activeAvatar: updatedOppAvatar })
    }
    case 'draw': {
      let next = state
      for (let i = 0; i < effectValue; i++) {
        next = drawCard(next, playerIdx)
      }
      return next
    }
    default:
      return state
  }
}

// ─── Spell execution ─────────────────────────────────────────────────────────

export function playSpell(state: GameState, playerIndex: 0 | 1, cardId: string): GameState {
  const player = state.players[playerIndex]
  const card = player.hand.find(c => c.id === cardId)
  if (!card || (card.type !== 'spell' && card.type !== 'quickSpell')) return state

  const spellCard = card as import('../types/card').ActionCard

  // Check spektra cost
  const cost = (spellCard.spektraCost ?? []) as ElementType[]
  if (!hasEnoughSpektra(player, cost)) return state

  // Consume spektra
  let next = consumeSpektra(state, playerIndex, cost)

  // Remove from hand, add to discard pile
  const updatedPlayer = next.players[playerIndex]
  next = updatePlayer(next, playerIndex, {
    ...updatedPlayer,
    hand: updatedPlayer.hand.filter(c => c.id !== cardId),
    discardPile: [...updatedPlayer.discardPile, card],
  })

  // Apply spell effect
  const oppIdx = (playerIndex === 0 ? 1 : 0) as 0 | 1
  const effectType = spellCard.effectType ?? 'damage'
  const effectValue = spellCard.effectValue ?? 0
  const opponent = next.players[oppIdx]

  if (effectType === 'damage' || effectType === 'none') {
    // Direct damage to opponent's active avatar
    if (opponent.activeAvatar && effectValue > 0) {
      const currentDmg = opponent.activeAvatar.counters?.damage ?? 0
      const updatedOpp: AvatarCard = {
        ...opponent.activeAvatar,
        counters: { ...(opponent.activeAvatar.counters ?? { damage: 0, bleed: 0, shield: 0 }), damage: currentDmg + effectValue },
      }
      next = updatePlayer(next, oppIdx, { ...opponent, activeAvatar: updatedOpp })
    }
  } else if (effectType === 'heal') {
    const myPlayer = next.players[playerIndex]
    if (myPlayer.activeAvatar) {
      const currentDmg = myPlayer.activeAvatar.counters?.damage ?? 0
      const healed = Math.max(0, currentDmg - effectValue)
      const updated: AvatarCard = {
        ...myPlayer.activeAvatar,
        counters: { ...(myPlayer.activeAvatar.counters ?? { damage: 0, bleed: 0, shield: 0 }), damage: healed },
      }
      next = updatePlayer(next, playerIndex, { ...myPlayer, activeAvatar: updated })
    }
  } else if (effectType === 'draw') {
    for (let i = 0; i < effectValue; i++) {
      next = drawCard(next, playerIndex)
    }
  } else if (effectType === 'bleed') {
    if (opponent.activeAvatar) {
      const currentBleed = opponent.activeAvatar.counters?.bleed ?? 0
      const updated: AvatarCard = {
        ...opponent.activeAvatar,
        counters: { ...(opponent.activeAvatar.counters ?? { damage: 0, bleed: 0, shield: 0 }), bleed: currentBleed + effectValue },
      }
      next = updatePlayer(next, oppIdx, { ...opponent, activeAvatar: updated })
    }
  } else if (effectType === 'shield') {
    const myPlayer = next.players[playerIndex]
    if (myPlayer.activeAvatar) {
      const currentShield = myPlayer.activeAvatar.counters?.shield ?? 0
      const updated: AvatarCard = {
        ...myPlayer.activeAvatar,
        counters: { ...(myPlayer.activeAvatar.counters ?? { damage: 0, bleed: 0, shield: 0 }), shield: currentShield + effectValue },
      }
      next = updatePlayer(next, playerIndex, { ...myPlayer, activeAvatar: updated })
    }
  }

  next = {
    ...next,
    battleLog: [...next.battleLog, `${spellCard.name} cast!`],
    lastAction: `${spellCard.name} cast!`,
  }

  return checkDefeatedAvatars(next)
}

// ─── Item execution ─────────────────────────────────────────────────────────

export function playItem(state: GameState, playerIndex: 0 | 1, cardId: string): GameState {
  const player = state.players[playerIndex]
  if (player.hasPlayedItemThisTurn) return state // 1 item per turn

  const card = player.hand.find(c => c.id === cardId)
  if (!card || card.type !== 'item') return state

  const itemCard = card as import('../types/card').ActionCard

  // Check spektra cost
  const cost = (itemCard.spektraCost ?? []) as ElementType[]
  if (!hasEnoughSpektra(player, cost)) return state

  // Consume spektra
  let next = consumeSpektra(state, playerIndex, cost)

  // Remove from hand, add to discard pile, mark item played
  const updatedPlayer = next.players[playerIndex]
  next = updatePlayer(next, playerIndex, {
    ...updatedPlayer,
    hand: updatedPlayer.hand.filter(c => c.id !== cardId),
    discardPile: [...updatedPlayer.discardPile, card],
    hasPlayedItemThisTurn: true,
  })

  // Apply item effect
  const oppIdx = (playerIndex === 0 ? 1 : 0) as 0 | 1
  const effectType = itemCard.effectType ?? 'none'
  const effectValue = itemCard.effectValue ?? 0
  const effectValue2 = itemCard.effectValue2 ?? 0

  if (effectType === 'heal') {
    // Heal active avatar
    const p = next.players[playerIndex]
    if (p.activeAvatar) {
      const currentDmg = p.activeAvatar.counters?.damage ?? 0
      const healed = Math.max(0, currentDmg - effectValue)
      const updated: AvatarCard = {
        ...p.activeAvatar,
        counters: { ...(p.activeAvatar.counters ?? { damage: 0, bleed: 0, shield: 0 }), damage: healed },
      }
      next = updatePlayer(next, playerIndex, { ...p, activeAvatar: updated })
    }
  } else if (effectType === 'draw') {
    for (let i = 0; i < effectValue; i++) {
      next = drawCard(next, playerIndex)
    }
  } else if (effectType === 'discard_draw') {
    // Discard entire hand, then draw effectValue cards
    const p = next.players[playerIndex]
    next = updatePlayer(next, playerIndex, {
      ...p,
      hand: [],
      discardPile: [...p.discardPile, ...p.hand],
    })
    for (let i = 0; i < effectValue; i++) {
      next = drawCard(next, playerIndex)
    }
  } else if (effectType === 'discard_heal') {
    // Discard effectValue cards from hand, then heal effectValue2
    const p = next.players[playerIndex]
    const toDiscard = p.hand.slice(0, effectValue)
    next = updatePlayer(next, playerIndex, {
      ...p,
      hand: p.hand.slice(effectValue),
      discardPile: [...p.discardPile, ...toDiscard],
    })
    const p2 = next.players[playerIndex]
    if (p2.activeAvatar) {
      const currentDmg = p2.activeAvatar.counters?.damage ?? 0
      const healed = Math.max(0, currentDmg - effectValue2)
      const updated: AvatarCard = {
        ...p2.activeAvatar,
        counters: { ...(p2.activeAvatar.counters ?? { damage: 0, bleed: 0, shield: 0 }), damage: healed },
      }
      next = updatePlayer(next, playerIndex, { ...p2, activeAvatar: updated })
    }
  } else if (effectType === 'discard_retrieve') {
    // Discard effectValue cards, then retrieve effectValue2 avatar(s) from graveyard
    const p = next.players[playerIndex]
    const toDiscard = p.hand.slice(0, effectValue)
    next = updatePlayer(next, playerIndex, {
      ...p,
      hand: p.hand.slice(effectValue),
      discardPile: [...p.discardPile, ...toDiscard],
    })
    const p2 = next.players[playerIndex]
    const avatarsInGrave = p2.graveyard.filter(c => c.type === 'avatar')
    const retrieved = avatarsInGrave.slice(0, effectValue2)
    if (retrieved.length > 0) {
      next = updatePlayer(next, playerIndex, {
        ...p2,
        hand: [...p2.hand, ...retrieved],
        graveyard: p2.graveyard.filter(c => !retrieved.some(r => r.id === c.id)),
      })
    }
  } else if (effectType === 'discard_search') {
    // Discard effectValue avatar cards, search deck for same-element avatar
    const p = next.players[playerIndex]
    const avatarsInHand = p.hand.filter(c => c.type === 'avatar')
    const toDiscard = avatarsInHand.slice(0, effectValue)
    if (toDiscard.length > 0) {
      const searchElement = (toDiscard[0] as AvatarCard).element
      const found = p.deck.find(c => c.type === 'avatar' && c.element === searchElement)
      let newHand = p.hand.filter(c => !toDiscard.some(d => d.id === c.id))
      let newDeck = [...p.deck]
      if (found) {
        newHand = [...newHand, found]
        newDeck = newDeck.filter(c => c.id !== found.id)
      }
      next = updatePlayer(next, playerIndex, {
        ...p,
        hand: newHand,
        deck: newDeck,
        discardPile: [...p.discardPile, ...toDiscard],
      })
    }
  } else if (effectType === 'damage') {
    const opponent = next.players[oppIdx]
    if (opponent.activeAvatar && effectValue > 0) {
      const currentDmg = opponent.activeAvatar.counters?.damage ?? 0
      const updated: AvatarCard = {
        ...opponent.activeAvatar,
        counters: { ...(opponent.activeAvatar.counters ?? { damage: 0, bleed: 0, shield: 0 }), damage: currentDmg + effectValue },
      }
      next = updatePlayer(next, oppIdx, { ...opponent, activeAvatar: updated })
    }
  }

  next = {
    ...next,
    battleLog: [...next.battleLog, `${itemCard.name} used!`],
    lastAction: `${itemCard.name} used!`,
  }

  return checkDefeatedAvatars(next)
}

// ─── Evolution ───────────────────────────────────────────────────────────────

export function evolveAvatar(
  state: GameState,
  playerIndex: 0 | 1,
  handCardId: string,
  targetSlot: 'active' | number
): GameState {
  const player = state.players[playerIndex]
  const card = player.hand.find(c => c.id === handCardId)
  if (!card || card.type !== 'avatar') return state

  const level2Card = card as AvatarCard
  if (Number(level2Card.level) !== 2) return state

  // Validate evolution target
  const validSlots = getValidEvolutionTargets(level2Card, {
    activeAvatar: player.activeAvatar,
    reserveAvatars: player.reserveAvatars,
  }, state.currentTurn)

  if (!validSlots.includes(targetSlot)) return state

  // Get the target avatar
  let target: AvatarCard | null = null
  if (targetSlot === 'active') {
    target = player.activeAvatar
  } else {
    target = player.reserveAvatars[targetSlot as number] ?? null
  }
  if (!target) return state

  // Evolve: preserve counters and equipment from base
  const evolved: AvatarCard = {
    ...level2Card,
    turnPlayed: state.currentTurn,
    isTapped: target.isTapped ?? false,
    counters: target.counters ? { ...target.counters } : undefined,
    attachedEquipment: target.attachedEquipment ? [...target.attachedEquipment] : undefined,
    baseCard: target,
  }

  // Place evolved avatar
  let updated: Player
  if (targetSlot === 'active') {
    updated = {
      ...player,
      hand: player.hand.filter(c => c.id !== handCardId),
      activeAvatar: evolved,
    }
  } else {
    const reserve = [...player.reserveAvatars]
    reserve[targetSlot as number] = evolved
    updated = {
      ...player,
      hand: player.hand.filter(c => c.id !== handCardId),
      reserveAvatars: reserve,
    }
  }

  let next = updatePlayer(state, playerIndex, updated)
  next = {
    ...next,
    battleLog: [...next.battleLog, `${target.name} evolved into ${level2Card.name}!`],
    lastAction: `${target.name} evolved into ${level2Card.name}!`,
  }

  return next
}

// ─── Damage resolution ──────────────────────────────────────────────────────

export function checkDefeatedAvatars(state: GameState): GameState {
  let next = state

  for (const pi of [0, 1] as const) {
    const player = next.players[pi]

    // Check active avatar
    if (player.activeAvatar) {
      const dmg = player.activeAvatar.counters?.damage ?? 0
      if (dmg >= player.activeAvatar.health) {
        next = handleAvatarDefeat(next, pi, 'active')
      }
    }

    // Check reserve avatars
    const updatedPlayer = next.players[pi]
    for (let ri = updatedPlayer.reserveAvatars.length - 1; ri >= 0; ri--) {
      const reserve = updatedPlayer.reserveAvatars[ri]
      if (reserve) {
        const dmg = reserve.counters?.damage ?? 0
        if (dmg >= reserve.health) {
          next = handleAvatarDefeat(next, pi, ri)
        }
      }
    }
  }

  return next
}

function handleAvatarDefeat(state: GameState, playerIndex: 0 | 1, slot: 'active' | number): GameState {
  const player = state.players[playerIndex]
  let defeatedAvatar: AvatarCard | null = null

  if (slot === 'active') {
    defeatedAvatar = player.activeAvatar
  } else {
    defeatedAvatar = player.reserveAvatars[slot as number] ?? null
  }

  if (!defeatedAvatar) return state

  // Send to graveyard
  const graveyardCards = destroyAvatar(defeatedAvatar)

  let updated: Player = {
    ...player,
    graveyard: [...player.graveyard, ...graveyardCards],
  }

  if (slot === 'active') {
    updated.activeAvatar = null

    // Promote first reserve to active
    const firstReserve = updated.reserveAvatars.find(a => a !== null && a !== undefined)
    if (firstReserve) {
      updated.activeAvatar = firstReserve
      updated.reserveAvatars = updated.reserveAvatars.filter(a => a !== firstReserve)
    }
  } else {
    const reserve = [...updated.reserveAvatars]
    reserve.splice(slot as number, 1)
    updated.reserveAvatars = reserve
  }

  let next = updatePlayer(state, playerIndex, updated)

  next = {
    ...next,
    battleLog: [...next.battleLog, `${defeatedAvatar.name} was defeated!`],
  }

  // Attacker takes a life card prize from the defeated player
  const attackerIdx: 0 | 1 = playerIndex === 0 ? 1 : 0
  const defeated = next.players[playerIndex]
  if (defeated.lifeCards.length > 0) {
    const [prizeCard, ...remainingLife] = defeated.lifeCards
    const attacker = next.players[attackerIdx]
    next = updatePlayer(next, playerIndex, {
      ...next.players[playerIndex],
      lifeCards: remainingLife,
    })
    next = updatePlayer(next, attackerIdx, {
      ...next.players[attackerIdx],
      hand: [...attacker.hand, prizeCard],
    })
    next = {
      ...next,
      battleLog: [...next.battleLog, `${attacker.name} takes a Life Card prize! (${defeated.name}: ${remainingLife.length} remaining)`],
    }
  }

  // Check if defeated player must promote a reserve or use life cards
  const p = next.players[playerIndex]
  if (!p.activeAvatar && p.reserveAvatars.length === 0 && p.lifeCards.length > 0) {
    // Life card goes to hand so they can deploy a new avatar
    const [lifeCard, ...remainingLife] = p.lifeCards
    next = updatePlayer(next, playerIndex, {
      ...next.players[playerIndex],
      lifeCards: remainingLife,
      hand: [...next.players[playerIndex].hand, lifeCard],
    })
    next = {
      ...next,
      battleLog: [...next.battleLog, `${p.name} uses a Life Card! (${remainingLife.length} remaining)`],
    }
  }

  return next
}

// ─── Turn management ─────────────────────────────────────────────────────────

export function nextTurn(state: GameState): GameState {
  const next: 0 | 1 = state.currentPlayerIndex === 0 ? 1 : 0
  const p0: Player = { ...state.players[0], isActivePlayer: next === 0, discardedThisTurn: [] }
  const p1: Player = { ...state.players[1], isActivePlayer: next === 1, discardedThisTurn: [] }
  const newState: GameState = {
    ...state,
    currentTurn: state.currentTurn + 1,
    phase: 'refresh',
    currentPlayerIndex: next,
    players: [p0, p1],
  }
  // Auto-process refresh → draw → main1
  return refreshPhase(newState)
}

// ─── Win condition ───────────────────────────────────────────────────────────

export function checkWinner(state: GameState): string | null {
  if (state.winner) return state.winner

  for (const pi of [0, 1] as const) {
    const player = state.players[pi]
    // Lose if life cards reach 0
    if (player.lifeCards.length === 0) {
      return state.players[pi === 0 ? 1 : 0].id
    }
    // Lose if no active avatar, no reserve avatars, and no Level 1 avatar in hand to deploy
    if (!player.activeAvatar && player.reserveAvatars.length === 0) {
      const hasPlayableAvatar = player.hand.some(c => c.type === 'avatar' && Number((c as AvatarCard).level) === 1)
      if (!hasPlayableAvatar) {
        return state.players[pi === 0 ? 1 : 0].id
      }
    }
  }
  return null
}

// ─── Helper to build SkillCheckState from full GameState ─────────────────────

export function toSkillCheckState(state: GameState, playerIndex: 0 | 1): SkillCheckState {
  const pi = playerIndex
  const oi = (pi === 0 ? 1 : 0) as 0 | 1
  const toCheckPlayer = (p: Player): SkillCheckPlayerState => ({
    hand: p.hand,
    spektraPile: p.spektraPile,
    usedSpektraPile: p.usedSpektraPile,
    activeAvatar: p.activeAvatar,
    reserveAvatars: p.reserveAvatars,
    graveyard: p.graveyard,
    avatarToSpektraCount: p.avatarToSpektraCount,
  })
  return {
    player: toCheckPlayer(state.players[pi]),
    opponent: toCheckPlayer(state.players[oi]),
    gamePhase: state.phase,
    currentPlayer: pi === 0 ? 'player' : 'opponent',
  }
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function untapAvatars(player: Player): Player {
  return {
    ...player,
    activeAvatar: player.activeAvatar ? { ...player.activeAvatar, isTapped: false } : null,
    reserveAvatars: player.reserveAvatars.map(a => ({ ...a, isTapped: false })),
  }
}

function updatePlayer(state: GameState, index: 0 | 1, player: Player): GameState {
  const players: [Player, Player] = [state.players[0], state.players[1]]
  players[index] = player
  return { ...state, players }
}
