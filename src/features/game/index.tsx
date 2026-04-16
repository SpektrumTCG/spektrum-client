'use client'

export function GameFeature() {
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <p className="text-sm text-muted-foreground">Game board loads here</p>
    </div>
  )
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
