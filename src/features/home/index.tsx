"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { Loader2, Sparkles } from "lucide-react"
import { useWalletStore } from "@/stores/useWalletStore"
import { useAudio } from "@/stores/useAudioStore"
import { useDeckStore } from "@/stores/useDeckStore"
import { useGameMode } from "@/features/game/stores/useGameMode"
import { FirstTimeWelcomePopup } from "@/components/shared/FirstTimeWelcomePopup"
import { NAV_HEIGHT } from "@/lib/constants"

export function HomeFeature() {
  const router = useRouter()
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [welcomeCheckDone, setWelcomeCheckDone] = useState(false)
  const [animStep, setAnimStep] = useState(0)

  const { walletAddress, isConnected, isReconnecting, connectionStatus, playerProfile } = useWalletStore()
  const { playBackgroundMusic, playButton } = useAudio()
  const { ownedCards, decks } = useDeckStore()
  const gameModePlayerName = useGameMode((s) => s.playerName)
  const prefersReducedMotion = useReducedMotion()

  const playerName = useMemo(() => {
    const fromProfile = playerProfile?.displayName?.trim()
    const fromGameMode = gameModePlayerName?.trim()
    if (fromProfile) return fromProfile
    if (fromGameMode && fromGameMode !== "Player") return fromGameMode
    return "Player"
  }, [playerProfile, gameModePlayerName])

  const { level, xpInLevel, xpToNext } = useMemo(() => {
    const totalCards = ownedCards.length
    const uniqueCards = new Set(ownedCards.map((c) => c.name)).size
    const completedDecks = decks.filter((d: any) => d.cards.length >= 40).length
    const mintedNFTs = totalCards
    const baseExp = totalCards * 2 + uniqueCards * 5 + completedDecks * 20 + mintedNFTs * 10
    return {
      level: Math.floor(baseExp / 100) + 1,
      xpInLevel: baseExp % 100,
      xpToNext: 100,
    }
  }, [ownedCards, decks])

  useEffect(() => {
    playBackgroundMusic()
  }, [])

  // Staggered character animation: matches the loading screen choreography
  useEffect(() => {
    setAnimStep(0)
    const timers = [
      setTimeout(() => setAnimStep(1), 100),
      setTimeout(() => setAnimStep(2), 300),
      setTimeout(() => setAnimStep(3), 500),
      setTimeout(() => setAnimStep(4), 900),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    setWelcomeCheckDone(false)
    setShowWelcomePopup(false)
  }, [walletAddress])

  useEffect(() => {
    const check = async () => {
      if (!isConnected || !walletAddress || welcomeCheckDone) return
      try {
        const res = await fetch(`/api/player/welcome-status/${walletAddress}`, { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          if (!data.hasSeenWelcome) setShowWelcomePopup(true)
        }
      } catch {}
      finally {
        setWelcomeCheckDone(true)
      }
    }
    check()
  }, [isConnected, walletAddress, welcomeCheckDone])

  const handleWelcomeDismiss = async () => {
    if (!walletAddress) return
    try {
      await fetch("/api/player/welcome-seen", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ walletAddress }),
      })
    } catch {}
    setShowWelcomePopup(false)
  }

  const xpPct = Math.min((xpInLevel / xpToNext) * 100, 100)

  return (
    <div
      className="absolute inset-x-0 top-0 z-0 flex items-stretch justify-center bg-white"
      style={{ bottom: NAV_HEIGHT }}
    >
      <FirstTimeWelcomePopup
        isOpen={showWelcomePopup}
        onClose={() => setShowWelcomePopup(false)}
        onDismiss={handleWelcomeDismiss}
      />

      <div className="relative w-full h-full flex flex-col overflow-hidden">
        {/* Layout already renders the global header — leave space for it (~48px) */}
        <div className="shrink-0 h-12" aria-hidden />

        {/* Logo */}
        <motion.div
          className="shrink-0 px-8 mt-1 z-10"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <img src="/ui/logo.png" alt="Spektrum Trading Card Game" className="w-48 h-auto mx-auto" />
        </motion.div>

        {/* Character composition */}
        <div className="absolute inset-x-0 top-[18%] bottom-0 overflow-hidden pointer-events-none">
          {/* Top diagonal stripe — left-anchored accent */}
          <img
            src="/ui/components/avatar-name/Vector.png"
            alt=""
            className="absolute top-[4%] left-0 w-[78%] h-[36%] object-fill transition-transform duration-700 ease-out motion-reduce:transition-none z-0"
            style={{ transform: animStep >= 1 ? "translateX(0)" : "translateX(-110%)" }}
          />
          {/* Bottom diagonal band — extends across to back the SAPPHIRE label */}
          <img
            src="/ui/components/avatar-name/Vector1.png"
            alt=""
            className="absolute bottom-0 left-0 w-full h-[72%] object-fill transition-transform duration-700 ease-out motion-reduce:transition-none z-0"
            style={{ transform: animStep >= 2 ? "translateX(0)" : "translateX(-110%)" }}
          />
          {/* SAPPHIRE name — flush-right, taller, vertically centered against the band */}
          <img
            src="/ui/components/avatar-name/SAPPHIRE.png"
            alt="SAPPHIRE"
            className="absolute right-1 bottom-[44%] h-[42%] w-auto object-contain transition-transform duration-700 ease-out motion-reduce:transition-none z-[1] drop-shadow-[0_4px_12px_rgba(15,26,40,0.25)]"
            style={{ transform: animStep >= 3 ? "translateX(0)" : "translateX(200%)" }}
          />
          {/* Character — original size, lifted up so SAPPHIRE stays legible */}
          <img
            src="/ui/components/avatar-name/avatar.png"
            alt="Character"
            className="absolute bottom-[8%] left-1/2 h-[90%] w-auto object-contain transition-all duration-700 ease-out motion-reduce:transition-none z-[2]"
            style={{
              transform: animStep >= 4 ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(100%)",
              opacity: animStep >= 4 ? 1 : 0,
            }}
          />
        </div>

        {/* Spacer pushes the panel to the bottom */}
        <div className="flex-1" />

        {/* Bottom panel */}
        <motion.div
          className="relative z-10 shrink-0"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
        >
          <div className="relative bg-[#0f1a28]/95 backdrop-blur-sm rounded-t-2xl px-5 pt-4 pb-5 border-t border-x border-orange-500/40">
            {/* Identity — primary line, ambient status demoted to a quiet dot */}
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-base font-semibold text-white">
                <span className="text-orange-400">Hi, </span>
                {playerName}
              </p>
              {isReconnecting || connectionStatus === "connecting" ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                  <Loader2 size={10} className="animate-spin" />
                  Reconnecting
                </span>
              ) : (
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/60">
                  <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-400" : "bg-red-400"}`} />
                  {isConnected ? "Connected" : "Offline"}
                </span>
              )}
            </div>

            {/* Progress — LV and XP grouped tight, they describe the same thing */}
            <div className="mt-3 space-y-1.5">
              <div className="flex items-baseline justify-between text-[11px]">
                <span className="font-bold uppercase tracking-wider text-orange-400">Level {level}</span>
                <span className="font-mono tracking-wider text-white/60">
                  {xpInLevel} / {xpToNext} XP
                </span>
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_12px_-2px_rgba(249,115,22,0.6)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ delay: 0.7, duration: 0.9, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Primary action — generous separation from the progress group */}
            <button
              type="button"
              onClick={() => {
                playButton()
                router.push("/tutorial")
              }}
              className="relative mt-5 h-12 w-full overflow-hidden rounded-xl border border-orange-300/50 bg-gradient-to-br from-orange-400 to-amber-600 text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_24px_-4px_rgba(249,115,22,0.7)] transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1a28]"
            >
              {!prefersReducedMotion && (
                <motion.span
                  className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                  initial={{ x: "-50%" }}
                  animate={{ x: "450%" }}
                  transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
                />
              )}
              <span className="relative inline-flex items-center justify-center gap-2">
                <Sparkles size={16} strokeWidth={2.5} />
                Start Tutorial
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
