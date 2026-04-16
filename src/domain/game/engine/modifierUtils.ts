import type { AvatarCard, ModifierType, FieldCard, Skill } from '../types';

/**
 * Represents an active modifier effect
 */
export interface ActiveModifier {
  type: ModifierType;
  value: number;
  condition?: string; // Element or tribe filter
  source: 'field' | 'passive'; // Where this modifier comes from
  sourceCardId?: string; // ID of the card providing this modifier
}

/**
 * Check if a modifier applies to a given avatar
 */
export function modifierApplies(
  modifier: ActiveModifier,
  avatar: AvatarCard
): boolean {
  // If no condition, modifier always applies
  if (!modifier.condition) {
    return true;
  }

  const condition = modifier.condition.toLowerCase();

  // Check if it's an element filter
  if (avatar.element && avatar.element.toLowerCase() === condition) {
    return true;
  }

  // Check if it's a tribe filter
  const tribe = avatar.tribe || avatar.subType;
  if (tribe && tribe.toLowerCase() === condition) {
    return true;
  }

  return false;
}

/**
 * Extract field modifier from a field card
 */
export function getFieldModifier(fieldCard: FieldCard): ActiveModifier | null {
  if (!fieldCard.modifierType || fieldCard.modifierValue === undefined) {
    return null;
  }

  return {
    type: fieldCard.modifierType,
    value: fieldCard.modifierValue,
    condition: fieldCard.modifierCondition,
    source: 'field',
    sourceCardId: fieldCard.id
  };
}

/**
 * Extract passive modifier from an avatar's passive skill
 */
export function getPassiveModifier(
  avatar: AvatarCard,
  area: 'active' | 'reserve'
): ActiveModifier | null {
  // Check passiveSkills array
  if (avatar.passiveSkills) {
    for (const passive of avatar.passiveSkills) {
      const scope = passive.scope || 'active';
      const isApplicable = scope === 'active_or_reserve' || (scope === 'active' && area === 'active');

      if (isApplicable && passive.modifierType && passive.modifierValue !== undefined) {
        return {
          type: passive.modifierType,
          value: passive.modifierValue,
          condition: passive.modifierCondition,
          source: 'passive',
          sourceCardId: avatar.id
        };
      }
    }
  }

  // Check legacy passiveSkill
  if (avatar.passiveSkill) {
    const scope = avatar.passiveSkill.scope || 'active';
    const isApplicable = scope === 'active_or_reserve' || (scope === 'active' && area === 'active');

    if (isApplicable && avatar.passiveSkill.modifierType && avatar.passiveSkill.modifierValue !== undefined) {
      return {
        type: avatar.passiveSkill.modifierType,
        value: avatar.passiveSkill.modifierValue,
        condition: avatar.passiveSkill.modifierCondition,
        source: 'passive',
        sourceCardId: avatar.id
      };
    }
  }

  return null;
}

/**
 * Calculate total modifier bonus for an avatar
 */
export function calculateModifierBonus(
  avatar: AvatarCard,
  modifierType: ModifierType,
  activeModifiers: ActiveModifier[]
): number {
  let totalBonus = 0;

  for (const modifier of activeModifiers) {
    if (modifier.type === modifierType && modifierApplies(modifier, avatar)) {
      totalBonus += modifier.value;
    }
  }

  return totalBonus;
}
