import { create } from "zustand"
import type { DeckCard } from "./types"

interface DeckBuilderStore {
  workingDeck: DeckCard[]
  addCard: (card: DeckCard) => void
  removeCard: (id: string) => void
  clear: () => void
}

export const useDeckBuilderStore = create<DeckBuilderStore>()((set) => ({
  workingDeck: [],
  addCard: (card) =>
    set((s) => {
      const existing = s.workingDeck.find((c) => c.id === card.id)
      if (existing) {
        return { workingDeck: s.workingDeck.map((c) => c.id === card.id ? { ...c, count: c.count + 1 } : c) }
      }
      return { workingDeck: [...s.workingDeck, { ...card, count: 1 }] }
    }),
  removeCard: (id) => set((s) => ({ workingDeck: s.workingDeck.filter((c) => c.id !== id) })),
  clear: () => set({ workingDeck: [] }),
}))
