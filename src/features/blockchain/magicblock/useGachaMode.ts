import { useCallback, useEffect } from 'react';
import { useOnChainGachaStore, type GachaMode } from '../../game/stores/useOnChainGachaStore';
import type { PackType, SlotResult } from './gachaSession';
import type { Card } from '../../game/data/cardTypes';

export interface UseGachaModeReturn {
  mode: GachaMode;
  isOnChain: boolean;
  erAvailable: boolean | null;
  isSessionActive: boolean;
  isRevealing: boolean;
  revealedCards: Card[];
  currentSlotIndex: number;
  error: string | null;

  toggleMode: () => void;
  checkAvailability: () => Promise<boolean>;
  openPackOnChain: (packType: PackType, walletAddress: string, allCards: Card[]) => Promise<Card[]>;
  resetSession: () => void;
}

export function useGachaMode(): UseGachaModeReturn {
  const store = useOnChainGachaStore();

  useEffect(() => {
    if (store.erAvailable === null) {
      store.checkERAvailability();
    }
  }, []);

  const toggleMode = useCallback(() => {
    store.setMode(store.mode === 'onchain' ? 'offchain' : 'onchain');
  }, [store.mode]);

  const checkAvailability = useCallback(async () => {
    return store.checkERAvailability();
  }, []);

  const openPackOnChain = useCallback(async (
    packType: PackType,
    walletAddress: string,
    allCards: Card[],
  ): Promise<Card[]> => {
    try {
      await store.startSession(packType, walletAddress, allCards);

      await store.revealAllSlots(allCards);

      const cards = await store.finalizeSession();

      return cards;
    } catch (error) {
      console.error('[useGachaMode] On-chain pack opening failed:', error);
      throw error;
    }
  }, []);

  const resetSession = useCallback(() => {
    store.resetSession();
  }, []);

  return {
    mode: store.mode,
    isOnChain: store.mode === 'onchain',
    erAvailable: store.erAvailable,
    isSessionActive: store.isSessionActive,
    isRevealing: store.isRevealing,
    revealedCards: store.revealedCards,
    currentSlotIndex: store.currentSlotIndex,
    error: store.error,
    toggleMode,
    checkAvailability,
    openPackOnChain,
    resetSession,
  };
}

export function mapPackTierToPackType(tierName: string): PackType {
  const name = tierName.toLowerCase();
  if (name.includes('beginner')) return 'beginner';
  if (name.includes('advanced')) return 'advanced';
  if (name.includes('expert')) return 'expert';
  return 'beginner';
}
