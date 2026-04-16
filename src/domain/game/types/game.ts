import type { AvatarCard, BaseCard, ElementType } from './card';

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
  spektraPile: BaseCard[];
  usedSpektraPile: BaseCard[];
  lifeCards: BaseCard[];
  hand: BaseCard[];
  deck: BaseCard[];
  discardPile: BaseCard[];
  field: BaseCard[];
  activeAvatar: AvatarCard | null;
  reserveAvatars: AvatarCard[];
  counters: Counter;
  discardedThisTurn: BaseCard[];
  isActivePlayer: boolean;
}

export interface GameState {
  currentTurn: number;
  phase: 'setup' | 'main' | 'battle' | 'end' | 'game_over';
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
