// AUTO-GENERATED from cards-details.csv — do not edit manually
// Run: npx tsx scripts/generateCardDataFromCSV.ts

import type { AvatarCard, ActionCard, FieldCard } from '../../types/card'

export const csvFireAvatarCards: AvatarCard[] = [
  {
    id: "fire-witch-trainee",
    name: "Witch Trainee",
    type: 'avatar',
    element: "fire",
    subType: "kujana",
    level: 1,
    attack: 2,
    health: 6,
    rarity: "Common",
    description: "Avatar - Kujana Witch",
    skills: [
          {
                "id": "doomflare",
                "name": "Doomflare",
                "damage": 2,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "borah",
                                  "kobar"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 3
                            }
                      }
                ],
                "description": "This attack damage become 3 if the opponent is Borah or Kobar type Avatar",
                "spektraCost": [
                      "fire",
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Witch Trainee.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-001",
  },
  {
    id: "fire-shaman-kujana",
    name: "Shaman",
    type: 'avatar',
    element: "fire",
    subType: "kujana",
    level: 1,
    attack: 1,
    health: 6,
    rarity: "Common",
    description: "Avatar - Kujana Witch",
    skills: [
          {
                "id": "spread-flame",
                "name": "Spread Flame",
                "damage": 1,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 1 damage to opponent active avatar and 1 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "fire",
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Shaman B.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-002",
  },
  {
    id: "fire-repo-girl",
    name: "Repo Girl",
    type: 'avatar',
    element: "fire",
    subType: "kujana",
    level: 1,
    attack: 2,
    health: 5,
    rarity: "Common",
    description: "Avatar - Kujana Human",
    skills: [
          {
                "id": "kick",
                "name": "Kick",
                "damage": 2,
                "conditions": [],
                "description": "Basic attack",
                "spektraCost": [
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Repo Girl.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-003",
  },
  {
    id: "fire-thug",
    name: "Thug",
    type: 'avatar',
    element: "fire",
    subType: "kuhaka",
    level: 1,
    attack: 1,
    health: 5,
    rarity: "Common",
    description: "Avatar - Kuhaka Human",
    skills: [
          {
                "id": "kick",
                "name": "Kick",
                "damage": 1,
                "conditions": [],
                "description": "Basic attack",
                "spektraCost": [
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Thug A.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-004",
  },
  {
    id: "fire-shaman-kuhaka",
    name: "Shaman",
    type: 'avatar',
    element: "fire",
    subType: "kuhaka",
    level: 1,
    attack: 3,
    health: 6,
    rarity: "Common",
    description: "Avatar - Kuhaka Witch",
    skills: [
          {
                "id": "concentrated-flame",
                "name": "Concentrated Flame",
                "damage": 3,
                "conditions": [],
                "description": "Direct flame attack",
                "spektraCost": [
                      "fire",
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Shaman A.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-005",
  },
  {
    id: "fire-goldie",
    name: "Goldie",
    type: 'avatar',
    element: "fire",
    subType: "kuhaka",
    level: 1,
    attack: 1,
    health: 8,
    rarity: "Common",
    description: "Avatar - Kuhaka Human",
    skills: [
          {
                "id": "body-slam",
                "name": "Body Slam",
                "damage": 1,
                "conditions": [],
                "description": "Physical attack",
                "spektraCost": [
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Goldie.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-006",
  },
  {
    id: "fire-kobar-trainee-a",
    name: "Kobar Trainee A",
    type: 'avatar',
    element: "fire",
    subType: "kobar",
    level: 1,
    attack: 4,
    health: 6,
    rarity: "Common",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "reckless-fire",
                "name": "Reckless Fire",
                "damage": 4,
                "conditions": [
                      {
                            "type": "self_damage",
                            "value": 1,
                            "effect": {
                                  "type": "damage_self",
                                  "value": 1
                            }
                      }
                ],
                "description": "Deal 1 damage to self after attack.",
                "spektraCost": [
                      "fire",
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Kobar Trainee A.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-007",
  },
  {
    id: "fire-kobar-trainee-b",
    name: "Kobar Trainee B",
    type: 'avatar',
    element: "fire",
    subType: "kobar",
    level: 1,
    attack: 2,
    health: 5,
    rarity: "Common",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "ash-flick",
                "name": "Ash Flick",
                "damage": 2,
                "conditions": [],
                "description": "Basic fire attack",
                "spektraCost": [
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Kobar Trainee B.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-008",
  },
  {
    id: "fire-kobar-trainee-c",
    name: "Kobar Trainee C",
    type: 'avatar',
    element: "fire",
    subType: "kobar",
    level: 1,
    attack: 2,
    health: 5,
    rarity: "Common",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "wildbone-blade",
                "name": "Wildbone Blade",
                "damage": 2,
                "conditions": [
                      {
                            "type": "opponent_element",
                            "value": [
                                  "air"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 3
                            }
                      }
                ],
                "description": "This attack damage become 3 if the opponent is Air Element Avatar",
                "spektraCost": [
                      "fire",
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Kobar Trainee C.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-009",
  },
  {
    id: "fire-borah-trainee-a",
    name: "Borah Trainee A",
    type: 'avatar',
    element: "fire",
    subType: "borah",
    level: 1,
    attack: 1,
    health: 5,
    rarity: "Common",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "kick",
                "name": "Kick",
                "damage": 1,
                "conditions": [],
                "description": "Basic attack",
                "spektraCost": [
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Borah Trainee A.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-010",
  },
  {
    id: "fire-borah-trainee-b",
    name: "Borah Trainee B",
    type: 'avatar',
    element: "fire",
    subType: "borah",
    level: 1,
    attack: 1,
    health: 5,
    rarity: "Common",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "burning-step",
                "name": "Burning Step",
                "damage": 1,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 1 damage to opponent active avatar and 1 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Borah Trainee B.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-011",
  },
  {
    id: "fire-borah-trainee-c",
    name: "Borah Trainee C",
    type: 'avatar',
    element: "fire",
    subType: "borah",
    level: 1,
    attack: 2,
    health: 6,
    rarity: "Common",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "ash-flick",
                "name": "Ash Flick",
                "damage": 2,
                "conditions": [],
                "description": "Basic fire attack",
                "spektraCost": [
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Borah Trainee C.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-012",
  },
  {
    id: "fire-radja",
    name: "Radja",
    type: 'avatar',
    element: "fire",
    subType: "kobar",
    level: 2,
    attack: 5,
    health: 17,
    rarity: "Uncommon",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "pyro-punch",
                "name": "Pyro Punch",
                "damage": 5,
                "conditions": [],
                "description": "Powerful fire punch",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          },
          {
                "id": "burning-body",
                "name": "Burning Body",
                "damage": 9,
                "conditions": [
                      {
                            "type": "opponent_element",
                            "value": [
                                  "air"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 13
                            }
                      }
                ],
                "description": "This attack damage become 13 if the opponent is Air Element Avatar",
                "spektraCost": [
                      "fire",
                      "fire",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Radja.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-013",
  },
  {
    id: "fire-mera",
    name: "Mera",
    type: 'avatar',
    element: "fire",
    subType: "kobar",
    level: 2,
    attack: 3,
    health: 13,
    rarity: "Rare",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "klaw",
                "name": "Klaw",
                "damage": 3,
                "conditions": [],
                "description": "Sharp claw attack",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          },
          {
                "id": "revenge-fire",
                "name": "Revenge Fire",
                "damage": 8,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "kuhaka",
                                  "kujana"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 13
                            }
                      }
                ],
                "description": "This attack damage become 13 if the opponent is Kuhaka or Kujana type Avatar",
                "spektraCost": [
                      "fire",
                      "fire",
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Mera.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-014",
  },
  {
    id: "fire-crimson",
    name: "Crimson",
    type: 'avatar',
    element: "fire",
    subType: "kobar",
    level: 2,
    attack: 18,
    health: 15,
    rarity: "Uncommon",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "ember",
                "name": "Ember",
                "damage": 3,
                "conditions": [],
                "description": "Basic fire attack",
                "spektraCost": [
                      "fire"
                ]
          },
          {
                "id": "infernal-crush",
                "name": "Infernal Crush",
                "damage": 18,
                "conditions": [
                      {
                            "type": "self_damage",
                            "value": 4,
                            "effect": {
                                  "type": "damage_self",
                                  "value": 4
                            }
                      }
                ],
                "description": "Deal 4 damage to this Avatar after using this skill",
                "spektraCost": [
                      "fire",
                      "fire",
                      "neutral",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Crimson.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-015",
  },
  {
    id: "fire-dara",
    name: "Dara",
    type: 'avatar',
    element: "fire",
    subType: "borah",
    level: 2,
    attack: 3,
    health: 12,
    rarity: "Rare",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "klaw",
                "name": "Klaw",
                "damage": 3,
                "conditions": [],
                "description": "Sharp claw attack",
                "spektraCost": [
                      "neutral"
                ]
          },
          {
                "id": "annihilation",
                "name": "Annihilation",
                "damage": 15,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "kuhaka",
                                  "kujana"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 20
                            }
                      }
                ],
                "description": "This attack damage become 20 if the opponent is Kuhaka or Kujana type Avatar",
                "spektraCost": [
                      "fire",
                      "fire",
                      "fire",
                      "fire",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Dara.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-016",
  },
  {
    id: "fire-daisy",
    name: "Daisy",
    type: 'avatar',
    element: "fire",
    subType: "borah",
    level: 2,
    attack: 6,
    health: 16,
    rarity: "Uncommon",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "spit-fire",
                "name": "Spit Fire",
                "damage": 6,
                "conditions": [],
                "description": "Fire projectile attack",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          },
          {
                "id": "spread-burning",
                "name": "Spread Burning",
                "damage": 10,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 10 damage to opponent active avatar and 2 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "fire",
                      "neutral",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Daisy.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-017",
  },
  {
    id: "fire-scarlet",
    name: "Scarlet",
    type: 'avatar',
    element: "fire",
    subType: "borah",
    level: 2,
    attack: 4,
    health: 14,
    rarity: "Rare",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "mini-dagger",
                "name": "Mini Dagger",
                "damage": 4,
                "conditions": [],
                "description": "Quick dagger strike",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          },
          {
                "id": "infernal-arrow",
                "name": "Infernal Arrow",
                "damage": 15,
                "conditions": [
                      {
                            "type": "self_damage",
                            "value": 3,
                            "effect": {
                                  "type": "damage_self",
                                  "value": 3
                            }
                      }
                ],
                "description": "Deal 3 damage to this Avatar after using this skill",
                "spektraCost": [
                      "fire",
                      "fire",
                      "fire",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Scarlet.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-018",
  },
  {
    id: "fire-blood-eater",
    name: "Blood Eater",
    type: 'avatar',
    element: "fire",
    subType: "kujana",
    level: 2,
    attack: 2,
    health: 16,
    rarity: "Rare",
    description: "Avatar - Kujana Witch",
    skills: [
          {
                "id": "whirl-kick",
                "name": "Whirl Kick",
                "damage": 2,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 2 damage to opponent active avatar and 1 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          },
          {
                "id": "rushing-kick",
                "name": "Rushing Kick",
                "damage": 12,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "borah",
                                  "kobar"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 15
                            }
                      }
                ],
                "description": "This attack damage become 15 if the opponent is Borah or Kobar type Avatar",
                "spektraCost": [
                      "fire",
                      "fire",
                      "fire",
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Blood Eater.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-019",
  },
  {
    id: "fire-blood-demon",
    name: "Blood Demon",
    type: 'avatar',
    element: "fire",
    subType: "kuhaka",
    level: 2,
    attack: 13,
    health: 13,
    rarity: "Uncommon",
    description: "Avatar - Kuhaka Berserker",
    skills: [
          {
                "id": "bloody-klaw",
                "name": "Bloody Klaw",
                "damage": 13,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "borah",
                                  "kobar"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 20
                            }
                      }
                ],
                "description": "This attack damage become 20 if the opponent is Borah or Kobar type Avatar",
                "spektraCost": [
                      "fire",
                      "fire",
                      "fire",
                      "fire",
                      "neutral"
                ]
          }
    ],
    passiveSkill: {
          "id": "berserker-burnout",
          "name": "Berserker Burnout",
          "scope": "active",
          "damage": 0,
          "effect": "Everytime before your draw phase, deal 1 damage to this Avatar.",
          "description": "Everytime before your draw phase, deal 1 damage to this Avatar.",
          "spektraCost": []
    },
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Blood Demon.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-020",
  },
  {
    id: "fire-boar-berserker",
    name: "Boar Berserker",
    type: 'avatar',
    element: "fire",
    subType: "kuhaka",
    level: 2,
    attack: 6,
    health: 20,
    rarity: "Rare",
    description: "Avatar - Kuhaka Berserker",
    skills: [
          {
                "id": "body-slam",
                "name": "Body Slam",
                "damage": 6,
                "conditions": [
                      {
                            "type": "self_damage",
                            "value": 1,
                            "effect": {
                                  "type": "damage_self",
                                  "value": 1
                            }
                      }
                ],
                "description": "Deal 1 damage to this Avatar after using this skill.",
                "spektraCost": [
                      "fire",
                      "fire"
                ]
          },
          {
                "id": "bloody-klaw",
                "name": "Bloody Klaw",
                "damage": 20,
                "conditions": [
                      {
                            "type": "self_damage",
                            "value": 1,
                            "effect": {
                                  "type": "damage_self",
                                  "value": 1
                            }
                      }
                ],
                "description": "Deal 1 damage to this Avatar after using this skill.",
                "spektraCost": [
                      "fire",
                      "neutral",
                      "neutral",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Boar Berserker.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-021",
  },
  {
    id: "fire-banaspati",
    name: "Banaspati",
    type: 'avatar',
    element: "fire",
    subType: "kuhaka",
    level: 2,
    attack: 3,
    health: 17,
    rarity: "Uncommon",
    description: "Avatar - Kuhaka Pyromancer",
    skills: [
          {
                "id": "ember",
                "name": "Ember",
                "damage": 3,
                "conditions": [],
                "description": "Basic fire spell",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          },
          {
                "id": "spread-ember",
                "name": "Spread Ember",
                "damage": 13,
                "target": "all_opponent_reserve",
                "conditions": [],
                "description": "Put 3 damage into all opponent reserve avatars.",
                "spektraCost": [
                      "fire",
                      "fire",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Banaspati.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-022",
  },
  {
    id: "fire-boar-witch",
    name: "Boar Witch",
    type: 'avatar',
    element: "fire",
    subType: "kujana",
    level: 2,
    attack: 7,
    health: 13,
    rarity: "Rare",
    description: "Avatar - Kujana Witch",
    skills: [
          {
                "id": "purified-fire",
                "name": "Purified Fire",
                "damage": 7,
                "condition": "damage_to_self",
                "effectType": "heal",
                "description": "Deal 7 damage. If this avatar has damage counters, heal 2 damage.",
                "effectValue": 2,
                "spektraCost": [
                      "fire",
                      "fire",
                      "neutral",
                      "neutral"
                ],
                "effectTarget": "player_active",
                "conditionValue": 1
          }
    ],
    passiveSkill: {
          "id": "sacred-fire",
          "name": "Sacred Fire",
          "scope": "active_or_reserve",
          "damage": 0,
          "description": "Your active Fire Element Avatar gets +2 attack damage in their skills.",
          "spektraCost": [],
          "modifierType": "skill_damage_boost",
          "modifierValue": 2,
          "modifierCondition": "fire"
    },
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Boar Witch.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-023",
  },
  {
    id: "fire-banaspati-female",
    name: "Banaspati",
    type: 'avatar',
    element: "fire",
    subType: "kujana",
    level: 2,
    attack: 3,
    health: 15,
    rarity: "Uncommon",
    description: "Avatar - Kujana Pyromancer",
    skills: [
          {
                "id": "ember",
                "name": "Ember",
                "damage": 3,
                "conditions": [],
                "description": "Basic fire spell",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          },
          {
                "id": "burning-tips",
                "name": "Burning Tips",
                "damage": 8,
                "conditions": [
                      {
                            "type": "opponent_element",
                            "value": [
                                  "air"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 12
                            }
                      }
                ],
                "description": "This attack damage become 12 if the opponent is Air Element Avatar",
                "spektraCost": [
                      "fire",
                      "fire",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars Common-Uncommon-Rare_Ava - Banaspati Fem.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-024",
  },
  {
    id: "fire-witch-trainee-sr",
    name: "Witch Trainee",
    type: 'avatar',
    element: "fire",
    subType: "kujana",
    level: 1,
    attack: 2,
    health: 6,
    rarity: "Super Rare",
    description: "Avatar - Kujana Witch",
    skills: [
          {
                "id": "doomflare",
                "name": "Doomflare",
                "damage": 2,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "borah",
                                  "kobar"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 3
                            }
                      }
                ],
                "description": "This attack damage become 3 if the opponent is Borah or Kobar type Avatar",
                "spektraCost": [
                      "fire",
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Witch Trainee.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-094",
  },
  {
    id: "fire-shaman-kujana-sr",
    name: "Shaman",
    type: 'avatar',
    element: "fire",
    subType: "kujana",
    level: 1,
    attack: 1,
    health: 6,
    rarity: "Super Rare",
    description: "Avatar - Kujana Witch",
    skills: [
          {
                "id": "spread-flame",
                "name": "Spread Flame",
                "damage": 1,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 1 damage to opponent active avatar and 1 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "fire",
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Shaman B.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-095",
  },
  {
    id: "fire-repo-girl-sr",
    name: "Repo Girl",
    type: 'avatar',
    element: "fire",
    subType: "kujana",
    level: 1,
    attack: 2,
    health: 5,
    rarity: "Super Rare",
    description: "Avatar - Kujana Human",
    skills: [
          {
                "id": "kick",
                "name": "Kick",
                "damage": 2,
                "conditions": [],
                "description": "Basic attack",
                "spektraCost": [
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Repo Girl.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-096",
  },
  {
    id: "fire-thug-sr",
    name: "Thug",
    type: 'avatar',
    element: "fire",
    subType: "kuhaka",
    level: 1,
    attack: 1,
    health: 5,
    rarity: "Super Rare",
    description: "Avatar - Kuhaka Human",
    skills: [
          {
                "id": "kick",
                "name": "Kick",
                "damage": 1,
                "conditions": [],
                "description": "Basic attack",
                "spektraCost": [
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Thug A.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-097",
  },
  {
    id: "fire-shaman-kuhaka-sr",
    name: "Shaman",
    type: 'avatar',
    element: "fire",
    subType: "kuhaka",
    level: 1,
    attack: 3,
    health: 6,
    rarity: "Super Rare",
    description: "Avatar - Kuhaka Witch",
    skills: [
          {
                "id": "concentrated-flame",
                "name": "Concentrated Flame",
                "damage": 3,
                "conditions": [],
                "description": "Direct flame attack",
                "spektraCost": [
                      "fire",
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Shaman A.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-098",
  },
  {
    id: "fire-goldie-sr",
    name: "Goldie",
    type: 'avatar',
    element: "fire",
    subType: "kuhaka",
    level: 1,
    attack: 1,
    health: 8,
    rarity: "Super Rare",
    description: "Avatar - Kuhaka Human",
    skills: [
          {
                "id": "body-slam",
                "name": "Body Slam",
                "damage": 1,
                "conditions": [],
                "description": "Physical attack",
                "spektraCost": [
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Goldie.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-099",
  },
  {
    id: "fire-kobar-trainee-a-sr",
    name: "Kobar Trainee A",
    type: 'avatar',
    element: "fire",
    subType: "kobar",
    level: 1,
    attack: 4,
    health: 6,
    rarity: "Super Rare",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "reckless-fire",
                "name": "Reckless Fire",
                "damage": 4,
                "conditions": [
                      {
                            "type": "self_damage",
                            "value": 1,
                            "effect": {
                                  "type": "damage_self",
                                  "value": 1
                            }
                      }
                ],
                "description": "Deal 1 damage to self after attack.",
                "spektraCost": [
                      "fire",
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Kobar Trainee A.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-100",
  },
  {
    id: "fire-kobar-trainee-b-sr",
    name: "Kobar Trainee B",
    type: 'avatar',
    element: "fire",
    subType: "kobar",
    level: 1,
    attack: 2,
    health: 5,
    rarity: "Super Rare",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "ash-flick",
                "name": "Ash Flick",
                "damage": 2,
                "conditions": [],
                "description": "Basic fire attack",
                "spektraCost": [
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Kobar Trainee B.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-101",
  },
  {
    id: "fire-kobar-trainee-c-sr",
    name: "Kobar Trainee C",
    type: 'avatar',
    element: "fire",
    subType: "kobar",
    level: 1,
    attack: 2,
    health: 5,
    rarity: "Super Rare",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "wildbone-blade",
                "name": "Wildbone Blade",
                "damage": 2,
                "conditions": [
                      {
                            "type": "opponent_element",
                            "value": [
                                  "air"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 3
                            }
                      }
                ],
                "description": "This attack damage become 3 if the opponent is Air Element Avatar",
                "spektraCost": [
                      "fire",
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Kobar Trainee C.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-102",
  },
  {
    id: "fire-borah-trainee-a-sr",
    name: "Borah Trainee A",
    type: 'avatar',
    element: "fire",
    subType: "borah",
    level: 1,
    attack: 1,
    health: 5,
    rarity: "Super Rare",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "kick",
                "name": "Kick",
                "damage": 1,
                "conditions": [],
                "description": "Basic attack",
                "spektraCost": [
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Borah Trainee A.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-103",
  },
  {
    id: "fire-borah-trainee-b-sr",
    name: "Borah Trainee B",
    type: 'avatar',
    element: "fire",
    subType: "borah",
    level: 1,
    attack: 1,
    health: 5,
    rarity: "Super Rare",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "burning-step",
                "name": "Burning Step",
                "damage": 1,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 1 damage to opponent active avatar and 1 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Borah Trainee B.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-104",
  },
  {
    id: "fire-borah-trainee-c-sr",
    name: "Borah Trainee C",
    type: 'avatar',
    element: "fire",
    subType: "borah",
    level: 1,
    attack: 2,
    health: 6,
    rarity: "Super Rare",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "ash-flick",
                "name": "Ash Flick",
                "damage": 2,
                "conditions": [],
                "description": "Basic fire attack",
                "spektraCost": [
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Borah Trainee C.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-105",
  },
  {
    id: "fire-radja-sr",
    name: "Radja",
    type: 'avatar',
    element: "fire",
    subType: "kobar",
    level: 2,
    attack: 5,
    health: 17,
    rarity: "Super Rare",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "pyro-punch",
                "name": "Pyro Punch",
                "damage": 5,
                "conditions": [],
                "description": "Powerful fire punch",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          },
          {
                "id": "burning-body",
                "name": "Burning Body",
                "damage": 9,
                "conditions": [
                      {
                            "type": "opponent_element",
                            "value": [
                                  "air"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 13
                            }
                      }
                ],
                "description": "This attack damage become 13 if the opponent is Air Element Avatar",
                "spektraCost": [
                      "fire",
                      "fire",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Radja.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-106",
  },
  {
    id: "fire-mera-sr",
    name: "Mera",
    type: 'avatar',
    element: "fire",
    subType: "kobar",
    level: 2,
    attack: 3,
    health: 13,
    rarity: "Super Rare",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "klaw",
                "name": "Klaw",
                "damage": 3,
                "conditions": [],
                "description": "Sharp claw attack",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          },
          {
                "id": "revenge-fire",
                "name": "Revenge Fire",
                "damage": 8,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "kuhaka",
                                  "kujana"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 13
                            }
                      }
                ],
                "description": "This attack damage become 13 if the opponent is Kuhaka or Kujana type Avatar",
                "spektraCost": [
                      "fire",
                      "fire",
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Mera.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-107",
  },
  {
    id: "fire-crimson-sr",
    name: "Crimson",
    type: 'avatar',
    element: "fire",
    subType: "kobar",
    level: 2,
    attack: 18,
    health: 15,
    rarity: "Super Rare",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "ember",
                "name": "Ember",
                "damage": 3,
                "conditions": [],
                "description": "Basic fire attack",
                "spektraCost": [
                      "fire"
                ]
          },
          {
                "id": "infernal-crush",
                "name": "Infernal Crush",
                "damage": 18,
                "conditions": [
                      {
                            "type": "self_damage",
                            "value": 4,
                            "effect": {
                                  "type": "damage_self",
                                  "value": 4
                            }
                      }
                ],
                "description": "Deal 4 damage to this Avatar after using this skill",
                "spektraCost": [
                      "fire",
                      "fire",
                      "neutral",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Crimson.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-108",
  },
  {
    id: "fire-dara-sr",
    name: "Dara",
    type: 'avatar',
    element: "fire",
    subType: "borah",
    level: 2,
    attack: 3,
    health: 12,
    rarity: "Super Rare",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "klaw",
                "name": "Klaw",
                "damage": 3,
                "conditions": [],
                "description": "Sharp claw attack",
                "spektraCost": [
                      "neutral"
                ]
          },
          {
                "id": "annihilation",
                "name": "Annihilation",
                "damage": 15,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "kuhaka",
                                  "kujana"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 20
                            }
                      }
                ],
                "description": "This attack damage become 20 if the opponent is Kuhaka or Kujana type Avatar",
                "spektraCost": [
                      "fire",
                      "fire",
                      "fire",
                      "fire",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Dara.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-109",
  },
  {
    id: "fire-daisy-sr",
    name: "Daisy",
    type: 'avatar',
    element: "fire",
    subType: "borah",
    level: 2,
    attack: 6,
    health: 16,
    rarity: "Super Rare",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "spit-fire",
                "name": "Spit Fire",
                "damage": 6,
                "conditions": [],
                "description": "Fire projectile attack",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          },
          {
                "id": "spread-burning",
                "name": "Spread Burning",
                "damage": 10,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 10 damage to opponent active avatar and 2 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "fire",
                      "neutral",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Daisy.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-110",
  },
  {
    id: "fire-scarlet-sr",
    name: "Scarlet",
    type: 'avatar',
    element: "fire",
    subType: "borah",
    level: 2,
    attack: 4,
    health: 14,
    rarity: "Super Rare",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "mini-dagger",
                "name": "Mini Dagger",
                "damage": 4,
                "conditions": [],
                "description": "Quick dagger strike",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          },
          {
                "id": "infernal-arrow",
                "name": "Infernal Arrow",
                "damage": 15,
                "conditions": [
                      {
                            "type": "self_damage",
                            "value": 3,
                            "effect": {
                                  "type": "damage_self",
                                  "value": 3
                            }
                      }
                ],
                "description": "Deal 3 damage to this Avatar after using this skill",
                "spektraCost": [
                      "fire",
                      "fire",
                      "fire",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Scarlet.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-111",
  },
  {
    id: "fire-blood-eater-sr",
    name: "Blood Eater",
    type: 'avatar',
    element: "fire",
    subType: "kujana",
    level: 2,
    attack: 2,
    health: 16,
    rarity: "Super Rare",
    description: "Avatar - Kujana Witch",
    skills: [
          {
                "id": "whirl-kick",
                "name": "Whirl Kick",
                "damage": 2,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 2 damage to opponent active avatar and 1 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          },
          {
                "id": "rushing-kick",
                "name": "Rushing Kick",
                "damage": 12,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "borah",
                                  "kobar"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 15
                            }
                      }
                ],
                "description": "This attack damage become 15 if the opponent is Borah or Kobar type Avatar",
                "spektraCost": [
                      "fire",
                      "fire",
                      "fire",
                      "fire"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Blood Eater.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-112",
  },
  {
    id: "fire-blood-demon-sr",
    name: "Blood Demon",
    type: 'avatar',
    element: "fire",
    subType: "kuhaka",
    level: 2,
    attack: 13,
    health: 13,
    rarity: "Super Rare",
    description: "Avatar - Kuhaka Berserker",
    skills: [
          {
                "id": "bloody-klaw",
                "name": "Bloody Klaw",
                "damage": 13,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "borah",
                                  "kobar"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 20
                            }
                      }
                ],
                "description": "This attack damage become 20 if the opponent is Borah or Kobar type Avatar",
                "spektraCost": [
                      "fire",
                      "fire",
                      "fire",
                      "fire",
                      "neutral"
                ]
          }
    ],
    passiveSkill: {
          "id": "berserker-burnout",
          "name": "Berserker Burnout",
          "scope": "active",
          "damage": 0,
          "effect": "Everytime before your draw phase, deal 1 damage to this Avatar.",
          "description": "Everytime before your draw phase, deal 1 damage to this Avatar.",
          "spektraCost": []
    },
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Blood Demon.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-113",
  },
  {
    id: "fire-boar-berserker-sr",
    name: "Boar Berserker",
    type: 'avatar',
    element: "fire",
    subType: "kuhaka",
    level: 2,
    attack: 6,
    health: 20,
    rarity: "Super Rare",
    description: "Avatar - Kuhaka Berserker",
    skills: [
          {
                "id": "body-slam",
                "name": "Body Slam",
                "damage": 6,
                "conditions": [
                      {
                            "type": "self_damage",
                            "value": 1,
                            "effect": {
                                  "type": "damage_self",
                                  "value": 1
                            }
                      }
                ],
                "description": "Deal 1 damage to this Avatar after using this skill.",
                "spektraCost": [
                      "fire",
                      "fire"
                ]
          },
          {
                "id": "bloody-klaw",
                "name": "Bloody Klaw",
                "damage": 20,
                "conditions": [
                      {
                            "type": "self_damage",
                            "value": 1,
                            "effect": {
                                  "type": "damage_self",
                                  "value": 1
                            }
                      }
                ],
                "description": "Deal 1 damage to this Avatar after using this skill.",
                "spektraCost": [
                      "fire",
                      "neutral",
                      "neutral",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Boar Berserker.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-114",
  },
  {
    id: "fire-banaspati-sr",
    name: "Banaspati",
    type: 'avatar',
    element: "fire",
    subType: "kuhaka",
    level: 2,
    attack: 3,
    health: 17,
    rarity: "Super Rare",
    description: "Avatar - Kuhaka Pyromancer",
    skills: [
          {
                "id": "ember",
                "name": "Ember",
                "damage": 3,
                "conditions": [],
                "description": "Basic fire spell",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          },
          {
                "id": "spread-ember",
                "name": "Spread Ember",
                "damage": 13,
                "target": "all_opponent_reserve",
                "conditions": [],
                "description": "Put 3 damage into all opponent reserve avatars.",
                "spektraCost": [
                      "fire",
                      "fire",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Banaspati.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-115",
  },
  {
    id: "fire-boar-witch-sr",
    name: "Boar Witch",
    type: 'avatar',
    element: "fire",
    subType: "kujana",
    level: 2,
    attack: 7,
    health: 13,
    rarity: "Super Rare",
    description: "Avatar - Kujana Witch",
    skills: [
          {
                "id": "purified-fire",
                "name": "Purified Fire",
                "damage": 7,
                "condition": "damage_to_self",
                "effectType": "heal",
                "description": "Deal 7 damage. If this avatar has damage counters, heal 2 damage.",
                "effectValue": 2,
                "spektraCost": [
                      "fire",
                      "fire",
                      "neutral",
                      "neutral"
                ],
                "effectTarget": "player_active",
                "conditionValue": 1
          }
    ],
    passiveSkill: {
          "id": "sacred-fire",
          "name": "Sacred Fire",
          "scope": "active_or_reserve",
          "damage": 0,
          "description": "Your active Fire Element Avatar gets +2 attack damage in their skills.",
          "spektraCost": [],
          "modifierType": "skill_damage_boost",
          "modifierValue": 2,
          "modifierCondition": "fire"
    },
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Boar Witch.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-116",
  },
  {
    id: "fire-banaspati-female-sr",
    name: "Banaspati",
    type: 'avatar',
    element: "fire",
    subType: "kujana",
    level: 2,
    attack: 3,
    health: 15,
    rarity: "Super Rare",
    description: "Avatar - Kujana Pyromancer",
    skills: [
          {
                "id": "ember",
                "name": "Ember",
                "damage": 3,
                "conditions": [],
                "description": "Basic fire spell",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          },
          {
                "id": "burning-tips",
                "name": "Burning Tips",
                "damage": 8,
                "conditions": [
                      {
                            "type": "opponent_element",
                            "value": [
                                  "air"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 12
                            }
                      }
                ],
                "description": "This attack damage become 12 if the opponent is Air Element Avatar",
                "spektraCost": [
                      "fire",
                      "fire",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Banaspati Female.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-117",
  },
  {
    id: "fire-radja-mythic",
    name: "Radja",
    type: 'avatar',
    element: "fire",
    subType: "kobar",
    level: 2,
    attack: 5,
    health: 17,
    rarity: "Mythic",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "pyro-punch",
                "name": "Pyro Punch",
                "damage": 5,
                "conditions": [],
                "description": "Powerful fire punch",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          },
          {
                "id": "burning-body",
                "name": "Burning Body",
                "damage": 9,
                "conditions": [
                      {
                            "type": "opponent_element",
                            "value": [
                                  "air"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 13
                            }
                      }
                ],
                "description": "This attack damage become 13 if the opponent is Air Element Avatar",
                "spektraCost": [
                      "fire",
                      "fire",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Radja, Rare.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-154",
  },
  {
    id: "fire-daisy-mythic",
    name: "Daisy",
    type: 'avatar',
    element: "fire",
    subType: "borah",
    level: 2,
    attack: 6,
    health: 16,
    rarity: "Mythic",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "spit-fire",
                "name": "Spit Fire",
                "damage": 6,
                "conditions": [],
                "description": "Fire projectile attack",
                "spektraCost": [
                      "fire",
                      "neutral"
                ]
          },
          {
                "id": "spread-burning",
                "name": "Spread Burning",
                "damage": 10,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 10 damage to opponent active avatar and 2 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "fire",
                      "neutral",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Daisy, Super Rare.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-155",
  },
  {
    id: "fire-boar-berserker-mythic",
    name: "Boar Berserker",
    type: 'avatar',
    element: "fire",
    subType: "kuhaka",
    level: 2,
    attack: 6,
    health: 20,
    rarity: "Mythic",
    description: "Avatar - Kuhaka Berserker",
    skills: [
          {
                "id": "body-slam",
                "name": "Body Slam",
                "damage": 6,
                "conditions": [
                      {
                            "type": "self_damage",
                            "value": 1,
                            "effect": {
                                  "type": "damage_self",
                                  "value": 1
                            }
                      }
                ],
                "description": "Deal 1 damage to this Avatar after using this skill.",
                "spektraCost": [
                      "fire",
                      "fire"
                ]
          },
          {
                "id": "bloody-klaw",
                "name": "Bloody Klaw",
                "damage": 20,
                "conditions": [
                      {
                            "type": "self_damage",
                            "value": 1,
                            "effect": {
                                  "type": "damage_self",
                                  "value": 1
                            }
                      }
                ],
                "description": "Deal 1 damage to this Avatar after using this skill.",
                "spektraCost": [
                      "fire",
                      "neutral",
                      "neutral",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/fire/avatars/Red Avatars_Ava - Boar Berserker - Myth.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-156",
  },
  {
    id: "fire-boar-witch-mythic",
    name: "Boar Witch",
    type: 'avatar',
    element: "fire",
    subType: "kujana",
    level: 2,
    attack: 7,
    health: 13,
    rarity: "Mythic",
    description: "Avatar - Kujana Witch",
    skills: [
          {
                "id": "purified-fire",
                "name": "Purified Fire",
                "damage": 7,
                "condition": "damage_to_self",
                "effectType": "heal",
                "description": "Deal 7 damage. If this avatar has damage counters, heal 2 damage.",
                "effectValue": 2,
                "spektraCost": [
                      "fire",
                      "fire",
                      "neutral",
                      "neutral"
                ],
                "effectTarget": "player_active",
                "conditionValue": 1
          }
    ],
    passiveSkill: {
          "id": "sacred-fire",
          "name": "Sacred Fire",
          "scope": "active_or_reserve",
          "damage": 0,
          "description": "Your active Fire Element Avatar gets +2 attack damage in their skills.",
          "spektraCost": [],
          "modifierType": "skill_damage_boost",
          "modifierValue": 2,
          "modifierCondition": "fire"
    },
    imagePath: "/cards/GENESIS/fire/avatars/Red Elemental Avatar for Apps_Ava - Boar Witch, Super Rare.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-157",
  },
]

export const csvFireSpellCards: ActionCard[] = [
  {
    id: "fire-flame-flicker",
    name: "Flame Flicker",
    type: "spell",
    element: "fire",
    rarity: "Uncommon",
    description: "Deal 2 damage to one enemy Avatar.",
    spektraCost: ["fire"],
    effectType: "damage",
    effectValue: 2,
    effectTarget: "select_opponent_avatar",
    imagePath: "/cards/GENESIS/fire/spells/Red Elemental Spell for Apps_Spell - Flame Flicker.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-025",
  },
  {
    id: "fire-heat-resonance",
    name: "Heat Resonance",
    type: "spell",
    element: "fire",
    rarity: "Common",
    description: "Deal 1 damage to opponent active avatar and 1 damage to each opponent reserve avatar.",
    spektraCost: ["fire","neutral"],
    effectType: "damage",
    effectValue: 1,
    effectValue2: 1,
    effectTarget: "all_opponent_avatars",
    imagePath: "/cards/GENESIS/fire/spells/Red Elemental Spell for Apps_Spell - Heat Resonance.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-026",
  },
  {
    id: "fire-inferno-fuel",
    name: "Inferno Fuel",
    type: "spell",
    element: "fire",
    rarity: "Common",
    description: "Heal 2 HP from your active avatar.",
    spektraCost: ["fire","fire"],
    effectType: "heal",
    effectValue: 2,
    effectTarget: "player_active",
    imagePath: "/cards/GENESIS/fire/spells/Red Elemental Spell for Apps_Spell - Inferno Fuel.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-027",
  },
  {
    id: "fire-searing-flame",
    name: "Searing Flame",
    type: "spell",
    element: "fire",
    rarity: "Uncommon",
    description: "Deal 2 damage to all opponent active and reserve avatars.",
    spektraCost: ["fire","fire","neutral"],
    effectType: "damage",
    effectValue: 2,
    effectTarget: "all_opponent_avatars",
    imagePath: "/cards/GENESIS/fire/spells/Red Elemental Spell for Apps_Spell - Searing Flame.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-028",
  },
  {
    id: "fire-burning-sight",
    name: "Burning Sight",
    type: "spell",
    element: "fire",
    rarity: "Uncommon",
    description: "Draw 2 card from your deck.",
    spektraCost: ["fire","fire","neutral","neutral"],
    effectType: "draw",
    effectValue: 2,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/fire/spells/Red Elemental Spell for Apps_Spell - Burning Sight.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-029",
  },
  {
    id: "fire-wild-combustion",
    name: "Wild Combustion",
    type: "spell",
    element: "fire",
    rarity: "Rare",
    description: "Deal 5 damage to enemy Active Avatar.",
    spektraCost: ["fire","fire","fire","neutral"],
    effectType: "damage",
    effectValue: 5,
    effectTarget: "opponent_active",
    imagePath: "/cards/GENESIS/fire/spells/Red Elemental Spell for Apps_Spell - Wild Combustion.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-030",
  },
  {
    id: "fire-flame-of-devastation",
    name: "Flame of Devastation",
    type: "spell",
    element: "fire",
    rarity: "Rare",
    description: "Deal 5 damage into 1 of your opponent avatar.",
    spektraCost: ["fire","fire","fire","fire","neutral"],
    effectType: "damage",
    effectValue: 5,
    effectTarget: "select_opponent_avatar",
    imagePath: "/cards/GENESIS/fire/spells/Red Elemental Spell for Apps_Spell - Flame of Devastation.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-031",
  },
  {
    id: "fire-flame-flicker-sr",
    name: "Flame Flicker",
    type: "spell",
    element: "fire",
    rarity: "Super Rare",
    description: "Deal 2 damage to one enemy Avatar.",
    spektraCost: ["fire"],
    effectType: "damage",
    effectValue: 2,
    effectTarget: "select_opponent_avatar",
    imagePath: "/cards/GENESIS/fire/spells/Red Elemental Spell_Fire SR - Flame Flicker.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-142",
  },
]

export const csvFireQuickSpellCards: ActionCard[] = [
  {
    id: "fire-ember-spark",
    name: "Ember Spark",
    type: "quickSpell",
    element: "fire",
    rarity: "Common",
    description: "Deal 1 damage to one enemy Avatar.",
    spektraCost: ["fire"],
    effectType: "damage",
    effectValue: 1,
    effectTarget: "select_opponent_avatar",
    imagePath: "/cards/GENESIS/fire/quickspells/Red Elemental Spell for Apps_Quick Spell - Ember Spark.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-032",
  },
  {
    id: "fire-volcanic-boost",
    name: "Volcanic Boost",
    type: "quickSpell",
    element: "fire",
    rarity: "Uncommon",
    description: "Deal 1 damage to opponent active avatar and 1 damage to one selected active or reserve avatar.",
    spektraCost: ["fire","neutral"],
    effectType: "damage",
    effectValue: 1,
    effectValue2: 1,
    effectTarget: "select_opponent_avatar",
    imagePath: "/cards/GENESIS/fire/quickspells/Red Elemental Spell for Apps_Quick Spell - Volcanic Boost.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-033",
  },
  {
    id: "fire-spark-shield",
    name: "Spark Shield",
    type: "quickSpell",
    element: "fire",
    rarity: "Common",
    description: "Target avatar get 1 shield counter.",
    spektraCost: ["fire","neutral","neutral"],
    effectType: "shield",
    effectValue: 1,
    effectTarget: "select_player_avatar",
    imagePath: "/cards/GENESIS/fire/quickspells/Red Elemental Spell for Apps_Quick Spell - Spark Shield.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-034",
  },
  {
    id: "fire-volcanic-boost-sr",
    name: "Volcanic Boost",
    type: "quickSpell",
    element: "fire",
    rarity: "Super Rare",
    description: "Deal 1 damage to opponent active avatar and 1 damage to one selected active or reserve avatar.",
    spektraCost: ["fire","neutral"],
    effectType: "damage",
    effectValue: 1,
    effectValue2: 1,
    effectTarget: "select_opponent_avatar",
    imagePath: "/cards/GENESIS/fire/quickspells/Red Elemental Spell_Fire SR - Volcanic Boost.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-143",
  },
  {
    id: "fire-spark-shield-mythic",
    name: "Spark Shield",
    type: "quickSpell",
    element: "fire",
    rarity: "Mythic",
    description: "Target avatar get 1 shield counter.",
    spektraCost: ["fire","neutral","neutral"],
    effectType: "shield",
    effectValue: 1,
    effectTarget: "select_player_avatar",
    imagePath: "/cards/GENESIS/fire/quickspells/Red Elemental Spell_Fire Mythic - Spark Shield.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-162",
  },
]

export const csvFireRitualArmorCards: ActionCard[] = [
  {
    id: "fire-burning-armor",
    name: "Burning Armor",
    type: "ritualArmor",
    element: "fire",
    rarity: "Rare",
    description: "Equipped avatar gain +2 damage in their skills",
    spektraCost: ["fire","fire","fire","fire"],
    imagePath: "/cards/GENESIS/fire/ritualarmor/Red Elemental Spell for Apps_Ritual Armor - Burning Armor.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-035",
  },
  {
    id: "fire-boiled-armor",
    name: "Boiled Armor",
    type: "ritualArmor",
    element: "fire",
    rarity: "Rare",
    description: "Everytime equipped avatar get damage from opponent Avatar, this card deal 2 damage to that card.",
    spektraCost: ["fire","fire","fire","fire","neutral"],
    imagePath: "/cards/GENESIS/fire/ritualarmor/Red Elemental Spell for Apps_Ritual Armor - Boiled Armor.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-036",
  },
  {
    id: "fire-burning-armor-sr",
    name: "Burning Armor",
    type: "ritualArmor",
    element: "fire",
    rarity: "Super Rare",
    description: "Equipped avatar gain +2 damage in their skills",
    spektraCost: ["fire","fire","fire","fire"],
    imagePath: "/cards/GENESIS/fire/ritualarmor/Red Elemental Spell_Fire SR - Burning Armor.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-144",
  },
  {
    id: "fire-boiled-armor-mythic",
    name: "Boiled Armor",
    type: "ritualArmor",
    element: "fire",
    rarity: "Mythic",
    description: "Everytime equipped avatar get damage from opponent Avatar, this card deal 2 damage to that card.",
    spektraCost: ["fire","fire","fire","fire","neutral"],
    imagePath: "/cards/GENESIS/fire/ritualarmor/Red Elemental Spell_Fire Mythic - Boiled Armor.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-163",
  },
]

export const csvFireFieldCards: FieldCard[] = [
  {
    id: "fire-burning-stage",
    name: "Burning Stage",
    type: 'field',
    element: "fire",
    rarity: "Common",
    description: "Fire element avatars on both sides gain +1 damage in their skills",
    spektraCost: ["fire","fire","fire","fire"],
    imagePath: "/cards/GENESIS/fire/fieldspells/Red Elemental Spell for Apps_Field Spell - Burning Stage.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-037",
  },
  {
    id: "fire-hell-stage",
    name: "Hell Stage",
    type: 'field',
    element: "fire",
    rarity: "Rare",
    description: "Non Fire element avatar, get 1 damage everytime its user draw a card.",
    spektraCost: ["fire","fire","neutral","neutral"],
    imagePath: "/cards/GENESIS/fire/fieldspells/Red Elemental Spell for Apps_Field Spell - Hell Stage.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-038",
  },
  {
    id: "fire-ashen-battlefield",
    name: "Ashen Battlefield",
    type: 'field',
    element: "fire",
    rarity: "Uncommon",
    description: "All Fire element avatar, heal 1 damage everytime its user draw a card.",
    spektraCost: ["fire","neutral"],
    imagePath: "/cards/GENESIS/fire/fieldspells/Red Elemental Spell for Apps_Field Stage - Ashen Battlefield.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-039",
  },
  {
    id: "fire-hell-stage-sr",
    name: "Hell Stage",
    type: 'field',
    element: "fire",
    rarity: "Super Rare",
    description: "Non Fire element avatar, get 1 damage everytime its user draw a card.",
    spektraCost: ["fire","fire","neutral","neutral"],
    imagePath: "/cards/GENESIS/fire/fieldspells/Red Elemental Spell_Fire SR - Hell Stage.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-145",
  },
]

export const csvWaterAvatarCards: AvatarCard[] = [
  {
    id: "water-fishmonger",
    name: "Fishmonger",
    type: 'avatar',
    element: "water",
    subType: "kujana",
    level: 1,
    attack: 1,
    health: 6,
    rarity: "Common",
    description: "Avatar - Kujana Human",
    skills: [
          {
                "id": "fish-knife",
                "name": "Fish Knife",
                "damage": 1,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "borah",
                                  "kobar"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 3
                            }
                      }
                ],
                "description": "This attack damage become 3 if the opponent is Borah or Kobar type avatar",
                "spektraCost": [
                      "water",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Fishmonger.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-040",
  },
  {
    id: "water-shaman-kujana",
    name: "Shaman",
    type: 'avatar',
    element: "water",
    subType: "kujana",
    level: 1,
    attack: 1,
    health: 6,
    rarity: "Common",
    description: "Avatar - Kujana Witch",
    skills: [
          {
                "id": "wild-torrent",
                "name": "Wild Torrent",
                "damage": 1,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 1 damage to opponent active avatar and 1 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "water",
                      "water"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Shaman B.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-041",
  },
  {
    id: "water-gal",
    name: "Gal",
    type: 'avatar',
    element: "water",
    subType: "kujana",
    level: 1,
    attack: 2,
    health: 5,
    rarity: "Common",
    description: "Avatar - Kujana Human",
    skills: [
          {
                "id": "slap",
                "name": "Slap",
                "damage": 2,
                "conditions": [],
                "description": "Basic slap attack",
                "spektraCost": [
                      "water"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Gal.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-042",
  },
  {
    id: "water-fisherman",
    name: "Fisherman",
    type: 'avatar',
    element: "water",
    subType: "kuhaka",
    level: 1,
    attack: 2,
    health: 8,
    rarity: "Common",
    description: "Avatar - Kuhaka Human",
    skills: [
          {
                "id": "whack",
                "name": "Whack",
                "damage": 2,
                "conditions": [],
                "description": "Physical strike",
                "spektraCost": [
                      "water",
                      "water"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Fisherman.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-043",
  },
  {
    id: "water-rich-thug",
    name: "Rich Thug",
    type: 'avatar',
    element: "water",
    subType: "kuhaka",
    level: 1,
    attack: 1,
    health: 5,
    rarity: "Common",
    description: "Avatar - Kuhaka Human",
    skills: [
          {
                "id": "kick",
                "name": "Kick",
                "damage": 1,
                "conditions": [],
                "description": "Basic attack",
                "spektraCost": [
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Rich Tug.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-044",
  },
  {
    id: "water-shaman-kuhaka",
    name: "Shaman",
    type: 'avatar',
    element: "water",
    subType: "kuhaka",
    level: 1,
    attack: 3,
    health: 6,
    rarity: "Common",
    description: "Avatar - Kuhaka Witch",
    skills: [
          {
                "id": "concentrated-water",
                "name": "Concentrated Water",
                "damage": 3,
                "conditions": [
                      {
                            "type": "self_damage",
                            "value": 1,
                            "effect": {
                                  "type": "damage_self",
                                  "value": 1
                            }
                      }
                ],
                "description": "Deal 1 damage into this Avatar",
                "spektraCost": [
                      "water",
                      "water"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Shaman A.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-045",
  },
  {
    id: "water-kobar-trainee-a",
    name: "Kobar Trainee A",
    type: 'avatar',
    element: "water",
    subType: "kobar",
    level: 1,
    attack: 1,
    health: 6,
    rarity: "Common",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "punch",
                "name": "Punch",
                "damage": 1,
                "conditions": [],
                "description": "Basic attack",
                "spektraCost": [
                      "water"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Kobar Trainee A.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-046",
  },
  {
    id: "water-kobar-trainee-b",
    name: "Kobar Trainee B",
    type: 'avatar',
    element: "water",
    subType: "kobar",
    level: 1,
    attack: 2,
    health: 5,
    rarity: "Common",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "kick",
                "name": "Kick",
                "damage": 2,
                "conditions": [],
                "description": "Basic attack",
                "spektraCost": [
                      "water",
                      "water"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Kobar Trainee B.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-047",
  },
  {
    id: "water-kobar-trainee-c",
    name: "Kobar Trainee C",
    type: 'avatar',
    element: "water",
    subType: "kobar",
    level: 1,
    attack: 1,
    health: 5,
    rarity: "Common",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "wildbone-blade",
                "name": "Wildbone Blade",
                "damage": 1,
                "conditions": [
                      {
                            "type": "opponent_element",
                            "value": [
                                  "fire"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 3
                            }
                      }
                ],
                "description": "This attack damage become 3 if the opponent is Fire Element Avatar",
                "spektraCost": [
                      "water",
                      "water"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Kobar Trainee C.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-048",
  },
  {
    id: "water-borah-trainee-a",
    name: "Borah Trainee A",
    type: 'avatar',
    element: "water",
    subType: "borah",
    level: 1,
    attack: 1,
    health: 5,
    rarity: "Common",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "kick",
                "name": "Kick",
                "damage": 1,
                "conditions": [],
                "description": "Basic attack",
                "spektraCost": [
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Borah Trainee A.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-049",
  },
  {
    id: "water-borah-trainee-b",
    name: "Borah Trainee B",
    type: 'avatar',
    element: "water",
    subType: "borah",
    level: 1,
    attack: 1,
    health: 5,
    rarity: "Common",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "water-whip",
                "name": "Water Whip",
                "damage": 1,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 1 damage to opponent active avatar and 1 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "water",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Borah Trainee B.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-050",
  },
  {
    id: "water-borah-trainee-c",
    name: "Borah Trainee C",
    type: 'avatar',
    element: "water",
    subType: "borah",
    level: 1,
    attack: 2,
    health: 6,
    rarity: "Uncommon",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "liquid-dance",
                "name": "Liquid Dance",
                "damage": 2,
                "conditions": [],
                "description": "Flowing water combat technique",
                "spektraCost": [
                      "water"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Borah Trainee C.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-051",
  },
  {
    id: "water-alice",
    name: "Alice",
    type: 'avatar',
    element: "water",
    subType: "borah",
    level: 2,
    attack: 14,
    health: 12,
    rarity: "Rare",
    description: "Avatar - Borah Warrior",
    skills: [
          {
                "id": "ice-calibur",
                "name": "Ice Calibur",
                "damage": 14,
                "conditions": [],
                "description": "Powerful ice sword strike",
                "spektraCost": [
                      "water",
                      "neutral",
                      "neutral",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    passiveSkill: {
          "name": "Frost Aura",
          "scope": "active_or_reserve",
          "damage": 0,
          "effect": "Enemy Fire Element Avatars get -2 attack damage in their skills.",
          "description": "Enemy Fire Element Avatars get -2 attack damage in their skills.",
          "spektraCost": []
    },
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Alice.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-052",
  },
  {
    id: "water-clear",
    name: "Clear",
    type: 'avatar',
    element: "water",
    subType: "borah",
    level: 2,
    attack: 3,
    health: 14,
    rarity: "Rare",
    description: "Avatar - Borah Gunner",
    skills: [
          {
                "id": "shoot",
                "name": "Shoot",
                "damage": 3,
                "conditions": [],
                "description": "Basic ranged attack",
                "spektraCost": [
                      "neutral"
                ]
          },
          {
                "id": "water-turret",
                "name": "Water Turret",
                "damage": 8,
                "conditions": [],
                "description": "Put 8 damage counter into 1 of opponent Avatar",
                "spektraCost": [
                      "water",
                      "water",
                      "water",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Clear.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-053",
  },
  {
    id: "water-maya",
    name: "Maya",
    type: 'avatar',
    element: "water",
    subType: "borah",
    level: 2,
    attack: 4,
    health: 16,
    rarity: "Uncommon",
    description: "Avatar - Borah Mage",
    skills: [
          {
                "id": "current-staff",
                "name": "Current Staff",
                "damage": 4,
                "conditions": [],
                "description": "Water staff attack",
                "spektraCost": [
                      "water",
                      "neutral"
                ]
          },
          {
                "id": "splashing-staff",
                "name": "Splashing Staff",
                "damage": 8,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 8 damage to opponent active avatar and 4 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "water",
                      "water",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Maya.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-054",
  },
  {
    id: "water-arctic",
    name: "Arctic",
    type: 'avatar',
    element: "water",
    subType: "kobar",
    level: 2,
    attack: 5,
    health: 15,
    rarity: "Rare",
    description: "Avatar - Kobar Assassin",
    skills: [
          {
                "id": "ice-dagger",
                "name": "Ice Dagger",
                "damage": 5,
                "conditions": [],
                "description": "Ice blade attack",
                "spektraCost": [
                      "water",
                      "neutral"
                ]
          },
          {
                "id": "ice-blade",
                "name": "Ice Blade",
                "damage": 7,
                "conditions": [
                      {
                            "type": "opponent_hp",
                            "value": 10,
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 10
                            }
                      }
                ],
                "description": "If you opponent active avatar has 10 or lower HP, this attack become 10",
                "spektraCost": [
                      "water",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Arctic.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-055",
  },
  {
    id: "water-langit",
    name: "Langit",
    type: 'avatar',
    element: "water",
    subType: "kobar",
    level: 2,
    attack: 2,
    health: 13,
    rarity: "Rare",
    description: "Avatar - Kobar Gunner",
    skills: [
          {
                "id": "water-gun",
                "name": "Water Gun",
                "damage": 2,
                "conditions": [],
                "description": "Water projectile attack",
                "spektraCost": [
                      "neutral"
                ]
          },
          {
                "id": "water-cannon",
                "name": "Water Cannon",
                "damage": 7,
                "conditions": [
                      {
                            "type": "hand_empty",
                            "value": true,
                            "effect": {
                                  "type": "draw_card",
                                  "value": 1
                            }
                      }
                ],
                "description": "If you dont have any card in hand, draw a card",
                "spektraCost": [
                      "water",
                      "water",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Langit.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-056",
  },
  {
    id: "water-sapphire",
    name: "Sapphire",
    type: 'avatar',
    element: "water",
    subType: "kobar",
    level: 2,
    attack: 3,
    health: 16,
    rarity: "Uncommon",
    description: "Avatar - Kobar Dancer",
    skills: [
          {
                "id": "aqua-whip",
                "name": "Aqua Whip",
                "damage": 3,
                "conditions": [],
                "description": "Water whip attack",
                "spektraCost": [
                      "water"
                ]
          },
          {
                "id": "water-dance",
                "name": "Water Dance",
                "damage": 9,
                "conditions": [
                      {
                            "type": "opponent_element",
                            "value": [
                                  "fire"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 12
                            }
                      }
                ],
                "description": "If your opponent active avatar has Fire Element, this attack become 12",
                "spektraCost": [
                      "water",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Sapphire.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-057",
  },
  {
    id: "water-banyu-ghost-kuhaka",
    name: "Banyu Ghost",
    type: 'avatar',
    element: "water",
    subType: "kuhaka",
    level: 2,
    attack: 7,
    health: 14,
    rarity: "Uncommon",
    description: "Avatar - Kuhaka Spirit",
    skills: [
          {
                "id": "bloody-cage",
                "name": "Bloody Cage",
                "damage": 7,
                "conditions": [
                      {
                            "type": "self_damage",
                            "value": 1,
                            "effect": {
                                  "type": "damage_self",
                                  "value": 1
                            }
                      }
                ],
                "description": "Deal 1 damage to this Avatar after using this skill",
                "spektraCost": [
                      "water",
                      "neutral",
                      "neutral"
                ]
          },
          {
                "id": "water-bomb",
                "name": "Water Bomb",
                "damage": 9,
                "conditions": [
                      {
                            "type": "draw_cards",
                            "value": 2,
                            "effect": {
                                  "type": "draw_cards",
                                  "value": 2
                            }
                      }
                ],
                "description": "Draw 2 cards",
                "spektraCost": [
                      "water",
                      "water",
                      "water",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Banyu Ghost.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-058",
  },
  {
    id: "water-lake-guardian",
    name: "Lake Guardian",
    type: 'avatar',
    element: "water",
    subType: "kuhaka",
    level: 2,
    attack: 3,
    health: 16,
    rarity: "Rare",
    description: "Avatar - Kuhaka Beast",
    skills: [
          {
                "id": "bite",
                "name": "Bite",
                "damage": 3,
                "conditions": [],
                "description": "Vicious bite attack",
                "spektraCost": [
                      "water"
                ]
          },
          {
                "id": "eternal-slumber",
                "name": "Eternal Slumber",
                "damage": 2,
                "conditions": [],
                "description": "If the target has 5 or below HP, destroy that Avatar.",
                "spektraCost": [
                      "water",
                      "water",
                      "neutral",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Lake Guardian.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-059",
  },
  {
    id: "water-the-count",
    name: "The Count",
    type: 'avatar',
    element: "water",
    subType: "kuhaka",
    level: 2,
    attack: 9,
    health: 15,
    rarity: "Rare",
    description: "Avatar - Kuhaka Warrior",
    skills: [
          {
                "id": "blood-blade",
                "name": "Blood Blade",
                "damage": 9,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "kobar",
                                  "borah"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 13
                            }
                      }
                ],
                "description": "This attack damage become 13 if the opponent is Kobar or Borah type.",
                "spektraCost": [
                      "water",
                      "neutral",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    passiveSkill: {
          "name": "Chilling Bone Mist",
          "scope": "active",
          "damage": 0,
          "effect": "Enemy non Kuhaka-Kujana type avatars have -1 attack damage in their skills",
          "description": "Enemy non Kuhaka-Kujana type avatars have -1 attack damage in their skills",
          "spektraCost": []
    },
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_The Count.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-060",
  },
  {
    id: "water-banyu-ghost-kujana",
    name: "Banyu Ghost",
    type: 'avatar',
    element: "water",
    subType: "kujana",
    level: 2,
    attack: 1,
    health: 13,
    rarity: "Uncommon",
    description: "Avatar - Kujana Spirit",
    skills: [
          {
                "id": "water-string",
                "name": "Water String",
                "damage": 1,
                "conditions": [
                      {
                            "type": "opponent_element",
                            "value": [
                                  "fire"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 4
                            }
                      }
                ],
                "description": "If your opponent active avatar were Fire Element, this skill damage become 4",
                "spektraCost": [
                      "water"
                ]
          },
          {
                "id": "water-splash",
                "name": "Water Splash",
                "damage": 5,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 5 damage to opponent active avatar and 3 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "water",
                      "water",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Banyu Ghost Fem.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-061",
  },
  {
    id: "water-pontia",
    name: "Pontia",
    type: 'avatar',
    element: "water",
    subType: "kujana",
    level: 2,
    attack: 2,
    health: 12,
    rarity: "Uncommon",
    description: "Avatar - Kujana Mage",
    skills: [
          {
                "id": "chilling-hand",
                "name": "Chilling Hand",
                "damage": 2,
                "conditions": [],
                "description": "Ice-cold touch attack",
                "spektraCost": [
                      "water"
                ]
          },
          {
                "id": "splashing-staff",
                "name": "Splashing Staff",
                "damage": 8,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "kobar",
                                  "borah"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 12
                            }
                      }
                ],
                "description": "This attack damage become 12 if the opponent is Kobar or Borah type",
                "spektraCost": [
                      "water",
                      "water",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Pontia.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-062",
  },
  {
    id: "water-whirlpool-demon",
    name: "Whirlpool Demon",
    type: 'avatar',
    element: "water",
    subType: "kujana",
    level: 2,
    attack: 1,
    health: 14,
    rarity: "Uncommon",
    description: "Avatar - Kujana Demon",
    skills: [
          {
                "id": "whirlpool",
                "name": "Whirlpool",
                "damage": 1,
                "conditions": [],
                "description": "Put 3 damage into all opponent reserve avatars.",
                "spektraCost": [
                      "water",
                      "neutral"
                ]
          },
          {
                "id": "water-torrent",
                "name": "Water Torrent",
                "damage": 10,
                "conditions": [],
                "description": "Put 5 damage counter into 1 of opponent reserve avatar.",
                "spektraCost": [
                      "water",
                      "neutral",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars Common-Uncommon-Rare_Whirlpool Demon.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-063",
  },
  {
    id: "water-fishmonger-sr",
    name: "Fishmonger",
    type: 'avatar',
    element: "water",
    subType: "kujana",
    level: 1,
    attack: 1,
    health: 6,
    rarity: "Super Rare",
    description: "Avatar - Kujana Human",
    skills: [
          {
                "id": "fish-knife",
                "name": "Fish Knife",
                "damage": 1,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "borah",
                                  "kobar"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 3
                            }
                      }
                ],
                "description": "This attack damage become 3 if the opponent is Borah or Kobar type avatar",
                "spektraCost": [
                      "water",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Fishmonger.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-118",
  },
  {
    id: "water-shaman-kujana-sr",
    name: "Shaman",
    type: 'avatar',
    element: "water",
    subType: "kujana",
    level: 1,
    attack: 1,
    health: 6,
    rarity: "Super Rare",
    description: "Avatar - Kujana Witch",
    skills: [
          {
                "id": "wild-torrent",
                "name": "Wild Torrent",
                "damage": 1,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 1 damage to opponent active avatar and 1 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "water",
                      "water"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Shaman B.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-119",
  },
  {
    id: "water-gal-sr",
    name: "Gal",
    type: 'avatar',
    element: "water",
    subType: "kujana",
    level: 1,
    attack: 2,
    health: 5,
    rarity: "Super Rare",
    description: "Avatar - Kujana Human",
    skills: [
          {
                "id": "slap",
                "name": "Slap",
                "damage": 2,
                "conditions": [],
                "description": "Basic slap attack",
                "spektraCost": [
                      "water"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Gal.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-120",
  },
  {
    id: "water-fisherman-sr",
    name: "Fisherman",
    type: 'avatar',
    element: "water",
    subType: "kuhaka",
    level: 1,
    attack: 2,
    health: 8,
    rarity: "Super Rare",
    description: "Avatar - Kuhaka Human",
    skills: [
          {
                "id": "whack",
                "name": "Whack",
                "damage": 2,
                "conditions": [],
                "description": "Physical strike",
                "spektraCost": [
                      "water",
                      "water"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Fisherman.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-121",
  },
  {
    id: "water-rich-thug-sr",
    name: "Rich Thug",
    type: 'avatar',
    element: "water",
    subType: "kuhaka",
    level: 1,
    attack: 1,
    health: 5,
    rarity: "Super Rare",
    description: "Avatar - Kuhaka Human",
    skills: [
          {
                "id": "kick",
                "name": "Kick",
                "damage": 1,
                "conditions": [],
                "description": "Basic attack",
                "spektraCost": [
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Rich Tug.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-122",
  },
  {
    id: "water-shaman-kuhaka-sr",
    name: "Shaman",
    type: 'avatar',
    element: "water",
    subType: "kuhaka",
    level: 1,
    attack: 3,
    health: 6,
    rarity: "Super Rare",
    description: "Avatar - Kuhaka Witch",
    skills: [
          {
                "id": "concentrated-water",
                "name": "Concentrated Water",
                "damage": 3,
                "conditions": [
                      {
                            "type": "self_damage",
                            "value": 1,
                            "effect": {
                                  "type": "damage_self",
                                  "value": 1
                            }
                      }
                ],
                "description": "Deal 1 damage into this Avatar",
                "spektraCost": [
                      "water",
                      "water"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Shaman A.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-123",
  },
  {
    id: "water-kobar-trainee-a-sr",
    name: "Kobar Trainee A",
    type: 'avatar',
    element: "water",
    subType: "kobar",
    level: 1,
    attack: 1,
    health: 6,
    rarity: "Super Rare",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "punch",
                "name": "Punch",
                "damage": 1,
                "conditions": [],
                "description": "Basic attack",
                "spektraCost": [
                      "water"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Kobar Trainee A.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-124",
  },
  {
    id: "water-kobar-trainee-b-sr",
    name: "Kobar Trainee B",
    type: 'avatar',
    element: "water",
    subType: "kobar",
    level: 1,
    attack: 2,
    health: 5,
    rarity: "Super Rare",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "kick",
                "name": "Kick",
                "damage": 2,
                "conditions": [],
                "description": "Basic attack",
                "spektraCost": [
                      "water",
                      "water"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Kobar Trainee B.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-125",
  },
  {
    id: "water-kobar-trainee-c-sr",
    name: "Kobar Trainee C",
    type: 'avatar',
    element: "water",
    subType: "kobar",
    level: 1,
    attack: 1,
    health: 5,
    rarity: "Super Rare",
    description: "Avatar - Kobar Fighter",
    skills: [
          {
                "id": "wildbone-blade",
                "name": "Wildbone Blade",
                "damage": 1,
                "conditions": [
                      {
                            "type": "opponent_element",
                            "value": [
                                  "fire"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 3
                            }
                      }
                ],
                "description": "This attack damage become 3 if the opponent is Fire Element Avatar",
                "spektraCost": [
                      "water",
                      "water"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Kobar Trainee C.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-126",
  },
  {
    id: "water-borah-trainee-a-sr",
    name: "Borah Trainee A",
    type: 'avatar',
    element: "water",
    subType: "borah",
    level: 1,
    attack: 1,
    health: 5,
    rarity: "Super Rare",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "kick",
                "name": "Kick",
                "damage": 1,
                "conditions": [],
                "description": "Basic attack",
                "spektraCost": [
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Borah Trainee A.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-127",
  },
  {
    id: "water-borah-trainee-b-sr",
    name: "Borah Trainee B",
    type: 'avatar',
    element: "water",
    subType: "borah",
    level: 1,
    attack: 1,
    health: 5,
    rarity: "Super Rare",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "water-whip",
                "name": "Water Whip",
                "damage": 1,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 1 damage to opponent active avatar and 1 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "water",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Borah Trainee B.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-128",
  },
  {
    id: "water-borah-trainee-c-sr",
    name: "Borah Trainee C",
    type: 'avatar',
    element: "water",
    subType: "borah",
    level: 1,
    attack: 2,
    health: 6,
    rarity: "Super Rare",
    description: "Avatar - Borah Fighter",
    skills: [
          {
                "id": "liquid-dance",
                "name": "Liquid Dance",
                "damage": 2,
                "conditions": [],
                "description": "Flowing water combat technique",
                "spektraCost": [
                      "water"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Borah Trainee C.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-129",
  },
  {
    id: "water-alice-sr",
    name: "Alice",
    type: 'avatar',
    element: "water",
    subType: "borah",
    level: 2,
    attack: 14,
    health: 12,
    rarity: "Super Rare",
    description: "Avatar - Borah Warrior",
    skills: [
          {
                "id": "ice-calibur",
                "name": "Ice Calibur",
                "damage": 14,
                "conditions": [],
                "description": "Powerful ice sword strike",
                "spektraCost": [
                      "water",
                      "neutral",
                      "neutral",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    passiveSkill: {
          "name": "Frost Aura",
          "scope": "active_or_reserve",
          "damage": 0,
          "effect": "Enemy Fire Element Avatars get -2 attack damage in their skills.",
          "description": "Enemy Fire Element Avatars get -2 attack damage in their skills.",
          "spektraCost": []
    },
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Alice.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-130",
  },
  {
    id: "water-clear-sr",
    name: "Clear",
    type: 'avatar',
    element: "water",
    subType: "borah",
    level: 2,
    attack: 3,
    health: 14,
    rarity: "Super Rare",
    description: "Avatar - Borah Gunner",
    skills: [
          {
                "id": "shoot",
                "name": "Shoot",
                "damage": 3,
                "conditions": [],
                "description": "Basic ranged attack",
                "spektraCost": [
                      "neutral"
                ]
          },
          {
                "id": "water-turret",
                "name": "Water Turret",
                "damage": 8,
                "conditions": [],
                "description": "Put 8 damage counter into 1 of opponent Avatar",
                "spektraCost": [
                      "water",
                      "water",
                      "water",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Clear.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-131",
  },
  {
    id: "water-maya-sr",
    name: "Maya",
    type: 'avatar',
    element: "water",
    subType: "borah",
    level: 2,
    attack: 4,
    health: 16,
    rarity: "Super Rare",
    description: "Avatar - Borah Mage",
    skills: [
          {
                "id": "current-staff",
                "name": "Current Staff",
                "damage": 4,
                "conditions": [],
                "description": "Water staff attack",
                "spektraCost": [
                      "water",
                      "neutral"
                ]
          },
          {
                "id": "splashing-staff",
                "name": "Splashing Staff",
                "damage": 8,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 8 damage to opponent active avatar and 4 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "water",
                      "water",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Maya.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-132",
  },
  {
    id: "water-arctic-sr",
    name: "Arctic",
    type: 'avatar',
    element: "water",
    subType: "kobar",
    level: 2,
    attack: 5,
    health: 15,
    rarity: "Super Rare",
    description: "Avatar - Kobar Assassin",
    skills: [
          {
                "id": "ice-dagger",
                "name": "Ice Dagger",
                "damage": 5,
                "conditions": [],
                "description": "Ice blade attack",
                "spektraCost": [
                      "water",
                      "neutral"
                ]
          },
          {
                "id": "ice-blade",
                "name": "Ice Blade",
                "damage": 7,
                "conditions": [
                      {
                            "type": "opponent_hp",
                            "value": 10,
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 10
                            }
                      }
                ],
                "description": "If you opponent active avatar has 10 or lower HP, this attack become 10",
                "spektraCost": [
                      "water",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Arctic.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-133",
  },
  {
    id: "water-langit-sr",
    name: "Langit",
    type: 'avatar',
    element: "water",
    subType: "kobar",
    level: 2,
    attack: 2,
    health: 13,
    rarity: "Super Rare",
    description: "Avatar - Kobar Gunner",
    skills: [
          {
                "id": "water-gun",
                "name": "Water Gun",
                "damage": 2,
                "conditions": [],
                "description": "Water projectile attack",
                "spektraCost": [
                      "neutral"
                ]
          },
          {
                "id": "water-cannon",
                "name": "Water Cannon",
                "damage": 7,
                "conditions": [
                      {
                            "type": "hand_empty",
                            "value": true,
                            "effect": {
                                  "type": "draw_card",
                                  "value": 1
                            }
                      }
                ],
                "description": "If you dont have any card in hand, draw a card",
                "spektraCost": [
                      "water",
                      "water",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Langit.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-134",
  },
  {
    id: "water-sapphire-sr",
    name: "Sapphire",
    type: 'avatar',
    element: "water",
    subType: "kobar",
    level: 2,
    attack: 3,
    health: 16,
    rarity: "Super Rare",
    description: "Avatar - Kobar Dancer",
    skills: [
          {
                "id": "aqua-whip",
                "name": "Aqua Whip",
                "damage": 3,
                "conditions": [],
                "description": "Water whip attack",
                "spektraCost": [
                      "water"
                ]
          },
          {
                "id": "water-dance",
                "name": "Water Dance",
                "damage": 9,
                "conditions": [
                      {
                            "type": "opponent_element",
                            "value": [
                                  "fire"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 12
                            }
                      }
                ],
                "description": "If your opponent active avatar has Fire Element, this attack become 12",
                "spektraCost": [
                      "water",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Sapphire.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-135",
  },
  {
    id: "water-banyu-ghost-kuhaka-sr",
    name: "Banyu Ghost",
    type: 'avatar',
    element: "water",
    subType: "kuhaka",
    level: 2,
    attack: 7,
    health: 14,
    rarity: "Super Rare",
    description: "Avatar - Kuhaka Spirit",
    skills: [
          {
                "id": "bloody-cage",
                "name": "Bloody Cage",
                "damage": 7,
                "conditions": [
                      {
                            "type": "self_damage",
                            "value": 1,
                            "effect": {
                                  "type": "damage_self",
                                  "value": 1
                            }
                      }
                ],
                "description": "Deal 1 damage to this Avatar after using this skill",
                "spektraCost": [
                      "water",
                      "neutral",
                      "neutral"
                ]
          },
          {
                "id": "water-bomb",
                "name": "Water Bomb",
                "damage": 9,
                "conditions": [
                      {
                            "type": "draw_cards",
                            "value": 2,
                            "effect": {
                                  "type": "draw_cards",
                                  "value": 2
                            }
                      }
                ],
                "description": "Draw 2 cards",
                "spektraCost": [
                      "water",
                      "water",
                      "water",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Banyu Ghost.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-136",
  },
  {
    id: "water-lake-guardian-sr",
    name: "Lake Guardian",
    type: 'avatar',
    element: "water",
    subType: "kuhaka",
    level: 2,
    attack: 3,
    health: 16,
    rarity: "Super Rare",
    description: "Avatar - Kuhaka Beast",
    skills: [
          {
                "id": "bite",
                "name": "Bite",
                "damage": 3,
                "conditions": [],
                "description": "Vicious bite attack",
                "spektraCost": [
                      "water"
                ]
          },
          {
                "id": "eternal-slumber",
                "name": "Eternal Slumber",
                "damage": 2,
                "conditions": [],
                "description": "If the target has 5 or below HP, destroy that Avatar.",
                "spektraCost": [
                      "water",
                      "water",
                      "neutral",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Lake Guardian.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-137",
  },
  {
    id: "water-the-count-sr",
    name: "The Count",
    type: 'avatar',
    element: "water",
    subType: "kuhaka",
    level: 2,
    attack: 9,
    health: 15,
    rarity: "Super Rare",
    description: "Avatar - Kuhaka Warrior",
    skills: [
          {
                "id": "blood-blade",
                "name": "Blood Blade",
                "damage": 9,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "kobar",
                                  "borah"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 13
                            }
                      }
                ],
                "description": "This attack damage become 13 if the opponent is Kobar or Borah type.",
                "spektraCost": [
                      "water",
                      "neutral",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    passiveSkill: {
          "name": "Chilling Bone Mist",
          "scope": "active",
          "damage": 0,
          "effect": "Enemy non Kuhaka-Kujana type avatars have -1 attack damage in their skills",
          "description": "Enemy non Kuhaka-Kujana type avatars have -1 attack damage in their skills",
          "spektraCost": []
    },
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_The Count.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-138",
  },
  {
    id: "water-banyu-ghost-kujana-sr",
    name: "Banyu Ghost",
    type: 'avatar',
    element: "water",
    subType: "kujana",
    level: 2,
    attack: 1,
    health: 13,
    rarity: "Super Rare",
    description: "Avatar - Kujana Spirit",
    skills: [
          {
                "id": "water-string",
                "name": "Water String",
                "damage": 1,
                "conditions": [
                      {
                            "type": "opponent_element",
                            "value": [
                                  "fire"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 4
                            }
                      }
                ],
                "description": "If your opponent active avatar were Fire Element, this skill damage become 4",
                "spektraCost": [
                      "water"
                ]
          },
          {
                "id": "water-splash",
                "name": "Water Splash",
                "damage": 5,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 5 damage to opponent active avatar and 3 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "water",
                      "water",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Banyu Ghost Fem.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-139",
  },
  {
    id: "water-pontia-sr",
    name: "Pontia",
    type: 'avatar',
    element: "water",
    subType: "kujana",
    level: 2,
    attack: 2,
    health: 12,
    rarity: "Super Rare",
    description: "Avatar - Kujana Mage",
    skills: [
          {
                "id": "chilling-hand",
                "name": "Chilling Hand",
                "damage": 2,
                "conditions": [],
                "description": "Ice-cold touch attack",
                "spektraCost": [
                      "water"
                ]
          },
          {
                "id": "splashing-staff",
                "name": "Splashing Staff",
                "damage": 8,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "kobar",
                                  "borah"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 12
                            }
                      }
                ],
                "description": "This attack damage become 12 if the opponent is Kobar or Borah type",
                "spektraCost": [
                      "water",
                      "water",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Pontia.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-140",
  },
  {
    id: "water-whirlpool-demon-sr",
    name: "Whirlpool Demon",
    type: 'avatar',
    element: "water",
    subType: "kujana",
    level: 2,
    attack: 1,
    health: 14,
    rarity: "Super Rare",
    description: "Avatar - Kujana Demon",
    skills: [
          {
                "id": "whirlpool",
                "name": "Whirlpool",
                "damage": 1,
                "conditions": [],
                "description": "Put 3 damage into all opponent reserve avatars.",
                "spektraCost": [
                      "water",
                      "neutral"
                ]
          },
          {
                "id": "water-torrent",
                "name": "Water Torrent",
                "damage": 10,
                "conditions": [],
                "description": "Put 5 damage counter into 1 of opponent reserve avatar.",
                "spektraCost": [
                      "water",
                      "neutral",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Whirlpool Demon.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-141",
  },
  {
    id: "water-maya-mythic",
    name: "Maya",
    type: 'avatar',
    element: "water",
    subType: "borah",
    level: 2,
    attack: 4,
    health: 16,
    rarity: "Mythic",
    description: "Avatar - Borah Mage",
    skills: [
          {
                "id": "current-staff",
                "name": "Current Staff",
                "damage": 4,
                "conditions": [],
                "description": "Water staff attack",
                "spektraCost": [
                      "water",
                      "neutral"
                ]
          },
          {
                "id": "splashing-staff",
                "name": "Splashing Staff",
                "damage": 8,
                "target": "opponent_active_and_all_reserve",
                "conditions": [],
                "description": "Deal 8 damage to opponent active avatar and 4 damage to each opponent reserve avatar.",
                "spektraCost": [
                      "water",
                      "water",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Maya, Rare.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-158",
  },
  {
    id: "water-sapphire-mythic",
    name: "Sapphire",
    type: 'avatar',
    element: "water",
    subType: "kobar",
    level: 2,
    attack: 3,
    health: 16,
    rarity: "Mythic",
    description: "Avatar - Kobar Dancer",
    skills: [
          {
                "id": "aqua-whip",
                "name": "Aqua Whip",
                "damage": 3,
                "conditions": [],
                "description": "Water whip attack",
                "spektraCost": [
                      "water"
                ]
          },
          {
                "id": "water-dance",
                "name": "Water Dance",
                "damage": 9,
                "conditions": [
                      {
                            "type": "opponent_element",
                            "value": [
                                  "fire"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 12
                            }
                      }
                ],
                "description": "If your opponent active avatar has Fire Element, this attack become 12",
                "spektraCost": [
                      "water",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_Sapphire, Super Rare.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-159",
  },
  {
    id: "water-the-count-mythic",
    name: "The Count",
    type: 'avatar',
    element: "water",
    subType: "kuhaka",
    level: 2,
    attack: 9,
    health: 15,
    rarity: "Mythic",
    description: "Avatar - Kuhaka Warrior",
    skills: [
          {
                "id": "blood-blade",
                "name": "Blood Blade",
                "damage": 9,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "kobar",
                                  "borah"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 13
                            }
                      }
                ],
                "description": "This attack damage become 13 if the opponent is Kobar or Borah type.",
                "spektraCost": [
                      "water",
                      "neutral",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    passiveSkill: {
          "name": "Chilling Bone Mist",
          "scope": "active",
          "damage": 0,
          "effect": "Enemy non Kuhaka-Kujana type avatars have -1 attack damage in their skills",
          "description": "Enemy non Kuhaka-Kujana type avatars have -1 attack damage in their skills",
          "spektraCost": []
    },
    imagePath: "/cards/GENESIS/water/avatars/Blue Elemental Avatar for Apps_The Count, Super Rare.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-160",
  },
  {
    id: "water-pontia-mythic",
    name: "Pontia",
    type: 'avatar',
    element: "water",
    subType: "kujana",
    level: 2,
    attack: 2,
    health: 12,
    rarity: "Mythic",
    description: "Avatar - Kujana Mage",
    skills: [
          {
                "id": "chilling-hand",
                "name": "Chilling Hand",
                "damage": 2,
                "conditions": [],
                "description": "Ice-cold touch attack",
                "spektraCost": [
                      "water"
                ]
          },
          {
                "id": "splashing-staff",
                "name": "Splashing Staff",
                "damage": 8,
                "conditions": [
                      {
                            "type": "opponent_tribe",
                            "value": [
                                  "kobar",
                                  "borah"
                            ],
                            "effect": {
                                  "type": "damage_modification",
                                  "value": 12
                            }
                      }
                ],
                "description": "This attack damage become 12 if the opponent is Kobar or Borah type",
                "spektraCost": [
                      "water",
                      "water",
                      "neutral",
                      "neutral"
                ]
          }
    ],
    imagePath: "/cards/GENESIS/water/avatars/Blue Avatars_Ava - Pontias - Myth.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-161",
  },
]

export const csvWaterSpellCards: ActionCard[] = [
  {
    id: "water-telang-tea",
    name: "Telang Tea",
    type: "spell",
    element: "water",
    rarity: "Uncommon",
    description: "",
    spektraCost: ["water","water"],
    effectType: "heal",
    effectValue: 3,
    effectTarget: "select_player_avatar",
    imagePath: "/cards/GENESIS/water/spells/Blue Elemental Spell for Apps_Spell - Telang Tea.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-064",
  },
  {
    id: "water-ocean-memory",
    name: "Ocean Memory",
    type: "spell",
    element: "water",
    rarity: "Common",
    description: "",
    spektraCost: ["water"],
    effectType: "draw_discard",
    effectValue: 1,
    effectValue2: 1,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/water/spells/Blue Elemental Spell for Apps_Spell - Ocean Memory.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-065",
  },
  {
    id: "water-liquid-book",
    name: "Liquid Book",
    type: "spell",
    element: "water",
    rarity: "Uncommon",
    description: "",
    spektraCost: ["water","neutral"],
    effectType: "reveal_choose",
    effectValue: 2,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/water/spells/Blue Elemental Spell for Apps_Spell - Liquid Book.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-066",
  },
  {
    id: "water-dew-drop",
    name: "Dew Drop",
    type: "spell",
    element: "water",
    rarity: "Uncommon",
    description: "",
    spektraCost: ["water","water"],
    effectType: "peek_place_draw",
    effectValue: 1,
    effectValue2: 1,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/water/spells/Blue Elemental Spell for Apps_Spell - Dew Drop.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-067",
  },
  {
    id: "water-healing-current",
    name: "Healing Current",
    type: "spell",
    element: "water",
    rarity: "Common",
    description: "",
    spektraCost: ["water","water","neutral"],
    effectType: "heal",
    effectValue: 2,
    effectTarget: "all_player_water_avatars",
    imagePath: "/cards/GENESIS/water/spells/Blue Elemental Spell for Apps_Spell - Healing Current.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-068",
  },
  {
    id: "water-deepsea-insight",
    name: "Deepsea Insight",
    type: "spell",
    element: "water",
    rarity: "Uncommon",
    description: "",
    spektraCost: ["water"],
    effectType: "reveal_choose",
    effectValue: 3,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/water/spells/Blue Elemental Spell for Apps_Spell - Deepsea Insight.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-069",
  },
  {
    id: "water-water-current",
    name: "Water Current",
    type: "spell",
    element: "water",
    rarity: "Uncommon",
    description: "",
    spektraCost: ["water","water","water","neutral"],
    effectType: "discard_draw",
    effectValue: 3,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/water/spells/Blue Elemental Spell for Apps_Spell - Water Current.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-070",
  },
  {
    id: "water-check",
    name: "Check",
    type: "spell",
    element: "water",
    rarity: "Common",
    description: "",
    spektraCost: ["water"],
    effectType: "peek_place",
    effectValue: 1,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/water/spells/Blue Elemental Spell for Apps_Spell - Check.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-074",
  },
  {
    id: "water-liquid-book-sr",
    name: "Liquid Book",
    type: "spell",
    element: "water",
    rarity: "Super Rare",
    description: "",
    spektraCost: ["water","neutral"],
    effectType: "reveal_choose",
    effectValue: 2,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/water/spells/Blue Elemental Spell_Water SR - Liquid Book.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-146",
  },
  {
    id: "water-telang-tea-mythic",
    name: "Telang Tea",
    type: "spell",
    element: "water",
    rarity: "Mythic",
    description: "",
    spektraCost: ["water","water"],
    effectType: "heal",
    effectValue: 3,
    effectTarget: "select_player_avatar",
    imagePath: "/cards/GENESIS/water/spells/Blue Elemental Spell_Water Mythic - Telang Tea.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-164",
  },
  {
    id: "water-ocean-memory-mythic",
    name: "Ocean Memory",
    type: "spell",
    element: "water",
    rarity: "Mythic",
    description: "",
    spektraCost: ["water"],
    effectType: "draw_discard",
    effectValue: 1,
    effectValue2: 1,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/water/spells/Blue Elemental Spell_Water Mythic - Ocean Memory.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-165",
  },
]

export const csvWaterQuickSpellCards: ActionCard[] = [
  {
    id: "water-relearn",
    name: "Relearn",
    type: "quickSpell",
    element: "water",
    rarity: "Uncommon",
    description: "",
    spektraCost: ["water","neutral","neutral"],
    effectType: "draw",
    effectValue: 2,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/water/quickspells/Blue Elemental Spell for Apps_Quick Spell - Relearn.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-073",
  },
  {
    id: "water-water-shield",
    name: "Water Shield",
    type: "quickSpell",
    element: "water",
    rarity: "Common",
    description: "",
    spektraCost: ["water","water"],
    effectType: "shield",
    effectValue: 2,
    effectTarget: "select_player_avatar",
    imagePath: "/cards/GENESIS/water/quickspells/Blue Elemental Spell for Apps_Quick Spell - Water Shield.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-075",
  },
  {
    id: "water-energize",
    name: "Energize",
    type: "quickSpell",
    element: "water",
    rarity: "Common",
    description: "",
    spektraCost: ["water","water","neutral","neutral"],
    effectType: "heal",
    effectValue: 3,
    effectTarget: "all_player_avatars",
    imagePath: "/cards/GENESIS/water/quickspells/Blue Elemental Spell for Apps_Quick Spell - Energize.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-076",
  },
  {
    id: "water-blink",
    name: "Blink",
    type: "quickSpell",
    element: "water",
    rarity: "Common",
    description: "",
    spektraCost: ["water","water","neutral"],
    effectType: "counter",
    effectValue: 1,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/water/quickspells/Blue Elemental Spell for Apps_Quick Spell - Blink.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-077",
  },
  {
    id: "water-water-shield-sr",
    name: "Water Shield",
    type: "quickSpell",
    element: "water",
    rarity: "Super Rare",
    description: "",
    spektraCost: ["water","water"],
    effectType: "shield",
    effectValue: 2,
    effectTarget: "select_player_avatar",
    imagePath: "/cards/GENESIS/water/quickspells/Blue Elemental Spell_Water SR - Water Shield.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-147",
  },
  {
    id: "water-blink-sr",
    name: "Blink",
    type: "quickSpell",
    element: "water",
    rarity: "Super Rare",
    description: "",
    spektraCost: ["water","water","neutral"],
    effectType: "counter",
    effectValue: 1,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/water/quickspells/Blue Elemental Spell_Water SR - Blink.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-148",
  },
]

export const csvWaterRitualArmorCards: ActionCard[] = [
  {
    id: "water-glacier-armor",
    name: "Glacier Armor",
    type: "ritualArmor",
    element: "water",
    rarity: "Uncommon",
    description: "",
    spektraCost: ["water","water","water","water"],
    imagePath: "/cards/GENESIS/water/ritualarmor/Blue Elemental Spell for Apps_Ritual Armor - Glacier Armor.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-071",
  },
  {
    id: "water-frozen-body",
    name: "Frozen Body",
    type: "ritualArmor",
    element: "water",
    rarity: "Common",
    description: "",
    spektraCost: ["water","water","water","neutral","neutral"],
    imagePath: "/cards/GENESIS/water/ritualarmor/Blue Elemental Spell for Apps_Ritual Armor - Frozen Body.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-072",
  },
]

export const csvWaterFieldCards: FieldCard[] = [
  {
    id: "water-lake-stage",
    name: "Lake Stage",
    type: 'field',
    element: "water",
    rarity: "Common",
    description: "Water element Avatar gain +1 damage in their skills",
    spektraCost: ["water","water","water"],
    imagePath: "/cards/GENESIS/water/fieldspells/Blue Elemental Spell for Apps_Field Spell - Lake Stage.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-078",
  },
  {
    id: "water-glacier-stage",
    name: "Glacier Stage",
    type: 'field',
    element: "water",
    rarity: "Uncommon",
    description: "Fire element Avatar skill get -2 damage in their skills",
    spektraCost: ["water","water","water","neutral","neutral"],
    imagePath: "/cards/GENESIS/water/fieldspells/Blue Elemental Spell for Apps_Field Spell - Glacier Stage.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-079",
  },
  {
    id: "water-city-river",
    name: "City River",
    type: 'field',
    element: "water",
    rarity: "Uncommon",
    description: "Everytime Water element Avatar using skill, its user draw 1 card from deck",
    spektraCost: ["water","water","neutral","neutral"],
    imagePath: "/cards/GENESIS/water/fieldspells/Blue Elemental Spell for Apps_Field Spell - City River.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-080",
  },
  {
    id: "water-glacier-stage-sr",
    name: "Glacier Stage",
    type: 'field',
    element: "water",
    rarity: "Super Rare",
    description: "Fire element Avatar skill get -2 damage in their skills",
    spektraCost: ["water","water","water","neutral","neutral"],
    imagePath: "/cards/GENESIS/water/fieldspells/Blue Elemental Spell_Water SR - Glacier Stage.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-149",
  },
]

export const csvNeutralCards: (ActionCard | FieldCard)[] = [
  {
    id: "neutral-battle-preparation",
    name: "Battle Preparation",
    type: "item",
    element: "neutral",
    rarity: "Uncommon",
    description: "Discard all cards in hand, then draw 5 cards from deck.",
    effectType: "discard_draw",
    effectValue: 5,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Item - Battle Preps.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-081",
  },
  {
    id: "neutral-graveyard-relic",
    name: "Graveyard Relic",
    type: "item",
    element: "neutral",
    rarity: "Rare",
    description: "Discard 2 card, then choose 1 Avatar card from graveyard and put it into your hand.",
    effectType: "discard_search",
    effectValue: 2,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Item - Graveyard Relic.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-082",
  },
  {
    id: "neutral-jamu-jahe-merah",
    name: "Jamu Jahe Merah",
    type: "item",
    element: "neutral",
    rarity: "Common",
    description: "Discard a card, then heal 5 damage from target avatar.",
    effectType: "discard_heal",
    effectValue: 1,
    effectValue2: 5,
    effectTarget: "select_player_avatar",
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Item - Jamu Jahe Merah.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-083",
  },
  {
    id: "neutral-jamu-kencur",
    name: "Jamu Kencur",
    type: "item",
    element: "neutral",
    rarity: "Common",
    description: "Heal 3 damage from target Avatar.",
    effectType: "heal",
    effectValue: 3,
    effectTarget: "select_player_avatar",
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Item - Kencur.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-084",
  },
  {
    id: "neutral-recruitment-scroll",
    name: "Recruitment Scroll",
    type: "item",
    element: "neutral",
    rarity: "Uncommon",
    description: "Discard 1 Avatar card, then search the deck for an Avatar card who has same element with the discarded card.",
    effectType: "discard_search",
    effectValue: 1,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Item - Rec Scroll.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-085",
  },
  {
    id: "neutral-prize",
    name: "Prize",
    type: "spell",
    element: "neutral",
    rarity: "Common",
    description: "Draw 1 card.",
    spektraCost: ["neutral"],
    effectType: "draw",
    effectValue: 1,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Spell - Prize.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-086",
  },
  {
    id: "neutral-golden-crates",
    name: "Golden Crates",
    type: "spell",
    element: "neutral",
    rarity: "Uncommon",
    description: "Draw 2 card.",
    spektraCost: ["neutral","neutral"],
    effectType: "draw",
    effectValue: 2,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Spell - Golden Crates.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-087",
  },
  {
    id: "neutral-crates",
    name: "Crates",
    type: "quickSpell",
    element: "neutral",
    rarity: "Common",
    description: "Draw 1 card.",
    spektraCost: ["neutral","neutral"],
    effectType: "draw",
    effectValue: 1,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Spell - Crates.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-088",
  },
  {
    id: "neutral-energy-dagger",
    name: "Energy Dagger",
    type: "equipment",
    element: "neutral",
    rarity: "Uncommon",
    description: "After this card casted, equip it into target Avatar. Target avatar get ability, +1 damage each time you pay extra energy when attacking opponent. Pay 1 to equip into another Avatar.",
    spektraCost: ["neutral","neutral","neutral"],
    effectType: "buff",
    effectValue: 1,
    effectTarget: "select_player_avatar",
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Equipment - Energy Dagger.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-089",
  },
  {
    id: "neutral-livin-dagger",
    name: "Livin Dagger",
    type: "equipment",
    element: "neutral",
    rarity: "Common",
    description: "After this card casted, equip it into target Kuhaka/Kujana Avatar. Equipped avatar get ability +1 damage when attacking opponent. And get 1 damage to itself each attack. Pay 1 to equip into another Avatar.",
    spektraCost: ["neutral","neutral"],
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Equipment - Livin Dagger.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-090",
  },
  {
    id: "neutral-sacred-box",
    name: "Sacred Box",
    type: "equipment",
    element: "neutral",
    rarity: "Rare",
    description: "After this card casted, equip it into target Kobar/Borah Avatar. Equipped avatar get ability remove 1 battle damage each attack. Pay 1 to equip into another Avatar. You cant have more than 1 Sacred Box on field.",
    spektraCost: ["neutral","neutral","neutral","neutral"],
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Equipment - Sacred Box.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-091",
  },
  {
    id: "neutral-battle-preparation-sr",
    name: "Battle Preparation",
    type: "item",
    element: "neutral",
    rarity: "Super Rare",
    description: "Discard all cards in hand, then draw 5 cards from deck.",
    effectType: "discard_draw",
    effectValue: 5,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Neutral SR - Battle Preparation.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-150",
  },
  {
    id: "neutral-prize-sr",
    name: "Prize",
    type: "spell",
    element: "neutral",
    rarity: "Super Rare",
    description: "Draw 1 card.",
    spektraCost: ["neutral"],
    effectType: "draw",
    effectValue: 1,
    effectTarget: "player",
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Neutral SR - Prize.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-151",
  },
  {
    id: "neutral-sacred-box-sr",
    name: "Sacred Box",
    type: "equipment",
    element: "neutral",
    rarity: "Super Rare",
    description: "After this card casted, equip it into target Kobar/Borah Avatar. Equipped avatar get ability remove 1 battle damage each attack. Pay 1 to equip into another Avatar. You cant have more than 1 Sacred Box on field.",
    spektraCost: ["neutral","neutral","neutral","neutral"],
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Neutral SR - Sacred Box.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-152",
  },
  {
    id: "neutral-livin-dagger-mythic",
    name: "Livin Dagger",
    type: "equipment",
    element: "neutral",
    rarity: "Mythic",
    description: "After this card casted, equip it into target Kuhaka/Kujana Avatar. Equipped avatar get ability +1 damage when attacking opponent. And get 1 damage to itself each attack. Pay 1 to equip into another Avatar.",
    spektraCost: ["neutral","neutral"],
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Neutral Mythic - Livin Dagger.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-166",
  },
  {
    id: "neutral-haunted-stage",
    name: "Haunted Stage",
    type: 'field',
    element: "neutral",
    rarity: "Uncommon",
    description: "Avatars with Kuhaka and Kujana type get +1 additional damage. Also the avatar get 1 damage counter after attacking.",
    spektraCost: ["neutral","neutral","neutral","neutral"],
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Field Spell - Haunted Stage.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-092",
  },
  {
    id: "neutral-sanggar",
    name: "Sanggar",
    type: 'field',
    element: "neutral",
    rarity: "Uncommon",
    description: "Avatars with Kobar or Borah type get +2 max HP. Reduce every attack from non Kobar and Borah type by one damage (aftermath)",
    spektraCost: ["neutral","neutral","neutral","neutral"],
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Field Spell - Sanggar.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-093",
  },
  {
    id: "neutral-sanggar-sr",
    name: "Sanggar",
    type: 'field',
    element: "neutral",
    rarity: "Super Rare",
    description: "Avatars with Kobar or Borah type get +2 max HP. Reduce every attack from non Kobar and Borah type by one damage (aftermath)",
    spektraCost: ["neutral","neutral","neutral","neutral"],
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Neutral SR - Sanggar.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-153",
  },
  {
    id: "neutral-haunted-stage-mythic",
    name: "Haunted Stage",
    type: 'field',
    element: "neutral",
    rarity: "Mythic",
    description: "Avatars with Kuhaka and Kujana type get +1 additional damage. Also the avatar get 1 damage counter after attacking.",
    spektraCost: ["neutral","neutral","neutral","neutral"],
    imagePath: "/cards/GENESIS/neutral/Non Elemental For Apps_Neutral Mythic - Haunted Stage.webp",
    expansion: "Fire and Water",
    cardNumber: "GEN-167",
  },
]

export const allCsvCards = [
  ...csvFireAvatarCards,
  ...csvFireSpellCards,
  ...csvFireQuickSpellCards,
  ...csvFireRitualArmorCards,
  ...csvFireFieldCards,
  ...csvWaterAvatarCards,
  ...csvWaterSpellCards,
  ...csvWaterQuickSpellCards,
  ...csvWaterRitualArmorCards,
  ...csvWaterFieldCards,
  ...csvNeutralCards,
] as const
