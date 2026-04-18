import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Card, AvatarCard, ActionCard } from '@/domain/game/types';
import { cardRegistry } from '@/domain/game/data/cardRegistry';
import { cardNftService } from '@/features/blockchain/solana/cardNftService';
import { toast } from 'sonner';
import { getBaseCardId } from '@/lib/rarityUtils';
import { useAchievementsStore } from '@/stores/useAchievementsStore';
import { useCardCatalogStore } from '@/stores/useCardCatalogStore';

function applyDbCatalogToCards(cards: Card[]): Card[] {
  const { catalog, isLoaded } = useCardCatalogStore.getState();
  if (!isLoaded || catalog.size === 0) return cards;

  return cards.map(card => {
    const cardNumber = (card as any).cardNumber as string | undefined;
    const dbEntry = cardNumber ? catalog.get(cardNumber) : catalog.get(card.id);
    if (!dbEntry) return card;

    const updates: Record<string, any> = {};
    if (dbEntry.imagePath && dbEntry.imagePath.trim()) {
      updates.imagePath = dbEntry.imagePath;
      updates.art = dbEntry.imagePath;
    }
    if (dbEntry.skills) updates.skills = dbEntry.skills;
    if (dbEntry.passiveSkill) updates.passiveSkill = dbEntry.passiveSkill;

    return Object.keys(updates).length > 0 ? { ...card, ...updates } : card;
  });
}

let _cardSyncInProgress = false;
let _deckSyncInProgress = false;

// Define the deck interface
export interface Deck {
  id: string;
  name: string;
  cards: Card[];
  coverCardId?: string;
  createdAt: number;
  updatedAt: number;
  tribe?: string;
}

// Define the deck store interface
interface DeckStore {
  decks: Deck[];
  activeDeckId: string | null;
  ownedCards: Card[];

  // Actions
  addDeck: (name: string, cards: Card[], tribe?: string) => Deck;
  updateDeck: (id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt'>>) => void;
  deleteDeck: (id: string) => void;
  setActiveDeck: (id: string) => void;

  // Card collection management
  addCard: (card: Card) => void;
  addCards: (cards: Card[]) => void;
  removeCard: (cardId: string) => void;
  notifyLibraryChange: () => void;

  // Card management helpers
  getAvailableCards: () => Card[];
  getAvailableCardsWithCNFTs: () => Promise<Card[]>;
  findCard: (id: string) => Card | undefined;
  getAvailableCardsByElement: (element: string) => Card[];
  getAvailableCardsByTribe: (tribe: string) => Card[];

  // Rarity-based duplicate checking
  canAddCardToDeck: (card: Card, deckCards: Card[]) => boolean;
  getBaseCardCount: (baseName: string, deckCards: Card[]) => number;
  refreshLibrary: () => void;
  syncWithNFTs: () => Promise<void>;
  syncCardsFromDatabase: () => Promise<void>;
  syncDecksFromDatabase: () => Promise<void>;
  initializeDefaultCards: () => void;

  // Image path normalization
  normalizeCardImagePaths: () => void;
}

// Create the deck store
export const useDeckStore = create<DeckStore>()(
  persist(
    (set, get) => ({
      decks: [],
      activeDeckId: null,
      ownedCards: [],

      addDeck: (name, cards, tribe) => {
        const currentDecks = get().decks;
        if (currentDecks.length >= 5) {
          toast.error("You can only have a maximum of 5 decks. Please delete one first.");
          throw new Error("Maximum number of decks (5) reached");
        }

        if (cards.length < 40) {
          throw new Error("A deck must have at least 40 cards");
        }

        const now = Date.now();
        const newDeck: Deck = {
          id: `deck-${now}`,
          name,
          cards,
          coverCardId: cards[0].id,
          createdAt: now,
          updatedAt: now,
          tribe
        };

        set(state => ({
          decks: [...state.decks, newDeck]
        }));

        const { incrementProgress } = useAchievementsStore.getState() as any;
        if (typeof incrementProgress === 'function') {
          if (currentDecks.length === 0) {
            incrementProgress('first_deck');
          }
          incrementProgress('deck_builder', 1);
          incrementProgress('deck_master', 1);
        }

        (async () => {
          try {
            const { useWalletStore } = await import('@/stores/useWalletStore');
            const { toast: toastInner } = await import('sonner');

            const walletAddress = useWalletStore.getState().walletAddress;
            const isConnected = useWalletStore.getState().isConnected;

            if (!walletAddress || !isConnected) {
              toastInner.warning('Deck saved locally only - connect wallet to save to database', { duration: 4000 });
              return;
            }

            const cardIds = cards.map(c => (c as any).cardId || c.id);
            await fetch('/api/decks/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                deckId: newDeck.id,
                deckName: name,
                cardIds,
                coverCardId: (cards[0] as any).cardId || cards[0].id,
                element: cards[0]?.element || null,
                isActive: currentDecks.length === 0 ? 1 : 0
              })
            });
            toastInner.success('Deck saved to database!', { duration: 2000 });
          } catch (error: any) {
            toast.error(`Failed to save deck: ${error.message || 'Unknown error'}`, { duration: 5000 });
          }
        })();

        return newDeck;
      },

      updateDeck: (id, updates) => {
        const deck = get().decks.find(d => d.id === id);
        if (!deck) return;

        set(state => ({
          decks: state.decks.map(d =>
            d.id === id
              ? { ...d, ...updates, updatedAt: Date.now() }
              : d
          )
        }));

        (async () => {
          try {
            const { useWalletStore } = await import('@/stores/useWalletStore');
            const { toast: toastInner } = await import('sonner');

            const walletAddress = useWalletStore.getState().walletAddress;
            const isConnected = useWalletStore.getState().isConnected;

            if (!walletAddress || !isConnected) {
              return;
            }

            const updatedDeck = get().decks.find(d => d.id === id);
            if (updatedDeck) {
              const cardIds = updatedDeck.cards.map(c => (c as any).cardId || c.id);
              const coverCardId = updatedDeck.coverCardId || null;
              await fetch('/api/decks/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  deckId: updatedDeck.id,
                  deckName: updatedDeck.name,
                  cardIds,
                  coverCardId,
                  element: updatedDeck.cards[0]?.element || null,
                  isActive: get().activeDeckId === id ? 1 : 0
                })
              });
              toastInner.success('Deck changes saved!', { duration: 2000 });
            }
          } catch (error: any) {
            toast.error(`Failed to save changes: ${error.message || 'Unknown error'}`, { duration: 5000 });
          }
        })();
      },

      deleteDeck: (id) => {
        set(state => ({
          decks: state.decks.filter(deck => deck.id !== id),
          activeDeckId: state.activeDeckId === id ? null : state.activeDeckId
        }));
      },

      setActiveDeck: (id) => {
        const deck = get().decks.find(d => d.id === id);
        if (!deck) {
          throw new Error(`Deck with id ${id} not found`);
        }

        set({ activeDeckId: id });

        (async () => {
          try {
            const { useWalletStore } = await import('@/stores/useWalletStore');
            const { toast: toastInner } = await import('sonner');

            const walletAddress = useWalletStore.getState().walletAddress;
            const isConnected = useWalletStore.getState().isConnected;

            if (!walletAddress || !isConnected) {
              return;
            }

            await fetch('/api/decks/set-active', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ deckId: id })
            });
            toastInner.success(`Active deck: ${deck.name}`, { duration: 2000 });
          } catch (error: any) {
            toast.error(`Failed to set active deck: ${error.message || 'Unknown error'}`, { duration: 5000 });
          }
        })();
      },

      // Card collection management
      addCard: (card) => {
        set(state => ({
          ownedCards: [...state.ownedCards, { ...card, id: `owned-${card.id}-${Date.now()}` }]
        }));
      },

      addCards: (cards) => {
        const timestamp = Date.now();
        const ownedCards = cards.map((card, index) => ({
          ...card,
          id: `owned-${card.id}-${timestamp}-${index}`
        }));

        set(state => ({
          ownedCards: [...state.ownedCards, ...ownedCards]
        }));

        setTimeout(() => get().notifyLibraryChange(), 100);
      },

      removeCard: (cardId) => {
        set(state => ({
          ownedCards: state.ownedCards.filter(card => card.id !== cardId)
        }));
      },

      // Card management helpers
      getAvailableCards: () => {
        const allCards = cardRegistry.getAllCards();
        const enrichedCards = applyDbCatalogToCards(allCards);

        try {
          const { useCustomCardStore } = require('@/stores/useCustomCardStore');
          const { applyModificationsToCards } = useCustomCardStore.getState();
          return applyModificationsToCards(enrichedCards);
        } catch {
          return enrichedCards;
        }
      },

      getAvailableCardsWithCNFTs: async () => {
        const state = get();
        const ownedCards = state.ownedCards;

        try {
          const nftCards = await cardNftService.getPlayerCards();
          return [...ownedCards, ...nftCards];
        } catch {
          return [...ownedCards];
        }
      },

      findCard: (id) => {
        const cards = get().getAvailableCards();
        return cards.find(card => card.id === id);
      },

      getAvailableCardsByElement: (element) => {
        const cards = get().getAvailableCards();
        return cards.filter(card => card.element === element);
      },

      getAvailableCardsByTribe: (tribe) => {
        const cards = get().getAvailableCards();
        return cards.filter(card => {
          if (card.type === 'avatar') {
            return (card as AvatarCard).subType === tribe;
          }
          return false;
        });
      },

      canAddCardToDeck: (card, deckCards) => {
        const group = (card as any).duplicateGroup || (card as any).cardNumber || getBaseCardId(card.name);
        const currentCount = get().getBaseCardCount(group, deckCards);
        return currentCount < 4;
      },

      getBaseCardCount: (groupKey, deckCards) => {
        return deckCards.filter(c => {
          const cGroup = (c as any).duplicateGroup || (c as any).cardNumber || getBaseCardId(c.name);
          return cGroup === groupKey;
        }).length;
      },

      refreshLibrary: () => {
        get().initializeDefaultCards();
      },

      notifyLibraryChange: () => {
        set(state => ({
          ownedCards: [...state.ownedCards]
        }));
      },

      syncWithNFTs: async () => {
        try {
          const nftCards = await cardNftService.getPlayerCards();
          set(state => ({
            ownedCards: [...state.ownedCards, ...nftCards]
          }));
        } catch {
          // NFT sync failed silently
        }
      },

      syncCardsFromDatabase: async () => {
        if (_cardSyncInProgress) return;
        _cardSyncInProgress = true;
        try {
          const { useWalletStore } = await import('@/stores/useWalletStore');

          const walletAddress = useWalletStore.getState().walletAddress;
          if (!walletAddress) {
            _cardSyncInProgress = false;
            return;
          }

          const response = await fetch(`/api/cards/${walletAddress}`, { credentials: 'include' });
          const data = await response.json();
          const dbCards = data.cards || [];

          if (dbCards.length === 0) {
            const isNewPlayer = useWalletStore.getState().isNewPlayer;
            const localCards = get().ownedCards;

            if (isNewPlayer && localCards.length > 0 && !walletAddress.startsWith('email_')) {
              // Preserve local cards for new player
            } else {
              set({ ownedCards: [] });
            }
            return;
          }

          const localCards = get().getAvailableCards();
          const localCardMap = new Map<string, Card>();
          for (const c of localCards) {
            localCardMap.set(c.id, c);
            if ((c as any).cardId) {
              localCardMap.set((c as any).cardId, c);
            }
          }

          const cardsToAdd: Card[] = [];
          let resolvedCount = 0;

          for (const dbCard of dbCards) {
            const qty = Math.max(1, parseInt(dbCard.quantity) || 1);
            if (qty <= 0) continue;

            const localMatch = localCardMap.get(dbCard.cardId);

            if (localMatch) {
              for (let i = 0; i < qty; i++) {
                const merged = { ...localMatch };
                if (dbCard.imagePath && dbCard.imagePath.trim()) {
                  (merged as any).imagePath = dbCard.imagePath;
                  (merged as any).art = dbCard.imagePath;
                }
                if (dbCard.skills) (merged as any).skills = dbCard.skills;
                cardsToAdd.push(merged);
              }
              resolvedCount++;
            } else if (dbCard.name) {
              for (let i = 0; i < qty; i++) {
                cardsToAdd.push({
                  id: dbCard.cardId,
                  cardId: dbCard.cardId,
                  name: dbCard.name,
                  element: dbCard.element,
                  tribe: dbCard.tribe,
                  cardNumber: dbCard.cardNumber,
                  imagePath: dbCard.imagePath,
                  attack: dbCard.attack,
                  health: dbCard.health,
                  cost: dbCard.cost,
                  rarity: dbCard.rarity,
                  art: dbCard.art,
                  description: dbCard.description,
                  skills: dbCard.skills,
                  cardType: dbCard.cardType,
                  type: dbCard.type,
                  level: dbCard.level !== undefined ? Number(dbCard.level) : undefined,
                  subType: dbCard.subType,
                  spektraCost: dbCard.spektraCost,
                  passiveSkills: dbCard.passiveSkills,
                  activeSkills: dbCard.activeSkills,
                  equipmentSlots: dbCard.equipmentSlots,
                } as Card);
              }
              resolvedCount++;
            } else {
              cardsToAdd.push({
                id: dbCard.cardId,
                cardId: dbCard.cardId,
                name: dbCard.cardId,
                element: 'neutral',
                type: 'avatar',
              } as unknown as Card);
            }
          }

          const syncTimestamp = Date.now();
          const ownedCardsWithIds = cardsToAdd.map((card, index) => ({
            ...card,
            id: `owned-${card.id}-${syncTimestamp}-${index}`
          }));

          set({ ownedCards: ownedCardsWithIds });

          if (cardsToAdd.length > 0) {
            toast.success(`Loaded ${cardsToAdd.length} cards from your collection`);
          }
        } catch {
          // Sync failed silently
        } finally {
          _cardSyncInProgress = false;
        }
      },

      syncDecksFromDatabase: async () => {
        if (_deckSyncInProgress) return;
        _deckSyncInProgress = true;
        try {
          const { useWalletStore } = await import('@/stores/useWalletStore');

          const walletAddress = useWalletStore.getState().walletAddress;
          if (!walletAddress) {
            _deckSyncInProgress = false;
            return;
          }

          const response = await fetch(`/api/decks/${walletAddress}`, { credentials: 'include' });
          if (!response.ok) {
            return;
          }

          const data = await response.json();
          const dbDecks = data.decks || [];

          if (dbDecks.length === 0) {
            const isNewPlayer = useWalletStore.getState().isNewPlayer;
            const localDecks = get().decks;

            if (isNewPlayer && localDecks.length > 0) {
              // Preserve local decks for new player
            } else {
              set({ decks: [], activeDeckId: null });
            }
            return;
          }

          const syncedDecks: Deck[] = [];

          for (const dbDeck of dbDecks) {
            const hydratedCards = dbDeck.hydratedCards || [];

            if (hydratedCards.length > 0) {
              const deckCards: Card[] = hydratedCards.map((card: any, index: number) => ({
                id: `${dbDeck.deckId}-${card.cardId}-${index}`,
                cardId: card.cardId,
                name: card.name,
                element: card.element,
                tribe: card.tribe,
                cardNumber: card.cardNumber,
                imagePath: card.imagePath,
                attack: card.attack,
                health: card.health,
                cost: card.cost,
                rarity: card.rarity,
                art: card.art,
                description: card.description,
                skills: card.skills,
                cardType: card.cardType,
                type: card.type,
                level: card.level !== undefined ? Number(card.level) : undefined,
                subType: card.subType,
                effectType: card.effectType,
                effectValue: card.effectValue,
                effectValue2: card.effectValue2,
                effectTarget: card.effectTarget,
                spektraCost: card.spektraCost,
                passiveSkills: card.passiveSkills,
                activeSkills: card.activeSkills,
                equipmentSlots: card.equipmentSlots,
              }));

              const persistedCoverId = (dbDeck as any).coverCardId;
              const resolvedCoverId = persistedCoverId
                ? (deckCards.find(c => c.id === persistedCoverId || c.id.startsWith(persistedCoverId))?.id || deckCards[0]?.id || '')
                : (deckCards[0]?.id || '');

              syncedDecks.push({
                id: dbDeck.deckId,
                name: dbDeck.deckName,
                cards: deckCards,
                coverCardId: resolvedCoverId,
                createdAt: new Date(dbDeck.createdAt).getTime(),
                updatedAt: new Date(dbDeck.updatedAt).getTime(),
                tribe: dbDeck.element || undefined
              });
            }
          }

          set({
            decks: syncedDecks,
            activeDeckId: dbDecks.find((d: any) => d.isActive)?.deckId || syncedDecks[0]?.id || null
          });

          if (syncedDecks.length > 0) {
            toast.success(`Loaded ${syncedDecks.length} decks from your collection`);
          }
        } catch {
          // Sync failed, keep existing decks
        } finally {
          _deckSyncInProgress = false;
        }
      },

      initializeDefaultCards: () => {
        set({ ownedCards: [] });
      },

      normalizeCardImagePaths: () => {
        const allFreshCards = get().getAvailableCards();
        const freshCardMap = new Map<string, Card>();
        allFreshCards.forEach(card => freshCardMap.set(card.id, card));

        const getBaseId = (id: string) => id.replace(/-copy-\d+(-\d+)?$/, '');

        const normalizeCard = (card: Card): Card => {
          const baseId = getBaseId(card.id);
          const freshCard = freshCardMap.get(baseId) || freshCardMap.get(card.id);
          if (freshCard && (freshCard.imagePath !== card.imagePath || freshCard.art !== card.art)) {
            return {
              ...card,
              imagePath: freshCard.imagePath,
              art: freshCard.art
            };
          }
          return card;
        };

        const currentDecks = get().decks;
        const normalizedDecks = currentDecks.map(deck => ({
          ...deck,
          cards: deck.cards.map(normalizeCard)
        }));

        const currentOwnedCards = get().ownedCards;
        const normalizedOwnedCards = currentOwnedCards.map(normalizeCard);

        const decksChanged = JSON.stringify(currentDecks) !== JSON.stringify(normalizedDecks);
        const ownedCardsChanged = JSON.stringify(currentOwnedCards) !== JSON.stringify(normalizedOwnedCards);

        if (decksChanged || ownedCardsChanged) {
          set({
            decks: normalizedDecks,
            ownedCards: normalizedOwnedCards
          });
        }
      }
    }),
    {
      name: 'deck-store',
      version: 6,
      migrate: (persistedState: any, version: number) => {
        if (version < 6) {
          return {
            ...persistedState,
            decks: [],
            ownedCards: [],
            activeDeckId: null
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) return;
          if (state) {
            setTimeout(() => {
              state.normalizeCardImagePaths();
            }, 100);
            setTimeout(async () => {
              try {
                const { useWalletStore } = await import('@/stores/useWalletStore');
                const walletAddress = useWalletStore.getState().walletAddress;
                if (walletAddress) {
                  await state.syncCardsFromDatabase();
                  await state.syncDecksFromDatabase();
                } else {
                  let synced = false;
                  const unsub = useWalletStore.subscribe(async (walletState) => {
                    if (walletState.walletAddress && !synced) {
                      synced = true;
                      unsub();
                      await state.syncCardsFromDatabase();
                      await state.syncDecksFromDatabase();
                    }
                  });
                  setTimeout(() => { if (!synced) unsub(); }, 30000);
                }
              } catch {
                // Post-rehydration sync setup failed
              }
            }, 200);
          }
        };
      }
    }
  )
);
