'use client'

import { GameBoard2D } from './components/GameBoard2D'

export function GameFeature() {
  return <GameBoard2D />
}

export { useGameStore } from './store'
export { useGame } from './hooks/useGame'
export {
  useGameState,
  useCurrentPlayer,
  useOpponent,
  useGamePhase,
  useIsAIThinking,
} from './hooks/useGameState'
export type { GameState, Player, Card, AvatarCard, AIDifficulty } from './types'
