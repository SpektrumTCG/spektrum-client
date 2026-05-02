// card.ts exports are the authoritative card/skill/effect type definitions.
// game.ts exports are the authoritative full game-state object types.
// We don't re-export the lightweight GameState / Player / Counter from card.ts here
// — those are imported directly by skillTriggerChecker.ts via '../types/card'.

export type {
  ElementType, SubType, CardCategory, RarityType, PassiveSkillScope,
  EffectType, ModifierType, FieldTriggerType, FieldTrigger, TriggerEffectType,
  ConditionType, HPThresholdOperator, ActivationType, EffectTargetType,
  ConditionalDamage, Skill, BaseCard, AvatarCard, FieldCard, ActionCard, Card,
  GamePhase, SkillConditionType, StructuredCondition,
  SkillCheckState, SkillCheckPlayerState, GamePlayerState,
} from './card'

export type { Counter, Player, GameState, GamePhaseType, GameEffect, EffectCondition, BattleResult } from './game'

export * from './ai'
