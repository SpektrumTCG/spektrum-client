"use client"

import React from 'react'
import { Card2D } from './Card2D'
import { toast } from 'sonner'

interface Hand2DProps {
  hand: any[]
  currentPlayer: 'player' | 'opponent'
  gamePhase: string
  onSelectCard: (index: number) => void
  onCardAction: (index: number, action: string) => void
}

export function Hand2D({
  hand,
  currentPlayer,
  gamePhase,
  onSelectCard,
  onCardAction,
}: Hand2DProps) {
  const isCardPlayable = (index: number) => {
    const card = hand[index]

    if (
      currentPlayer !== 'player' ||
      (gamePhase !== 'main1' && gamePhase !== 'main2' && gamePhase !== 'setup')
    ) {
      return false
    }

    if (card.type === 'avatar') {
      return true
    }

    const spektraCostLength = Array.isArray(card.spektraCost) ? card.spektraCost.length : 0
    return spektraCostLength <= hand.length
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-white text-center text-sm mb-2 font-bold">
        Your Hand ({hand.length})
      </div>

      <div className="flex justify-center flex-wrap" style={{ gap: '32px' }}>
        {hand.map((card, index) => (
          <div
            key={`hand-${card.id}`}
            className="transform hover:scale-105 transition-transform"
          >
            <Card2D
              card={card}
              isPlayable={isCardPlayable(index)}
              isInHand={true}
              onClick={() => onSelectCard(index)}
              onAction={(action) => onCardAction(index, action)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Hand2D
