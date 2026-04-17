"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ElementType } from '@/domain/game/types'
import { useAudio } from '@/stores/useAudioStore'
import type { EffectType } from '@/features/game/stores/useSpellEffectsStore'

export type { EffectType }

interface SpellEffectAnimationProps {
  type: EffectType
  element?: ElementType
  position: { x: number; y: number }
  onComplete?: () => void
  value?: number
}

export function SpellEffectAnimation({
  type,
  element = 'neutral',
  position,
  onComplete,
  value,
}: SpellEffectAnimationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; angle: number }>>([])

  const playHit = useAudio((state) => state.playHit)
  const playSuccess = useAudio((state) => state.playSuccess)
  const playSpell = useAudio((state) => state.playSpell)

  useEffect(() => {
    const particleCount = type === 'damage' ? 12 : type === 'heal' ? 8 : 6
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: 0,
      y: 0,
      angle: (Math.PI * 2 * i) / particleCount,
    }))
    setParticles(newParticles)

    switch (type) {
      case 'damage':
        playHit()
        break
      case 'heal':
        playSuccess()
        break
      case 'buff':
      case 'debuff':
      case 'shield':
      case 'stun':
        playSpell()
        break
      default:
        break
    }

    const timer = setTimeout(() => {
      onComplete?.()
    }, 800)

    return () => clearTimeout(timer)
  }, [type, onComplete, playHit, playSuccess, playSpell])

  const getColors = () => {
    switch (element) {
      case 'fire':
        return { primary: '#ff4500', secondary: '#ff8c00', glow: '#ffaa00' }
      case 'water':
        return { primary: '#1e90ff', secondary: '#87ceeb', glow: '#00bfff' }
      case 'ground':
        return { primary: '#8b4513', secondary: '#d2691e', glow: '#cd853f' }
      case 'air':
        return { primary: '#e0e0e0', secondary: '#f0f0f0', glow: '#ffffff' }
      default:
        return { primary: '#9333ea', secondary: '#c084fc', glow: '#e9d5ff' }
    }
  }

  const getEffectColors = () => {
    switch (type) {
      case 'damage':
        return getColors()
      case 'heal':
        return { primary: '#10b981', secondary: '#34d399', glow: '#6ee7b7' }
      case 'buff':
        return { primary: '#3b82f6', secondary: '#60a5fa', glow: '#93c5fd' }
      case 'debuff':
        return { primary: '#ef4444', secondary: '#f87171', glow: '#fca5a5' }
      case 'shield':
        return { primary: '#06b6d4', secondary: '#22d3ee', glow: '#67e8f9' }
      case 'stun':
        return { primary: '#fbbf24', secondary: '#fcd34d', glow: '#fde68a' }
      case 'draw':
        return { primary: '#8b5cf6', secondary: '#a78bfa', glow: '#c4b5fd' }
      case 'discard':
        return { primary: '#64748b', secondary: '#94a3b8', glow: '#cbd5e1' }
      default:
        return { primary: '#9333ea', secondary: '#c084fc', glow: '#e9d5ff' }
    }
  }

  const colors = getEffectColors()

  const renderDamageEffect = () => (
    <>
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '80px',
          height: '80px',
          background: `radial-gradient(circle, ${colors.primary}, ${colors.secondary} 50%, transparent 70%)`,
          filter: 'blur(2px)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />

      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: '12px',
            height: '12px',
            background: colors.primary,
            boxShadow: `0 0 10px ${colors.glow}`,
            left: '50%',
            top: '50%',
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(particle.angle) * 60,
            y: Math.sin(particle.angle) * 60,
            opacity: 0,
            scale: 0.3,
          }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      ))}

      {value !== undefined && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-4xl"
          style={{
            color: colors.primary,
            textShadow: `0 0 10px ${colors.glow}, 0 0 20px ${colors.glow}`,
          }}
          initial={{ y: 0, opacity: 0, scale: 0.5 }}
          animate={{ y: -40, opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.2, 0.8] }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          -{value}
        </motion.div>
      )}

      <motion.div
        className="absolute rounded-full border-4"
        style={{
          width: '60px',
          height: '60px',
          borderColor: colors.primary,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0.5, opacity: 1 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </>
  )

  const renderHealEffect = () => (
    <>
      {particles.map((particle, i) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: '8px',
            height: '8px',
            background: colors.primary,
            boxShadow: `0 0 8px ${colors.glow}`,
            left: `${50 + (Math.random() - 0.5) * 40}%`,
            top: '50%',
          }}
          initial={{ y: 0, opacity: 0, scale: 0 }}
          animate={{
            y: -80 - Math.random() * 40,
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
          }}
          transition={{ duration: 1.2, delay: i * 0.05, ease: 'easeOut' }}
        />
      ))}

      {value !== undefined && (
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-4xl"
          style={{
            color: colors.primary,
            textShadow: `0 0 10px ${colors.glow}`,
          }}
          initial={{ y: 0, opacity: 0, scale: 0.5 }}
          animate={{ y: -40, opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.2, 0.8] }}
          transition={{ duration: 0.8 }}
        >
          +{value}
        </motion.div>
      )}

      <motion.div
        className="absolute rounded-full"
        style={{
          width: '100px',
          height: '100px',
          background: `radial-gradient(circle, ${colors.secondary}40, transparent 70%)`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 2, opacity: [0, 0.6, 0] }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
    </>
  )

  const renderBuffEffect = () => (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            width: '80px',
            height: '80px',
            borderColor: colors.primary,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ scale: 0.5, y: 0, opacity: 0 }}
          animate={{ scale: 2, y: -60, opacity: [0, 0.8, 0] }}
          transition={{ duration: 1, delay: i * 0.2, ease: 'easeOut' }}
        />
      ))}

      {particles.slice(0, 6).map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: '6px',
            height: '6px',
            background: colors.glow,
            boxShadow: `0 0 6px ${colors.primary}`,
            left: '50%',
            top: '50%',
          }}
          initial={{ rotate: 0 }}
          animate={{
            rotate: 360,
            x: Math.cos(particle.angle) * 40,
            y: Math.sin(particle.angle) * 40,
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      ))}
    </>
  )

  const renderDebuffEffect = () => (
    <>
      {particles.map((particle, i) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: '10px',
            height: '10px',
            background: colors.primary,
            boxShadow: `0 0 8px ${colors.secondary}`,
            left: '50%',
            top: '50%',
          }}
          initial={{ rotate: 0, x: 0, y: 0, opacity: 0 }}
          animate={{
            rotate: -180,
            x: Math.cos(particle.angle) * 50,
            y: Math.sin(particle.angle) * 50,
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeInOut' }}
        />
      ))}

      <motion.div
        className="absolute rounded-full"
        style={{
          width: '90px',
          height: '90px',
          background: `radial-gradient(circle, ${colors.primary}60, transparent 60%)`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 1, opacity: 0 }}
        animate={{ scale: [1, 1.3, 1], opacity: [0, 0.7, 0] }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
    </>
  )

  const renderEffect = () => {
    switch (type) {
      case 'damage':
        return renderDamageEffect()
      case 'heal':
        return renderHealEffect()
      case 'buff':
        return renderBuffEffect()
      case 'debuff':
        return renderDebuffEffect()
      case 'shield':
        return renderBuffEffect()
      case 'stun':
        return renderDebuffEffect()
      default:
        return renderDamageEffect()
    }
  }

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '200px',
        height: '200px',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {renderEffect()}
    </div>
  )
}

export default SpellEffectAnimation
