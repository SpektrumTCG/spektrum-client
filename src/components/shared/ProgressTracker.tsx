"use client"

import React, { useState, useEffect } from "react"
import { useDeckStore } from "@/stores/useDeckStore"
import { useWalletStore } from "@/stores/useWalletStore"
import { useAchievementsStore } from "@/stores/useAchievementsStore"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface ProgressTrackerProps {
  className?: string
}

interface PlayerProgress {
  walletConnected: boolean
  totalCards: number
  uniqueCards: number
  completedDecks: number
  mintedNFTs: number
  level: number
  experience: number
  nextLevelExp: number
}

function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className={`w-full rounded-full overflow-hidden ${className ?? "h-2 bg-gray-700"}`}>
      <div
        className="h-full bg-orange-500 rounded-full transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export function ProgressTracker({ className = "" }: ProgressTrackerProps) {
  const { ownedCards, decks } = useDeckStore()
  const {
    walletAddress,
    isConnected,
    isReconnecting,
    savedWalletType,
    connectWallet,
    lastConnectionError,
  } = useWalletStore()
  const [reconnecting, setReconnecting] = useState(false)
  const { syncWithServer, saveProgressToServer } = useAchievementsStore()

  const handleReconnect = async () => {
    if (reconnecting) return
    setReconnecting(true)
    try {
      await connectWallet(savedWalletType || "phantom")
    } finally {
      setReconnecting(false)
    }
  }

  const [progress, setProgress] = useState<PlayerProgress>({
    walletConnected: false,
    totalCards: 0,
    uniqueCards: 0,
    completedDecks: 0,
    mintedNFTs: 0,
    level: 1,
    experience: 0,
    nextLevelExp: 100,
  })

  useEffect(() => {
    const updateProgress = async () => {
      try {
        const totalCards = ownedCards.length
        const uniqueCardNames = new Set(ownedCards.map(card => card.name))
        const uniqueCards = uniqueCardNames.size

        const completedDecks = decks.filter((deck: any) => deck.cards.length >= 40).length
        const mintedNFTs = totalCards

        const baseExp = totalCards * 2 + uniqueCards * 5 + completedDecks * 20 + mintedNFTs * 10
        const level = Math.floor(baseExp / 100) + 1
        const experience = baseExp % 100
        const nextLevelExp = 100

        setProgress({
          walletConnected: isConnected,
          totalCards,
          uniqueCards,
          completedDecks,
          mintedNFTs,
          level,
          experience,
          nextLevelExp,
        })

        if (isConnected && walletAddress) {
          await syncWithServer(walletAddress)
        }
      } catch {}
    }

    updateProgress()
    const interval = setInterval(updateProgress, 30000)
    return () => clearInterval(interval)
  }, [ownedCards, decks, walletAddress, isConnected, syncWithServer])

  const achievements = [
    {
      name: "Collector",
      id: "collector_50",
      description: "Own 50+ cards",
      achieved: progress.totalCards >= 50,
      progress: Math.min((progress.totalCards / 50) * 100, 100),
    },
    {
      name: "Strategist",
      id: "strategist_3",
      description: "Build 3+ decks",
      achieved: progress.completedDecks >= 3,
      progress: Math.min((progress.completedDecks / 3) * 100, 100),
    },
    {
      name: "NFT Master",
      id: "nft_master_10",
      description: "Mint 10+ NFTs",
      achieved: progress.mintedNFTs >= 10,
      progress: Math.min((progress.mintedNFTs / 10) * 100, 100),
    },
    {
      name: "Variety Player",
      id: "variety_25",
      description: "Collect 25+ unique cards",
      achieved: progress.uniqueCards >= 25,
      progress: Math.min((progress.uniqueCards / 25) * 100, 100),
    },
  ]

  useEffect(() => {
    if (walletAddress) {
      syncWithServer(walletAddress)
    }
  }, [walletAddress, syncWithServer])

  useEffect(() => {
    if (!walletAddress) return

    const saveAchievementIfNeeded = async () => {
      const collectorProgress = Math.min((progress.totalCards / 50) * 100, 100)
      if (collectorProgress > 0) {
        await saveProgressToServer(walletAddress, "collector_50", Math.floor(collectorProgress))
      }

      const strategistProgress = Math.min((progress.completedDecks / 3) * 100, 100)
      if (strategistProgress > 0) {
        await saveProgressToServer(walletAddress, "strategist_3", Math.floor(strategistProgress))
      }

      const nftProgress = Math.min((progress.mintedNFTs / 10) * 100, 100)
      if (nftProgress > 0) {
        await saveProgressToServer(walletAddress, "nft_master_10", Math.floor(nftProgress))
      }

      const varietyProgress = Math.min((progress.uniqueCards / 25) * 100, 100)
      if (varietyProgress > 0) {
        await saveProgressToServer(walletAddress, "variety_25", Math.floor(varietyProgress))
      }
    }

    saveAchievementIfNeeded()
  }, [
    progress.totalCards,
    progress.completedDecks,
    progress.mintedNFTs,
    progress.uniqueCards,
    walletAddress,
    saveProgressToServer,
  ])

  return (
    <div
      className={`bg-gray-900 rounded-xl p-4 border-2 border-orange-500 ${className}`}
      style={{ boxShadow: "0 0 20px rgba(249, 115, 22, 0.2)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-orange-400">Your Progress</h3>
        <div className="flex items-center space-x-2">
          <Badge
            className={`text-xs font-semibold ${progress.walletConnected ? "bg-orange-500 text-gray-900" : "bg-red-500 text-white"}`}
          >
            {progress.walletConnected ? "● CONNECTED" : "● DISCONNECTED"}
          </Badge>
          <Badge className="text-xs bg-orange-600 text-white font-bold">
            LV {progress.level}
          </Badge>
        </div>
      </div>

      {!isReconnecting && !isConnected && savedWalletType && (
        <div className="mb-3">
          {lastConnectionError?.toLowerCase().includes("offline") ? (
            <div className="flex items-center gap-2 bg-yellow-900/40 border border-yellow-600/50 rounded-lg px-3 py-2 text-xs text-yellow-300">
              <span>Network offline — your wallet session is saved.</span>
            </div>
          ) : (
            <button
              onClick={handleReconnect}
              disabled={reconnecting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-700 to-orange-600 hover:from-orange-600 hover:to-orange-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-2 rounded-lg border border-orange-500 transition-all"
            >
              {reconnecting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Reconnecting…
                </>
              ) : (
                <>Reconnect {savedWalletType.charAt(0).toUpperCase() + savedWalletType.slice(1)}</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Level Progress */}
      <div className="mb-4 bg-gray-800 rounded-lg p-3 border border-orange-500 border-opacity-30">
        <div className="flex justify-between text-sm text-white mb-2 font-semibold">
          <span>LEVEL {progress.level}</span>
          <span>
            {progress.experience}/{progress.nextLevelExp} XP
          </span>
        </div>
        <ProgressBar value={progress.experience} max={progress.nextLevelExp} className="h-2 bg-gray-700" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 text-center border border-orange-500 border-opacity-40 hover:border-opacity-80 transition-all">
          <div className="text-2xl font-bold text-white">{progress.totalCards}</div>
          <div className="text-xs text-white uppercase tracking-wider">Total Cards</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 text-center border border-orange-500 border-opacity-40 hover:border-opacity-80 transition-all">
          <div className="text-2xl font-bold text-white">{progress.uniqueCards}</div>
          <div className="text-xs text-white uppercase tracking-wider">Unique Cards</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 text-center border border-green-500 border-opacity-40 hover:border-opacity-80 transition-all">
          <div className="text-2xl font-bold text-white">{progress.completedDecks}</div>
          <div className="text-xs text-white uppercase tracking-wider">Complete Decks</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 text-center border border-purple-500 border-opacity-40 hover:border-opacity-80 transition-all">
          <div className="text-2xl font-bold text-white">{progress.mintedNFTs}</div>
          <div className="text-xs text-white uppercase tracking-wider">Minted NFTs</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-gray-800 rounded-lg p-3 border border-orange-500 border-opacity-30">
        <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">◆ ACHIEVEMENTS</h4>
        <div className="space-y-2">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-lg p-2 border border-gray-700 hover:border-orange-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-white flex items-center">
                  {achievement.achieved ? "[x]" : "[ ]"}{" "}
                  <span className="ml-1 text-white">{achievement.name}</span>
                </span>
                <span className="text-xs text-white font-bold">
                  {achievement.progress.toFixed(0)}%
                </span>
              </div>
              <div className="text-xs text-gray-400 mb-1">{achievement.description}</div>
              <ProgressBar value={achievement.progress} max={100} className="h-1 bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
