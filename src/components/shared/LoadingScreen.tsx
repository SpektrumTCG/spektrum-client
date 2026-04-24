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

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 300)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 100 && onComplete) {
      const timeout = setTimeout(onComplete, 500)
      return () => clearTimeout(timeout)
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

        {/* Character - large, fills most of the screen */}
        <div className="absolute inset-0 top-[15%] flex items-start justify-center overflow-hidden pointer-events-none">
          <img
            src="/ui/v2-ui/bg-character.png"
            alt="Character"
            className="w-[110%] max-w-none h-auto object-contain"
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
          </div>
        </div>
      </div>
    </div>
  )
}
