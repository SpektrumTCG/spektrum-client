"use client"

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TutorialTourProps {
  stepIndex: number
  total: number
  phase: string
  title: string
  instruction: string
  /** id of the element the popover should point at (first spotlit zone). */
  anchorId?: string
  /** ids of every spotlit zone this step — popover is placed clear of them all. */
  spotlitIds?: string[]
  /** hide the tour (e.g. during the opponent's animated turn). */
  hidden?: boolean
  onExit: () => void
}

interface Pos {
  top: number
  left: number
  arrowX: number
  place: 'top' | 'bottom' | 'center'
}

const RESERVE_TOP = 60 // header
const RESERVE_BOTTOM = 72 // nav bar

/** Framer-motion "tour" coach popover. Anchors to the currently spotlit zone,
 *  scrolls it into view and points at it with an arrow. Replaces the old static
 *  instruction banner; steps still advance through gameplay, so there is no
 *  Next button — only Skip. Coordinates are computed relative to #app-frame,
 *  which is the containing block for fixed children (transform-gpu). */
export function TutorialTour({
  stepIndex,
  total,
  phase,
  title,
  instruction,
  anchorId,
  spotlitIds,
  hidden,
  onExit,
}: TutorialTourProps) {
  const popRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<Pos | null>(null)

  const measure = useCallback(() => {
    const frame = document.getElementById('app-frame')
    const pop = popRef.current
    if (!frame || !pop) return

    const fRect = frame.getBoundingClientRect()
    const pw = pop.offsetWidth
    const ph = pop.offsetHeight

    const ids = spotlitIds?.length ? spotlitIds : anchorId ? [anchorId] : []
    const rects = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)
      .map((el) => el.getBoundingClientRect())

    if (!rects.length) {
      setPos({
        top: Math.max(RESERVE_TOP, fRect.height - ph - RESERVE_BOTTOM - 16),
        left: (fRect.width - pw) / 2,
        arrowX: -1,
        place: 'center',
      })
      return
    }

    // Keep the popover clear of EVERY spotlit zone (a step can need both a hand
    // card and a board zone), so it never blocks the cards you must click.
    const unionTop = Math.min(...rects.map((r) => r.top)) - fRect.top
    const unionBottom = Math.max(...rects.map((r) => r.bottom)) - fRect.top
    const first = rects[0]
    const aTop = first.top - fRect.top
    const aBottom = first.bottom - fRect.top
    const aCenterX = first.left - fRect.left + first.width / 2
    const margin = 12

    const spaceAbove = unionTop - RESERVE_TOP
    const spaceBelow = fRect.height - RESERVE_BOTTOM - unionBottom

    let top: number
    if (spaceAbove >= ph + margin) {
      top = unionTop - ph - margin
    } else if (spaceBelow >= ph + margin) {
      top = unionBottom + margin
    } else {
      // No clear gap — dock under the header (above the hand, the usual target).
      top = RESERVE_TOP
    }
    top = Math.max(RESERVE_TOP, Math.min(top, fRect.height - ph - RESERVE_BOTTOM))

    let left = aCenterX - pw / 2
    left = Math.max(8, Math.min(left, fRect.width - pw - 8))

    let place: 'top' | 'bottom' | 'center'
    if (top + ph <= aTop + 1) place = 'top'
    else if (top >= aBottom - 1) place = 'bottom'
    else place = 'center'
    const arrowX = place === 'center' ? -1 : Math.max(14, Math.min(aCenterX - left, pw - 14))

    setPos({ top, left, arrowX, place })
  }, [anchorId, spotlitIds])

  // On step change: bring the anchor into view, then measure (also after the
  // smooth-scroll settles).
  useEffect(() => {
    if (hidden) return
    const anchor = anchorId ? document.getElementById(anchorId) : null
    anchor?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    const raf = requestAnimationFrame(measure)
    const t = setTimeout(measure, 350)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
    }
  }, [anchorId, stepIndex, hidden, measure])

  useLayoutEffect(() => {
    measure()
  }, [measure, title, instruction])

  // Keep the popover glued to its anchor while the board scrolls / resizes.
  // capture:true catches scrolls from the inner overflow container too.
  useEffect(() => {
    if (hidden) return
    const h = () => measure()
    window.addEventListener('scroll', h, true)
    window.addEventListener('resize', h)
    return () => {
      window.removeEventListener('scroll', h, true)
      window.removeEventListener('resize', h)
    }
  }, [measure, hidden])

  if (hidden) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepIndex}
        ref={popRef}
        className="fixed z-[55] w-[min(300px,calc(100%-16px))] pointer-events-auto"
        style={{
          top: pos?.top ?? RESERVE_TOP,
          left: pos?.left ?? 8,
          visibility: pos ? 'visible' : 'hidden',
        }}
        initial={{ opacity: 0, scale: 0.92, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -6 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      >
        {pos && pos.place !== 'center' && pos.arrowX >= 0 && (
          <div
            className="absolute w-3 h-3 bg-gray-900 border-orange-500 rotate-45"
            style={{
              left: pos.arrowX - 6,
              [pos.place === 'bottom' ? 'top' : 'bottom']: -6,
              borderTopWidth: pos.place === 'bottom' ? 1 : 0,
              borderLeftWidth: pos.place === 'bottom' ? 1 : 0,
              borderBottomWidth: pos.place === 'top' ? 1 : 0,
              borderRightWidth: pos.place === 'top' ? 1 : 0,
            }}
          />
        )}

        <div
          className="bg-gray-900 border border-orange-500 rounded-xl p-3 shadow-xl"
          style={{ boxShadow: '0 0 25px rgba(249,115,22,0.3)' }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              {phase}
            </span>
            <span className="text-[10px] text-gray-400">
              {stepIndex + 1}/{total}
            </span>
          </div>
          <h4 className="text-sm font-bold text-orange-300 mb-1">{title}</h4>
          <p className="text-[11px] text-orange-100/90 leading-relaxed">{instruction}</p>
          <div className="flex items-center gap-1 mt-2.5">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === stepIndex
                    ? 'w-4 bg-orange-400'
                    : i < stepIndex
                      ? 'w-1.5 bg-orange-600'
                      : 'w-1.5 bg-gray-700'
                }`}
              />
            ))}
            <button
              onClick={onExit}
              className="ml-auto text-[10px] text-gray-500 hover:text-gray-300"
            >
              Skip ✕
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
