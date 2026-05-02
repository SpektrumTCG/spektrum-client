import { resolveEffectTargets } from '../../engine/effectTargetResolver'
import { checkSkillTrigger } from '../../engine/skillTriggerChecker'
import type { AvatarCard } from '../../types'
// Import the lightweight SkillCheckState used by skillTriggerChecker (from card.ts, not game.ts)
import type { SkillCheckState } from '../../types/card'

const mockAvatar: AvatarCard = {
  id: 'av1', name: 'Test', type: 'avatar', element: 'fire',
  subType: 'kujana', level: 1, health: 6, rarity: 'Common',
}

const mockGameState: SkillCheckState = {
  player: {
    hand: [], spektraPile: [], usedSpektraPile: [],
    activeAvatar: mockAvatar, reserveAvatars: [],
    graveyard: [], avatarToSpektraCount: 0,
  },
  opponent: {
    hand: [], spektraPile: [], usedSpektraPile: [],
    activeAvatar: null, reserveAvatars: [],
    graveyard: [], avatarToSpektraCount: 0,
  },
  gamePhase: 'main1',
  currentPlayer: 'player',
}

describe('resolveEffectTargets', () => {
  const playerState = { activeAvatar: mockAvatar, reserveAvatars: [] as any[] }
  const opponentState = { activeAvatar: null, reserveAvatars: [] as any[] }

  it('player_active returns player active avatar', () => {
    const result = resolveEffectTargets('player_active', 'player', playerState, opponentState)
    expect(result.targets).toHaveLength(1)
    expect(result.targets[0].id).toBe('av1')
    expect(result.requiresSelection).toBe(false)
  })

  it('opponent_active returns empty when no opponent active', () => {
    const result = resolveEffectTargets('opponent_active', 'player', playerState, opponentState)
    expect(result.targets).toHaveLength(0)
  })

  it('select_player_reserve sets requiresSelection true', () => {
    const result = resolveEffectTargets('select_player_reserve', 'player', playerState, opponentState)
    expect(result.requiresSelection).toBe(true)
    expect(result.selectionType).toBe('player_reserve')
  })
})

describe('checkSkillTrigger', () => {
  it('returns shouldTrigger false when no conditions and no effect string', () => {
    const skill = { name: 'Basic', spektraCost: [], damage: 2 }
    const result = checkSkillTrigger(skill, mockAvatar, null, mockGameState, 'player')
    expect(result.shouldTrigger).toBe(false)
  })

  it('triggers tribe condition when opponent matches', () => {
    const skill = {
      name: 'Tribal Strike', spektraCost: [], damage: 2,
      conditions: [{ type: 'opponent_tribe' as const, value: ['kujana'], effect: { type: 'damage_modification', value: 5 } }],
    }
    const opponentAvatar: AvatarCard = { ...mockAvatar, id: 'opp', subType: 'kujana' }
    const result = checkSkillTrigger(skill, mockAvatar, opponentAvatar, mockGameState, 'player')
    expect(result.shouldTrigger).toBe(true)
    expect(result.modifiedDamage).toBe(5)
  })
})
