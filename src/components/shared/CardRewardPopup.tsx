"use client"

import React, { useState } from 'react';
import type { Card, AvatarCard } from '@/domain/game/types';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { SafeCardImage } from '@/components/shared/SafeCardImage';

interface CardRewardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  cards: Card[];
  onMintCards?: () => Promise<void>;
  showMintButton?: boolean;
}

export const CardRewardPopup: React.FC<CardRewardPopupProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  cards,
  onMintCards,
  showMintButton = false
}) => {
  const [isMinting, setIsMinting] = useState(false);

  if (!isOpen) return null;

  const getRarityStyle = (rarity?: string): React.CSSProperties => {
    switch (rarity?.toLowerCase()) {
      case 'mythic': return { backgroundColor: '#FFD700', color: '#000' };
      case 'super rare': return { backgroundColor: '#A855F7', color: '#fff' };
      case 'rare': return { backgroundColor: '#3B82F6', color: '#fff' };
      case 'uncommon': return { backgroundColor: '#22C55E', color: '#fff' };
      case 'common': return { backgroundColor: '#9CA3AF', color: '#fff' };
      default: return { backgroundColor: '#9CA3AF', color: '#fff' };
    }
  };

  const handleMint = async () => {
    if (!onMintCards) return;
    setIsMinting(true);
    try {
      await onMintCards();
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border-2 border-orange-500 max-w-xs sm:max-w-sm lg:max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
        style={{ boxShadow: '0 0 30px rgba(249, 115, 22, 0.4), inset 0 0 20px rgba(249, 115, 22, 0.05)' }}
      >
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-3 sm:p-4 flex justify-between items-center border-b-2 border-orange-400">
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-orange-100 text-xs sm:text-sm">{subtitle}</p>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-orange-700 p-1 sm:p-2"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 max-h-[70vh] sm:max-h-[60vh] overflow-y-auto">
          <div className="text-center mb-4 sm:mb-6">
            <p className="text-gray-300 text-base sm:text-lg">
              You received <span className="font-bold text-orange-400">{cards.length}</span> cards!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-3 justify-items-center">
            {cards.map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                className="bg-gray-800 rounded-lg p-2 sm:p-2 lg:p-3 border-2 border-orange-500/40 hover:border-orange-500 transition-colors w-full"
              >
                <div className="aspect-[3/4] bg-gray-700 rounded-lg mb-2 sm:mb-2 lg:mb-3 flex items-center justify-center overflow-hidden">
                  {((card as AvatarCard).imagePath || card.art) ? (
                    <SafeCardImage
                      src={(card as AvatarCard).imagePath || card.art || ''}
                      alt={card.name}
                      className="w-full h-full object-contain"
                    />
                  ) : null}
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-white text-xs sm:text-sm lg:text-base truncate leading-tight">{card.name}</h3>
                  <div className="flex justify-center">
                    <span
                      className="inline-flex items-center rounded-md border border-transparent px-2.5 py-0.5 text-[10px] sm:text-xs lg:text-sm font-semibold leading-tight"
                      style={getRarityStyle(card.rarity)}
                    >
                      {card.rarity || 'Common'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 border-t-2 border-orange-500/30 bg-gradient-to-r from-gray-800 to-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-gray-300 text-xs sm:text-sm text-center sm:text-left">
              All cards automatically minted as cNFTs and added to your wallet
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 w-full sm:w-auto text-sm sm:text-base font-bold border border-orange-400 transition-all"
                style={{ boxShadow: '0 0 15px rgba(249, 115, 22, 0.4)' }}
              >
                View Collection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardRewardPopup;
