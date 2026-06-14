"use client"

import React, { useCallback, useRef, useState } from 'react';
import type { Card } from '@spektrum/shared';
import { useInventoryStore } from '@/stores/useInventoryStore';
import type { InventoryBoosterPack } from '@/stores/useInventoryStore';
import { PackOpener3D } from './PackOpener3D';
import { PackCarousel3D } from './PackCarousel3D';

interface BundlePackOpenerProps {
  pack: InventoryBoosterPack;
  packArt: string;
  /** Called when the bundle is exhausted or the user exits — receives every card revealed this session. */
  onExit: (cards: Card[]) => void;
}

/**
 * Drives the 10x bundle experience: a 3D carousel hub, then the standard
 * single-pack opener (full tear) for each sealed pack. "Open All" chains
 * straight through every pack; tapping OPEN opens one and returns to the hub.
 * Only one R3F Canvas is mounted at a time (carousel XOR opener) to avoid a
 * second WebGL context on mobile.
 */
export function BundlePackOpener({ pack, packArt, onExit }: BundlePackOpenerProps) {
  const openBoosterPack = useInventoryStore((s) => s.openBoosterPack);
  // Subscribe so the carousel count updates as packs are consumed.
  const remaining = useInventoryStore(
    (s) => s.boosterPacks.find((p) => p.id === pack.id)?.packsRemaining ?? 0
  );

  const [phase, setPhase] = useState<'carousel' | 'opening'>('carousel');
  const [activeCards, setActiveCards] = useState<Card[]>([]);
  const [openKey, setOpenKey] = useState(0); // forces a fresh opener per pack
  const openAllRef = useRef(false);
  const accRef = useRef<Card[]>([]);

  const doOpen = useCallback(async () => {
    setActiveCards([]);
    setPhase('opening');
    const cards = await openBoosterPack(pack.id);
    if (!cards.length) {
      // Open failed (e.g. nothing generated) — back to the hub.
      openAllRef.current = false;
      setPhase('carousel');
      return;
    }
    setActiveCards(cards);
    setOpenKey((k) => k + 1);
  }, [openBoosterPack, pack.id]);

  const handleOpenOne = useCallback(() => {
    openAllRef.current = false;
    void doOpen();
  }, [doOpen]);

  const handleOpenAll = useCallback(() => {
    openAllRef.current = true;
    void doOpen();
  }, [doOpen]);

  const handleRevealComplete = useCallback(() => {
    accRef.current = [...accRef.current, ...activeCards];
    setActiveCards([]);
    const left =
      useInventoryStore.getState().boosterPacks.find((p) => p.id === pack.id)?.packsRemaining ?? 0;
    if (left <= 0) {
      onExit(accRef.current);
      return;
    }
    if (openAllRef.current) {
      void doOpen(); // chain straight into the next pack
    } else {
      setPhase('carousel');
    }
  }, [activeCards, doOpen, onExit, pack.id]);

  const handleClose = useCallback(() => {
    onExit(accRef.current);
  }, [onExit]);

  if (phase === 'opening') {
    if (activeCards.length === 0) {
      // Brief window while the pack's cards are generated.
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
        </div>
      );
    }
    return (
      <PackOpener3D
        key={openKey}
        packImageUrl={packArt}
        packName={pack.name}
        cards={activeCards}
        onAnimationComplete={handleRevealComplete}
      />
    );
  }

  return (
    <PackCarousel3D
      packArt={packArt}
      count={remaining}
      title={`Your ${pack.bundleSize ?? remaining}-Pack Opening`}
      onOpenOne={handleOpenOne}
      onOpenAll={handleOpenAll}
      onClose={handleClose}
    />
  );
}
