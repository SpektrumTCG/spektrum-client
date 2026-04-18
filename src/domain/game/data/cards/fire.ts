import { AvatarCard, ActionCard, FieldCard } from '../../types/card';

// New Fire Elemental Avatar Cards
export const newFireAvatarCards: AvatarCard[] = [
  {
    id: 'fire-witch-trainee',
    name: 'Witch Trainee',
    type: 'avatar',
    element: 'fire',
    subType: 'kujana',
    level: 1,
    attack: 2,
    health: 6,
    rarity: 'Common',
    description: 'Avatar - Kujana Witch',
    skills: [
      {
        id: 'doomflare',
        name: 'Doomflare',
        description: 'This attack damage become 3 if the opponent is Borah or Kobar type Avatar',
        spektraCost: ['fire', 'fire'],
        damage: 2,
        conditions: [
          {
            type: 'opponent_tribe',
            value: ['borah', 'kobar'],
            effect: {
              type: 'damage_modification',
              value: 3
            },
          },
        ]
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Witch Trainee.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-001'
  },
  {
    id: 'fire-shaman-kujana',
    name: 'Shaman',
    type: 'avatar',
    element: 'fire',
    subType: 'kujana',
    level: 1,
    attack: 1,
    health: 6,
    rarity: 'Common',
    description: 'Avatar - Kujana Witch',
    skills: [
      {
        id: 'spread-flame',
        name: 'Spread Flame',
        description: 'Deal 1 damage to opponent active avatar and 1 damage to each opponent reserve avatar.',
        spektraCost: ['fire', 'fire'],
        damage: 1,
        target: 'opponent_active_and_all_reserve',
        conditions: []
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Shaman B.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-002'
  },
  {
    id: 'fire-repo-girl',
    name: 'Repo Girl',
    type: 'avatar',
    element: 'fire',
    subType: 'kujana',
    level: 1,
    attack: 2,
    health: 5,
    rarity: 'Common',
    description: 'Avatar - Kujana Human',
    skills: [
      {
        id: 'kick',
        name: 'Kick',
        description: 'Basic attack',
        spektraCost: ['fire', 'fire'],
        damage: 2,
        conditions: []
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Repo Girl.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-003'
  },
  {
    id: 'fire-thug',
    name: 'Thug',
    type: 'avatar',
    element: 'fire',
    subType: 'kuhaka',
    level: 1,
    attack: 1,
    health: 5,
    rarity: 'Common',
    description: 'Avatar - Kuhaka Human',
    skills: [
      {
        id: 'kick',
        name: 'Kick',
        description: 'Basic attack',
        spektraCost: ['neutral'],
        damage: 1,
        conditions: []
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Thug A.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-004'
  },
  {
    id: 'fire-shaman-kuhaka',
    name: 'Shaman',
    type: 'avatar',
    element: 'fire',
    subType: 'kuhaka',
    level: 1,
    attack: 3,
    health: 6,
    rarity: 'Common',
    description: 'Avatar - Kuhaka Witch',
    skills: [
      {
        id: 'concentrated-flame',
        name: 'Concentrated Flame',
        description: 'Direct flame attack',
        spektraCost: ['fire', 'fire'],
        damage: 3,
        conditions: []
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Shaman A.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-005'
  },
  {
    id: 'fire-goldie',
    name: 'Goldie',
    type: 'avatar',
    element: 'fire',
    subType: 'kuhaka',
    level: 1,
    attack: 1,
    health: 8,
    rarity: 'Common',
    description: 'Avatar - Kuhaka Human',
    skills: [
      {
        id: 'body-slam',
        name: 'Body Slam',
        description: 'Physical attack',
        spektraCost: ['fire'],
        damage: 1,
        conditions: []
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Goldie.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-006'
  },
  {
    id: 'fire-kobar-trainee-a',
    name: 'Kobar Trainee A',
    type: 'avatar',
    element: 'fire',
    subType: 'kobar',
    level: 1,
    attack: 4,
    health: 6,
    rarity: 'Common',
    description: 'Avatar - Kobar Fighter',
    skills: [
      {
        id: 'reckless-fire',
        name: 'Reckless Fire',
        description: 'Deal 1 damage to self after attack.',
        spektraCost: ['fire', 'fire'],
        damage: 4,
        conditions: [
          {
            type: 'self_damage',
            value: 1,
            effect: {
              type: 'damage_self',
              value: 1
            },
          },
        ]
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Kobar Trainee A.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-007'
  },
  {
    id: 'fire-kobar-trainee-b',
    name: 'Kobar Trainee B',
    type: 'avatar',
    element: 'fire',
    subType: 'kobar',
    level: 1,
    attack: 2,
    health: 5,
    rarity: 'Common',
    description: 'Avatar - Kobar Fighter',
    skills: [
      {
        id: 'ash-flick',
        name: 'Ash Flick',
        description: 'Basic fire attack',
        spektraCost: ['fire'],
        damage: 2,
        conditions: []
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Kobar Trainee B.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-008'
  },
  {
    id: 'fire-kobar-trainee-c',
    name: 'Kobar Trainee C',
    type: 'avatar',
    element: 'fire',
    subType: 'kobar',
    level: 1,
    attack: 2,
    health: 5,
    rarity: 'Common',
    description: 'Avatar - Kobar Fighter',
    skills: [
      {
        id: 'wildbone-blade',
        name: 'Wildbone Blade',
        description: 'This attack damage become 3 if the opponent is Air Element Avatar',
        spektraCost: ['fire', 'fire'],
        damage: 2,
        conditions: [
          {
            type: 'opponent_element',
            value: ['air'],
            effect: {
              type: 'damage_modification',
              value: 3
            },
          },
        ]
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Kobar Trainee C.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-009'
  },
  {
    id: 'fire-borah-trainee-a',
    name: 'Borah Trainee A',
    type: 'avatar',
    element: 'fire',
    subType: 'borah',
    level: 1,
    attack: 1,
    health: 5,
    rarity: 'Common',
    description: 'Avatar - Borah Fighter',
    skills: [
      {
        id: 'kick',
        name: 'Kick',
        description: 'Basic attack',
        spektraCost: ['neutral'],
        damage: 1,
        conditions: []
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Borah Trainee A.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-010'
  },
  {
    id: 'fire-borah-trainee-b',
    name: 'Borah Trainee B',
    type: 'avatar',
    element: 'fire',
    subType: 'borah',
    level: 1,
    attack: 1,
    health: 5,
    rarity: 'Common',
    description: 'Avatar - Borah Fighter',
    skills: [
      {
        id: 'burning-step',
        name: 'Burning Step',
        description: 'Deal 1 damage to opponent active avatar and 1 damage to each opponent reserve avatar.',
        spektraCost: ['fire', 'neutral'],
        damage: 1,
        target: 'opponent_active_and_all_reserve',
        conditions: []
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Borah Trainee B.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-011'
  },
  {
    id: 'fire-borah-trainee-c',
    name: 'Borah Trainee C',
    type: 'avatar',
    element: 'fire',
    subType: 'borah',
    level: 1,
    attack: 2,
    health: 6,
    rarity: 'Common',
    description: 'Avatar - Borah Fighter',
    skills: [
      {
        id: 'ash-flick',
        name: 'Ash Flick',
        description: 'Basic fire attack',
        spektraCost: ['fire', 'fire'],
        damage: 2,
        conditions: []
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Borah Trainee C.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-012'
  },
  {
    id: 'fire-radja',
    name: 'Radja',
    type: 'avatar',
    element: 'fire',
    subType: 'kobar',
    level: 2,
    attack: 5,
    health: 17,
    rarity: 'Rare',
    description: 'Avatar - Kobar Fighter',
    skills: [
      {
        id: 'pyro-punch',
        name: 'Pyro Punch',
        description: 'Powerful fire punch',
        spektraCost: ['fire', 'neutral'],
        damage: 5,
        conditions: []
      },
      {
        id: 'burning-body',
        name: 'Burning Body',
        description: 'This attack damage become 13 if the opponent is Air Element Avatar',
        spektraCost: ['fire', 'fire', 'neutral', 'neutral'],
        damage: 9,
        conditions: [
          {
            type: 'opponent_element',
            value: ['air'],
            effect: {
              type: 'damage_modification',
              value: 13
            },
          },
        ]
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Radja.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-013'
  },
  {
    id: 'fire-radja-super-rare',
    name: 'Radja',
    type: 'avatar',
    element: 'fire',
    subType: 'kobar',
    level: 2,
    attack: 5,
    health: 17,
    rarity: 'Super Rare',
    description: 'Avatar - Kobar Fighter (Rare Variant)',
    skills: [
      {
        id: 'pyro-punch',
        name: 'Pyro Punch',
        description: 'Powerful fire punch',
        spektraCost: ['fire', 'neutral'],
        damage: 5,
        conditions: []
      },
      {
        id: 'burning-body',
        name: 'Burning Body',
        description: 'This attack damage become 13 if the opponent is Air Element Avatar',
        spektraCost: ['fire', 'fire', 'neutral', 'neutral'],
        damage: 9,
        conditions: [
          {
            type: 'opponent_element',
            value: ['air'],
            effect: {
              type: 'damage_modification',
              value: 13
            },
          },
        ]
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Radja, Rare.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-014'
  },

  {
    id: 'fire-mera',
    name: 'Mera',
    type: 'avatar',
    element: 'fire',
    subType: 'kobar',
    level: 2,
    attack: 3,
    health: 13,
    rarity: 'Rare',
    description: 'Avatar - Kobar Fighter',
    skills: [
      {
        id: 'klaw',
        name: 'Klaw',
        description: 'Sharp claw attack',
        spektraCost: ['fire', 'neutral'],
        damage: 3,
        conditions: []
      },
      {
        id: 'revenge-fire',
        name: 'Revenge Fire',
        description: 'This attack damage become 13 if the opponent is Kuhaka or Kujana type Avatar',
        spektraCost: ['fire', 'fire', 'fire'],
        damage: 8,
        conditions: [
          {
            type: 'opponent_tribe',
            value: ['kuhaka', 'kujana'],
            effect: {
              type: 'damage_modification',
              value: 13
            },
          },
        ]
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Mera.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-015'
  },
  {
    id: 'fire-crimson',
    name: 'Crimson',
    type: 'avatar',
    element: 'fire',
    subType: 'kobar',
    level: 2,
    attack: 18,
    health: 15,
    rarity: 'Rare',
    description: 'Avatar - Kobar Fighter',
    skills: [
      {
        id: 'ember',
        name: 'Ember',
        description: 'Basic fire attack',
        spektraCost: ['fire'],
        damage: 3,
        conditions: []
      },
      {
        id: 'infernal-crush',
        name: 'Infernal Crush',
        description: 'Deal 4 damage to this Avatar after using this skill',
        spektraCost: ['fire', 'fire', 'neutral', 'neutral', 'neutral'],
        damage: 18,
        conditions: [
          {
            type: 'self_damage',
            value: 4,
            effect: {
              type: 'damage_self',
              value: 4
            },
          },
        ]
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Crimson.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-016'
  },
  {
    id: 'fire-dara',
    name: 'Dara',
    type: 'avatar',
    element: 'fire',
    subType: 'borah',
    level: 2,
    attack: 3,
    health: 12,
    rarity: 'Rare',
    description: 'Avatar - Borah Fighter',
    skills: [
      {
        id: 'klaw',
        name: 'Klaw',
        description: 'Sharp claw attack',
        spektraCost: ['neutral'],
        damage: 3,
        conditions: []
      },
      {
        id: 'annihilation',
        name: 'Annihilation',
        description: 'This attack damage become 20 if the opponent is Kuhaka or Kujana type Avatar',
        spektraCost: ['fire', 'fire', 'fire', 'fire', 'neutral'],
        damage: 15,
        conditions: [
          {
            type: 'opponent_tribe',
            value: ['kuhaka', 'kujana'],
            effect: {
              type: 'damage_modification',
              value: 20
            },
          },
        ]
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Dara.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-017'
  },
  {
    id: 'fire-daisy',
    name: 'Daisy',
    type: 'avatar',
    element: 'fire',
    subType: 'borah',
    level: 2,
    attack: 6,
    health: 16,
    rarity: 'Rare',
    description: 'Avatar - Borah Fighter',
    skills: [
      {
        id: 'spit-fire',
        name: 'Spit Fire',
        description: 'Fire projectile attack',
        spektraCost: ['fire', 'neutral'],
        damage: 6,
        conditions: []
      },
      {
        id: 'spread-burning',
        name: 'Spread Burning',
        description: 'Deal 10 damage to opponent active avatar and 2 damage to each opponent reserve avatar.',
        spektraCost: ['fire', 'neutral', 'neutral', 'neutral'],
        damage: 10,
        target: 'opponent_active_and_all_reserve',
        conditions: []
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Daisy.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-018'
  },
  {
    id: 'fire-daisy-mythic',
    name: 'Daisy',
    type: 'avatar',
    element: 'fire',
    subType: 'borah',
    level: 2,
    attack: 6,
    health: 16,
    rarity: 'Mythic',
    description: 'Avatar - Borah Fighter',
    skills: [
      {
        id: 'spit-fire',
        name: 'Spit Fire',
        description: 'Fire projectile attack',
        spektraCost: ['fire', 'neutral'],
        damage: 6,
        conditions: []
      },
      {
        id: 'spread-burning',
        name: 'Spread Burning',
        description: 'Deal 10 damage to opponent active avatar and 2 damage to each opponent reserve avatar.',
        spektraCost: ['fire', 'neutral', 'neutral', 'neutral'],
        damage: 10,
        target: 'opponent_active_and_all_reserve',
        conditions: []
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Daisy, Super Rare.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-019'
  },
  {
    id: 'fire-scarlet',
    name: 'Scarlet',
    type: 'avatar',
    element: 'fire',
    subType: 'borah',
    level: 2,
    attack: 4,
    health: 14,
    rarity: 'Rare',
    description: 'Avatar - Borah Fighter',
    skills: [
      {
        id: 'mini-dagger',
        name: 'Mini Dagger',
        description: 'Quick dagger strike',
        spektraCost: ['fire', 'neutral'],
        damage: 4,
        conditions: []
      },
      {
        id: 'infernal-arrow',
        name: 'Infernal Arrow',
        description: 'Deal 3 damage to this Avatar after using this skill',
        spektraCost: ['fire', 'fire', 'fire', 'neutral'],
        damage: 15,
        conditions: [
          {
            type: 'self_damage',
            value: 3,
            effect: {
              type: 'damage_self',
              value: 3
            },
          },
        ]
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Scarlet.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-020'
  },
  {
    id: 'fire-blood-eater',
    name: 'Blood Eater',
    type: 'avatar',
    element: 'fire',
    subType: 'kujana',
    level: 2,
    attack: 2,
    health: 16,
    rarity: 'Rare',
    description: 'Avatar - Kujana Witch',
    skills: [
      {
        id: 'whirl-kick',
        name: 'Whirl Kick',
        description: 'Deal 2 damage to opponent active avatar and 1 damage to each opponent reserve avatar.',
        spektraCost: ['fire', 'neutral'],
        damage: 2,
        target: 'opponent_active_and_all_reserve',
        conditions: []
      },
      {
        id: 'rushing-kick',
        name: 'Rushing Kick',
        description: 'This attack damage become 15 if the opponent is Borah or Kobar type Avatar',
        spektraCost: ['fire', 'fire', 'fire', 'fire'],
        damage: 12,
        conditions: [
          {
            type: 'opponent_tribe',
            value: ['borah', 'kobar'],
            effect: {
              type: 'damage_modification',
              value: 15
            },
          },
        ]
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Blood Eater.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-021'
  },
  {
    id: 'fire-blood-eater-rare',
    name: 'Blood Eater',
    type: 'avatar',
    element: 'fire',
    subType: 'kujana',
    level: 2,
    attack: 2,
    health: 16,
    rarity: 'Super Rare',
    description: 'Avatar - Kujana Witch (Rare Variant)',
    skills: [
      {
        id: 'whirl-kick',
        name: 'Whirl Kick',
        description: 'Deal 2 damage to opponent active avatar and 1 damage to each opponent reserve avatar.',
        spektraCost: ['fire', 'neutral'],
        damage: 2,
        target: 'opponent_active_and_all_reserve',
        conditions: []
      },
      {
        id: 'rushing-kick',
        name: 'Rushing Kick',
        description: 'This attack damage become 15 if the opponent is Borah or Kobar type Avatar',
        spektraCost: ['fire', 'fire', 'fire', 'fire'],
        damage: 12,
        conditions: [
          {
            type: 'opponent_tribe',
            value: ['borah', 'kobar'],
            effect: {
              type: 'damage_modification',
              value: 15
            },
          },
        ]
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Blood Eater, Rare.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-022'
  },
  {
    id: 'fire-blood-demon',
    name: 'Blood Demon',
    type: 'avatar',
    element: 'fire',
    subType: 'kuhaka',
    level: 2,
    attack: 13,
    health: 13,
    rarity: 'Rare',
    description: 'Avatar - Kuhaka Berserker',
    passiveSkill: {
      id: 'berserker-burnout',
      name: 'Berserker Burnout',
      description: 'Everytime before your draw phase, deal 1 damage to this Avatar.',
      spektraCost: [],
      damage: 0,
      effect: 'Everytime before your draw phase, deal 1 damage to this Avatar.',
      scope: 'active'
    },
    skills: [
      {
        id: 'bloody-klaw',
        name: 'Bloody Klaw',
        description: 'This attack damage become 20 if the opponent is Borah or Kobar type Avatar',
        spektraCost: ['fire', 'fire', 'fire', 'fire', 'neutral'],
        damage: 13,
        conditions: [
          {
            type: 'opponent_tribe',
            value: ['borah', 'kobar'],
            effect: {
              type: 'damage_modification',
              value: 20
            },
          },
        ]
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Blood Demon.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-023'
  },
  {
    id: 'fire-blood-demon-rare',
    name: 'Blood Demon',
    type: 'avatar',
    element: 'fire',
    subType: 'kuhaka',
    level: 2,
    attack: 13,
    health: 13,
    rarity: 'Super Rare',
    description: 'Avatar - Kuhaka Berserker (Rare Variant)',
    passiveSkill: {
      id: 'berserker-burnout',
      name: 'Berserker Burnout',
      description: 'Everytime before your draw phase, deal 1 damage to this Avatar.',
      spektraCost: [],
      damage: 0,
      effect: 'Everytime before your draw phase, deal 1 damage to this Avatar.',
      scope: 'active'
    },
    skills: [
      {
        id: 'bloody-klaw',
        name: 'Bloody Klaw',
        description: 'This attack damage become 20 if the opponent is Borah or Kobar type Avatar',
        spektraCost: ['fire', 'fire', 'fire', 'fire', 'neutral'],
        damage: 13,
        conditions: [
          {
            type: 'opponent_tribe',
            value: ['borah', 'kobar'],
            effect: {
              type: 'damage_modification',
              value: 20
            },
          },
        ]
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Blood Demon, Rare.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-024'
  },
  {
    id: 'fire-boar-berserker',
    name: 'Boar Berserker',
    type: 'avatar',
    element: 'fire',
    subType: 'kuhaka',
    level: 2,
    attack: 6,
    health: 20,
    rarity: 'Rare',
    description: 'Avatar - Kuhaka Berserker',
    skills: [
      {
        id: 'body-slam',
        name: 'Body Slam',
        description: 'Deal 1 damage to this Avatar after using this skill.',
        spektraCost: ['fire', 'fire'],
        damage: 6,
        conditions: [
          {
            type: 'self_damage',
            value: 1,
            effect: {
              type: 'damage_self',
              value: 1
            },
          },
        ]
      },
      {
        id: 'bloody-klaw',
        name: 'Bloody Klaw',
        description: 'Deal 1 damage to this Avatar after using this skill.',
        spektraCost: ['fire', 'neutral', 'neutral', 'neutral', 'neutral'],
        damage: 20,
        conditions: [
          {
            type: 'self_damage',
            value: 1,
            effect: {
              type: 'damage_self',
              value: 1
            },
          },
        ]
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Boar Berserker.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-025'
  },
  {
    id: 'fire-banaspati',
    name: 'Banaspati',
    type: 'avatar',
    element: 'fire',
    subType: 'kuhaka',
    level: 2,
    attack: 3,
    health: 17,
    rarity: 'Rare',
    description: 'Avatar - Kuhaka Pyromancer',
    skills: [
      {
        id: 'ember',
        name: 'Ember',
        description: 'Basic fire spell',
        spektraCost: ['fire', 'neutral'],
        damage: 3,
        conditions: []
      },
      {
        id: 'spread-ember',
        name: 'Spread Ember',
        description: 'Put 3 damage into all opponent reserve avatars.',
        spektraCost: ['fire', 'fire', 'neutral', 'neutral'],
        damage: 13,
        target: 'all_opponent_reserve',
        conditions: []
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Banaspati.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-026'
  },
  {
    id: 'fire-boar-witch',
    name: 'Boar Witch',
    type: 'avatar',
    element: 'fire',
    subType: 'kujana',
    level: 2,
    attack: 7,
    health: 13,
    rarity: 'Rare',
    description: 'Avatar - Kujana Witch',
    passiveSkill: {
      id: 'sacred-fire',
      name: 'Sacred Fire',
      description: 'Your active Fire Element Avatar gets +2 attack damage in their skills.',
      spektraCost: [],
      damage: 0,
      modifierType: 'skill_damage_boost',
      modifierValue: 2,
      modifierCondition: 'fire',
      scope: 'active_or_reserve'
    },
    skills: [
      {
        id: 'purified-fire',
        name: 'Purified Fire',
        description: 'Deal 7 damage. If this avatar has damage counters, heal 2 damage.',
        spektraCost: ['fire', 'fire', 'neutral', 'neutral'],
        damage: 7,
        effectType: 'heal',
        effectValue: 2,
        effectTarget: 'player_active',
        condition: 'damage_to_self',
        conditionValue: 1
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Boar Witch.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-027'
  },
  {
    id: 'fire-boar-witch-mythic',
    name: 'Boar Witch',
    type: 'avatar',
    element: 'fire',
    subType: 'kujana',
    level: 2,
    attack: 7,
    health: 13,
    rarity: 'Mythic',
    description: 'Avatar - Kujana Witch',
    passiveSkill: {
      id: 'sacred-fire',
      name: 'Sacred Fire',
      description: 'Your active Fire Element Avatar gets +2 attack damage in their skills.',
      spektraCost: [],
      damage: 0,
      modifierType: 'skill_damage_boost',
      modifierValue: 2,
      modifierCondition: 'fire',
      scope: 'active_or_reserve'
    },
    skills: [
      {
        id: 'purified-fire',
        name: 'Purified Fire',
        description: 'Deal 7 damage. If this avatar has damage counters, heal 2 damage.',
        spektraCost: ['fire', 'fire', 'neutral', 'neutral'],
        damage: 7,
        effectType: 'heal',
        effectValue: 2,
        effectTarget: 'player_active',
        condition: 'damage_to_self',
        conditionValue: 1
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Boar Witch, Super Rare.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-028'
  },
  {
    id: 'fire-banaspati-female',
    name: 'Banaspati',
    type: 'avatar',
    element: 'fire',
    subType: 'kujana',
    level: 2,
    attack: 3,
    health: 15,
    rarity: 'Rare',
    description: 'Avatar - Kujana Pyromancer',
    skills: [
      {
        id: 'ember',
        name: 'Ember',
        description: 'Basic fire spell',
        spektraCost: ['fire', 'neutral'],
        damage: 3,
        conditions: []
      },
      {
        id: 'burning-tips',
        name: 'Burning Tips',
        description: 'This attack damage become 12 if the opponent is Air Element Avatar',
        spektraCost: ['fire', 'fire', 'neutral', 'neutral'],
        damage: 8,
        conditions: [
          {
            type: 'opponent_element',
            value: ['air'],
            effect: {
              type: 'damage_modification',
              value: 12
            },
          },
        ]
      },
    ],
    imagePath: '/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Banaspati Female.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-029'
  },
];

// Fire Elemental Spell Cards
export const newFireSpellCards: ActionCard[] = [
  {
    id: 'flame-flicker',
    cardNumber: 'GEN-030',
    name: 'Flame Flicker',
    type: 'spell',
    element: 'fire',
    spektraCost: ['fire'],
    description: 'Deal 2 damage to one enemy Avatar.',
    art: '/cards/GENESIS/fire/spells/Red Elemental Spell for Apps_Spell - Flame Flicker.webp',
    rarity: 'Common',
    expansion: 'Fire and Water',
    subType: 'damage',
    effectType: 'damage',
    effectValue: 2,
    effectTarget: 'select_opponent_avatar'
  },
  {
    id: 'heat-resonance',
    cardNumber: 'GEN-031',
    name: 'Heat Resonance',
    type: 'spell',
    element: 'fire',
    spektraCost: ['fire', 'neutral'],
    description: 'Deal 1 damage to opponent active avatar and 1 damage to each opponent reserve avatar.',
    art: '/cards/GENESIS/fire/spells/Red Elemental Spell for Apps_Spell - Heat Resonance.webp',
    rarity: 'Common',
    expansion: 'Fire and Water',
    subType: 'damage',
    effectType: 'damage',
    effectValue: 1,
    effectValue2: 1,
    effectTarget: 'all_opponent_avatars'
  },
  {
    id: 'inferno-fuel',
    cardNumber: 'GEN-032',
    name: 'Inferno Fuel',
    type: 'spell',
    element: 'fire',
    spektraCost: ['fire', 'fire'],
    description: 'Heal 2 HP from your active avatar.',
    art: '/cards/GENESIS/fire/spells/Red Elemental Spell for Apps_Spell - Inferno Fuel.webp',
    rarity: 'Common',
    expansion: 'Fire and Water',
    subType: 'healing',
    effectType: 'heal',
    effectValue: 2,
    effectTarget: 'player_active'
  },
  {
    id: 'searing-flame',
    cardNumber: 'GEN-033',
    name: 'Searing Flame',
    type: 'spell',
    element: 'fire',
    spektraCost: ['fire', 'fire', 'neutral'],
    description: 'Deal 2 damage to all opponent active and reserve avatars.',
    art: '/cards/GENESIS/fire/spells/Red Elemental Spell for Apps_Spell - Searing Flame.webp',
    rarity: 'Uncommon',
    expansion: 'Fire and Water',
    subType: 'damage',
    effectType: 'damage',
    effectValue: 2,
    effectTarget: 'all_opponent_avatars'
  },
  {
    id: 'burning-sight',
    cardNumber: 'GEN-034',
    name: 'Burning Sight',
    type: 'spell',
    element: 'fire',
    spektraCost: ['fire', 'fire', 'neutral', 'neutral'],
    description: 'Draw 2 card from your deck.',
    art: '/cards/GENESIS/fire/spells/Red Elemental Spell for Apps_Spell - Burning Sight.webp',
    rarity: 'Uncommon',
    expansion: 'Fire and Water',
    subType: 'draw',
    effectType: 'draw',
    effectValue: 2,
    effectTarget: 'player'
  },
  {
    id: 'wild-combustion',
    cardNumber: 'GEN-035',
    name: 'Wild Combustion',
    type: 'spell',
    element: 'fire',
    spektraCost: ['fire', 'fire', 'fire', 'neutral'],
    description: 'Deal 5 damage to enemy Active Avatar.',
    art: '/cards/GENESIS/fire/spells/Red Elemental Spell for Apps_Spell - Wild Combustion.webp',
    rarity: 'Super Rare',
    expansion: 'Fire and Water',
    subType: 'damage',
    effectType: 'damage',
    effectValue: 5,
    effectTarget: 'opponent_active'
  },
  {
    id: 'flame-of-devastation',
    cardNumber: 'GEN-036',
    name: 'Flame of Devastation',
    type: 'spell',
    element: 'fire',
    spektraCost: ['fire', 'fire', 'fire', 'fire', 'neutral'],
    description: 'Deal 5 damage into 1 of your opponent avatar.',
    art: '/cards/GENESIS/fire/spells/Red Elemental Spell for Apps_Spell - Flame of Devastation.webp',
    rarity: 'Super Rare',
    expansion: 'Fire and Water',
    subType: 'damage',
    effectType: 'damage',
    effectValue: 5,
    effectTarget: 'select_opponent_avatar'
  },
];

// Fire Elemental Quick Spell Cards
export const newFireQuickSpellCards: ActionCard[] = [
  {
    id: 'ember-spark',
    cardNumber: 'GEN-037',
    name: 'Ember Spark',
    type: 'quickSpell',
    element: 'fire',
    spektraCost: ['fire'],
    description: 'Deal 1 damage to one enemy Avatar.',
    art: '/cards/GENESIS/fire/quickspells/Red Elemental Spell for Apps_Quick Spell - Ember Spark.webp',
    rarity: 'Common',
    expansion: 'Fire and Water',
    subType: 'damage',
    effectType: 'damage',
    effectValue: 1,
    effectTarget: 'select_opponent_avatar'
  },
  {
    id: 'volcanic-boost',
    cardNumber: 'GEN-038',
    name: 'Volcanic Boost',
    type: 'quickSpell',
    element: 'fire',
    spektraCost: ['fire', 'neutral'],
    description: 'Deal 1 damage to opponent active avatar and 1 damage to one selected active or reserve avatar.',
    art: '/cards/GENESIS/fire/quickspells/Red Elemental Spell for Apps_Quick Spell - Volcanic Boost.webp',
    rarity: 'Common',
    expansion: 'Fire and Water',
    subType: 'damage',
    effectType: 'damage',
    effectValue: 1,
    effectValue2: 1,
    effectTarget: 'select_opponent_avatar'
  },
  {
    id: 'spark-shield',
    cardNumber: 'GEN-039',
    name: 'Spark Shield',
    type: 'quickSpell',
    element: 'fire',
    spektraCost: ['fire', 'neutral', 'neutral'],
    description: 'Target avatar get 1 shield counter.',
    art: '/cards/GENESIS/fire/quickspells/Red Elemental Spell for Apps_Quick Spell - Spark Shield.webp',
    rarity: 'Uncommon',
    expansion: 'Fire and Water',
    subType: 'equipment',
    effectType: 'shield',
    effectValue: 1,
    effectTarget: 'select_player_avatar'
  },
];

// Fire Elemental Ritual Armor Cards
export const newFireRitualArmorCards: ActionCard[] = [
  {
    id: 'burning-armor',
    cardNumber: 'GEN-040',
    name: 'Burning Armor',
    type: 'ritualArmor',
    element: 'fire',
    spektraCost: ['fire', 'fire', 'fire', 'fire'],
    description: 'Equipped avatar gain +2 damage in their skills',
    art: '/cards/GENESIS/fire/ritualarmor/Red Elemental Spell for Apps_Ritual Armor - Burning Armor.webp',
    rarity: 'Super Rare',
    expansion: 'Fire and Water',
    subType: 'equipment',
    skill1: {
      id: 'burning-armor-passive',
      name: 'Burning Armor',
      description: 'Equipped avatar gains +2 damage to all their skills',
      spektraCost: [],
      damage: 0,
      modifierType: 'skill_damage_boost',
      modifierValue: 2,
      modifierCondition: 'fire'
    }
  },
  {
    id: 'boiled-armor',
    cardNumber: 'GEN-041',
    name: 'Boiled Armor',
    type: 'ritualArmor',
    element: 'fire',
    spektraCost: ['fire', 'fire', 'fire', 'fire', 'neutral'],
    description: 'Everytime equipped avatar get damage from opponent Avatar, this card deal 2 damage to that card.',
    art: '/cards/GENESIS/fire/ritualarmor/Red Elemental Spell for Apps_Ritual Armor - Boiled Armor.webp',
    rarity: 'Super Rare',
    expansion: 'Fire and Water',
    subType: 'equipment',
    skill1: {
      id: 'boiled-armor-reactive',
      name: 'Boiled Armor',
      description: 'When equipped avatar takes damage from opponent avatar, deal 2 damage back to that avatar',
      spektraCost: [],
      damage: 0,
      effectType: 'damage',
      effectValue: 2,
      effectTarget: 'opponent_active'
    }
  },
];

// Fire Elemental Field Cards
export const newFireFieldCards: FieldCard[] = [
  {
    id: 'burning-stage',
    cardNumber: 'GEN-042',
    name: 'Burning Stage',
    type: 'field',
    element: 'fire',
    spektraCost: ['fire', 'fire', 'fire', 'fire'],
    description: 'Fire element avatars on both sides gain +1 damage in their skills',
    passiveEffect: 'All Fire element avatars on field gain +1 damage to all their skills',
    affect1: 'Fire Avatar Damage +1',
    art: '/cards/GENESIS/fire/fieldspells/Red Elemental Spell for Apps_Field Spell - Burning Stage.webp',
    rarity: 'Uncommon',
    expansion: 'Fire and Water',
    modifierType: 'skill_damage_boost',
    modifierValue: 1,
    modifierCondition: 'fire'
  },
  {
    id: 'hell-stage',
    cardNumber: 'GEN-043',
    name: 'Hell Stage',
    type: 'field',
    element: 'fire',
    spektraCost: ['fire', 'fire', 'neutral', 'neutral'],
    description: 'Non Fire element avatar, get 1 damage everytime its user draw a card.',
    passiveEffect: 'Non-Fire element avatars take 1 damage whenever their controller draws a card',
    affect1: 'Draw Damage to Non-Fire',
    art: '/cards/GENESIS/fire/fieldspells/Red Elemental Spell for Apps_Field Spell - Hell Stage.webp',
    rarity: 'Super Rare',
    expansion: 'Fire and Water',
    trigger: {
      triggerType: 'on_draw',
      effectType: 'damage',
      effectValue: 1,
      condition: '!fire'
    }
  },
  {
    id: 'ashen-battlefield',
    cardNumber: 'GEN-044',
    name: 'Ashen Battlefield',
    type: 'field',
    element: 'fire',
    spektraCost: ['fire', 'neutral'],
    description: 'All Fire element avatar, heal 1 damage everytime its user draw a card.',
    passiveEffect: 'All Fire element avatars heal 1 damage whenever their controller draws a card',
    affect1: 'Draw Healing for Fire',
    art: '/cards/GENESIS/fire/fieldspells/Red Elemental Spell for Apps_Field Stage - Ashen Battlefield.webp',
    rarity: 'Common',
    expansion: 'Fire and Water',
    trigger: {
      triggerType: 'on_draw',
      effectType: 'heal',
      effectValue: 1,
      condition: 'fire'
    }
  },
];

// Export all new fire cards
export const allNewFireCards = [
  ...newFireAvatarCards,
  ...newFireSpellCards,
  ...newFireQuickSpellCards,
  ...newFireRitualArmorCards,
  ...newFireFieldCards
];