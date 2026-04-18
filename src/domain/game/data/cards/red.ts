import { AvatarCard, ActionCard, ElementType } from '../../types/card';

// Helper function to create spektra cost arrays
const createSpektraCost = (fire: number = 0, neutral: number = 0): ElementType[] => {
  const spektraCost: ElementType[] = [];
  
  // Add fire spektra
  for (let i = 0; i < fire; i++) {
    spektraCost.push('fire');
  }
  
  // Add neutral spektra
  for (let i = 0; i < neutral; i++) {
    spektraCost.push('neutral');
  }
  
  return spektraCost;
};

// Parse spektra cost string like "fire,fire,neutral"
const parseSpektraCost = (costString?: string): ElementType[] => {
  if (!costString) return [];
  return costString.split(',').map(s => s.trim() as ElementType);
};

// RED ELEMENTAL CARDS - MODERN FORMAT

// Level 1 Avatar Cards
export const borahTraineeA: AvatarCard = {
  id: 'borah-001',
  name: 'Borah Trainee A',
  type: 'avatar',
  element: 'fire',
  subType: 'borah',
  level: 1,
  attack: 1,
  health: 6,
  rarity: 'Common',
  description: 'Avatar - Borah',
  skills: [
    {
      id: 'punch',
      name: 'Punch',
      description: 'Basic attack',
      spektraCost: ['fire'],
      damage: 1
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Borah Trainee A.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-001'
};

export const borahTraineeB: AvatarCard = {
  id: 'borah-002',
  name: 'Borah Trainee B',
  type: 'avatar',
  element: 'fire',
  subType: 'borah',
  level: 1,
  attack: 2,
  health: 5,
  rarity: 'Common',
  description: 'Avatar - Borah',
  skills: [
    {
      id: 'slash',
      name: 'Slash',
      description: 'Basic attack',
      spektraCost: ['fire', 'neutral'],
      damage: 2
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Borah Trainee B.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-002'
};

export const borahTraineeC: AvatarCard = {
  id: 'borah-003',
  name: 'Borah Trainee C',
  type: 'avatar',
  element: 'fire',
  subType: 'borah',
  level: 1,
  attack: 1,
  health: 4,
  rarity: 'Common',
  description: 'Avatar - Borah',
  skills: [
    {
      id: 'explosion',
      name: 'Explosion',
      description: 'If opponent Active Avatar has Bleed Counter, this Skill1 Damage become 3',
      spektraCost: ['fire', 'fire'],
      damage: 1,
      effect: 'If opponent Active Avatar has Bleed Counter, this Skill1 Damage become 3'
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Borah Trainee C.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-003'
};

export const kobarTraineeA: AvatarCard = {
  id: 'kobar-001',
  name: 'Kobar Trainee A',
  type: 'avatar',
  element: 'fire',
  subType: 'kobar',
  level: 1,
  attack: 1,
  health: 7,
  rarity: 'Common',
  description: 'Avatar - Kobar',
  skills: [
    {
      id: 'punch',
      name: 'Punch',
      description: 'Basic attack',
      spektraCost: ['fire'],
      damage: 1
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Kobar Trainee A.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-004'
};

export const kobarTraineeB: AvatarCard = {
  id: 'kobar-002',
  name: 'Kobar Trainee B',
  type: 'avatar',
  element: 'fire',
  subType: 'kobar',
  level: 1,
  attack: 2,
  health: 8,
  rarity: 'Common',
  description: 'Avatar - Kobar',
  skills: [
    {
      id: 'kick',
      name: 'Kick',
      description: 'Basic attack',
      spektraCost: ['fire', 'neutral'],
      damage: 2
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Kobar Trainee B.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-005'
};

export const kobarTraineeC: AvatarCard = {
  id: 'kobar-003',
  name: 'Kobar Trainee C',
  type: 'avatar',
  element: 'fire',
  subType: 'kobar',
  level: 1,
  attack: 0,
  health: 6,
  rarity: 'Common',
  description: 'Avatar - Kobar',
  skills: [
    {
      id: 'dagger-play',
      name: 'Dagger Play',
      description: 'Put 2 Bleed Counter on opponent Active Avatar',
      spektraCost: ['fire', 'fire'],
      damage: 0,
      effectType: 'bleed',
      effectValue: 2,
      effectTarget: 'opponent_active'
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Kobar Trainee C.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-006'
};

export const repoGirl: AvatarCard = {
  id: 'kujana-001',
  name: 'Repo Girl',
  type: 'avatar',
  element: 'fire',
  subType: 'kujana',
  level: 1,
  attack: 2,
  health: 6,
  rarity: 'Common',
  description: 'Avatar - Kujana',
  skills: [
    {
      id: 'kick',
      name: 'Kick',
      description: 'Basic attack',
      spektraCost: ['fire', 'fire'],
      damage: 2
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Repo Girl.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-007'
};

export const shamanKuhaka: AvatarCard = {
  id: 'kuhaka-001',
  name: 'Shaman',
  type: 'avatar',
  element: 'fire',
  subType: 'kuhaka',
  level: 1,
  attack: 0,
  health: 6,
  rarity: 'Common',
  description: 'Avatar - Kuhaka',
  skills: [
    {
      id: 'burn-spell',
      name: 'Burn Spell',
      description: 'Put 2 bleed counter into opponent Active Avatar',
      spektraCost: ['fire', 'fire'],
      damage: 0,
      effectType: 'bleed',
      effectValue: 2,
      effectTarget: 'opponent_active'
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Shaman A.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-008'
};

export const shamanKujana: AvatarCard = {
  id: 'kujana-002',
  name: 'Shaman',
  type: 'avatar',
  element: 'fire',
  subType: 'kujana',
  level: 1,
  attack: 0,
  health: 6,
  rarity: 'Common',
  description: 'Avatar - Kujana',
  skills: [
    {
      id: 'direct-spell',
      name: 'Direct Spell',
      description: 'Put 1 damage into Opponent Target Avatar',
      spektraCost: ['fire', 'fire'],
      damage: 0,
      effectType: 'damage',
      effectValue: 1,
      effectTarget: 'select_opponent_avatar'
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Shaman B.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-009'
};

export const thug: AvatarCard = {
  id: 'kuhaka-002',
  name: 'Thug',
  type: 'avatar',
  element: 'fire',
  subType: 'kuhaka',
  level: 1,
  attack: 1,
  health: 7,
  rarity: 'Common',
  description: 'Avatar - Kuhaka',
  skills: [
    {
      id: 'punch',
      name: 'Punch',
      description: 'Basic attack',
      spektraCost: ['fire'],
      damage: 1
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Thug A.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-010'
};

export const witchTrainee: AvatarCard = {
  id: 'kujana-003',
  name: 'Witch Trainee',
  type: 'avatar',
  element: 'fire',
  subType: 'kujana',
  level: 1,
  attack: 1,
  health: 7,
  rarity: 'Common',
  description: 'Avatar - Kujana',
  skills: [
    {
      id: 'unholy-bleed',
      name: 'Unholy Bleed',
      description: 'Flip a coin, if head, opponent defending Avatar get 2 Bleed Counters',
      spektraCost: ['fire', 'fire'],
      damage: 1,
      effect: 'Flip a coin, if head, opponent defending Avatar get 2 Bleed Counters'
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Witch Trainee.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-011'
};

// Level 2 Avatar Cards
export const banaspati: AvatarCard = {
  id: 'kuhaka-101',
  name: 'Banaspati',
  type: 'avatar',
  element: 'fire',
  subType: 'kuhaka',
  baseType: 'kuhaka',
  level: 2,
  attack: 1,
  health: 13,
  rarity: 'Common',
  description: 'Avatar - Kuhaka',
  skills: [
    {
      id: 'burning-dagger',
      name: 'Burning Dagger',
      description: 'Flip a coin, if head, opponent defending Avatar get 2 Bleed Counters',
      spektraCost: ['fire', 'neutral'],
      damage: 1,
      effect: 'Flip a coin, if head, opponent defending Avatar get 2 Bleed Counters'
    },
    {
      id: 'blood-absorption',
      name: 'Blood Abssorbtion',
      description: 'If opponent Active Avatar has Bleed Counter, heal 2 damage to one of your Reserve Avatar.',
      spektraCost: ['fire', 'fire', 'neutral', 'neutral'],
      damage: 9,
      effect: 'If opponent Active Avatar has Bleed Counter, heal 2 damage to one of your Reserve Avatar.'
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Banaspati.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-012'
};

export const banaspatiFemale: AvatarCard = {
  id: 'kujana-101',
  name: 'Banaspati Female',
  type: 'avatar',
  element: 'fire',
  subType: 'kujana',
  baseType: 'kujana',
  level: 2,
  attack: 3,
  health: 12,
  rarity: 'Common',
  description: 'Avatar - Kujana',
  skills: [
    {
      id: 'pyro-punch',
      name: 'Pyro Punch',
      description: 'If opponent Active Avatar has Bleed Counter, this Skill1 Damage become 4',
      spektraCost: ['fire', 'neutral'],
      damage: 3,
      effect: 'If opponent Active Avatar has Bleed Counter, this Skill1 Damage become 4'
    },
    {
      id: 'burning-body',
      name: 'Burning Body',
      description: 'If opponent Active Avatar is wind Element Avatar, this Skill2 Damage become 11',
      spektraCost: ['fire', 'fire', 'neutral', 'neutral'],
      damage: 9,
      effect: 'If opponent Active Avatar is wind Element Avatar, this Skill2 Damage become 11'
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Banaspati.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-013'
};

export const boarBerserker: AvatarCard = {
  id: 'kuhaka-102',
  name: 'Boar Berserker',
  type: 'avatar',
  element: 'fire',
  subType: 'kuhaka',
  baseType: 'kuhaka',
  level: 2,
  attack: 3,
  health: 8,
  rarity: 'Common',
  description: 'Avatar - Kuhaka',
  skills: [
    {
      id: 'fire-slash',
      name: 'Fire Slash',
      description: 'If opponent Active Avatar is wind Element Avatar, this Skill1 Damage become 5',
      spektraCost: ['fire', 'fire'],
      damage: 3,
      effect: 'If opponent Active Avatar is wind Element Avatar, this Skill1 Damage become 5'
    },
    {
      id: 'burn-and-slam',
      name: 'Burn and Slam',
      description: 'Player may discard a spektra card from spektra pile or used spektra pile. If the player does that, this Skill2Damage become 23',
      spektraCost: ['fire', 'neutral', 'neutral', 'neutral', 'neutral'],
      damage: 12,
      effect: 'Player may discard a spektra card from spektra pile or used spektra pile. If the player does that, this Skill2Damage become 23'
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Boar Berserker.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-014'
};

export const boarWitch: AvatarCard = {
  id: 'kujana-102',
  name: 'Boar Witch',
  type: 'avatar',
  element: 'fire',
  subType: 'kujana',
  baseType: 'kujana',
  level: 2,
  attack: 7,
  health: 12,
  rarity: 'Common',
  description: 'Avatar - Kujana',
  skills: [
    {
      id: 'heal-aura',
      name: 'Heal Aura',
      description: 'After attack, heal 2 damage from this Avatar',
      spektraCost: ['fire', 'fire', 'neutral', 'neutral'],
      damage: 7,
      effect: 'After attack, heal 2 damage from this Avatar'
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Boar Witch.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-015'
};

export const boarWitchMythic: AvatarCard = {
  id: 'kujana-102-mythic',
  name: 'Boar Witch, Mythic',
  type: 'avatar',
  element: 'fire',
  subType: 'kujana',
  baseType: 'kujana',
  level: 2,
  attack: 7,
  health: 12,
  rarity: 'Mythic',
  description: 'Avatar - Kujana',
  skills: [
    {
      id: 'heal-aura',
      name: 'Heal Aura',
      description: 'After attack, heal 2 damage from this Avatar',
      spektraCost: ['fire', 'fire', 'neutral', 'neutral'],
      damage: 7,
      effect: 'After attack, heal 2 damage from this Avatar'
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Boar Witch, Super Rare.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-015-MYTHIC'
};

export const crimson: AvatarCard = {
  id: 'kobar-101',
  name: 'Crimson',
  type: 'avatar',
  element: 'fire',
  subType: 'kobar',
  baseType: 'kobar',
  level: 2,
  attack: 0,
  health: 14,
  rarity: 'Common',
  description: 'Avatar - Kobar',
  skills: [
    {
      id: 'ignite',
      name: 'Ignite',
      description: 'Put 2 bleed counter into opponent Active Avatar',
      spektraCost: ['fire', 'fire'],
      damage: 0,
      effectType: 'bleed',
      effectValue: 2,
      effectTarget: 'opponent_active'
    },
    {
      id: 'inferno-burn',
      name: 'Inferno Burn',
      description: 'Player may discard a spektra card from spektra pile or used spektra pile. If the player does that, this Skill2Damage become 19',
      spektraCost: ['fire', 'fire', 'fire', 'fire'],
      damage: 9,
      effect: 'Player may discard a spektra card from spektra pile or used spektra pile. If the player does that, this Skill2Damage become 19'
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Crimson.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-016'
};

export const scarlet: AvatarCard = {
  id: 'borah-101',
  name: 'Scarlet',
  type: 'avatar',
  element: 'fire',
  subType: 'borah',
  baseType: 'borah',
  level: 2,
  attack: 2,
  health: 13,
  rarity: 'Common',
  description: 'Avatar - Borah',
  skills: [
    {
      id: 'flame-arrow',
      name: 'Flame Arrow',
      description: 'Flip a coin, if head, opponent defending Avatar get 2 Bleed Counters',
      spektraCost: ['fire', 'fire'],
      damage: 2,
      effect: 'Flip a coin, if head, opponent defending Avatar get 2 Bleed Counters'
    },
    {
      id: 'inferno-burn',
      name: 'Inferno Burn',
      description: 'Player may discard a spektra card from spektra pile or used spektra pile. If the player does that, this Skill2Damage become 19',
      spektraCost: ['fire', 'fire', 'fire', 'fire'],
      damage: 9,
      effect: 'Player may discard a spektra card from spektra pile or used spektra pile. If the player does that, this Skill2Damage become 19'
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Scarlet.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-017'
};

export const daisy: AvatarCard = {
  id: 'borah-102',
  name: 'Daisy',
  type: 'avatar',
  element: 'fire',
  subType: 'borah',
  baseType: 'borah',
  level: 2,
  attack: 5,
  health: 15,
  rarity: 'Common',
  description: 'Avatar - Borah',
  skills: [
    {
      id: 'pyro-kick',
      name: 'Pyro Kick',
      description: 'If you has 1 or less card in hand, this Skill1Damage become 6',
      spektraCost: ['fire', 'neutral'],
      damage: 5,
      effect: 'If you has 1 or less card in hand, this Skill1Damage become 6'
    },
    {
      id: 'burning-body',
      name: 'Burning Body',
      description: 'If opponent Active Avatar is wind Element Avatar, this Skill2 Damage become 13',
      spektraCost: ['fire', 'fire', 'neutral', 'neutral'],
      damage: 10,
      effect: 'If opponent Active Avatar is wind Element Avatar, this Skill2 Damage become 13'
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Daisy.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-018'
};

export const daisyMythic: AvatarCard = {
  id: 'borah-102-mythic',
  name: 'Daisy, Mythic',
  type: 'avatar',
  element: 'fire',
  subType: 'borah',
  baseType: 'borah',
  level: 2,
  attack: 5,
  health: 15,
  rarity: 'Mythic',
  description: 'Avatar - Borah',
  skills: [
    {
      id: 'pyro-kick',
      name: 'Pyro Kick',
      description: 'If you has 1 or less card in hand, this Skill1Damage become 6',
      spektraCost: ['fire', 'neutral'],
      damage: 5,
      effect: 'If you has 1 or less card in hand, this Skill1Damage become 6'
    },
    {
      id: 'burning-body',
      name: 'Burning Body',
      description: 'If opponent Active Avatar is wind Element Avatar, this Skill2 Damage become 13',
      spektraCost: ['fire', 'fire', 'neutral', 'neutral'],
      damage: 10,
      effect: 'If opponent Active Avatar is wind Element Avatar, this Skill2 Damage become 13'
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Daisy, Super Rare.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-018-MYTHIC'
};

export const radja: AvatarCard = {
  id: 'kobar-102',
  name: 'Radja',
  type: 'avatar',
  element: 'fire',
  subType: 'kobar',
  baseType: 'kobar',
  level: 2,
  attack: 4,
  health: 16,
  rarity: 'Common',
  description: 'Avatar - Kobar',
  skills: [
    {
      id: 'pyro-punch',
      name: 'Pyro Punch',
      description: 'If you has 1 or less card in hand, this Skill1Damage become 5',
      spektraCost: ['fire', 'neutral'],
      damage: 4,
      effect: 'If you has 1 or less card in hand, this Skill1Damage become 5'
    },
    {
      id: 'burning-body',
      name: 'Burning Body',
      description: 'If opponent Active Avatar is wind Element Avatar, this Skill2 Damage become 111',
      spektraCost: ['fire', 'fire', 'neutral', 'neutral'],
      damage: 10,
      effect: 'If opponent Active Avatar is wind Element Avatar, this Skill2 Damage become 111'
    }
  ],
  imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Radja.webp',
  expansion: 'Fire and Water',
  cardNumber: 'RED-019'
};

// Card Arrays for easier access
export const redElementalLevel1AvatarCards: AvatarCard[] = [
  borahTraineeA,
  borahTraineeB,
  borahTraineeC,
  kobarTraineeA,
  kobarTraineeB,
  kobarTraineeC,
  repoGirl,
  shamanKuhaka,
  shamanKujana,
  thug,
  witchTrainee
];

export const redElementalLevel2AvatarCards: AvatarCard[] = [
  banaspati,
  banaspatiFemale,
  boarBerserker,
  boarWitch,
  boarWitchMythic,
  crimson,
  scarlet,
  daisy,
  daisyMythic,
  radja
];

export const redElementalSpellCards: ActionCard[] = [];

// All cards
export const redElementalCards = [
  ...redElementalLevel1AvatarCards,
  ...redElementalLevel2AvatarCards,
  ...redElementalSpellCards
];
