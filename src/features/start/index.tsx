"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { SolanaWalletConnect } from "@/components/shared/SolanaWalletConnect"
import { LoadingScreen } from "@/components/shared/LoadingScreen"

export function StartFeature() {
  const router = useRouter()
  const { isSignedIn } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  const handleEnter = () => {
    setIsLoading(true)
  }

  if (isLoading) {
    return (
      <LoadingScreen
        message="Entering the world of Spektrum..."
        onComplete={() => router.push("/home")}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24 overflow-y-auto">
      <div className="max-w-md w-full mx-auto text-center flex flex-col items-center">
        <div className="mb-10">
          <img
            src="/ui/logo.png"
            alt="Spektrum Trading Card Game"
            className="w-full max-w-md mx-auto h-auto drop-shadow-lg"
            onError={e => { e.currentTarget.style.display = "none" }}
          />
        </div>

        <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-xs">
          Browse decks, packs, and the codex freely. Sign in when you’re ready to play or collect.
        </p>

        <button
          onClick={handleEnter}
          className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg tracking-wide transition-all border border-orange-400"
          style={{ boxShadow: "0 0 25px rgba(249, 115, 22, 0.5)" }}
        >
          {isSignedIn ? "ENTER THE ARENA" : "CONTINUE AS GUEST"}
        </button>

        {!isSignedIn && (
          <>
            <div className="flex items-center gap-3 w-full my-5 text-[10px] text-gray-500 tracking-[0.2em] uppercase">
              <div className="flex-1 h-px bg-gray-700/60" />
              <span>or</span>
              <div className="flex-1 h-px bg-gray-700/60" />
            </div>

            <div className="w-full">
              <SolanaWalletConnect onConnected={handleEnter} />
            </div>

            <p className="text-gray-500 text-xs mt-6">
              Connecting now saves your progress, decks, and cards across devices.
            </p>
          </>
        )}

        {isSignedIn && (
          <div className="w-full mt-4">
            <SolanaWalletConnect />
          </div>
        )}
      </div>
    </div>
  )
}
