"use client"

import React, { useState } from 'react'
import type { Card } from '@/domain/game/types'
import { Card2D } from './Card2D'

interface DiscardSelectionModalProps {
  isOpen: boolean
  hand: Card[]
  title: string
  instruction: string
  minCards: number
  maxCards: number
  onConfirm: (selectedIndices: number[]) => void
  onCancel?: () => void
}

export function DiscardSelectionModal({
  isOpen,
  hand,
  title,
  instruction,
  minCards,
  maxCards,
  onConfirm,
  onCancel,
}: DiscardSelectionModalProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])

  if (!isOpen) return null

  const safeHand = hand || []

  const handleCardClick = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index))
    } else if (selectedIndices.length < maxCards) {
      setSelectedIndices([...selectedIndices, index])
    }
  }

  const handleConfirm = () => {
    if (selectedIndices.length >= minCards && selectedIndices.length <= maxCards) {
      onConfirm(selectedIndices)
      setSelectedIndices([])
    }
  }

  const canConfirm = selectedIndices.length >= minCards && selectedIndices.length <= maxCards

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-900 border-4 border-red-500 rounded-lg p-3 sm:p-6 max-w-4xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto flex flex-col">
        <h2 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2 text-center">
          {title}
        </h2>
        <p className="text-gray-300 mb-1 sm:mb-2 text-center text-sm sm:text-base">
          {instruction}
        </p>
        <p className="text-yellow-400 mb-2 sm:mb-4 text-center font-bold text-sm sm:text-base">
          Select {minCards === maxCards ? minCards : `${minCards}-${maxCards}`} card
          {maxCards > 1 ? 's' : ''} to discard
        </p>

        {safeHand.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No cards in hand</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6 flex-1 overflow-y-auto">
            {safeHand.map((card, index) => (
              <div
                key={index}
                className={`relative cursor-pointer transform transition-all hover:scale-105 ${
                  selectedIndices.includes(index) ? 'ring-4 ring-red-400 scale-105' : ''
                }`}
                onClick={() => handleCardClick(index)}
              >
                <Card2D card={card} onClick={() => handleCardClick(index)} />
                {selectedIndices.includes(index) && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-sm sm:text-lg">
                    X
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 sm:gap-4 justify-center pt-2 flex-shrink-0">
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="px-4 sm:px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm sm:text-base"
          >
            Confirm Discard ({selectedIndices.length})
          </button>
          {onCancel && (
            <button
              onClick={() => {
                setSelectedIndices([])
                onCancel()
              }}
              className="px-4 sm:px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-sm sm:text-base"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
