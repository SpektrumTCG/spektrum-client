"use client"

import React from 'react'
import type { AvatarCard } from '@/domain/game/types'
import { Card2D } from './Card2D'

interface TargetSelectorProps {
  availableTargets: AvatarCard[]
  selectionType: 'player_reserve' | 'opponent_reserve' | 'player_avatar' | 'opponent_avatar'
  onSelectTarget: (target: AvatarCard) => void
  onCancel: () => void
}

export function TargetSelector({
  availableTargets,
  selectionType,
  onSelectTarget,
  onCancel,
}: TargetSelectorProps) {
  const isPlayerTarget =
    selectionType === 'player_reserve' || selectionType === 'player_avatar'
  const isReserveOnly =
    selectionType === 'player_reserve' || selectionType === 'opponent_reserve'
  const targetDescription = isReserveOnly
    ? `${isPlayerTarget ? 'friendly' : 'enemy'} reserve avatar`
    : `${isPlayerTarget ? 'friendly' : 'enemy'} avatar (active or reserve)`

  if (availableTargets.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-gray-900 border-2 border-orange-500 rounded-lg p-4 sm:p-6 max-w-md w-full">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
            No Targets Available
          </h2>
          <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">
            There are no available {targetDescription} to target.
          </p>
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-900 border-2 border-orange-500 rounded-lg p-3 sm:p-6 max-w-4xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
          Select Target Avatar
        </h2>
        <p className="text-gray-300 mb-3 sm:mb-6 text-sm sm:text-base">
          Choose a {targetDescription} to target with this effect.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          {availableTargets.map((avatar, index) => (
            <div
              key={`${avatar.id}-${index}`}
              onClick={() => onSelectTarget(avatar)}
              className="cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl"
            >
              <div className="border-2 border-orange-500 rounded-lg overflow-hidden bg-gray-800 hover:border-orange-400">
                <Card2D card={avatar} onClick={() => onSelectTarget(avatar)} />
                <div className="p-2 bg-gray-800/90">
                  <p className="text-xs text-white font-semibold text-center truncate">
                    {avatar.name}
                  </p>
                  <p className="text-xs text-gray-400 text-center">
                    HP: {avatar.health - (avatar.counters?.damage || 0)}/{avatar.health}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors text-sm sm:text-base"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default TargetSelector
