/**
 * PREMADE DECK CARDS - Purchasable Decks
 * 
 * These decks are available for purchase in the shop.
 * Each deck has 40 cards with specific strategies and themes.
 * Uses card `cardNumber` (GEN-xxx) for lookup - unique per expansion.
 * 
 * PRIMARY SOURCE: Database (premade_decks + premade_deck_cards tables)
 * This file provides client-side types and fetch helpers.
 * 
 * RANDOM SLOTS:
 * Some Avatar Lv2 slots are "random" - the buyer gets 1 card randomly
 * chosen from a set of options. Use `randomOptions` array for these.
 */

export interface PremadeDeckCard {
  cardNumber: string;
  cardName: string;
  cardType: string;
  quantity: number;
  cardId?: string;
  isRandomSlot?: boolean;
  randomOptions?: string[];
}

export interface PremadeDeckCardList {
  id: string;
  name: string;
  expansion: string;
  element: string;
  tribe: string;
  description: string;
  price: number;
  cardCount: number;
  strategy: string;
  difficulty: string;
  coverCardName: string;
  keyCards: string[];
  artUrl: string;
  deckBoxImageUrl?: string;
  cards: PremadeDeckCard[];
}

export async function fetchPremadeDecks(): Promise<PremadeDeckCardList[]> {
  const response = await fetch('/api/premade-decks');
  if (!response.ok) {
    throw new Error('Failed to fetch premade decks');
  }
  return response.json();
}

export async function fetchPremadeDeck(deckId: string): Promise<PremadeDeckCardList | null> {
  const response = await fetch(`/api/premade-decks/${deckId}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

/**
 * Resolve random slots for a premade deck from database data.
 * For cards with randomOptions, randomly picks one cardNumber from the pool.
 * Returns a new list with all random slots resolved.
 */
export function resolvePremadeDeckCards(cards: PremadeDeckCard[]): PremadeDeckCard[] {
  return cards.map(card => {
    if (card.isRandomSlot && card.randomOptions && card.randomOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * card.randomOptions.length);
      const chosenCardNumber = card.randomOptions[randomIndex];
      console.log(`🎲 Random slot: picked ${chosenCardNumber} from [${card.randomOptions.join(', ')}]`);
      return {
        ...card,
        cardNumber: chosenCardNumber,
        cardId: undefined,
        cardName: card.cardName,
        isRandomSlot: false,
        randomOptions: undefined
      };
    }
    return card;
  });
}

/**
 * Helper function to get total card count from a card list
 */
export function getPremadeDeckCardCount(cards: PremadeDeckCard[]): number {
  return cards.reduce((total, card) => total + card.quantity, 0);
}
