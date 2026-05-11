import { create } from 'zustand'

interface CardCatalogEntry {
  id: string
  imagePath?: string
  skills?: any[]
  passiveSkill?: any
}

interface CardCatalogStore {
  catalog: Map<string, CardCatalogEntry>
  isLoaded: boolean
  loadCatalog: () => Promise<void>
}

export const useCardCatalogStore = create<CardCatalogStore>()((set) => ({
  catalog: new Map(),
  isLoaded: false,
  loadCatalog: async () => {
    try {
      const res = await fetch('/api/card-catalog', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      const entries: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.cards)
          ? data.cards
          : []
      const catalog = new Map<string, CardCatalogEntry>()
      entries.forEach((entry: any) => {
        const id = entry?.cardId || entry?.id
        if (!id) return
        catalog.set(id, { ...entry, id })
        if (entry?.cardNumber) catalog.set(entry.cardNumber, { ...entry, id })
      })
      set({ catalog, isLoaded: true })
    } catch {
      set({ isLoaded: true })
    }
  },
}))
