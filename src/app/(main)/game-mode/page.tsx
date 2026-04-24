'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { useGameMode } from '@/features/game/stores/useGameMode'
import { useGameStore } from '@/features/game/stores/useGameStore'
import { useDeckStore } from '@/stores/useDeckStore'
import { useWalletStore } from '@/stores/useWalletStore'
import type { AIDifficulty } from '@/features/game/stores/useGameMode'

export default function GameModePage() {
  const router = useRouter()
  const gameMode = useGameMode()
  const { decks, activeDeckId, setActiveDeck } = useDeckStore()
  const { walletAddress, playerProfile } = useWalletStore()

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
      toast.success('Name saved!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save name')
    } finally {
      setIsSavingName(false)
    }
  }

  const handleStartAIGame = (difficulty?: AIDifficulty) => {
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
  }

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto min-h-dvh justify-center">
      <div className="w-full max-w-md mx-auto p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-600">Game Mode</h1>
          <p className="text-gray-400 text-sm">Select your opponent and begin the battle</p>
        </div>

        <div
          className="bg-gray-900 border-2 border-orange-500 rounded-2xl p-6 shadow-lg mb-6"
          style={{ boxShadow: '0 0 25px rgba(249, 115, 22, 0.2)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 2 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
            <h2 className="text-xl font-bold text-white">Player Setup</h2>
          </div>

          {/* Player Name */}
          <div className="mb-4">
            <label htmlFor="playerName" className="block text-sm font-medium mb-1 text-gray-200">
              Your Name
            </label>
            <div className="flex gap-2 min-w-0">
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                className="min-w-0 flex-1 px-3 py-2 bg-gray-800 border border-orange-500/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                placeholder="Enter your name"
              />
              <button
                onClick={handleSavePlayerName}
                disabled={isSavingName || !playerName.trim()}
                className="shrink-0 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors border border-orange-400"
              >
                {isSavingName ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          {/* Deck Selection */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-200">Select Deck</label>
              <div className="flex space-x-2">
                <Link href="/deck-builder" className="text-orange-400 hover:text-orange-300 text-xs">
                  Manage Decks
                </Link>
                <Link href="/library" className="text-orange-400 hover:text-orange-300 text-xs">
                  Card Library
                </Link>
              </div>
            </div>

            {decks.length === 0 ? (
              <div className="bg-gray-800 p-4 rounded-xl text-center border border-orange-500/30">
                <p className="text-gray-400 mb-2">No decks available</p>
                <Link href="/deck-builder" className="text-orange-400 hover:text-orange-300 underline">
                  Create a Deck
                </Link>
              </div>
            ) : (
              <select
                value={selectedDeckId || ''}
                onChange={e => setSelectedDeckId(e.target.value || null)}
                className="w-full px-3 py-2 bg-gray-800 border border-orange-500/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              >
                <option value="" disabled>Choose a deck...</option>
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
          </div>

          {/* Game Modes */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8"/><path d="M12 17v4"/>
              </svg>
              <h3 className="text-lg font-semibold text-white">Game Modes</h3>
            </div>

            <button
              onClick={() => handleStartAIGame()}
              disabled={decks.length === 0 || !selectedDeckId}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white py-3 px-4 rounded-lg transition-colors font-medium border border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Vs AI
            </button>

            <button
              onClick={() => {
                if (!updateActiveDeck()) return
                router.push('/multiplayer')
              }}
              disabled={decks.length === 0 || !selectedDeckId}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white py-3 px-4 rounded-lg transition-colors font-medium border border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Multiplayer Mode
            </button>
          </div>
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
