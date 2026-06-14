"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RARITY_BORDER, RARITY_GLOW, type PackCard } from './rarityStyles';
import { advanceReveal, createRevealState, type RevealState } from './revealLogic';

interface CardRevealStackProps {
  cards: PackCard[];
  onComplete: () => void;
}

function CardFace({ card }: { card: PackCard }) {
  const src = card.art || card.imagePath;
  return src ? (
    <img src={src} alt={card.name} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full bg-gray-800 flex items-center justify-center px-1">
      <span className="text-[10px] text-gray-300 leading-tight text-center">{card.name}</span>
    </div>
  );
}

/**
 * TCG-Pocket-style reveal: tap the top card to flip it, tap again to slide it
 * into the mini-row above. Revealed cards fan into a summary grid at the end.
 * Content-only — the parent provides the fullscreen backdrop.
 */
export function CardRevealStack({ cards, onComplete }: CardRevealStackProps) {
  const [state, setState] = useState<RevealState>(() => createRevealState(cards.length));

  // Cards are shown face-up — one tap goes straight to 'aside'
  // (advanceReveal is two-step back→flipped→aside, so compose it twice).
  const handleAdvance = () => setState((s) => advanceReveal(advanceReveal(s)));

  if (state.done) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-6 h-full w-full max-w-sm mx-auto cursor-pointer"
        onClick={onComplete}
      >
        <motion.h2
          className="text-2xl sm:text-3xl font-bold text-white tracking-wide"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Cards Revealed!
        </motion.h2>
        <div className="mx-auto flex max-w-[19rem] flex-wrap justify-center gap-2">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              layoutId={`reveal-card-${i}`}
              className="relative w-24 h-32 rounded-lg overflow-hidden border-2 shadow-xl"
              style={{
                borderColor: RARITY_BORDER[card.rarity ?? 'Common'] ?? RARITY_BORDER.Common,
                boxShadow: RARITY_GLOW[card.rarity ?? 'Common'] ?? 'none',
              }}
            >
              <CardFace card={card} />
            </motion.div>
          ))}
        </div>
        <p className="text-sm text-orange-300 animate-pulse">Tap to continue</p>
      </div>
    );
  }

  const topIndex = state.current;

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full max-w-sm mx-auto">
      {/* mini-row: already-revealed cards */}
      <div className="absolute top-4 inset-x-0 flex justify-center gap-1.5">
        {cards.map((card, i) =>
          state.phases[i] === 'aside' ? (
            <motion.div
              key={i}
              layoutId={`reveal-card-${i}`}
              className="w-10 h-14 rounded overflow-hidden border shadow-md"
              style={{ borderColor: RARITY_BORDER[card.rarity ?? 'Common'] ?? RARITY_BORDER.Common }}
            >
              <CardFace card={card} />
            </motion.div>
          ) : null
        )}
      </div>

      {/* stack — cards are face-up; a tap slides the top card into the mini-row */}
      <div className="relative w-72 h-[25.2rem]">
        {cards.map((card, i) => {
          if (state.phases[i] === 'aside') return null;
          const depth = i - topIndex; // 0 = top card
          const isTop = i === topIndex;
          return (
            <motion.div
              key={i}
              layoutId={`reveal-card-${i}`}
              className={`absolute inset-0 rounded-lg overflow-hidden shadow-xl border-2 ${isTop ? 'cursor-pointer' : ''}`}
              style={{
                zIndex: cards.length - i,
                borderColor: RARITY_BORDER[card.rarity ?? 'Common'] ?? RARITY_BORDER.Common,
                boxShadow: isTop ? RARITY_GLOW[card.rarity ?? 'Common'] ?? 'none' : 'none',
              }}
              animate={{ rotate: depth * 2, y: depth * 4 }}
              onClick={isTop ? handleAdvance : undefined}
            >
              <CardFace card={card} />
            </motion.div>
          );
        })}
      </div>

      <p className="absolute bottom-6 inset-x-0 text-center text-orange-300 text-sm animate-pulse pointer-events-none">
        Tap the card for the next one
      </p>
    </div>
  );
}
