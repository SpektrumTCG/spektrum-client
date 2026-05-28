"use client"

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ElementType } from '@spektrum/shared'
import { SafeCardImage } from '@/components/shared/SafeCardImage'
import { getFixedCardImagePath } from '@/lib/cardImageFixer'

interface CardActivationPauseProps {
  card: any
  actionName: string
  duration?: number
  onComplete: () => void
  onQuickSpellResponse?: () => void
  isPlayerAction: boolean
}

export function CardActivationPause({
  card,
  actionName,
  duration = 3000,
  onComplete,
  onQuickSpellResponse,
  isPlayerAction,
}: CardActivationPauseProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration)
  const [isPaused, setIsPaused] = useState(false)

  const getElementColors = useCallback((element: ElementType) => {
    switch (element) {
      case 'fire':
        return { primary: '#ff4444', secondary: '#ff8800', glow: 'rgba(255, 68, 68, 0.6)' }
      case 'water':
        return { primary: '#4488ff', secondary: '#00ccff', glow: 'rgba(68, 136, 255, 0.6)' }
      case 'air':
        return { primary: '#44ddff', secondary: '#88ffff', glow: 'rgba(68, 221, 255, 0.6)' }
      case 'ground':
        return { primary: '#ddaa44', secondary: '#ffcc00', glow: 'rgba(221, 170, 68, 0.6)' }
      default:
        return { primary: '#9966ff', secondary: '#cc99ff', glow: 'rgba(153, 102, 255, 0.6)' }
    }
  }, [])

  const colors = getElementColors(card.element)
  const progressPercent = (timeRemaining / duration) * 100

  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        angle: (i / 16) * Math.PI * 2,
        delay: i * 0.1,
        size: 4 + Math.random() * 4,
      })),
    []
  )

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 100) {
          clearInterval(interval)
          onComplete()
          return 0
        }
        return prev - 100
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPaused, onComplete])

  const handleQuickSpellClick = () => {
    setIsPaused(true)
    onQuickSpellResponse?.()
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => {}} />

        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ scale: 0.5, y: 100, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.5, y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25, duration: 0.5 }}
        >
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '280px',
              height: '280px',
              background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
              filter: 'blur(40px)',
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: colors.primary,
                boxShadow: `0 0 ${particle.size * 2}px ${colors.primary}`,
              }}
              animate={{
                x: [
                  Math.cos(particle.angle) * 90,
                  Math.cos(particle.angle + 0.5) * 110,
                  Math.cos(particle.angle) * 90,
                ],
                y: [
                  Math.sin(particle.angle) * 90,
                  Math.sin(particle.angle + 0.5) * 110,
                  Math.sin(particle.angle) * 90,
                ],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: particle.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          <motion.div
            className="text-center mb-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-white text-sm sm:text-lg font-bold uppercase tracking-wider mb-1">
              {isPlayerAction ? 'You activate' : 'Opponent activates'}
            </div>
            <div
              className="text-xl sm:text-2xl font-bold"
              style={{
                color: colors.primary,
                textShadow: `0 0 20px ${colors.primary}, 0 0 40px ${colors.secondary}`,
              }}
            >
              {actionName}
            </div>
          </motion.div>

          <motion.div
            className="relative"
            animate={{
              boxShadow: [
                `0 0 30px ${colors.primary}, 0 0 60px ${colors.secondary}`,
                `0 0 50px ${colors.primary}, 0 0 100px ${colors.secondary}`,
                `0 0 30px ${colors.primary}, 0 0 60px ${colors.secondary}`,
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ borderRadius: '12px', border: `3px solid ${colors.primary}` }}
          >
            <div
              className="w-36 h-48 sm:w-48 sm:h-64 rounded-lg overflow-hidden bg-gray-900"
              style={{ boxShadow: `inset 0 0 30px ${colors.glow}` }}
            >
              {card.art || card.imagePath ? (
                <SafeCardImage
                  src={getFixedCardImagePath(card)}
                  alt={card.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-4xl font-bold"
                  style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                >
                  {card.element === 'fire'
                    ? 'F'
                    : card.element === 'water'
                    ? 'W'
                    : card.element === 'air'
                    ? 'A'
                    : card.element === 'ground'
                    ? 'G'
                    : '*'}
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 text-center">
              <div className="text-white font-bold text-sm truncate">{card.name}</div>
            </div>
          </motion.div>

          <div className="mt-6 w-64">
            <div className="flex justify-between text-sm text-white mb-1">
              <span>Response Window</span>
              <span>{(timeRemaining / 1000).toFixed(1)}s</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                  boxShadow: `0 0 10px ${colors.primary}`,
                }}
                initial={{ width: '100%' }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {!isPlayerAction && onQuickSpellResponse && (
            <motion.button
              className="mt-4 px-6 py-3 rounded-lg font-bold text-white uppercase tracking-wider"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 0 20px ${colors.glow}`,
              }}
              whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${colors.glow}` }}
              whileTap={{ scale: 0.95 }}
              onClick={handleQuickSpellClick}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Play Quick Spell
            </motion.button>
          )}

          {isPlayerAction && (
            <motion.div
              className="mt-4 text-gray-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Waiting for opponent response...
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CardActivationPause
