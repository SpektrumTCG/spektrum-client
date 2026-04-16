import { create } from "zustand"
import type { AnteStatus, AnteMatch } from "./types"

interface AnteFeatureStore {
  status: AnteStatus
  match: AnteMatch | null
  setStatus: (status: AnteStatus) => void
  setMatch: (match: AnteMatch | null) => void
  reset: () => void
}

export const useAnteFeatureStore = create<AnteFeatureStore>()((set) => ({
  status: "idle",
  match: null,
  setStatus: (status) => set({ status }),
  setMatch: (match) => set({ match }),
  reset: () => set({ status: "idle", match: null }),
}))
