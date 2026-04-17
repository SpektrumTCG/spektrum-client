"use client"

import React from 'react'
import { toast } from 'sonner'

interface GameControls2DProps {
  currentPlayer: 'player' | 'opponent'
  gamePhase: string
  onNextPhase: () => void
}

export function GameControls2D({
  currentPlayer,
  gamePhase,
  onNextPhase,
}: GameControls2DProps) {
  const isPlayerTurn = currentPlayer === 'player'

  const handlePhaseAction = () => {
    if (!isPlayerTurn) {
      toast.error("It's not your turn!")
      return
    }

    onNextPhase()
  }

  const getActionButtonText = () => {
    if (!isPlayerTurn) {
      return "Opponent's Turn"
    }

    switch (gamePhase) {
      case 'ready':
        return 'Start Game'
      case 'refresh':
        return 'Proceed to Draw'
      case 'draw':
        return 'Draw Card'
      case 'main1':
        return 'Go to Battle Phase'
      case 'battle':
        return 'Go to Main Phase 2'
      case 'main2':
        return 'Go to Recheck Phase'
      case 'recheck':
        return 'Go to End Phase'
      case 'end':
        return 'End Turn'
      default:
        return 'Next Phase'
    }
  }

  const getPhaseDescription = () => {
    switch (gamePhase) {
      case 'ready':
        return 'Game not started'
      case 'refresh':
        return 'Refresh Phase: All tapped cards are untapped'
      case 'draw':
        return 'Draw Phase: Draw a card'
      case 'main1':
        return 'Main Phase 1: Play cards, use abilities'
      case 'battle':
        return 'Battle Phase: Attack with avatars'
      case 'main2':
        return 'Main Phase 2: Play more cards after battle'
      case 'recheck':
        return 'Recheck Phase: Discard cards if you have more than 8'
      case 'end':
        return 'End Phase: End your turn'
      default:
        return ''
    }
  }

  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow-lg text-white">
      <div className="text-center mb-2">
        <div className="font-bold">
          {isPlayerTurn ? 'Your Turn' : "Opponent's Turn"}
        </div>
        <div className="text-sm mb-2">
          {gamePhase.charAt(0).toUpperCase() + gamePhase.slice(1)} Phase
        </div>
        <div className="text-xs italic mb-4">{getPhaseDescription()}</div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handlePhaseAction}
          disabled={!isPlayerTurn}
          className={`py-2 px-4 rounded-lg font-bold text-white ${
            isPlayerTurn
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              : 'bg-gray-700 cursor-not-allowed'
          }`}
        >
          {getActionButtonText()}
        </button>

        <div className="grid grid-cols-5 gap-1 text-center text-xs">
          <div
            className={`rounded p-1 ${gamePhase === 'refresh' ? 'bg-yellow-600' : 'bg-gray-700'}`}
          >
            Refresh
          </div>
          <div
            className={`rounded p-1 ${gamePhase === 'draw' ? 'bg-yellow-600' : 'bg-gray-700'}`}
          >
            Draw
          </div>
          <div
            className={`rounded p-1 ${gamePhase === 'main1' ? 'bg-yellow-600' : 'bg-gray-700'}`}
          >
            Main 1
          </div>
          <div
            className={`rounded p-1 ${gamePhase === 'battle' ? 'bg-yellow-600' : 'bg-gray-700'}`}
          >
            Battle
          </div>
          <div
            className={`rounded p-1 ${
              gamePhase === 'main2' || gamePhase === 'end' ? 'bg-yellow-600' : 'bg-gray-700'
            }`}
          >
            Main 2
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameControls2D
