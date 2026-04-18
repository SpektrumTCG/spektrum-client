import { Card, ActionCard } from '../../types/card';

// Define the neutral card collection
export const neutralCards: Record<string, Card> = {
  // Item cards
  "neutral-recruitment-scroll": {
    id: "neutral-recruitment-scroll",
    name: "Recruitment Scroll",
    type: "item",
    element: "neutral",
    description: "Discard 1 Avatar card, then search the deck for an Avatar card who has same element with the discarded card.",
    art: "/cards/GENESIS/neutral/Non Elemental For Apps_Item - Rec Scroll.webp",
    spektraCost: ["neutral"],
    effectType: "discard_search",
    effectValue: 1,
    effectTarget: "player",
    cardNumber: "GEN-093"
  },
  
  "neutral-jamu-jahe-merah": {
    id: "neutral-jamu-jahe-merah",
    name: "Jamu Jahe Merah",
    type: "item",
    subType: "healing",
    element: "neutral",
    description: "Discard a card, then heal 5 damage from target avatar.",
    art: "/cards/GENESIS/neutral/Non Elemental For Apps_Item - Jamu Jahe Merah.webp",
    spektraCost: ["neutral"],
    effectType: "discard_heal",
    effectValue: 1, // Number of cards to discard
    effectValue2: 5, // Amount to heal
    effectTarget: "select_player_avatar",
    cardNumber: "GEN-091"
  },
  
  "neutral-jamu-kencur": {
    id: "neutral-jamu-kencur",
    name: "Jamu Kencur",
    type: "item",
    subType: "healing",
    element: "neutral",
    description: "Heal 3 damage from target Avatar.",
    art: "/cards/GENESIS/neutral/Non Elemental For Apps_Item - Kencur.webp",
    spektraCost: ["neutral"],
    effectType: "heal",
    effectValue: 3,
    effectTarget: "select_player_avatar",
    cardNumber: "GEN-092"
  },
  
  "neutral-battle-preparation": {
    id: "neutral-battle-preparation",
    name: "Battle Preparation",
    type: "item",
    element: "neutral",
    description: "Discard Hand, and then draw 5 card from deck.",
    art: "/cards/GENESIS/neutral/Non Elemental For Apps_Item - Battle Preps.webp",
    spektraCost: ["neutral", "neutral"],
    effectType: "discard_draw",
    effectValue: 5, // Draw 5 cards after discarding all
    effectTarget: "player",
    cardNumber: "GEN-089"
  },
  
  "neutral-energy-dagger": {
    id: "neutral-energy-dagger",
    name: "Energy Dagger",
    type: "item",
    subType: "equipment",
    element: "neutral",
    description: "After this card casted, equip it into target Avatar. Target avatar get ability, +1 damage each time you pay extra energy when attacking opponent. Pay 1 to equip into another Avatar.",
    art: "/cards/GENESIS/neutral/Non Elemental For Apps_Equipment - Energy Dagger.webp",
    spektraCost: ["neutral", "neutral", "neutral"],
    effectType: "buff",
    effectValue: 1, // +1 damage per extra energy
    effectTarget: "select_player_avatar",
    cardNumber: "GEN-097"
  },
  
  // Spell cards
  "neutral-prize": {
    id: "neutral-prize",
    name: "Prize",
    type: "spell",
    element: "neutral",
    description: "Draw 1 card.",
    art: "/cards/GENESIS/neutral/Non Elemental For Apps_Spell - Prize.webp",
    spektraCost: ["neutral"],
    effectType: "draw",
    effectValue: 1,
    effectTarget: "player",
    cardNumber: "GEN-094"
  },
  
  "neutral-golden-crates": {
    id: "neutral-golden-crates",
    name: "Golden Crates",
    type: "spell",
    element: "neutral",
    description: "Draw 2 card.",
    art: "/cards/GENESIS/neutral/Non Elemental For Apps_Spell - Golden Crates.webp",
    spektraCost: ["neutral", "neutral"],
    effectType: "draw",
    effectValue: 2,
    effectTarget: "player",
    cardNumber: "GEN-095"
  },
  
  // Quick Spell
  "neutral-crates": {
    id: "neutral-crates",
    name: "Crates",
    type: "quickSpell",
    element: "neutral",
    description: "Draw 1 card.",
    art: "/cards/GENESIS/neutral/Non Elemental For Apps_Spell - Golden Crates.webp",
    spektraCost: ["neutral", "neutral"],
    effectType: "draw",
    effectValue: 1,
    effectTarget: "player",
    cardNumber: "GEN-096"
  }
};

// Export all neutral cards as an array 
export const allNeutralCards = Object.values(neutralCards);
