"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SolanaWalletConnect } from "@/components/shared/SolanaWalletConnect"
import { LoadingScreen } from "@/components/shared/LoadingScreen"

export function StartFeature() {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleWalletConnected = () => {
    setIsConnected(true)
  }

  const handlePlayGame = () => {
    setIsLoading(true)
    setTimeout(() => {
      router.push("/home")
    }, 2000)
  }

  if (isLoading) {
    return <LoadingScreen message="Entering the world of Spektrum..." />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24 overflow-y-auto">
      <div className="max-w-md w-full mx-auto text-center flex flex-col items-center">
        <div className="mb-12">
          <img
            src="/attached_assets/Logo Spektrum_1760084011907.png"
            alt="Spektrum Trading Card Game"
            className="w-full max-w-md mx-auto h-auto drop-shadow-lg"
            onError={e => { e.currentTarget.style.display = "none" }}
          />
        </div>

        <div className="w-full mb-6">
          <SolanaWalletConnect onConnected={handleWalletConnected} />
        </div>

        {isConnected && (
          <button
            onClick={handlePlayGame}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all border border-orange-400 mt-4"
            style={{ boxShadow: "0 0 25px rgba(249, 115, 22, 0.6)" }}
          >
            ENTER THE ARENA
          </button>
        )}

        <p className="text-gray-500 text-xs mt-8">
          Connect your Solana wallet to begin your journey
        </p>
      </div>
    </div>
  )
}
