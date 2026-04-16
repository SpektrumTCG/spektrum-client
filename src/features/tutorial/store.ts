import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { TutorialStep } from "./types"

interface TutorialFeatureStore {
  steps: TutorialStep[]
  currentStepIndex: number
  isComplete: boolean
  setSteps: (steps: TutorialStep[]) => void
  advance: () => void
  reset: () => void
}

export const useTutorialFeatureStore = create<TutorialFeatureStore>()(
  persist(
    (set) => ({
      steps: [],
      currentStepIndex: 0,
      isComplete: false,
      setSteps: (steps) => set({ steps }),
      advance: () =>
        set((s) => {
          const next = s.currentStepIndex + 1
          return { currentStepIndex: next, isComplete: next >= s.steps.length }
        }),
      reset: () => set({ currentStepIndex: 0, isComplete: false }),
    }),
    { name: "tutorial-store" }
  )
)
