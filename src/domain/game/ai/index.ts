import type { AIDifficulty } from '../types/ai'
import { BaseAI } from './BaseAI'
import { NewbieAI } from './NewbieAI'
import { RegularAI } from './RegularAI'
import { EnhancedAI } from './EnhancedAI'

export { BaseAI, NewbieAI, RegularAI, EnhancedAI }
export { AI_PERSONALITIES } from './BaseAI'

export const AIFactory = {
  create(difficulty: AIDifficulty): BaseAI {
    switch (difficulty) {
      case 'newbie': return new NewbieAI(difficulty)
      case 'regular': return new RegularAI(difficulty)
      case 'advanced': return new EnhancedAI(difficulty)
    }
  },
}
