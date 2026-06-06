"use client"

import { useEffect, useRef } from "react"
import { useAuthSession } from "@/lib/auth"
import { apiFetch } from "@/lib/api"
import { useAudio } from "@/stores/useAudioStore"
import { useWalletStore } from "@/stores/useWalletStore"

export function AppBootstrap() {
  const { initializeAudio, setAudioContext } = useAudio()
  const { isLoaded, isSignedIn, walletAddress } = useAuthSession()
  const hydratedAddressRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      if (hydratedAddressRef.current) {
        hydratedAddressRef.current = null
        useWalletStore.getState().clearOnSignOut()
      } else {
        useWalletStore.setState({ isReconnecting: false })
      }
      return
    }

    if (walletAddress && hydratedAddressRef.current !== walletAddress) {
      hydratedAddressRef.current = walletAddress
      useWalletStore.getState().hydrateFromAuth({ walletAddress, walletType: 'privy' })
    } else if (!walletAddress) {
      useWalletStore.setState({ isReconnecting: false })
    }
  }, [isLoaded, isSignedIn, walletAddress])

  useEffect(() => {
    if (!isSignedIn || !walletAddress) return

    let sessionActive = true

    const startSession = async () => {
      try {
        await apiFetch("/api/player/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      } catch {}
    }

    const endSession = async () => {
      if (!sessionActive) return
      sessionActive = false
      try {
        await apiFetch("/api/player/session/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      } catch {}
    }

    startSession()

    const handleVisibility = () => {
      if (document.hidden) endSession()
      else { sessionActive = true; startSession() }
    }

    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("beforeunload", endSession)

    return () => {
      endSession()
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("beforeunload", endSession)
    }
  }, [isSignedIn, walletAddress])

  useEffect(() => {
    const handleInteraction = () => {
      try {
        initializeAudio()
        setAudioContext("menu")
      } catch {}
      document.removeEventListener("click", handleInteraction)
      document.removeEventListener("keydown", handleInteraction)
    }

    document.addEventListener("click", handleInteraction)
    document.addEventListener("keydown", handleInteraction)

    return () => {
      document.removeEventListener("click", handleInteraction)
      document.removeEventListener("keydown", handleInteraction)
    }
  }, [initializeAudio, setAudioContext])

  return null
}
