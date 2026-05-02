import type { AvatarCard } from '../types';
import type { Player, SkillCheckState } from '../types/card';

// SkillEffect interface since it doesn't exist in cardTypes
export interface SkillEffect {
  name: string;
  spektraCost: string[];
  damage: number;
  effect?: string;
  conditions?: import('../types/card').StructuredCondition[];
}

export type { Player, SkillCheckState };

// Interface for skill trigger check result
export interface SkillTriggerResult {
  shouldTrigger: boolean;
  modifiedDamage?: number;
  applyBleed?: number;
  applyShield?: number;
  healSelf?: number;      // Heal the active avatar
  healReserve?: number;   // Heal a reserve avatar
  message?: string;
}

// Check if a skill effect should trigger based on the current game state
export function checkSkillTrigger(
  skill: SkillEffect,
  avatar: AvatarCard,
  targetAvatar: AvatarCard | null | undefined,
  gameState: SkillCheckState,
  player: Player
): SkillTriggerResult {
  // Safety check for invalid inputs
  if (!skill || !avatar || !gameState) {
    console.error('Invalid parameters passed to checkSkillTrigger:', { skill, avatar, gameState });
    return {
      shouldTrigger: false,
      message: 'Error: Missing skill or game state information'
    };
  }

  // Default result - no trigger
  const result: SkillTriggerResult = {
    shouldTrigger: false
  };

  // --- NEW SYSTEM: Read structured conditions array ---
  if (skill.conditions && Array.isArray(skill.conditions)) {
    for (const condition of skill.conditions) {
      if (condition.type === 'opponent_tribe' && targetAvatar) {
        const targetTribe = targetAvatar.subType || targetAvatar.tribe;
        if (condition.value.includes(targetTribe)) {
          result.shouldTrigger = true;
          if (condition.effect?.type === 'damage_modification') {
            result.modifiedDamage = condition.effect.value;
            result.message = `Tribe Advantage! Damage modified to ${condition.effect.value}`;
          }
        }
      }
      if (condition.type === 'self_damage') {
        result.shouldTrigger = true;
        result.healSelf = -condition.value;
        result.message = `Recoil: Took ${condition.value} damage.`;
      }
    }
    if (result.shouldTrigger) return result;
  }

  // --- LEGACY SYSTEM: String 'effect' fallback ---
  if (!skill.effect) {
    return result;
  }

  // Ensure skill has a damage value
  if (skill.damage === undefined || skill.damage === null) {
    skill.damage = 0;
    console.warn('Skill has no damage value, defaulting to 0:', skill.name);
  }

  const effectText = skill.effect.toLowerCase();

  // Safety check for playerState and opponentState
  if (!gameState.player || !gameState.opponent) {
    console.error('Game state is missing player or opponent data');
    return result;
  }

  const playerState = player === 'player' ? gameState.player : gameState.opponent;
  const opponentState = player === 'player' ? gameState.opponent : gameState.player;

  // Check for hand size triggers (e.g., Radja's and Daisy's skills)
  if (effectText.includes("1 or less card in hand") ||
      effectText.includes("if you has 1 or less card")) {

    if (playerState.hand.length <= 1) {
      console.log(`Skill trigger: Hand size condition met (${playerState.hand.length} cards)`);
      result.shouldTrigger = true;

      // Extract exact damage from effect text if available
      if (effectText.includes("become 5")) {
        result.modifiedDamage = 5; // Radja's skill
      } else if (effectText.includes("become 6")) {
        result.modifiedDamage = 6; // Daisy's skill
      } else {
        result.modifiedDamage = skill.damage + 2; // Generic bonus
      }

      result.message = "Skill trigger: Damage increased due to having 1 or fewer cards in hand";
    } else {
      console.log(`Skill trigger: Hand size condition not met (${playerState.hand.length} cards)`);
    }
  }

  // Check for spektra discard effects for increased damage
  if (effectText.includes("discard a spektra card") ||
      effectText.includes("discard an spektra card") ||
      effectText.includes("discard a energy card") ||
      effectText.includes("discard an energy card")) {

    result.shouldTrigger = true;

    // Extract exact damage values for different cards
    if (effectText.includes("become 19")) {
      result.modifiedDamage = 19; // Crimson and Scarlet's Inferno Burn
    } else if (effectText.includes("become 23")) {
      result.modifiedDamage = 23; // Boar Berserker's Burn and Slam
    } else {
      result.modifiedDamage = skill.damage + 10; // Default bonus
    }

    result.message = "Skill trigger: Increased damage from discarding spektra card";
  }

  // Check for opponent having bleed counter effects
  if ((effectText.includes("if opponent active avatar has bleed counter") ||
      effectText.includes("if opponent active avatar has bleed counter")) &&
      targetAvatar && (targetAvatar.counters?.bleed || 0) > 0) {

    result.shouldTrigger = true;

    // Extract exact damage values based on card text
    if (effectText.includes("become 3")) {
      result.modifiedDamage = 3; // Borah Trainee C's Explosion
    } else if (effectText.includes("become 4")) {
      result.modifiedDamage = 4; // Banaspati Female's Pyro Punch
    } else {
      result.modifiedDamage = skill.damage + 2; // Generic bonus
    }

    result.message = "Skill trigger: Increased damage against bleeding opponent";
  }

  // Element type matchup triggers
  if (targetAvatar) {
    // Wind/Air type bonus damage
    if ((effectText.includes("if opponent active avatar is wind element avatar") ||
         effectText.includes("if opponent active avatar were air type")) &&
        targetAvatar.element === 'air') {

      result.shouldTrigger = true;

      // Check for specific damage values from card text
      if (effectText.includes("become 111")) {
        result.modifiedDamage = 111; // Radja's Burning Body
        result.message = "Element trigger: Massive damage against Air/Wind type avatar!";
      } else if (effectText.includes("become 13")) {
        result.modifiedDamage = 13; // Daisy's Burning Body
        result.message = "Element trigger: Strong damage against Air/Wind type avatar!";
      } else if (effectText.includes("become 11")) {
        result.modifiedDamage = 11; // Banaspati Female's Burning Body
        result.message = "Element trigger: Enhanced damage against Air/Wind type avatar!";
      } else if (effectText.includes("become 5")) {
        result.modifiedDamage = 5; // Boar Berserker's Fire Slash
        result.message = "Element trigger: +2 damage against Air type avatar";
      } else {
        // Default air type bonus
        result.modifiedDamage = skill.damage + 2;
        result.message = "Element trigger: +2 damage against Air type avatar";
      }
    }

    // Apply bleed counters to opponent
    if (effectText.includes("bleed counters") ||
        effectText.includes("bleed counter") ||
        effectText.includes("put 2 bleed") ||
        effectText.includes("put 1 bleed") ||
        effectText.includes("get 2 bleed")) {

      result.shouldTrigger = true;

      // Determine the number of bleed counters to apply
      if (effectText.includes("2 bleed")) {
        result.applyBleed = 2;
        result.message = "Effect trigger: Applied 2 bleed counters to opponent's avatar";
      } else {
        result.applyBleed = 1;
        result.message = "Effect trigger: Applied 1 bleed counter to opponent's avatar";
      }
    }

    // Check for coin flip mechanics
    if (effectText.includes("flip a coin")) {
      // Use pre-resolved coinFlipResult from caller for deterministic behaviour
      const flipResult = gameState.coinFlipResult ?? false;
      console.log(`Coin flip result: ${flipResult ? 'heads' : 'tails'}`);

      if (flipResult) {
        // Apply different effects based on card text
        if (effectText.includes("bleed counter")) {
          const bleedAmount = effectText.includes("2 bleed") ? 2 : 1;
          result.shouldTrigger = true;
          result.applyBleed = bleedAmount;
          result.message = `Coin flip: Heads! Applied ${bleedAmount} bleed counters to opponent`;
        }
      } else {
        result.message = "Coin flip: Tails! No effect.";
      }
    }

    // Heal effects for self or reserves
    if (effectText.includes("heal")) {
      result.shouldTrigger = true;

      // Different types of healing effects
      if (effectText.includes("heal 2 damage from this avatar")) {
        // Self-healing effect (Boar Witch's Heal Aura)
        result.healSelf = 2;
        result.message = "Healing effect: Removed 2 damage from this avatar";
      } else if (effectText.includes("heal 2 damage to one of your reserve avatar")) {
        // Reserve healing effect (Banaspati's Blood Abssorbtion)
        result.healReserve = 2;
        result.message = "Healing effect: Removed 2 damage from a reserve avatar";
      } else {
        // Generic healing fallback
        result.healSelf = 1;
        result.message = "Healing effect activated";
      }
    }

    // Shield counter effects
    if (effectText.includes("shield counters")) {
      result.shouldTrigger = true;

      // Check how many shield counters to apply
      const shieldAmount = effectText.includes("2 shield") ? 2 : 1;
      result.applyShield = shieldAmount;
      result.message = `Effect trigger: Applied ${shieldAmount} shield counters to your avatar`;
    }
  }

  // Tribal synergy effects (Kuhaka, Kujana, Kobar, Borah)
  if (effectText.includes("subtype were kuhaka or kujana") &&
      (avatar.subType === 'kuhaka' || avatar.subType === 'kujana')) {

    result.shouldTrigger = true;
    result.modifiedDamage = skill.damage + 2;
    result.message = `Tribal synergy: +2 damage from ${avatar.subType} subtype`;
  }

  // Return the final result with all triggers and effects
  return result;
}

// Apply healing effects to active and reserve avatars

// Apply the effects of triggered skills to the game state
export function applySkillTriggerEffects(
  triggerResult: SkillTriggerResult,
  avatar: AvatarCard,
  targetAvatar: AvatarCard | null | undefined,
  player: Player,
  updateGameState: (update: any) => void,
  gameState?: SkillCheckState
): void {
  if (!triggerResult.shouldTrigger) {
    return;
  }

  // Apply bleed counters to opponent
  if (triggerResult.applyBleed && targetAvatar) {
    const opponent = player === 'player' ? 'opponent' : 'player';

    updateGameState({
      [opponent]: {
        activeAvatar: {
          ...targetAvatar,
          counters: {
            ...targetAvatar.counters || { damage: 0, bleed: 0, shield: 0 },
            bleed: (targetAvatar.counters?.bleed || 0) + triggerResult.applyBleed
          }
        }
      }
    });
  }

  // Apply shield counters to self
  if (triggerResult.applyShield) {
    updateGameState({
      [player]: {
        activeAvatar: {
          ...avatar,
          counters: {
            ...avatar.counters || { damage: 0, bleed: 0, shield: 0 },
            shield: (avatar.counters?.shield || 0) + triggerResult.applyShield
          }
        }
      }
    });
  }

  // Apply healing to self (active avatar)
  if (triggerResult.healSelf && triggerResult.healSelf > 0) {
    const currentDamage = avatar.counters?.damage || 0;
    const newDamage = Math.max(0, currentDamage - triggerResult.healSelf); // Don't go below 0

    updateGameState({
      [player]: {
        activeAvatar: {
          ...avatar,
          counters: {
            ...avatar.counters || { damage: 0, bleed: 0, shield: 0 },
            damage: newDamage
          }
        }
      }
    });
  }

  // Apply healing to a reserve avatar (if any)
  if (gameState && triggerResult.healReserve && triggerResult.healReserve > 0) {
    const playerState = player === 'player' ? gameState.player : gameState.opponent;

    // Check if there are any reserve avatars with damage
    if (playerState.reserveAvatars.length > 0) {
      // Find the first avatar with damage to heal
      const reserveIndex = playerState.reserveAvatars.findIndex(
        av => (av.counters?.damage || 0) > 0
      );

      if (reserveIndex >= 0) {
        // Make a deep copy of reserve avatars
        const updatedReserves = [...playerState.reserveAvatars];
        const targetAvatar = updatedReserves[reserveIndex];
        const currentDamage = targetAvatar.counters?.damage || 0;
        const newDamage = Math.max(0, currentDamage - triggerResult.healReserve);

        // Update the avatar with reduced damage
        updatedReserves[reserveIndex] = {
          ...targetAvatar,
          counters: {
            ...targetAvatar.counters || { damage: 0, bleed: 0, shield: 0 },
            damage: newDamage
          }
        };

        // Update the game state
        updateGameState({
          [player]: {
            reserveAvatars: updatedReserves
          }
        });
      }
    }
  }
}

// Utility function to get the total amount of damage to deal after triggers
export function getModifiedDamage(
  originalDamage: number,
  triggerResult: SkillTriggerResult
): number {
  // Safety checks
  if (!triggerResult) {
    console.warn('Missing triggerResult in getModifiedDamage, returning original damage');
    return originalDamage || 0;
  }

  // Ensure originalDamage is a valid number
  if (typeof originalDamage !== 'number' || isNaN(originalDamage)) {
    console.warn('Invalid originalDamage in getModifiedDamage:', originalDamage);
    originalDamage = 0;
  }

  // Apply modified damage if trigger condition is met
  if (triggerResult.shouldTrigger && triggerResult.modifiedDamage !== undefined) {
    // Ensure modifiedDamage is a valid number
    if (typeof triggerResult.modifiedDamage !== 'number' || isNaN(triggerResult.modifiedDamage)) {
      console.warn('Invalid modifiedDamage in triggerResult:', triggerResult.modifiedDamage);
      return originalDamage;
    }
    return triggerResult.modifiedDamage;
  }

  return originalDamage;
}
