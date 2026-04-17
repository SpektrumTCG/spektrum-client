"use client"

import React from 'react'
import { motion } from 'framer-motion'

interface CardDrawEffectProps {
  fromX: number
  fromY: number
  toX: number
  toY: number
  onComplete?: () => void
}

export function CardDrawEffect({ fromX, fromY, toX, toY, onComplete }: CardDrawEffectProps) {
  const particleCount = 12

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9999 }}>
      <motion.div
        initial={{ left: fromX, top: fromY, scale: 0.6, opacity: 1, rotateZ: -10 }}
        animate={{ left: toX, top: toY, scale: 1.2, opacity: 1, rotateZ: 0 }}
        transition={{ duration: 1.0, ease: 'easeOut' }}
        onAnimationComplete={onComplete}
        className="absolute"
        style={{
          width: '100px',
          height: '140px',
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          borderRadius: '10px',
          boxShadow: '0 0 30px #f97316, 0 0 60px #ea580c, 0 0 90px #f97316',
          border: '3px solid #fdba74',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
          fontWeight: 'bold',
          textShadow: '0 0 15px #f97316',
          transform: 'translate(-50%, -50%)',
        }}
      >
        *
      </motion.div>

      {[...Array(particleCount)].map((_, i) => (
        <motion.div
          key={`draw-trail-${i}`}
          initial={{ left: fromX, top: fromY, opacity: 1, scale: 1 }}
          animate={{ left: toX, top: toY, opacity: 0, scale: 0 }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: i * 0.05 }}
          className="absolute rounded-full"
          style={{
            width: '12px',
            height: '12px',
            background: '#fdba74',
            boxShadow: '0 0 15px #f97316',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {[...Array(10)].map((_, i) => {
        const angle = (i / 10) * Math.PI * 2
        const burstDistance = 80

        return (
          <motion.div
            key={`draw-burst-${i}`}
            initial={{ left: fromX, top: fromY, opacity: 1, scale: 1 }}
            animate={{
              left: fromX + Math.cos(angle) * burstDistance,
              top: fromY + Math.sin(angle) * burstDistance,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            className="absolute rounded-full"
            style={{
              width: '10px',
              height: '10px',
              background: '#f97316',
              boxShadow: '0 0 15px #f97316',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )
      })}

      <motion.div
        initial={{ left: fromX, top: fromY, scale: 0.8, opacity: 0.8 }}
        animate={{ left: fromX, top: fromY, scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, #f97316, transparent)',
          filter: 'blur(10px)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <motion.div
        initial={{ left: toX, top: toY, scale: 0, opacity: 0 }}
        animate={{ left: toX, top: toY, scale: 2, opacity: 0.6 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.5), transparent)',
          filter: 'blur(15px)',
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  )
}

export default CardDrawEffect
