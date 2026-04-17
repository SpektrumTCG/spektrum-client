import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cardNftService, type WalletStatus } from '@/features/blockchain/solana/cardNftService';
import { parsePhantomCallback, hasPhantomSession } from '@/features/blockchain/solana/phantomDeeplink';
import { parseSolflareCallback, hasSolflareSession } from '@/features/blockchain/solana/solflareDeeplink';
import { parseBackpackCallback, hasBackpackSession } from '@/features/blockchain/solana/backpackDeeplink';
import type { Card } from '@/domain/game/types';

interface PlayerProfile {
  displayName: string | null;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  country: string | null;
  region: string | null;
}

interface WalletStore {
  // Wallet state
  isConnected: boolean;
  isReconnecting: boolean;
  walletAddress: string | null;
  walletType: string | null; // Which wallet is connected (phantom, solflare, etc.)
  savedWalletAddress: string | null; // Persisted wallet address for auto-reconnect
  savedWalletType: string | null; // Persisted wallet type for auto-reconnect
  balance: number;
  nftCards: Card[];
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastConnectionError: string | null;
  playerProfile: PlayerProfile | null;
  isNewPlayer: boolean; // True when wallet was just registered for the first time (no server data yet)

  // Actions
  connectWallet: (walletName?: string) => Promise<boolean>;
  disconnectWallet: () => Promise<void>;
  refreshWalletData: () => Promise<void>;
  syncNftCards: () => Promise<void>;
  getWalletStatus: () => Promise<WalletStatus>;
  attemptAutoReconnect: () => Promise<boolean>;

  // Internal actions
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  setWalletData: (data: { address: string; balance: number; walletType?: string }) => void;
  setNftCards: (cards: Card[]) => void;
  setError: (error: string | null) => void;

  // --- EMAIL AUTH (removable) ---
  isEmailAuth: boolean;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<boolean>;
  // --- END EMAIL AUTH ---
}

function getWalletProvider(walletType: string | null): any {
  if (!walletType || typeof window === 'undefined') return null;
  const win = window as any;
  switch (walletType) {
    case 'phantom':  return win.phantom?.solana ?? win.solana ?? null;
    case 'solflare': return win.solflare?.solana ?? win.solflare ?? null;
    case 'backpack': return win.backpack?.solana ?? win.backpack ?? null;
    default:         return win.solana ?? null;
  }
}

let cleanupWalletListeners: (() => void) | null = null;

function attachWalletListeners(
  provider: any,
  walletType: string,
  onExternalChange: () => void
): (() => void) | null {
  if (!provider || typeof provider.on !== 'function') return null;

  const handleAccountChanged = (_newPubkey: any) => {
    onExternalChange();
  };

  const handleDisconnect = () => {
    onExternalChange();
  };

  try {
    provider.on('accountChanged', handleAccountChanged);
    provider.on('disconnect', handleDisconnect);

    return () => {
      try {
        provider.off?.('accountChanged', handleAccountChanged);
        provider.off?.('disconnect', handleDisconnect);
        provider.removeListener?.('accountChanged', handleAccountChanged);
        provider.removeListener?.('disconnect', handleDisconnect);
      } catch {}
    };
  } catch {
    return null;
  }
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      isReconnecting: true,
      walletAddress: null,
      walletType: null,
      isNewPlayer: false,
      savedWalletAddress: null,
      savedWalletType: null,
      balance: 0,
      nftCards: [],
      connectionStatus: 'disconnected',
      lastConnectionError: null,
      playerProfile: null,
      // --- EMAIL AUTH (removable) ---
      isEmailAuth: false,
      // --- END EMAIL AUTH ---

      connectWallet: async (walletName?: string) => {
        try {
          set({ connectionStatus: 'connecting', lastConnectionError: null });

          const clearAccountData = async (newAddress: string) => {
            const previousAddress = get().savedWalletAddress;
            if (previousAddress && previousAddress !== newAddress) {
              localStorage.removeItem('spektrum-collection-storage');
              localStorage.removeItem('deck-store');
              localStorage.removeItem('inventory-storage');
              localStorage.removeItem('tutorial_completed');
              localStorage.removeItem('tutorial_progress');
              localStorage.removeItem('ritual_completed');
              localStorage.removeItem('spektrum_ritual_completed');
              localStorage.removeItem('spektrum_tutorial_progress');
              // Also clear in-memory Zustand state so stale data doesn't persist between users
              const { useDeckStore } = await import('./useDeckStore');
              useDeckStore.setState({ ownedCards: [], decks: [], activeDeckId: null });
              const { useInventoryStore } = await import('./useInventoryStore');
              useInventoryStore.setState({ boosterPacks: [] });
            }
          };

          // Check for Phantom deeplink callback first
          if (walletName === 'phantom' || !walletName) {
            const phantomCallback = parsePhantomCallback();
            if (phantomCallback) {
              await clearAccountData(phantomCallback.publicKey);
              set({
                isConnected: true,
                isReconnecting: false,
                walletAddress: phantomCallback.publicKey,
                walletType: 'phantom',
                savedWalletAddress: phantomCallback.publicKey,
                savedWalletType: 'phantom',
                connectionStatus: 'connected'
              });

              try {
                const response = await fetch('/api/player/connect', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ walletAddress: phantomCallback.publicKey })
                });
                if (response.ok) {
                  const data = await response.json();
                  set({ isNewPlayer: !!data.isNewPlayer });
                  if (data.player) {
                    set({
                      playerProfile: {
                        displayName: data.player.displayName || null,
                        gamesPlayed: data.player.gamesPlayed || 0,
                        gamesWon: data.player.gamesWon || 0,
                        gamesLost: data.player.gamesLost || 0,
                        country: data.player.country || null,
                        region: data.player.region || null,
                      }
                    });
                  }
                }
              } catch {}

              window.history.replaceState(null, '', window.location.pathname);
              return true;
            }
          }

          // Check for Solflare deeplink callback
          if (walletName === 'solflare' || !walletName) {
            const solflareCallback = parseSolflareCallback();
            if (solflareCallback) {
              await clearAccountData(solflareCallback.publicKey);
              set({
                isConnected: true,
                isReconnecting: false,
                walletAddress: solflareCallback.publicKey,
                walletType: 'solflare',
                savedWalletAddress: solflareCallback.publicKey,
                savedWalletType: 'solflare',
                connectionStatus: 'connected'
              });

              try {
                const response = await fetch('/api/player/connect', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ walletAddress: solflareCallback.publicKey })
                });
                if (response.ok) {
                  const data = await response.json();
                  set({ isNewPlayer: !!data.isNewPlayer });
                  if (data.player) {
                    set({
                      playerProfile: {
                        displayName: data.player.displayName || null,
                        gamesPlayed: data.player.gamesPlayed || 0,
                        gamesWon: data.player.gamesWon || 0,
                        gamesLost: data.player.gamesLost || 0,
                        country: data.player.country || null,
                        region: data.player.region || null,
                      }
                    });
                  }
                }
              } catch {}

              window.history.replaceState(null, '', window.location.pathname);
              return true;
            }
          }

          if (walletName === 'backpack' || !walletName) {
            const backpackCallback = parseBackpackCallback();
            if (backpackCallback) {
              await clearAccountData(backpackCallback.publicKey);
              set({
                isConnected: true,
                isReconnecting: false,
                walletAddress: backpackCallback.publicKey,
                walletType: 'backpack',
                savedWalletAddress: backpackCallback.publicKey,
                savedWalletType: 'backpack',
                connectionStatus: 'connected'
              });

              try {
                const response = await fetch('/api/player/connect', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ walletAddress: backpackCallback.publicKey })
                });
                if (response.ok) {
                  const data = await response.json();
                  set({ isNewPlayer: !!data.isNewPlayer });
                  if (data.player) {
                    set({
                      playerProfile: {
                        displayName: data.player.displayName || null,
                        gamesPlayed: data.player.gamesPlayed || 0,
                        gamesWon: data.player.gamesWon || 0,
                        gamesLost: data.player.gamesLost || 0,
                        country: data.player.country || null,
                        region: data.player.region || null,
                      }
                    });
                  }
                }
              } catch {}

              window.history.replaceState(null, '', window.location.pathname);
              return true;
            }
          }

          const walletStatus = await cardNftService.connect(walletName);

          if (walletStatus.connected && walletStatus.address) {
            await clearAccountData(walletStatus.address);
            set({
              isConnected: true,
              isReconnecting: false,
              walletAddress: walletStatus.address,
              walletType: walletName || 'default',
              savedWalletAddress: walletStatus.address, // Save for auto-reconnect
              savedWalletType: walletName || 'phantom',
              balance: walletStatus.balance,
              connectionStatus: 'connected'
            });

            // Attach dynamic event listeners to detect external account switches / disconnects
            cleanupWalletListeners?.();
            const resolvedProvider = getWalletProvider(walletName || null);
            cleanupWalletListeners = attachWalletListeners(
              resolvedProvider,
              walletName || 'phantom',
              () => get().disconnectWallet()
            );

            // FIRST: Register player with server - this associates wallet with session
            // Must happen BEFORE any other API calls that need session authentication
            if (walletStatus.address) {
              try {
                const response = await fetch('/api/player/connect', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include', // Include session cookie for wallet-session association
                  body: JSON.stringify({
                    walletAddress: walletStatus.address,
                  }),
                });

                const data = await response.json();

                set({ isNewPlayer: !!data.isNewPlayer });

                if (data.player) {
                  set({
                    playerProfile: {
                      displayName: data.player.displayName || null,
                      gamesPlayed: data.player.gamesPlayed || 0,
                      gamesWon: data.player.gamesWon || 0,
                      gamesLost: data.player.gamesLost || 0,
                      country: data.player.country || null,
                      region: data.player.region || null,
                    }
                  });
                }
              } catch {
                // Don't fail the connection if registration fails
              }
            }

            // SECOND: Sync NFT cards after player registration
            try {
              await get().syncNftCards();
            } catch {
              // Don't fail the connection if NFT sync fails
            }

            // THIRD: Sync cards from database (now wallet is associated with session)
            try {
              const { useDeckStore } = await import('./useDeckStore');
              await useDeckStore.getState().syncCardsFromDatabase();
            } catch {
              // Don't fail the connection if database sync fails
            }

            // FOURTH: Sync decks from database
            try {
              const { useDeckStore } = await import('./useDeckStore');
              await useDeckStore.getState().syncDecksFromDatabase();
            } catch {}

            // FIFTH: Sync booster packs from database
            try {
              const { useInventoryStore } = await import('./useInventoryStore');
              await useInventoryStore.getState().syncPacksFromDatabase();
            } catch {}

            // SIXTH: Fetch Seeker verification status
            try {
              const { useSeekerStore } = await import('./useSeekerStore');
              await useSeekerStore.getState().fetchSeekerStatus(walletStatus.address);
            } catch {}

            return true;
          } else {
            set({
              connectionStatus: 'error',
              lastConnectionError: 'Failed to connect wallet'
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
          set({
            connectionStatus: 'error',
            lastConnectionError: errorMessage
          });
          return false;
        }
      },

      disconnectWallet: async () => {
        try {
          cleanupWalletListeners?.();
          cleanupWalletListeners = null;

          await cardNftService.disconnect();

          localStorage.removeItem('spektrum-collection-storage');
          localStorage.removeItem('deck-store');
          localStorage.removeItem('inventory-storage');
          localStorage.removeItem('tutorial_completed');
          localStorage.removeItem('tutorial_progress');
          localStorage.removeItem('ritual_completed');
          localStorage.removeItem('spektrum_ritual_completed');
          localStorage.removeItem('spektrum_tutorial_progress');

          const cryptoKeys = [
            'phantom_session', 'phantom_dapp_keypair',
            'solflare_session',
            'backpack_session', 'backpack_dapp_keypair',
          ];
          cryptoKeys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          });

          set({
            isConnected: false,
            walletAddress: null,
            walletType: null,
            savedWalletAddress: null,
            savedWalletType: null,
            balance: 0,
            nftCards: [],
            connectionStatus: 'disconnected',
            // --- EMAIL AUTH (removable) ---
            isEmailAuth: false,
            // --- END EMAIL AUTH ---
            lastConnectionError: null,
            playerProfile: null,
            isNewPlayer: false,
          });

          try {
            const { useSeekerStore } = await import('./useSeekerStore');
            useSeekerStore.getState().reset();
          } catch {}

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown disconnection error';
          set({ lastConnectionError: errorMessage });
        }
      },

      refreshWalletData: async () => {
        try {
          if (!get().isConnected) {
            return;
          }

          const walletStatus = await cardNftService.getWalletStatus();

          if (walletStatus.connected) {
            set({
              walletAddress: walletStatus.address,
              balance: walletStatus.balance
            });

            // Also refresh NFT cards
            try {
              await get().syncNftCards();
            } catch {
              // Don't fail the refresh if NFT sync fails
            }
          } else {
            // Wallet got disconnected
            await get().disconnectWallet();
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to refresh wallet data';
          set({ lastConnectionError: errorMessage });
        }
      },

      syncNftCards: async () => {
        try {
          if (!get().isConnected) {
            return;
          }

          const nftCards = await cardNftService.getOwnedCards();
          set({ nftCards });

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to sync NFT cards';
          set({ lastConnectionError: errorMessage });
        }
      },

      getWalletStatus: async () => {
        try {
          return await cardNftService.getWalletStatus();
        } catch {
          return {
            connected: false,
            address: null,
            balance: 0
          };
        }
      },

      attemptAutoReconnect: async () => {
        const { savedWalletAddress, savedWalletType, isConnected, connectionStatus } = get();

        if (isConnected) {
          set({ isReconnecting: false });
          return true;
        }

        if (connectionStatus === 'connecting') {
          set({ isReconnecting: false });
          return false;
        }

        if (!savedWalletAddress) {
          set({ isReconnecting: false });
          return false;
        }

        // --- EMAIL AUTH auto-reconnect (removable) ---
        if (get().isEmailAuth && savedWalletAddress.startsWith('email_')) {
          try {
            set({ connectionStatus: 'connecting' });
            const res = await fetch('/api/player/connect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ walletAddress: savedWalletAddress }),
            });
            if (res.ok) {
              const data = await res.json();
              set({
                isConnected: true,
                isReconnecting: false,
                walletAddress: savedWalletAddress,
                walletType: 'email',
                balance: 0,
                connectionStatus: 'connected',
                isEmailAuth: true,
                playerProfile: data.player ? {
                  displayName: data.player.displayName || null,
                  gamesPlayed: data.player.gamesPlayed || 0,
                  gamesWon: data.player.gamesWon || 0,
                  gamesLost: data.player.gamesLost || 0,
                  country: data.player.country || null,
                  region: data.player.region || null,
                } : null,
              });
              try {
                const { useDeckStore } = await import('./useDeckStore');
                await useDeckStore.getState().syncCardsFromDatabase();
                await useDeckStore.getState().syncDecksFromDatabase();
              } catch {}
              return true;
            } else {
              set({ savedWalletAddress: null, savedWalletType: null, isEmailAuth: false, isReconnecting: false, connectionStatus: 'disconnected' });
              return false;
            }
          } catch {
            set({ connectionStatus: 'disconnected', isReconnecting: false });
            return false;
          }
        }
        // --- END EMAIL AUTH auto-reconnect ---

        try {
          set({ connectionStatus: 'connecting' });

          const { detectSolanaWallets } = await import('@/features/blockchain/solana/walletDetector');
          const detectedWallets = detectSolanaWallets();
          const targetWallet = detectedWallets[savedWalletType || 'phantom'];

          if (targetWallet?.isDeeplink) {
            const walletKey = savedWalletType || 'phantom';
            const sessionPresent =
              walletKey === 'phantom' ? hasPhantomSession() :
              walletKey === 'solflare' ? hasSolflareSession() :
              walletKey === 'backpack' ? hasBackpackSession() :
              false;

            if (!sessionPresent) {
              if (!navigator.onLine) {
                set({
                  isConnected: false,
                  isReconnecting: false,
                  connectionStatus: 'error',
                  lastConnectionError: 'Network offline. Your wallet session is saved.',
                });
                return false;
              }
              set({
                savedWalletAddress: null,
                savedWalletType: null,
                isConnected: false,
                isReconnecting: false,
                connectionStatus: 'disconnected',
              });
              return false;
            }

            localStorage.setItem('wallet-reconnect-ts', String(Date.now()));

            set({
              isConnected: true,
              isReconnecting: false,
              walletAddress: savedWalletAddress,
              walletType: walletKey,
              balance: 0,
              connectionStatus: 'connected',
              savedWalletAddress,
              savedWalletType: walletKey,
            });

            try {
              const response = await fetch('/api/player/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ walletAddress: savedWalletAddress }),
              });
              if (response.ok) {
                const data = await response.json();
                if (data.player) {
                  set({
                    playerProfile: {
                      displayName: data.player.displayName || null,
                      gamesPlayed: data.player.gamesPlayed || 0,
                      gamesWon: data.player.gamesWon || 0,
                      gamesLost: data.player.gamesLost || 0,
                      country: data.player.country || null,
                      region: data.player.region || null,
                    }
                  });
                }
              }
            } catch {}

            try {
              const { useDeckStore } = await import('./useDeckStore');
              await useDeckStore.getState().syncCardsFromDatabase();
              await useDeckStore.getState().syncDecksFromDatabase();
            } catch {}

            return true;
          }

          const walletStatus = await cardNftService.connect(savedWalletType || 'phantom');

          if (walletStatus.connected && walletStatus.address === savedWalletAddress) {
            set({
              isConnected: true,
              isReconnecting: false,
              walletAddress: walletStatus.address,
              walletType: savedWalletType || 'phantom',
              balance: walletStatus.balance,
              connectionStatus: 'connected'
            });

            try {
              const response = await fetch('/api/player/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ walletAddress: walletStatus.address }),
              });

              if (response.ok) {
                const data = await response.json();
                if (data.player) {
                  set({
                    playerProfile: {
                      displayName: data.player.displayName || null,
                      gamesPlayed: data.player.gamesPlayed || 0,
                      gamesWon: data.player.gamesWon || 0,
                      gamesLost: data.player.gamesLost || 0,
                      country: data.player.country || null,
                      region: data.player.region || null,
                    }
                  });
                }
              }
            } catch {}

            try {
              const { useDeckStore } = await import('./useDeckStore');
              await useDeckStore.getState().syncCardsFromDatabase();
              await useDeckStore.getState().syncDecksFromDatabase();
            } catch {}

            return true;
          } else if (walletStatus.connected && walletStatus.address !== savedWalletAddress) {
            await cardNftService.disconnect();
            set({ connectionStatus: 'disconnected', isReconnecting: false });
            return false;
          } else {
            set({ connectionStatus: 'disconnected', isReconnecting: false });
            return false;
          }
        } catch {
          set({ connectionStatus: 'disconnected', isReconnecting: false });
          return false;
        }
      },

      // Internal actions
      setConnectionStatus: (status) => {
        set({ connectionStatus: status });
      },

      setWalletData: (data) => {
        set({
          walletAddress: data.address,
          walletType: data.walletType || null,
          balance: data.balance,
          isConnected: true,
          connectionStatus: 'connected'
        });
      },

      setNftCards: (cards) => {
        set({ nftCards: cards });
      },

      setError: (error) => {
        set({ lastConnectionError: error });
      },

      // --- EMAIL AUTH (removable) ---
      loginWithEmail: async (email: string, password: string): Promise<boolean> => {
        try {
          set({ connectionStatus: 'connecting', lastConnectionError: null });
          const res = await fetch('/api/auth/email/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) {
            set({ connectionStatus: 'disconnected', lastConnectionError: data.error || 'Login failed.' });
            return false;
          }
          const { walletAddress, displayName, gamesPlayed, gamesWon, gamesLost, country, region } = data.player;
          // Clear any previous user's data before establishing new session
          const previousAddress = get().savedWalletAddress;
          if (previousAddress && previousAddress !== walletAddress) {
            localStorage.removeItem('spektrum-collection-storage');
            localStorage.removeItem('deck-store');
            localStorage.removeItem('inventory-storage');
            const { useDeckStore } = await import('./useDeckStore');
            useDeckStore.setState({ ownedCards: [], decks: [], activeDeckId: null });
            const { useInventoryStore } = await import('./useInventoryStore');
            useInventoryStore.setState({ boosterPacks: [] });
          }
          set({
            isConnected: true,
            walletAddress,
            walletType: 'email',
            savedWalletAddress: walletAddress,
            savedWalletType: 'email',
            balance: 0,
            connectionStatus: 'connected',
            isEmailAuth: true,
            playerProfile: { displayName: displayName || null, gamesPlayed: gamesPlayed || 0, gamesWon: gamesWon || 0, gamesLost: gamesLost || 0, country: country || null, region: region || null },
          });
          try {
            const { useDeckStore } = await import('./useDeckStore');
            await useDeckStore.getState().syncCardsFromDatabase();
            await useDeckStore.getState().syncDecksFromDatabase();
          } catch {}
          return true;
        } catch {
          set({ connectionStatus: 'disconnected', lastConnectionError: 'Network error.' });
          return false;
        }
      },

      registerWithEmail: async (email: string, password: string, displayName?: string): Promise<boolean> => {
        try {
          set({ connectionStatus: 'connecting', lastConnectionError: null });
          const body: Record<string, string> = { email, password };
          if (displayName) body.displayName = displayName;
          const res = await fetch('/api/auth/email/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body),
          });
          const data = await res.json();
          if (!res.ok) {
            set({ connectionStatus: 'disconnected', lastConnectionError: data.error || 'Registration failed.' });
            return false;
          }
          const { walletAddress, displayName: dName, gamesPlayed, gamesWon, gamesLost, country, region } = data.player;
          // Clear any previous user's data before establishing new session
          const previousAddress = get().savedWalletAddress;
          if (previousAddress && previousAddress !== walletAddress) {
            localStorage.removeItem('spektrum-collection-storage');
            localStorage.removeItem('deck-store');
            localStorage.removeItem('inventory-storage');
            const { useDeckStore } = await import('./useDeckStore');
            useDeckStore.setState({ ownedCards: [], decks: [], activeDeckId: null });
            const { useInventoryStore } = await import('./useInventoryStore');
            useInventoryStore.setState({ boosterPacks: [] });
          }
          set({
            isConnected: true,
            walletAddress,
            walletType: 'email',
            savedWalletAddress: walletAddress,
            savedWalletType: 'email',
            balance: 0,
            connectionStatus: 'connected',
            isEmailAuth: true,
            isNewPlayer: true,
            playerProfile: { displayName: dName || null, gamesPlayed: gamesPlayed || 0, gamesWon: gamesWon || 0, gamesLost: gamesLost || 0, country: country || null, region: region || null },
          });
          return true;
        } catch {
          set({ connectionStatus: 'disconnected', lastConnectionError: 'Network error.' });
          return false;
        }
      },
      // --- END EMAIL AUTH ---
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        // Persist saved wallet info for auto-reconnect on Android/mobile
        savedWalletAddress: state.savedWalletAddress,
        savedWalletType: state.savedWalletType,
        // Don't persist active connection state - will be restored via auto-reconnect
        isConnected: false,
        walletAddress: null,
        walletType: null,
        balance: 0,
        nftCards: [],
        connectionStatus: 'disconnected' as const,
        lastConnectionError: null,
        // --- EMAIL AUTH (removable) ---
        isEmailAuth: state.isEmailAuth,
        // --- END EMAIL AUTH ---
      })
    }
  )
);
