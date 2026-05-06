"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
      className="fixed left-0 right-0 top-0 z-0 flex items-stretch justify-center bg-white"
      style={{ bottom: NAV_HEIGHT }}
    >
      <FirstTimeWelcomePopup
        isOpen={showWelcomePopup}
        onClose={() => setShowWelcomePopup(false)}
        onDismiss={handleWelcomeDismiss}
      />

      <div className="relative w-full max-w-[480px] h-full flex flex-col overflow-hidden bg-white">
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
            className="absolute top-[4%] left-0 w-[78%] h-[36%] object-fill transition-transform duration-700 ease-out z-0"
            style={{ transform: animStep >= 1 ? "translateX(0)" : "translateX(-110%)" }}
          />
          {/* Bottom diagonal band — extends across to back the SAPPHIRE label */}
          <img
            src="/ui/components/avatar-name/Vector1.png"
            alt=""
            className="absolute bottom-0 left-0 w-full h-[72%] object-fill transition-transform duration-700 ease-out z-0"
            style={{ transform: animStep >= 2 ? "translateX(0)" : "translateX(-110%)" }}
          />
          {/* SAPPHIRE name — flush-right, taller, vertically centered against the band */}
          <img
            src="/ui/components/avatar-name/SAPPHIRE.png"
            alt="SAPPHIRE"
            className="absolute right-1 bottom-[44%] h-[42%] w-auto object-contain transition-transform duration-700 ease-out z-[1] drop-shadow-[0_4px_12px_rgba(15,26,40,0.25)]"
            style={{ transform: animStep >= 3 ? "translateX(0)" : "translateX(200%)" }}
          />
          {/* Character — original size, lifted up so SAPPHIRE stays legible */}
          <img
            src="/ui/components/avatar-name/avatar.png"
            alt="Character"
            className="absolute bottom-[8%] left-1/2 h-[90%] w-auto object-contain transition-all duration-700 ease-out z-[2]"
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
          <div className="relative bg-[#0f1a28]/95 backdrop-blur-sm rounded-t-2xl px-5 pt-4 pb-6 border-t border-x border-orange-500/40 mx-0">
            {/* Decorative side ticks */}
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex flex-col gap-[3px]">
              <div className="w-[3px] h-[10px] bg-cyan-400/60 rounded-full" />
              <div className="w-[3px] h-[10px] bg-cyan-400/40 rounded-full" />
              <div className="w-[3px] h-[10px] bg-cyan-400/60 rounded-full" />
            </div>

            {/* Player info row */}
            <div className="flex items-center justify-between mb-3 ml-3">
              <div className="min-w-0">
                <span className="text-orange-400 text-sm font-bold">Hi! </span>
                <span className="text-white text-sm font-semibold truncate">{playerName}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-600 text-white">
                  LV {level}
                </span>
                {isReconnecting || connectionStatus === "connecting" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500 text-amber-950">
                    <Loader2 size={10} className="animate-spin" />
                    RECONNECTING
                  </span>
                ) : (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isConnected ? "bg-emerald-500 text-emerald-950" : "bg-red-500 text-white"
                    }`}
                  >
                    {isConnected ? "● CONNECTED" : "● DISCONNECTED"}
                  </span>
                )}
              </div>
            </div>

            {/* XP bar */}
            <div className="relative ml-3 w-[calc(100%-12px)] h-3 rounded-full bg-white/10 overflow-hidden ring-1 ring-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_12px_-2px_rgba(249,115,22,0.6)]"
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ delay: 0.7, duration: 0.9, ease: "easeOut" }}
              />
            </div>
            <p className="text-white/40 text-[10px] mt-1.5 ml-3 font-mono tracking-wider">
              {xpInLevel} / {xpToNext} XP
            </p>

            {/* Tutorial CTA */}
            <button
              onClick={() => {
                playButton()
                router.push("/tutorial")
              }}
              className="relative mt-4 ml-3 w-[calc(100%-12px)] h-12 rounded-xl font-black tracking-[0.18em] text-sm uppercase overflow-hidden bg-gradient-to-br from-orange-400 to-amber-600 text-slate-950 shadow-[0_0_24px_-4px_rgba(249,115,22,0.7)] border border-orange-300/50 transition-transform active:scale-[0.98]"
            >
              <motion.span
                className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                initial={{ x: "-50%" }}
                animate={{ x: "450%" }}
                transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
              />
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
