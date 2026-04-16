import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Deck {
  id: string
  name: string
  cardIds: string[]
  createdAt: number
}

interface DeckStore {
  decks: Deck[]
  activeDeckId: string | null
  addDeck: (deck: Deck) => void
  removeDeck: (id: string) => void
  setActiveDeck: (id: string | null) => void
  updateDeck: (id: string, updates: Partial<Deck>) => void
}

export const useDeckStore = create<DeckStore>()(
  persist(
    (set) => ({
      decks: [],
      activeDeckId: null,
      addDeck: (deck) => set((s) => ({ decks: [...s.decks, deck] })),
      removeDeck: (id) => set((s) => ({ decks: s.decks.filter((d) => d.id !== id) })),
      setActiveDeck: (id) => set({ activeDeckId: id }),
      updateDeck: (id, updates) =>
        set((s) => ({ decks: s.decks.map((d) => (d.id === id ? { ...d, ...updates } : d)) })),
    }),
    { name: "deck-store" }
  )
)
