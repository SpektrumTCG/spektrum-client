"use client"

import React from 'react'

interface PlayerStats2DProps {
  player: 'player' | 'opponent'
  health?: number
  spektraCount?: number
  lifeCardsCount?: number
  isPlayersTurn?: boolean
  gamePhase?: string
}

export function PlayerStats2D({
  player,
  health = 0,
  spektraCount = 0,
  lifeCardsCount = 0,
  isPlayersTurn = false,
  gamePhase = '',
}: PlayerStats2DProps) {
  const bgColor = player === 'player' ? 'bg-red-800' : 'bg-blue-800'
  const borderColor = player === 'player' ? 'border-red-500' : 'border-blue-500'

  return (
    <div
      className={`${bgColor} ${borderColor} border-2 rounded-lg p-2 shadow-lg text-white w-full max-w-xs`}
    >
      <div className="text-center font-bold mb-1">
        {player === 'player' ? 'YOU' : 'OPPONENT'}
        {isPlayersTurn && <span className="ml-2 text-yellow-300">*</span>}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-red-600 bg-opacity-50 rounded p-1 text-center">
          <div className="text-xs">Health</div>
          <div className="font-bold">{health}</div>
        </div>

        <div className="bg-yellow-600 bg-opacity-50 rounded p-1 text-center">
          <div className="text-xs">Spektra</div>
          <div className="font-bold">{spektraCount}</div>
        </div>

        <div className="bg-purple-600 bg-opacity-50 rounded p-1 text-center">
          <div className="text-xs">Life Cards</div>
          <div className="font-bold">{lifeCardsCount}</div>
        </div>

        <div className="bg-green-600 bg-opacity-50 rounded p-1 text-center">
          <div className="text-xs">Phase</div>
          <div className="font-bold text-xs">{isPlayersTurn ? gamePhase : '-'}</div>
        </div>
      </div>
    </div>
  )
}

export default PlayerStats2D
