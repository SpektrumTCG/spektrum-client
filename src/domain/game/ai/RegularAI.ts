import type { GameState } from '../types/game'
import type { AIDecision } from '../types/ai'
import type { AvatarCard } from '../types/card'
import { BaseAI } from './BaseAI'

export class RegularAI extends BaseAI {
  decide(state: GameState, playerIndex: 0 | 1 = 1): AIDecision {
    const player = state.players[playerIndex]

    if (state.phase !== 'main1' && state.phase !== 'main2' && state.phase !== 'battle') {
      return this.endPhase(`auto end ${state.phase}`)
    }

    if (player.hand.length === 0) {
      return this.endPhase('No cards in hand')
    }

    // Priority 1: Place active avatar if slot empty
    if (!player.activeAvatar) {
      const avatars = player.hand.filter(c => c.type === 'avatar') as AvatarCard[]
      if (avatars.length > 0) {
        const best = avatars.reduce((a, b) => a.health > b.health ? a : b)
        return { type: 'playAvatar', cardId: best.id, slot: 'active', reasoning: 'Need active avatar', priority: 100 }
      }
    }

    // Priority 2: Build spektra toward optimal (respect 1-per-turn limit)
    if (player.avatarToSpektraCount < 1) {
      const optimalSpektra = Math.min(player.hand.length, 6)
      if (player.spektraPile.length < optimalSpektra) {
        const nonAvatars = player.hand.filter(c => c.type !== 'avatar')
        const toAdd = nonAvatars.length > 0 ? nonAvatars[0] : player.hand[0]
        if (toAdd) {
          return { type: 'addToSpektra', cardId: toAdd.id, reasoning: 'Build spektra', priority: 70 }
        }
      }
    }

    // Priority 3: Use best affordable skill
    if (player.activeAvatar && !player.activeAvatar.isTapped) {
      const skills = player.activeAvatar.skills ??
        [player.activeAvatar.skill1, player.activeAvatar.skill2].filter(Boolean)

      const affordableIdx = skills.findIndex(
        s => s && this.canAffordSpektra(s.spektraCost, player.spektraPile)
      )
      if (affordableIdx >= 0) {
        const myDamage = player.activeAvatar.counters?.damage ?? 0
        const healIdx = skills.findIndex(s => s?.effectType === 'heal')
        const useIdx = (myDamage > 3 && healIdx >= 0) ? healIdx : affordableIdx
        return { type: 'useSkill', skillIndex: useIdx as 0 | 1, reasoning: 'Use best skill', priority: 90 }
      }
    }

    return this.endPhase('No beneficial actions')
  }
}
