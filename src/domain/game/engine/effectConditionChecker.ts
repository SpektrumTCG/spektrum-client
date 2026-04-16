import type { ConditionType, AvatarCard, ElementType, SubType, Card } from '../types';

export interface ConditionCheckContext {
  sourceAvatar: AvatarCard;
  playerSpektraPile: Card[];
  playerActiveAvatar: AvatarCard | null;
  playerReserveAvatars: AvatarCard[];
  opponentActiveAvatar: AvatarCard | null;
  opponentReserveAvatars: AvatarCard[];
}

/**
 * Checks if a condition is met for triggering an effect
 * Now supports specific targeting for elemental and type conditions
 */
export function checkEffectCondition(
  condition: ConditionType,
  conditionValue: string | number | undefined,
  context: ConditionCheckContext
): boolean {
  switch (condition) {
    case 'none':
      return true;

    case 'elemental_spektra_pile':
      // Check if player's spektra pile contains the specified element
      if (!conditionValue) return false;
      const elements = String(conditionValue).split(',').map(e => e.trim().toLowerCase());
      return context.playerSpektraPile.some(card =>
        elements.includes(card.element.toLowerCase())
      );

    case 'elemental_opponent_active':
      // Check if opponent's active avatar has the specified element
      if (!conditionValue || !context.opponentActiveAvatar) return false;
      const opponentActiveElements = String(conditionValue).split(',').map(e => e.trim().toLowerCase());
      return opponentActiveElements.includes(context.opponentActiveAvatar.element.toLowerCase());

    case 'elemental_opponent_reserve':
      // Check if opponent has the specified element in their reserve
      if (!conditionValue) return false;
      const opponentReserveElements = String(conditionValue).split(',').map(e => e.trim().toLowerCase());
      return context.opponentReserveAvatars.some(avatar =>
        opponentReserveElements.includes(avatar.element.toLowerCase())
      );

    case 'elemental_player_avatars':
      // Check if player has the specified element in active OR reserve
      if (!conditionValue) return false;
      const playerAvatarElements = String(conditionValue).split(',').map(e => e.trim().toLowerCase());
      // Check active avatar
      const hasPlayerActiveElement = context.playerActiveAvatar &&
        playerAvatarElements.includes(context.playerActiveAvatar.element.toLowerCase());
      // Check reserve avatars
      const hasPlayerReserveElement = context.playerReserveAvatars.some(avatar =>
        playerAvatarElements.includes(avatar.element.toLowerCase())
      );
      return hasPlayerActiveElement || hasPlayerReserveElement;

    case 'elemental_opponent_avatars':
      // Check if opponent has the specified element in active OR reserve
      if (!conditionValue) return false;
      const opponentAvatarElements = String(conditionValue).split(',').map(e => e.trim().toLowerCase());
      // Check active avatar
      const hasOpponentActiveElement = context.opponentActiveAvatar &&
        opponentAvatarElements.includes(context.opponentActiveAvatar.element.toLowerCase());
      // Check reserve avatars
      const hasOpponentReserveElement = context.opponentReserveAvatars.some(avatar =>
        opponentAvatarElements.includes(avatar.element.toLowerCase())
      );
      return hasOpponentActiveElement || hasOpponentReserveElement;

    case 'type_player_reserve':
      // Check if player has the specified tribe in their reserve
      if (!conditionValue) return false;
      const playerTribes = String(conditionValue).split(',').map(t => t.trim());
      return context.playerReserveAvatars.some(avatar =>
        playerTribes.some(tribe =>
          avatar.subType === tribe as SubType ||
          avatar.tribe === tribe as SubType
        )
      );

    case 'type_opponent_active':
      // Check if opponent's active avatar has the specified tribe
      if (!conditionValue || !context.opponentActiveAvatar) return false;
      const opponentActiveTribes = String(conditionValue).split(',').map(t => t.trim());
      const opponentActive = context.opponentActiveAvatar; // Store in const to satisfy TypeScript
      return opponentActiveTribes.some(tribe =>
        opponentActive.subType === tribe as SubType ||
        opponentActive.tribe === tribe as SubType
      );

    case 'type_opponent_reserve':
      // Check if opponent has the specified tribe in their reserve
      if (!conditionValue) return false;
      const opponentReserveTribes = String(conditionValue).split(',').map(t => t.trim());
      return context.opponentReserveAvatars.some(avatar =>
        opponentReserveTribes.some(tribe =>
          avatar.subType === tribe as SubType ||
          avatar.tribe === tribe as SubType
        )
      );

    case 'damage_to_self':
      // Check if source avatar has taken damage above threshold
      const damageThreshold = typeof conditionValue === 'number' ? conditionValue : parseInt(String(conditionValue) || '0');
      const currentDamage = context.sourceAvatar.counters?.damage || 0;
      return currentDamage >= damageThreshold;

    default:
      return false;
  }
}
