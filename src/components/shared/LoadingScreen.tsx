"use client"

import { useEffect, useState } from "react"

interface LoadingScreenProps {
  message?: string
  playerName?: string
  level?: number
  isConnected?: boolean
  onComplete?: () => void
}

export function LoadingScreen({
  message = "Loading...",
  playerName = "Player Name",
  level = 1,
  isConnected = false,
  onComplete,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [animStep, setAnimStep] = useState(0)

  const [animKey, setAnimKey] = useState(0)

  // Staggered animation steps: 0=hidden, 1=Vector, 2=Vector1, 3=SAPPHIRE, 4=avatar
  useEffect(() => {
    setAnimStep(0)
    const timers = [
      setTimeout(() => setAnimStep(1), 100),   // Vector slides in
      setTimeout(() => setAnimStep(2), 300),   // Vector1 slides in
      setTimeout(() => setAnimStep(3), 500),   // SAPPHIRE slides in
      setTimeout(() => setAnimStep(4), 900),   // Avatar slides in after base layers settle
    ]
    return () => timers.forEach(clearTimeout)
  }, [animKey])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 20 + 10
      })
    }, 150)
    return () => clearInterval(interval)
  }, [])

  // Trigger onComplete when progress reaches 100
  useEffect(() => {
    if (progress >= 100 && onComplete) {
      const timer = setTimeout(onComplete, 400)
      return () => clearTimeout(timer)
    }
  }, [progress, onComplete])


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1a28]">
      {/* Mobile container */}
      <div className="relative w-full max-w-[480px] h-full flex flex-col overflow-hidden bg-white">
        {/* Header bar */}
        <div className="w-full shrink-0">
          <img
            src="/ui/v2-ui/bg-header.png"
            alt=""
            className="w-full h-auto block"
          />
        </div>

        {/* Logo */}
        <div className="shrink-0 px-8 mt-3">
          <img
            src="/ui/logo.png"
            alt="Spektrum Trading Card Game"
            className="w-48 h-auto mx-auto"
          />
        </div>

        {/* Character area - animated layers, anchored to bottom panel */}
        <div className="absolute inset-x-0 top-[15%] bottom-[5%] overflow-hidden pointer-events-none">
          {/* Base layer 1: Vector.png - top diagonal stripe, slides from left */}
          <img
            src="/ui/components/avatar-name/Vector.png"
            alt=""
            className="absolute top-[2%] left-0 w-[80%] h-[40%] object-fill transition-transform duration-700 ease-out"
            style={{
              transform: animStep >= 1 ? "translateX(0)" : "translateX(-110%)",
            }}
          />
          {/* Base layer 2: Vector1.png - bottom trapezoid, anchored to bottom, slides from left */}
          <img
            src="/ui/components/avatar-name/Vector1.png"
            alt=""
            className="absolute bottom-0 left-0 w-[85%] h-[65%] object-fill transition-transform duration-700 ease-out"
            style={{
              transform: animStep >= 2 ? "translateX(0)" : "translateX(-110%)",
            }}
          />
          {/* Base layer 3: SAPPHIRE text, slides from right */}
          <img
            src="/ui/components/avatar-name/SAPPHIRE.png"
            alt="SAPPHIRE"
            className="absolute right-1 bottom-[5%] h-[55%] w-auto object-contain transition-transform duration-700 ease-out"
            style={{
              transform: animStep >= 3 ? "translateX(0)" : "translateX(200%)",
            }}
          />
          {/* Layer 4: Avatar character, slides up from bottom AFTER base layers */}
          <img
            src="/ui/components/avatar-name/avatar.png"
            alt="Character"
            className="absolute bottom-0 left-1/2 h-[90%] w-auto object-contain transition-all duration-800 ease-out"
            style={{
              transform: animStep >= 4 ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(100%)",
              opacity: animStep >= 4 ? 1 : 0,
            }}
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom panel - flush to bottom */}
        <div className="relative z-10 shrink-0">
          <div className="relative bg-[#0f1a28]/95 backdrop-blur-sm rounded-t-2xl px-5 pt-4 pb-6 border-t border-x border-white/10 mx-0">
            {/* Decorative lines on left side */}
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex flex-col gap-[3px]">
              <div className="w-[3px] h-[10px] bg-cyan-400/60 rounded-full" />
              <div className="w-[3px] h-[10px] bg-cyan-400/40 rounded-full" />
              <div className="w-[3px] h-[10px] bg-cyan-400/60 rounded-full" />
            </div>

            {/* Player info row */}
            <div className="flex items-center justify-between mb-3 ml-3">
              <div>
                <span className="text-white/50 text-sm">Hi! </span>
                <span className="text-white text-sm font-semibold">{playerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isConnected
                      ? "bg-orange-500 text-gray-900"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {isConnected ? "● CONNECTED" : "● DISCONNECTED"}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-600 text-white">
                  LV {level}
                </span>
              </div>
            </div>

            {/* Loading bar */}
            <div className="ml-3 w-[calc(100%-12px)] h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  background: "linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #6366f1)",
                }}
              />
            </div>

            {/* Loading message */}
            <p className="text-white/30 text-xs mt-1.5 text-center ml-3">{message}</p>

            {/* DEBUG: Replay animation button - remove after done */}
            <button
              onClick={() => setAnimKey(k => k + 1)}
              className="absolute top-2 right-2 text-[10px] text-white/40 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
            >
              ↻ Replay
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
