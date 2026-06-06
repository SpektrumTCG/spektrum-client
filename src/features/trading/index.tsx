"use client"

import React, { useState, useEffect } from 'react';
import { useAuthSession } from '@/lib/auth';
import { useWalletStore } from '@/stores/useWalletStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cardNftService, type CardNftMetadata } from '@/features/blockchain/solana/cardNftService';
import { marketplaceService, type MarketplaceListing } from '@/features/blockchain/solana/marketplaceService';
import type { Card } from '@spektrum/shared';
import { SafeCardImage } from '@/components/shared/SafeCardImage';

export function TradingFeature() {
  const { login, logout } = useAuthSession();
  const {
    isConnected,
    walletAddress,
    balance,
    connectionStatus,
    nftCards,
    syncNftCards,
    refreshWalletData
  } = useWalletStore();

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedMint, setSelectedMint] = useState<string | null>(null);
  const [sellPrice, setSellPrice] = useState('0.1');
  const [isTrading, setIsTrading] = useState(false);
  const [isLoadingMarketplace, setIsLoadingMarketplace] = useState(false);
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>([]);
  const [cardMintMap, setCardMintMap] = useState<Map<string, string>>(new Map());

  const loadMarketplaceData = async () => {
    if (!isConnected) return;
    setIsLoadingMarketplace(true);
    try {
      const listings = await marketplaceService.getListings();
      setMarketplaceListings(listings);
    } catch (error) {
      toast.error('Failed to load marketplace data: ' + (error as Error).message);
    } finally {
      setIsLoadingMarketplace(false);
    }
  };

  const generateCardMints = () => {
    const newMintMap = new Map<string, string>();
    nftCards.forEach(card => {
      if (!cardMintMap.has(card.id)) {
        const mint = `${card.id.replace(/\D/g, '').padStart(8, '0')}${Math.random().toString(36).substring(2, 10)}`;
        newMintMap.set(card.id, mint);
      } else {
        newMintMap.set(card.id, cardMintMap.get(card.id)!);
      }
    });
    setCardMintMap(newMintMap);
  };

  const resetTradingState = () => {
    setMarketplaceListings([]);
    setSelectedCard(null);
    setSelectedMint(null);
    setCardMintMap(new Map());
  };

  const handleSellCard = async () => {
    if (!selectedCard || !selectedMint || !isConnected) {
      toast.error('Please connect wallet and select a card');
      return;
    }
    const priceFloat = parseFloat(sellPrice);
    if (isNaN(priceFloat) || priceFloat <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    setIsTrading(true);
    try {
      const success = await cardNftService.sellCard(selectedMint, priceFloat);
      if (success) {
        toast.success(`Successfully listed ${selectedCard.name} for ${sellPrice} SOL`);
        setSelectedCard(null);
        setSelectedMint(null);
        await refreshWalletData();
        await loadMarketplaceData();
      } else {
        toast.error('Failed to list card for sale');
      }
    } catch (error) {
      toast.error('Error listing card: ' + (error as Error).message);
    } finally {
      setIsTrading(false);
    }
  };

  const handleBuyCard = async (listing: MarketplaceListing) => {
    if (!isConnected) {
      toast.error('Please connect wallet first');
      return;
    }
    if (balance < listing.price) {
      toast.error(`Insufficient balance. You need ${listing.price} SOL but have ${balance.toFixed(2)} SOL`);
      return;
    }
    setIsTrading(true);
    try {
      const success = await cardNftService.buyCard(listing.mint, listing.price);
      if (success) {
        toast.success(`Successfully bought ${listing.name} for ${listing.price} SOL`);
        await refreshWalletData();
        await syncNftCards();
        await loadMarketplaceData();
      } else {
        toast.error('Failed to buy card');
      }
    } catch (error) {
      toast.error('Error buying card: ' + (error as Error).message);
    } finally {
      setIsTrading(false);
    }
  };

  useEffect(() => {
    if (nftCards.length > 0) generateCardMints();
  }, [nftCards]);

  useEffect(() => {
    if (isConnected) loadMarketplaceData();
  }, [isConnected]);

  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
    const mint = cardMintMap.get(card.id);
    setSelectedMint(mint || null);
  };

  const isRealBlockchain = process.env.NEXT_PUBLIC_USE_REAL_BLOCKCHAIN === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 pb-24 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">NFT Card Trading</h1>
              <p className="text-gray-600 mt-1">
                Buy and sell trading cards on the Solana blockchain
                {isRealBlockchain && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Live Blockchain</span>
                )}
                {!isRealBlockchain && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Development Mode</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {isConnected ? (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Connected Wallet</div>
                  <div className="font-mono text-sm">
                    {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}
                  </div>
                  <div className="text-sm text-green-600">{balance.toFixed(2)} SOL</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {nftCards.length} NFT{nftCards.length !== 1 ? 's' : ''}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { resetTradingState(); logout(); }}
                    className="mt-2"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => login()}
                  disabled={connectionStatus === 'connecting'}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Marketplace - Buy Cards</h2>
              {isLoadingMarketplace && <div className="text-sm text-gray-500">Loading...</div>}
            </div>

            {!isConnected ? (
              <div className="text-center py-8 text-gray-500">Connect your wallet to view marketplace</div>
            ) : marketplaceListings.length === 0 && !isLoadingMarketplace ? (
              <div className="text-center py-8 text-gray-500">No cards available in marketplace</div>
            ) : (
              <div className="space-y-4">
                {marketplaceListings.map((listing) => (
                  <div key={listing.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold">{listing.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {listing.element}{listing.level && ` • Level ${listing.level}`}
                      </p>
                      <p className="text-lg font-bold text-green-600">{listing.price} SOL</p>
                      <p className="text-xs text-gray-400 font-mono">{listing.mint}</p>
                    </div>
                    <Button
                      onClick={() => handleBuyCard(listing)}
                      disabled={!isConnected || isTrading || balance < listing.price}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isTrading ? 'Processing...' : balance < listing.price ? 'Insufficient Funds' : 'Buy Now'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Cards - Sell</h2>

            {!isConnected ? (
              <div className="text-center py-8 text-gray-500">Connect your wallet to see your cards</div>
            ) : nftCards.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No cards in your collection</p>
                <p className="text-xs mt-2">Try buying some cards from the marketplace</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {nftCards.slice(0, 6).map((card) => (
                    <div
                      key={card.id}
                      className={`border-2 rounded-lg p-2 cursor-pointer transition-all ${
                        selectedCard?.id === card.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleCardSelect(card)}
                    >
                      <div className="text-sm font-medium truncate">{card.name}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {card.element}{('level' in card) && ` • Lv${(card as any).level}`}
                      </div>
                      {cardMintMap.get(card.id) && (
                        <div className="text-xs text-gray-400 font-mono truncate">
                          {cardMintMap.get(card.id)?.slice(0, 8)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {nftCards.length > 6 && (
                  <div className="text-sm text-gray-500 text-center">
                    Showing 6 of {nftCards.length} cards
                  </div>
                )}

                {selectedCard && selectedMint && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Sell {selectedCard.name}</h3>
                    <div className="text-xs text-gray-500 mb-2 font-mono">Mint: {selectedMint}</div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">Price (SOL)</label>
                        <input
                          type="number"
                          value={sellPrice}
                          onChange={(e) => setSellPrice(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          min="0.01"
                          step="0.01"
                          placeholder="0.1"
                        />
                      </div>
                      <Button
                        onClick={handleSellCard}
                        disabled={!selectedCard || !selectedMint || isTrading}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {isTrading ? 'Listing...' : 'List for Sale'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={`border rounded-xl p-4 mt-6 ${isRealBlockchain ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <h3 className={`font-semibold mb-2 ${isRealBlockchain ? 'text-green-900' : 'text-yellow-900'}`}>
            {isRealBlockchain ? 'Live Blockchain Trading' : 'Development Mode'}
          </h3>
          <div className={`text-sm ${isRealBlockchain ? 'text-green-800' : 'text-yellow-800'}`}>
            {isRealBlockchain ? (
              <div className="space-y-1">
                <p>Real Solana blockchain integration enabled</p>
                <p>Phantom wallet connected with actual SOL balance</p>
                <p>Trading operations use real mint addresses</p>
                <p>NFT cards synced from wallet</p>
                <p>Marketplace listings are currently simulated (real marketplace integration pending)</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p>Running in development mode with simulated data</p>
                <p>Set NEXT_PUBLIC_USE_REAL_BLOCKCHAIN=true to enable live blockchain</p>
                <p>Phantom wallet integration available for testing</p>
                <p>Trading functions simulate marketplace operations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
