import { create } from 'zustand';
import { apiFetch } from '@/lib/api';
import { persist } from 'zustand/middleware';
import type { Card } from '@spektrum/shared';
import type { BoosterVariant, BoosterPack } from '@/stores/useBoosterVariantStore';
import { useBoosterVariantStore, fetchCardCatalog, variantTemplates } from '@/stores/useBoosterVariantStore';
import { useDeckStore } from '@/stores/useDeckStore';
import { useWalletStore } from '@/stores/useWalletStore';
import { toast } from 'sonner';

const ARTWORK_VERSION = 2; // v2: New booster pack artwork (Oct 2025)

// Records a purchase to the backend (best-effort). Shared by single packs and
// bundles; `bundleSize` is forwarded so the server can group sealed packs.
async function persistPurchase(
  packId: string,
  variant: BoosterVariant,
  pack: BoosterPack,
  price: number,
  bundleSize?: number,
) {
  const walletAddress = useWalletStore.getState().walletAddress;
  const isConnected = useWalletStore.getState().isConnected;

  if (!walletAddress || !isConnected) {
    toast.warning('Wallet not connected - purchase saved locally only', { duration: 4000 });
    return;
  }

  try {
    await apiFetch('/api/player/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ walletAddress })
    });

    await Promise.all([
      apiFetch('/api/purchases/booster-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          packName: variant.name,
          packId,
          price,
          metadata: { variantName: variant.name, artUrl: variant.artUrl, packType: pack.name, bundleSize }
        })
      }),
      apiFetch('/api/booster-packs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          packId,
          packName: variant.name,
          purchasePrice: price,
          variantData: variant,
          packData: pack,
          artUrl: variant.artUrl,
          bundleSize,
          packsRemaining: bundleSize
        })
      })
    ]);
  } catch {
    toast.error('Failed to record purchase — please try again')
  }
}

export interface InventoryBoosterPack {
  id: string;
  name: string;
  variant: BoosterVariant;
  pack: BoosterPack;
  purchaseDate: Date;
  purchasePrice: number;
  isOpened: boolean;
  cNFTId?: string; // Compressed NFT identifier for trading
  artUrl: string;
  // Bundle support: a 10x purchase is ONE inventory entry holding multiple
  // sealed packs, opened one-by-one. Single packs leave both undefined.
  bundleSize?: number;      // total packs sealed in this bundle (e.g. 10)
  packsRemaining?: number;  // packs still sealed; isOpened flips true at 0
}

interface InventoryStore {
  boosterPacks: InventoryBoosterPack[];
  _dataVersion: number; // Track artwork version for cache invalidation

  // Actions
  addBoosterPack: (variant: BoosterVariant, pack: BoosterPack, price: number) => string;
  addBoosterPackBundle: (variant: BoosterVariant, pack: BoosterPack, pricePerPack: number, size: number) => string;
  removeBoosterPack: (packId: string) => boolean;
  openBoosterPack: (packId: string) => Promise<Card[]>;
  generateCardsForPack: (pack: InventoryBoosterPack) => Promise<Card[]>;
  getUnopened: () => InventoryBoosterPack[];
  getOpened: () => InventoryBoosterPack[];
  getPackById: (packId: string) => InventoryBoosterPack | undefined;
  getTotalValue: () => number;
  initializeInventory: () => void;
  syncPacksFromDatabase: () => Promise<void>;
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      boosterPacks: [],
      _dataVersion: ARTWORK_VERSION,

      addBoosterPack: (variant: BoosterVariant, pack: BoosterPack, price: number) => {
        const packId = `inventory-pack-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newPack: InventoryBoosterPack = {
          id: packId,
          name: variant.name,
          variant,
          pack,
          purchaseDate: new Date(),
          purchasePrice: price,
          isOpened: false,
          artUrl: variant.artUrl,
          cNFTId: `cnft-${packId}` // Mock cNFT ID for now
        };

        set(state => ({
          boosterPacks: [...state.boosterPacks, newPack]
        }));

        void persistPurchase(packId, variant, pack, price);

        toast.success(`${variant.name} added to inventory!`);
        return packId;
      },

      addBoosterPackBundle: (variant: BoosterVariant, pack: BoosterPack, pricePerPack: number, size: number) => {
        const packId = `inventory-bundle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const totalPrice = pricePerPack * size;
        const newPack: InventoryBoosterPack = {
          id: packId,
          name: variant.name,
          variant,
          pack,
          purchaseDate: new Date(),
          purchasePrice: totalPrice,
          isOpened: false,
          artUrl: variant.artUrl,
          cNFTId: `cnft-${packId}`,
          bundleSize: size,
          packsRemaining: size
        };

        set(state => ({
          boosterPacks: [...state.boosterPacks, newPack]
        }));

        void persistPurchase(packId, variant, pack, totalPrice, size);

        toast.success(`${size}x ${variant.name} bundle added to inventory!`);
        return packId;
      },

      removeBoosterPack: (packId: string) => {
        const pack = get().getPackById(packId);
        if (!pack) {
          toast.error('Booster pack not found!');
          return false;
        }

        set(state => ({
          boosterPacks: state.boosterPacks.filter(p => p.id !== packId)
        }));

        toast.success(`Removed ${pack.name} from inventory`);
        return true;
      },

      generateCardsForPack: async (pack: InventoryBoosterPack): Promise<Card[]> => {
        const walletAddress = useWalletStore.getState().walletAddress;
        const isConnected = useWalletStore.getState().isConnected;

        if (walletAddress && isConnected) {
          try {
            const response = await apiFetch('/api/booster-packs/generate-cards', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ packId: pack.id })
            });

            if (response.ok) {
              const data = await response.json();
              if (data.cards && data.cards.length > 0) {
                return data.cards as Card[];
              }
            }
          } catch {
            // Fall through to client-side generation
          }
        }

        const catalogCards = await fetchCardCatalog();
        const { generateVariantCards } = useBoosterVariantStore.getState();
        return generateVariantCards(pack.pack, pack.variant, catalogCards);
      },

      openBoosterPack: async (packId: string): Promise<Card[]> => {
        const pack = get().getPackById(packId);
        if (!pack) {
          toast.error('Booster pack not found!');
          return [];
        }

        if (pack.isOpened) {
          toast.error('This pack has already been opened!');
          return [];
        }

        try {
          const cards: Card[] = await get().generateCardsForPack(pack);

          // Add cards to player's collection (local state)
          const { addCards } = useDeckStore.getState();
          addCards(cards);

          // Save cards to database (backend)
          const walletAddress = useWalletStore.getState().walletAddress;
          const isConnected = useWalletStore.getState().isConnected;

          if (walletAddress && isConnected) {
            try {
              const connectResponse = await apiFetch('/api/player/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ walletAddress })
              });

              if (!connectResponse.ok) {
                throw new Error('Failed to establish wallet session');
              }

              const cardData = cards.map(card => ({
                cardId: (card as any).cardId || card.id,
                quantity: 1,
                source: 'booster_pack',
                metadata: { packName: pack.name, packType: pack.pack }
              }));

              const saveResponse = await apiFetch('/api/cards/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ cards: cardData })
              });

              if (!saveResponse.ok) {
                const errorData = await saveResponse.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `HTTP ${saveResponse.status}`);
              }

              toast.success(`${cards.length} cards added to collection!`, { duration: 2000 });
            } catch (error: any) {
              toast.error(`Failed to save cards: ${error.message || 'Unknown error'}`, { duration: 4000 });
            }
          } else {
            toast.warning('Wallet not connected - cards saved locally only', { duration: 4000 });
          }

          // Bundle: this open consumes ONE sealed pack. Only flip isOpened (and
          // notify the backend) once the last pack is drawn — otherwise just
          // decrement so the bundle stays in inventory, resumable.
          const isBundle = (pack.bundleSize ?? 1) > 1;
          const prevRemaining = pack.packsRemaining ?? pack.bundleSize ?? 1;
          const nextRemaining = prevRemaining - 1;
          const fullyOpened = !isBundle || nextRemaining <= 0;

          set(state => ({
            boosterPacks: state.boosterPacks.map(p =>
              p.id === packId
                ? { ...p, packsRemaining: isBundle ? Math.max(nextRemaining, 0) : p.packsRemaining, isOpened: fullyOpened }
                : p
            )
          }));

          if (walletAddress && isConnected && fullyOpened) {
            apiFetch('/api/booster-packs/open', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ packId })
            }).catch(() => {
              // Fire-and-forget
            });
          }

          toast.success(
            isBundle
              ? `Opened a pack! ${cards.length} cards · ${Math.max(nextRemaining, 0)} left in bundle.`
              : `Opened ${pack.name}! Received ${cards.length} cards.`
          );

          return cards;
        } catch {
          toast.error('Failed to open pack. Please try again.');
          return [];
        }
      },

      getUnopened: () => {
        return get().boosterPacks.filter(pack => !pack.isOpened);
      },

      getOpened: () => {
        return get().boosterPacks.filter(pack => pack.isOpened);
      },

      getPackById: (packId: string) => {
        return get().boosterPacks.find(pack => pack.id === packId);
      },

      getTotalValue: () => {
        return get().boosterPacks
          .filter(pack => !pack.isOpened)
          .reduce((total, pack) => total + pack.purchasePrice, 0);
      },

      initializeInventory: () => {
        // No-op: inventory loads from persisted storage automatically
      },

      syncPacksFromDatabase: async () => {
        const walletAddress = useWalletStore.getState().walletAddress;
        const isConnected = useWalletStore.getState().isConnected;

        if (!walletAddress || !isConnected) return;

        try {
          const response = await apiFetch(`/api/booster-packs/${walletAddress}`, {
            credentials: 'include'
          });
          if (!response.ok) return;

          const data = await response.json();
          const dbPacks = data.packs || [];

          if (dbPacks.length === 0) {
            const isNewPlayer = useWalletStore.getState().isNewPlayer;
            const localPacks = get().boosterPacks;

            const currentWalletAddress = useWalletStore.getState().walletAddress;
            if (isNewPlayer && localPacks.length > 0 && !currentWalletAddress?.startsWith('email_')) {
              // Preserve local packs for new player
            } else {
              set({ boosterPacks: [] });
            }
            return;
          }

          const normalizeRarity = (r: string) => r.replace(/\s*Pack$/i, '');
          const syncedPacks: InventoryBoosterPack[] = dbPacks.map((dbPack: any) => {
            let variant = dbPack.variantData || {};
            if (variant.rarity && !variant.guaranteedSlots) {
              const templateMatch = variantTemplates.find(t => t.rarity === variant.rarity)
                || variantTemplates.find(t => t.rarity === normalizeRarity(variant.rarity));
              if (templateMatch) {
                variant = {
                  ...variant,
                  rarity: templateMatch.rarity,
                  guaranteedSlots: templateMatch.guaranteedSlots,
                  wildSlotWeights: templateMatch.wildSlotWeights,
                  guaranteedRarities: templateMatch.guaranteedRarities,
                  rarityWeights: templateMatch.rarityWeights,
                };
              }
            }
            const bundleSize = dbPack.bundleSize ?? dbPack.packData?.bundleSize;
            return {
              id: dbPack.packId,
              name: dbPack.packName,
              variant,
              pack: dbPack.packData || {},
              purchaseDate: new Date(dbPack.purchasedAt),
              purchasePrice: dbPack.purchasePrice || 0,
              isOpened: dbPack.isOpened || false,
              artUrl: dbPack.artUrl || '',
              cNFTId: `cnft-${dbPack.packId}`,
              ...(bundleSize && bundleSize > 1
                ? { bundleSize, packsRemaining: dbPack.packsRemaining ?? bundleSize }
                : {})
            };
          });

          set({ boosterPacks: syncedPacks });
        } catch {
          // Sync failure is non-fatal
        }
      }
    }),
    {
      name: 'inventory-storage',
      version: 2,
      partialize: (state) => ({
        boosterPacks: state.boosterPacks,
        _dataVersion: state._dataVersion
      }),
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return {
            ...persistedState,
            _dataVersion: ARTWORK_VERSION
          };
        }

        if (!persistedState._dataVersion || persistedState._dataVersion < ARTWORK_VERSION) {
          return {
            ...persistedState,
            boosterPacks: [],
            _dataVersion: ARTWORK_VERSION
          };
        }

        return persistedState;
      }
    }
  )
);
