"use client"

import React, { useState, useMemo } from 'react';
import type { Card } from '@/domain/game/types';
import { canWagerCard } from '@/services/anteMatchmaking';
import { X } from 'lucide-react';

interface WagerCardSelectorProps {
  cards: Card[];
  onSelectCard: (card: Card) => void;
  onCancel: () => void;
}

export function WagerCardSelector({ cards, onSelectCard, onCancel }: WagerCardSelectorProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [rarityFilter, setRarityFilter] = useState<'all' | 'rare' | 'super_rare' | 'mythic'>('all');

  const eligibleCards = useMemo(() => {
    return cards.filter(card => canWagerCard(card));
  }, [cards]);

  const filteredCards = useMemo(() => {
    if (rarityFilter === 'all') return eligibleCards;
    return eligibleCards.filter(card => {
      const cardRarity = (card as any).rarity;
      if (!cardRarity) return false;
      const normalizedCardRarity = cardRarity.toString().toLowerCase().replace(/\s+/g, '_');
      return normalizedCardRarity === rarityFilter;
    });
  }, [eligibleCards, rarityFilter]);

  const groupedCards = useMemo(() => {
    const groups = new Map<string, { card: Card; count: number }>();
    filteredCards.forEach(card => {
      const key = card.name + '|' + ((card as any).rarity || '');
      const existing = groups.get(key);
      if (existing) {
        existing.count++;
      } else {
        groups.set(key, { card, count: 1 });
      }
    });
    return Array.from(groups.values());
  }, [filteredCards]);

  const handleConfirm = () => {
    if (selectedCard) onSelectCard(selectedCard);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-end justify-center z-50 sm:items-center">
      <div
        className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:w-[340px] flex flex-col shadow-xl"
        style={{ maxHeight: 'calc(100dvh - 96px - env(safe-area-inset-top, 0px) - 24px)', marginBottom: '96px', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="bg-spektrum-dark text-white px-3 py-2 flex items-center justify-between shrink-0 rounded-t-2xl sm:rounded-t-lg">
          <div>
            <h2 className="text-sm font-bold leading-tight">Select Wager Card</h2>
            <p className="text-gray-300 text-[10px]">Choose a Rare, Super Rare, or Mythic card to wager</p>
          </div>
          <button onClick={onCancel} className="text-white hover:text-gray-300 p-1">
            <X size={16} />
          </button>
        </div>

        <div className="px-2 py-1.5 border-b flex gap-1 shrink-0 overflow-x-auto">
          {(['all', 'rare', 'super_rare', 'mythic'] as const).map(rarity => (
            <button
              key={rarity}
              onClick={() => setRarityFilter(rarity)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors whitespace-nowrap ${
                rarityFilter === rarity
                  ? 'bg-spektrum-orange text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {rarity === 'all' ? 'All' : rarity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-2 min-h-0">
          {groupedCards.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p className="text-xs mb-1">No eligible cards</p>
              <p className="text-[10px]">Need Rare+ for Ante</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
              {groupedCards.map(({ card, count }) => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                    selectedCard?.id === card.id
                      ? 'border-spektrum-orange shadow-md scale-105'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  {count > 1 && (
                    <div className="absolute top-0 right-0 z-10 bg-spektrum-orange text-white text-[7px] font-bold rounded-bl w-4 h-4 flex items-center justify-center">
                      {count}
                    </div>
                  )}
                  <div className="aspect-[2/3] bg-gray-100 flex items-center justify-center">
                    {((card as any).imagePath || card.art) ? (
                      <img src={(card as any).imagePath || card.art} alt={card.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-400 text-center p-0.5">
                        <div className="text-sm">&#127183;</div>
                        <div className="text-[7px] leading-tight">{card.name}</div>
                      </div>
                    )}
                  </div>
                  <div className="bg-white px-1 py-0.5 border-t">
                    <div className="font-semibold text-[8px] truncate">{card.name}</div>
                    <div className="text-[7px] text-gray-500 capitalize">
                      {(card as any).rarity?.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-3 py-2 border-t bg-gray-50 flex justify-between items-center shrink-0">
          <div className="text-[10px] text-gray-600 mr-2 truncate flex-1">
            {selectedCard ? (
              <span className="font-medium text-spektrum-dark">{selectedCard.name}</span>
            ) : (
              <span>Pick a card to wager</span>
            )}
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-lg text-xs hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedCard}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors text-xs ${
                selectedCard
                  ? 'bg-spektrum-orange text-white hover:bg-orange-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WagerCardSelector;
