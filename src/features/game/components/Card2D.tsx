"use client"

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { AvatarCard, ActionCard } from '@spektrum/shared'
import { useAudio } from '@/stores/useAudioStore'
import { toast } from 'sonner'
import { getFixedCardImagePath, handleCardImageError } from '@/lib/cardImageFixer'


interface Card2DProps {
  card: any
  isPlayable?: boolean
  isInHand?: boolean
  onClick?: () => void
  onAction?: (action: string) => void
  isDragging?: boolean
  isTapped?: boolean
  counters?: { damage?: number; bleed?: number; shield?: number }
  scale?: number
}

const Card2DInner: React.FC<Card2DProps> = ({
  card,
  isPlayable = false,
  isInHand = false,
  onClick,
  onAction,
  isDragging = false,
  isTapped = false,
  counters,
  scale = 1,
}) => {
  const [showActions, setShowActions] = useState(false)
  const playHitSound = useAudio((state) => state.playHit)
  const playCard = useAudio((state) => state.playCard)
  const cardRef = useRef<HTMLDivElement>(null)

  const [isMobileView, setIsMobileView] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 600)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const baseWidth = isMobileView ? 90 : 120
  const baseHeight = isMobileView ? 126 : 168
  const width = baseWidth * scale
  const height = baseHeight * scale

  const renderSpektraCost = (spektraCost?: string[] | number) => {
    if (typeof spektraCost === 'number') {
      return (
        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">{spektraCost}</span>
        </div>
      )
    }

    if (!spektraCost || spektraCost.length === 0) return null

    const spektraCount: Record<string, number> = {
      fire: 0,
      water: 0,
      ground: 0,
      air: 0,
      neutral: 0,
    }

    if (Array.isArray(spektraCost)) {
      spektraCost.forEach((type) => {
        if (type in spektraCount) spektraCount[type]++
      })
    }
    return (
      <div className="flex gap-0.5">
        {spektraCount.fire > 0 && (
          <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-white text-[8px]">
            {spektraCount.fire}
          </div>
        )}
        {spektraCount.water > 0 && (
          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-[8px]">
            {spektraCount.water}
          </div>
        )}
        {spektraCount.ground > 0 && (
          <div className="w-4 h-4 bg-amber-800 rounded-full flex items-center justify-center text-white text-[8px]">
            {spektraCount.ground}
          </div>
        )}
        {spektraCount.air > 0 && (
          <div className="w-4 h-4 bg-cyan-300 rounded-full flex items-center justify-center text-black text-[8px]">
            {spektraCount.air}
          </div>
        )}
        {spektraCount.neutral > 0 && (
          <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-black text-[8px]">
            {spektraCount.neutral}
          </div>
        )}
      </div>
    )
  }

  let cardColor = '#5b3089'
  let cardColorHover = '#7340ab'

  if (card.type === 'avatar') {
    switch (card.element) {
      case 'fire':
        cardColor = '#c92626'
        cardColorHover = '#e83232'
        break
      case 'water':
        cardColor = '#2671c9'
        cardColorHover = '#3285e8'
        break
      case 'earth':
        cardColor = '#8c5e2a'
        cardColorHover = '#a6722f'
        break
      case 'air':
        cardColor = '#26a4c9'
        cardColorHover = '#32c1e8'
        break
      default:
        cardColor = '#6b6b6b'
        cardColorHover = '#848484'
    }
  } else {
    switch (card.type) {
      case 'spell':
        cardColor = '#5b3089'
        cardColorHover = '#7340ab'
        break
      case 'quickSpell':
        cardColor = '#892a80'
        cardColorHover = '#ab349e'
        break
      case 'ritualArmor':
        cardColor = '#295c8a'
        cardColorHover = '#3273ad'
        break
      case 'field':
        cardColor = '#2a8a53'
        cardColorHover = '#34ad67'
        break
      case 'equipment':
        cardColor = '#8a892a'
        cardColorHover = '#adad34'
        break
      case 'item':
        cardColor = '#8a5c2a'
        cardColorHover = '#ad7334'
        break
    }
  }

  const borderColor = isPlayable ? '#f5d76a' : '#666666'

  const [visualRefreshCounter, setVisualRefreshCounter] = useState(0)

  useEffect(() => {
    if (card.type === 'avatar') {
      const checkPhase = () => {
        setVisualRefreshCounter((prev) => prev + 1)
      }

      const handleAvatarReset = () => {
        if (cardRef.current) {
          cardRef.current.style.transform = 'rotate(0deg)'
        }
        setVisualRefreshCounter((prev) => prev + 1)
      }

      document.addEventListener('gamePhaseChanged', checkPhase)
      document.addEventListener('avatarReset', handleAvatarReset)

      return () => {
        document.removeEventListener('gamePhaseChanged', checkPhase)
        document.removeEventListener('avatarReset', handleAvatarReset)
      }
    }
  }, [card])

  useEffect(() => {
    if (card.type === 'avatar' && cardRef.current) {
      const cardElement = cardRef.current

      if (isTapped) {
        cardElement.style.transform = 'rotate(90deg)'
      } else {
        cardElement.style.transform = 'rotate(0deg)'
      }
    }
  }, [isTapped, visualRefreshCounter, card.name, card.type])

  const handleClick = () => {
    if (isPlayable && isInHand) {
      setShowActions(!showActions)
    } else if (onClick) {
      onClick()
    }
  }

  const handleAction = (action: string) => {
    setShowActions(false)

    if (onAction) {
      const normalizedAction = action === 'spektra' ? 'toSpektra' : action
      onAction(normalizedAction)
    } else {
      switch (action) {
        case 'active':
          toast.success(`${card.name} will be played as active avatar`)
          break
        case 'reserve':
          toast.success(`${card.name} will be played as reserve avatar`)
          break
        case 'spektra':
        case 'toSpektra':
          toast.success(`${card.name} will be used as spektra`)
          break
        case 'play':
          toast.success(`${card.name} will be played to the field`)
          break
      }
    }
  }

  const renderAvatarContent = () => {
    const avatarCard = card as AvatarCard
    return (
      <>
        {avatarCard.skill1 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <div className="bg-red-700 rounded-md px-1 py-0.5 text-[10px] font-bold text-white">
              {avatarCard.skill1.damage}
            </div>
          </div>
        )}

        {((avatarCard.counters?.damage || 0) > 0 ||
          (card as any).damageCounter > 0 ||
          (counters?.damage || 0) > 0) && (
          <div className="absolute top-7 right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md flex items-center justify-center min-w-[20px]">
            {avatarCard.counters?.damage ||
              (card as any).damageCounter ||
              counters?.damage ||
              0}
          </div>
        )}

        {((avatarCard.counters?.damage || 0) > 0 ||
          (card as any).damageCounter > 0 ||
          (counters?.damage || 0) > 0) && (
          <div className="absolute top-12 right-2 bg-green-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md flex items-center justify-center min-w-[20px]">
            {Math.max(
              0,
              avatarCard.health -
                (avatarCard.counters?.damage ||
                  (card as any).damageCounter ||
                  counters?.damage ||
                  0)
            )}
          </div>
        )}

        {(avatarCard.counters?.bleed || 0) > 0 && (
          <div className="absolute top-[68px] right-2 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md flex items-center justify-center min-w-[20px]">
            B{avatarCard.counters?.bleed}
          </div>
        )}

        {(avatarCard.counters?.shield || 0) > 0 && (
          <div className="absolute top-[88px] right-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md flex items-center justify-center min-w-[20px]">
            S{avatarCard.counters?.shield}
          </div>
        )}
      </>
    )
  }

  const renderActionContent = () => {
    return <></>
  }

  const isMythic = card.rarity === 'Mythic'

  // Portal into the app frame so `fixed inset-0` overlays stay inside the
  // phone-frame container (its transform makes it the containing block).
  const portalTarget =
    typeof document !== 'undefined'
      ? document.getElementById('app-frame') ?? document.body
      : null

  return (
    <>
      <div
        ref={cardRef}
        className="relative"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: isTapped ? 'rotate(90deg)' : 'rotate(0deg)',
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease-in-out',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          className={`absolute inset-0 rounded-lg shadow-lg cursor-pointer ${isDragging ? 'scale-105' : 'hover:scale-105'} transition-transform overflow-hidden ${isMythic ? 'card-foil-mythic' : ''}`}
          style={{
            filter: isPlayable ? 'none' : 'brightness(0.5)',
          }}
          onClick={handleClick}
        >
          <div className="absolute inset-0">
            {card.art || card.imagePath ? (
              <img
                src={getFixedCardImagePath(card)}
                alt={card?.name || 'Card'}
                className="h-full w-full object-cover"
                onError={(e) => handleCardImageError(e, card)}
              />
            ) : (
              <div className="h-full w-full bg-gray-800 flex items-center justify-center text-white text-opacity-70 text-xs">
                [Card Art]
              </div>
            )}
          </div>

          {card.type === 'avatar' ? renderAvatarContent() : renderActionContent()}
        </div>
      </div>

      {showActions && isPlayable && isInHand && portalTarget &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999998] flex items-center justify-center bg-black bg-opacity-60"
            onClick={() => setShowActions(false)}
          >
            <div
              className="bg-gray-800 rounded-lg p-4 border-2 border-orange-500 shadow-xl w-[220px]"
              style={{
                zIndex: 9999999,
                boxShadow: '0 0 25px rgba(249, 115, 22, 0.4)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <button
                  className="absolute -right-2 -top-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border border-orange-400"
                  onClick={() => setShowActions(false)}
                >
                  X
                </button>

                <div className="text-orange-400 text-sm font-bold mb-3 text-center border-b border-orange-500 pb-2">
                  {card.name || (card as any).cardId || 'Card'}
                </div>

                <div className="flex flex-col gap-2">
                  {card.type === 'avatar' && (
                    <>
                      <button
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg p-2 text-sm font-bold border border-red-400"
                        onClick={() => handleAction('active')}
                      >
                        Place as Active Avatar
                      </button>
                      <button
                        className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white rounded-lg p-2 text-sm font-bold border border-orange-400"
                        onClick={() => handleAction('reserve')}
                      >
                        Place as Reserve Avatar
                      </button>
                    </>
                  )}

                  {card.type !== 'avatar' && (
                    <button
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white rounded-lg p-2 text-sm font-bold border border-orange-400"
                      onClick={() => handleAction('play')}
                    >
                      Play Card
                    </button>
                  )}

                  <button
                    className="bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg p-2 text-sm font-bold border border-amber-500"
                    onClick={() => handleAction('toSpektra')}
                  >
                    Use as Spektra
                  </button>
                </div>
              </div>
            </div>
          </div>,
          portalTarget
        )}
    </>
  )
}

export const Card2D = React.memo(Card2DInner, (prevProps, nextProps) => {
  if (prevProps.card !== nextProps.card) {
    return false
  }

  const prevCard = prevProps.card as any
  const nextCard = nextProps.card as any
  if (prevCard.counters || nextCard.counters) {
    if (JSON.stringify(prevCard.counters) !== JSON.stringify(nextCard.counters)) {
      return false
    }
  }

  return (
    prevProps.isPlayable === nextProps.isPlayable &&
    prevProps.isInHand === nextProps.isInHand &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.isTapped === nextProps.isTapped &&
    JSON.stringify(prevProps.counters) === JSON.stringify(nextProps.counters)
  )
})

export default Card2D
