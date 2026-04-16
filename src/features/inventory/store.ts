import { create } from "zustand"
import type { InventoryFilter } from "./types"

interface InventoryFeatureStore {
  filter: InventoryFilter
  setFilter: (filter: Partial<InventoryFilter>) => void
}

export const useInventoryFeatureStore = create<InventoryFeatureStore>()((set) => ({
  filter: { element: null, rarity: null },
  setFilter: (updates) => set((s) => ({ filter: { ...s.filter, ...updates } })),
}))
