import type { AvatarCard } from '../types';

// Comprehensive conditional damage calculation system
export class EnhancedDamageCalculator {

  // Main calculation function for conditional damage
  static calculateDamage(
    attackingCard: AvatarCard,
    skill: any,
    baseDamage: number,
    gameState: any
  ): number {
    let finalDamage = baseDamage;

    // Check for HP threshold conditional damage (NEW SYSTEM)
    if (skill.conditionalDamage) {
      // Use current HP (hp) from game state, fall back to max health if not available
      const targetHP = gameState.opponentActiveAvatar?.hp ?? gameState.opponentActiveAvatar?.health ?? 0;
      const { operator, threshold, newDamage } = skill.conditionalDamage;

      let conditionMet = false;
      switch (operator) {
        case '<=':
          conditionMet = targetHP <= threshold;
          break;
        case '>=':
          conditionMet = targetHP >= threshold;
          break;
        case '==':
          conditionMet = targetHP === threshold;
          break;
        case '<':
          conditionMet = targetHP < threshold;
          break;
        case '>':
          conditionMet = targetHP > threshold;
          break;
      }

      if (conditionMet) {
        console.log(`HP threshold condition met: Target HP ${targetHP} ${operator} ${threshold}, damage ${baseDamage} → ${newDamage}`);
        finalDamage = newDamage;
        return finalDamage; // Return early if conditional damage applies
      }
    }

    // Parse skill effect for conditional damage rules (LEGACY SYSTEM)
    const effect = skill.effect?.toLowerCase() || '';

    // 1. Check for discard trigger: "if the player discard a card, then this attack damage become x"
    const discardMatch = effect.match(/if.*player.*discard.*card.*damage.*become.*(\d+)/);
    if (discardMatch && this.hasDiscardedCard(gameState)) {
      finalDamage = parseInt(discardMatch[1]);
      console.log(`Discard trigger activated: ${baseDamage} → ${finalDamage}`);
    }

    // 2. Check for opponent counter: "if the opponent active avatar has -bleed counter- this attack damage become x"
    const counterMatch = effect.match(/if.*opponent.*avatar.*has.*-(\w+) counter-.*damage.*become.*(\d+)/);
    if (counterMatch && this.hasOpponentCounter(gameState, counterMatch[1])) {
      finalDamage = parseInt(counterMatch[2]);
      console.log(`Opponent counter trigger activated: ${baseDamage} → ${finalDamage}`);
    }

    // 3. Check for type matching: "if the opponent active avatar has y type this attack damage become x"
    const typeMatch = effect.match(/if.*opponent.*avatar.*has.*(\w+) type.*damage.*become.*(\d+)/);
    if (typeMatch && this.hasOpponentType(gameState, typeMatch[1])) {
      finalDamage = parseInt(typeMatch[2]);
      console.log(`Type advantage trigger activated: ${baseDamage} → ${finalDamage}`);
    }

    // 4. Check for subtype matching: "if the opponent active avatar has y subtype this attack damage become x"
    const subtypeMatch = effect.match(/if.*opponent.*avatar.*has.*(\w+) subtype.*damage.*become.*(\d+)/);
    if (subtypeMatch && this.hasOpponentSubtype(gameState, subtypeMatch[1])) {
      finalDamage = parseInt(subtypeMatch[2]);
      console.log(`Subtype advantage trigger activated: ${baseDamage} → ${finalDamage}`);
    }

    // 5. Check for equipment: "if this card has equipment card attached, this attack damage become x"
    const equipmentMatch = effect.match(/if.*card.*has.*equipment.*attached.*damage.*become.*(\d+)/);
    if (equipmentMatch && this.hasEquipmentAttached(attackingCard)) {
      finalDamage = parseInt(equipmentMatch[1]);
      console.log(`Equipment trigger activated: ${baseDamage} → ${finalDamage}`);
    }

    // 6. Check for self counter bonus: "if this card has bleed counter, then this attack damage get +x"
    const selfCounterMatch = effect.match(/if.*card.*has.*(\w+) counter.*damage.*get.*\+(\d+)/);
    if (selfCounterMatch && this.hasSelfCounter(attackingCard, selfCounterMatch[1])) {
      finalDamage += parseInt(selfCounterMatch[2]);
      console.log(`Self counter bonus activated: ${baseDamage} → ${finalDamage}`);
    }

    // 7. Apply passive effects from all cards in play
    const passiveBonus = this.calculatePassiveBonus(gameState);
    finalDamage += passiveBonus;

    if (passiveBonus > 0) {
      console.log(`Passive bonus applied: +${passiveBonus} damage`);
    }

    return Math.max(0, finalDamage);
  }

  // Check if player has discarded cards this turn
  private static hasDiscardedCard(gameState: any): boolean {
    return (gameState.playerGraveyard?.length || 0) > 0;
  }

  // Check if opponent has specific counter
  private static hasOpponentCounter(gameState: any, counterType: string): boolean {
    const opponent = gameState.opponentActiveAvatar;
    if (!opponent?.counters) return false;
    return (opponent.counters[counterType] || 0) > 0;
  }

  // Check if opponent has specific type
  private static hasOpponentType(gameState: any, targetType: string): boolean {
    const opponent = gameState.opponentActiveAvatar;
    return opponent?.element === targetType || opponent?.type === targetType;
  }

  // Check if opponent has specific subtype
  private static hasOpponentSubtype(gameState: any, targetSubtype: string): boolean {
    const opponent = gameState.opponentActiveAvatar;
    return opponent?.subType === targetSubtype;
  }

  // Check if card has equipment attached
  private static hasEquipmentAttached(card: AvatarCard): boolean {
    return (card.attachedEquipment?.length || 0) > 0;
  }

  // Check if card has specific counter
  private static hasSelfCounter(card: AvatarCard, counterType: string): boolean {
    return (card.counters?.[counterType] || 0) > 0;
  }

  // Calculate passive damage bonuses
  private static calculatePassiveBonus(gameState: any): number {
    let totalBonus = 0;
    const activeAvatar = gameState.playerActiveAvatar;

    if (!activeAvatar) return 0;

    // Check all cards in hand and field for passive effects
    const allCards = [
      ...(gameState.playerHand || []),
      ...(gameState.playerFieldCards || []),
      activeAvatar
    ].filter(Boolean);

    for (const card of allCards) {
      // Handle both skill formats
      const skill1 = card.skills?.[0] || card.skill1;
      const skill2 = card.skills?.[1] || card.skill2;
      if (!skill1 && !skill2) continue;

      [skill1, skill2].forEach((skill: any) => {
        if (!skill?.effect) return;

        const effect = skill.effect.toLowerCase();

        // "if your active avatar has y type, that cards attack damage get +x"
        const typeBoostMatch = effect.match(/if.*active avatar.*has.*(\w+) type.*attack damage.*get.*\+(\d+)/);
        if (typeBoostMatch && activeAvatar.element === typeBoostMatch[1]) {
          totalBonus += parseInt(typeBoostMatch[2]);
        }

        // "if your active avatar has y subtype that cards attack damage get +x"
        const subtypeBoostMatch = effect.match(/if.*active avatar.*has.*(\w+) subtype.*attack damage.*get.*\+(\d+)/);
        if (subtypeBoostMatch && activeAvatar.subType === subtypeBoostMatch[1]) {
          totalBonus += parseInt(subtypeBoostMatch[2]);
        }
      });
    }

    return totalBonus;
  }
}

// Export the main calculation function for easy use
export function calculateEnhancedDamage(
  attackingCard: AvatarCard,
  skill: any,
  baseDamage: number,
  gameState: any
): number {
  return EnhancedDamageCalculator.calculateDamage(attackingCard, skill, baseDamage, gameState);
}
