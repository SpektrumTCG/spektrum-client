import type { GameState } from '../types/game'
import type { AIDecision } from '../types/ai'
import type { AvatarCard } from '../types/card'
import { BaseAI } from './BaseAI'

export class NewbieAI extends BaseAI {
  decide(state: GameState, playerIndex: 0 | 1 = 1): AIDecision {
    const player = state.players[playerIndex]

    if (state.phase !== 'main' && state.phase !== 'battle') {
      return this.endPhase(`auto end ${state.phase}`)
    }

    if (player.hand.length === 0) {
      return this.endPhase('No cards in hand')
    }

    // Add to spektra if low
    if (player.spektraPile.length < 3) {
      const card = player.hand[Math.floor(Math.random() * player.hand.length)]
      return { type: 'addToSpektra', cardId: card.id, reasoning: 'Need spektra', priority: 50 }
    }

    // Play random avatar if no active
    if (!player.activeAvatar) {
      const avatars = player.hand.filter(c => c.type === 'avatar') as AvatarCard[]
      if (avatars.length > 0) {
        const pick = avatars[Math.floor(Math.random() * avatars.length)]
        return { type: 'playAvatar', cardId: pick.id, slot: 'active', reasoning: 'Place avatar', priority: 80 }
      }
    }

    // Use random affordable skill
    if (this.hasAffordableSkill(state, playerIndex)) {
      return { type: 'useSkill', skillIndex: 0, reasoning: 'Use skill', priority: 60 }
    }

    return this.endPhase('No good plays')
  }
}
