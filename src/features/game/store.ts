'use client'

import { create } from 'zustand'
import {
  startGame,
  addToSpektra,
  playAvatar,
  endPhase,
  checkWinner,
} from '@/domain/game/engine/gameEngine'
import { AIFactory } from '@/domain/game/ai'
import { cardRegistry } from '@/domain/game/data/cardRegistry'
import type { GameState } from '@/domain/game/types/game'
import type { Card, AvatarCard } from '@/domain/game/types/card'
import type { AIDifficulty, AIDecision } from '@/domain/game/types/ai'

interface GameStore {
  game: GameState | null
  aiDifficulty: AIDifficulty
  isAIThinking: boolean
  startGame: (playerDeck: Card[], difficulty?: AIDifficulty) => void
  playCard: (cardId: string, slot?: 'active' | number) => void
  addToSpektra: (cardId: string) => void
  useSkill: (avatarId: string, skillIndex: 0 | 1) => void
  endPhase: () => void
  resetGame: () => void
  setAIDifficulty: (difficulty: AIDifficulty) => void
  _maybeRunAI: (game: GameState) => void
  _applyAIDecision: (decision: AIDecision) => void
}

export const useGameStore = create<GameStore>()((set, get) => ({
  game: null,
  aiDifficulty: 'regular',
  isAIThinking: false,

  startGame: (playerDeck, difficulty = get().aiDifficulty) => {
    const opponentDeck = cardRegistry.shuffleDeck(
      cardRegistry
        .getAllCards()
        .filter(c => c.type === 'avatar' || c.type === 'spell')
        .slice(0, 20)
    )
    const game = startGame(playerDeck, opponentDeck)
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
    }
    // Spell effects: to be wired to effectProcessor in a future task

    const winner = checkWinner(next)
    const committed = winner ? { ...next, winner } : next
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

  useSkill: (avatarId, skillIndex) => {
    const { game } = get()
    if (!game) return
    const playerIndex = game.currentPlayerIndex
    const player = game.players[playerIndex]
    if (!player.activeAvatar || player.activeAvatar.id !== avatarId) return

    // Mark avatar as tapped after skill use
    // Full skill effect resolution (damage, healing, etc.) to be wired to
    // effectProcessor and skillTriggerChecker in a future task.
    const tapped: AvatarCard = { ...player.activeAvatar, isTapped: true }
    const players: typeof game.players = [
      playerIndex === 0 ? { ...player, activeAvatar: tapped } : game.players[0],
      playerIndex === 1 ? { ...player, activeAvatar: tapped } : game.players[1],
    ]
    const next = { ...game, players }
    set({ game: next })
    get()._maybeRunAI(next)
  },

  endPhase: () => {
    const { game } = get()
    if (!game) return
    const next = endPhase(game)
    const winner = checkWinner(next)
    const committed = winner ? { ...next, winner } : next
    set({ game: committed })
    if (!winner) get()._maybeRunAI(committed)
  },

  resetGame: () => set({ game: null, isAIThinking: false }),

  setAIDifficulty: (difficulty) => set({ aiDifficulty: difficulty }),

  _maybeRunAI: (game) => {
    // AI is player index 1; only act on opponent's turn
    if (game.currentPlayerIndex !== 1) return
    const { aiDifficulty } = get()
    set({ isAIThinking: true })

    // Small delay for human-feeling response
    setTimeout(() => {
      const current = get().game
      if (!current || current.currentPlayerIndex !== 1) {
        set({ isAIThinking: false })
        return
      }
      const ai = AIFactory.create(aiDifficulty)
      const decision = ai.decide(current, 1)
      get()._applyAIDecision(decision)
      set({ isAIThinking: false })
    }, 800)
  },

  _applyAIDecision: (decision) => {
    const store = get()
    const { game } = store
    if (!game) return

    switch (decision.type) {
      case 'playAvatar':
        if (decision.cardId) store.playCard(decision.cardId, decision.slot ?? 'active')
        break
      case 'addToSpektra':
        if (decision.cardId) store.addToSpektra(decision.cardId)
        break
      case 'useSkill':
        if (game.players[1].activeAvatar) {
          store.useSkill(game.players[1].activeAvatar.id, decision.skillIndex ?? 0)
        }
        break
      case 'endPhase':
        store.endPhase()
        break
      default:
        // Unhandled AI action type — end phase to prevent game freeze
        store.endPhase()
        break
    }
  },
}))
