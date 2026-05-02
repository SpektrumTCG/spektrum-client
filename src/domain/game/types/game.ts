import type { AvatarCard, BaseCard, Card, ElementType } from './card';

export interface Counter {
  bleed?: number;
  burn?: number;
  poison?: number;
  stun?: number;
  shield?: number;
  [key: string]: number | undefined;
}

export interface Player {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  energy: {
    fire: number;
    water: number;
    ground: number;
    air: number;
    neutral: number;
  };
  spektraPile: Card[];
  usedSpektraPile: Card[];
  lifeCards: Card[];
  hand: Card[];
  deck: Card[];
  discardPile: Card[];
  graveyard: Card[];
  field: Card[];
  activeAvatar: AvatarCard | null;
  reserveAvatars: AvatarCard[];
  counters: Counter;
  discardedThisTurn: Card[];
  isActivePlayer: boolean;
  avatarToSpektraCount: number;
  hasPlayedItemThisTurn: boolean;
  equipmentActivations: Record<string, number>;
}

export type GamePhaseType =
  | 'setup'
  | 'refresh'
  | 'draw'
  | 'main1'
  | 'battle'
  | 'main2'
  | 'recheck'
  | 'end'
  | 'game_over';

export interface GameState {
  currentTurn: number;
  phase: GamePhaseType;
  players: [Player, Player];
  currentPlayerIndex: 0 | 1;
  winner: string | null;
  turnTimer: number;
  lastAction: string;
  battleLog: string[];
  effectStack: GameEffect[];
}

export interface GameEffect {
  id: string;
  sourceCard: BaseCard;
  targetCard?: BaseCard;
  targetPlayer?: Player;
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'counter' | 'energy' | 'draw';
  value: number;
  duration?: number;
  conditions?: EffectCondition[];
}

export interface EffectCondition {
  type: 'card_type' | 'element' | 'counter_present' | 'health_threshold' | 'turn_number';
  value: any;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
}

export interface BattleResult {
  damage: number;
  effects: GameEffect[];
  countersApplied: Counter;
  cardStates: {
    [cardId: string]: {
      health: number;
      counters: Counter;
      attachedEquipment: BaseCard[];
    };
  };
}
