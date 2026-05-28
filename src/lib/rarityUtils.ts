import type { Card, RarityType } from '@spektrum/shared';

export const RARITY_COLORS: Record<RarityType, string> = {
  'Common': 'border-gray-400 bg-gray-500',
  'Uncommon': 'border-green-400 bg-green-500',
  'Rare': 'border-blue-400 bg-blue-500',
  'Super Rare': 'border-purple-400 bg-purple-500',
  'Mythic': 'border-yellow-400 bg-yellow-500'
};

export const RARITY_TEXT_COLORS: Record<RarityType, string> = {
  'Common': 'text-gray-400',
  'Uncommon': 'text-green-400',
  'Rare': 'text-blue-400',
  'Super Rare': 'text-purple-400',
  'Mythic': 'text-yellow-400'
};

export const RARITY_ORDER: Record<RarityType, number> = {
  'Common': 1,
  'Uncommon': 2,
  'Rare': 3,
  'Super Rare': 4,
  'Mythic': 5
};

export const RARITY_RATES = {
  'Common': 60,
  'Uncommon': 25,
  'Rare': 10,
  'Super Rare': 4,
  'Mythic': 1
};

export function getRarityColor(rarity: RarityType): string {
  return RARITY_COLORS[rarity] || RARITY_COLORS.Common;
}

export function getRarityTextColor(rarity: RarityType): string {
  return RARITY_TEXT_COLORS[rarity] || RARITY_TEXT_COLORS.Common;
}

export function getRarityWeight(rarity: RarityType): number {
  return RARITY_ORDER[rarity] || 1;
}

export function getRandomRarity(): RarityType {
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const [rarity, rate] of Object.entries(RARITY_RATES)) {
    cumulative += rate;
    if (random <= cumulative) {
      return rarity as RarityType;
    }
  }

  return 'Common';
}

// Get the base card ID without rarity suffix
export function getBaseCardId(cardName: string): string {
  // For card names (not IDs), we should NOT group variants like "Kobar Trainee A", "Kobar Trainee B"
  // These are distinct cards, not rarity variants
  // Only remove numeric rarity suffixes from actual card IDs like "kobar-trainee-1", "kobar-trainee-2"

  // If it's a card name (contains spaces and capital letters), return as-is
  if (cardName.includes(' ') && /[A-Z]/.test(cardName)) {
    return cardName;
  }

  // If it's a card ID (lowercase with dashes), remove numeric rarity suffix
  return cardName.replace(/-\d+$/, '');
}

// Get the base card name for gameplay purposes (treats rare variants as same functional card)
export function getGameplayBaseCardName(cardName: string): string {
  if (cardName.includes(', Rare')) {
    return cardName.replace(', Rare', '');
  }
  return cardName;
}

// Get the base card name for deck building limits (variants share same limit pool)
export function getDeckBuildingBaseCardName(cardName: string): string {
  if (cardName.includes(', Rare')) {
    return cardName.replace(', Rare', '');
  }
  return cardName;
}

// Generate card ID with rarity suffix
export function generateRarityCardId(baseName: string, rarity: RarityType): string {
  const rarityIndex = getRarityWeight(rarity);
  return `${baseName.toLowerCase().replace(/\s+/g, '-')}-${rarityIndex}`;
}

// Check if cards are the same base card (ignoring rarity)
export function isSameBaseCard(card1Id: string, card2Id: string): boolean {
  return getBaseCardId(card1Id) === getBaseCardId(card2Id);
}

// Extract the original card ID from owned/deck card IDs
export function getOriginalCardId(cardId: string): string {
  let cleanId = cardId.replace(/^owned-/, '');
  cleanId = cleanId.split('-copy-')[0];
  cleanId = cleanId.replace(/-\d{10,}-\d+$/, '');
  cleanId = cleanId.replace(/-\d{10,}-[a-z0-9]+$/, '');
  cleanId = cleanId.replace(/-\d{10,}$/, '');
  return cleanId;
}

// Count how many copies of a card exist in a collection
export function countOwnedCopies(targetCard: Card, ownedCards: Card[]): number {
  const targetGroup = (targetCard as any).duplicateGroup || (targetCard as any).cardNumber;

  if (targetGroup) {
    return ownedCards.filter(c => {
      const cGroup = (c as any).duplicateGroup || (c as any).cardNumber;
      return cGroup === targetGroup;
    }).length;
  }

  const targetBaseId = getOriginalCardId(targetCard.id);
  return ownedCards.filter(c => getOriginalCardId(c.id) === targetBaseId).length;
}
