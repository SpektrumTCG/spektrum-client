export type AchievementCategory =
  | 'battle'
  | 'collection'
  | 'deck'
  | 'trading'
  | 'tutorial'
  | 'special';

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  maxProgress: number;
  hidden?: boolean;
  reward?: {
    type: 'booster' | 'title' | 'coins';
    amount?: number;
    tier?: 'beginner' | 'standard' | 'premium';
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  // BATTLE ACHIEVEMENTS (30 total)
  {
    id: 'first_victory',
    name: 'First Victory',
    description: 'Win your first battle',
    category: 'battle',
    rarity: 'common',
    icon: '🏆',
    maxProgress: 1,
    reward: { type: 'booster', amount: 1, tier: 'beginner' }
  },
  {
    id: 'win_5',
    name: 'Getting Started',
    description: 'Win 5 battles',
    category: 'battle',
    rarity: 'common',
    icon: '⚔️',
    maxProgress: 5,
    reward: { type: 'booster', amount: 1, tier: 'beginner' }
  },
  {
    id: 'win_10',
    name: 'Skilled Fighter',
    description: 'Win 10 battles',
    category: 'battle',
    rarity: 'uncommon',
    icon: '🗡️',
    maxProgress: 10,
    reward: { type: 'booster', amount: 1, tier: 'standard' }
  },
  {
    id: 'win_25',
    name: 'Veteran',
    description: 'Win 25 battles',
    category: 'battle',
    rarity: 'uncommon',
    icon: '🛡️',
    maxProgress: 25,
    reward: { type: 'booster', amount: 1, tier: 'standard' }
  },
  {
    id: 'win_50',
    name: 'Champion',
    description: 'Win 50 battles',
    category: 'battle',
    rarity: 'rare',
    icon: '👑',
    maxProgress: 50,
    reward: { type: 'booster', amount: 1, tier: 'standard' }
  },
  {
    id: 'win_100',
    name: 'Master Duelist',
    description: 'Win 100 battles',
    category: 'battle',
    rarity: 'epic',
    icon: '🔱',
    maxProgress: 100,
    reward: { type: 'booster', amount: 3, tier: 'premium' }
  },
  {
    id: 'win_250',
    name: 'Legend',
    description: 'Win 250 battles',
    category: 'battle',
    rarity: 'legendary',
    icon: '⭐',
    maxProgress: 250,
    reward: { type: 'booster', amount: 5, tier: 'premium' }
  },
  {
    id: 'win_streak_3',
    name: 'Hot Streak',
    description: 'Win 3 battles in a row',
    category: 'battle',
    rarity: 'uncommon',
    icon: '🔥',
    maxProgress: 3
  },
  {
    id: 'win_streak_5',
    name: 'Unstoppable',
    description: 'Win 5 battles in a row',
    category: 'battle',
    rarity: 'rare',
    icon: '💫',
    maxProgress: 5,
    reward: { type: 'booster', amount: 2, tier: 'standard' }
  },
  {
    id: 'win_streak_10',
    name: 'Domination',
    description: 'Win 10 battles in a row',
    category: 'battle',
    rarity: 'epic',
    icon: '🌟',
    maxProgress: 10,
    reward: { type: 'booster', amount: 2, tier: 'premium' }
  },
  {
    id: 'perfect_victory',
    name: 'Flawless Victory',
    description: 'Win a battle without losing any avatars',
    category: 'battle',
    rarity: 'rare',
    icon: '✨',
    maxProgress: 1,
    reward: { type: 'booster', amount: 1, tier: 'standard' }
  },
  {
    id: 'perfect_10',
    name: 'Perfectionist',
    description: 'Win 10 battles without losing any avatars',
    category: 'battle',
    rarity: 'epic',
    icon: '💎',
    maxProgress: 10,
    reward: { type: 'booster', amount: 2, tier: 'premium' }
  },
  {
    id: 'comeback_king',
    name: 'Comeback King',
    description: 'Win a battle after your active avatar drops below 5 HP',
    category: 'battle',
    rarity: 'uncommon',
    icon: '🎭',
    maxProgress: 1
  },
  {
    id: 'one_turn_kill',
    name: 'One Turn Wonder',
    description: 'Deal 30+ damage in a single turn',
    category: 'battle',
    rarity: 'rare',
    icon: '💥',
    maxProgress: 1
  },
  {
    id: 'overkill',
    name: 'Overkill',
    description: 'Deal 50+ damage in a single turn',
    category: 'battle',
    rarity: 'epic',
    icon: '☄️',
    maxProgress: 1,
    reward: { type: 'booster', amount: 1, tier: 'standard' }
  },
  {
    id: 'fire_master',
    name: 'Fire Master',
    description: 'Win 10 battles using primarily fire cards',
    category: 'battle',
    rarity: 'uncommon',
    icon: '🔥',
    maxProgress: 10
  },
  {
    id: 'water_master',
    name: 'Water Master',
    description: 'Win 10 battles using primarily water cards',
    category: 'battle',
    rarity: 'uncommon',
    icon: '💧',
    maxProgress: 10
  },
  {
    id: 'ground_master',
    name: 'Ground Master',
    description: 'Win 10 battles using primarily ground cards',
    category: 'battle',
    rarity: 'uncommon',
    icon: '🌱',
    maxProgress: 10
  },
  {
    id: 'air_master',
    name: 'Air Master',
    description: 'Win 10 battles using primarily air cards',
    category: 'battle',
    rarity: 'uncommon',
    icon: '💨',
    maxProgress: 10
  },
  {
    id: 'elemental_master',
    name: 'Elemental Master',
    description: 'Master all four elements (complete all element achievements)',
    category: 'battle',
    rarity: 'epic',
    icon: '🌈',
    maxProgress: 1,
    reward: { type: 'booster', amount: 3, tier: 'premium' }
  },
  {
    id: 'skill_user',
    name: 'Skill User',
    description: 'Use 50 avatar skills in battles',
    category: 'battle',
    rarity: 'uncommon',
    icon: '⚡',
    maxProgress: 50
  },
  {
    id: 'skill_master',
    name: 'Skill Master',
    description: 'Use 200 avatar skills in battles',
    category: 'battle',
    rarity: 'rare',
    icon: '🌀',
    maxProgress: 200
  },
  {
    id: 'spell_caster',
    name: 'Spell Caster',
    description: 'Play 100 spell cards in battles',
    category: 'battle',
    rarity: 'uncommon',
    icon: '🎯',
    maxProgress: 100
  },
  {
    id: 'quick_thinker',
    name: 'Quick Thinker',
    description: 'Play 50 quick spell cards',
    category: 'battle',
    rarity: 'uncommon',
    icon: '⚡',
    maxProgress: 50
  },
  {
    id: 'field_controller',
    name: 'Field Controller',
    description: 'Have a field card active for 20 turns total',
    category: 'battle',
    rarity: 'uncommon',
    icon: '🏟️',
    maxProgress: 20
  },
  {
    id: 'equipment_user',
    name: 'Equipment User',
    description: 'Play 50 equipment cards',
    category: 'battle',
    rarity: 'uncommon',
    icon: '🛡️',
    maxProgress: 50
  },
  {
    id: 'item_collector',
    name: 'Item Collector',
    description: 'Play 100 item cards',
    category: 'battle',
    rarity: 'uncommon',
    icon: '🎒',
    maxProgress: 100
  },
  {
    id: 'passive_power',
    name: 'Passive Power',
    description: 'Win 10 battles using avatars with passive skills',
    category: 'battle',
    rarity: 'rare',
    icon: '🌟',
    maxProgress: 10
  },
  {
    id: 'ante_winner',
    name: 'High Stakes Winner',
    description: 'Win an Ante Mode battle',
    category: 'battle',
    rarity: 'rare',
    icon: '🎰',
    maxProgress: 1,
    reward: { type: 'booster', amount: 2, tier: 'premium' }
  },
  {
    id: 'ante_champion',
    name: 'Ante Champion',
    description: 'Win 10 Ante Mode battles',
    category: 'battle',
    rarity: 'epic',
    icon: '💰',
    maxProgress: 10,
    reward: { type: 'booster', amount: 5, tier: 'premium' }
  },

  // COLLECTION ACHIEVEMENTS (25 total)
  {
    id: 'first_card',
    name: 'First Card',
    description: 'Collect your first card',
    category: 'collection',
    rarity: 'common',
    icon: '📇',
    maxProgress: 1
  },
  {
    id: 'collect_10',
    name: 'Starting Collection',
    description: 'Collect 10 unique cards',
    category: 'collection',
    rarity: 'common',
    icon: '📚',
    maxProgress: 10
  },
  {
    id: 'collect_25',
    name: 'Growing Collection',
    description: 'Collect 25 unique cards',
    category: 'collection',
    rarity: 'uncommon',
    icon: '📖',
    maxProgress: 25
  },
  {
    id: 'collect_50',
    name: 'Dedicated Collector',
    description: 'Collect 50 unique cards',
    category: 'collection',
    rarity: 'rare',
    icon: '📔',
    maxProgress: 50,
    reward: { type: 'booster', amount: 1, tier: 'standard' }
  },
  {
    id: 'collect_75',
    name: 'Master Collector',
    description: 'Collect 75 unique cards',
    category: 'collection',
    rarity: 'epic',
    icon: '📗',
    maxProgress: 75,
    reward: { type: 'booster', amount: 2, tier: 'premium' }
  },
  {
    id: 'collect_all',
    name: 'Complete Collection',
    description: 'Collect all available cards',
    category: 'collection',
    rarity: 'legendary',
    icon: '📕',
    maxProgress: 95,
    reward: { type: 'booster', amount: 10, tier: 'premium' }
  },
  {
    id: 'first_rare',
    name: 'First Rare',
    description: 'Collect your first rare card',
    category: 'collection',
    rarity: 'uncommon',
    icon: '💎',
    maxProgress: 1
  },
  {
    id: 'rare_collector',
    name: 'Rare Collector',
    description: 'Collect 10 rare cards',
    category: 'collection',
    rarity: 'rare',
    icon: '💠',
    maxProgress: 10
  },
  {
    id: 'first_legendary',
    name: 'Legendary Find',
    description: 'Collect your first legendary card',
    category: 'collection',
    rarity: 'rare',
    icon: '⭐',
    maxProgress: 1,
    reward: { type: 'booster', amount: 1, tier: 'standard' }
  },
  {
    id: 'legendary_collector',
    name: 'Legendary Collector',
    description: 'Collect 5 legendary cards',
    category: 'collection',
    rarity: 'epic',
    icon: '🌟',
    maxProgress: 5,
    reward: { type: 'booster', amount: 3, tier: 'premium' }
  },
  {
    id: 'fire_collection',
    name: 'Fire Collection',
    description: 'Collect all fire element cards',
    category: 'collection',
    rarity: 'rare',
    icon: '🔥',
    maxProgress: 20
  },
  {
    id: 'water_collection',
    name: 'Water Collection',
    description: 'Collect all water element cards',
    category: 'collection',
    rarity: 'rare',
    icon: '💧',
    maxProgress: 20
  },
  {
    id: 'ground_collection',
    name: 'Ground Collection',
    description: 'Collect all ground element cards',
    category: 'collection',
    rarity: 'rare',
    icon: '🌱',
    maxProgress: 20
  },
  {
    id: 'air_collection',
    name: 'Air Collection',
    description: 'Collect all air element cards',
    category: 'collection',
    rarity: 'rare',
    icon: '💨',
    maxProgress: 20
  },
  {
    id: 'avatar_collector',
    name: 'Avatar Collector',
    description: 'Collect 30 avatar cards',
    category: 'collection',
    rarity: 'uncommon',
    icon: '🧙',
    maxProgress: 30
  },
  {
    id: 'spell_collector',
    name: 'Spell Collector',
    description: 'Collect 20 spell cards',
    category: 'collection',
    rarity: 'uncommon',
    icon: '✨',
    maxProgress: 20
  },
  {
    id: 'kobar_tribe',
    name: 'Kobar Tribe',
    description: 'Collect all Kobar tribe cards',
    category: 'collection',
    rarity: 'rare',
    icon: '🦁',
    maxProgress: 15
  },
  {
    id: 'borah_tribe',
    name: 'Borah Tribe',
    description: 'Collect all Borah tribe cards',
    category: 'collection',
    rarity: 'rare',
    icon: '🐺',
    maxProgress: 15
  },
  {
    id: 'kuhaka_tribe',
    name: 'Kuhaka Tribe',
    description: 'Collect all Kuhaka tribe cards',
    category: 'collection',
    rarity: 'rare',
    icon: '🦅',
    maxProgress: 15
  },
  {
    id: 'kujana_tribe',
    name: 'Kujana Tribe',
    description: 'Collect all Kujana tribe cards',
    category: 'collection',
    rarity: 'rare',
    icon: '🐢',
    maxProgress: 15
  },
  {
    id: 'kuku_tribe',
    name: 'Kuku Tribe',
    description: 'Collect all Kuku tribe cards',
    category: 'collection',
    rarity: 'rare',
    icon: '🦎',
    maxProgress: 15
  },
  {
    id: 'booster_opener',
    name: 'Booster Opener',
    description: 'Open 10 booster packs',
    category: 'collection',
    rarity: 'common',
    icon: '📦',
    maxProgress: 10
  },
  {
    id: 'booster_addict',
    name: 'Booster Addict',
    description: 'Open 50 booster packs',
    category: 'collection',
    rarity: 'uncommon',
    icon: '🎁',
    maxProgress: 50,
    reward: { type: 'booster', amount: 2, tier: 'premium' }
  },
  {
    id: 'booster_master',
    name: 'Booster Master',
    description: 'Open 100 booster packs',
    category: 'collection',
    rarity: 'rare',
    icon: '🎉',
    maxProgress: 100,
    reward: { type: 'booster', amount: 5, tier: 'premium' }
  },
  {
    id: 'passive_collector',
    name: 'Passive Collector',
    description: 'Collect 10 avatars with passive skills',
    category: 'collection',
    rarity: 'uncommon',
    icon: '🌠',
    maxProgress: 10
  },

  // DECK BUILDING ACHIEVEMENTS (15 total)
  {
    id: 'first_deck',
    name: 'First Deck',
    description: 'Build your first complete deck',
    category: 'deck',
    rarity: 'common',
    icon: '📋',
    maxProgress: 1
  },
  {
    id: 'deck_builder',
    name: 'Deck Builder',
    description: 'Create 5 different decks',
    category: 'deck',
    rarity: 'uncommon',
    icon: '🗂️',
    maxProgress: 5
  },
  {
    id: 'deck_master',
    name: 'Deck Master',
    description: 'Create 10 different decks',
    category: 'deck',
    rarity: 'rare',
    icon: '📚',
    maxProgress: 10,
    reward: { type: 'booster', amount: 1, tier: 'standard' }
  },
  {
    id: 'mono_fire',
    name: 'Pure Fire',
    description: 'Build a deck with only fire cards',
    category: 'deck',
    rarity: 'uncommon',
    icon: '🔥',
    maxProgress: 1
  },
  {
    id: 'mono_water',
    name: 'Pure Water',
    description: 'Build a deck with only water cards',
    category: 'deck',
    rarity: 'uncommon',
    icon: '💧',
    maxProgress: 1
  },
  {
    id: 'mono_ground',
    name: 'Pure Ground',
    description: 'Build a deck with only ground cards',
    category: 'deck',
    rarity: 'uncommon',
    icon: '🌱',
    maxProgress: 1
  },
  {
    id: 'mono_air',
    name: 'Pure Air',
    description: 'Build a deck with only air cards',
    category: 'deck',
    rarity: 'uncommon',
    icon: '💨',
    maxProgress: 1
  },
  {
    id: 'rainbow_deck',
    name: 'Rainbow Deck',
    description: 'Build a deck with all four elements',
    category: 'deck',
    rarity: 'rare',
    icon: '🌈',
    maxProgress: 1
  },
  {
    id: 'balanced_deck',
    name: 'Perfect Balance',
    description: 'Build a deck with exactly 20 avatars and 20 action cards',
    category: 'deck',
    rarity: 'uncommon',
    icon: '⚖️',
    maxProgress: 1
  },
  {
    id: 'spell_heavy',
    name: 'Spell Heavy',
    description: 'Build a deck with 25+ spell cards',
    category: 'deck',
    rarity: 'uncommon',
    icon: '✨',
    maxProgress: 1
  },
  {
    id: 'avatar_heavy',
    name: 'Avatar Heavy',
    description: 'Build a deck with 25+ avatar cards',
    category: 'deck',
    rarity: 'uncommon',
    icon: '🧙',
    maxProgress: 1
  },
  {
    id: 'tribal_deck',
    name: 'Tribal Deck',
    description: 'Build a deck with only one tribe type',
    category: 'deck',
    rarity: 'rare',
    icon: '🏴',
    maxProgress: 1
  },
  {
    id: 'passive_synergy',
    name: 'Passive Synergy',
    description: 'Build a deck with 10+ passive skill avatars',
    category: 'deck',
    rarity: 'rare',
    icon: '🌟',
    maxProgress: 1
  },
  {
    id: 'deck_variety',
    name: 'Variety Master',
    description: 'Win battles with 5 different decks',
    category: 'deck',
    rarity: 'rare',
    icon: '🎨',
    maxProgress: 5,
    reward: { type: 'booster', amount: 2, tier: 'premium' }
  },
  {
    id: 'deck_optimizer',
    name: 'Deck Optimizer',
    description: 'Modify a deck 20 times',
    category: 'deck',
    rarity: 'uncommon',
    icon: '🔧',
    maxProgress: 20
  },

  // TRADING ACHIEVEMENTS (10 total)
  {
    id: 'first_trade',
    name: 'First Trade',
    description: 'Complete your first NFT trade',
    category: 'trading',
    rarity: 'common',
    icon: '🤝',
    maxProgress: 1,
    reward: { type: 'booster', amount: 1, tier: 'standard' }
  },
  {
    id: 'trader',
    name: 'Trader',
    description: 'Complete 10 NFT trades',
    category: 'trading',
    rarity: 'uncommon',
    icon: '💱',
    maxProgress: 10
  },
  {
    id: 'master_trader',
    name: 'Master Trader',
    description: 'Complete 50 NFT trades',
    category: 'trading',
    rarity: 'rare',
    icon: '💼',
    maxProgress: 50,
    reward: { type: 'booster', amount: 3, tier: 'premium' }
  },
  {
    id: 'first_mint',
    name: 'First Mint',
    description: 'Mint your first card as NFT',
    category: 'trading',
    rarity: 'uncommon',
    icon: '🪙',
    maxProgress: 1
  },
  {
    id: 'minting_spree',
    name: 'Minting Spree',
    description: 'Mint 10 cards as NFTs',
    category: 'trading',
    rarity: 'rare',
    icon: '⚒️',
    maxProgress: 10
  },
  {
    id: 'blockchain_master',
    name: 'Blockchain Master',
    description: 'Complete 100 blockchain transactions',
    category: 'trading',
    rarity: 'epic',
    icon: '⛓️',
    maxProgress: 100,
    reward: { type: 'booster', amount: 5, tier: 'premium' }
  },
  {
    id: 'wallet_connected',
    name: 'Wallet Connected',
    description: 'Connect your Phantom wallet',
    category: 'trading',
    rarity: 'common',
    icon: '👻',
    maxProgress: 1
  },
  {
    id: 'marketplace_browser',
    name: 'Marketplace Browser',
    description: 'Visit the trading page 10 times',
    category: 'trading',
    rarity: 'common',
    icon: '🏪',
    maxProgress: 10
  },
  {
    id: 'rare_seller',
    name: 'Rare Seller',
    description: 'Sell a rare or higher card as NFT',
    category: 'trading',
    rarity: 'uncommon',
    icon: '💎',
    maxProgress: 1
  },
  {
    id: 'nft_collector',
    name: 'NFT Collector',
    description: 'Own 20 card NFTs',
    category: 'trading',
    rarity: 'rare',
    icon: '🖼️',
    maxProgress: 20
  },

  // TUTORIAL ACHIEVEMENTS (5 total)
  {
    id: 'tutorial_start',
    name: 'Tutorial Start',
    description: 'Start the tutorial',
    category: 'tutorial',
    rarity: 'common',
    icon: '📖',
    maxProgress: 1
  },
  {
    id: 'tutorial_complete',
    name: 'Quick Learner',
    description: 'Complete the tutorial',
    category: 'tutorial',
    rarity: 'common',
    icon: '🎓',
    maxProgress: 1,
    reward: { type: 'booster', amount: 1, tier: 'standard' }
  },
  {
    id: 'library_visitor',
    name: 'Library Visitor',
    description: 'Visit the library page',
    category: 'tutorial',
    rarity: 'common',
    icon: '📚',
    maxProgress: 1
  },
  {
    id: 'settings_explorer',
    name: 'Settings Explorer',
    description: 'Change a setting',
    category: 'tutorial',
    rarity: 'common',
    icon: '⚙️',
    maxProgress: 1
  },
  {
    id: 'shop_visitor',
    name: 'Shop Visitor',
    description: 'Visit the shop',
    category: 'tutorial',
    rarity: 'common',
    icon: '🏪',
    maxProgress: 1
  },

  // SPECIAL/SECRET ACHIEVEMENTS (15 total)
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Play a match before 6 AM',
    category: 'special',
    rarity: 'uncommon',
    icon: '🌅',
    maxProgress: 1,
    hidden: true
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Play a match after midnight',
    category: 'special',
    rarity: 'uncommon',
    icon: '🦉',
    maxProgress: 1,
    hidden: true
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Win a battle in under 5 minutes',
    category: 'special',
    rarity: 'rare',
    icon: '⚡',
    maxProgress: 1,
    hidden: true
  },
  {
    id: 'marathon_match',
    name: 'Marathon Match',
    description: 'Win a battle that lasts over 30 minutes',
    category: 'special',
    rarity: 'rare',
    icon: '🏃',
    maxProgress: 1,
    hidden: true
  },
  {
    id: 'lucky_seven',
    name: 'Lucky Seven',
    description: 'Win with exactly 7 HP remaining',
    category: 'special',
    rarity: 'rare',
    icon: '🍀',
    maxProgress: 1,
    hidden: true
  },
  {
    id: 'card_hoarder',
    name: 'Card Hoarder',
    description: 'Have 10 cards in hand at once',
    category: 'special',
    rarity: 'uncommon',
    icon: '🎴',
    maxProgress: 1,
    hidden: true
  },
  {
    id: 'energy_master',
    name: 'Energy Master',
    description: 'Accumulate 20 energy in a single battle',
    category: 'special',
    rarity: 'rare',
    icon: '⚡',
    maxProgress: 1,
    hidden: true
  },
  {
    id: 'counter_master',
    name: 'Counter Master',
    description: 'Have 5 different status counters on one avatar',
    category: 'special',
    rarity: 'epic',
    icon: '🎯',
    maxProgress: 1,
    hidden: true
  },
  {
    id: 'glass_cannon',
    name: 'Glass Cannon',
    description: 'Win with your active avatar at 1 HP',
    category: 'special',
    rarity: 'epic',
    icon: '💀',
    maxProgress: 1,
    hidden: true,
    reward: { type: 'booster', amount: 2, tier: 'premium' }
  },
  {
    id: 'deck_out',
    name: 'Last Card Standing',
    description: 'Win a battle with 0 cards left in deck',
    category: 'special',
    rarity: 'epic',
    icon: '📭',
    maxProgress: 1,
    hidden: true
  },
  {
    id: 'first_day',
    name: 'Day One',
    description: 'Play on your first day',
    category: 'special',
    rarity: 'common',
    icon: '🎉',
    maxProgress: 1
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Play for 7 consecutive days',
    category: 'special',
    rarity: 'uncommon',
    icon: '📅',
    maxProgress: 7,
    reward: { type: 'booster', amount: 1, tier: 'standard' }
  },
  {
    id: 'month_champion',
    name: 'Month Champion',
    description: 'Play for 30 consecutive days',
    category: 'special',
    rarity: 'rare',
    icon: '🗓️',
    maxProgress: 30,
    reward: { type: 'booster', amount: 5, tier: 'premium' }
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Visit every page in the app',
    category: 'special',
    rarity: 'uncommon',
    icon: '🗺️',
    maxProgress: 10
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Unlock all non-hidden achievements',
    category: 'special',
    rarity: 'legendary',
    icon: '🏅',
    maxProgress: 1,
    hidden: true,
    reward: { type: 'title', amount: 1 }
  },
  // COLLECTION ACHIEVEMENTS - Element Collections
  {
    id: 'collect_fire_complete',
    name: 'Inferno Collector',
    description: 'Collect all fire element cards',
    category: 'collection',
    rarity: 'rare',
    icon: '🔥',
    maxProgress: 1,
    reward: { type: 'booster', amount: 2, tier: 'standard' }
  },
  {
    id: 'collect_water_complete',
    name: 'Aquatic Curator',
    description: 'Collect all water element cards',
    category: 'collection',
    rarity: 'rare',
    icon: '💧',
    maxProgress: 1,
    reward: { type: 'booster', amount: 2, tier: 'standard' }
  },
  {
    id: 'collect_ground_complete',
    name: 'Earthen Archaeologist',
    description: 'Collect all ground element cards',
    category: 'collection',
    rarity: 'rare',
    icon: '🌍',
    maxProgress: 1,
    reward: { type: 'booster', amount: 2, tier: 'standard' }
  },
  {
    id: 'collect_air_complete',
    name: 'Sky Master',
    description: 'Collect all air element cards',
    category: 'collection',
    rarity: 'rare',
    icon: '💨',
    maxProgress: 1,
    reward: { type: 'booster', amount: 2, tier: 'standard' }
  },
  // Collection by Tribe
  {
    id: 'collect_all_tribes',
    name: 'Tribal Herald',
    description: 'Collect cards from all 5 tribes',
    category: 'collection',
    rarity: 'epic',
    icon: '🏛️',
    maxProgress: 1,
    reward: { type: 'booster', amount: 3, tier: 'premium' }
  },
  // Rarity Collections
  {
    id: 'collect_mythic',
    name: 'Mythic Seeker',
    description: 'Collect your first Mythic rarity card',
    category: 'collection',
    rarity: 'epic',
    icon: '⭐',
    maxProgress: 1,
    reward: { type: 'booster', amount: 1, tier: 'premium' }
  },
  {
    id: 'collect_50_unique',
    name: 'Growing Collection',
    description: 'Collect 50 unique cards',
    category: 'collection',
    rarity: 'uncommon',
    icon: '📚',
    maxProgress: 50,
    reward: { type: 'booster', amount: 1, tier: 'standard' }
  },
  {
    id: 'collect_100_unique',
    name: 'Card Historian',
    description: 'Collect 100 unique cards',
    category: 'collection',
    rarity: 'rare',
    icon: '📖',
    maxProgress: 100,
    reward: { type: 'booster', amount: 2, tier: 'standard' }
  }
];

export const getCategoryName = (category: AchievementCategory): string => {
  const names: Record<AchievementCategory, string> = {
    battle: 'Battle',
    collection: 'Collection',
    deck: 'Deck Building',
    trading: 'Trading',
    tutorial: 'Tutorial',
    special: 'Special'
  };
  return names[category];
};

export const getRarityColor = (rarity: AchievementRarity): string => {
  const colors: Record<AchievementRarity, string> = {
    common: 'text-gray-600',
    uncommon: 'text-green-600',
    rare: 'text-blue-600',
    epic: 'text-purple-600',
    legendary: 'text-orange-600'
  };
  return colors[rarity];
};

export const getRarityBg = (rarity: AchievementRarity): string => {
  const colors: Record<AchievementRarity, string> = {
    common: 'bg-gray-100 border-gray-300',
    uncommon: 'bg-green-50 border-green-300',
    rare: 'bg-blue-50 border-blue-300',
    epic: 'bg-purple-50 border-purple-300',
    legendary: 'bg-orange-50 border-orange-300'
  };
  return colors[rarity];
};
