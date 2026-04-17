// src/hooks/useAudioContextSwitcher.ts
import { useEffect } from "react"
import { useAudio } from "@/stores/useAudioStore"

// Resumes AudioContext on first user interaction (required by browsers).
export function useAudioContextSwitcher() {
  const initializeAudio = useAudio((s) => s.initializeAudio)

  useEffect(() => {
    const resume = () => {
      initializeAudio()
    }
    window.addEventListener("pointerdown", resume, { once: true })
    return () => window.removeEventListener("pointerdown", resume)
  }, [initializeAudio])
}
