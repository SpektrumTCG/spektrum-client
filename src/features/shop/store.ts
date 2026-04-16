import { create } from "zustand"
import type { Pack } from "./types"

interface ShopFeatureStore {
  packs: Pack[]
  selectedPack: Pack | null
  setPacks: (packs: Pack[]) => void
  selectPack: (pack: Pack | null) => void
}

export const useShopFeatureStore = create<ShopFeatureStore>()((set) => ({
  packs: [],
  selectedPack: null,
  setPacks: (packs) => set({ packs }),
  selectPack: (selectedPack) => set({ selectedPack }),
}))
