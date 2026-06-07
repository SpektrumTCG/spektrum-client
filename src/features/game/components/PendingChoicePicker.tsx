'use client'

import React, { useState, useCallback } from 'react'
import { SafeCardImage } from '@/components/shared/SafeCardImage'
import { getFixedCardImagePath } from '@/lib/cardImageFixer'
import { resolveCardName } from './CardPreview'
import type { PendingChoice } from '@spektrum/shared'

const INSTRUCTIONS: Record<PendingChoice['type'], (count: number) => string> = {
  reveal_choose: () => 'Choose 1 card to add to your hand — the rest are shuffled back into your deck.',
  peek_place: () => 'Top of your deck. It will be placed back.',
  peek_place_draw: (count) => `Choose ${count} card${count === 1 ? '' : 's'} to put back on top of your deck — you draw the rest.`,
  draw_discard: (count) => `Choose ${count} card${count === 1 ? '' : 's'} to discard.`,
}

interface PendingChoicePickerProps {
  choice: PendingChoice
  onResolve: (chosenCardIds: string[]) => void
}

/**
 * Modal shown while a mid-action card choice (reveal_choose, peek_place,
 * peek_place_draw, draw_discard) is pending for the local player. All other
 * actions are rejected by the engine until the choice resolves.
 */
export function PendingChoicePicker({ choice, onResolve }: PendingChoicePickerProps) {
  const [selected, setSelected] = useState<string[]>([])

  const toggle = useCallback((cardId: string) => {
    setSelected(prev => {
      if (prev.includes(cardId)) return prev.filter(id => id !== cardId)
      // Picking one more than allowed replaces the oldest selection when the
      // choice is single-pick; otherwise it is ignored until one is unpicked.
      if (prev.length >= choice.count) {
        return choice.count === 1 ? [cardId] : prev
      }
      return [...prev, cardId]
    })
  }, [choice.count])

  const ready = selected.length === choice.count

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border-2 border-cyan-500 p-4 max-w-md w-full" style={{ boxShadow: '0 0 40px rgba(6,182,212,0.4)' }}>
        <h2 className="text-lg font-bold text-cyan-300 mb-1">{choice.sourceCardName}</h2>
        <p className="text-gray-300 text-sm mb-4">{INSTRUCTIONS[choice.type](choice.count)}</p>

        <div className="grid grid-cols-3 gap-2 mb-4 max-h-[50vh] overflow-y-auto">
          {choice.cards.map(card => {
            const isSelected = selected.includes(card.id)
            const selectable = choice.count > 0
            return (
              <button
                key={card.id}
                onClick={() => selectable && toggle(card.id)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                  isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-400 scale-[1.03]'
                    : selectable
                      ? 'border-gray-600 hover:border-cyan-600'
                      : 'border-gray-600'
                }`}
              >
                <div className="aspect-[3/4] bg-gray-700">
                  {(card.imagePath || card.art) ? (
                    <SafeCardImage src={getFixedCardImagePath(card)} alt={resolveCardName(card)} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-1 text-center text-[10px] text-gray-300">
                      {resolveCardName(card)}
                    </div>
                  )}
                </div>
                <div className="px-1 py-0.5 bg-gray-900/90 text-[10px] text-gray-200 truncate">{resolveCardName(card)}</div>
                {isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-cyan-500 text-white text-xs font-bold flex items-center justify-center">✓</div>
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => ready && onResolve(selected)}
          disabled={!ready}
          className={`w-full py-3 rounded-lg font-bold text-sm transition-all border-2 ${
            ready
              ? 'bg-cyan-600 border-cyan-400 text-white hover:bg-cyan-500 active:scale-95'
              : 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {choice.count === 0 ? 'OK' : `Confirm (${selected.length}/${choice.count})`}
        </button>
      </div>
    </div>
  )
}
