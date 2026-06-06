import { create } from 'zustand';
import { apiFetch } from '@/lib/api';
import { cardNftService, type WalletStatus } from '@/features/blockchain/solana/cardNftService';
import type { Card } from '@spektrum/shared';

interface PlayerProfile {
  displayName: string | null;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  country: string | null;
  region: string | null;
}

interface WalletStore {
  isConnected: boolean;
  isReconnecting: boolean;
  walletAddress: string | null;
  walletType: string | null;
  balance: number;
  nftCards: Card[];
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastConnectionError: string | null;
  playerProfile: PlayerProfile | null;
  isNewPlayer: boolean;

  hydrateFromAuth: (input: { walletAddress: string | null; walletType?: string | null }) => Promise<void>;
  clearOnSignOut: () => Promise<void>;
  refreshWalletData: () => Promise<void>;
  syncNftCards: () => Promise<void>;
  getWalletStatus: () => Promise<WalletStatus>;

  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  setWalletData: (data: { address: string; balance: number; walletType?: string }) => void;
  setNftCards: (cards: Card[]) => void;
  setError: (error: string | null) => void;
}

let lastHydratedAddress: string | null = null;

export const useWalletStore = create<WalletStore>()((set, get) => ({
  isConnected: false,
  isReconnecting: true,
  walletAddress: null,
  walletType: null,
  isNewPlayer: false,
  balance: 0,
  nftCards: [],
  connectionStatus: 'disconnected',
  lastConnectionError: null,
  playerProfile: null,

  hydrateFromAuth: async ({ walletAddress, walletType }) => {
    if (!walletAddress) {
      cardNftService.setWallet(null);
      set({
        isConnected: false,
        isReconnecting: false,
        walletAddress: null,
        walletType: null,
        connectionStatus: 'disconnected',
        playerProfile: null,
        isNewPlayer: false,
        nftCards: [],
        balance: 0,
      });
      lastHydratedAddress = null;
      return;
    }

    cardNftService.setWallet(walletAddress);

    if (lastHydratedAddress === walletAddress) return;

    const previousAddress = lastHydratedAddress;
    lastHydratedAddress = walletAddress;

    if (previousAddress && previousAddress !== walletAddress) {
      localStorage.removeItem('spektrum-collection-storage');
      localStorage.removeItem('deck-store');
      localStorage.removeItem('inventory-storage');
      localStorage.removeItem('tutorial_completed');
      localStorage.removeItem('tutorial_progress');
      localStorage.removeItem('ritual_completed');
      localStorage.removeItem('spektrum_ritual_completed');
      localStorage.removeItem('spektrum_tutorial_progress');
      const { useDeckStore } = await import('./useDeckStore');
      useDeckStore.setState({ ownedCards: [], decks: [], activeDeckId: null });
      const { useInventoryStore } = await import('./useInventoryStore');
      useInventoryStore.setState({ boosterPacks: [] });
    }

    set({
      connectionStatus: 'connecting',
      isReconnecting: true,
      walletAddress,
      walletType: walletType ?? 'privy',
      lastConnectionError: null,
    });

    try {
      const response = await apiFetch('/api/player/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        set({
          isConnected: true,
          isReconnecting: false,
          connectionStatus: 'connected',
          isNewPlayer: !!data.isNewPlayer,
          playerProfile: data.player ? {
            displayName: data.player.displayName || null,
            gamesPlayed: data.player.gamesPlayed || 0,
            gamesWon: data.player.gamesWon || 0,
            gamesLost: data.player.gamesLost || 0,
            country: data.player.country || null,
            region: data.player.region || null,
          } : null,
        });
      } else {
        set({
          isConnected: true,
          isReconnecting: false,
          connectionStatus: 'connected',
        });
      }
    } catch {
      set({
        isConnected: true,
        isReconnecting: false,
        connectionStatus: 'connected',
      });
    }

    try {
      await get().syncNftCards();
    } catch {}

    try {
      const { useDeckStore } = await import('./useDeckStore');
      await useDeckStore.getState().syncCardsFromDatabase();
      await useDeckStore.getState().syncDecksFromDatabase();
    } catch {}

    try {
      const { useInventoryStore } = await import('./useInventoryStore');
      await useInventoryStore.getState().syncPacksFromDatabase();
    } catch {}

    try {
      const { useSeekerStore } = await import('./useSeekerStore');
      await useSeekerStore.getState().fetchSeekerStatus(walletAddress);
    } catch {}
  },

  clearOnSignOut: async () => {
    lastHydratedAddress = null;
    cardNftService.setWallet(null);
    localStorage.removeItem('spektrum-collection-storage');
    localStorage.removeItem('deck-store');
    localStorage.removeItem('inventory-storage');
    localStorage.removeItem('tutorial_completed');
    localStorage.removeItem('tutorial_progress');
    localStorage.removeItem('ritual_completed');
    localStorage.removeItem('spektrum_ritual_completed');
    localStorage.removeItem('spektrum_tutorial_progress');

    set({
      isConnected: false,
      isReconnecting: false,
      walletAddress: null,
      walletType: null,
      balance: 0,
      nftCards: [],
      connectionStatus: 'disconnected',
      lastConnectionError: null,
      playerProfile: null,
      isNewPlayer: false,
    });

    try {
      const { useSeekerStore } = await import('./useSeekerStore');
      useSeekerStore.getState().reset();
    } catch {}
  },

  refreshWalletData: async () => {
    if (!get().isConnected) return;
    try {
      await get().syncNftCards();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh wallet data';
      set({ lastConnectionError: message });
    }
  },

  syncNftCards: async () => {
    if (!get().isConnected) return;
    try {
      const nftCards = await cardNftService.getOwnedCards();
      set({ nftCards });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync NFT cards';
      set({ lastConnectionError: message });
    }
  },

  getWalletStatus: async () => {
    try {
      return await cardNftService.getWalletStatus();
    } catch {
      return { connected: false, address: null, balance: 0 };
    }
  },

  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setWalletData: (data) =>
    set({
      walletAddress: data.address,
      walletType: data.walletType || null,
      balance: data.balance,
      isConnected: true,
      connectionStatus: 'connected',
    }),
  setNftCards: (cards) => set({ nftCards: cards }),
  setError: (error) => set({ lastConnectionError: error }),
}));
