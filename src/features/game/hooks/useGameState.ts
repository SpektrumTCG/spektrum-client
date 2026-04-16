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
  // Human player is always index 0; opponent is always index 1
  return useGameStore(s => s.game?.players[1] ?? null)
}

export function useGamePhase() {
  return useGameStore(s => s.game?.phase ?? null)
}

export function useIsAIThinking() {
  return useGameStore(s => s.isAIThinking)
}
