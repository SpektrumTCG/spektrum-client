// Define the types for the card game

export type ElementType = 'fire' | 'water' | 'ground' | 'air' | 'neutral';
export type SubType = 'kobar' | 'borah' | 'kuhaka' | 'kujana' | 'kuku';
export type ActionSubType = 'equipment' | 'healing' | 'damage' | 'draw' | 'search' | 'utility' | 'destruction';
export type CardCategory = 'avatar' | 'spell' | 'quickSpell' | 'ritualArmor' | 'field' | 'equipment' | 'item';
export type RarityType = 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Mythic';
export type PassiveSkillScope = 'active' | 'active_or_reserve';

// Effect types for skill execution
export type EffectType =
  | 'none'           // No additional effect (basic damage only)
  | 'heal'           // Restore HP
  | 'damage'         // Additional damage
  | 'buff'           // Increase stats temporarily (damage boost)
  | 'debuff'         // Decrease stats temporarily
  | 'bleed'          // Apply bleed counter
  | 'shield'         // Apply shield counter
  | 'draw'           // Draw cards
  | 'draw_discard'   // Draw cards then discard cards
  | 'discard'        // Discard cards from hand
  | 'discard_all'    // Discard all cards from hand
  | 'discard_draw'   // Discard all cards then draw cards
  | 'discard_heal'   // Discard cards then heal damage from target avatar
  | 'discard_retrieve' // Discard cards then retrieve avatar from graveyard
  | 'discard_search' // Discard avatar then search deck for matching element
  | 'deck_top'       // Place cards on top of deck
  | 'deck_bottom'    // Place cards on bottom of deck
  | 'reveal_choose'  // Reveal top cards and choose one
  | 'peek_deck'      // Look at top card of deck
  | 'peek_place'     // Look at top cards and place one back, return rest to deck
  | 'peek_place_draw' // Look at top cards, place one on top, draw remaining
  | 'spell_protection' // Block next N spells matching criteria (element/type)
  | 'counter';         // Apply counter effect

// Modifier types for continuous stat bonuses
export type ModifierType =
  | 'skill_damage_boost'      // Increases skill damage
  | 'skill_heal_boost'        // Increases healing amounts
  | 'damage_reduction'        // Reduces incoming damage
  | 'spektra_cost_reduction'; // Reduces spektra costs

// Trigger types for field spell event-based effects
export type FieldTriggerType =
  | 'on_draw'       // Triggers when player draws a card
  | 'on_skill_use'; // Triggers when player's avatar uses a skill

// Trigger effect types for field spell triggers
export type TriggerEffectType =
  | 'damage'    // Deal damage to opponent
  | 'heal'      // Heal player
  | 'draw_card';// Draw a card

// Condition types for triggering additional effects
export type ConditionType =
  | 'none'                          // No condition, always triggers
  | 'elemental_spektra_pile'        // Check player's spektra pile for element
  | 'elemental_opponent_active'     // Check opponent's active avatar element
  | 'elemental_opponent_reserve'    // Check if opponent has element in reserve
  | 'elemental_player_avatars'      // Check if player has element in active OR reserve
  | 'elemental_opponent_avatars'    // Check if opponent has element in active OR reserve
  | 'type_player_reserve'           // Check if player has tribe in reserve
  | 'type_opponent_active'          // Check opponent's active avatar tribe
  | 'type_opponent_reserve'         // Check if opponent has tribe in reserve
  | 'damage_to_self';               // Self has taken damage threshold

// HP threshold operators for conditional damage
export type HPThresholdOperator = '<=' | '>=' | '==' | '<' | '>';

// Conditional damage based on target HP
export interface ConditionalDamage {
  operator: HPThresholdOperator; // Comparison operator
  threshold: number; // HP threshold value
  newDamage: number; // Damage value when condition is met
}

// Activation types for skill execution
export type ActivationType =
  | 'automatic'  // Triggers automatically based on conditions (default)
  | 'manual';    // Requires player to click/activate during their turn

// Effect target types for skill resolution
export type EffectTargetType =
  | 'player_active'           // Current player's active avatar
  | 'opponent_active'         // Current opponent's active avatar
  | 'opponent_active_and_all_reserve' // Opponent's active avatar + all reserve avatars
  | 'select_player_reserve'   // Select one player reserve avatar (interactive)
  | 'select_opponent_reserve' // Select one opponent reserve avatar (interactive)
  | 'select_player_avatar'    // Select any player avatar - active OR reserve (interactive)
  | 'select_opponent_avatar'  // Select any opponent avatar - active OR reserve (interactive)
  | 'all_player_avatars'      // All player avatars (active + reserve)
  | 'all_opponent_avatars'    // All opponent avatars (active + reserve)
  | 'all_player_reserve'      // All player reserve avatars only
  | 'all_opponent_reserve'    // All opponent reserve avatars only
  | 'all_cards_on_field'      // All avatars on field (both players' active + reserves)
  | 'all_element_avatars'     // All avatars matching a specific element (use with conditionValue)
  // Friendly element targeting (current player)
  | 'all_player_fire_avatars'        // All player's fire element avatars
  | 'all_player_water_avatars'       // All player's water element avatars
  | 'all_player_ground_avatars'      // All player's ground element avatars
  | 'all_player_air_avatars'         // All player's air element avatars
  // Opponent element targeting
  | 'all_opponent_fire_avatars'      // All opponent's fire element avatars
  | 'all_opponent_water_avatars'     // All opponent's water element avatars
  | 'all_opponent_ground_avatars'    // All opponent's ground element avatars
  | 'all_opponent_air_avatars'       // All opponent's air element avatars
  // Legacy element targeting (deprecated, use specific player/opponent variants)
  | 'all_fire_avatars'        // Deprecated: Use all_player_fire_avatars or all_opponent_fire_avatars
  | 'all_water_avatars'       // Deprecated: Use all_player_water_avatars or all_opponent_water_avatars
  | 'all_ground_avatars'      // Deprecated: Use all_player_ground_avatars or all_opponent_ground_avatars
  | 'all_air_avatars'         // Deprecated: Use all_player_air_avatars or all_opponent_air_avatars
  | 'player'                  // The player themselves
  | 'opponent';               // The opponent themselves

// Card interfaces
export interface Skill {
  id?: string; // Unique identifier for the skill
  name: string;
  description?: string; // Description of the skill
  spektraCost: ElementType[];  // Array of elements needed
  damage: number; // Primary damage (always targets opponent_active)

  // Advanced Effect System
  effectType?: EffectType; // Primary effect type (defaults to basic_damage)
  effectValue?: number; // Value for primary effect (heal amount, shield count, etc.)
  effectValue2?: number; // Secondary value (e.g., discard count for draw_discard)
  effectTarget?: EffectTargetType; // Target for additional effect
  condition?: ConditionType; // Condition to trigger the effect
  conditionValue?: string | number; // Value for condition (element type, tribe, damage threshold)

  // Conditional Damage System (HP threshold-based damage override)
  conditionalDamage?: ConditionalDamage; // Override damage when target HP meets threshold

  // Modifier System (for passive skills only)
  modifierType?: ModifierType; // Type of continuous stat bonus
  modifierValue?: number; // Bonus amount (+2 damage, -1 cost, etc.)
  modifierCondition?: string; // Element or tribe filter (e.g., 'fire' or 'kobar')

  // Manual Activation System (for equipment/field abilities)
  activationType?: ActivationType; // How the skill is triggered (defaults to 'automatic')
  activationCost?: ElementType[]; // Spektra cost for manual activation (separate from spektraCost)
  activationsPerTurn?: number; // Max uses per turn (undefined = unlimited)

  // Legacy fields for backward compatibility
  effect?: string;
  additionalEffect?: string;
  additionalEffectType?: string;
  additionalEffectValue?: number;
  target?: string;
  conditions?: StructuredCondition[];
  scope?: PassiveSkillScope; // For passive skills: when they are active
}

export interface Counter {
  damage: number;
  bleed: number;
  shield: number;
  [key: string]: number;
}

// Base Card interface
export interface BaseCard {
  id: string;
  name: string;
  type: CardCategory;
  element: ElementType;
  rarity?: RarityType; // Card rarity for booster pack systems
  expansion?: string; // Expansion set identifier
  description?: string;
  spektraCost?: ElementType[];
  effect?: string;
  art?: string; // Optional for avatar cards that use imagePath
  imagePath?: string; // Image path for the card
  duplicateGroup?: string; // card_number of base card for duplicate-limit grouping
}

// Avatar Card interface
export interface AvatarCard extends BaseCard {
  type: 'avatar';
  level: 1 | 2;
  subType: SubType;
  tribe?: SubType; // Alternative name for subType, used in some card definitions
  baseType?: string; // For Level 2 cards, shows what Level 2 card it evolves from
  health: number;
  hp?: number; // Alternative name for health
  passiveSkill?: Skill; // Legacy: Single passive ability
  passiveSkills?: Skill[]; // New: Array of passive abilities with scope
  attack?: number; // Optional attack stat for display
  spektra?: number; // Spektra cost to summon
  skills?: Skill[]; // Array of skills instead of skill1/skill2
  skill1?: Skill; // Legacy support
  skill2?: Skill; // Legacy support
  counters?: Counter;
  isTapped?: boolean; // If avatar has already used a skill this turn
  turnPlayed?: number; // Track which turn the avatar was played
  attachedEquipment?: BaseCard[]; // Equipment cards attached to this avatar
  baseCard?: AvatarCard; // Card stacking: the Level 1 this avatar evolved from (set during evolution)
  imagePath?: string; // Image path for the card
  cardNumber?: string; // Card number for organization
}

// Field Trigger interface - event-based effects for field spells
export interface FieldTrigger {
  triggerType: FieldTriggerType; // When the trigger activates
  effectType: TriggerEffectType; // What effect happens
  effectValue: number; // Amount (damage/heal value)
  condition?: string; // Element or tribe filter (e.g., 'fire' or 'water')
}

// Field Card interface - has passive effects like avatars
export interface FieldCard extends BaseCard {
  type: 'field';
  cardNumber?: string; // Card number/ID for tracking
  passiveEffect?: string; // Legacy text description
  affect1?: string; // Legacy: First affect bar
  affect2?: string; // Legacy: Second affect bar
  affect3?: string; // Legacy: Third affect bar
  duration?: number; // How many turns the field stays active

  // New: Advanced Effect System support (2-3 effects per field)
  skill1?: Skill; // Primary field effect
  skill2?: Skill; // Secondary field effect
  skill3?: Skill; // Tertiary field effect (optional)

  // Global Modifier System (applies to all matching avatars)
  modifierType?: ModifierType; // Type of continuous stat bonus
  modifierValue?: number; // Bonus amount (+1 damage, etc.)
  modifierCondition?: string; // Element or tribe filter (e.g., 'fire' or 'kobar')

  // Trigger System (event-based effects)
  trigger?: FieldTrigger; // Optional trigger configuration
}

// Action Card interface
export interface ActionCard extends BaseCard {
  type: 'spell' | 'quickSpell' | 'ritualArmor' | 'equipment' | 'item';
  cardNumber?: string; // Card number/ID for tracking
  subType?: ActionSubType;
  imagePath?: string; // Image path for the card

  // Advanced Effect System (direct card effects)
  effectType?: EffectType; // Primary effect type
  effectValue?: number; // Value for primary effect
  effectValue2?: number; // Secondary value (for multi-value effects)
  effectTarget?: EffectTargetType; // Target for effect

  // Global Modifier System (applies to matching avatars)
  modifierType?: ModifierType; // Type of continuous stat bonus
  modifierValue?: number; // Bonus amount
  modifierCondition?: string; // Element or tribe filter

  // Legacy: Single skill
  skill?: Skill; // Backward compatibility

  // New: Multi-effect support (2 effects per spell/equipment)
  skill1?: Skill; // Primary effect
  skill2?: Skill; // Secondary effect
}

export type Card = AvatarCard | ActionCard | FieldCard;

// Game phase type
export type GamePhase = 'setup' | 'refresh' | 'draw' | 'main1' | 'battle' | 'damage' | 'main2' | 'recheck' | 'end';

// Player type
export type Player = 'player' | 'opponent';

// Skill condition types for structured conditions on Skill.conditions
export type SkillConditionType =
  | 'opponent_tribe'
  | 'self_damage'
  | 'hand_size_max'
  | 'discard_spektra'
  | 'opponent_element'
  | 'opponent_hp'
  | 'hand_empty'
  | 'draw_cards';

// Structured condition for Skill.conditions array
export interface StructuredCondition {
  type: SkillConditionType;
  value: any;
  effect?: {
    type: string;
    value: any;
  };
}

// Minimal player state for skill trigger checking (lightweight view)
export interface SkillCheckPlayerState {
  hand: any[];
  spektraPile: any[];
  usedSpektraPile: any[];
  activeAvatar: AvatarCard | null;
  reserveAvatars: AvatarCard[];
  graveyard: any[];
  avatarToSpektraCount: number;
}

// Lightweight game state for skillTriggerChecker (NOT the full engine GameState)
export interface SkillCheckState {
  player: SkillCheckPlayerState;
  opponent: SkillCheckPlayerState;
  gamePhase: string;
  currentPlayer: Player;
  coinFlipResult?: boolean;
}

/** @deprecated Use SkillCheckPlayerState */
export type GamePlayerState = SkillCheckPlayerState;
