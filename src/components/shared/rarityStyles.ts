export type RarityType = 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Mythic';

export interface PackCard {
  name: string;
  art?: string;
  imagePath?: string;
  rarity?: RarityType;
}

export const RARITY_GLOW: Record<string, string> = {
  Mythic:       '0 0 28px 6px rgba(255,215,0,0.85)',
  'Super Rare': '0 0 22px 4px rgba(168,85,247,0.75)',
  Rare:         '0 0 18px 3px rgba(59,130,246,0.65)',
  Uncommon:     '0 0 14px 2px rgba(34,197,94,0.55)',
  Common:       'none',
};

export const RARITY_BORDER: Record<string, string> = {
  Mythic:       '#FFD700',
  'Super Rare': '#A855F7',
  Rare:         '#3B82F6',
  Uncommon:     '#22C55E',
  Common:       '#6B7280',
};
