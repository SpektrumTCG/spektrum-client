"use client"

import React from 'react'
import { motion } from 'framer-motion'
import type { ElementType } from '@spektrum/shared'

interface CardPlacementEffectProps {
  cardName: string
  element: ElementType
  fromX: number
  fromY: number
  toX: number
  toY: number
  onComplete?: () => void
}

export function CardPlacementEffect({
  cardName,
  element,
  fromX,
  fromY,
  toX,
  toY,
  onComplete,
}: CardPlacementEffectProps) {
  const getElementColor = (elem: ElementType) => {
    switch (elem) {
      case 'fire':
        return { color: '#ff4444', glow: '#ff0000', label: 'F', lightGlow: 'rgba(255, 68, 68, 0.3)' }
      case 'water':
        return { color: '#4488ff', glow: '#0066ff', label: 'W', lightGlow: 'rgba(68, 136, 255, 0.3)' }
      case 'air':
        return { color: '#44ddff', glow: '#00ccff', label: 'A', lightGlow: 'rgba(68, 221, 255, 0.3)' }
      case 'ground':
        return { color: '#ddaa44', glow: '#ff9900', label: 'G', lightGlow: 'rgba(221, 170, 68, 0.3)' }
      default:
        return { color: '#cccccc', glow: '#ffffff', label: '*', lightGlow: 'rgba(204, 204, 204, 0.3)' }
    }
  }

  const elementStyle = getElementColor(element)
  const particleCount = 16

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9999 }}>
      <motion.div
        initial={{ left: fromX, top: fromY, scale: 0.5, opacity: 1, rotateZ: -15 }}
        animate={{ left: toX, top: toY, scale: 1.3, opacity: 1, rotateZ: 0 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        onAnimationComplete={onComplete}
        className="absolute"
        style={{
          width: '140px',
          height: '190px',
          background: `linear-gradient(135deg, ${elementStyle.color}, ${elementStyle.glow})`,
          borderRadius: '14px',
          boxShadow: `0 0 40px ${elementStyle.color}, 0 0 80px ${elementStyle.glow}, inset 0 0 25px rgba(255,255,255,0.3)`,
          border: `4px solid ${elementStyle.glow}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '56px',
          fontWeight: 'bold',
          textShadow: `0 0 15px ${elementStyle.glow}`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {elementStyle.label}
      </motion.div>

      {[...Array(particleCount)].map((_, i) => (
        <motion.div
          key={`trail-${i}`}
          initial={{ left: fromX, top: fromY, opacity: 1, scale: 1 }}
          animate={{ left: toX, top: toY, opacity: 0, scale: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: i * 0.06 }}
          className="absolute rounded-full"
          style={{
            width: '16px',
            height: '16px',
            background: elementStyle.color,
            boxShadow: `0 0 18px ${elementStyle.color}`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {[...Array(14)].map((_, i) => {
        const angle = (i / 14) * Math.PI * 2
        const burstDistance = 100

        return (
          <motion.div
            key={`burst-${i}`}
            initial={{ left: fromX, top: fromY, opacity: 1, scale: 1 }}
            animate={{
              left: fromX + Math.cos(angle) * burstDistance,
              top: fromY + Math.sin(angle) * burstDistance,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 1.0, ease: 'easeOut', delay: 0.1 }}
            className="absolute rounded-full"
            style={{
              width: '14px',
              height: '14px',
              background: elementStyle.color,
              boxShadow: `0 0 20px ${elementStyle.color}`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )
      })}

      <motion.div
        initial={{ left: fromX, top: fromY, scale: 0.5, opacity: 0.9 }}
        animate={{ left: fromX, top: fromY, scale: 3.5, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '140px',
          height: '140px',
          background: `radial-gradient(circle, ${elementStyle.color}, transparent)`,
          filter: 'blur(10px)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <motion.div
        initial={{ left: toX, top: toY, scale: 0, opacity: 0 }}
        animate={{ left: toX, top: toY, scale: 2.5, opacity: 0.7 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.8 }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '180px',
          height: '180px',
          background: `radial-gradient(circle, ${elementStyle.lightGlow}, transparent)`,
          filter: 'blur(18px)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <motion.div
        initial={{ left: fromX, top: fromY - 120, opacity: 1, scale: 1 }}
        animate={{ left: toX, top: toY - 140, opacity: 0, scale: 1.8 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute whitespace-nowrap pointer-events-none font-bold text-xl"
        style={{
          textShadow: `0 0 20px ${elementStyle.color}, 0 0 40px ${elementStyle.glow}`,
          color: elementStyle.color,
          filter: 'drop-shadow(0 0 10px ' + elementStyle.color + ')',
          transform: 'translateX(-50%)',
        }}
      >
        {cardName}
      </motion.div>
    </div>
  )
}

export default CardPlacementEffect
