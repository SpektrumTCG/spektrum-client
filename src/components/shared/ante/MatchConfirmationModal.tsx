"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MatchFoundData } from '@/services/anteMatchmaking';
import { AlertTriangle } from 'lucide-react';
import { useAnteBattleStore } from '@/stores/useAnteBattleStore';

interface MatchConfirmationModalProps {
  matchData: MatchFoundData;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MatchConfirmationModal({ matchData, onConfirm, onCancel }: MatchConfirmationModalProps) {
  const router = useRouter();
  const { setAnteBattle } = useAnteBattleStore();
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (confirmed) {
      setAnteBattle(
        matchData.battleId,
        matchData.yourCard,
        matchData.opponent.wageredCard,
        'player',
        matchData.opponent.playerId
      );
      onConfirm();
      setTimeout(() => {
        router.push('/game');
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full overflow-hidden">
        <div className="bg-spektrum-dark text-white p-6 text-center">
          <h2 className="text-3xl font-bold mb-2">Match Found!</h2>
          <p className="text-gray-300">Review the stakes and confirm to begin</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Your Wager</div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg p-4 border-2 border-blue-300">
                <div className="aspect-[2/3] bg-white rounded mb-2 flex items-center justify-center overflow-hidden">
                  {matchData.yourCard.imagePath ? (
                    <img src={matchData.yourCard.imagePath} alt={matchData.yourCard.cardName} className="w-full h-full object-cover rounded" />
                  ) : (
                    <div className="text-5xl">&#127183;</div>
                  )}
                </div>
                <div className="font-bold text-lg">{matchData.yourCard.cardName}</div>
                <div className="text-sm text-gray-600 capitalize">{matchData.yourCard.rarity.replace('_', ' ')}</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Opponent's Wager</div>
              <div className="bg-gradient-to-br from-red-100 to-red-50 rounded-lg p-4 border-2 border-red-300">
                <div className="aspect-[2/3] bg-white rounded mb-2 flex items-center justify-center overflow-hidden">
                  {matchData.opponent.wageredCard.imagePath ? (
                    <img src={matchData.opponent.wageredCard.imagePath} alt={matchData.opponent.wageredCard.cardName} className="w-full h-full object-cover rounded" />
                  ) : (
                    <div className="text-5xl">&#127183;</div>
                  )}
                </div>
                <div className="font-bold text-lg">{matchData.opponent.wageredCard.cardName}</div>
                <div className="text-sm text-gray-600 capitalize">{matchData.opponent.wageredCard.rarity.replace('_', ' ')}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center -mt-16 mb-4">
            <div className="bg-spektrum-orange text-white font-bold text-2xl px-6 py-3 rounded-full shadow-lg">
              VS
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">Opponent</div>
            <div className="font-mono text-xs text-gray-700">
              {matchData.opponent.walletAddress.slice(0, 8)}...{matchData.opponent.walletAddress.slice(-6)}
            </div>
          </div>

          <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <div className="font-bold text-red-900 mb-1">Permanent Card Loss Warning</div>
                <p className="text-red-800 text-sm mb-3">
                  If you lose this battle, you will permanently lose <strong>{matchData.yourCard.cardName}</strong> and it will be transferred to your opponent's wallet on the Solana blockchain.
                </p>
                <p className="text-red-800 text-sm">
                  If you win, you will receive <strong>{matchData.opponent.wageredCard.cardName}</strong> and keep your wagered card.
                </p>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-5 h-5 text-spektrum-orange rounded focus:ring-2 focus:ring-spektrum-orange"
            />
            <span className="text-sm font-medium text-gray-700">
              I understand that I may permanently lose my card if I lose this battle
            </span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Decline &amp; Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!confirmed}
              className={`flex-1 font-medium py-3 rounded-lg transition-colors ${
                confirmed
                  ? 'bg-spektrum-orange text-white hover:bg-opacity-90'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Accept &amp; Battle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchConfirmationModal;
