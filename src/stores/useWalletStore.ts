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

  const handleAccountChanged = (newPubkey: any) => {
    console.warn(`⚠️ ${walletType} account changed externally — disconnecting`);
    onExternalChange();
  };

  const handleDisconnect = () => {
    console.warn(`⚠️ ${walletType} disconnected externally`);
    onExternalChange();
  };

  try {
    provider.on('accountChanged', handleAccountChanged);
    provider.on('disconnect', handleDisconnect);
    console.log(`✅ Wallet event listeners attached for ${walletType}`);

    return () => {
      try {
        provider.off?.('accountChanged', handleAccountChanged);
        provider.off?.('disconnect', handleDisconnect);
        provider.removeListener?.('accountChanged', handleAccountChanged);
        provider.removeListener?.('disconnect', handleDisconnect);
      } catch {}
    };
  } catch (err) {
    console.warn('Could not attach wallet event listeners:', err);
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
          console.log(`Attempting wallet connection${walletName ? ` to ${walletName}` : ''}...`);

          const clearAccountData = async (newAddress: string) => {
            const previousAddress = get().savedWalletAddress;
            if (previousAddress && previousAddress !== newAddress) {
              console.log(`🔄 Wallet changed from ${previousAddress.substring(0, 8)}... to ${newAddress.substring(0, 8)}... - clearing account data`);
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
              console.log('✅ Phantom deeplink callback received:', phantomCallback);
              await clearAccountData(phantomCallback.publicKey);
              set({
                isConnected: true,
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
                  if (data.isNewPlayer) {
                    console.log('🆕 New player detected - local data will be preserved');
                  }
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
                  console.log('✅ Wallet associated with HTTP session via player connect');
                } else {
                  console.warn('⚠️ Failed to register player:', response.status);
                }
              } catch (sessionError) {
                console.warn('⚠️ Failed to associate wallet with session:', sessionError);
              }

              return true;
            }
          }

          // Check for Solflare deeplink callback
          if (walletName === 'solflare' || !walletName) {
            const solflareCallback = parseSolflareCallback();
            if (solflareCallback) {
              console.log('✅ Solflare deeplink callback received:', solflareCallback);
              await clearAccountData(solflareCallback.publicKey);
              set({
                isConnected: true,
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
                  if (data.isNewPlayer) {
                    console.log('🆕 New player detected - local data will be preserved');
                  }
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
                  console.log('✅ Wallet associated with HTTP session via Solflare connect');
                } else {
                  console.warn('⚠️ Failed to register player:', response.status);
                }
              } catch (sessionError) {
                console.warn('⚠️ Failed to associate wallet with session:', sessionError);
              }

              window.history.replaceState({}, document.title, window.location.pathname);
              return true;
            }
          }

          if (walletName === 'backpack' || !walletName) {
            const backpackCallback = parseBackpackCallback();
            if (backpackCallback) {
              console.log('✅ Backpack deeplink callback received:', backpackCallback);
              await clearAccountData(backpackCallback.publicKey);
              set({
                isConnected: true,
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
                  if (data.isNewPlayer) {
                    console.log('🆕 New player detected - local data will be preserved');
                  }
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
                  console.log('✅ Wallet associated with HTTP session via Backpack connect');
                } else {
                  console.warn('⚠️ Failed to register player:', response.status);
                }
              } catch (sessionError) {
                console.warn('⚠️ Failed to associate wallet with session:', sessionError);
              }

              window.history.replaceState({}, document.title, window.location.pathname);
              return true;
            }
          }

          const walletStatus = await cardNftService.connect(walletName);

          if (walletStatus.connected && walletStatus.address) {
            await clearAccountData(walletStatus.address);
            set({
              isConnected: true,
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
                console.log('📡 Registering player with server:', walletStatus.address.substring(0, 8) + '...');
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
                console.log('✅ Player registered with server analytics:', data);

                set({ isNewPlayer: !!data.isNewPlayer });
                if (data.isNewPlayer) {
                  console.log('🆕 New player detected - local data will be preserved');
                }

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
                  console.log('✅ Player profile loaded:', data.player.displayName || 'No display name set');
                }
              } catch (trackingError) {
                console.error('❌ Player registration failed:', trackingError);
                // Don't fail the connection if registration fails
              }
            }

            // SECOND: Sync NFT cards after player registration
            try {
              await get().syncNftCards();
            } catch (syncError) {
              console.warn('NFT sync failed during connection, continuing without NFTs:', syncError);
              // Don't fail the connection if NFT sync fails
            }

            // THIRD: Sync cards from database (now wallet is associated with session)
            try {
              const { useDeckStore } = await import('./useDeckStore');
              await useDeckStore.getState().syncCardsFromDatabase();
            } catch (dbSyncError) {
              console.warn('Database card sync failed during connection, continuing:', dbSyncError);
              // Don't fail the connection if database sync fails
            }

            // FOURTH: Sync decks from database
            try {
              const { useDeckStore } = await import('./useDeckStore');
              await useDeckStore.getState().syncDecksFromDatabase();
              console.log('✅ Decks synced from database');
            } catch (deckSyncError) {
              console.warn('Deck sync failed:', deckSyncError);
            }

            // FIFTH: Sync booster packs from database
            try {
              const { useInventoryStore } = await import('./useInventoryStore');
              await useInventoryStore.getState().syncPacksFromDatabase();
              console.log('✅ Booster packs synced from database');
            } catch (packSyncError) {
              console.warn('Booster pack sync failed:', packSyncError);
            }

            // SIXTH: Fetch Seeker verification status
            try {
              const { useSeekerStore } = await import('./useSeekerStore');
              await useSeekerStore.getState().fetchSeekerStatus(walletStatus.address);
              console.log('✅ Seeker status fetched');
            } catch (seekerError) {
              console.warn('Seeker status fetch failed:', seekerError);
            }

            console.log(`Wallet connected: ${walletStatus.address}`);
            return true;
          } else {
            set({
              connectionStatus: 'error',
              lastConnectionError: 'Failed to connect wallet'
            });
            return false;
          }
        } catch (error) {
          console.error('Wallet connection error:', error);
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

          console.log('Wallet disconnected - account data cleared');
        } catch (error) {
          console.error('Wallet disconnection error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown disconnection error';
          set({ lastConnectionError: errorMessage });
        }
      },

      refreshWalletData: async () => {
        try {
          if (!get().isConnected) {
            console.warn('Cannot refresh wallet data: wallet not connected');
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
            } catch (syncError) {
              console.warn('NFT sync failed during refresh, continuing without NFTs:', syncError);
              // Don't fail the refresh if NFT sync fails
            }

            console.log('Wallet data refreshed');
          } else {
            // Wallet got disconnected
            await get().disconnectWallet();
          }
        } catch (error) {
          console.error('Error refreshing wallet data:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to refresh wallet data';
          set({ lastConnectionError: errorMessage });
        }
      },

      syncNftCards: async () => {
        try {
          if (!get().isConnected) {
            console.warn('Cannot sync NFT cards: wallet not connected');
            return;
          }

          console.log('Syncing NFT cards from wallet...');
          const nftCards = await cardNftService.getOwnedCards();

          set({ nftCards });
          console.log(`Synced ${nftCards.length} NFT cards from wallet`);

        } catch (error) {
          console.error('Error syncing NFT cards:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to sync NFT cards';
          set({ lastConnectionError: errorMessage });
        }
      },

      getWalletStatus: async () => {
        try {
          return await cardNftService.getWalletStatus();
        } catch (error) {
          console.error('Error getting wallet status:', error);
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
          console.log('🔗 Wallet already connected, skipping auto-reconnect');
          set({ isReconnecting: false });
          return true;
        }

        if (connectionStatus === 'connecting') {
          console.log('🔗 Connection in progress, skipping auto-reconnect');
          set({ isReconnecting: false });
          return false;
        }

        if (!savedWalletAddress) {
          console.log('🔗 No saved wallet address found in storage, skipping auto-reconnect');
          set({ isReconnecting: false });
          return false;
        }

        // --- EMAIL AUTH auto-reconnect (removable) ---
        if (get().isEmailAuth && savedWalletAddress.startsWith('email_')) {
          console.log('🔗 Email-auth user — restoring session via server...');
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
              } catch (e) { console.warn('Email auth deck sync failed:', e); }
              console.log('✅ Email-auth auto-reconnect successful');
              return true;
            } else {
              console.warn('⚠️ Email-auth session invalid — clearing saved address');
              set({ savedWalletAddress: null, savedWalletType: null, isEmailAuth: false, isReconnecting: false, connectionStatus: 'disconnected' });
              return false;
            }
          } catch (err) {
            console.error('❌ Email-auth auto-reconnect error:', err);
            set({ connectionStatus: 'disconnected', isReconnecting: false });
            return false;
          }
        }
        // --- END EMAIL AUTH auto-reconnect ---

        console.log(`🔗 Attempting auto-reconnect for ${savedWalletType || 'phantom'} wallet: ${savedWalletAddress.substring(0, 8)}...`);

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
                console.warn('📵 Network offline — preserving saved wallet address, will retry when online');
                set({
                  isConnected: false,
                  isReconnecting: false,
                  connectionStatus: 'error',
                  lastConnectionError: 'Network offline. Your wallet session is saved.',
                });
                return false;
              }
              console.warn(`⚠️ Deep link session for "${walletKey}" is gone (storage was cleared) — clearing stale address`);
              set({
                savedWalletAddress: null,
                savedWalletType: null,
                isConnected: false,
                isReconnecting: false,
                connectionStatus: 'disconnected',
              });
              return false;
            }

            console.log(`📱 Saved wallet "${walletKey}" deep link session is valid — restoring`);

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
                console.log('✅ Player profile synced after deep link auto-reconnect');
              }
            } catch (profileError) {
              console.warn('Player profile sync failed during deep link auto-reconnect:', profileError);
            }

            try {
              const { useDeckStore } = await import('./useDeckStore');
              await useDeckStore.getState().syncCardsFromDatabase();
              await useDeckStore.getState().syncDecksFromDatabase();
              console.log('✅ Cards and decks synced after deep link auto-reconnect');
            } catch (dbSyncError) {
              console.warn('Database sync failed during deep link auto-reconnect:', dbSyncError);
            }

            return true;
          }

          const walletStatus = await cardNftService.connect(savedWalletType || 'phantom');

          if (walletStatus.connected && walletStatus.address === savedWalletAddress) {
            console.log('✅ Auto-reconnect successful - address verified!');
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
                  console.log('✅ Player profile synced after auto-reconnect');
                }
              }
            } catch (profileError) {
              console.warn('Player profile sync failed during auto-reconnect:', profileError);
            }

            try {
              const { useDeckStore } = await import('./useDeckStore');
              await useDeckStore.getState().syncCardsFromDatabase();
              await useDeckStore.getState().syncDecksFromDatabase();
              console.log('✅ Cards and decks synced from database after auto-reconnect');
            } catch (dbSyncError) {
              console.warn('Database sync failed during auto-reconnect:', dbSyncError);
            }

            return true;
          } else if (walletStatus.connected && walletStatus.address !== savedWalletAddress) {
            console.warn(`⚠️ Auto-reconnect rejected: Address mismatch. Expected ${savedWalletAddress.substring(0, 8)}..., got ${walletStatus.address?.substring(0, 8) || 'null'}...`);
            console.log('ℹ️ User should manually connect wallet to update account');
            await cardNftService.disconnect();
            set({ connectionStatus: 'disconnected', isReconnecting: false });
            return false;
          } else {
            console.log('⚠️ Auto-reconnect failed - wallet not available');
            set({ connectionStatus: 'disconnected', isReconnecting: false });
            return false;
          }
        } catch (error) {
          console.error('❌ Auto-reconnect error:', error);
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
          } catch (e) { console.warn('Deck sync after email login failed:', e); }
          return true;
        } catch (err) {
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
        } catch (err) {
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
