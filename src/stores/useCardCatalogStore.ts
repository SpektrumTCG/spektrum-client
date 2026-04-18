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
      const catalog = new Map<string, CardCatalogEntry>()
      if (Array.isArray(data)) {
        data.forEach((entry: CardCatalogEntry) => {
          catalog.set(entry.id, entry)
        })
      }
      set({ catalog, isLoaded: true })
    } catch {
      set({ isLoaded: true })
    }
  },
}))
