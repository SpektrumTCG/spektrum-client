import { create } from 'zustand';
import { ACHIEVEMENTS, type Achievement, type AchievementCategory } from '@/lib/achievements';
import { toast } from 'sonner';

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  unlockedAt?: string;
  isUnlocked: boolean;
}

interface AchievementsStore {
  achievements: Map<string, AchievementProgress>;
  initialized: boolean;

  // Initialization
  initialize: () => void;

  // Progress tracking
  incrementProgress: (achievementId: string, amount?: number) => void;
  setProgress: (achievementId: string, progress: number) => void;
  getProgress: (achievementId: string) => AchievementProgress | undefined;

  // Unlock achievements
  unlockAchievement: (achievementId: string) => void;
  checkAndUnlock: (achievementId: string) => void;

  // Queries
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  getAchievementsByCategory: (category: AchievementCategory) => Achievement[];
  getTotalProgress: () => { unlocked: number; total: number; percentage: number };

  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  resetAll: () => void;

  // Server sync
  syncWithServer: (walletAddress: string) => Promise<void>;
  saveProgressToServer: (walletAddress: string, achievementId: string, progress: number) => Promise<void>;
}

const STORAGE_KEY = 'book_of_spektrum_achievements';

export const useAchievementsStore = create<AchievementsStore>()((set, get) => ({
  achievements: new Map(),
  initialized: false,

  initialize: () => {
    const state = get();
    if (state.initialized) return;

    // Load from localStorage first
    state.loadFromLocalStorage();

    // Ensure all achievements have entries
    const newMap = new Map(get().achievements);
    ACHIEVEMENTS.forEach(achievement => {
      if (!newMap.has(achievement.id)) {
        newMap.set(achievement.id, {
          achievementId: achievement.id,
          progress: 0,
          isUnlocked: false
        });
      }
    });

    set({ achievements: newMap, initialized: true });
  },

  incrementProgress: (achievementId: string, amount = 1) => {
    const state = get();
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    const current = state.achievements.get(achievementId);
    if (!current) return;

    if (current.isUnlocked) return; // Already unlocked

    const newProgress = Math.min(current.progress + amount, achievement.maxProgress);
    const newMap = new Map(state.achievements);
    newMap.set(achievementId, {
      ...current,
      progress: newProgress
    });

    set({ achievements: newMap });
    get().saveToLocalStorage();

    // Check if achievement should be unlocked
    if (newProgress >= achievement.maxProgress) {
      get().unlockAchievement(achievementId);
    }
  },

  setProgress: (achievementId: string, progress: number) => {
    const state = get();
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    const current = state.achievements.get(achievementId);
    if (!current || current.isUnlocked) return;

    const newProgress = Math.min(progress, achievement.maxProgress);
    const newMap = new Map(state.achievements);
    newMap.set(achievementId, {
      ...current,
      progress: newProgress
    });

    set({ achievements: newMap });
    get().saveToLocalStorage();

    if (newProgress >= achievement.maxProgress) {
      get().unlockAchievement(achievementId);
    }
  },

  getProgress: (achievementId: string) => {
    return get().achievements.get(achievementId);
  },

  unlockAchievement: (achievementId: string) => {
    const state = get();
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    const current = state.achievements.get(achievementId);
    if (!current || current.isUnlocked) return;

    const newMap = new Map(state.achievements);
    newMap.set(achievementId, {
      ...current,
      progress: achievement.maxProgress,
      isUnlocked: true,
      unlockedAt: new Date().toISOString()
    });

    set({ achievements: newMap });
    get().saveToLocalStorage();

    // Show toast notification
    let message = `Achievement Unlocked: ${achievement.name}`;
    if (achievement.reward) {
      if (achievement.reward.type === 'coins' && achievement.reward.amount) {
        message += ` (+${achievement.reward.amount} coins)`;
      } else if (achievement.reward.type === 'booster' && achievement.reward.amount) {
        message += ` (+${achievement.reward.amount} booster pack${achievement.reward.amount > 1 ? 's' : ''})`;
      }
    }

    toast.success(message, {
      description: achievement.description,
      duration: 5000
    });
  },

  checkAndUnlock: (achievementId: string) => {
    const state = get();
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    const progress = state.getProgress(achievementId);
    if (!progress || progress.isUnlocked) return;

    if (progress.progress >= achievement.maxProgress) {
      state.unlockAchievement(achievementId);
    }
  },

  getUnlockedAchievements: () => {
    const state = get();
    return ACHIEVEMENTS.filter(achievement => {
      const progress = state.achievements.get(achievement.id);
      return progress?.isUnlocked ?? false;
    });
  },

  getLockedAchievements: () => {
    const state = get();
    return ACHIEVEMENTS.filter(achievement => {
      const progress = state.achievements.get(achievement.id);
      return !progress?.isUnlocked;
    });
  },

  getAchievementsByCategory: (category: AchievementCategory) => {
    return ACHIEVEMENTS.filter(a => a.category === category);
  },

  getTotalProgress: () => {
    const state = get();
    const unlocked = state.getUnlockedAchievements().length;
    const total = ACHIEVEMENTS.filter(a => !a.hidden).length;
    return {
      unlocked,
      total,
      percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0
    };
  },

  saveToLocalStorage: () => {
    try {
      const state = get();
      const data = Array.from(state.achievements.entries());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage may be unavailable (SSR, private browsing)
    }
  },

  loadFromLocalStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as [string, AchievementProgress][];
        set({ achievements: new Map(data) });
      }
    } catch {
      // localStorage may be unavailable (SSR, private browsing)
    }
  },

  resetAll: () => {
    const newMap = new Map<string, AchievementProgress>();
    ACHIEVEMENTS.forEach(achievement => {
      newMap.set(achievement.id, {
        achievementId: achievement.id,
        progress: 0,
        isUnlocked: false
      });
    });

    set({ achievements: newMap });
    get().saveToLocalStorage();
    toast.info('All achievements have been reset');
  },

  syncWithServer: async (walletAddress: string) => {
    try {
      const response = await fetch(`/api/achievements/${walletAddress}`);
      if (response.ok) {
        const data = await response.json();

        if (data.achievements && Array.isArray(data.achievements) && data.achievements.length > 0) {
          const newMap = new Map(get().achievements);
          data.achievements.forEach((ach: any) => {
            newMap.set(ach.achievementId, {
              achievementId: ach.achievementId,
              progress: ach.progress,
              isUnlocked: ach.isUnlocked,
              unlockedAt: ach.unlockedAt
            });
          });
          set({ achievements: newMap });
          get().saveToLocalStorage();
        } else {
          localStorage.removeItem(STORAGE_KEY);
          const freshMap = new Map<string, AchievementProgress>();
          ACHIEVEMENTS.forEach(achievement => {
            freshMap.set(achievement.id, {
              achievementId: achievement.id,
              progress: 0,
              isUnlocked: false
            });
          });
          set({ achievements: freshMap });
        }
      }
    } catch {
      // Sync failure is non-fatal
    }
  },

  saveProgressToServer: async (walletAddress: string, achievementId: string, progress: number) => {
    if (!walletAddress) return;

    try {
      const response = await fetch(`/api/achievements/${walletAddress}/${achievementId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress })
      });
      if (response.ok) {
        const data = await response.json();
        const state = get();
        const newMap = new Map(state.achievements);
        newMap.set(achievementId, {
          achievementId,
          progress: data.achievement?.progress || progress,
          isUnlocked: data.achievement?.isUnlocked || (progress === 100),
          unlockedAt: data.achievement?.unlockedAt || undefined
        });
        set({ achievements: newMap });
        state.saveToLocalStorage();
      }
    } catch {
      // Server save failure is non-fatal
    }
  }
}));
