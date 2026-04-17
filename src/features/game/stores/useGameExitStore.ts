import { create } from 'zustand'

interface GameExitState {
  showExitDialog: boolean
  setShowExitDialog: (show: boolean) => void
  triggerExit: () => void
}

export const useGameExitStore = create<GameExitState>()((set) => ({
  showExitDialog: false,
  setShowExitDialog: (show) => set({ showExitDialog: show }),
  triggerExit: () => set({ showExitDialog: true }),
}))
