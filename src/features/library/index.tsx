"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { useDeckStore } from '@/stores/useDeckStore';
import type { Card, ElementType, AvatarCard } from '@/domain/game/types';
import { SafeCardImage } from '@/components/shared/SafeCardImage';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getRarityColor, getRarityTextColor, getOriginalCardId, countOwnedCopies } from '@/lib/rarityUtils';

export function LibraryFeature() {
  const { getAvailableCards, ownedCards, syncCardsFromDatabase } = useDeckStore();
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [ownedCardIds, setOwnedCardIds] = useState<Set<string>>(new Set());

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState<ElementType | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedExpansion, setSelectedExpansion] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  const [hasSyncedFromDb, setHasSyncedFromDb] = useState(false);

  useEffect(() => {
    const syncFromDb = async () => {
      try {
        await syncCardsFromDatabase();
      } catch {
        // sync is supplementary
      } finally {
        setHasSyncedFromDb(true);
      }
    };
    syncFromDb();
  }, [syncCardsFromDatabase]);

  useEffect(() => {
    if (!hasSyncedFromDb) return;

    const loadAllCards = async () => {
      try {
        const availableCards = getAvailableCards();
        setAllCards(availableCards);

        const ownedCardIdSet = new Set<string>();
        ownedCards.forEach(card => {
          const id = `${card.name}-${card.type}-${card.element}`;
          ownedCardIdSet.add(id);
        });
        setOwnedCardIds(ownedCardIdSet);
      } catch {
        setAllCards([]);
        setOwnedCardIds(new Set());
      } finally {
        setIsLoading(false);
      }
    };

    loadAllCards();
  }, [hasSyncedFromDb, ownedCards, ownedCards.length]);

  const combinedCards = useMemo(() => allCards, [allCards]);

  const cardCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ownedCards.forEach(card => {
      const key = `${card.name}-${card.type}-${card.element}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [ownedCards]);

  const uniqueCards = useMemo(() => {
    const seen = new Set();
    return combinedCards.filter(card => {
      if (seen.has(card.id)) return false;
      seen.add(card.id);
      return true;
    });
  }, [combinedCards]);

  const filteredCards = useMemo(() => {
    return uniqueCards.filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (card.description && card.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesElement = selectedElement === 'all' || card.element === selectedElement;
      const matchesType = selectedType === 'all' || card.type === selectedType;
      const matchesRarity = selectedRarity === 'all' || card.rarity === selectedRarity;
      const matchesExpansion = selectedExpansion === 'all';

      return matchesSearch && matchesElement && matchesType && matchesRarity && matchesExpansion;
    });
  }, [uniqueCards, searchTerm, selectedElement, selectedType, selectedRarity, selectedExpansion]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedElement('all');
    setSelectedType('all');
    setSelectedRarity('all');
    setSelectedExpansion('all');
  };

  const CardItem: React.FC<{ card: Card }> = ({ card }) => {
    const count = countOwnedCopies(card, ownedCards);
    const isOwned = count > 0;

    return (
      <div
        className="relative cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setSelectedCard(card)}
      >
        <SafeCardImage
          src={(card as AvatarCard).imagePath || card.art || ''}
          alt={card.name}
          className={`w-full h-40 object-contain rounded ${isOwned ? '' : 'grayscale opacity-50'}`}
        />
        <div className="absolute top-1 right-1 bg-spektrum-orange text-white text-xs font-bold px-2 py-1 rounded">
          {isOwned ? count : '0'}
        </div>
        {!isOwned && (
          <div className="absolute inset-0 flex items-center justify-center rounded">
            <span className="text-white font-bold text-sm bg-black bg-opacity-70 px-2 py-1 rounded">
              Not Owned
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-600">Card Library</h1>
          <p className="text-spektrum-gray text-sm mb-4">Discover and collect all available cards</p>
        </div>

        {/* Filters Section */}
        <div className="mb-6 bg-gray-900 border-2 border-orange-500 rounded-lg shadow-lg" style={{ boxShadow: '0 0 20px rgba(249, 115, 22, 0.15)' }}>
          <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}>
            <h2 className="text-lg font-bold text-white">Filters</h2>
            <button className="text-white hover:text-orange-400 transition-colors">
              {isFiltersExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
          </div>

          {isFiltersExpanded && (
            <div className="px-4 pb-4">
              <div className="flex flex-wrap gap-3 items-center">
                <input
                  type="text"
                  placeholder="Search cards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 bg-gray-800 rounded-lg border border-orange-500 border-opacity-40 text-white w-64 focus:border-orange-400 outline-none transition-colors"
                />

                <div className="relative">
                  <select
                    value={selectedElement}
                    onChange={(e) => setSelectedElement(e.target.value as ElementType | 'all')}
                    className="appearance-none px-4 py-2 pr-8 bg-gray-800 rounded-lg border border-orange-500 border-opacity-40 text-white cursor-pointer hover:border-opacity-60"
                  >
                    <option value="all">All Elements</option>
                    <option value="fire">Fire</option>
                    <option value="water">Water</option>
                    <option value="ground">Ground</option>
                    <option value="air">Air</option>
                    <option value="neutral">Neutral</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="appearance-none px-4 py-2 pr-8 bg-gray-800 rounded-lg border border-orange-500 border-opacity-40 text-white cursor-pointer hover:border-opacity-60"
                  >
                    <option value="all">All Types</option>
                    <option value="avatar">Avatar</option>
                    <option value="spell">Spell</option>
                    <option value="quickSpell">Quick Spell</option>
                    <option value="ritualArmor">Ritual Armor</option>
                    <option value="item">Item</option>
                    <option value="field">Field</option>
                    <option value="equipment">Equipment</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={selectedRarity}
                    onChange={(e) => setSelectedRarity(e.target.value)}
                    className="appearance-none px-4 py-2 pr-8 bg-gray-800 rounded-lg border border-orange-500 border-opacity-40 text-white cursor-pointer hover:border-opacity-60"
                  >
                    <option value="all">All Rarities</option>
                    <option value="Common">Common</option>
                    <option value="Uncommon">Uncommon</option>
                    <option value="Rare">Rare</option>
                    <option value="Super Rare">Super Rare</option>
                    <option value="Mythic">Mythic</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={selectedExpansion}
                    onChange={(e) => setSelectedExpansion(e.target.value)}
                    className="appearance-none px-4 py-2 pr-8 bg-gray-800 rounded-lg border border-orange-500 border-opacity-40 text-white cursor-pointer hover:border-opacity-60"
                  >
                    <option value="all">All Sets</option>
                    <option value="base">Base Set</option>
                    <option value="expansion1">Expansion 1</option>
                    <option value="expansion2">Expansion 2</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-400 pointer-events-none" />
                </div>

                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors border border-red-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-400">
            Showing {filteredCards.length} of {uniqueCards.length} cards
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 overflow-y-auto pr-2">
          {filteredCards.map((card, index) => (
            <div key={`${card.name}-${card.type}-${card.element}-${index}`}>
              <CardItem card={card} />
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p>No cards found matching your filters.</p>
            <button onClick={clearFilters} className="mt-2 text-red-400 hover:underline">
              Clear filters to see all cards
            </button>
          </div>
        )}
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-orange-500 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" style={{ boxShadow: '0 0 30px rgba(249, 115, 22, 0.3)' }}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">{selectedCard.name}</h2>
              <button
                onClick={() => setSelectedCard(null)}
                className="text-orange-400 hover:text-orange-300 text-xl font-bold"
              >
                X
              </button>
            </div>

            {((selectedCard as AvatarCard).imagePath || selectedCard.art) && (
              <img
                src={(selectedCard as AvatarCard).imagePath || selectedCard.art}
                alt={selectedCard.name}
                className="w-full h-auto object-contain rounded mb-4"
              />
            )}

            <div className="space-y-2 text-sm text-white">
              <p><span className="font-semibold">Type:</span> {selectedCard.type}</p>
              <p><span className="font-semibold">Element:</span> {selectedCard.element}</p>
              {selectedCard.type === 'avatar' && (
                <>
                  <p><span className="font-semibold">Health:</span> {(selectedCard as AvatarCard).health}</p>
                  <p><span className="font-semibold">Level:</span> {(selectedCard as AvatarCard).level}</p>
                </>
              )}
              {selectedCard.description && (
                <p><span className="font-semibold">Description:</span> {selectedCard.description}</p>
              )}
              {selectedCard.spektraCost && selectedCard.spektraCost.length > 0 && (
                <p><span className="font-semibold">Spektra Cost:</span> {selectedCard.spektraCost.join(', ')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
