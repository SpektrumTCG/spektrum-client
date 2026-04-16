import { create } from "zustand"

interface Achievement {
  id: string
  title: string
  description: string
  unlockedAt: number | null
}

interface AchievementsStore {
  achievements: Achievement[]
  setAchievements: (achievements: Achievement[]) => void
  unlock: (id: string) => void
}

export const useAchievementsStore = create<AchievementsStore>()((set) => ({
  achievements: [],
  setAchievements: (achievements) => set({ achievements }),
  unlock: (id) =>
    set((s) => ({
      achievements: s.achievements.map((a) =>
        a.id === id ? { ...a, unlockedAt: Date.now() } : a
      ),
    })),
}))
