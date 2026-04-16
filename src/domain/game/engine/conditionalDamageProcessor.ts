import type { AvatarCard, BaseCard, ElementType, Card } from '../types';

export interface Counter {
  damage: number;
  bleed: number;
  shield: number;
  burn: number;
  poison: number;
  stun: number;
}

export interface Player {
  id: string;
  activeAvatar: AvatarCard | null;
  hand: Card[];
  graveyard: Card[];
  energy: Record<ElementType, number>;
  discardedThisTurn: Card[];
  field: Card[];
}

export interface GameState {
  player: Player;
  opponent: Player;
  turn: number;
  phase: string;
}

export interface ConditionalDamageRule {
  id: string;
  type: 'discard_trigger' | 'opponent_counter' | 'opponent_type' | 'opponent_subtype' | 'equipment_attached' | 'self_counter';
  condition: {
    // For discard_trigger
    discardedCardCount?: number;
    discardedCardElement?: ElementType;
    discardedCardType?: string;

    // For opponent_counter/self_counter
    counterType?: 'bleed' | 'burn' | 'poison' | 'stun';
    counterMinAmount?: number;

    // For opponent_type/opponent_subtype
    targetType?: string;
    targetSubtype?: string;

    // For equipment_attached
    equipmentType?: string;
    equipmentElement?: ElementType;
  };
  effect: {
    damageMultiplier?: number; // Replace damage with x
    damageBonus?: number; // Add +x to damage
    newDamage?: number; // Set damage to specific value
  };
}

export interface PassiveEffectRule {
  id: string;
  type: 'avatar_type_boost' | 'avatar_subtype_boost' | 'element_synergy' | 'counter_synergy';
  condition: {
    avatarType?: string;
    avatarSubtype?: string;
    avatarElement?: ElementType;
    requiredCounter?: 'bleed' | 'burn' | 'poison' | 'stun';
  };
  effect: {
    damageBonus: number;
    affectedCardTypes?: string[]; // Which card types get the bonus
    affectedElements?: ElementType[]; // Which elements get the bonus
  };
}

export class ConditionalDamageProcessor {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  // Calculate final damage with all conditional modifiers
  calculateConditionalDamage(
    attackingCard: AvatarCard,
    skill: any,
    baseDamage: number,
    attackingPlayer: Player,
    defendingPlayer: Player
  ): number {
    let finalDamage = baseDamage;

    // Apply conditional damage rules from the attacking card
    const conditionalRules = this.parseConditionalRules(attackingCard);

    for (const rule of conditionalRules) {
      const conditionMet = this.evaluateCondition(rule, attackingPlayer, defendingPlayer, attackingCard);

      if (conditionMet) {
        finalDamage = this.applyDamageEffect(finalDamage, rule.effect);
        console.log(`Conditional damage applied: ${rule.type}, new damage: ${finalDamage}`);
      }
    }

    // Apply passive effects from all cards in play
    const passiveBonus = this.calculatePassiveBonus(attackingCard, attackingPlayer);
    finalDamage += passiveBonus;

    return Math.max(0, finalDamage);
  }

  private parseConditionalRules(card: AvatarCard): ConditionalDamageRule[] {
    const rules: ConditionalDamageRule[] = [];

    // Parse skill descriptions for conditional damage patterns (handle both formats)
    const skill1 = card.skills?.[0] || card.skill1;
    const skill2 = card.skills?.[1] || card.skill2;
    [skill1, skill2].forEach((skill, index) => {
      if (!skill?.effect) return;

      const effect = skill.effect.toLowerCase();

      // "if the player discard a card, then this attack damage become x"
      const discardMatch = effect.match(/if.*player.*discard.*card.*damage.*become.*(\d+)/);
      if (discardMatch) {
        rules.push({
          id: `${card.id}-discard-${index}`,
          type: 'discard_trigger',
          condition: { discardedCardCount: 1 },
          effect: { newDamage: parseInt(discardMatch[1]) }
        });
      }

      // "if the opponent active avatar has -bleed counter- this attack damage become x"
      const counterMatch = effect.match(/if.*opponent.*avatar.*has.*-(\w+) counter-.*damage.*become.*(\d+)/);
      if (counterMatch) {
        rules.push({
          id: `${card.id}-counter-${index}`,
          type: 'opponent_counter',
          condition: {
            counterType: counterMatch[1] as any,
            counterMinAmount: 1
          },
          effect: { newDamage: parseInt(counterMatch[2]) }
        });
      }

      // "if the opponent active avatar has y type this attack damage become x"
      const typeMatch = effect.match(/if.*opponent.*avatar.*has.*(\w+) type.*damage.*become.*(\d+)/);
      if (typeMatch) {
        rules.push({
          id: `${card.id}-type-${index}`,
          type: 'opponent_type',
          condition: { targetType: typeMatch[1] },
          effect: { newDamage: parseInt(typeMatch[2]) }
        });
      }

      // "if the opponent active avatar has y subtype this attack damage become x"
      const subtypeMatch = effect.match(/if.*opponent.*avatar.*has.*(\w+) subtype.*damage.*become.*(\d+)/);
      if (subtypeMatch) {
        rules.push({
          id: `${card.id}-subtype-${index}`,
          type: 'opponent_subtype',
          condition: { targetSubtype: subtypeMatch[1] },
          effect: { newDamage: parseInt(subtypeMatch[2]) }
        });
      }

      // "if this card has equipment card attached, this attack damage become x"
      const equipmentMatch = effect.match(/if.*card.*has.*equipment.*attached.*damage.*become.*(\d+)/);
      if (equipmentMatch) {
        rules.push({
          id: `${card.id}-equipment-${index}`,
          type: 'equipment_attached',
          condition: {},
          effect: { newDamage: parseInt(equipmentMatch[1]) }
        });
      }

      // "if this card has bleed counter, then this attack damage get +x"
      const selfCounterMatch = effect.match(/if.*card.*has.*(\w+) counter.*damage.*get.*\+(\d+)/);
      if (selfCounterMatch) {
        rules.push({
          id: `${card.id}-selfcounter-${index}`,
          type: 'self_counter',
          condition: {
            counterType: selfCounterMatch[1] as any,
            counterMinAmount: 1
          },
          effect: { damageBonus: parseInt(selfCounterMatch[2]) }
        });
      }
    });

    return rules;
  }

  private evaluateCondition(
    rule: ConditionalDamageRule,
    attackingPlayer: Player,
    defendingPlayer: Player,
    attackingCard: AvatarCard
  ): boolean {
    switch (rule.type) {
      case 'discard_trigger':
        // Check if player discarded cards this turn
        return (attackingPlayer.discardedThisTurn?.length || 0) >= (rule.condition.discardedCardCount || 1);

      case 'opponent_counter':
        const opponentAvatar = defendingPlayer.activeAvatar;
        if (!opponentAvatar || !rule.condition.counterType) return false;
        const counterAmount = opponentAvatar.counters?.[rule.condition.counterType] || 0;
        return counterAmount >= (rule.condition.counterMinAmount || 1);

      case 'opponent_type':
        const targetAvatar = defendingPlayer.activeAvatar;
        return targetAvatar?.type === rule.condition.targetType;

      case 'opponent_subtype':
        const targetAvatarSub = defendingPlayer.activeAvatar;
        return targetAvatarSub?.subType === rule.condition.targetSubtype;

      case 'equipment_attached':
        // Check if attacking card has equipment attached
        return (attackingCard.attachedEquipment?.length || 0) > 0;

      case 'self_counter':
        if (!rule.condition.counterType) return false;
        const selfCounterAmount = attackingCard.counters?.[rule.condition.counterType] || 0;
        return selfCounterAmount >= (rule.condition.counterMinAmount || 1);

      default:
        return false;
    }
  }

  private applyDamageEffect(currentDamage: number, effect: ConditionalDamageRule['effect']): number {
    if (effect.newDamage !== undefined) {
      return effect.newDamage;
    }

    if (effect.damageMultiplier !== undefined) {
      return Math.floor(currentDamage * effect.damageMultiplier);
    }

    if (effect.damageBonus !== undefined) {
      return currentDamage + effect.damageBonus;
    }

    return currentDamage;
  }

  private calculatePassiveBonus(attackingCard: AvatarCard, attackingPlayer: Player): number {
    let totalBonus = 0;

    // Check all cards in player's field for passive effects
    const allPlayerCards = [
      ...(attackingPlayer.hand || []),
      ...(attackingPlayer.field || []),
      attackingPlayer.activeAvatar
    ].filter(Boolean) as (BaseCard | AvatarCard)[];

    for (const card of allPlayerCards) {
      const passiveRules = this.parsePassiveRules(card);

      for (const rule of passiveRules) {
        if (this.evaluatePassiveCondition(rule, attackingPlayer, attackingCard)) {
          totalBonus += rule.effect.damageBonus;
          console.log(`Passive bonus applied: +${rule.effect.damageBonus} from ${card.name}`);
        }
      }
    }

    return totalBonus;
  }

  private parsePassiveRules(card: BaseCard | AvatarCard): PassiveEffectRule[] {
    const rules: PassiveEffectRule[] = [];

    // Only process avatar cards which have skills
    if (card.type === 'avatar') {
      const avatarCard = card as AvatarCard;
      // Handle both skill formats
      const skill1 = avatarCard.skills?.[0] || avatarCard.skill1;
      const skill2 = avatarCard.skills?.[1] || avatarCard.skill2;
      [skill1, skill2].forEach((skill, index) => {
      if (!skill?.effect) return;

      const effect = skill.effect.toLowerCase();

      // "if your active avatar has y type, that cards attack damage get +x"
      const typeBoostMatch = effect.match(/if.*active avatar.*has.*(\w+) type.*attack damage.*get.*\+(\d+)/);
      if (typeBoostMatch) {
        rules.push({
          id: `${card.id}-passive-type-${index}`,
          type: 'avatar_type_boost',
          condition: { avatarType: typeBoostMatch[1] },
          effect: { damageBonus: parseInt(typeBoostMatch[2]) }
        });
      }

      // "if your active avatar has y subtype that cards attack damage get +x"
      const subtypeBoostMatch = effect.match(/if.*active avatar.*has.*(\w+) subtype.*attack damage.*get.*\+(\d+)/);
      if (subtypeBoostMatch) {
        rules.push({
          id: `${card.id}-passive-subtype-${index}`,
          type: 'avatar_subtype_boost',
          condition: { avatarSubtype: subtypeBoostMatch[1] },
          effect: { damageBonus: parseInt(subtypeBoostMatch[2]) }
        });
      }
    });
    }

    return rules;
  }

  private evaluatePassiveCondition(
    rule: PassiveEffectRule,
    player: Player,
    attackingCard: Card
  ): boolean {
    const activeAvatar = player.activeAvatar;
    if (!activeAvatar) return false;

    switch (rule.type) {
      case 'avatar_type_boost':
        return activeAvatar.type === rule.condition.avatarType;

      case 'avatar_subtype_boost':
        return activeAvatar.subType === rule.condition.avatarSubtype;

      case 'element_synergy':
        return activeAvatar.element === rule.condition.avatarElement;

      case 'counter_synergy':
        if (!rule.condition.requiredCounter) return false;
        const counterAmount = activeAvatar.counters?.[rule.condition.requiredCounter] || 0;
        return counterAmount > 0;

      default:
        return false;
    }
  }
}

// Export utility functions for game logic integration
export const createConditionalDamageProcessor = (gameState: GameState) => {
  return new ConditionalDamageProcessor(gameState);
};
