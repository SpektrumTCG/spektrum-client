"use client"

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type RarityType = 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Mythic';

interface PackCard {
  name: string;
  art?: string;
  imagePath?: string;
  rarity?: RarityType;
}

interface SpektrumPackOpenerProps {
  packImageUrl: string;
  packName: string;
  cards: PackCard[];
  onAnimationComplete: () => void;
}

type Stage = 'opening' | 'tearing' | 'revealing' | 'flipping' | 'complete';

const RARITY_GLOW: Record<string, string> = {
  Mythic:       '0 0 28px 6px rgba(255,215,0,0.85)',
  'Super Rare': '0 0 22px 4px rgba(168,85,247,0.75)',
  Rare:         '0 0 18px 3px rgba(59,130,246,0.65)',
  Uncommon:     '0 0 14px 2px rgba(34,197,94,0.55)',
  Common:       'none',
};

const RARITY_BORDER: Record<string, string> = {
  Mythic:       '#FFD700',
  'Super Rare': '#A855F7',
  Rare:         '#3B82F6',
  Uncommon:     '#22C55E',
  Common:       '#6B7280',
};

export const SpektrumPackOpener: React.FC<SpektrumPackOpenerProps> = ({
  packImageUrl,
  packName,
  cards,
  onAnimationComplete,
}) => {
  const [stage, setStage] = useState<Stage>('opening');
  const [flippedCards, setFlippedCards] = useState<boolean[]>(new Array(cards.length).fill(false));

  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const angle = -90 + (i - 5.5) * 18;
        const dist = 70 + Math.floor(Math.random() * 80);
        return {
          left: `${(i / 11) * 100}%`,
          dx: Math.cos((angle * Math.PI) / 180) * dist,
          dy: Math.sin((angle * Math.PI) / 180) * dist,
          delay: i * 0.03,
        };
      }),
    []
  );

  useEffect(() => {
    const t1 = setTimeout(() => setStage('tearing'), 600);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (stage !== 'tearing') return;
    const t2 = setTimeout(() => setStage('revealing'), 700);
    return () => clearTimeout(t2);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'revealing') return;
    const t3 = setTimeout(() => setStage('flipping'), 900);
    return () => clearTimeout(t3);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'flipping') return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    cards.forEach((_, index) => {
      const t = setTimeout(() => {
        setFlippedCards(prev => {
          const next = [...prev];
          next[index] = true;
          return next;
        });
        if (index === cards.length - 1) {
          const tComplete = setTimeout(() => setStage('complete'), 600);
          timers.push(tComplete);
        }
      }, index * 150);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, [stage, cards.length]);

  useEffect(() => {
    if (stage !== 'complete') return;
    const t = setTimeout(onAnimationComplete, 600);
    return () => clearTimeout(t);
  }, [stage, onAnimationComplete]);

  const packW = 'w-36 sm:w-44';
  const packH = 'h-48 sm:h-56';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-4 overflow-hidden">
      <div className="relative flex flex-col items-center w-full max-w-3xl">

        {stage === 'opening' && (
          <div className="relative flex items-center justify-center">
            <motion.div
              className="absolute rounded-full"
              style={{ width: 220, height: 280, background: 'radial-gradient(circle, rgba(251,146,60,0.35) 0%, transparent 70%)' }}
              animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.img
              src={packImageUrl}
              alt={packName}
              className={`${packW} ${packH} object-contain rounded-lg shadow-2xl relative z-10`}
              animate={{ rotate: [0, -4, 4, -3, 3, -1, 0], scale: [1, 1.06, 1] }}
              transition={{ duration: 0.55, ease: 'easeInOut' }}
            />
          </div>
        )}

        {stage === 'tearing' && (
          <div className={`relative ${packW} ${packH}`}>
            <div className="absolute inset-0 flex items-end justify-center pb-2" style={{ zIndex: 2 }}>
              <div className="flex justify-center gap-1">
                {cards.map((_, i) => (
                  <div key={i} className="w-10 h-14 rounded shadow-lg overflow-hidden">
                    <img src="/card_back.png" alt="Card" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              className={`absolute inset-0 ${packW} ${packH} overflow-hidden`}
              style={{ clipPath: 'polygon(0 25%, 100% 15%, 100% 100%, 0 100%)', zIndex: 8 }}
              animate={{ y: 90, opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeIn' }}
            >
              <img src={packImageUrl} alt={packName} className="w-full h-full object-contain" />
            </motion.div>

            <motion.div
              className={`absolute inset-0 ${packW} ${packH} overflow-hidden`}
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 15%, 0 25%)', zIndex: 9 }}
              animate={{ y: -280, x: 160, rotate: 28, opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeIn' }}
            >
              <img src={packImageUrl} alt={packName} className="w-full h-full object-contain" />
            </motion.div>

            <div className="absolute inset-0" style={{ zIndex: 20 }}>
              {particles.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-yellow-400"
                  style={{ left: p.left, top: '22%', marginLeft: -4, marginTop: -4 }}
                  initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5, delay: p.delay, ease: 'easeOut' }}
                />
              ))}
            </div>
          </div>
        )}

        {(stage === 'revealing' || stage === 'flipping' || stage === 'complete') && (
          <div className="flex flex-col items-center gap-6 w-full">
            <motion.h2
              className="text-2xl sm:text-3xl font-bold text-white tracking-wide"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              Your Cards!
            </motion.h2>

            <div className="flex justify-center flex-wrap gap-2 sm:gap-3">
              {cards.map((card, i) => (
                <div
                  key={i}
                  className="relative w-20 h-28 sm:w-24 sm:h-32"
                  style={{ perspective: 1000 }}
                >
                  {flippedCards[i] && (
                    <motion.div
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      style={{ zIndex: 2 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className="absolute inset-0 rounded-lg border-2"
                        style={{
                          borderColor: RARITY_BORDER[card.rarity ?? 'Common'] ?? RARITY_BORDER.Common,
                          boxShadow: RARITY_GLOW[card.rarity ?? 'Common'] ?? 'none',
                        }}
                      />
                    </motion.div>
                  )}

                  <motion.div
                    className="w-full h-full"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.12, duration: 0.5, ease: 'easeOut' }}
                    style={{ position: 'relative', transformStyle: 'preserve-3d' }}
                  >
                    <motion.div
                      className="w-full h-full"
                      style={{ transformStyle: 'preserve-3d', position: 'relative' }}
                      animate={{ rotateY: flippedCards[i] ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                    >
                      <div
                        className="absolute inset-0 rounded-lg overflow-hidden shadow-xl"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <img src="/card_back.png" alt="Card Back" className="w-full h-full object-cover" />
                      </div>

                      <div
                        className="absolute inset-0 rounded-lg overflow-hidden shadow-xl bg-gray-800 border border-gray-600 flex items-center justify-center"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      >
                        {card.art || card.imagePath ? (
                          <img
                            src={card.art || card.imagePath}
                            alt={card.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center px-1">
                            <div className="text-[10px] text-gray-300 leading-tight">{card.name}</div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {stage === 'complete' && (
                <motion.p
                  className="text-xl sm:text-2xl font-bold text-orange-400 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  Cards Revealed!
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpektrumPackOpener;
