import type { EffectTargetType, AvatarCard } from '../types';
import type { Player } from '../types/card'; // Player = 'player' | 'opponent' string union

export interface PlayerState {
  activeAvatar: AvatarCard | null;
  reserveAvatars: (AvatarCard | null)[];
}

export interface TargetResolutionResult {
  targets: AvatarCard[];
  requiresSelection: boolean;
  selectionType?: 'player_reserve' | 'opponent_reserve' | 'player_avatar' | 'opponent_avatar';
}

/**
 * Resolves effect targets based on EffectTargetType
 * Returns array of target avatars and whether interactive selection is needed
 */
export function resolveEffectTargets(
  targetType: EffectTargetType,
  currentPlayer: Player,
  playerState: PlayerState,
  opponentState: PlayerState,
  conditionValue?: string
): TargetResolutionResult {

  const isPlayerTurn = currentPlayer === 'player';
  const activePlayerState = isPlayerTurn ? playerState : opponentState;
  const activeOpponentState = isPlayerTurn ? opponentState : playerState;

  switch (targetType) {
    case 'player_active':
      return {
        targets: activePlayerState.activeAvatar ? [activePlayerState.activeAvatar] : [],
        requiresSelection: false
      };

    case 'opponent_active':
      return {
        targets: activeOpponentState.activeAvatar ? [activeOpponentState.activeAvatar] : [],
        requiresSelection: false
      };

    case 'opponent_active_and_all_reserve':
      const allOpponentTargets: AvatarCard[] = [];
      if (activeOpponentState.activeAvatar) {
        allOpponentTargets.push(activeOpponentState.activeAvatar);
      }
      activeOpponentState.reserveAvatars.forEach(avatar => {
        if (avatar) allOpponentTargets.push(avatar);
      });
      return {
        targets: allOpponentTargets,
        requiresSelection: false
      };

    case 'select_player_reserve':
      return {
        targets: [], // Will be filled after user selection
        requiresSelection: true,
        selectionType: 'player_reserve'
      };

    case 'select_opponent_reserve':
      return {
        targets: [], // Will be filled after user selection
        requiresSelection: true,
        selectionType: 'opponent_reserve'
      };

    case 'select_player_avatar':
      return {
        targets: [], // Will be filled after user selection
        requiresSelection: true,
        selectionType: 'player_avatar'
      };

    case 'select_opponent_avatar':
      return {
        targets: [], // Will be filled after user selection
        requiresSelection: true,
        selectionType: 'opponent_avatar'
      };

    case 'all_player_avatars':
      const allPlayerAvatars: AvatarCard[] = [];
      if (activePlayerState.activeAvatar) {
        allPlayerAvatars.push(activePlayerState.activeAvatar);
      }
      activePlayerState.reserveAvatars.forEach(avatar => {
        if (avatar) allPlayerAvatars.push(avatar);
      });
      return {
        targets: allPlayerAvatars,
        requiresSelection: false
      };

    case 'all_opponent_avatars':
      const allOpponentAvatars: AvatarCard[] = [];
      if (activeOpponentState.activeAvatar) {
        allOpponentAvatars.push(activeOpponentState.activeAvatar);
      }
      activeOpponentState.reserveAvatars.forEach(avatar => {
        if (avatar) allOpponentAvatars.push(avatar);
      });
      return {
        targets: allOpponentAvatars,
        requiresSelection: false
      };

    case 'all_opponent_reserve':
      const allOpponentReserve: AvatarCard[] = [];
      activeOpponentState.reserveAvatars.forEach(avatar => {
        if (avatar) allOpponentReserve.push(avatar);
      });
      return {
        targets: allOpponentReserve,
        requiresSelection: false
      };

    case 'all_player_reserve':
      const allPlayerReserve: AvatarCard[] = [];
      activePlayerState.reserveAvatars.forEach(avatar => {
        if (avatar) allPlayerReserve.push(avatar);
      });
      return {
        targets: allPlayerReserve,
        requiresSelection: false
      };

    case 'all_cards_on_field':
      const allCardsOnField: AvatarCard[] = [];
      // Add all player avatars
      if (activePlayerState.activeAvatar) {
        allCardsOnField.push(activePlayerState.activeAvatar);
      }
      activePlayerState.reserveAvatars.forEach(avatar => {
        if (avatar) allCardsOnField.push(avatar);
      });
      // Add all opponent avatars
      if (activeOpponentState.activeAvatar) {
        allCardsOnField.push(activeOpponentState.activeAvatar);
      }
      activeOpponentState.reserveAvatars.forEach(avatar => {
        if (avatar) allCardsOnField.push(avatar);
      });
      return {
        targets: allCardsOnField,
        requiresSelection: false
      };

    // Player element targeting (friendly units)
    case 'all_player_fire_avatars':
      return {
        targets: getAllElementAvatars('fire', activePlayerState),
        requiresSelection: false
      };

    case 'all_player_water_avatars':
      return {
        targets: getAllElementAvatars('water', activePlayerState),
        requiresSelection: false
      };

    case 'all_player_ground_avatars':
      return {
        targets: getAllElementAvatars('ground', activePlayerState),
        requiresSelection: false
      };

    case 'all_player_air_avatars':
      return {
        targets: getAllElementAvatars('air', activePlayerState),
        requiresSelection: false
      };

    // Opponent element targeting (enemy units)
    case 'all_opponent_fire_avatars':
      return {
        targets: getAllElementAvatars('fire', activeOpponentState),
        requiresSelection: false
      };

    case 'all_opponent_water_avatars':
      return {
        targets: getAllElementAvatars('water', activeOpponentState),
        requiresSelection: false
      };

    case 'all_opponent_ground_avatars':
      return {
        targets: getAllElementAvatars('ground', activeOpponentState),
        requiresSelection: false
      };

    case 'all_opponent_air_avatars':
      return {
        targets: getAllElementAvatars('air', activeOpponentState),
        requiresSelection: false
      };

    // Generic element targeting (requires conditionValue for element type)
    case 'all_element_avatars':
      if (conditionValue) {
        const elementAvatars: AvatarCard[] = [
          ...getAllElementAvatars(conditionValue, activePlayerState),
          ...getAllElementAvatars(conditionValue, activeOpponentState),
        ];
        return {
          targets: elementAvatars,
          requiresSelection: false
        };
      }
      return {
        targets: [],
        requiresSelection: false
      };

    // Legacy deprecated cases - default to player for backward compatibility
    case 'all_fire_avatars':
      return {
        targets: getAllElementAvatars('fire', activePlayerState),
        requiresSelection: false
      };

    case 'all_water_avatars':
      return {
        targets: getAllElementAvatars('water', activePlayerState),
        requiresSelection: false
      };

    case 'all_ground_avatars':
      return {
        targets: getAllElementAvatars('ground', activePlayerState),
        requiresSelection: false
      };

    case 'all_air_avatars':
      return {
        targets: getAllElementAvatars('air', activePlayerState),
        requiresSelection: false
      };

    case 'player':
    case 'opponent':
      // These target the player/opponent themselves, not avatars
      // Return empty array - handle separately in game logic
      return {
        targets: [],
        requiresSelection: false
      };

    default: {
      const _exhaustive: never = targetType;
      return {
        targets: [],
        requiresSelection: false
      };
    }
  }
}

/**
 * Helper to get all avatars of a specific element from a given player state
 */
function getAllElementAvatars(element: string, playerState: PlayerState): AvatarCard[] {
  const elementAvatars: AvatarCard[] = [];

  if (playerState.activeAvatar && playerState.activeAvatar.element === element) {
    elementAvatars.push(playerState.activeAvatar);
  }

  playerState.reserveAvatars.forEach(avatar => {
    if (avatar && avatar.element === element) {
      elementAvatars.push(avatar);
    }
  });

  return elementAvatars;
}

/**
 * Helper to get all valid selection targets for interactive selection
 */
export function getSelectionTargets(
  selectionType: 'player_reserve' | 'opponent_reserve' | 'player_avatar' | 'opponent_avatar',
  currentPlayer: Player,
  playerState: PlayerState,
  opponentState: PlayerState
): AvatarCard[] {
  const isPlayerTurn = currentPlayer === 'player';
  const activePlayerState = isPlayerTurn ? playerState : opponentState;
  const activeOpponentState = isPlayerTurn ? opponentState : playerState;

  // For reserve-only selection
  if (selectionType === 'player_reserve') {
    return activePlayerState.reserveAvatars.filter((avatar): avatar is AvatarCard => avatar !== null);
  }
  if (selectionType === 'opponent_reserve') {
    return activeOpponentState.reserveAvatars.filter((avatar): avatar is AvatarCard => avatar !== null);
  }

  // For any avatar selection (active + reserve)
  if (selectionType === 'player_avatar') {
    const allAvatars: AvatarCard[] = [];
    if (activePlayerState.activeAvatar) {
      allAvatars.push(activePlayerState.activeAvatar);
    }
    activePlayerState.reserveAvatars.forEach(avatar => {
      if (avatar) allAvatars.push(avatar);
    });
    return allAvatars;
  }

  if (selectionType === 'opponent_avatar') {
    const allAvatars: AvatarCard[] = [];
    if (activeOpponentState.activeAvatar) {
      allAvatars.push(activeOpponentState.activeAvatar);
    }
    activeOpponentState.reserveAvatars.forEach(avatar => {
      if (avatar) allAvatars.push(avatar);
    });
    return allAvatars;
  }

  return [];
}
