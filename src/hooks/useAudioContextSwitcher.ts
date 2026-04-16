// src/hooks/useAudioContextSwitcher.ts
import { useEffect } from "react"
import { useAudioStore } from "@/stores/useAudioStore"

// Resumes AudioContext on first user interaction (required by browsers).
export function useAudioContextSwitcher() {
  const isMuted = useAudioStore((s) => s.isMuted)

  useEffect(() => {
    if (isMuted) return
    const resume = () => {
      // Resume any suspended AudioContext instances here
      // Wire up to your audio engine in later tasks
    }
    window.addEventListener("pointerdown", resume, { once: true })
    return () => window.removeEventListener("pointerdown", resume)
  }, [isMuted])
}
