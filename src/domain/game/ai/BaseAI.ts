import type { AIDifficulty, AIDecision, AIPersonality } from '../types/ai'
import type { GameState } from '../types/game'

export const AI_PERSONALITIES: Record<AIDifficulty, AIPersonality> = {
  newbie: {
    name: 'Rookie Trainer',
    difficulty: 'newbie',
    description: 'A new player learning the ropes',
    aggression: 30, caution: 20, efficiency: 25, strategy: 15,
    riskTolerance: 40, adaptability: 20, cardEvaluation: 30,
    favoriteElements: ['fire', 'neutral'],
    preferredPlayStyle: 'aggressive',
    mistakeChance: 35,
  },
  regular: {
    name: 'Experienced Duelist',
    difficulty: 'regular',
    description: 'A competent player with solid fundamentals',
    aggression: 60, caution: 55, efficiency: 65, strategy: 60,
    riskTolerance: 50, adaptability: 60, cardEvaluation: 70,
    favoriteElements: ['fire', 'water', 'ground'],
    preferredPlayStyle: 'balanced',
    mistakeChance: 15,
  },
  advanced: {
    name: 'Master Strategist',
    difficulty: 'advanced',
    description: 'An expert player with deep tactical knowledge',
    aggression: 75, caution: 85, efficiency: 90, strategy: 95,
    riskTolerance: 70, adaptability: 90, cardEvaluation: 95,
    favoriteElements: ['fire', 'water', 'ground', 'air'],
    preferredPlayStyle: 'control',
    mistakeChance: 5,
  },
}

export abstract class BaseAI {
  protected personality: AIPersonality

  constructor(difficulty: AIDifficulty) {
    this.personality = AI_PERSONALITIES[difficulty]
  }

  abstract decide(state: GameState, playerIndex?: 0 | 1): AIDecision

  protected endPhase(reason: string): AIDecision {
    return { type: 'endPhase', reasoning: reason, priority: 0 }
  }

  protected canAffordSpektra(cost: string[] | undefined, spektraPile: Array<{ element?: string }>): boolean {
    if (!cost || cost.length === 0) return true
    if (spektraPile.length < cost.length) return false

    // Count available elements
    const available: Record<string, number> = {}
    let neutralAvailable = 0
    for (const card of spektraPile) {
      const el = card.element ?? 'neutral'
      if (el === 'neutral') neutralAvailable++
      else available[el] = (available[el] ?? 0) + 1
    }

    // Check specific costs; shortfall covered by neutral cards
    let neutralRemaining = neutralAvailable
    let neutralNeeded = 0
    for (const el of cost) {
      if (el === 'neutral') { neutralNeeded++; continue }
      if ((available[el] ?? 0) > 0) {
        available[el]!--
      } else if (neutralRemaining > 0) {
        neutralRemaining--
      } else {
        return false
      }
    }

    // Neutral costs are wildcards — any leftover card pays
    const leftoverSpecific = Object.values(available).reduce((s, v) => s + v, 0)
    return (leftoverSpecific + neutralRemaining) >= neutralNeeded
  }

  protected hasAffordableSkill(state: GameState, playerIndex: 0 | 1): boolean {
    const player = state.players[playerIndex]
    const avatar = player.activeAvatar
    if (!avatar || avatar.isTapped) return false
    const skills = avatar.skills ?? [avatar.skill1, avatar.skill2].filter(Boolean)
    return skills.some(s => s && this.canAffordSpektra(s.spektraCost, player.spektraPile))
  }
}
