import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UIStore {
  scale: number
  setScale: (scale: number) => void
  activeModal: string | null
  openModal: (id: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      scale: 100,
      setScale: (scale) => set({ scale }),
      activeModal: null,
      openModal: (id) => set({ activeModal: id }),
      closeModal: () => set({ activeModal: null }),
    }),
    { name: "ui-store" }
  )
)
