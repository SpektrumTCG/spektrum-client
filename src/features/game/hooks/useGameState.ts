'use client'

import { useGameStore } from '../store'

export function useGameState() {
  return useGameStore(s => s.game)
}

export function useCurrentPlayer() {
  return useGameStore(s => {
    if (!s.game) return null
    return s.game.players[s.game.currentPlayerIndex]
  })
}

export function useOpponent() {
  return useGameStore(s => {
    if (!s.game) return null
    const opponentIndex = s.game.currentPlayerIndex === 0 ? 1 : 0
    return s.game.players[opponentIndex]
  })
}

export function useGamePhase() {
  return useGameStore(s => s.game?.phase ?? null)
}

export function useIsAIThinking() {
  return useGameStore(s => s.isAIThinking)
}
