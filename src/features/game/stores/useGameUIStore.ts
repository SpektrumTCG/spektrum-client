import { create } from 'zustand'
import type { Card, AvatarCard } from '@/domain/game/types'

export interface EvolvableAvatarEntry {
  avatar: AvatarCard
  location: 'active' | number
}

interface GameUIState {
  isTargetingEvolution: boolean
  selectedHandIndex: number | null
  validEvolutionTargets: Array<'active' | number>
  evolutionCard: Card | null
  evolvableAvatars: EvolvableAvatarEntry[]

  startEvolutionTargeting: (
    handIndex: number,
    card: Card,
    evolvableAvatars: EvolvableAvatarEntry[]
  ) => void
  cancelTargeting: () => void
}

export const useGameUIStore = create<GameUIState>()((set) => ({
  isTargetingEvolution: false,
  selectedHandIndex: null,
  validEvolutionTargets: [],
  evolutionCard: null,
  evolvableAvatars: [],

  startEvolutionTargeting: (handIndex, card, evolvableAvatars) => {
    set({
      isTargetingEvolution: true,
      selectedHandIndex: handIndex,
      validEvolutionTargets: evolvableAvatars.map((e) => e.location),
      evolutionCard: card,
      evolvableAvatars,
    })
  },

  cancelTargeting: () => {
    set({
      isTargetingEvolution: false,
      selectedHandIndex: null,
      validEvolutionTargets: [],
      evolutionCard: null,
      evolvableAvatars: [],
    })
  },
}))
