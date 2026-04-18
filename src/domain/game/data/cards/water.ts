import { AvatarCard, ActionCard, FieldCard } from '../../types/card';

export const blueElementalCards: AvatarCard[] = [
  {
    id: 'water-fishmonger',
    name: 'Fishmonger',
    type: 'avatar',
    element: 'water',
    subType: 'kujana',
    level: 1,
    attack: 1,
    health: 6,
    rarity: 'Common',
    description: 'Avatar - Kujana Human',
    skills: [
      {
        id: 'fish-knife',
        name: 'Fish Knife',
        description: 'This attack damage become 3 if the opponent is Borah or Kobar type avatar',
        spektraCost: ['water', 'neutral'],
        damage: 1,
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
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Fishmonger.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-045'
  },
  {
    id: 'water-shaman-kujana',
    name: 'Shaman',
    type: 'avatar',
    element: 'water',
    subType: 'kujana',
    level: 1,
    attack: 1,
    health: 6,
    rarity: 'Common',
    description: 'Avatar - Kujana Witch',
    skills: [
      {
        id: 'wild-torrent',
        name: 'Wild Torrent',
        description: 'Deal 1 damage to opponent active avatar and 1 damage to each opponent reserve avatar.',
        spektraCost: ['water', 'water'],
        damage: 1,
        target: 'opponent_active_and_all_reserve',
        conditions: []
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Shaman B.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-046'
  },
  {
    id: 'water-gal',
    name: 'Gal',
    type: 'avatar',
    element: 'water',
    subType: 'kujana',
    level: 1,
    attack: 2,
    health: 5,
    rarity: 'Common',
    description: 'Avatar - Kujana Human',
    skills: [
      {
        id: 'slap',
        name: 'Slap',
        description: 'Basic slap attack',
        spektraCost: ['water'],
        damage: 2,
        conditions: []
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Gal.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-047'
  },
  {
    id: 'water-fisherman',
    name: 'Fisherman',
    type: 'avatar',
    element: 'water',
    subType: 'kuhaka',
    level: 1,
    attack: 2,
    health: 8,
    rarity: 'Common',
    description: 'Avatar - Kuhaka Human',
    skills: [
      {
        id: 'whack',
        name: 'Whack',
        description: 'Physical strike',
        spektraCost: ['water', 'water'],
        damage: 2,
        conditions: []
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Fisherman.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-048'
  },
  {
    id: 'water-rich-thug',
    name: 'Rich Thug',
    type: 'avatar',
    element: 'water',
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
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Rich Tug.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-049'
  },
  {
    id: 'water-shaman-kuhaka',
    name: 'Shaman',
    type: 'avatar',
    element: 'water',
    subType: 'kuhaka',
    level: 1,
    attack: 3,
    health: 6,
    rarity: 'Common',
    description: 'Avatar - Kuhaka Witch',
    skills: [
      {
        id: 'concentrated-water',
        name: 'Concentrated Water',
        description: 'Deal 1 damage into this Avatar',
        spektraCost: ['water', 'water'],
        damage: 3,
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
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Shaman A.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-050'
  },
  {
    id: 'water-kobar-trainee-a',
    name: 'Kobar Trainee A',
    type: 'avatar',
    element: 'water',
    subType: 'kobar',
    level: 1,
    attack: 1,
    health: 6,
    rarity: 'Common',
    description: 'Avatar - Kobar Fighter',
    skills: [
      {
        id: 'punch',
        name: 'Punch',
        description: 'Basic attack',
        spektraCost: ['water'],
        damage: 1,
        conditions: []
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Kobar Trainee A.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-051'
  },
  {
    id: 'water-kobar-trainee-b',
    name: 'Kobar Trainee B',
    type: 'avatar',
    element: 'water',
    subType: 'kobar',
    level: 1,
    attack: 2,
    health: 5,
    rarity: 'Common',
    description: 'Avatar - Kobar Fighter',
    skills: [
      {
        id: 'kick',
        name: 'Kick',
        description: 'Basic attack',
        spektraCost: ['water', 'water'],
        damage: 2,
        conditions: []
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Kobar Trainee B.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-052'
  },
  {
    id: 'water-kobar-trainee-c',
    name: 'Kobar Trainee C',
    type: 'avatar',
    element: 'water',
    subType: 'kobar',
    level: 1,
    attack: 1,
    health: 5,
    rarity: 'Common',
    description: 'Avatar - Kobar Fighter',
    skills: [
      {
        id: 'wildbone-blade',
        name: 'Wildbone Blade',
        description: 'This attack damage become 3 if the opponent is Fire Element Avatar',
        spektraCost: ['water', 'water'],
        damage: 1,
        conditions: [
          {
            type: 'opponent_element',
            value: ['fire'],
            effect: {
              type: 'damage_modification',
              value: 3
            },
          },
        ]
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Kobar Trainee C.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-053'
  },
  {
    id: 'water-borah-trainee-a',
    name: 'Borah Trainee A',
    type: 'avatar',
    element: 'water',
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
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Borah Trainee A.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-054'
  },
  {
    id: 'water-borah-trainee-b',
    name: 'Borah Trainee B',
    type: 'avatar',
    element: 'water',
    subType: 'borah',
    level: 1,
    attack: 1,
    health: 5,
    rarity: 'Common',
    description: 'Avatar - Borah Fighter',
    skills: [
      {
        id: 'water-whip',
        name: 'Water Whip',
        description: 'Deal 1 damage to opponent active avatar and 1 damage to each opponent reserve avatar.',
        spektraCost: ['water', 'neutral'],
        damage: 1,
        target: 'opponent_active_and_all_reserve',
        conditions: []
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Borah Trainee B.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-055'
  },
  {
    id: 'water-borah-trainee-c',
    name: 'Borah Trainee C',
    type: 'avatar',
    element: 'water',
    subType: 'borah',
    level: 1,
    attack: 2,
    health: 6,
    rarity: 'Common',
    description: 'Avatar - Borah Fighter',
    skills: [
      {
        id: 'liquid-dance',
        name: 'Liquid Dance',
        description: 'Flowing water combat technique',
        spektraCost: ['water'],
        damage: 2,
        conditions: []
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Borah Trainee C.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-056'
  },
  {
    id: 'water-alice',
    name: 'Alice',
    type: 'avatar',
    element: 'water',
    subType: 'borah',
    level: 2,
    attack: 14,
    health: 12,
    rarity: 'Rare',
    description: 'Avatar - Borah Warrior',
    skills: [
      {
        id: 'ice-calibur',
        name: 'Ice Calibur',
        description: 'Powerful ice sword strike',
        spektraCost: ['water', 'neutral', 'neutral', 'neutral', 'neutral'],
        damage: 14,
        conditions: []
      }
    ],
    passiveSkill: {
      name: 'Frost Aura',
      description: 'Enemy Fire Element Avatars get -2 attack damage in their skills.',
      spektraCost: [],
      damage: 0,
      effect: 'Enemy Fire Element Avatars get -2 attack damage in their skills.',
      scope: 'active_or_reserve'
    },
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Alice.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-057'
  },
  {
    id: 'water-clear',
    name: 'Clear',
    type: 'avatar',
    element: 'water',
    subType: 'borah',
    level: 2,
    attack: 3,
    health: 14,
    rarity: 'Rare',
    description: 'Avatar - Borah Gunner',
    skills: [
      {
        id: 'shoot',
        name: 'Shoot',
        description: 'Basic ranged attack',
        spektraCost: ['neutral'],
        damage: 3,
        conditions: []
      },
      {
        id: 'water-turret',
        name: 'Water Turret',
        description: 'Put 8 damage counter into 1 of opponent Avatar',
        spektraCost: ['water', 'water', 'water', 'neutral'],
        damage: 8,
        conditions: []
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Clear.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-058'
  },
  {
    id: 'water-maya',
    name: 'Maya',
    type: 'avatar',
    element: 'water',
    subType: 'borah',
    level: 2,
    attack: 4,
    health: 16,
    rarity: 'Rare',
    description: 'Avatar - Borah Mage',
    skills: [
      {
        id: 'current-staff',
        name: 'Current Staff',
        description: 'Water staff attack',
        spektraCost: ['water', 'neutral'],
        damage: 4,
        conditions: []
      },
      {
        id: 'splashing-staff',
        name: 'Splashing Staff',
        description: 'Deal 8 damage to opponent active avatar and 4 damage to each opponent reserve avatar.',
        spektraCost: ['water', 'water', 'neutral', 'neutral'],
        damage: 8,
        target: 'opponent_active_and_all_reserve',
        conditions: []
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Maya.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-059'
  },
  {
    id: 'water-maya-rare',
    name: 'Maya',
    type: 'avatar',
    element: 'water',
    subType: 'borah',
    level: 2,
    attack: 4,
    health: 16,
    rarity: 'Super Rare',
    description: 'Avatar - Borah Mage',
    skills: [
      {
        id: 'current-staff',
        name: 'Current Staff',
        description: 'Water staff attack',
        spektraCost: ['water', 'neutral'],
        damage: 4,
        conditions: []
      },
      {
        id: 'splashing-staff',
        name: 'Splashing Staff',
        description: 'Deal 8 damage to opponent active avatar and 4 damage to each opponent reserve avatar.',
        spektraCost: ['water', 'water', 'neutral', 'neutral'],
        damage: 8,
        target: 'opponent_active_and_all_reserve',
        conditions: []
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Maya, Rare.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-060'
  },
  {
    id: 'water-arctic',
    name: 'Arctic',
    type: 'avatar',
    element: 'water',
    subType: 'kobar',
    level: 2,
    attack: 5,
    health: 15,
    rarity: 'Rare',
    description: 'Avatar - Kobar Assassin',
    skills: [
      {
        id: 'ice-dagger',
        name: 'Ice Dagger',
        description: 'Ice blade attack',
        spektraCost: ['water', 'neutral'],
        damage: 5,
        conditions: []
      },
      {
        id: 'ice-blade',
        name: 'Ice Blade',
        description: 'If you opponent active avatar has 10 or lower HP, this attack become 10',
        spektraCost: ['water', 'neutral', 'neutral'],
        damage: 7,
        conditions: [
          {
            type: 'opponent_hp',
            value: 10,
            effect: {
              type: 'damage_modification',
              value: 10
            },
          },
        ]
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Arctic.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-061'
  },
  {
    id: 'water-langit',
    name: 'Langit',
    type: 'avatar',
    element: 'water',
    subType: 'kobar',
    level: 2,
    attack: 2,
    health: 13,
    rarity: 'Rare',
    description: 'Avatar - Kobar Gunner',
    skills: [
      {
        id: 'water-gun',
        name: 'Water Gun',
        description: 'Water projectile attack',
        spektraCost: ['neutral'],
        damage: 2,
        conditions: []
      },
      {
        id: 'water-cannon',
        name: 'Water Cannon',
        description: 'If you dont have any card in hand, draw a card',
        spektraCost: ['water', 'water', 'neutral'],
        damage: 7,
        conditions: [
          {
            type: 'hand_empty',
            value: true,
            effect: {
              type: 'draw_card',
              value: 1
            },
          },
        ]
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Langit.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-062'
  },
  {
    id: 'water-sapphire',
    name: 'Sapphire',
    type: 'avatar',
    element: 'water',
    subType: 'kobar',
    level: 2,
    attack: 3,
    health: 16,
    rarity: 'Rare',
    description: 'Avatar - Kobar Dancer',
    skills: [
      {
        id: 'aqua-whip',
        name: 'Aqua Whip',
        description: 'Water whip attack',
        spektraCost: ['water'],
        damage: 3,
        conditions: []
      },
      {
        id: 'water-dance',
        name: 'Water Dance',
        description: 'If your opponent active avatar has Fire Element, this attack become 12',
        spektraCost: ['water', 'neutral', 'neutral'],
        damage: 9,
        conditions: [
          {
            type: 'opponent_element',
            value: ['fire'],
            effect: {
              type: 'damage_modification',
              value: 12
            },
          },
        ]
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Sapphire.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-063'
  },
  {
    id: 'water-sapphire-mythic',
    name: 'Sapphire',
    type: 'avatar',
    element: 'water',
    subType: 'kobar',
    level: 2,
    attack: 3,
    health: 16,
    rarity: 'Mythic',
    description: 'Avatar - Kobar Dancer',
    skills: [
      {
        id: 'aqua-whip',
        name: 'Aqua Whip',
        description: 'Water whip attack',
        spektraCost: ['water'],
        damage: 3,
        conditions: []
      },
      {
        id: 'water-dance',
        name: 'Water Dance',
        description: 'If your opponent active avatar has Fire Element, this attack become 12',
        spektraCost: ['water', 'neutral', 'neutral'],
        damage: 9,
        conditions: [
          {
            type: 'opponent_element',
            value: ['fire'],
            effect: {
              type: 'damage_modification',
              value: 12
            },
          },
        ]
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Sapphire, Super Rare.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-064'
  },
  {
    id: 'water-banyu-ghost-kuhaka',
    name: 'Banyu Ghost',
    type: 'avatar',
    element: 'water',
    subType: 'kuhaka',
    level: 2,
    attack: 7,
    health: 14,
    rarity: 'Rare',
    description: 'Avatar - Kuhaka Spirit',
    skills: [
      {
        id: 'bloody-cage',
        name: 'Bloody Cage',
        description: 'Deal 1 damage to this Avatar after using this skill',
        spektraCost: ['water', 'neutral', 'neutral'],
        damage: 7,
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
        id: 'water-bomb',
        name: 'Water Bomb',
        description: 'Draw 2 cards',
        spektraCost: ['water', 'water', 'water', 'neutral', 'neutral'],
        damage: 9,
        conditions: [
          {
            type: 'draw_cards',
            value: 2,
            effect: {
              type: 'draw_cards',
              value: 2
            },
          },
        ]
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Banyu Ghost.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-065'
  },
  {
    id: 'water-lake-guardian',
    name: 'Lake Guardian',
    type: 'avatar',
    element: 'water',
    subType: 'kuhaka',
    level: 2,
    attack: 3,
    health: 16,
    rarity: 'Rare',
    description: 'Avatar - Kuhaka Beast',
    skills: [
      {
        id: 'bite',
        name: 'Bite',
        description: 'Vicious bite attack',
        spektraCost: ['water'],
        damage: 3,
        conditions: []
      },
      {
        id: 'eternal-slumber',
        name: 'Eternal Slumber',
        description: 'If the target has 5 or below HP, destroy that Avatar.',
        spektraCost: ['water', 'water', 'neutral', 'neutral', 'neutral'],
        damage: 2,
        conditions: []
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Lake Guardian.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-066'
  },
  {
    id: 'water-the-count',
    name: 'The Count',
    type: 'avatar',
    element: 'water',
    subType: 'kuhaka',
    level: 2,
    attack: 9,
    health: 15,
    rarity: 'Rare',
    description: 'Avatar - Kuhaka Warrior',
    skills: [
      {
        id: 'blood-blade',
        name: 'Blood Blade',
        description: 'This attack damage become 13 if the opponent is Kobar or Borah type.',
        spektraCost: ['water', 'neutral', 'neutral', 'neutral'],
        damage: 9,
        conditions: [
          {
            type: 'opponent_tribe',
            value: ['kobar', 'borah'],
            effect: {
              type: 'damage_modification',
              value: 13
            },
          },
        ]
      }
    ],
    passiveSkill: {
      name: 'Chilling Bone Mist',
      description: 'Enemy non Kuhaka-Kujana type avatars have -1 attack damage in their skills',
      spektraCost: [],
      damage: 0,
      effect: 'Enemy non Kuhaka-Kujana type avatars have -1 attack damage in their skills',
      scope: 'active'
    },
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_The Count.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-067'
  },
  {
    id: 'water-the-count-mythic',
    name: 'The Count',
    type: 'avatar',
    element: 'water',
    subType: 'kuhaka',
    level: 2,
    attack: 9,
    health: 15,
    rarity: 'Mythic',
    description: 'Avatar - Kuhaka Warrior',
    skills: [
      {
        id: 'blood-blade',
        name: 'Blood Blade',
        description: 'This attack damage become 13 if the opponent is Kobar or Borah type.',
        spektraCost: ['water', 'neutral', 'neutral', 'neutral'],
        damage: 9,
        conditions: [
          {
            type: 'opponent_tribe',
            value: ['kobar', 'borah'],
            effect: {
              type: 'damage_modification',
              value: 13
            },
          },
        ]
      }
    ],
    passiveSkill: {
      name: 'Chilling Bone Mist',
      description: 'Enemy non Kuhaka-Kujana type avatars have -1 attack damage in their skills',
      spektraCost: [],
      damage: 0,
      effect: 'Enemy non Kuhaka-Kujana type avatars have -1 attack damage in their skills',
      scope: 'active'
    },
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_The Count, Super Rare.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-068'
  },
  {
    id: 'water-banyu-ghost-kujana',
    name: 'Banyu Ghost',
    type: 'avatar',
    element: 'water',
    subType: 'kujana',
    level: 2,
    attack: 1,
    health: 13,
    rarity: 'Rare',
    description: 'Avatar - Kujana Spirit',
    skills: [
      {
        id: 'water-string',
        name: 'Water String',
        description: 'If your opponent active avatar were Fire Element, this skill damage become 4',
        spektraCost: ['water'],
        damage: 1,
        conditions: [
          {
            type: 'opponent_element',
            value: ['fire'],
            effect: {
              type: 'damage_modification',
              value: 4
            },
          },
        ]
      },
      {
        id: 'water-splash',
        name: 'Water Splash',
        description: 'Deal 5 damage to opponent active avatar and 3 damage to each opponent reserve avatar.',
        spektraCost: ['water', 'water', 'neutral'],
        damage: 5,
        target: 'opponent_active_and_all_reserve',
        conditions: []
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Banyu Ghost Fem.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-069'
  },
  {
    id: 'water-pontia',
    name: 'Pontia',
    type: 'avatar',
    element: 'water',
    subType: 'kujana',
    level: 2,
    attack: 2,
    health: 12,
    rarity: 'Rare',
    description: 'Avatar - Kujana Mage',
    skills: [
      {
        id: 'chilling-hand',
        name: 'Chilling Hand',
        description: 'Ice-cold touch attack',
        spektraCost: ['water'],
        damage: 2,
        conditions: []
      },
      {
        id: 'splashing-staff',
        name: 'Splashing Staff',
        description: 'This attack damage become 12 if the opponent is Kobar or Borah type',
        spektraCost: ['water', 'water', 'neutral', 'neutral'],
        damage: 8,
        conditions: [
          {
            type: 'opponent_tribe',
            value: ['kobar', 'borah'],
            effect: {
              type: 'damage_modification',
              value: 12
            },
          },
        ]
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Pontia.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-070'
  },
  {
    id: 'water-whirlpool-demon',
    name: 'Whirlpool Demon',
    type: 'avatar',
    element: 'water',
    subType: 'kujana',
    level: 2,
    attack: 1,
    health: 14,
    rarity: 'Rare',
    description: 'Avatar - Kujana Demon',
    skills: [
      {
        id: 'whirlpool',
        name: 'Whirlpool',
        description: 'Put 3 damage into all opponent reserve avatars.',
        spektraCost: ['water', 'neutral'],
        damage: 1,
        conditions: []
      },
      {
        id: 'water-torrent',
        name: 'Water Torrent',
        description: 'Put 5 damage counter into 1 of opponent reserve avatar.',
        spektraCost: ['water', 'neutral', 'neutral', 'neutral'],
        damage: 10,
        conditions: []
      }
    ],
    imagePath: '/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Whirlpool Demon.webp',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-071'
  }
];

export const blueElementalSpells: ActionCard[] = [
  {
    id: 'water-telang-tea',
    name: 'Telang Tea',
    type: 'spell',
    element: 'water',
    rarity: 'Common',
    imagePath: '/cards/GENESIS/water/spells/Blue Elemental Spell for Apps_Spell - Telang Tea.webp',
    spektraCost: ['water', 'water'],
    expansion: 'Fire and Water',
    effectType: 'heal',
    effectValue: 3,
    effectTarget: 'select_player_avatar',
    cardNumber: 'GEN-072'
  },
  {
    id: 'water-ocean-memory',
    name: 'Ocean Memory',
    type: 'spell',
    element: 'water',
    rarity: 'Common',
    imagePath: '/cards/GENESIS/water/spells/Blue Elemental Spell for Apps_Spell - Ocean Memory.webp',
    spektraCost: ['water'],
    expansion: 'Fire and Water',
    effectType: 'draw_discard',
    effectValue: 1,
    effectValue2: 1,
    effectTarget: 'player',
    cardNumber: 'GEN-073'
  },
  {
    id: 'water-liquid-book',
    name: 'Liquid Book',
    type: 'spell',
    element: 'water',
    rarity: 'Common',
    imagePath: '/cards/GENESIS/water/spells/Blue Elemental Spell for Apps_Spell - Liquid Book.webp',
    spektraCost: ['water', 'neutral'],
    expansion: 'Fire and Water',
    effectType: 'reveal_choose',
    effectValue: 2,
    effectTarget: 'player',
    cardNumber: 'GEN-074'
  },
  {
    id: 'water-dew-drop',
    name: 'Dew Drop',
    type: 'spell',
    element: 'water',
    rarity: 'Common',
    imagePath: '/cards/GENESIS/water/spells/Blue Elemental Spell for Apps_Spell - Dew Drop.webp',
    spektraCost: ['water', 'water'],
    expansion: 'Fire and Water',
    effectType: 'peek_place_draw',
    effectValue: 1,
    effectValue2: 1,
    effectTarget: 'player',
    cardNumber: 'GEN-075'
  },
  {
    id: 'water-healing-current',
    name: 'Healing Current',
    type: 'spell',
    element: 'water',
    rarity: 'Common',
    imagePath: '/cards/GENESIS/water/spells/Blue Elemental Spell for Apps_Spell - Healing Current.webp',
    spektraCost: ['water', 'water', 'neutral'],
    expansion: 'Fire and Water',
    effectType: 'heal',
    effectValue: 2,
    effectTarget: 'all_player_water_avatars',
    cardNumber: 'GEN-076'
  },
  {
    id: 'water-deepsea-insight',
    name: 'Deepsea Insight',
    type: 'spell',
    element: 'water',
    rarity: 'Common',
    imagePath: '/cards/GENESIS/water/spells/Blue Elemental Spell for Apps_Spell - Deepsea Insight.webp',
    spektraCost: ['water'],
    expansion: 'Fire and Water',
    effectType: 'reveal_choose',
    effectValue: 3,
    effectTarget: 'player',
    cardNumber: 'GEN-077'
  },
  {
    id: 'water-water-current',
    name: 'Water Current',
    type: 'spell',
    element: 'water',
    rarity: 'Common',
    imagePath: '/cards/GENESIS/water/spells/Blue Elemental Spell for Apps_Spell - Water Current.webp',
    spektraCost: ['water', 'water', 'water', 'neutral'],
    expansion: 'Fire and Water',
    effectType: 'discard_draw',
    effectValue: 3,
    effectTarget: 'player',
    cardNumber: 'GEN-078'
  },
  {
    id: 'water-glacier-armor',
    name: 'Glacier Armor',
    type: 'ritualArmor',
    element: 'water',
    rarity: 'Common',
    imagePath: '/cards/GENESIS/water/ritualarmor/Blue Elemental Spell for Apps_Ritual Armor - Glacier Armor.webp',
    spektraCost: ['water', 'water', 'water', 'water'],
    expansion: 'Fire and Water',
    cardNumber: 'GEN-079',
    skill1: {
      name: 'Glacier Power',
      description: 'This Water element Avatar gain +2 damage in their skills',
      spektraCost: [],
      damage: 0,
      modifierType: 'skill_damage_boost',
      modifierValue: 2,
      modifierCondition: 'water'
    }
  },
  {
    id: 'water-frozen-body',
    name: 'Frozen Body',
    type: 'ritualArmor',
    element: 'water',
    rarity: 'Common',
    imagePath: '/cards/GENESIS/water/ritualarmor/Blue Elemental Spell for Apps_Ritual Armor - Frozen Body.webp',
    spektraCost: ['water', 'water', 'water', 'neutral', 'neutral'],
    expansion: 'Fire and Water',
    cardNumber: 'GEN-080',
    skill1: {
      name: 'Frozen Power',
      description: 'This Avatar gain +2 damage in their skills',
      spektraCost: [],
      damage: 0,
      modifierType: 'skill_damage_boost',
      modifierValue: 2
    }
  },
  {
    id: 'water-relearn',
    name: 'Relearn',
    type: 'quickSpell',
    element: 'water',
    rarity: 'Common',
    imagePath: '/cards/GENESIS/water/quickspells/Blue Elemental Spell for Apps_Quick Spell - Relearn.webp',
    spektraCost: ['water', 'neutral', 'neutral'],
    expansion: 'Fire and Water',
    effectType: 'draw',
    effectValue: 2,
    effectTarget: 'player',
    cardNumber: 'GEN-081'
  },
  {
    id: 'water-check',
    name: 'Check',
    type: 'spell',
    element: 'water',
    rarity: 'Common',
    imagePath: '/cards/GENESIS/water/spells/Blue Elemental Spell for Apps_Spell - Check.webp',
    spektraCost: ['water'],
    expansion: 'Fire and Water',
    effectType: 'peek_place',
    effectValue: 1,
    effectTarget: 'player',
    cardNumber: 'GEN-082'
  },
  {
    id: 'water-water-shield',
    name: 'Water Shield',
    type: 'quickSpell',
    element: 'water',
    rarity: 'Common',
    imagePath: '/cards/GENESIS/water/quickspells/Blue Elemental Spell for Apps_Quick Spell - Water Shield.webp',
    spektraCost: ['water', 'water'],
    effect: 'Reduce next 2 damage from incoming damage to target Avatar this turn.',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-083'
  },
  {
    id: 'water-energize',
    name: 'Energize',
    type: 'quickSpell',
    element: 'water',
    rarity: 'Common',
    imagePath: '/cards/GENESIS/water/quickspells/Blue Elemental Spell for Apps_Quick Spell - Energize.webp',
    spektraCost: ['water', 'water', 'neutral', 'neutral'],
    effect: 'Heal 3 HP to all of your Avatar in field.',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-084'
  },
  {
    id: 'water-blink',
    name: 'Blink',
    type: 'quickSpell',
    element: 'water',
    rarity: 'Common',
    imagePath: '/cards/GENESIS/water/quickspells/Blue Elemental Spell for Apps_Quick Spell - Blink.webp',
    spektraCost: ['water', 'water', 'neutral'],
    effect: 'Prevents next 1 red colored quick spell.',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-085'
  }
];

export const blueElementalFieldCards: FieldCard[] = [
  {
    id: 'water-lake-stage',
    name: 'Lake Stage',
    type: 'field',
    element: 'water',
    rarity: 'Common',
    art: '/cards/GENESIS/water/fieldspells/Blue Elemental Spell for Apps_Field Spell - Lake Stage.webp',
    spektraCost: ['water', 'water', 'water'],
    description: 'Water element Avatar gain +1 damage in their skills',
    passiveEffect: 'All Water element avatars gain +1 damage to all their skills',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-086',
    modifierType: 'skill_damage_boost',
    modifierValue: 1,
    modifierCondition: 'water'
  },
  {
    id: 'water-glacier-stage',
    name: 'Glacier Stage',
    type: 'field',
    element: 'water',
    rarity: 'Common',
    art: '/cards/GENESIS/water/fieldspells/Blue Elemental Spell for Apps_Field Spell - Glacier Stage.webp',
    spektraCost: ['water', 'water', 'water', 'neutral', 'neutral'],
    description: 'Fire element Avatar skill get -2 damage in their skills',
    passiveEffect: 'All Fire element avatars get -2 damage to all their skills',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-087',
    modifierType: 'skill_damage_boost',
    modifierValue: -2,
    modifierCondition: 'fire'
  },
  {
    id: 'water-city-river',
    name: 'City River',
    type: 'field',
    element: 'water',
    rarity: 'Common',
    art: '/cards/GENESIS/water/fieldspells/Blue Elemental Spell for Apps_Field Spell - City River.webp',
    spektraCost: ['water', 'water', 'neutral', 'neutral'],
    description: 'Everytime Water element Avatar using skill, its user draw 1 card from deck',
    passiveEffect: 'When a Water element avatar uses a skill, draw 1 card',
    expansion: 'Fire and Water',
    cardNumber: 'GEN-088',
    trigger: {
      triggerType: 'on_skill_use',
      effectType: 'draw_card',
      effectValue: 1,
      condition: 'water'
    }
  }
];
