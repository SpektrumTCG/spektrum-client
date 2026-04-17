"use client"

import React from 'react';
import type { WageredCard } from '@/services/anteMatchmaking';
import { useRouter } from 'next/navigation';

interface AnteBattleResultScreenProps {
  won: boolean;
  playerCard: WageredCard;
  opponentCard: WageredCard;
  onContinue: () => void;
}

export function AnteBattleResultScreen({ won, playerCard, opponentCard, onContinue }: AnteBattleResultScreenProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full overflow-hidden">
        <div className={`${won ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-orange-600'} text-white p-8 text-center`}>
          <div className="text-6xl mb-4">{won ? '\u{1F3C6}' : '\u{1F494}'}</div>
          <h2 className="text-4xl font-bold mb-2">{won ? 'Victory!' : 'Defeat'}</h2>
          <p className="text-xl">{won ? 'You won the ante battle!' : 'You lost the ante battle'}</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2 font-medium">
                {won ? 'Your Card (Kept)' : 'Your Card (Lost)'}
              </div>
              <div className={`bg-gradient-to-br ${won ? 'from-green-100 to-green-50 border-green-300' : 'from-red-100 to-red-50 border-red-300'} rounded-lg p-4 border-2`}>
                <div className="aspect-[2/3] bg-white rounded mb-2 flex items-center justify-center">
                  <div className="text-5xl">&#127183;</div>
                </div>
                <div className="font-bold text-lg">{playerCard.cardName}</div>
                <div className="text-sm text-gray-600 capitalize">{playerCard.rarity.replace('_', ' ')}</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2 font-medium">
                {won ? 'Card Won' : "Opponent's Card"}
              </div>
              <div className={`bg-gradient-to-br ${won ? 'from-yellow-100 to-yellow-50 border-yellow-400' : 'from-gray-100 to-gray-50 border-gray-300'} rounded-lg p-4 border-2`}>
                <div className="aspect-[2/3] bg-white rounded mb-2 flex items-center justify-center">
                  <div className="text-5xl">&#127183;</div>
                </div>
                <div className="font-bold text-lg">{opponentCard.cardName}</div>
                <div className="text-sm text-gray-600 capitalize">{opponentCard.rarity.replace('_', ' ')}</div>
              </div>
            </div>
          </div>

          <div className={`${won ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'} border-2 rounded-lg p-4 mb-6`}>
            <div className="text-center">
              {won ? (
                <>
                  <div className="font-bold text-green-900 mb-2">Card Transfer Complete</div>
                  <p className="text-green-800 text-sm">
                    <strong>{opponentCard.cardName}</strong> has been added to your collection.
                    You also kept your wagered card <strong>{playerCard.cardName}</strong>.
                  </p>
                </>
              ) : (
                <>
                  <div className="font-bold text-red-900 mb-2">Card Transfer Complete</div>
                  <p className="text-red-800 text-sm">
                    <strong>{playerCard.cardName}</strong> has been removed from your collection.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/home')}
              className="flex-1 bg-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Return to Home
            </button>
            <button
              onClick={onContinue}
              className={`flex-1 font-medium py-3 rounded-lg transition-colors ${
                won
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-spektrum-orange text-white hover:bg-opacity-90'
              }`}
            >
              {won ? 'Play Again' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnteBattleResultScreen;
