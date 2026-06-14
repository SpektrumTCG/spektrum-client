"use client"

import React, { useState } from 'react';
import type { Card, AvatarCard } from '@spektrum/shared';
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
  // Optional "continue" action — used by bundle opening to chain to the next
  // sealed pack without returning to the inventory list.
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

export const CardRewardPopup: React.FC<CardRewardPopupProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  cards,
  onMintCards,
  showMintButton = false,
  primaryActionLabel,
  onPrimaryAction
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-3 pt-16 pb-24">
      <div
        className="flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border-2 border-orange-500 w-full max-w-sm max-h-full overflow-hidden"
        style={{ boxShadow: '0 0 30px rgba(249, 115, 22, 0.4), inset 0 0 20px rgba(249, 115, 22, 0.05)' }}
      >
        <div className="flex-shrink-0 bg-gradient-to-r from-orange-600 to-orange-700 px-4 py-3 flex justify-between items-center gap-2 border-b-2 border-orange-400">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white truncate">{title}</h2>
            {subtitle && <p className="text-orange-100 text-xs truncate">{subtitle}</p>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-orange-700/60 p-1.5 h-auto flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
          <p className="text-center text-gray-300 text-sm mb-4">
            You received <span className="font-bold text-orange-400">{cards.length}</span> cards!
          </p>

          <div className="grid grid-cols-2 gap-3">
            {cards.map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                className="relative bg-gray-800 rounded-lg border-2 border-orange-500/40 hover:border-orange-500 transition-colors overflow-hidden"
              >
                <div className="aspect-[3/4] bg-gray-700 flex items-center justify-center overflow-hidden">
                  {((card as AvatarCard).imagePath || card.art) ? (
                    <SafeCardImage
                      src={(card as AvatarCard).imagePath || card.art || ''}
                      alt={card.name}
                      className="w-full h-full object-contain"
                    />
                  ) : null}
                </div>

                {/* Rarity chip — overlaid to keep tiles compact */}
                <span
                  className="absolute top-1.5 left-1.5 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold leading-none shadow-md"
                  style={getRarityStyle(card.rarity)}
                >
                  {card.rarity || 'Common'}
                </span>

                <div className="px-2 py-1.5">
                  <h3 className="font-bold text-white text-xs truncate leading-tight">{card.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 p-4 border-t-2 border-orange-500/30 bg-gray-800">
          <p className="text-gray-400 text-xs text-center mb-3">
            All cards automatically minted as cNFTs and added to your wallet
          </p>
          <div className="flex gap-2">
            {primaryActionLabel && onPrimaryAction ? (
              <>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 text-sm font-semibold border-orange-500/40 text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
                >
                  Done
                </Button>
                <Button
                  onClick={onPrimaryAction}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-sm font-bold border border-orange-400 transition-all"
                  style={{ boxShadow: '0 0 15px rgba(249, 115, 22, 0.4)' }}
                >
                  {primaryActionLabel}
                </Button>
              </>
            ) : (
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-sm font-bold border border-orange-400 transition-all"
                style={{ boxShadow: '0 0 15px rgba(249, 115, 22, 0.4)' }}
              >
                View Collection
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardRewardPopup;
