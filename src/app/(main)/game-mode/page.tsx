'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { useGameMode } from '@/features/game/stores/useGameMode'
import { useGameStore } from '@/features/game/stores/useGameStore'
import { useDeckStore } from '@/stores/useDeckStore'
import { useWalletStore } from '@/stores/useWalletStore'
import { useRequireAuth } from '@/components/shared/AuthGateModal'
import type { AIDifficulty } from '@/features/game/stores/useGameMode'

export default function GameModePage() {
  const router = useRouter()
  const gameMode = useGameMode()
  const { decks, activeDeckId, setActiveDeck } = useDeckStore()
  const { walletAddress, playerProfile } = useWalletStore()
  const requireAuthForAI = useRequireAuth('play-ai')
  const requireAuthForMultiplayer = useRequireAuth('play-casual')

  const [playerName, setPlayerName] = useState(
    playerProfile?.displayName || gameMode.playerName
  )
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(activeDeckId)
  const [showAIDifficultySelector, setShowAIDifficultySelector] = useState(false)
  const [isSavingName, setIsSavingName] = useState(false)

  useEffect(() => {
    if (playerProfile?.displayName && playerProfile.displayName !== playerName) {
      setPlayerName(playerProfile.displayName)
      gameMode.setPlayerName(playerProfile.displayName)
    }
  }, [playerProfile?.displayName])

  useEffect(() => {
    if (!selectedDeckId && decks.length > 0) {
      setSelectedDeckId(decks[0].id)
    }
  }, [decks, selectedDeckId])

  const updateActiveDeck = () => {
    if (!selectedDeckId) {
      toast.error('Please select a deck first.')
      return false
    }
    setActiveDeck(selectedDeckId)
    return true
  }

  const handleSavePlayerName = async () => {
    if (!playerName.trim()) {
      toast.error('Please enter a name')
      return
    }
    if (!walletAddress) {
      toast.error('Wallet not connected')
      return
    }
    setIsSavingName(true)
    try {
      const response = await fetch('/api/player/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, displayName: playerName }),
        credentials: 'include',
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to save name')
      }
      gameMode.setPlayerName(playerName)
      // Keep the wallet store's playerProfile in sync so other surfaces
      // (e.g. the multiplayer lobby) read the updated displayName.
      useWalletStore.setState((s) => ({
        playerProfile: s.playerProfile
          ? { ...s.playerProfile, displayName: playerName }
          : { displayName: playerName, gamesPlayed: 0, gamesWon: 0, gamesLost: 0, country: null, region: null },
      }))
      toast.success('Name saved!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save name')
    } finally {
      setIsSavingName(false)
    }
  }

  const handleStartAIGame = (difficulty?: AIDifficulty) => {
    requireAuthForAI(() => {
      if (!difficulty) {
        setShowAIDifficultySelector(true)
        return
      }
      if (!updateActiveDeck()) return

      const deck = decks.find(d => d.id === selectedDeckId)
      if (!deck || deck.cards.length === 0) {
        toast.error('Selected deck has no cards.')
        return
      }

      gameMode.setPlayerName(playerName)
      gameMode.setAIDifficulty(difficulty)
      gameMode.startAIGame()

      useGameStore.getState().startGame(deck.cards, difficulty)

      toast.success(`Starting game against ${difficulty} AI...`)
      setShowAIDifficultySelector(false)
      router.push('/game')
    })
  }

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto min-h-dvh justify-center">
      <div className="w-full max-w-md mx-auto p-4">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/ui/logo.png" alt="Spektrum Trading Card Game" width={220} height={80} priority />
        </div>

        {/* Player Setup Card */}
        <div
          className="bg-gray-900 border-2 border-orange-500 rounded-2xl p-6 shadow-lg mb-6"
          style={{ boxShadow: '0 0 25px rgba(249, 115, 22, 0.2)' }}
        >
          <h2 className="text-xl font-bold text-white text-center tracking-wider mb-5">PLAYER SETUP</h2>

          {/* Player Name */}
          <div className="mb-5">
            <label htmlFor="playerName" className="block text-xs font-bold mb-1.5 text-gray-300 tracking-wider uppercase">
              Your Name
            </label>
            <div className="relative">
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors pr-24"
                placeholder="Player Name"
              />
              <button
                onClick={handleSavePlayerName}
                disabled={isSavingName || !playerName.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-orange-500 hover:text-orange-400 disabled:text-gray-600 font-bold text-sm tracking-wider transition-colors"
              >
                {isSavingName ? 'SAVING…' : 'CONFIRM'}
              </button>
            </div>
          </div>

          {/* Deck Selection */}
          <div>
            <label className="block text-xs font-bold mb-1.5 text-gray-300 tracking-wider uppercase">
              Select Deck
            </label>

            {decks.length === 0 ? (
              <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-600">
                <p className="text-gray-400 mb-2">No decks available</p>
                <Link href="/cards" className="text-orange-400 hover:text-orange-300 underline">
                  Create a Deck
                </Link>
              </div>
            ) : (
              <select
                value={selectedDeckId || ''}
                onChange={e => setSelectedDeckId(e.target.value || null)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
              >
                <option value="" disabled>DECK NAME</option>
                {decks.map(deck => {
                  const tribeLabel =
                    deck.tribe === 'kobar-borah' ? ' · Kobar-Borah' :
                    deck.tribe === 'kujana-kuhaka' ? ' · Kujana-Kuhaka' : ''
                  return (
                    <option key={deck.id} value={deck.id}>
                      {deck.name}{tribeLabel} ({deck.cards.length} cards)
                    </option>
                  )
                })}
              </select>
            )}

            <div className="flex justify-end mt-1.5">
              <Link href="/cards" className="text-orange-400 hover:text-orange-300 text-xs font-medium">
                Manage Decks
              </Link>
            </div>
          </div>
        </div>

        {/* Game Mode Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleStartAIGame()}
            disabled={decks.length === 0 || !selectedDeckId}
            className="relative w-full h-[52px] flex items-center justify-center text-white font-bold text-lg tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all"
          >
            <img
              src="/ui/v2-ui/Button.png"
              alt=""
              className="absolute inset-0 w-full h-full object-fill"
            />
            <span className="relative z-10">VS AI</span>
          </button>

          <button
            onClick={() => {
              requireAuthForMultiplayer(() => {
                if (!updateActiveDeck()) return
                router.push('/multiplayer')
              })
            }}
            disabled={decks.length === 0 || !selectedDeckId}
            className="relative w-full h-[52px] flex items-center justify-center text-white font-bold text-lg tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all"
          >
            <img
              src="/ui/v2-ui/Button.png"
              alt=""
              className="absolute inset-0 w-full h-full object-fill"
            />
            <span className="relative z-10">MULTIPLAYER MODE</span>
          </button>
        </div>
      </div>

      {/* AI Difficulty Modal */}
      {showAIDifficultySelector && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div
            className="bg-gray-900 border-2 border-orange-500 rounded-2xl p-6 shadow-lg max-w-md w-full"
            style={{ boxShadow: '0 0 30px rgba(249, 115, 22, 0.3)' }}
          >
            <h2 className="text-xl font-bold mb-4 text-white text-center">Choose AI Difficulty</h2>
            <p className="text-sm text-gray-300 mb-6 text-center">
              Select the AI opponent difficulty level for your match
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleStartAIGame('newbie')}
                className="w-full flex items-stretch rounded-lg overflow-hidden border border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors text-left"
              >
                <div className="w-1 shrink-0 bg-green-500/70" />
                <div className="flex-1 py-3 px-4">
                  <div className="font-bold text-white">Newbie AI</div>
                  <div className="text-sm text-gray-400">Easy opponent, makes simple moves with longer thinking time</div>
                </div>
              </button>

              <button
                onClick={() => handleStartAIGame('regular')}
                className="w-full flex items-stretch rounded-lg overflow-hidden border border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors text-left"
              >
                <div className="w-1 shrink-0 bg-orange-400/70" />
                <div className="flex-1 py-3 px-4">
                  <div className="font-bold text-white">Regular AI</div>
                  <div className="text-sm text-gray-400">Balanced opponent, considers multiple options</div>
                </div>
              </button>

              <button
                onClick={() => handleStartAIGame('advanced')}
                className="w-full flex items-stretch rounded-lg overflow-hidden border border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors text-left"
              >
                <div className="w-1 shrink-0 bg-rose-500/70" />
                <div className="flex-1 py-3 px-4">
                  <div className="font-bold text-white">Advanced AI</div>
                  <div className="text-sm text-gray-400">Challenging opponent, makes strategic decisions quickly</div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowAIDifficultySelector(false)}
              className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors border border-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
