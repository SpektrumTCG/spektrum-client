import type { Card } from '../types';

// Helper function to check if a card has "you may discard" mechanics
export function hasDiscardMechanic(card: Card): boolean {
  if (!card.description) return false;

  const description = card.description.toLowerCase();
  return description.includes('you may discard') ||
         description.includes('discard for') ||
         description.includes('optional discard');
}

// Extract bonus effect from card description for discard mechanic
export function getDiscardBonusEffect(card: Card): string | null {
  if (!card.description || !hasDiscardMechanic(card)) return null;

  const description = card.description;

  // Look for patterns like "you may discard: [effect]" or "discard for [effect]"
  const patterns = [
    /you may discard[:\-,]?\s*(.+?)(?:\.|$)/i,
    /discard for[:\-,]?\s*(.+?)(?:\.|$)/i,
    /optional discard[:\-,]?\s*(.+?)(?:\.|$)/i
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return "Get bonus effect from this card";
}

// Check if a specific card should trigger discard confirmation
export function shouldShowDiscardConfirmation(card: Card): boolean {
  return hasDiscardMechanic(card);
}
