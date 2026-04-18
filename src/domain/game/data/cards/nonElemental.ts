import { ActionCard, FieldCard } from '../../types/card';

// Non-Elemental Item Cards
export const nonElementalItemCards: ActionCard[] = [
  {
    id: 'battle-preparation',
    name: 'Battle Preparation',
    type: 'item',
    element: 'neutral',
    spektraCost: [],
    description: 'Discard all cards in hand, then draw 5 cards from deck.',
    art: '/cards/GENESIS/neutral/Non Elemental For Apps_Item - Battle Preps.webp',
    rarity: 'Uncommon',
    expansion: 'Fire and Water',
    subType: 'utility',
    effectType: 'discard_draw',
    effectValue: 5,
    effectTarget: 'player',
    cardNumber: 'GEN-089'
  },
  {
    id: 'graveyard-relic',
    name: 'Graveyard Relic',
    type: 'item',
    element: 'neutral',
    spektraCost: [],
    description: 'Discard 2 card, then choose 1 Avatar card from graveyard and put it into your hand.',
    art: '/cards/GENESIS/neutral/Non Elemental For Apps_Item - Graveyard Relic.webp',
    rarity: 'Rare',
    expansion: 'Fire and Water',
    subType: 'utility',
    effectType: 'discard_retrieve',
    effectValue: 2,
    effectValue2: 1,
    effectTarget: 'player',
    cardNumber: 'GEN-090'
  },
  {
    id: 'jamu-jahe-merah',
    name: 'Jamu Jahe Merah',
    type: 'item',
    element: 'neutral',
    spektraCost: [],
    description: 'Discard a card, then heal 5 damage from target avatar.',
    art: '/cards/GENESIS/neutral/Non Elemental For Apps_Item - Jamu Jahe Merah.webp',
    rarity: 'Common',
    expansion: 'Fire and Water',
    subType: 'healing',
    effectType: 'discard_heal',
    effectValue: 1,
    effectValue2: 5,
    effectTarget: 'select_player_avatar',
    cardNumber: 'GEN-091'
  },
  {
    id: 'jamu-kencur',
    name: 'Jamu Kencur',
    type: 'item',
    element: 'neutral',
    spektraCost: [],
    description: 'Heal 3 damage from target Avatar.',
    art: '/cards/GENESIS/neutral/Non Elemental For Apps_Item - Kencur.webp',
    rarity: 'Common',
    expansion: 'Fire and Water',
    subType: 'healing',
    effectType: 'heal',
    effectValue: 3,
    effectTarget: 'select_player_avatar',
    cardNumber: 'GEN-092'
  },
  {
    id: 'recruitment-scroll',
    name: 'Recruitment Scroll',
    type: 'item',
    element: 'neutral',
    spektraCost: [],
    description: 'Discard 1 Avatar card, then search the deck for an Avatar card who has same element with the discarded card.',
    art: '/cards/GENESIS/neutral/Non Elemental For Apps_Item - Rec Scroll.webp',
    rarity: 'Uncommon',
    expansion: 'Fire and Water',
    subType: 'utility',
    effectType: 'discard_search',
    effectValue: 1,
    effectTarget: 'player',
    cardNumber: 'GEN-093'
  }
];

// Non-Elemental Spell Cards
export const nonElementalSpellCards: ActionCard[] = [
  {
    id: 'prize',
    name: 'Prize',
    type: 'spell',
    element: 'neutral',
    spektraCost: ['neutral'],
    description: 'Draw 1 card.',
    art: '/cards/GENESIS/neutral/Non Elemental For Apps_Spell - Prize.webp',
    rarity: 'Common',
    expansion: 'Fire and Water',
    subType: 'utility',
    effectType: 'draw',
    effectValue: 1,
    effectTarget: 'player',
    cardNumber: 'GEN-094'
  },
  {
    id: 'golden-crates',
    name: 'Golden Crates',
    type: 'spell',
    element: 'neutral',
    spektraCost: ['neutral', 'neutral'],
    description: 'Draw 2 card.',
    art: '/cards/GENESIS/neutral/Non Elemental For Apps_Spell - Golden Crates.webp',
    rarity: 'Uncommon',
    expansion: 'Fire and Water',
    subType: 'utility',
    effectType: 'draw',
    effectValue: 2,
    effectTarget: 'player',
    cardNumber: 'GEN-095'
  }
];

// Non-Elemental Quick Spell Cards
export const nonElementalQuickSpellCards: ActionCard[] = [
  {
    id: 'crates',
    name: 'Crates',
    type: 'quickSpell',
    element: 'neutral',
    spektraCost: ['neutral', 'neutral'],
    description: 'Draw 1 card.',
    art: '/cards/GENESIS/neutral/Non Elemental For Apps_Spell - Crates.webp',
    rarity: 'Common',
    expansion: 'Fire and Water',
    subType: 'utility',
    effectType: 'draw',
    effectValue: 1,
    effectTarget: 'player',
    cardNumber: 'GEN-096'
  }
];

// Non-Elemental Equipment Cards
export const nonElementalEquipmentCards: ActionCard[] = [
  {
    id: 'energy-dagger',
    name: 'Energy Dagger',
    type: 'equipment',
    element: 'neutral',
    spektraCost: ['neutral', 'neutral', 'neutral'],
    description: 'After this card casted, equip it into target Avatar. Target avatar get ability, +1 damage each time you pay extra energy when attacking opponent. Pay 1 to equip into another Avatar.',
    effect: 'Equip to target avatar. Avatar gains +1 damage when you pay extra energy during attacks. Pay 1 to re-equip.',
    art: '/cards/GENESIS/neutral/Non Elemental For Apps_Equipment - Energy Dagger.webp',
    rarity: 'Uncommon',
    expansion: 'Fire and Water',
    subType: 'equipment',
    cardNumber: 'GEN-097',
    modifierType: 'skill_damage_boost',
    modifierValue: 1
  },
  {
    id: 'livin-dagger',
    name: 'Livin Dagger',
    type: 'equipment',
    element: 'neutral',
    spektraCost: ['neutral', 'neutral'],
    description: 'After this card casted, equip it into target Kuhaka/Kujana Avatar. Equipped avatar get ability +1 damage when attacking opponent. And get 1 damage to itself each attack. Pay 1 to equip into another Avatar.',
    effect: 'Equip to Kuhaka/Kujana avatar. Avatar gains +1 attack damage but takes 1 damage each attack. Pay 1 to re-equip.',
    art: '/cards/GENESIS/neutral/Non Elemental For Apps_Equipment - Livin Dagger.webp',
    rarity: 'Common',
    expansion: 'Fire and Water',
    subType: 'equipment',
    cardNumber: 'GEN-098'
  },
  {
    id: 'sacred-box',
    name: 'Sacred Box',
    type: 'equipment',
    element: 'neutral',
    spektraCost: ['neutral', 'neutral', 'neutral', 'neutral'],
    description: 'After this card casted, equip it into target Kobar/Borah Avatar. Equipped avatar get ability remove 1 battle damage each attack. Pay 1 to equip into another Avatar. You cant have more than 1 Sacred Box on field.',
    effect: 'Equip to Kobar/Borah avatar. Avatar prevents 1 damage each attack. Pay 1 to re-equip. Limit 1 per field.',
    art: '/cards/GENESIS/neutral/Non Elemental For Apps_Equipment - Sacred Box.webp',
    rarity: 'Rare',
    expansion: 'Fire and Water',
    subType: 'equipment',
    cardNumber: 'GEN-099'
  }
];

// Non-Elemental Field Cards
export const nonElementalFieldCards: FieldCard[] = [
  {
    id: 'haunted-stage',
    name: 'Haunted Stage',
    type: 'field',
    element: 'neutral',
    spektraCost: ['neutral', 'neutral', 'neutral', 'neutral'],
    description: 'Avatars with Kuhaka and Kujana type get +1 additional damage. Also the avatar get 1 damage counter after attacking.',
    passiveEffect: 'Kuhaka and Kujana avatars gain +1 attack damage but take 1 damage after attacking',
    affect1: 'Kuhaka/Kujana +1 Attack',
    affect2: '1 Self-Damage After Attack',
    art: '/cards/GENESIS/neutral/Non Elemental For Apps_Field Spell - Haunted Stage.webp',
    rarity: 'Uncommon',
    expansion: 'Fire and Water',
    modifierType: 'skill_damage_boost',
    modifierValue: 1,
    modifierCondition: 'kuhaka,kujana',
    cardNumber: 'GEN-100'
  },
  {
    id: 'sanggar',
    name: 'Sanggar',
    type: 'field',
    element: 'neutral',
    spektraCost: ['neutral', 'neutral', 'neutral', 'neutral'],
    description: 'Avatars with Kobar or Borah type get +2 max HP. Reduce every attack from non Kobar and Borah type by one damage (aftermath)',
    passiveEffect: 'Kobar/Borah avatars gain +2 max HP. Non-Kobar/Borah attacks deal -1 damage',
    affect1: 'Kobar/Borah +2 Max HP',
    affect2: 'Others -1 Attack Damage',
    art: '/cards/GENESIS/neutral/Non Elemental For Apps_Field Spell - Sanggar.webp',
    rarity: 'Uncommon',
    expansion: 'Fire and Water',
    modifierType: 'skill_damage_boost',
    modifierValue: 2,
    modifierCondition: 'kobar,borah',
    cardNumber: 'GEN-101'
  }
];

// Export all non-elemental cards
export const allNonElementalCards = [
  ...nonElementalItemCards,
  ...nonElementalSpellCards,
  ...nonElementalQuickSpellCards,
  ...nonElementalEquipmentCards,
  ...nonElementalFieldCards
];