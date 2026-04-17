import { create } from 'zustand'
import type { Card } from '@/domain/game/types'

interface CardPlacementAnimation {
  id: string
  card: Card
  fromX: number
  fromY: number
  toX: number
  toY: number
}

interface CardActivationPauseData {
  id: string
  card: Card
  actionName: string
  isPlayerAction: boolean
  duration: number
  onComplete?: () => void
}

interface DrawAnimation {
  id: string
  fromX: number
  fromY: number
  toX: number
  toY: number
}

interface AnimationStore {
  activePlacements: CardPlacementAnimation[]
  activeDraws: DrawAnimation[]
  activationPause: CardActivationPauseData | null
  isAnimating: boolean

  triggerPlacement: (card: Card, fromX: number, fromY: number, toX: number, toY: number) => string
  removePlacement: (id: string) => void

  triggerDraw: (fromX: number, fromY: number, toX: number, toY: number) => string
  removeDraw: (id: string) => void

  triggerActivationPause: (
    card: Card,
    actionName: string,
    isPlayerAction: boolean,
    duration?: number,
    onComplete?: () => void
  ) => void
  clearActivationPause: () => void

  clearAllAnimations: () => void
}

export const useAnimationStore = create<AnimationStore>()((set, get) => ({
  activePlacements: [],
  activeDraws: [],
  activationPause: null,
  isAnimating: false,

  triggerPlacement: (card, fromX, fromY, toX, toY) => {
    const id = `placement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const animation: CardPlacementAnimation = { id, card, fromX, fromY, toX, toY }

    set((state) => ({
      activePlacements: [...state.activePlacements, animation],
      isAnimating: true,
    }))

    return id
  },

  removePlacement: (id) => {
    set((state) => {
      const newPlacements = state.activePlacements.filter((p) => p.id !== id)
      return {
        activePlacements: newPlacements,
        isAnimating:
          newPlacements.length > 0 ||
          state.activeDraws.length > 0 ||
          state.activationPause !== null,
      }
    })
  },

  triggerDraw: (fromX, fromY, toX, toY) => {
    const id = `draw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const animation: DrawAnimation = { id, fromX, fromY, toX, toY }

    set((state) => ({
      activeDraws: [...state.activeDraws, animation],
      isAnimating: true,
    }))

    return id
  },

  removeDraw: (id) => {
    set((state) => {
      const newDraws = state.activeDraws.filter((d) => d.id !== id)
      return {
        activeDraws: newDraws,
        isAnimating:
          newDraws.length > 0 ||
          state.activePlacements.length > 0 ||
          state.activationPause !== null,
      }
    })
  },

  triggerActivationPause: (card, actionName, isPlayerAction, duration = 3000, onComplete) => {
    const id = `pause-${Date.now()}`
    set({
      activationPause: { id, card, actionName, isPlayerAction, duration, onComplete },
      isAnimating: true,
    })
  },

  clearActivationPause: () => {
    const currentPause = get().activationPause
    if (currentPause?.onComplete) {
      currentPause.onComplete()
    }

    set((state) => ({
      activationPause: null,
      isAnimating: state.activePlacements.length > 0 || state.activeDraws.length > 0,
    }))
  },

  clearAllAnimations: () => {
    set({
      activePlacements: [],
      activeDraws: [],
      activationPause: null,
      isAnimating: false,
    })
  },
}))
