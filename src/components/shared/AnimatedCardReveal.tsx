"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Card, AvatarCard } from '@spektrum/shared';
import { SafeCardImage } from '@/components/shared/SafeCardImage';

interface BackgroundParticle {
  id: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
}

interface AnimatedCardRevealProps {
  cards: Card[];
  packName: string;
  packImageUrl: string;
  onComplete: () => void;
  isOnChain?: boolean;
}

const RARITY_COLORS: Record<string, { border: string; glow: string; particles: string }> = {
  'mythic': { border: '#FFD700', glow: 'rgba(255, 215, 0, 0.8)', particles: '#FFD700' },
  'super rare': { border: '#A855F7', glow: 'rgba(168, 85, 247, 0.7)', particles: '#A855F7' },
  'rare': { border: '#3B82F6', glow: 'rgba(59, 130, 246, 0.6)', particles: '#3B82F6' },
  'uncommon': { border: '#22C55E', glow: 'rgba(34, 197, 94, 0.5)', particles: '#22C55E' },
  'common': { border: '#9CA3AF', glow: 'rgba(156, 163, 175, 0.4)', particles: '#9CA3AF' },
};

const getRarityConfig = (rarity?: string) => {
  const key = (rarity || 'common').toLowerCase();
  return RARITY_COLORS[key] || RARITY_COLORS['common'];
};

const Particle: React.FC<{ color: string; delay: number; angle: number; distance: number }> = ({
  color, delay, angle, distance
}) => {
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{
        backgroundColor: color,
        left: '50%',
        top: '50%',
        marginLeft: '-4px',
        marginTop: '-4px',
        boxShadow: `0 0 6px ${color}`
      }}
      initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      animate={{ opacity: 0, scale: 0, x, y }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
    />
  );
};

const CardRevealItem: React.FC<{
  card: Card;
  index: number;
  isRevealed: boolean;
  onReveal: () => void;
  autoReveal: boolean;
}> = ({ card, index, isRevealed, onReveal, autoReveal }) => {
  const [showParticles, setShowParticles] = useState(false);
  const rarityConfig = getRarityConfig(card.rarity);
  const isHighRarity = ['mythic', 'super rare', 'rare'].includes((card.rarity || '').toLowerCase());

  useEffect(() => {
    if (autoReveal && !isRevealed) {
      const timer = setTimeout(() => { onReveal(); }, index * 400 + 1500);
      return () => clearTimeout(timer);
    }
  }, [autoReveal, isRevealed, index, onReveal]);

  useEffect(() => {
    if (isRevealed) {
      setShowParticles(true);
      const timer = setTimeout(() => setShowParticles(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isRevealed]);

  const cardImageSrc = (card as AvatarCard).imagePath || card.art || '';

  return (
    <motion.div
      className="relative cursor-pointer"
      initial={{ opacity: 0, y: 100, rotateX: 45 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      onClick={() => !isRevealed && onReveal()}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative w-24 h-36 sm:w-28 sm:h-40 md:w-32 md:h-44"
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card Back */}
        <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
          <img src="/card_back.png" alt="Card Back" className="w-full h-full object-cover" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-orange-500/30 to-transparent"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>

        {/* Card Front */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            border: isRevealed ? `3px solid ${rarityConfig.border}` : 'none',
            boxShadow: isRevealed ? `0 0 30px ${rarityConfig.glow}` : 'none'
          }}
        >
          {cardImageSrc ? (
            <SafeCardImage src={cardImageSrc} alt={card.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex flex-col items-center justify-center p-2">
              <div className="text-xs text-white text-center font-medium">{card.name}</div>
            </div>
          )}

          {/* Rarity Badge */}
          <motion.div
            className="absolute bottom-1 left-1 right-1 bg-black/70 rounded px-1 py-0.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-[10px] text-center font-bold" style={{ color: rarityConfig.border }}>
              {card.rarity || 'Common'}
            </div>
          </motion.div>

          {/* High Rarity Shimmer Effect */}
          {isHighRarity && isRevealed && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(135deg, transparent 0%, ${rarityConfig.glow} 50%, transparent 100%)`,
                backgroundSize: '200% 200%'
              }}
              animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </div>
      </motion.div>

      {/* Particle Explosion */}
      <AnimatePresence>
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: isHighRarity ? 16 : 8 }).map((_, i) => (
              <Particle
                key={i}
                color={rarityConfig.particles}
                delay={i * 0.03}
                angle={(i / (isHighRarity ? 16 : 8)) * Math.PI * 2}
                distance={isHighRarity ? 100 : 60}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Tap to reveal hint */}
      {!isRevealed && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 + 1 }}
        >
          <div className="bg-black/60 rounded-lg px-2 py-1">
            <span className="text-xs text-white">Tap</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export const AnimatedCardReveal: React.FC<AnimatedCardRevealProps> = ({
  cards,
  packName,
  packImageUrl,
  onComplete,
  isOnChain = false,
}) => {
  const [stage, setStage] = useState<'pack' | 'burst' | 'cards' | 'complete'>('pack');
  const [revealedCards, setRevealedCards] = useState<boolean[]>(new Array(cards.length).fill(false));
  const [autoRevealStarted, setAutoRevealStarted] = useState(false);

  const backgroundParticles = useMemo<BackgroundParticle[]>(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 2
    }));
  }, []);

  useEffect(() => {
    const packTimer = setTimeout(() => setStage('burst'), 1200);
    return () => clearTimeout(packTimer);
  }, []);

  useEffect(() => {
    if (stage === 'burst') {
      const burstTimer = setTimeout(() => setStage('cards'), 600);
      return () => clearTimeout(burstTimer);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'cards') {
      const autoRevealTimer = setTimeout(() => setAutoRevealStarted(true), 500);
      return () => clearTimeout(autoRevealTimer);
    }
  }, [stage]);

  useEffect(() => {
    if (revealedCards.every(r => r) && stage === 'cards') {
      const completeTimer = setTimeout(() => setStage('complete'), 1000);
      return () => clearTimeout(completeTimer);
    }
  }, [revealedCards, stage]);

  const handleRevealCard = useCallback((index: number) => {
    setRevealedCards(prev => {
      const newRevealed = [...prev];
      newRevealed[index] = true;
      return newRevealed;
    });
  }, []);

  const handleRevealAll = useCallback(() => {
    setRevealedCards(new Array(cards.length).fill(true));
  }, [cards.length]);

  const allRevealed = revealedCards.every(r => r);

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 50% 50%, #1a0a00 0%, #000 100%)' }}
        />
        {backgroundParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-orange-500/30 rounded-full"
            style={{ left: `${particle.left}%`, top: `${particle.top}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: particle.duration, repeat: Infinity, delay: particle.delay }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <AnimatePresence mode="wait">
          {stage === 'pack' && (
            <motion.div
              key="pack"
              className="flex flex-col items-center"
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="relative"
                animate={{ rotateY: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <img src={packImageUrl} alt={packName} className="w-48 h-64 object-contain drop-shadow-2xl" />
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,165,0,0.4) 50%, transparent 70%)',
                    backgroundSize: '200% 200%'
                  }}
                  animate={{ backgroundPosition: ['0% 0%', '200% 200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
              <motion.p
                className="text-orange-400 text-xl font-bold mt-6"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Opening {packName}...
              </motion.p>
            </motion.div>
          )}

          {stage === 'burst' && (
            <motion.div
              key="burst"
              className="relative"
              initial={{ scale: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-48 h-48 rounded-full bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600" />
              {Array.from({ length: 24 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 bg-orange-400 rounded-full"
                  style={{ left: '50%', top: '50%', marginLeft: '-8px', marginTop: '-8px' }}
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{
                    x: Math.cos((i / 24) * Math.PI * 2) * 200,
                    y: Math.sin((i / 24) * Math.PI * 2) * 200,
                    scale: 0,
                    opacity: 0
                  }}
                  transition={{ duration: 0.5, delay: i * 0.02 }}
                />
              ))}
            </motion.div>
          )}

          {(stage === 'cards' || stage === 'complete') && (
            <motion.div
              key="cards"
              className="flex flex-col items-center w-full max-w-4xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.h2
                className="text-2xl sm:text-3xl font-bold text-orange-400 mb-4 text-center"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                {allRevealed ? 'Your Cards!' : 'Tap to Reveal!'}
              </motion.h2>

              {isOnChain && (
                <motion.div
                  className="flex items-center gap-1.5 bg-purple-900/60 border border-purple-500/50 rounded-full px-3 py-1 mb-5"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-purple-300 text-xs">Ephemeral Rollup</span>
                </motion.div>
              )}

              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8">
                {cards.map((card, index) => (
                  <CardRevealItem
                    key={`${card.id}-${index}`}
                    card={card}
                    index={index}
                    isRevealed={revealedCards[index]}
                    onReveal={() => handleRevealCard(index)}
                    autoReveal={autoRevealStarted}
                  />
                ))}
              </div>

              <div className="flex gap-4">
                {!allRevealed && (
                  <motion.button
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRevealAll}
                  >
                    Reveal All
                  </motion.button>
                )}

                {stage === 'complete' && (
                  <motion.button
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onComplete}
                  >
                    Continue
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimatedCardReveal;
