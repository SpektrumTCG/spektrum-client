"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingDown, ArrowRight, Home } from 'lucide-react';
import { useAnteBattleStore } from '@/stores/useAnteBattleStore';
import { useDeckStore } from '@/stores/useDeckStore';
import { toast } from 'sonner';
import { SafeCardImage } from '@/components/shared/SafeCardImage';

interface AnteBattleResultsProps {
  onClose?: () => void;
}

export function AnteBattleResults({ onClose }: AnteBattleResultsProps) {
  const router = useRouter();
  const {
    battleResult,
    playerWageredCard,
    opponentWageredCard,
    resetAnteMode
  } = useAnteBattleStore();

  const { addCard } = useDeckStore();
  const [cardsTransferred, setCardsTransferred] = useState(false);

  const didWin = battleResult === 'won';

  useEffect(() => {
    if (!cardsTransferred && battleResult && playerWageredCard && opponentWageredCard) {
      if (didWin) {
        addCard({
          id: opponentWageredCard.cardId,
          name: opponentWageredCard.cardName,
          element: (opponentWageredCard as any).element || 'neutral',
          type: 'avatar',
          spektraCost: [],
          description: 'Won from Ante Battle',
          art: opponentWageredCard.imagePath || '',
          imagePath: opponentWageredCard.imagePath || ''
        } as any);
        toast.success(`You won ${opponentWageredCard.cardName}!`);
      } else {
        toast.error(`You lost ${playerWageredCard.cardName}!`);
      }
      setCardsTransferred(true);
    }
  }, [battleResult, cardsTransferred, playerWageredCard, opponentWageredCard, didWin, addCard]);

  const handleReturnHome = () => {
    resetAnteMode();
    if (onClose) {
      onClose();
    } else {
      router.push('/');
    }
  };

  const handlePlayAgain = () => {
    resetAnteMode();
    if (onClose) {
      onClose();
    } else {
      router.push('/multiplayer');
    }
  };

  if (!battleResult || !playerWageredCard || !opponentWageredCard) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[70] p-4">
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full p-8 text-center border-4"
          style={{ borderColor: didWin ? '#10b981' : '#ef4444' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mb-6 flex justify-center"
          >
            {didWin ? (
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                <Trophy className="w-16 h-16 text-white" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center">
                <TrendingDown className="w-16 h-16 text-white" />
              </div>
            )}
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`text-4xl font-bold mb-4 ${didWin ? 'text-green-400' : 'text-red-400'}`}
          >
            {didWin ? 'VICTORY!' : 'DEFEAT'}
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 text-lg mb-8"
          >
            {didWin
              ? 'You emerged victorious in the Ante Battle!'
              : 'Your opponent emerged victorious in the Ante Battle'}
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-4 items-center mb-8"
          >
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-white text-sm mb-2">Your Card</p>
              <div className="bg-gray-700 rounded-lg p-2 aspect-[2/3] flex items-center justify-center overflow-hidden">
                {playerWageredCard.imagePath ? (
                  <SafeCardImage
                    src={playerWageredCard.imagePath}
                    alt={playerWageredCard.cardName}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="text-4xl">&#127183;</div>
                )}
              </div>
              <div className="mt-2 text-white font-medium">{playerWageredCard.cardName}</div>
              <div className={`text-sm ${didWin ? 'text-green-400' : 'text-red-400'}`}>
                {didWin ? 'Kept' : 'Lost'}
              </div>
            </div>

            <div className="flex justify-center">
              <motion.div
                animate={didWin ? { x: [0, 10, 0] } : { x: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowRight
                  className={`w-12 h-12 ${didWin ? 'text-green-400' : 'text-red-400'}`}
                  style={{ transform: didWin ? 'none' : 'rotate(180deg)' }}
                />
              </motion.div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-white text-sm mb-2">Opponent's Card</p>
              <div className="bg-gray-700 rounded-lg p-2 aspect-[2/3] flex items-center justify-center overflow-hidden">
                {opponentWageredCard.imagePath ? (
                  <SafeCardImage
                    src={opponentWageredCard.imagePath}
                    alt={opponentWageredCard.cardName}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="text-4xl">&#127183;</div>
                )}
              </div>
              <div className="mt-2 text-white font-medium">{opponentWageredCard.cardName}</div>
              <div className={`text-sm ${didWin ? 'text-green-400' : 'text-red-400'}`}>
                {didWin ? 'Won!' : 'Kept by opponent'}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={`p-4 rounded-lg mb-8 ${didWin ? 'bg-green-900/30 border border-green-500/50' : 'bg-red-900/30 border border-red-500/50'}`}
          >
            <p className="text-white">
              {didWin
                ? `You won ${opponentWageredCard.cardName} and kept ${playerWageredCard.cardName}!`
                : `You lost ${playerWageredCard.cardName} to your opponent.`}
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex gap-4"
          >
            <button
              onClick={handleReturnHome}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Home
            </button>
            <button
              onClick={handlePlayAgain}
              className="flex-1 bg-spektrum-orange hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Play Again
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default AnteBattleResults;
