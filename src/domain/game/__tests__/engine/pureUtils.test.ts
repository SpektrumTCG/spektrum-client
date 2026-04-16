import { hasDiscardMechanic } from '../../engine/discardMechanicChecker'
import { modifierApplies } from '../../engine/modifierUtils'
import { processFieldTriggers } from '../../engine/fieldTriggerProcessor'
import { getApplicablePassives } from '../../engine/passiveSkillUtils'
import { destroyAvatar } from '../../engine/destroyAvatar'
import { getValidEvolutionTargets } from '../../engine/getValidEvolutionTargets'
import { checkEffectCondition } from '../../engine/effectConditionChecker'
import type { AvatarCard } from '../../types/card'

const mockAvatar: AvatarCard = {
  id: 'test-avatar',
  name: 'Test Avatar',
  type: 'avatar',
  element: 'fire',
  subType: 'kujana',
  level: 1,
  health: 6,
  rarity: 'Common',
}

describe('discardMechanicChecker', () => {
  it('detects you may discard in description', () => {
    const card = { ...mockAvatar, description: 'You may discard a card to deal extra damage.' }
    expect(hasDiscardMechanic(card)).toBe(true)
  })

  it('returns false when no discard mechanic', () => {
    const card = { ...mockAvatar, description: 'Deal 2 damage.' }
    expect(hasDiscardMechanic(card)).toBe(false)
  })

  it('returns false when description is undefined', () => {
    expect(hasDiscardMechanic({ ...mockAvatar })).toBe(false)
  })
})

describe('modifierApplies', () => {
  it('applies when no condition', () => {
    expect(modifierApplies({ type: 'skill_damage_boost', value: 1, source: 'field' }, mockAvatar)).toBe(true)
  })

  it('applies when element matches condition', () => {
    expect(modifierApplies({ type: 'skill_damage_boost', value: 1, condition: 'fire', source: 'field' }, mockAvatar)).toBe(true)
  })

  it('does not apply when element differs', () => {
    expect(modifierApplies({ type: 'skill_damage_boost', value: 1, condition: 'water', source: 'field' }, mockAvatar)).toBe(false)
  })

  it('applies when tribe/subType matches condition', () => {
    expect(modifierApplies({ type: 'skill_damage_boost', value: 1, condition: 'kujana', source: 'field' }, mockAvatar)).toBe(true)
  })
})

describe('destroyAvatar', () => {
  it('returns clean avatar as single graveyard entry', () => {
    const result = destroyAvatar(mockAvatar)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('test-avatar')
  })

  it('includes baseCard before clean avatar when evolved', () => {
    const base: AvatarCard = { ...mockAvatar, id: 'base-id', level: 1 }
    const evolved: AvatarCard = { ...mockAvatar, id: 'evolved-id', level: 2, baseCard: base }
    const result = destroyAvatar(evolved)
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('base-id')
    expect(result[1].id).toBe('evolved-id')
  })

  it('includes equipment before avatar', () => {
    const equipment = { ...mockAvatar, id: 'equip-1', type: 'equipment' as const }
    const avatarWithEquip: AvatarCard = { ...mockAvatar, attachedEquipment: [equipment] }
    const result = destroyAvatar(avatarWithEquip)
    expect(result[0].id).toBe('equip-1')
    expect(result[result.length - 1].id).toBe('test-avatar')
  })
})

describe('getValidEvolutionTargets', () => {
  it('finds active avatar when level 1, same subType, previous turn', () => {
    const level2: AvatarCard = { ...mockAvatar, id: 'l2', level: 2 }
    const board = { activeAvatar: { ...mockAvatar, turnPlayed: 0 }, reserveAvatars: [] }
    expect(getValidEvolutionTargets(level2, board, 2)).toContain('active')
  })

  it('rejects active avatar played this turn', () => {
    const level2: AvatarCard = { ...mockAvatar, id: 'l2', level: 2 }
    const board = { activeAvatar: { ...mockAvatar, turnPlayed: 2 }, reserveAvatars: [] }
    expect(getValidEvolutionTargets(level2, board, 2)).toHaveLength(0)
  })

  it('rejects level 2 avatar as evolution base', () => {
    const level2: AvatarCard = { ...mockAvatar, id: 'l2', level: 2 }
    const level2Target: AvatarCard = { ...mockAvatar, id: 'existing-l2', level: 2, turnPlayed: 0 }
    const board = { activeAvatar: level2Target, reserveAvatars: [] }
    expect(getValidEvolutionTargets(level2, board, 2)).toHaveLength(0)
  })
})
