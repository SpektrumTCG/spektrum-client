"use client"

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CardRevealStack } from './CardRevealStack';
import { type PackCard } from './rarityStyles';

export type { PackCard };

export type Stage = 'opening' | 'tearing' | 'reveal';

interface SpektrumPackOpenerProps {
  packImageUrl: string;
  packName: string;
  cards: PackCard[];
  onAnimationComplete: () => void;
}

export const SpektrumPackOpener: React.FC<SpektrumPackOpenerProps> = ({
  packImageUrl,
  packName,
  cards,
  onAnimationComplete,
}) => {
  const [stage, setStage] = useState<Stage>('opening');

  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const angle = -90 + (i - 5.5) * 18;
        const dist = 70 + ((i * 37) % 80); // deterministic scatter, lint-clean (no render-phase Math.random)
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
    if (stage !== 'opening') return;
    const t = setTimeout(() => setStage('tearing'), 600);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== 'tearing') return;
    const t = setTimeout(() => setStage('reveal'), 700);
    return () => clearTimeout(t);
  }, [stage]);

  const packW = 'w-36 sm:w-44';
  const packH = 'h-48 sm:h-56';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 overflow-hidden">
      <div className="relative flex flex-col items-center w-full max-w-3xl h-full">

        {stage === 'opening' && (
          <div className="relative flex flex-1 items-center justify-center">
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
          <div className="flex flex-1 items-center justify-center">
            <div className={`relative ${packW} ${packH}`}>
              <div className="absolute inset-0 flex items-end justify-center pb-2" style={{ zIndex: 2 }}>
                <div className="flex justify-center gap-1">
                  {cards.map((_, i) => (
                    <div key={i} className="w-10 h-14 rounded shadow-lg overflow-hidden">
                      <img src="/cards/card_back.png" alt="Card" className="w-full h-full object-cover" />
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
          </div>
        )}

        {stage === 'reveal' && (
          <CardRevealStack cards={cards} onComplete={onAnimationComplete} />
        )}
      </div>
    </div>
  );
};

export default SpektrumPackOpener;
