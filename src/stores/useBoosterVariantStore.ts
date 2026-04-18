import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Card, ElementType, RarityType } from '@/domain/game/types';
import { useDeckStore } from './useDeckStore';

export interface BoosterVariant {
  id: string;
  name: string;
  subtitle: string;
  artUrl: string;
  rarity: string;
  description: string;
  priceMultiplier: number;
  guaranteedRarities: RarityType[];
  rarityWeights: Record<RarityType, number>;
  guaranteedSlots?: RarityType[];
}

export interface BoosterPack {
  id: string;
  name: string;
  element: ElementType | 'mixed';
  price: number;
  description: string;
  guaranteedRarity: string;
  cardCount: number;
  emoji: string;
  color: string;
  artUrl: string;
}

export interface VariantPurchase {
  id: string;
  variantId: string;
  packId: string;
  purchaseDate: Date;
  cardsReceived: Card[];
  totalCost: number;
}

interface BoosterVariantStore {
  selectedVariant: BoosterVariant | null;
  purchaseHistory: VariantPurchase[];
  _dataVersion: number;

  setSelectedVariant: (variant: BoosterVariant | null) => void;
  generatePackVariants: (pack: BoosterPack) => BoosterVariant[];
  purchaseVariant: (variant: BoosterVariant, pack: BoosterPack) => Promise<Card[]>;
  getVariantPrice: (basePrice: number, variant: BoosterVariant) => number;
  generateVariantCards: (pack: BoosterPack, variant: BoosterVariant, catalogCards?: Card[]) => Card[];
  getPurchaseHistory: () => VariantPurchase[];
  getVariantStats: (variantId: string) => {
    purchaseCount: number;
    averageRarity: number;
    commonCards: number;
    rareCards: number;
    epicCards: number;
    legendaryCards: number;
  };
}

// Artwork version - bump this when booster pack images change
const ARTWORK_VERSION = 2;

interface PackSlotConfig {
  rarity: string;
  subtitle: string;
  description: string;
  price: number;
  priceMultiplier: number;
  guaranteedSlots: RarityType[];
  wildSlotWeights: Record<RarityType, number>;
  guaranteedRarities: RarityType[];
  rarityWeights: Record<RarityType, number>;
}

export const variantTemplates: PackSlotConfig[] = [
  {
    rarity: 'Beginner',
    subtitle: 'Basic Collection',
    description: '5 cards: 3x Common, 1x Uncommon, 1x Wild Slot',
    price: 1.00,
    priceMultiplier: 1.0,
    guaranteedSlots: ['Common', 'Common', 'Common', 'Uncommon'],
    wildSlotWeights: { 'Common': 0.90, 'Uncommon': 0.00, 'Rare': 0.099, 'Super Rare': 0.001, 'Mythic': 0.00 },
    guaranteedRarities: ['Uncommon'],
    rarityWeights: { 'Common': 0.90, 'Uncommon': 0.00, 'Rare': 0.099, 'Super Rare': 0.001, 'Mythic': 0.00 }
  },
  {
    rarity: 'Advanced',
    subtitle: 'Enhanced Power',
    description: '5 cards: 2x Common, 2x Uncommon, 1x Rare Slot',
    price: 5.00,
    priceMultiplier: 1.0,
    guaranteedSlots: ['Common', 'Common', 'Uncommon', 'Uncommon'],
    wildSlotWeights: { 'Common': 0.00, 'Uncommon': 0.00, 'Rare': 0.90, 'Super Rare': 0.099, 'Mythic': 0.001 },
    guaranteedRarities: ['Uncommon', 'Rare'],
    rarityWeights: { 'Common': 0.00, 'Uncommon': 0.00, 'Rare': 0.90, 'Super Rare': 0.099, 'Mythic': 0.001 }
  },
  {
    rarity: 'Expert',
    subtitle: 'Superior Collection',
    description: '5 cards: 3x Uncommon, 1x Rare, 1x Super Rare Slot (NO Commons!)',
    price: 10.00,
    priceMultiplier: 1.0,
    guaranteedSlots: ['Uncommon', 'Uncommon', 'Uncommon', 'Rare'],
    wildSlotWeights: { 'Common': 0.00, 'Uncommon': 0.00, 'Rare': 0.00, 'Super Rare': 0.90, 'Mythic': 0.10 },
    guaranteedRarities: ['Rare', 'Super Rare'],
    rarityWeights: { 'Common': 0.00, 'Uncommon': 0.00, 'Rare': 0.00, 'Super Rare': 0.90, 'Mythic': 0.10 }
  }
];

let cachedCatalogCards: Card[] | null = null;
let catalogFetchPromise: Promise<Card[]> | null = null;

export async function fetchCardCatalog(): Promise<Card[]> {
  if (cachedCatalogCards) return cachedCatalogCards;
  if (catalogFetchPromise) return catalogFetchPromise;

  catalogFetchPromise = fetch('/api/cards/catalog', { credentials: 'include' })
    .then(res => res.ok ? res.json() : { cards: [] })
    .then((data: any) => {
      const dbCards: any[] = data.cards || data || [];
      if (dbCards.length > 0) {
        cachedCatalogCards = dbCards.map(c => ({
          ...c,
          id: c.cardId || c.id,
          rarity: c.rarity || 'Common',
        })) as Card[];
      }
      catalogFetchPromise = null;
      return cachedCatalogCards || [];
    })
    .catch(() => {
      catalogFetchPromise = null;
      return [];
    });

  return catalogFetchPromise;
}

fetchCardCatalog();

export const useBoosterVariantStore = create<BoosterVariantStore>()(
  persist(
    (set, get) => ({
      selectedVariant: null,
      purchaseHistory: [],
      _dataVersion: ARTWORK_VERSION,

      setSelectedVariant: (variant) => {
        set({ selectedVariant: variant });
      },

      generatePackVariants: (pack) => {
        const artUrlMap: Record<string, string> = {
          'Beginner': '/boosters/beginner.png',
          'Advanced': '/boosters/advanced.png',
          'Expert': '/boosters/expert.png'
        };

        return variantTemplates.map((template, index) => ({
          id: `${pack.id}-variant-${index + 1}`,
          name: `${template.rarity} ${pack.name}`,
          artUrl: artUrlMap[template.rarity] || `/boosters/${template.rarity.toLowerCase()}-pack.svg`,
          ...template
        }));
      },

      getVariantPrice: (basePrice, variant) => {
        return Math.round(basePrice * variant.priceMultiplier);
      },

      generateVariantCards: (pack, variant, catalogCards?) => {
        const { getAvailableCards } = useDeckStore.getState();
        const localCards = getAvailableCards();

        if (!cachedCatalogCards && !catalogFetchPromise) {
          fetchCardCatalog();
        }

        const availableCards = catalogCards && catalogCards.length > 0
          ? catalogCards
          : cachedCatalogCards && cachedCatalogCards.length > 0
            ? cachedCatalogCards
            : localCards;

        const normalizeRarity = (r: string) => r.replace(/\s*Pack$/i, '');

        let effectiveVariant = variant;
        if (!variant.guaranteedSlots && !variant.guaranteedRarities?.length) {
          const templateMatch = variantTemplates.find(t => t.rarity === variant.rarity)
            || variantTemplates.find(t => t.rarity === normalizeRarity(variant.rarity));
          if (templateMatch) {
            effectiveVariant = {
              ...variant,
              rarity: templateMatch.rarity,
              guaranteedRarities: templateMatch.guaranteedRarities,
              rarityWeights: templateMatch.rarityWeights,
            } as any;
            (effectiveVariant as any).guaranteedSlots = templateMatch.guaranteedSlots;
            (effectiveVariant as any).wildSlotWeights = templateMatch.wildSlotWeights;
          }
        }

        const template = variantTemplates.find(t => t.rarity === effectiveVariant.rarity)
          || variantTemplates.find(t => t.rarity === normalizeRarity(effectiveVariant.rarity));

        const elementCards = pack.element === 'mixed'
          ? availableCards
          : availableCards.filter(card => card.element === pack.element);

        if (elementCards.length === 0) {
          return [];
        }

        const cards: Card[] = [];

        const rarityOrder: RarityType[] = ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Mythic'];

        const hasNoCommons = template ? template.guaranteedSlots.indexOf('Common' as RarityType) === -1 && (template.wildSlotWeights['Common'] || 0) === 0 : false;
        const minAllowedRarity: RarityType = hasNoCommons ? 'Uncommon' : 'Common';

        const findCardAtOrAboveRarity = (pool: Card[], minRarity: RarityType): Card | null => {
          const effectiveMin = rarityOrder.indexOf(minRarity) < rarityOrder.indexOf(minAllowedRarity) ? minAllowedRarity : minRarity;
          const minIndex = rarityOrder.indexOf(effectiveMin);
          for (let i = minIndex; i < rarityOrder.length; i++) {
            const candidates = pool.filter(card => card.rarity === rarityOrder[i]);
            if (candidates.length > 0) {
              return candidates[Math.floor(Math.random() * candidates.length)];
            }
          }
          return null;
        };

        if (template) {
          for (const slotRarity of template.guaranteedSlots) {
            const effectiveRarity = rarityOrder.indexOf(slotRarity) < rarityOrder.indexOf(minAllowedRarity) ? minAllowedRarity : slotRarity;
            const rarityCards = elementCards.filter(card => card.rarity === effectiveRarity);
            if (rarityCards.length > 0) {
              const randomCard = rarityCards[Math.floor(Math.random() * rarityCards.length)];
              cards.push({
                ...randomCard,
                id: `${randomCard.id}-pack-${Date.now()}-${cards.length}`,
                cardId: randomCard.id
              } as any);
            } else {
              const fallbackCard = findCardAtOrAboveRarity(elementCards, effectiveRarity)
                || findCardAtOrAboveRarity(availableCards, effectiveRarity);
              if (fallbackCard) {
                cards.push({
                  ...fallbackCard,
                  id: `${fallbackCard.id}-pack-${Date.now()}-${cards.length}`,
                  cardId: fallbackCard.id
                } as any);
              }
            }
          }

          const randomValue = Math.random();
          let cumulativeWeight = 0;
          const firstNonZeroRarity = Object.entries(template.wildSlotWeights).find(([_, w]) => w > 0);
          let wildRarity: RarityType = (firstNonZeroRarity?.[0] as RarityType) || minAllowedRarity;

          for (const [rarity, weight] of Object.entries(template.wildSlotWeights)) {
            cumulativeWeight += weight;
            if (randomValue <= cumulativeWeight && weight > 0) {
              wildRarity = rarity as RarityType;
              break;
            }
          }

          if (rarityOrder.indexOf(wildRarity) < rarityOrder.indexOf(minAllowedRarity)) {
            wildRarity = (firstNonZeroRarity?.[0] as RarityType) || minAllowedRarity;
          }

          const wildCards = elementCards.filter(card => card.rarity === wildRarity);
          if (wildCards.length > 0) {
            const randomCard = wildCards[Math.floor(Math.random() * wildCards.length)];
            cards.push({
              ...randomCard,
              id: `${randomCard.id}-pack-${Date.now()}-wild`,
              cardId: randomCard.id
            } as any);
          } else {
            const fallbackCard = findCardAtOrAboveRarity(elementCards, wildRarity)
              || findCardAtOrAboveRarity(availableCards, wildRarity);
            if (fallbackCard) {
              cards.push({
                ...fallbackCard,
                id: `${fallbackCard.id}-pack-${Date.now()}-wild`,
                cardId: fallbackCard.id
              } as any);
            }
          }

          if (hasNoCommons) {
            for (let i = 0; i < cards.length; i++) {
              if (cards[i].rarity === 'Common') {
                const replacement = findCardAtOrAboveRarity(elementCards, 'Uncommon')
                  || findCardAtOrAboveRarity(availableCards, 'Uncommon');
                if (replacement) {
                  cards[i] = {
                    ...replacement,
                    id: `${replacement.id}-pack-${Date.now()}-fix-${i}`,
                    cardId: replacement.id
                  } as any;
                }
              }
            }
          }
        } else {
          // Legacy fallback
          variant.guaranteedRarities.forEach(guaranteedRarity => {
            const rarityCards = elementCards.filter(card => card.rarity === guaranteedRarity);
            if (rarityCards.length > 0) {
              const randomCard = rarityCards[Math.floor(Math.random() * rarityCards.length)];
              cards.push({
                ...randomCard,
                id: `${randomCard.id}-pack-${Date.now()}-${cards.length}`,
                cardId: randomCard.id
              } as any);
            }
          });

          const remainingSlots = 5 - cards.length;
          for (let i = 0; i < remainingSlots; i++) {
            const randomValue = Math.random();
            let cumulativeWeight = 0;
            let selectedRarity: RarityType = 'Common';

            for (const [rarity, weight] of Object.entries(variant.rarityWeights)) {
              cumulativeWeight += weight;
              if (randomValue <= cumulativeWeight) {
                selectedRarity = rarity as RarityType;
                break;
              }
            }

            const rarityCards = elementCards.filter(card => card.rarity === selectedRarity);
            if (rarityCards.length > 0) {
              const randomCard = rarityCards[Math.floor(Math.random() * rarityCards.length)];
              cards.push({
                ...randomCard,
                id: `${randomCard.id}-pack-${Date.now()}-${i}`,
                cardId: randomCard.id
              } as any);
            } else {
              const randomCard = elementCards[Math.floor(Math.random() * elementCards.length)];
              cards.push({
                ...randomCard,
                id: `${randomCard.id}-pack-${Date.now()}-${i}`,
                cardId: randomCard.id
              } as any);
            }
          }
        }

        return cards;
      },

      purchaseVariant: async (variant, pack) => {
        await fetchCardCatalog();
        const cards = get().generateVariantCards(pack, variant);
        const totalCost = get().getVariantPrice(pack.price, variant);

        const purchase: VariantPurchase = {
          id: `purchase-${Date.now()}`,
          variantId: variant.id,
          packId: pack.id,
          purchaseDate: new Date(),
          cardsReceived: cards,
          totalCost
        };

        set(state => ({
          purchaseHistory: [...state.purchaseHistory, purchase]
        }));

        const { addCards } = useDeckStore.getState();
        addCards(cards);

        return cards;
      },

      getPurchaseHistory: () => {
        return get().purchaseHistory;
      },

      getVariantStats: (variantId) => {
        const { purchaseHistory } = get();
        const variantPurchases = purchaseHistory.filter(p => p.variantId === variantId);

        const stats = {
          purchaseCount: variantPurchases.length,
          averageRarity: 0,
          commonCards: 0,
          rareCards: 0,
          epicCards: 0,
          legendaryCards: 0
        };

        if (variantPurchases.length === 0) return stats;

        let totalRarityScore = 0;
        let totalCards = 0;

        variantPurchases.forEach(purchase => {
          purchase.cardsReceived.forEach(card => {
            totalCards++;

            switch (card.rarity) {
              case 'Common':
                stats.commonCards++;
                totalRarityScore += 1;
                break;
              case 'Uncommon':
                stats.rareCards++;
                totalRarityScore += 2;
                break;
              case 'Rare':
                stats.rareCards++;
                totalRarityScore += 3;
                break;
              case 'Super Rare':
                stats.epicCards++;
                totalRarityScore += 4;
                break;
              case 'Mythic':
                stats.legendaryCards++;
                totalRarityScore += 5;
                break;
            }
          });
        });

        stats.averageRarity = totalCards > 0 ? totalRarityScore / totalCards : 0;

        return stats;
      }
    }),
    {
      name: 'booster-variant-storage',
      version: 3,
      partialize: (state) => ({
        selectedVariant: state.selectedVariant,
        purchaseHistory: state.purchaseHistory,
        _dataVersion: state._dataVersion
      }),
      migrate: (persistedState: any, _version: number) => {
        if (!persistedState) {
          return {
            selectedVariant: null,
            purchaseHistory: [],
            _dataVersion: ARTWORK_VERSION
          };
        }

        if (!persistedState._dataVersion || persistedState._dataVersion < ARTWORK_VERSION) {
          return {
            selectedVariant: null,
            purchaseHistory: persistedState.purchaseHistory || [],
            _dataVersion: ARTWORK_VERSION
          };
        }
        return persistedState;
      }
    }
  )
);
