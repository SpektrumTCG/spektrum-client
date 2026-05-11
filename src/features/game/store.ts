'use client'

import { create } from 'zustand'
import {
  startGame,
  addToSpektra,
  playAvatar,
  playSpell,
  playItem,
  executeSkill,
  evolveAvatar,
  endPhase,
  nextTurn,
  checkWinner,
  checkDefeatedAvatars,
  hasEnoughSpektra,
} from '@/domain/game/engine/gameEngine'
import { AIFactory } from '@/domain/game/ai'
import { cardRegistry } from '@/domain/game/data/cardRegistry'
import type { GameState } from '@/domain/game/types/game'
import type { Card, AvatarCard, ElementType } from '@/domain/game/types/card'
import type { AIDifficulty, AIDecision } from '@/domain/game/types/ai'

const AI_ACTION_DELAY = 800
const AI_MAX_ACTIONS_PER_PHASE = 10

interface GameStore {
  game: GameState | null
  aiDifficulty: AIDifficulty
  isAIThinking: boolean
  _lastServerSeq: number
  startGame: (playerDeck: Card[], difficulty?: AIDifficulty) => void
  playCard: (cardId: string, slot?: 'active' | number) => void
  addToSpektra: (cardId: string) => void
  useSkill: (skillIndex: number, targetPlayerIndex?: 0 | 1) => void
  evolveAvatar: (handCardId: string, targetSlot: 'active' | number) => void
  endPhase: () => void
  endTurn: () => void
  resetGame: () => void
  setAIDifficulty: (difficulty: AIDifficulty) => void
  applyServerGameState: (serverView: any) => void
  _maybeRunAI: (game: GameState) => void
  _runAILoop: (actionCount: number) => void
  _applyAIDecision: (decision: AIDecision) => void
}

export const useGameStore = create<GameStore>()((set, get) => ({
  game: null,
  aiDifficulty: 'regular',
  isAIThinking: false,
  _lastServerSeq: 0,

  startGame: (playerDeck, difficulty = get().aiDifficulty) => {
    const allCards = cardRegistry.getAllCards()

    // Build a lookup map for enriching stale deck cards with current registry data
    const registryMap = new Map<string, Card>()
    for (const c of allCards) {
      registryMap.set(c.id, c)
    }

    // Enrich player deck cards: merge registry data (imagePath, art, skills) into
    // deck cards that may be stale from localStorage
    const enrichedPlayerDeck = playerDeck.map(card => {
      const baseId = (card as any).cardId || card.id.replace(/^(owned-|deck-[^-]+-)/,'').replace(/-\d+(-\d+)?$/, '')
      const registryCard = registryMap.get(card.id) || registryMap.get(baseId)
      if (registryCard) {
        // Strip undefined values from deck card so they don't overwrite registry data
        const defined = Object.fromEntries(Object.entries(card).filter(([, v]) => v !== undefined))
        return {
          ...registryCard,
          ...defined,
          imagePath: card.imagePath || registryCard.imagePath || (registryCard as any).art,
          art: card.art || (registryCard as any).art || registryCard.imagePath,
          skills: (card as any).skills?.length ? (card as any).skills : (registryCard as any).skills,
        }
      }
      return card
    })

    // Only use Level 1 avatars — Level 2 can't be placed directly and would
    // leave the AI stuck if drawn during setup.
    const avatars = allCards.filter(
      c => c.type === 'avatar' && Number((c as AvatarCard).level) === 1
    )
    const spells = allCards.filter(c => c.type === 'spell' || c.type === 'quickSpell')
    const opponentDeck = cardRegistry.shuffleDeck([
      ...avatars.slice(0, 12),
      ...spells.slice(0, 8),
    ])
    const game = startGame(enrichedPlayerDeck as Card[], opponentDeck)
    set({ game, aiDifficulty: difficulty })
  },

  playCard: (cardId, slot = 'active') => {
    const { game } = get()
    if (!game) return
    const playerIndex = game.currentPlayerIndex
    const card = game.players[playerIndex].hand.find(c => c.id === cardId)
    if (!card) return

    let next = game
    if (card.type === 'avatar') {
      next = playAvatar(game, playerIndex, cardId, slot)
    } else if (card.type === 'spell' || card.type === 'quickSpell') {
      next = playSpell(game, playerIndex, cardId)
    } else if (card.type === 'item') {
      next = playItem(game, playerIndex, cardId)
    }

    const winner = checkWinner(next)
    const committed = winner ? { ...next, winner, phase: 'game_over' as const } : next
    set({ game: committed })
    if (!winner) get()._maybeRunAI(committed)
  },

  addToSpektra: (cardId) => {
    const { game } = get()
    if (!game) return
    const next = addToSpektra(game, game.currentPlayerIndex, cardId)
    set({ game: next })
    get()._maybeRunAI(next)
  },

  useSkill: (skillIndex, targetPlayerIndex) => {
    const { game } = get()
    if (!game) return
    const playerIndex = game.currentPlayerIndex
    const next = executeSkill(game, playerIndex, skillIndex, targetPlayerIndex)
    const winner = checkWinner(next)
    const committed = winner ? { ...next, winner, phase: 'game_over' as const } : next
    set({ game: committed })
    if (!winner) get()._maybeRunAI(committed)
  },

  evolveAvatar: (handCardId, targetSlot) => {
    const { game } = get()
    if (!game) return
    const next = evolveAvatar(game, game.currentPlayerIndex, handCardId, targetSlot)
    set({ game: next })
    get()._maybeRunAI(next)
  },

  endPhase: () => {
    const { game } = get()
    if (!game) return
    const next = endPhase(game)
    const winner = checkWinner(next)
    const committed = winner ? { ...next, winner, phase: 'game_over' as const } : next
    set({ game: committed })
    if (!winner) get()._maybeRunAI(committed)
  },

  endTurn: () => {
    const { game } = get()
    if (!game || game.phase === 'setup') return
    const next = nextTurn(game)
    const winner = checkWinner(next)
    const committed = winner ? { ...next, winner, phase: 'game_over' as const } : next
    set({ game: committed })
    if (!winner) get()._maybeRunAI(committed)
  },

  resetGame: () => set({ game: null, isAIThinking: false, _lastServerSeq: 0 }),

  setAIDifficulty: (difficulty) => set({ aiDifficulty: difficulty }),

  applyServerGameState: (serverView: any) => {
    // The server now runs the same shared engine as AI mode and emits a real
    // client `GameState` with privacy already applied (opponent's hand /
    // deck / life cards arrive as face-down placeholders, self is always at
    // players[0] for rendering convenience). The mapper is therefore a
    // near-passthrough — its only jobs are stale-frame rejection and a
    // defensive shape backfill in case the payload is missing optional
    // top-level fields like effectStack.

    if (!serverView) return

    // Drop stale frames — server tags every broadcast with a monotonic
    // _seq. Out-of-order packets would rewind the UI; we only apply frames
    // newer than what we already rendered. The 0 fallback lets full
    // state-syncs (e.g. on reconnect) pass through.
    const seq = typeof serverView._seq === 'number' ? serverView._seq : 0
    const lastSeq = get()._lastServerSeq
    if (seq > 0 && seq <= lastSeq) return

    // Defensive shape: serverView is already a GameState; clone the slots
    // we use directly. Anything optional missing on the wire (effectStack,
    // turnTimer, lastAction) gets a sensible default.
    const players = Array.isArray(serverView.players) && serverView.players.length === 2
      ? (serverView.players as [any, any])
      : null
    if (!players) {
      // Payload doesn't conform — refuse to apply rather than corrupt state.
      return
    }

    const game: GameState = {
      currentTurn: serverView.currentTurn ?? 1,
      phase: serverView.phase ?? 'setup',
      players,
      currentPlayerIndex: (serverView.currentPlayerIndex ?? 0) as 0 | 1,
      winner: serverView.winner ?? null,
      turnTimer: serverView.turnTimer ?? 0,
      lastAction: serverView.lastAction ?? '',
      battleLog: Array.isArray(serverView.battleLog) ? serverView.battleLog : [],
      effectStack: Array.isArray(serverView.effectStack) ? serverView.effectStack : [],
    }

    set({ game, _lastServerSeq: seq })
  },

  _maybeRunAI: (game) => {
    // AI is player index 1; only act on opponent's turn
    if (game.currentPlayerIndex !== 1 || game.winner) return
    // Prevent duplicate AI loops — store actions (playCard, addToSpektra, etc.)
    // call _maybeRunAI internally, but if the AI loop is already running we must
    // not spawn a second one.
    if (get().isAIThinking) return
    set({ isAIThinking: true })

    setTimeout(() => {
      const current = get().game
      if (!current || current.currentPlayerIndex !== 1 || current.winner) {
        set({ isAIThinking: false })
        return
      }

      // Handle setup phase: AI places first avatar automatically
      if (current.phase === 'setup') {
        const aiPlayer = current.players[1]
        const avatar = aiPlayer.hand.find(c => c.type === 'avatar' && Number((c as AvatarCard).level) === 1)
        if (avatar) {
          get().playCard(avatar.id, 'active')
        }
        const afterPlay = get().game
        if (afterPlay) get().endPhase()
        set({ isAIThinking: false })
        return
      }

      // Start AI action loop
      get()._runAILoop(0)
    }, AI_ACTION_DELAY)
  },

  _runAILoop: (actionCount) => {
    const current = get().game
    if (!current || current.currentPlayerIndex !== 1 || current.winner) {
      set({ isAIThinking: false })
      return
    }

    // Guard against infinite loops — force advance and continue the AI loop
    if (actionCount >= AI_MAX_ACTIONS_PER_PHASE) {
      get().endPhase()
      setTimeout(() => get()._runAILoop(0), AI_ACTION_DELAY)
      return
    }

    // Auto-advance through non-interactive phases
    if (current.phase === 'refresh' || current.phase === 'draw') {
      get().endPhase()
      setTimeout(() => get()._runAILoop(actionCount + 1), 300)
      return
    }

    if (current.phase === 'recheck') {
      get().endPhase()
      setTimeout(() => get()._runAILoop(actionCount + 1), 300)
      return
    }

    if (current.phase === 'end') {
      get().endTurn()
      set({ isAIThinking: false })
      return
    }

    if (current.phase === 'game_over') {
      set({ isAIThinking: false })
      return
    }

    // AI makes a decision for main1, main2, or battle phases
    const { aiDifficulty } = get()
    const ai = AIFactory.create(aiDifficulty)
    const decision = ai.decide(current, 1)

    if (decision.type === 'endPhase') {
      get().endPhase()
      // After ending phase, continue the loop for next phase
      setTimeout(() => get()._runAILoop(0), AI_ACTION_DELAY)
      return
    }

    // Apply the decision and detect if state actually changed
    const before = get().game
    get()._applyAIDecision(decision)
    const after = get().game

    // If action had no effect (silently rejected), end phase to avoid infinite loop
    if (before === after) {
      get().endPhase()
      setTimeout(() => get()._runAILoop(0), AI_ACTION_DELAY)
      return
    }

    // Continue loop for more actions in same phase
    setTimeout(() => get()._runAILoop(actionCount + 1), AI_ACTION_DELAY)
  },

  _applyAIDecision: (decision) => {
    const store = get()
    const { game } = store
    if (!game) return

    switch (decision.type) {
      case 'playAvatar':
        if (decision.cardId) store.playCard(decision.cardId, decision.slot ?? 'active')
        break
      case 'playSpell':
        if (decision.cardId) store.playCard(decision.cardId)
        break
      case 'addToSpektra':
        if (decision.cardId) store.addToSpektra(decision.cardId)
        break
      case 'useSkill':
        store.useSkill(decision.skillIndex ?? 0)
        break
      case 'evolveAvatar':
        if (decision.cardId) store.evolveAvatar(decision.cardId, decision.slot ?? 'active')
        break
      case 'endPhase':
        store.endPhase()
        break
      default:
        store.endPhase()
        break
    }
  },
}))
