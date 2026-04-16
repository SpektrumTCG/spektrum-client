import type { AvatarCard } from '../types';

export interface PlayerBoardSnapshot {
  activeAvatar: AvatarCard | null;
  reserveAvatars: (AvatarCard | null)[];
}

/**
 * Scans a player's board for all slots that are legal evolution targets
 * for a given Level 2 card.
 *
 * A slot is valid when ALL of the following are true:
 *   1. The slot is occupied (non-null)
 *   2. The occupant has level === 1
 *   3. The occupant shares the same subType as the Level 2 card
 *   4. The occupant has been in play for at least one full turn
 *      (turnPlayed < currentTurn, or turnPlayed is undefined which means it was placed before tracking started)
 *
 * @param level2Card  - The Level 2 AvatarCard the player wants to play
 * @param player      - Snapshot of the player's board (active + reserve slots)
 * @param currentTurn - The current game turn number
 * @returns Array of slot identifiers: 'active' | number (reserve index)
 */
export function getValidEvolutionTargets(
  level2Card: AvatarCard,
  player: PlayerBoardSnapshot,
  currentTurn: number
): Array<'active' | number> {
  const validSlots: Array<'active' | number> = [];

  const isValidTarget = (target: AvatarCard | null): boolean => {
    if (!target) return false;
    if (Number(target.level) !== 1) return false;
    if (target.subType !== level2Card.subType) return false;
    if (target.turnPlayed !== undefined && target.turnPlayed >= currentTurn) return false;
    return true;
  };

  if (isValidTarget(player.activeAvatar)) {
    validSlots.push('active');
  }

  player.reserveAvatars.forEach((avatar, index) => {
    if (isValidTarget(avatar)) {
      validSlots.push(index);
    }
  });

  return validSlots;
}
