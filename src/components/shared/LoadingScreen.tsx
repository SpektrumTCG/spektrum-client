"use client"

import { useEffect, useState } from "react"

interface LoadingScreenProps {
  message?: string
  playerName?: string
}

export function LoadingScreen({ message = "Loading...", playerName = "Player Name" }: LoadingScreenProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      {/* Mobile container */}
      <div className="relative w-full max-w-[480px] h-full flex flex-col overflow-hidden">
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

        {/* Character section - fills remaining space */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <img
            src="/ui/v2-ui/bg-character.png"
            alt="Character"
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Progress bar */}
        <div className="shrink-0 px-6 pb-8 pt-4">
          <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: "linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #6366f1)",
              }}
            />
          </div>
          <p className="text-[#1a2a3a]/40 text-xs mt-2 text-center">{message}</p>
        </div>
      </div>
    </div>
  )
}
