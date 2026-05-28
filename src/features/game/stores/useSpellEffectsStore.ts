import { create } from 'zustand'
import type { ElementType } from '@spektrum/shared'

export type EffectType = 'damage' | 'heal' | 'buff' | 'debuff' | 'draw' | 'discard' | 'shield' | 'stun'

export interface ActiveSpellEffect {
  id: string
  type: EffectType
  element?: ElementType
  position: { x: number; y: number }
  value?: number
  timestamp: number
}

interface SpellEffectsStore {
  activeEffects: ActiveSpellEffect[]

  addEffect: (effect: Omit<ActiveSpellEffect, 'id' | 'timestamp'>) => void
  removeEffect: (id: string) => void
  clearAll: () => void
}

export const useSpellEffectsStore = create<SpellEffectsStore>()((set) => ({
  activeEffects: [],

  addEffect: (effect) => {
    const newEffect: ActiveSpellEffect = {
      ...effect,
      id: `effect-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    }

    set((state) => ({
      activeEffects: [...state.activeEffects, newEffect],
    }))
  },

  removeEffect: (id) => {
    set((state) => ({
      activeEffects: state.activeEffects.filter((e) => e.id !== id),
    }))
  },

  clearAll: () => {
    set({ activeEffects: [] })
  },
}))
