"use client"

import React from 'react';
import type { WageredCard } from '@/services/anteMatchmaking';
import { Loader2 } from 'lucide-react';

interface MatchmakingScreenProps {
  wageredCard: WageredCard;
  onCancel: () => void;
}

export function MatchmakingScreen({ wageredCard, onCancel }: MatchmakingScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-spektrum-dark to-black flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl max-w-md w-full p-8 text-center">
        <div className="mb-6 flex justify-center">
          <Loader2 className="w-16 h-16 text-spektrum-orange animate-spin" />
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">Finding Opponent</h2>
        <p className="text-gray-300 mb-6">Searching for a worthy challenger...</p>

        <div className="bg-white/20 rounded-lg p-4 mb-6">
          <p className="text-white text-sm mb-3">Your Wagered Card</p>
          <div className="bg-white rounded-lg p-4">
            <div className="aspect-[2/3] bg-gray-100 rounded mb-2 flex items-center justify-center">
              <div className="text-4xl">&#127183;</div>
            </div>
            <div className="font-bold text-lg text-spektrum-dark">{wageredCard.cardName}</div>
            <div className="text-sm text-gray-600 capitalize">{wageredCard.rarity.replace('_', ' ')}</div>
          </div>
        </div>

        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
          <p className="text-white text-sm">
            <strong>Warning:</strong> You will lose this card if you lose the battle!
          </p>
        </div>

        <button
          onClick={onCancel}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors"
        >
          Cancel Matchmaking
        </button>

        <div className="mt-6 flex justify-center gap-2">
          <div className="w-3 h-3 bg-spektrum-orange rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-spektrum-orange rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-spektrum-orange rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

export default MatchmakingScreen;
