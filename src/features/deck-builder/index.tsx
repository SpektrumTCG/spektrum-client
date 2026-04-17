"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDeckStore } from '@/stores/useDeckStore';
import type { Deck } from '@/stores/useDeckStore';
import type { Card, ElementType, AvatarCard, RarityType } from '@/domain/game/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { BackButton } from '@/components/shared/BackButton';
import { SafeCardImage } from '@/components/shared/SafeCardImage';
import { getRarityColor, getRarityTextColor, getOriginalCardId, countOwnedCopies } from '@/lib/rarityUtils';
import { useWalletStore } from '@/stores/useWalletStore';

export function DeckBuilderFeature() {
  const { decks, activeDeckId, getAvailableCards, getAvailableCardsWithCNFTs, ownedCards, addDeck, updateDeck, deleteDeck, setActiveDeck, normalizeCardImagePaths, syncCardsFromDatabase, syncDecksFromDatabase } = useDeckStore();
  const router = useRouter();

  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [deckName, setDeckName] = useState('');
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [elementFilter, setElementFilter] = useState<ElementType | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string | 'all'>('all');
  const [tribeFilter, setTribeFilter] = useState<string | 'all'>('all');
  const [expansionFilter, setExpansionFilter] = useState<string | 'all'>('all');
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [showCoverSelector, setShowCoverSelector] = useState(false);

  const [isEditDeckExpanded, setIsEditDeckExpanded] = useState(true);
  const [isCardCollectionExpanded, setIsCardCollectionExpanded] = useState(true);
  const [isDeckActionsExpanded, setIsDeckActionsExpanded] = useState(true);

  const [previewCard, setPreviewCard] = useState<Card | null>(null);

  useEffect(() => {
    normalizeCardImagePaths();
  }, [normalizeCardImagePaths]);

  useEffect(() => {
    const syncFromDb = async () => {
      try {
        await syncCardsFromDatabase();
      } catch {
        // sync is supplementary
      }
    };
    syncFromDb();
  }, [syncCardsFromDatabase]);

  useEffect(() => {
    const loadCards = async () => {
      try {
        const freshCards = getAvailableCards();
        setAllCards(freshCards);
      } catch {
        setAllCards([]);
      } finally {
        setIsLoadingCards(false);
      }
    };

    loadCards();
    syncDecksFromDatabase().catch(() => {});

    const refreshInterval = setInterval(loadCards, 2000);
    return () => clearInterval(refreshInterval);
  }, [getAvailableCards, getAvailableCardsWithCNFTs, syncDecksFromDatabase]);

  const getUniqueCards = (cards: Card[]) => {
    const seen = new Set();
    return cards.filter(card => {
      if (seen.has(card.id)) return false;
      seen.add(card.id);
      return true;
    });
  };

  const filteredCards = getUniqueCards(allCards).filter(card => {
    const elementMatch = elementFilter === 'all' || card.element === elementFilter;
    const typeMatch = typeFilter === 'all' || card.type === typeFilter;
    const expansionMatch = expansionFilter === 'all' || (card as any).expansion === expansionFilter;

    let tribeMatch = true;
    if (tribeFilter !== 'all' && card.type === 'avatar') {
      const avatarCard = card as AvatarCard;
      tribeMatch = avatarCard.subType?.includes(tribeFilter.toLowerCase()) || false;
    }

    return elementMatch && typeMatch && tribeMatch && expansionMatch;
  });

  const uniqueExpansions = Array.from(new Set(allCards.map(card => (card as any).expansion).filter(Boolean))).sort();

  const getBaseCardId = (cardId: string): string => {
    return cardId.split('-copy-')[0];
  };

  const getCountKey = (card: Card): string => {
    if (card.duplicateGroup) return card.duplicateGroup;
    if ((card as any).cardNumber) return (card as any).cardNumber;
    return getBaseCardId(card.id);
  };

  const cardCounts = selectedCards.reduce<Record<string, number>>((acc, card) => {
    const key = getCountKey(card);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const getVariantCount = (card: Card): number => {
    const countKey = getCountKey(card);
    return selectedCards.filter(c => getCountKey(c) === countKey).length;
  };

  const hasReachedMaxCount = (card: Card) => {
    return getVariantCount(card) >= 4;
  };

  const getWalletCardCount = (card: Card) => {
    return countOwnedCopies(card, ownedCards);
  };

  const handleEditDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    setDeckName(deck.name);
    setSelectedCards([...deck.cards]);
  };

  const handleNewDeck = () => {
    setSelectedDeck(null);
    setDeckName('New Custom Deck');
    setSelectedCards([]);
    toast.success("Start adding cards to your new deck");
  };

  const handleSaveDeck = async () => {
    if (!deckName.trim()) {
      toast.error("Please enter a deck name");
      return;
    }

    if (selectedCards.length < 40) {
      toast.error("A deck must have at least 40 cards");
      return;
    }

    try {
      if (selectedDeck) {
        const currentCoverId = selectedDeck.coverCardId;
        const coverStillInDeck = currentCoverId && selectedCards.some(c => c.id === currentCoverId);
        updateDeck(selectedDeck.id, {
          name: deckName,
          cards: selectedCards,
          coverCardId: coverStillInDeck ? currentCoverId : (selectedCards[0]?.id || undefined)
        });
        toast.success(`Deck "${deckName}" updated`);
      } else {
        const newDeck = addDeck(deckName, selectedCards);
        setSelectedDeck(newDeck);
        toast.success(`Deck "${deckName}" created`);
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDeleteDeck = async () => {
    if (!selectedDeck) return;

    if (window.confirm(`Are you sure you want to delete the deck "${selectedDeck.name}"?`)) {
      const deckId = selectedDeck.id;
      const deckNameToDelete = selectedDeck.name;

      deleteDeck(deckId);
      setSelectedDeck(null);
      setDeckName('');
      setSelectedCards([]);
      toast.success(`Deck "${deckNameToDelete}" deleted`);

      const walletAddress = useWalletStore.getState().walletAddress;
      if (!walletAddress) return;

      try {
        await fetch(`/api/decks/${deckId}`, { method: 'DELETE' });
      } catch {
        // database delete is supplementary
      }
    }
  };

  const handleSetActiveDeck = (deck: Deck) => {
    setActiveDeck(deck.id);
    toast.success(`Deck "${deck.name}" set as active`);
  };

  const handleSelectCover = (card: Card) => {
    if (!selectedDeck) return;
    updateDeck(selectedDeck.id, { ...selectedDeck, coverCardId: card.id });
    setShowCoverSelector(false);
    toast.success(`Deck cover updated to ${card.name}`);
  };

  const handleAddCard = (card: Card) => {
    const countKey = getCountKey(card);
    const currentCount = cardCounts[countKey] || 0;
    const maxAllowed = 4;
    const ownedCount = getWalletCardCount(card);

    if (hasReachedMaxCount(card)) {
      toast.error(`Maximum ${maxAllowed} copies allowed for "${card.name}" (currently have ${currentCount})`);
      return;
    }

    if (currentCount >= ownedCount) {
      toast.error(`You only own ${ownedCount} copies of "${card.name}" (trying to add ${currentCount + 1})`);
      return;
    }

    const timestamp = Date.now();
    const newCard = { ...card, id: `${card.id}-copy-${currentCount + 1}-${timestamp}` };
    setSelectedCards([...selectedCards, newCard]);
    toast.success(`Added "${card.name}" to deck (${currentCount + 1}/${Math.min(ownedCount, maxAllowed)})`);
  };

  const handleRemoveCard = (index: number) => {
    const newSelectedCards = [...selectedCards];
    newSelectedCards.splice(index, 1);
    setSelectedCards(newSelectedCards);
  };

  if (isLoadingCards) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 pb-24 overflow-y-auto" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg text-white font-semibold">Loading cards and cNFTs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
      <BackButton />
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-600">Deck Builder</h1>
          <p className="text-spektrum-gray text-sm mb-4">
            {allCards.length} cards available (including cNFTs)
          </p>
        </div>

        {/* Deck selection */}
        <div className="mb-6 bg-gray-900 border-2 border-orange-500 p-4 rounded-2xl shadow-lg" style={{ boxShadow: '0 0 25px rgba(249, 115, 22, 0.15)' }}>
          <h2 className="text-xl font-semibold mb-2 text-white">Your Decks</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            {decks.map(deck => (
              <div
                key={deck.id}
                className={`p-3 rounded-lg cursor-pointer flex flex-col items-center transition-colors border ${
                  deck.id === activeDeckId
                    ? 'bg-orange-700 border-2 border-orange-500'
                    : 'bg-gray-800 hover:bg-gray-700 border border-orange-500 border-opacity-40'
                }`}
                onClick={() => handleEditDeck(deck)}
              >
                <div className="w-24 h-32 bg-gray-600 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  {deck.coverCardId ? (
                    (() => {
                      let coverCard = allCards.find(card => card.id === deck.coverCardId);
                      if (!coverCard) {
                        const searchPattern = deck.coverCardId.replace(/-copy-\d+$/, '');
                        coverCard = allCards.find(card =>
                          card.id.includes(searchPattern) ||
                          card.id.includes(`owned-${searchPattern}`) ||
                          card.id.startsWith(`owned-${deck.coverCardId}`)
                        );
                      }
                      const imageSrc = coverCard ? ((coverCard as AvatarCard).imagePath || coverCard.art) : null;
                      if (coverCard && imageSrc) {
                        return (
                          <SafeCardImage
                            src={imageSrc}
                            alt={`${deck.name} cover`}
                            className="w-full h-full object-cover"
                          />
                        );
                      }
                      return <span className="text-xs text-center p-1 text-gray-300">Deck Cover</span>;
                    })()
                  ) : (
                    <span className="text-xs text-center text-white">No Cover</span>
                  )}
                </div>
                <span className="font-medium text-sm text-white w-24 text-center line-clamp-2">{deck.name}</span>
                <span className="text-xs text-gray-300">{deck.cards.length} cards</span>
                {deck.id === activeDeckId ? (
                  <span className="bg-gradient-to-r from-orange-600 to-orange-700 px-2 py-0.5 rounded-lg text-xs mt-1 font-medium border border-orange-400 text-white">Active</span>
                ) : (
                  <button
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 px-2 py-0.5 rounded-lg text-xs mt-1 border border-orange-400 font-medium text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetActiveDeck(deck);
                    }}
                  >
                    Set Active
                  </button>
                )}
              </div>
            ))}

            {decks.length < 5 && (
              <div
                className="p-3 rounded-lg cursor-pointer flex flex-col items-center bg-green-700 hover:bg-green-600 transition-colors border border-green-600"
                onClick={handleNewDeck}
              >
                <div className="w-24 h-32 bg-green-800 rounded-lg mb-2 flex items-center justify-center">
                  <span className="text-3xl text-white">+</span>
                </div>
                <span className="font-medium text-sm text-white">New Deck</span>
                <span className="text-xs text-gray-300">{decks.length}/5 decks</span>
              </div>
            )}
          </div>
        </div>

        {/* Deck editor */}
        {(selectedDeck || selectedCards.length > 0 || deckName === 'New Custom Deck') && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {/* Current deck */}
            <div className="md:col-span-1 bg-gray-900 border-2 border-orange-500 rounded-2xl p-4" style={{ boxShadow: '0 0 20px rgba(249, 115, 22, 0.1)' }}>
              <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => setIsEditDeckExpanded(!isEditDeckExpanded)}>
                <h2 className="text-xl font-semibold text-white">
                  {selectedDeck ? "Edit Deck" : "Create New Deck"}
                </h2>
                <button className="text-white hover:text-spektrum-orange transition-colors">
                  {isEditDeckExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
              </div>

              {isEditDeckExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-1">Deck Name</label>
                    <input
                      type="text"
                      value={deckName}
                      onChange={(e) => setDeckName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-orange-500 border-opacity-40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-opacity-100 transition-colors"
                      placeholder="Enter deck name"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        Cards ({selectedCards.length}/60)
                      </span>
                      <span className={`text-xs ${selectedCards.length >= 40 ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedCards.length < 40 ? `Need ${40 - selectedCards.length} more` : 'Minimum reached'}
                      </span>
                    </div>

                    <div className="max-h-[50vh] overflow-y-auto bg-gray-700 rounded-md p-2">
                      {selectedCards.length === 0 ? (
                        <div className="text-gray-400 text-sm text-center py-4">
                          No cards added yet. Add cards from the collection.
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {selectedCards.map((card, index) => (
                            <div
                              key={`${card.id}-${index}`}
                              className="flex items-center justify-between bg-gray-800 rounded p-2 text-sm"
                            >
                              <div className="flex items-center">
                                {((card as AvatarCard).imagePath || card.art) ? (
                                  <div className={`w-8 h-8 mr-2 rounded overflow-hidden border-2 ${card.rarity ? getRarityColor(card.rarity) : 'border-gray-400'}`}>
                                    <SafeCardImage src={(card as AvatarCard).imagePath || card.art || ''} alt={card.name} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div
                                    className={`w-3 h-3 rounded-full mr-2 ${
                                      card.element === 'fire' ? 'bg-red-500' :
                                      card.element === 'water' ? 'bg-blue-500' :
                                      card.element === 'air' ? 'bg-cyan-300' :
                                      card.element === 'ground' ? 'bg-amber-700' : 'bg-gray-400'
                                    }`}
                                  />
                                )}
                                <span className="truncate max-w-[140px] text-white">{card.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-xs bg-gray-700 px-1 rounded mr-2 text-white">{card.type}</span>
                                <button className="text-red-400 hover:text-red-300" onClick={() => handleRemoveCard(index)}>X</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Card collection */}
            <div className="col-span-1 md:col-span-2 bg-gray-900 border-2 border-orange-500 rounded-2xl p-5 w-full mb-6" style={{ boxShadow: '0 0 20px rgba(249, 115, 22, 0.1)' }}>
              <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => setIsCardCollectionExpanded(!isCardCollectionExpanded)}>
                <h2 className="text-xl font-semibold text-white">Card Collection</h2>
                <button className="text-white hover:text-spektrum-orange transition-colors">
                  {isCardCollectionExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
              </div>

              {isCardCollectionExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Element</label>
                      <select
                        value={elementFilter}
                        onChange={(e) => setElementFilter(e.target.value as ElementType | 'all')}
                        className="px-3 py-1 rounded-lg bg-gray-800 text-white border border-orange-500 border-opacity-40 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                      >
                        <option value="all">All Elements</option>
                        <option value="fire">Fire</option>
                        <option value="water">Water</option>
                        <option value="air">Air</option>
                        <option value="earth">Ground</option>
                        <option value="neutral">Neutral</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Type</label>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-1 rounded-lg bg-gray-800 text-white border border-orange-500 border-opacity-40 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                      >
                        <option value="all">All Types</option>
                        <option value="avatar">Avatar</option>
                        <option value="spell">Spell</option>
                        <option value="quickSpell">Quick Spell</option>
                        <option value="item">Item</option>
                        <option value="ritualArmor">Ritual Armor</option>
                        <option value="equipment">Equipment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Tribe</label>
                      <select
                        value={tribeFilter}
                        onChange={(e) => setTribeFilter(e.target.value)}
                        className="px-3 py-1 rounded-lg bg-gray-800 text-white border border-orange-500 border-opacity-40 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                      >
                        <option value="all">All Tribes</option>
                        <option value="kobar">Kobar</option>
                        <option value="borah">Borah</option>
                        <option value="kujana">Kujana</option>
                        <option value="kuhaka">Kuhaka</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Expansion</label>
                      <select
                        value={expansionFilter}
                        onChange={(e) => setExpansionFilter(e.target.value)}
                        className="px-3 py-1 rounded-lg bg-gray-800 text-white border border-orange-500 border-opacity-40 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                      >
                        <option value="all">All Expansions</option>
                        {uniqueExpansions.map(expansion => (
                          <option key={expansion as string} value={expansion as string}>{expansion as string}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Card grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto p-4 w-full max-h-[600px]">
                    {filteredCards.map((card, index) => {
                      const countKey = getCountKey(card);
                      const deckCount = cardCounts[countKey] || 0;
                      const variantCount = getVariantCount(card);
                      const walletCount = getWalletCardCount(card);
                      const maxAllowed = 4;
                      const isMaxed = variantCount >= maxAllowed || deckCount >= walletCount;

                      if (walletCount === 0) return null;

                      return (
                        <div
                          key={`${card.id}-${index}`}
                          className={`bg-gray-700 rounded-lg overflow-hidden transition-transform hover:scale-110 shadow-lg ${isMaxed ? 'opacity-50' : ''}`}
                        >
                          <div className="relative group">
                            <div
                              className={`h-32 flex items-center justify-center relative ${
                                card.element === 'fire' ? 'bg-red-900' :
                                card.element === 'water' ? 'bg-blue-900' :
                                card.element === 'air' ? 'bg-cyan-900' :
                                card.element === 'ground' ? 'bg-amber-900' : 'bg-gray-800'
                              }`}
                            >
                              {((card as AvatarCard).imagePath || card.art) ? (
                                <>
                                  <SafeCardImage
                                    src={(card as AvatarCard).imagePath || card.art || ''}
                                    alt={card.name}
                                    className="h-full w-full object-contain opacity-85"
                                  />

                                  {/* Hover tooltip */}
                                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 bg-gray-900 bg-opacity-95 border border-orange-500 rounded-lg p-4 shadow-2xl w-72 text-sm text-left pointer-events-none" style={{ top: '120%', right: 0, maxHeight: '400px', overflowY: 'auto' }}>
                                    <h3 className="font-bold text-lg mb-1 text-white">{card.name}</h3>
                                    <div className="flex justify-between mb-2">
                                      <div className="text-orange-300 font-semibold">
                                        {card.type} &bull; {card.element}
                                        {card.type === 'avatar' && ` \u2022 Lv${(card as AvatarCard).level}`}
                                      </div>
                                    </div>
                                    {card.type === 'avatar' && (
                                      <div className="mb-2 text-white">
                                        <div>Health: {(card as AvatarCard).health}</div>
                                      </div>
                                    )}
                                    {(card.type === 'spell' || card.type === 'quickSpell' || card.type === 'ritualArmor' || card.type === 'equipment') && (
                                      <div className="mb-2">
                                        <div className="text-gray-100">{card.description}</div>
                                      </div>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <div className="text-center p-2 text-white">
                                  <div className="font-bold">{card.name}</div>
                                  <div className="text-xs bg-orange-600 border border-orange-400 text-white px-2 py-0.5 rounded inline-block font-bold mt-1">{card.type}</div>
                                </div>
                              )}
                            </div>

                            {deckCount > 0 && (
                              <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center z-20">
                                {deckCount}
                              </div>
                            )}

                            {walletCount > 0 && (
                              <div className="absolute top-1 left-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center z-20">
                                {walletCount}
                              </div>
                            )}
                          </div>

                          <div className="p-3 bg-gray-800">
                            <h3 className="text-xs font-bold text-white mb-2 line-clamp-2 leading-tight">{card.name}</h3>

                            <div className="flex items-center gap-1 mb-2">
                              <span className="text-[10px] bg-orange-600 text-white px-1.5 py-0.5 rounded border border-orange-400 font-semibold">{card.type}</span>
                              {card.type === 'avatar' && (card as AvatarCard).subType && (
                                <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded border border-blue-400 font-semibold">
                                  {(card as AvatarCard).subType.charAt(0).toUpperCase() + (card as AvatarCard).subType.slice(1)}
                                </span>
                              )}
                              {card.type === 'avatar' && (
                                <span className="text-[10px] bg-gray-700 text-orange-300 px-1.5 py-0.5 rounded border border-gray-600 font-semibold ml-auto">
                                  Lv{(card as AvatarCard).level}
                                </span>
                              )}
                            </div>

                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-semibold text-orange-300">{card.element}</span>
                            </div>

                            <div className="flex gap-2">
                              <button
                                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 disabled:bg-gray-600 disabled:text-gray-400 px-2 py-1 rounded-lg text-xs border border-orange-400 font-medium text-white"
                                onClick={(e) => { e.stopPropagation(); handleAddCard(card); }}
                                disabled={isMaxed}
                              >
                                {isMaxed ? 'Max' : 'Add'}
                              </button>
                              <button
                                className="bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded-lg text-white text-xs border border-gray-500 font-medium transition-colors"
                                onClick={(e) => { e.stopPropagation(); setPreviewCard(card); }}
                                title="Preview card details"
                              >
                                <Eye size={14} />
                              </button>
                            </div>

                            <div className="text-xs text-gray-400 mt-1 text-center">
                              Own: {walletCount} | Variants: {variantCount}/4
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Deck Actions */}
            <div className="col-span-1 md:col-span-3 bg-gray-900 border-2 border-orange-500 rounded-2xl p-4 w-full" style={{ boxShadow: '0 0 20px rgba(249, 115, 22, 0.1)' }}>
              <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => setIsDeckActionsExpanded(!isDeckActionsExpanded)}>
                <h2 className="text-xl font-semibold text-white">Deck Actions</h2>
                <button className="text-white hover:text-spektrum-orange transition-colors">
                  {isDeckActionsExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
              </div>

              {isDeckActionsExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="flex flex-col gap-3">
                    <button
                      className={`${selectedDeck ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white border border-orange-400' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold border border-green-500'} px-4 py-3 rounded-lg disabled:bg-gray-600 disabled:text-gray-400 transition-colors w-full text-lg`}
                      onClick={handleSaveDeck}
                      disabled={selectedCards.length < 40 || !deckName.trim()}
                    >
                      {selectedDeck ? 'Update Deck' : 'Create New Deck'}
                    </button>

                    {selectedDeck && (
                      <>
                        <button
                          className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 px-4 py-3 rounded-lg text-white w-full text-lg border border-orange-400"
                          onClick={() => setShowCoverSelector(true)}
                        >
                          Edit Cover
                        </button>
                        <button
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-4 py-3 rounded-lg text-white w-full text-lg border border-red-500"
                          onClick={handleDeleteDeck}
                        >
                          Delete Deck
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Cover Selector Modal */}
      {showCoverSelector && selectedDeck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-orange-500 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 0 30px rgba(249, 115, 22, 0.2)' }}>
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Select Deck Cover</h2>
              <p className="text-sm text-gray-300">Choose a card from your deck to use as the cover</p>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {selectedCards.map((card, index) => (
                  <div
                    key={`cover-${card.id}-${index}`}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => handleSelectCover(card)}
                  >
                    <div className="bg-gray-700 rounded-lg p-2 hover:bg-gray-600">
                      <div className="w-full h-32 bg-gray-600 rounded mb-2 flex items-center justify-center overflow-hidden">
                        {((card as AvatarCard).imagePath || card.art) ? (
                          <SafeCardImage
                            src={(card as AvatarCard).imagePath || card.art || ''}
                            alt={card.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-xs text-center p-1 text-white">{card.name}</div>
                        )}
                      </div>
                      <div className="text-xs text-center">
                        <div className="font-medium truncate text-white">{card.name}</div>
                        <div className="text-gray-400">{card.type}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-orange-500 border-opacity-40 flex justify-end">
              <button
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white border border-gray-600"
                onClick={() => setShowCoverSelector(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Preview Modal */}
      {previewCard && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewCard(null)}
        >
          <div
            className="bg-gray-900 rounded-lg border-2 border-spektrum-orange w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full md:w-2/5 flex items-center justify-center bg-gray-800 p-4 md:p-6">
              {(previewCard as AvatarCard).imagePath || previewCard.art ? (
                <SafeCardImage
                  src={(previewCard as AvatarCard).imagePath || previewCard.art || ''}
                  alt={previewCard.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-96 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>

            <div className="w-full md:w-3/5 p-6 overflow-y-auto flex flex-col">
              <h2 className="text-3xl font-bold text-white mb-2">{previewCard.name}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="text-spektrum-orange font-semibold">{previewCard.type}</div>
                <div className="text-gray-400">&bull;</div>
                <div className="text-blue-400 font-semibold">{previewCard.element}</div>
                {previewCard.rarity && (
                  <>
                    <div className="text-gray-400">&bull;</div>
                    <div className="text-yellow-400 font-semibold">{previewCard.rarity}</div>
                  </>
                )}
              </div>

              {previewCard.type === 'avatar' && (
                <div className="mb-4 bg-gray-800 rounded p-4 border border-gray-700">
                  <div className="text-white mb-3">
                    <div className="text-sm mb-2">
                      <span className="text-gray-400">Level:</span> <span className="font-bold ml-2">{(previewCard as AvatarCard).level}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Health:</span> <span className="font-bold text-green-400 ml-2">{(previewCard as AvatarCard).health}</span>
                    </div>
                  </div>
                </div>
              )}

              {(previewCard.type === 'spell' || previewCard.type === 'quickSpell' || previewCard.type === 'equipment' || previewCard.type === 'ritualArmor' || previewCard.type === 'item') && previewCard.description && (
                <div className="mb-4 bg-gray-800 rounded p-4 border border-gray-700">
                  <div className="text-gray-100 text-sm leading-relaxed">{previewCard.description}</div>
                </div>
              )}

              <button
                onClick={() => setPreviewCard(null)}
                className="w-full bg-spektrum-orange hover:bg-orange-600 text-white py-3 rounded-lg font-semibold mt-auto"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
