"use client"

import React from 'react'
import type { ElementType, Skill } from '@/domain/game/types'

interface EquipmentActivationButtonProps {
  skill: Skill
  equipmentName: string
  onActivate: () => void
  canAfford: boolean
  usesRemaining?: number
  disabled?: boolean
}

export function EquipmentActivationButton({
  skill,
  equipmentName,
  onActivate,
  canAfford,
  usesRemaining,
  disabled = false,
}: EquipmentActivationButtonProps) {
  const getElementColor = (element: ElementType) => {
    switch (element) {
      case 'fire':
        return 'bg-red-600'
      case 'water':
        return 'bg-blue-600'
      case 'ground':
        return 'bg-yellow-600'
      case 'air':
        return 'bg-green-600'
      case 'neutral':
        return 'bg-gray-600'
      default:
        return 'bg-gray-600'
    }
  }

  const isDisabled = disabled || !canAfford || (usesRemaining !== undefined && usesRemaining <= 0)

  return (
    <div className="bg-gray-800 border border-green-500 rounded p-2 mb-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-bold text-green-300">{skill.name}</div>
        {usesRemaining !== undefined && (
          <div className="text-[10px] text-gray-400">
            {usesRemaining}/{skill.activationsPerTurn || 0} left
          </div>
        )}
      </div>

      {skill.description && (
        <div className="text-[10px] text-gray-300 mb-2">{skill.description}</div>
      )}

      <div className="flex items-center gap-2">
        {skill.activationCost && skill.activationCost.length > 0 && (
          <div className="flex gap-0.5">
            {skill.activationCost.map((element, idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full ${getElementColor(element)} flex items-center justify-center`}
                title={element}
              >
                <span className="text-[8px] font-bold text-white uppercase">{element[0]}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onActivate}
          disabled={isDisabled}
          className={`
            flex-1 px-2 py-1 rounded text-xs font-bold transition-all
            ${
              isDisabled
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-500 text-white cursor-pointer active:scale-95'
            }
          `}
        >
          {!canAfford
            ? 'Not Enough Spektra'
            : usesRemaining !== undefined && usesRemaining <= 0
            ? 'No Uses Left'
            : 'Activate'}
        </button>
      </div>
    </div>
  )
}

export default EquipmentActivationButton
