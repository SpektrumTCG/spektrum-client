"use client"

import React from 'react'
import type { Card } from '@/domain/game/types'
import { Card2D } from './Card2D'

interface PlacementModalProps {
  isOpen: boolean
  card: Card | null
  title: string
  instruction: string
  onPlacement: (placement: 'top' | 'bottom') => void
  onCancel?: () => void
}

export function PlacementModal({
  isOpen,
  card,
  title,
  instruction,
  onPlacement,
  onCancel,
}: PlacementModalProps) {
  if (!isOpen || !card) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-900 border-4 border-green-500 rounded-lg p-3 sm:p-6 max-w-2xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2 text-center">
          {title}
        </h2>
        <p className="text-gray-300 mb-2 sm:mb-4 text-center text-sm sm:text-base">
          {instruction}
        </p>

        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-36 sm:w-48">
            <Card2D card={card} />
          </div>
        </div>

        <div className="flex gap-2 sm:gap-4 justify-center mb-3 sm:mb-4">
          <button
            onClick={() => onPlacement('top')}
            className="px-4 sm:px-8 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm sm:text-lg flex flex-col items-center gap-1"
          >
            <span className="text-xl sm:text-2xl">^</span>
            <span>Place on Top</span>
          </button>
          <button
            onClick={() => onPlacement('bottom')}
            className="px-4 sm:px-8 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-sm sm:text-lg flex flex-col items-center gap-1"
          >
            <span className="text-xl sm:text-2xl">v</span>
            <span>Place on Bottom</span>
          </button>
        </div>

        {onCancel && (
          <div className="flex justify-center">
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

export default PlacementModal
