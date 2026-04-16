import type { AvatarCard, BaseCard, Card } from '../types';

/**
 * Dismantles a defeated (stacked) avatar into an ordered array of graveyard entries.
 *
 * Order of graveyard entries:
 *   1. All attached equipment cards (spread from attachedEquipment array)
 *   2. The baseCard (the Level 1 the avatar evolved from), if present
 *   3. The clean avatar itself (counters cleared, isTapped cleared, attachedEquipment cleared, baseCard cleared)
 *
 * This ensures that when a Level 2 avatar is defeated, both the Level 2 and its Level 1
 * base land individually in the graveyard, making them findable by retrieval effects.
 *
 * @param defeatedAvatar - The avatar whose HP has reached 0
 * @returns Ordered array of Card objects to push into the player's graveyard
 */
export function destroyAvatar(defeatedAvatar: AvatarCard): Card[] {
  const cardsToGraveyard: Card[] = [];

  if (defeatedAvatar.attachedEquipment && defeatedAvatar.attachedEquipment.length > 0) {
    defeatedAvatar.attachedEquipment.forEach((equipment: BaseCard) => {
      cardsToGraveyard.push(equipment as Card);
    });
  }

  if (defeatedAvatar.baseCard) {
    cardsToGraveyard.push(defeatedAvatar.baseCard as Card);
  }

  const cleanAvatar: AvatarCard = {
    ...defeatedAvatar,
    counters: undefined,
    isTapped: false,
    attachedEquipment: undefined,
    baseCard: undefined,
  };

  cardsToGraveyard.push(cleanAvatar as Card);

  return cardsToGraveyard;
}
