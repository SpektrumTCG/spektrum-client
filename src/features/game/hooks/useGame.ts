'use client'

import { useGameStore } from '../store'

export function useGame() {
  return {
    startGame: useGameStore(s => s.startGame),
    playCard: useGameStore(s => s.playCard),
    addToSpektra: useGameStore(s => s.addToSpektra),
    useSkill: useGameStore(s => s.useSkill),
    endPhase: useGameStore(s => s.endPhase),
    resetGame: useGameStore(s => s.resetGame),
    setAIDifficulty: useGameStore(s => s.setAIDifficulty),
  }
}
