import type { AvatarCard, Skill, PassiveSkillScope } from '../types';

export type AvatarArea = 'active' | 'reserve';

export function getApplicablePassives(
  card: AvatarCard,
  area: AvatarArea
): Skill[] {
  const passives: Skill[] = [];

  if (card.passiveSkills && card.passiveSkills.length > 0) {
    for (const passive of card.passiveSkills) {
      const scope = passive.scope || 'active';

      if (scope === 'active_or_reserve' || (scope === 'active' && area === 'active')) {
        passives.push(passive);
      }
    }
  }

  if (card.passiveSkill) {
    const scope = card.passiveSkill.scope || 'active';
    if (scope === 'active_or_reserve' || (scope === 'active' && area === 'active')) {
      passives.push(card.passiveSkill);
    }
  }

  return passives;
}

export function getAllPassives(card: AvatarCard): Skill[] {
  const passives: Skill[] = [];

  if (card.passiveSkills && card.passiveSkills.length > 0) {
    passives.push(...card.passiveSkills);
  }

  if (card.passiveSkill) {
    passives.push(card.passiveSkill);
  }

  return passives;
}

export function hasActivePassive(card: AvatarCard): boolean {
  return getApplicablePassives(card, 'active').length > 0;
}

export function hasReservePassive(card: AvatarCard): boolean {
  const passives = getAllPassives(card);
  return passives.some(p => (p.scope || 'active') === 'active_or_reserve');
}
