"use client"

import React, { useState } from 'react'
import type { Card } from '@/domain/game/types'
import { Card2D } from './Card2D'

interface CardRevealModalProps {
  isOpen: boolean
  revealedCards: Card[]
  title: string
  instruction: string
  onCardSelected: (cardIndex: number) => void
  onCancel?: () => void
  allowMultiSelect?: boolean
  maxSelectCount?: number
}

export function CardRevealModal({
  isOpen,
  revealedCards,
  title,
  instruction,
  onCardSelected,
  onCancel,
  allowMultiSelect = false,
  maxSelectCount = 1,
}: CardRevealModalProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])

  if (!isOpen) return null

  const safeCards = revealedCards || []

  const handleCardClick = (index: number) => {
    if (allowMultiSelect) {
      if (selectedIndices.includes(index)) {
        setSelectedIndices(selectedIndices.filter((i) => i !== index))
      } else if (selectedIndices.length < maxSelectCount) {
        setSelectedIndices([...selectedIndices, index])
      }
    } else {
      onCardSelected(index)
      setSelectedIndices([])
    }
  }

  const handleConfirm = () => {
    if (selectedIndices.length > 0) {
      selectedIndices.forEach((index) => onCardSelected(index))
      setSelectedIndices([])
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-900 border-4 border-blue-500 rounded-lg p-3 sm:p-6 max-w-4xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto flex flex-col">
        <h2 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2 text-center">
          {title}
        </h2>
        <p className="text-gray-300 mb-2 sm:mb-4 text-center text-sm sm:text-base">
          {instruction}
        </p>

        {safeCards.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No cards to reveal</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-6 flex-1 overflow-y-auto">
            {safeCards.map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                className={`relative cursor-pointer transform transition-all hover:scale-105 ${
                  selectedIndices.includes(index) ? 'ring-4 ring-yellow-400 scale-105' : ''
                }`}
                onClick={() => handleCardClick(index)}
              >
                <Card2D card={card} onClick={() => handleCardClick(index)} />
                <div className="absolute top-0 left-0 bg-blue-600 text-white rounded-br-lg px-2 py-0.5 text-xs font-bold">
                  #{index + 1}
                </div>
                {selectedIndices.includes(index) && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    V
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {allowMultiSelect && (
          <div className="flex gap-2 sm:gap-4 justify-center pt-2 flex-shrink-0">
            <button
              onClick={handleConfirm}
              disabled={selectedIndices.length === 0}
              className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm sm:text-base"
            >
              Confirm ({selectedIndices.length}/{maxSelectCount})
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 sm:px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-sm sm:text-base"
              >
                Cancel
              </button>
            )}
          </div>
        )}

        {!allowMultiSelect && onCancel && (
          <div className="flex justify-center pt-2 flex-shrink-0">
            <button
              onClick={onCancel}
              className="px-4 sm:px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
