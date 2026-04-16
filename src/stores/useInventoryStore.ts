import { create } from "zustand"

interface Card {
  id: string
  name: string
  element: string
  rarity: string
  imageUrl: string
}

interface InventoryStore {
  cards: Card[]
  isLoading: boolean
  setCards: (cards: Card[]) => void
  setLoading: (loading: boolean) => void
}

export const useInventoryStore = create<InventoryStore>()((set) => ({
  cards: [],
  isLoading: false,
  setCards: (cards) => set({ cards }),
  setLoading: (isLoading) => set({ isLoading }),
}))
