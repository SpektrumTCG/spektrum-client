import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIScaleState {
  scale: number;
  setScale: (scale: number) => void;
}

const getDefaultScale = (): number => {
  if (typeof window === 'undefined') return 100;

  const width = window.innerWidth;

  // Auto-detect based on screen size
  if (width < 640) {
    // Mobile
    return 60;
  } else if (width < 1024) {
    // Tablet
    return 90;
  } else if (width < 1920) {
    // Desktop
    return 100;
  } else {
    // Large screens
    return 110;
  }
};

export const useUIScale = create<UIScaleState>()(
  persist(
    (set) => ({
      scale: getDefaultScale(),
      setScale: (scale: number) => {
        set({ scale });
        // Apply scale to document root
        document.documentElement.style.fontSize = `${(scale / 100) * 16}px`;
      },
    }),
    {
      name: 'ui-scale-storage',
      onRehydrateStorage: () => (state) => {
        // Apply persisted scale on load, or detect default if first time
        const scaleToApply = state?.scale ?? getDefaultScale();
        document.documentElement.style.fontSize = `${(scaleToApply / 100) * 16}px`;
      },
    }
  )
);

export { useUIScale as useUIStore };
