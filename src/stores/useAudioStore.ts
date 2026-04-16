import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AudioStore {
  isMuted: boolean
  volume: number
  toggleMute: () => void
  setVolume: (volume: number) => void
}

export const useAudioStore = create<AudioStore>()(
  persist(
    (set) => ({
      isMuted: false,
      volume: 0.7,
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
      setVolume: (volume) => set({ volume }),
    }),
    { name: "audio-store" }
  )
)
