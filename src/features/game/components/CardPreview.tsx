"use client"

import React from 'react'
import { SafeCardImage } from '@/components/shared/SafeCardImage'
import { getFixedCardImagePath } from '@/lib/cardImageFixer'
import type { AvatarCard, Card } from '@spektrum/shared'

type CardWithExtras = Card & { cardId?: string; imagePath?: string }

// ─── Element dot ──────────────────────────────────────────────────────────────
export const elementDotClass = (el: string) => {
  switch (el) {
    case 'fire':   return 'bg-red-500'
    case 'water':  return 'bg-blue-500'
    case 'ground': return 'bg-amber-800'
    case 'air':    return 'bg-cyan-300'
    default:       return 'bg-gray-400'
  }
}

export function resolveCardName(card: Card): string {
  if (card.name) return card.name
  const raw = (card as CardWithExtras).cardId || card.id || ''
  const parts = raw.split('-')
  const nameParts = parts.filter((p: string) => !/^\d+$/.test(p) && !['fire', 'water', 'air', 'ground', 'neutral', 'deck', 'copy', 'owned'].includes(p))
  if (nameParts.length > 0) return nameParts.map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
  return 'Card'
}

export const CardPreview = ({
  card,
  onClose,
  damageCounter,
}: {
  card: Card
  onClose: () => void
  damageCounter?: number
}) => {
  const damage = damageCounter ?? (card.type === 'avatar' ? (card as AvatarCard).counters?.damage || 0 : 0)
  const isAvatarCard = card.type === 'avatar'
  const modalWidth = isAvatarCard ? 'max-w-[450px]' : 'max-w-[390px]'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-2" onClick={onClose}>
      <div
        className={`relative bg-gray-800 rounded-lg border-2 border-orange-500 shadow-lg ${modalWidth} max-h-[85vh] overflow-y-auto`}
        style={{ boxShadow: '0 0 30px rgba(249, 115, 22, 0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="absolute top-1 right-1 text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-xs z-10" onClick={onClose}>X</button>
        <div className="p-1">
          <div className="mb-1 rounded overflow-hidden">
            {(card.art || (card as CardWithExtras).imagePath) && (
              <SafeCardImage src={getFixedCardImagePath(card)} alt={card?.name || 'Card'} className="max-w-full max-h-[45vh] object-cover" />
            )}
          </div>
          <h3 className="text-xs font-bold text-white mb-0.5 leading-tight">{resolveCardName(card)}</h3>
          <div className="flex justify-between mb-0.5 text-[10px]">
            <div className="text-gray-300 leading-tight">
              {card?.type ? card.type.charAt(0).toUpperCase() + card.type.slice(1) : 'Card'} &bull; {card?.element || 'unknown'}
              {isAvatarCard && ` • Lv${(card as AvatarCard)?.level || 1}`}
            </div>
            {card?.spektraCost && Array.isArray(card.spektraCost) && (
              <div className="flex items-center gap-0.5">
                {card.spektraCost.map((spektra: string, i: number) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${elementDotClass(spektra)}`} />
                ))}
              </div>
            )}
          </div>
          {isAvatarCard && (
            <div className="mb-1">
              <div className="flex justify-between items-center text-[10px] mb-0.5">
                <div>HP: {(card as AvatarCard).health}</div>
                {damage > 0 && <div className="text-red-500 font-bold">{Math.max(0, (card as AvatarCard).health - damage)}</div>}
              </div>
              {(card as AvatarCard).skill1 && (
                <div className="mt-1 p-0.5 bg-gray-700 rounded">
                  <div className="text-[10px] font-medium leading-tight">{(card as AvatarCard).skill1?.name || 'Skill 1'}</div>
                  <div className="text-[10px] text-gray-300 leading-tight">
                    {((card as AvatarCard).skill1?.spektraCost || []).map((e: string) => e.charAt(0).toUpperCase() + e.slice(1)).join(', ') || 'None'} &bull; {(card as AvatarCard).skill1?.damage || 0} dmg
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="text-gray-400 text-[9px] mt-1 leading-tight truncate">{card.id}</div>
        </div>
      </div>
    </div>
  )
}

export default CardPreview
