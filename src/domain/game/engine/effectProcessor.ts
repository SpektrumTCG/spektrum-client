import type { AvatarCard, Card } from '../types';
import { createConditionalDamageProcessor } from './conditionalDamageProcessor';

// Interface for effect processing results
export interface EffectResult {
  success: boolean;
  message: string;
  targetAvatar?: AvatarCard;
  sourceAvatar?: AvatarCard;
  affectedAvatars?: AvatarCard[]; // For multi-target effects
  damage?: number;
  healing?: number;
  cardsDraw?: number;
  spektraGain?: number;
}

// Enhanced damage calculation with conditional modifiers
export function calculateEnhancedDamage(
  attackingCard: AvatarCard,
  skill: any,
  baseDamage: number,
  gameState: any
): number {
  // Create mock game state structure for conditional damage processor
  const mockGameState = {
    currentTurn: gameState.turn || 1,
    phase: 'battle' as const,
    players: [
      {
        id: 'player',
        name: 'Player',
        health: gameState.playerHealth || 20,
        maxHealth: 20,
        spektra: gameState.playerSpektra || { fire: 0, water: 0, ground: 0, air: 0, neutral: 0 },
        hand: gameState.playerHand || [],
        deck: gameState.playerDeck || [],
        discardPile: gameState.playerGraveyard || [],
        graveyard: gameState.playerGraveyard || [],
        field: gameState.playerFieldCards || [],
        activeAvatar: gameState.playerActiveAvatar,
        counters: gameState.playerActiveAvatar?.counters || {},
        discardedThisTurn: [],
        isActivePlayer: true
      },
      {
        id: 'opponent',
        name: 'Opponent',
        health: gameState.opponentHealth || 20,
        maxHealth: 20,
        spektra: gameState.opponentSpektra || { fire: 0, water: 0, ground: 0, air: 0, neutral: 0 },
        hand: gameState.opponentHand || [],
        deck: gameState.opponentDeck || [],
        discardPile: gameState.opponentGraveyard || [],
        graveyard: gameState.opponentGraveyard || [],
        field: gameState.opponentFieldCards || [],
        activeAvatar: gameState.opponentActiveAvatar,
        counters: gameState.opponentActiveAvatar?.counters || {},
        discardedThisTurn: [],
        isActivePlayer: false
      }
    ] as const,
    currentPlayerIndex: 0 as const,
    winner: null,
    turnTimer: 30,
    lastAction: '',
    battleLog: [],
    effectStack: []
  };

  try {
    if (skill.effect?.toLowerCase().includes('fire element') &&
        (attackingCard.element === 'fire' || gameState.playerActiveAvatar?.element === 'fire')) {
      const match = skill.effect.match(/damage become (\d+)/);
      if (match) return parseInt(match[1]);
    }

    if (skill.effect?.toLowerCase().includes('equipment') &&
        (attackingCard as any).attachedEquipment?.length > 0) {
      const match = skill.effect.match(/damage become (\d+)/);
      if (match) return parseInt(match[1]);
    }

    return baseDamage;
  } catch (error) {
    console.error('Error calculating conditional damage:', error);
    return baseDamage;
  }
}

// Process different effect types - now supports multi-target
export function processGameEffect(
  effectType: string,
  sourceAvatar: AvatarCard,
  targetAvatars: AvatarCard | AvatarCard[] | null,
  value: number,
  gameState: any,
  updateGameState: (update: any) => void
): EffectResult {

  // Normalize to array for consistent processing
  const targets = Array.isArray(targetAvatars)
    ? targetAvatars
    : targetAvatars
      ? [targetAvatars]
      : [];

  switch (effectType) {
    case 'basic_damage':
      return processMultiTargetDamage(sourceAvatar, targets, value, updateGameState);

    case 'splash_attack':
      return processMultiTargetDamage(sourceAvatar, targets, value, updateGameState);

    case 'buff':
      return processMultiTargetBuff(targets, value, updateGameState);

    case 'debuff':
      return processMultiTargetDebuff(targets, value, updateGameState);

    case 'increase_damage':
      return processIncreaseDamage(sourceAvatar, value, updateGameState);

    case 'heal':
      return processMultiTargetHeal(targets, value, updateGameState);

    case 'shield':
      return processMultiTargetShield(targets, value, updateGameState);

    case 'draw_card':
      return processDrawCard(gameState, updateGameState, value);

    case 'counter_attack':
      return processCounterAttack(sourceAvatar, targets[0] || null, value, updateGameState);

    case 'bleed':
      return processMultiTargetBleed(targets, value, updateGameState);

    case 'damage':
      return processMultiTargetDamage(sourceAvatar, targets, value, updateGameState);

    case 'draw':
      return processDrawCard(gameState, updateGameState, value);

    case 'discard':
      // TODO: Add UI modal for player to select cards
      return {
        success: true,
        message: `Discard ${value} card(s) - UI interaction needed`
      };

    case 'discard_all':
      return processDiscardAll(gameState, updateGameState);

    case 'deck_top':
      return {
        success: true,
        message: 'Move card to top of deck - UI interaction needed'
      };

    case 'deck_bottom':
      return {
        success: true,
        message: 'Move card to bottom of deck - UI interaction needed'
      };

    case 'reveal_choose':
      return {
        success: true,
        message: `Reveal top ${value} cards - UI interaction needed`
      };

    case 'peek_deck':
      return processPeekDeck(gameState);

    case 'spell_protection':
      return processSpellProtection(gameState, updateGameState, value, sourceAvatar);

    case 'discard_search':
      // Returns success - actual discard/search UI handled by useCardGame
      return {
        success: true,
        message: 'Select an avatar card to discard and search for same element'
      };

    default:
      return {
        success: false,
        message: `Unknown effect type: ${effectType}`
      };
  }
}

// Multi-target damage processing
function processMultiTargetDamage(
  sourceAvatar: AvatarCard,
  targets: AvatarCard[],
  damage: number,
  updateGameState: (update: any) => void
): EffectResult {
  if (targets.length === 0) {
    return {
      success: false,
      message: 'No targets available for damage'
    };
  }

  const affectedAvatars: AvatarCard[] = [];
  let totalDamageDealt = 0;

  targets.forEach(targetAvatar => {
    // Shield Logic: Each shield counter blocks up to 10 damage
    const currentShield = Math.min(targetAvatar.counters?.shield || 0, 2);
    let damageAfterShield = damage;
    let shieldCountersRemoved = 0;
    let damageBlocked = 0;

    if (currentShield > 0) {
      if (damage <= 10) {
        shieldCountersRemoved = 1;
        damageBlocked = damage;
        damageAfterShield = 0;
      } else if (damage <= 20) {
        if (currentShield >= 2) {
          shieldCountersRemoved = 2;
          damageBlocked = damage;
          damageAfterShield = 0;
        } else {
          shieldCountersRemoved = 1;
          damageBlocked = 10;
          damageAfterShield = damage - 10;
        }
      } else {
        shieldCountersRemoved = Math.min(2, currentShield);
        damageBlocked = shieldCountersRemoved * 10;
        damageAfterShield = damage - damageBlocked;
      }
    }

    const updatedAvatar: AvatarCard = {
      ...targetAvatar,
      counters: {
        ...(targetAvatar.counters || { damage: 0, bleed: 0, shield: 0 }),
        damage: (targetAvatar.counters?.damage || 0) + damageAfterShield,
        shield: currentShield - shieldCountersRemoved
      }
    };

    // Apply the damage update to the game state
    updateGameState({ updatedAvatar });

    affectedAvatars.push(updatedAvatar);
    totalDamageDealt += damageAfterShield;
  });

  return {
    success: true,
    message: targets.length === 1
      ? `Dealt ${totalDamageDealt} damage to ${targets[0].name}`
      : `Dealt ${damage} damage to ${targets.length} targets`,
    affectedAvatars,
    damage: totalDamageDealt
  };
}

// Multi-target heal processing
function processMultiTargetHeal(
  targets: AvatarCard[],
  healAmount: number,
  updateGameState: (update: any) => void
): EffectResult {
  if (targets.length === 0) {
    return {
      success: false,
      message: 'No targets available for healing'
    };
  }

  const affectedAvatars: AvatarCard[] = [];

  targets.forEach(targetAvatar => {
    const currentDamage = targetAvatar.counters?.damage || 0;
    const actualHeal = Math.min(healAmount, currentDamage);

    const updatedAvatar: AvatarCard = {
      ...targetAvatar,
      counters: {
        ...(targetAvatar.counters || { damage: 0, bleed: 0, shield: 0 }),
        damage: Math.max(0, currentDamage - healAmount)
      }
    };

    affectedAvatars.push(updatedAvatar);
  });

  return {
    success: true,
    message: targets.length === 1
      ? `Healed ${healAmount} damage from ${targets[0].name}`
      : `Healed ${healAmount} damage from ${targets.length} avatars`,
    affectedAvatars,
    healing: healAmount
  };
}

// Multi-target shield processing
function processMultiTargetShield(
  targets: AvatarCard[],
  shieldCount: number,
  updateGameState: (update: any) => void
): EffectResult {
  if (targets.length === 0) {
    return {
      success: false,
      message: 'No targets available for shield'
    };
  }

  const affectedAvatars: AvatarCard[] = [];

  targets.forEach(targetAvatar => {
    const currentShield = targetAvatar.counters?.shield || 0;
    const newShield = Math.min(currentShield + shieldCount, 2);

    const updatedAvatar: AvatarCard = {
      ...targetAvatar,
      counters: {
        ...(targetAvatar.counters || { damage: 0, bleed: 0, shield: 0 }),
        shield: newShield
      }
    };

    affectedAvatars.push(updatedAvatar);
  });

  return {
    success: true,
    message: targets.length === 1
      ? `Added ${shieldCount} shield counter(s) to ${targets[0].name}`
      : `Added ${shieldCount} shield counter(s) to ${targets.length} avatars`,
    affectedAvatars
  };
}

// Multi-target buff processing
function processMultiTargetBuff(
  targets: AvatarCard[],
  buffAmount: number,
  updateGameState: (update: any) => void
): EffectResult {
  if (targets.length === 0) {
    return {
      success: false,
      message: 'No targets available for buff'
    };
  }

  // Buff increases base damage in skills - handled via temporary state
  return {
    success: true,
    message: targets.length === 1
      ? `${targets[0].name} gains +${buffAmount} damage to skills this turn`
      : `${targets.length} avatars gain +${buffAmount} damage this turn`,
    affectedAvatars: targets
  };
}

// Multi-target debuff processing
function processMultiTargetDebuff(
  targets: AvatarCard[],
  debuffAmount: number,
  updateGameState: (update: any) => void
): EffectResult {
  if (targets.length === 0) {
    return {
      success: false,
      message: 'No targets available for debuff'
    };
  }

  return {
    success: true,
    message: targets.length === 1
      ? `${targets[0].name} takes -${debuffAmount} damage from skills this turn`
      : `${targets.length} avatars take -${debuffAmount} damage this turn`,
    affectedAvatars: targets
  };
}

// Multi-target bleed processing
function processMultiTargetBleed(
  targets: AvatarCard[],
  bleedCount: number,
  updateGameState: (update: any) => void
): EffectResult {
  if (targets.length === 0) {
    return {
      success: false,
      message: 'No targets available for bleed'
    };
  }

  const affectedAvatars: AvatarCard[] = [];

  targets.forEach(targetAvatar => {
    const updatedAvatar: AvatarCard = {
      ...targetAvatar,
      counters: {
        ...(targetAvatar.counters || { damage: 0, bleed: 0, shield: 0 }),
        bleed: (targetAvatar.counters?.bleed || 0) + bleedCount
      }
    };

    affectedAvatars.push(updatedAvatar);
  });

  return {
    success: true,
    message: targets.length === 1
      ? `Applied ${bleedCount} bleed counter(s) to ${targets[0].name}`
      : `Applied ${bleedCount} bleed counter(s) to ${targets.length} avatars`,
    affectedAvatars
  };
}

// Single target increase damage (typically self-buff)
function processIncreaseDamage(
  sourceAvatar: AvatarCard,
  newDamage: number,
  updateGameState: (update: any) => void
): EffectResult {
  return {
    success: true,
    message: `${sourceAvatar.name}'s attack damage increased to ${newDamage}`,
    sourceAvatar
  };
}

// Draw card effect
function processDrawCard(
  gameState: any,
  updateGameState: (update: any) => void,
  count: number = 1
): EffectResult {
  return {
    success: true,
    message: `Draw ${count} card(s) from your deck`,
    cardsDraw: count
  };
}

// Counter attack effect
function processCounterAttack(
  sourceAvatar: AvatarCard,
  targetAvatar: AvatarCard | null,
  damage: number,
  updateGameState: (update: any) => void
): EffectResult {
  if (!targetAvatar) {
    return {
      success: false,
      message: 'No target for counter attack'
    };
  }

  const updatedTarget: AvatarCard = {
    ...targetAvatar,
    counters: {
      ...(targetAvatar.counters || { damage: 0, bleed: 0, burn: 0, poison: 0, stun: 0, shield: 0 }),
      damage: (targetAvatar.counters?.damage || 0) + damage
    }
  };

  updateGameState({ updatedAvatar: updatedTarget });

  return {
    success: true,
    message: `Counter attack deals ${damage} damage back to ${targetAvatar.name}`,
    targetAvatar: updatedTarget,
    damage
  };
}

// Discard all cards from hand
function processDiscardAll(
  gameState: any,
  updateGameState: (update: any) => void
): EffectResult {
  // Note: Actual implementation should be in game store
  // This returns a signal for the game to handle
  return {
    success: true,
    message: 'Discard all cards from hand'
  };
}

// Peek at top card of deck
function processPeekDeck(
  gameState: any
): EffectResult {
  // Note: Actual implementation should be in game store
  // This returns a signal for the game to handle
  return {
    success: true,
    message: 'Peek at top card of deck'
  };
}

// Add spell protection to player
function processSpellProtection(
  gameState: any,
  updateGameState: (update: any) => void,
  count: number,
  sourceAvatar: AvatarCard
): EffectResult {
  // The filter string is stored in sourceAvatar's skill conditionValue
  // Format: "element,cardType" or just "element" or just "cardType"
  // This will be handled by the actual game store implementation
  return {
    success: true,
    message: `Gained protection against ${count} spell(s)`
  };
}
