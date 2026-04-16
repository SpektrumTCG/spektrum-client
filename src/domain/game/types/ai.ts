import type { ElementType } from './card'

export type AIDifficulty = 'newbie' | 'regular' | 'advanced'

export type AIPlayStyle = 'aggressive' | 'defensive' | 'balanced' | 'control'

export interface AIPersonality {
  name: string
  difficulty: AIDifficulty
  description: string
  aggression: number      // 0-100
  caution: number         // 0-100
  efficiency: number      // 0-100
  strategy: number        // 0-100
  riskTolerance: number   // 0-100
  adaptability: number    // 0-100
  cardEvaluation: number  // 0-100
  favoriteElements: ElementType[]
  preferredPlayStyle: AIPlayStyle
  mistakeChance: number   // 0-100
}

export type AIActionType =
  | 'playAvatar'
  | 'playSpell'
  | 'addToSpektra'
  | 'evolveAvatar'
  | 'useSkill'
  | 'endPhase'

export interface AIDecision {
  type: AIActionType
  cardId?: string
  targetId?: string
  slot?: 'active' | number
  skillIndex?: 0 | 1
  reasoning: string
  priority: number
}
