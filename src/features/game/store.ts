import { create } from "zustand"
import type { GameState } from "./types"

interface GameFeatureStore extends GameState {
  startGame: () => void
  endGame: () => void
}

export const useGameFeatureStore = create<GameFeatureStore>()((set) => ({
  isActive: false,
  turn: 0,
  phase: "draw",
  startGame: () => set({ isActive: true, turn: 1, phase: "draw" }),
  endGame: () => set({ isActive: false, turn: 0 }),
}))
