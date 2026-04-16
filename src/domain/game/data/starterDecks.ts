export interface StarterDeckCard {
  cardNumber: string;
  cardName: string;
  cardType: string;
  quantity: number;
}

export interface StarterDeck {
  id: string;
  name: string;
  faction: 'guardians' | 'corrupted';
  element: 'fire' | 'water';
  tribes: string;
  description: string;
  cards: StarterDeckCard[];
}

export async function fetchStarterDecks(): Promise<StarterDeck[]> {
  const response = await fetch('/api/starter-decks');
  if (!response.ok) {
    throw new Error('Failed to fetch starter decks');
  }
  return response.json();
}

export async function fetchStarterDeck(deckId: string): Promise<StarterDeck | null> {
  const response = await fetch(`/api/starter-decks/${deckId}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export function getStarterDeckId(faction: 'guardians' | 'corrupted', element: 'fire' | 'water'): string {
  if (faction === 'guardians') {
    return element === 'fire' ? 'starter-genesis-fire-kobar-borah-deck' : 'starter-genesis-water-kobar-borah-deck';
  } else {
    return element === 'fire' ? 'starter-genesis-fire-kuhaka-kujana-deck' : 'starter-genesis-water-kuhaka-kujana-deck';
  }
}
