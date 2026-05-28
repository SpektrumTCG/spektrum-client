"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInventoryStore } from '@/stores/useInventoryStore';
import type { InventoryBoosterPack } from '@/stores/useInventoryStore';
import type { Card } from '@spektrum/shared';
import { toast } from 'sonner';
import { SafeCardImage } from '@/components/shared/SafeCardImage';
import { useRequireAuth } from '@/components/shared/AuthGateModal';
import { CardRewardPopup } from '@/components/shared/CardRewardPopup';
import { AnimatedCardReveal } from '@/components/shared/AnimatedCardReveal';
import { SpektrumPackOpener } from '@/components/shared/SpektrumPackOpener';
import { CollectionBadges } from '@/components/shared/CollectionBadges';
import { Button } from '@/components/ui/button';
import { Package, ExternalLink, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

export function InventoryFeature() {
  const router = useRouter();
  const requireAuth = useRequireAuth('open-pack');
  const {
    getUnopened,
    openBoosterPack,
    initializeInventory
  } = useInventoryStore();

  const [isOpening, setIsOpening] = useState(false);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [rewardCards, setRewardCards] = useState<Card[]>([]);
  const [rewardTitle, setRewardTitle] = useState('');
  const [openingPack, setOpeningPack] = useState<InventoryBoosterPack | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPackOpen, setPendingPackOpen] = useState<InventoryBoosterPack | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(false);
  const [isOnChainOpen, setIsOnChainOpen] = useState(false);
  const [showAnimatedReveal, setShowAnimatedReveal] = useState(false);
  const [animationCards, setAnimationCards] = useState<Card[]>([]);

  useEffect(() => {
    initializeInventory();
  }, [initializeInventory]);

  const unopenedPacks = getUnopened();

  const getPackImageUrl = (pack: InventoryBoosterPack): string => {
    if (pack.artUrl) return pack.artUrl;
    const artUrlMap: Record<string, string> = {
      'Beginner': '/boosters/beginner.png',
      'Advanced': '/boosters/advanced.png',
      'Expert': '/boosters/expert.png'
    };
    const rarity = pack.name.split(' ')[0];
    return artUrlMap[rarity] || '/boosters/beginner.png';
  };

  const handleOpenPack = async (pack: InventoryBoosterPack) => {
    if (isOpening || isProcessing) return;
    setPendingPackOpen(pack);
    setShowConfirmModal(true);
  };

  const handleConfirmOpenPack = async () => {
    const pack = pendingPackOpen;
    if (!pack || isProcessing || isOpening) return;
    requireAuth(() => { void runOpenPack(pack); });
  };

  const runOpenPack = async (pack: InventoryBoosterPack) => {
    setIsProcessing(true);
    setIsOpening(true);
    setShowConfirmModal(false);

    try {
      const cards = await openBoosterPack(pack.id);

      if (cards.length > 0) {
        setIsOnChainOpen(false);
        setAnimationCards(cards);
        setOpeningPack(pack);
        setShowOpeningAnimation(true);
      } else {
        toast.error('No cards were generated from this pack!');
        setIsOpening(false);
      }
    } catch {
      toast.error('Failed to open pack. Please try again.');
      setIsOpening(false);
    } finally {
      setIsProcessing(false);
      setPendingPackOpen(null);
    }
  };

  const handleAnimatedRevealComplete = () => {
    setShowAnimatedReveal(false);
    setIsOnChainOpen(false);
    if (animationCards.length > 0) {
      setRewardCards(animationCards);
      setRewardTitle(`Opened ${openingPack?.name || 'Pack'}`);
      setShowRewardPopup(true);
      toast.success(`Received ${animationCards.length} cards!`);
    }
    setOpeningPack(null);
    setAnimationCards([]);
    setIsOpening(false);
  };

  const handleOpeningAnimationComplete = () => {
    setShowOpeningAnimation(false);
    if (animationCards.length > 0) {
      setRewardCards(animationCards);
      setRewardTitle(`Opened ${openingPack?.name || 'Pack'}`);
      setShowRewardPopup(true);
      toast.success(`Received ${animationCards.length} cards!`);
    }
    setOpeningPack(null);
    setAnimationCards([]);
    setIsOpening(false);
  };

  const handleTradeOnMarketplace = () => {
    window.open('https://www.tensor.trade/', '_blank');
    toast.info('Opening NFT marketplace to trade your booster packs...');
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'beginner': return 'bg-gray-100 text-gray-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto min-h-dvh pt-14" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
      <motion.div
        className="max-w-md mx-auto p-4 w-full"
        initial={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Package className="text-spektrum-orange" size={28} />
            Inventory
          </h1>
          <p className="text-gray-500 text-sm">Manage your collection and booster packs</p>
        </motion.div>

        {/* Collection Badges */}
        <CollectionBadges />

        {/* Stats Section */}
        <div className="mb-6">
          <div className="bg-gray-900 border-2 border-orange-500 p-4 rounded-xl text-center" style={{ boxShadow: '0 0 25px rgba(249, 115, 22, 0.15)' }}>
            <div className="text-lg font-bold text-orange-400">{unopenedPacks.length}</div>
            <div className="text-sm text-gray-500">Unopened Packs</div>
          </div>
        </div>

        {/* Trade Button */}
        {unopenedPacks.length > 0 && (
          <Button
            onClick={handleTradeOnMarketplace}
            className="w-full mb-6 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white border border-orange-400 font-semibold"
            style={{ boxShadow: '0 0 25px rgba(249, 115, 22, 0.4)' }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Trade Packs on NFT Marketplace
          </Button>
        )}

        {/* Unopened Packs Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-orange-400 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Unopened Packs ({unopenedPacks.length})
          </h2>
        </div>

        {/* Content */}
        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-orange-600 scrollbar-track-gray-800">
          {unopenedPacks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No booster packs in inventory</p>
              <p className="text-sm">Purchase packs from the shop to get started!</p>
              <Button
                onClick={() => router.push('/shop/booster')}
                className="mt-4 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white border border-orange-400 font-semibold"
                style={{ boxShadow: '0 0 15px rgba(249, 115, 22, 0.4)' }}
              >
                Buy Booster Packs
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 pr-2">
              {unopenedPacks.map((pack) => (
                <div key={pack.id} className="bg-gray-800 border-2 border-orange-500 border-opacity-40 rounded-lg overflow-hidden hover:border-opacity-100 transition-all" style={{ boxShadow: '0 0 15px rgba(249, 115, 22, 0.1)' }}>
                  <div className="p-2">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-orange-400 text-xs">{pack.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {formatDate(pack.purchaseDate)} &bull; Fire and Water
                        </p>
                      </div>
                      <span className="text-xs font-bold text-orange-400 flex-shrink-0">
                        ${pack.purchasePrice}
                      </span>
                    </div>

                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs text-gray-500 truncate">
                        {pack.cNFTId?.slice(0, 8)}...
                      </span>
                      <Button
                        onClick={() => handleOpenPack(pack)}
                        disabled={isOpening}
                        className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white h-7 px-2 font-semibold border border-orange-400 text-xs flex-shrink-0"
                        size="sm"
                      >
                        {isOpening ? (
                          <span className="flex items-center text-xs">
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1"></div>
                            Opening...
                          </span>
                        ) : 'Open'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Animated Card Reveal */}
      {showAnimatedReveal && openingPack && animationCards.length > 0 && (
        <AnimatedCardReveal
          packImageUrl={getPackImageUrl(openingPack)}
          packName={openingPack.name}
          cards={animationCards}
          onComplete={handleAnimatedRevealComplete}
          isOnChain={isOnChainOpen}
        />
      )}

      {/* Spektrum Pack Opener */}
      {showOpeningAnimation && openingPack && (
        <SpektrumPackOpener
          packImageUrl={getPackImageUrl(openingPack)}
          packName={openingPack.name}
          cards={animationCards}
          onAnimationComplete={handleOpeningAnimationComplete}
        />
      )}

      {/* Card Reward Popup */}
      <CardRewardPopup
        isOpen={showRewardPopup}
        onClose={() => setShowRewardPopup(false)}
        title={rewardTitle}
        subtitle="Cards added to your collection"
        cards={rewardCards}
      />

      {/* Pack Opening Confirmation Modal */}
      {pendingPackOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 ${showConfirmModal ? '' : 'hidden'}`}>
          <div className="bg-gray-900 border-2 border-orange-500 rounded-xl shadow-2xl max-w-lg w-full p-6 relative" style={{ boxShadow: '0 0 40px rgba(249, 115, 22, 0.3)' }}>
            {!isProcessing && (
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingPackOpen(null);
                }}
                className="absolute top-4 right-4 text-orange-400 hover:text-orange-300 transition-colors"
              >
                X
              </button>
            )}

            <div className="flex items-center gap-3 mb-6">
              <div className="bg-orange-600/20 p-3 rounded-lg border border-orange-500/50">
                <ShoppingCart className="text-orange-400" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-orange-400">Open Booster Pack</h2>
            </div>

            {/* Pack Image */}
            <div className="mb-6 flex justify-center">
              <SafeCardImage
                src={getPackImageUrl(pendingPackOpen)}
                alt={pendingPackOpen.name}
                className="w-40 h-auto object-contain rounded-lg border border-orange-500/30"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">{pendingPackOpen.name}</h3>
              <p className="text-sm text-gray-300">
                Reveal {pendingPackOpen.pack.cardCount} cards from this pack
              </p>
            </div>

            <div className="bg-gray-800 border-2 border-orange-500 border-opacity-30 rounded-lg p-4 mb-6" style={{ boxShadow: '0 0 15px rgba(249, 115, 22, 0.1)' }}>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Price:</span>
                <span className="text-2xl font-bold text-orange-400">$0.00 USDC</span>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-300 text-center">
                This is a mock purchase. No real payment will be processed.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingPackOpen(null);
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-orange-500 border-opacity-40 text-gray-300 font-semibold hover:bg-gray-800 hover:border-opacity-100 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOpenPack}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-orange-400"
                style={{ boxShadow: '0 0 20px rgba(249, 115, 22, 0.4)' }}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Confirm Purchase
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
