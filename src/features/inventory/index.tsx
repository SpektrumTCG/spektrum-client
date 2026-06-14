"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useInventoryStore } from '@/stores/useInventoryStore';
import type { InventoryBoosterPack } from '@/stores/useInventoryStore';
import type { Card } from '@spektrum/shared';
import { toast } from 'sonner';
import { SafeCardImage } from '@/components/shared/SafeCardImage';
import { useRequireAuth } from '@/components/shared/AuthGateModal';
import { AnimatedCardReveal } from '@/components/shared/AnimatedCardReveal';
import dynamic from 'next/dynamic';

// three.js + GLB only load when a pack is actually opened — keeps the
// inventory bundle light for users who just browse.
const PackOpener3D = dynamic(
  () => import('@/components/pack-opener-3d/PackOpener3D').then((m) => m.PackOpener3D),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-400 border-t-transparent" />
      </div>
    ),
  }
);
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { motion } from 'framer-motion';

export function InventoryFeature({ highlightPackId }: { highlightPackId?: string }) {
  const router = useRouter();
  const requireAuth = useRequireAuth('open-pack');
  const [highlightId, setHighlightId] = useState<string | undefined>(highlightPackId);
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const {
    getUnopened,
    openBoosterPack,
    initializeInventory
  } = useInventoryStore();

  const [isOpening, setIsOpening] = useState(false);
  const [openingPack, setOpeningPack] = useState<InventoryBoosterPack | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(false);
  const [isOnChainOpen, setIsOnChainOpen] = useState(false);
  const [showAnimatedReveal, setShowAnimatedReveal] = useState(false);
  const [animationCards, setAnimationCards] = useState<Card[]>([]);

  useEffect(() => {
    initializeInventory();
  }, [initializeInventory]);

  const unopenedPacks = getUnopened();

  const isBundle = (pack: InventoryBoosterPack) => (pack.bundleSize ?? 1) > 1;
  const packsLeft = (pack: InventoryBoosterPack) =>
    pack.packsRemaining ?? pack.bundleSize ?? 1;

  const singlePacks = unopenedPacks.filter((p) => !isBundle(p));
  const bundlePacks = unopenedPacks.filter(isBundle);

  // Only highlight when ?new= still points at a real unopened pack (ignore stale links)
  const activeHighlight =
    highlightId && unopenedPacks.some((p) => p.id === highlightId) ? highlightId : undefined;

  // Bring the freshly-purchased pack into view so the buy flow lands on it
  useEffect(() => {
    if (activeHighlight && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeHighlight]);

  const dismissHighlight = () => {
    setHighlightId(undefined);
    router.replace('/inventory');
  };

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

  const handleOpenPack = (pack: InventoryBoosterPack) => {
    if (isOpening || isProcessing) return;
    // warm the 3D chunk + GLB + card-back texture before the reveal
    void import('@/components/pack-opener-3d/PackOpener3D')
      .then((m) => m.preloadPackOpenerAssets(getPackImageUrl(pack)))
      .catch(() => { /* preload is best-effort; opener falls back if needed */ });
    requireAuth(() => { void runOpenPack(pack); });
  };

  // Open-now from the highlighted just-bought pack: no purchase-y confirm modal,
  // the user already committed in the shop — go straight to the reveal.
  const handleOpenNow = (pack: InventoryBoosterPack) => {
    if (isOpening || isProcessing) return;
    setHighlightId(undefined);
    router.replace('/inventory');
    void import('@/components/pack-opener-3d/PackOpener3D')
      .then((m) => m.preloadPackOpenerAssets(getPackImageUrl(pack)))
      .catch(() => { /* preload is best-effort */ });
    requireAuth(() => { void runOpenPack(pack); });
  };

  const runOpenPack = async (pack: InventoryBoosterPack) => {
    setIsProcessing(true);
    setIsOpening(true);

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
    }
  };

  // After a pack reveal finishes, reset back to the inventory list. Bundles keep
  // their remaining sealed packs in the grid — the user opens the next from there.
  const finishReveal = () => {
    if (animationCards.length > 0) {
      toast.success(`Received ${animationCards.length} cards!`);
    }
    setOpeningPack(null);
    setAnimationCards([]);
    setIsOpening(false);
  };

  const handleAnimatedRevealComplete = () => {
    setShowAnimatedReveal(false);
    setIsOnChainOpen(false);
    finishReveal();
  };

  const handleOpeningAnimationComplete = () => {
    setShowOpeningAnimation(false);
    finishReveal();
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

  const renderPack = (pack: InventoryBoosterPack) => {
    const isNew = pack.id === activeHighlight;
    const bundle = isBundle(pack);
    const left = packsLeft(pack);
    return (
      <div
        key={pack.id}
        ref={isNew ? highlightRef : undefined}
        className={`relative h-full ${bundle ? 'mt-2.5' : ''}`}
      >
        {/* Stacked sealed packs — only on bundles, to read as a multi-pack */}
        {bundle && (
          <>
            <div aria-hidden className="absolute -top-2.5 left-5 right-5 h-3 rounded-t-xl border-2 border-b-0 border-orange-500/25 bg-gray-800/70" />
            <div aria-hidden className="absolute -top-1.5 left-3 right-3 h-3 rounded-t-xl border-2 border-b-0 border-orange-500/40 bg-gray-800/90" />
          </>
        )}

        <div
          className={`relative flex h-full flex-col bg-gray-800 border-2 rounded-xl overflow-hidden transition-all ${isNew ? 'border-orange-500 animate-[pulse_1.6s_ease-in-out_3]' : 'border-orange-500 border-opacity-40 hover:border-opacity-100'}`}
          style={{ boxShadow: isNew ? '0 0 28px rgba(249, 115, 22, 0.55)' : '0 0 15px rgba(249, 115, 22, 0.1)' }}
        >
          {/* Pack art */}
          <div className="relative flex aspect-[4/5] items-center justify-center bg-gray-900/40 p-3">
            <SafeCardImage
              src={getPackImageUrl(pack)}
              alt={pack.name}
              className="max-h-full max-w-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
              {isNew && (
                <span className="rounded bg-orange-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                  New
                </span>
              )}
            </div>

            {/* Price */}
            <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-orange-400">
              ${pack.purchasePrice}
            </span>

            {/* Quantity chip — marks this as a multi-pack at a glance */}
            {bundle && (
              <span className="absolute bottom-2 left-2 rounded-md bg-orange-500 px-2 py-0.5 text-sm font-extrabold text-white shadow-[0_0_12px_rgba(249,115,22,0.6)]">
                {pack.bundleSize}×
              </span>
            )}
          </div>

          {/* Info + action */}
          <div className="flex flex-1 flex-col gap-2 p-2.5">
            <div className="min-w-0">
              <h3 className="font-bold text-orange-400 text-sm truncate">
                {bundle ? `${pack.bundleSize}× ${pack.name}` : pack.name}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                {bundle
                  ? `${left} of ${pack.bundleSize} packs sealed`
                  : formatDate(pack.purchaseDate)}
              </p>
            </div>

            <div className="mt-auto">
              {isNew ? (
                <div className="flex flex-col gap-1.5">
                  <Button
                    onClick={() => handleOpenNow(pack)}
                    disabled={isOpening}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white h-8 font-semibold border border-orange-400 text-xs"
                    size="sm"
                  >
                    {isOpening ? (
                      <span className="flex items-center text-xs">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1"></div>
                        Opening...
                      </span>
                    ) : bundle ? 'Open first pack' : 'Open now'}
                  </Button>
                  <button
                    onClick={dismissHighlight}
                    disabled={isOpening}
                    className="text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
                  >
                    Later
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() => handleOpenPack(pack)}
                  disabled={isOpening}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white h-8 font-semibold border border-orange-400 text-xs"
                  size="sm"
                >
                  {isOpening ? (
                    <span className="flex items-center text-xs">
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-1"></div>
                      Opening...
                    </span>
                  ) : bundle ? 'Open pack' : 'Open'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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
          className="mb-8 flex items-center gap-3"
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <Package className="text-spektrum-orange flex-shrink-0" size={28} />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">Inventory</h1>
            <p className="text-gray-500 text-sm">Manage your collection and booster packs</p>
          </div>
        </motion.div>

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
            <div>
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-orange-400 flex items-center">
                  <Package className="w-4 h-4 mr-2 flex-shrink-0" />
                  Unopened Packs
                </h2>
                <span className="rounded-full bg-orange-500/15 border border-orange-500/40 px-2.5 py-0.5 text-xs font-bold text-orange-400">
                  {unopenedPacks.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[...singlePacks, ...bundlePacks].map(renderPack)}
              </div>
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

      {/* 3D Pack Opener (falls back to CSS opener without WebGL) */}
      {showOpeningAnimation && openingPack && (
        <PackOpener3D
          packImageUrl={getPackImageUrl(openingPack)}
          packName={openingPack.name}
          cards={animationCards}
          onAnimationComplete={handleOpeningAnimationComplete}
        />
      )}
    </div>
  );
}
