"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAudio } from "@/stores/useAudioStore"
import { useWalletStore } from "@/stores/useWalletStore"
import { parsePhantomCallback } from "@/features/blockchain/solana/phantomDeeplink"
import { parseSolflareCallback } from "@/features/blockchain/solana/solflareDeeplink"
import { parseBackpackCallback } from "@/features/blockchain/solana/backpackDeeplink"
import { toast } from "sonner"

export function AppBootstrap() {
  const router = useRouter()
  const hasProcessedCallback = useRef(false)
  const hasAttemptedReconnect = useRef(false)
  const { initializeAudio, setAudioContext } = useAudio()
  const { connectWallet, attemptAutoReconnect, isConnected, walletAddress, isReconnecting } = useWalletStore()

  // Handle wallet deeplink callbacks (Phantom, Solflare, Backpack)
  useEffect(() => {
    if (hasProcessedCallback.current) return

    const handleWalletCallbacks = async () => {
      const phantomCb = parsePhantomCallback()
      if (phantomCb) {
        hasProcessedCallback.current = true
        const success = await connectWallet("phantom")
        if (success) toast.success("Phantom wallet connected!")
        else toast.error("Wallet connection failed")
        window.history.replaceState({}, document.title, window.location.pathname)
        if (success) router.replace("/home")
        return
      }

      const solflareCb = parseSolflareCallback()
      if (solflareCb) {
        hasProcessedCallback.current = true
        const success = await connectWallet("solflare")
        if (success) toast.success("Solflare wallet connected!")
        else toast.error("Wallet connection failed")
        window.history.replaceState({}, document.title, window.location.pathname)
        if (success) router.replace("/home")
        return
      }

      const backpackCb = parseBackpackCallback()
      if (backpackCb) {
        hasProcessedCallback.current = true
        const success = await connectWallet("backpack")
        if (success) toast.success("Backpack wallet connected!")
        else toast.error("Wallet connection failed")
        window.history.replaceState({}, document.title, window.location.pathname)
        if (success) router.replace("/home")
        return
      }
    }

    handleWalletCallbacks()
  }, [connectWallet, router])

  // Auto-reconnect wallet on app startup
  useEffect(() => {
    if (hasAttemptedReconnect.current) return
    hasAttemptedReconnect.current = true

    const attemptReconnect = async () => {
      if (useWalletStore.getState().isConnected) return

      const url = new URL(window.location.href)
      const hasCallback =
        url.searchParams.get("phantom_action") ||
        url.searchParams.get("solflare_action") ||
        url.searchParams.get("backpack_action")
      if (hasCallback) return

      await new Promise(r => setTimeout(r, 1500))
      await attemptAutoReconnect()
    }

    attemptReconnect()
  }, [attemptAutoReconnect])

  // Session tracking
  useEffect(() => {
    if (!isConnected || !walletAddress || isReconnecting) return

    let sessionActive = true

    const startSession = async () => {
      try {
        await fetch("/api/player/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress }),
        })
      } catch {}
    }

    const endSession = async () => {
      if (!sessionActive) return
      sessionActive = false
      try {
        await fetch("/api/player/session/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress }),
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
  }, [isConnected, walletAddress, isReconnecting])

  // Initialize audio on first user interaction
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
