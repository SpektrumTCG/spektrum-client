import type { GameState } from '../types/game'
import type { AIDecision } from '../types/ai'
import type { AvatarCard, Skill } from '../types/card'
import { BaseAI } from './BaseAI'

export class EnhancedAI extends BaseAI {
  decide(state: GameState, playerIndex: 0 | 1 = 1): AIDecision {
    const player = state.players[playerIndex]
    const opponent = state.players[playerIndex === 0 ? 1 : 0]

    if (state.phase !== 'main1' && state.phase !== 'main2' && state.phase !== 'battle') {
      return this.endPhase(`auto end ${state.phase}`)
    }

    if (player.hand.length === 0) {
      return this.endPhase('No cards in hand')
    }

    const candidates: AIDecision[] = []

    // Evaluate avatar placement
    if (!player.activeAvatar) {
      const avatars = player.hand.filter(c => c.type === 'avatar') as AvatarCard[]
      if (avatars.length > 0) {
        const best = avatars
          .map(a => ({ a, score: this.scoreAvatar(a) }))
          .sort((x, y) => y.score - x.score)[0]
        candidates.push({
          type: 'playAvatar', cardId: best.a.id, slot: 'active',
          reasoning: `Best avatar: ${best.a.name} (${best.score.toFixed(0)})`,
          priority: best.score,
        })
      }
    }

    // Evaluate spektra building (respect 1-per-turn limit)
    if (player.avatarToSpektraCount < 1) {
      const spektraScore = this.scoreSpektraNeed(player)
      if (spektraScore > 40) {
        const nonAvatars = player.hand.filter(c => c.type !== 'avatar')
        if (nonAvatars.length > 0) {
          candidates.push({
            type: 'addToSpektra', cardId: nonAvatars[0].id,
            reasoning: 'Optimal spektra build',
            priority: spektraScore,
          })
        }
      }
    }

    // Evaluate skills
    if (player.activeAvatar && !player.activeAvatar.isTapped) {
      const skills = player.activeAvatar.skills ??
        [player.activeAvatar.skill1, player.activeAvatar.skill2].filter(Boolean)

      skills.forEach((skill, idx) => {
        if (!skill || !this.canAffordSpektra(skill.spektraCost, player.spektraPile)) return
        const score = this.scoreSkill(skill, player, opponent)
        candidates.push({
          type: 'useSkill', skillIndex: idx as 0 | 1,
          reasoning: `Skill value: ${score.toFixed(0)}`,
          priority: score,
        })
      })
    }

    if (candidates.length === 0) return this.endPhase('No beneficial actions')

    // Sort by priority with personality jitter for imperfect play
    const jitterScale = (this.personality.mistakeChance / 100) * 20
    const jittered = candidates.map(d => ({
      decision: d,
      score: d.priority + (Math.random() - 0.5) * jitterScale,
    }))
    jittered.sort((a, b) => b.score - a.score)
    return jittered[0].decision
  }

  private scoreAvatar(avatar: AvatarCard): number {
    let score = avatar.health * 3 + avatar.level * 15
    if (this.personality.favoriteElements.includes(avatar.element)) score += 20
    return score * (this.personality.cardEvaluation / 100)
  }

  private scoreSpektraNeed(player: GameState['players'][0]): number {
    const ideal = Math.min(player.hand.length * 2, 8)
    return Math.max(0, ideal - player.spektraPile.length) * 10 * (this.personality.efficiency / 100)
  }

  private scoreSkill(skill: Skill, player: GameState['players'][0], opponent: GameState['players'][0]): number {
    const damage = skill.damage ?? 0
    let score = 0

    switch (skill.effectType ?? 'none') {
      case 'heal': {
        const myDmg = player.activeAvatar?.counters?.damage ?? 0
        score = myDmg > 0 ? Math.min(skill.effectValue ?? 0, myDmg) * 12 : 5
        score *= this.personality.caution / 100
        break
      }
      case 'shield':
        score = (skill.effectValue ?? 0) * 10 * (this.personality.caution / 100)
        break
      default: {
        score = damage * 8 * (this.personality.aggression / 100)
        if (opponent.activeAvatar) {
          const oppDmg = opponent.activeAvatar.counters?.damage ?? 0
          if (oppDmg + damage >= opponent.activeAvatar.health) score += 50
        }
      }
    }

    return score
  }
}
