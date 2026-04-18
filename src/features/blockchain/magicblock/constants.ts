import { PublicKey } from '@solana/web3.js';

// TODO: Replace with actual deployed program ID after `anchor deploy --provider.cluster devnet`
// See docs/DEVNET_DEPLOYMENT.md for deployment steps
const GACHA_PROGRAM_ID_STRING = process.env.NEXT_PUBLIC_GACHA_PROGRAM_ID || '11111111111111111111111111111111';
export const GACHA_PROGRAM_ID = new PublicKey(GACHA_PROGRAM_ID_STRING);

// MagicBlock Delegation Program - official program ID (do not change)
export const DELEGATION_PROGRAM_ID = new PublicKey('DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh');

export const ER_VALIDATORS = {
  mainnet: {
    asia: new PublicKey('MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57'),
    eu: new PublicKey('MEUGGrYPxKk17hCr7wpT6s8dtNokZj5U2L57vjYMS8e'),
    us: new PublicKey('MUS3hc9TCw4cGC12vHNoYcCGzJG1txjgQLZWVoeNHNd'),
  },
  devnet: {
    // TODO: Update with actual devnet validator addresses from MagicBlock when available
    asia: new PublicKey('MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57'),
    eu: new PublicKey('MEUGGrYPxKk17hCr7wpT6s8dtNokZj5U2L57vjYMS8e'),
    us: new PublicKey('MUS3hc9TCw4cGC12vHNoYcCGzJG1txjgQLZWVoeNHNd'),
  },
} as const;

export const EXPANSION_GENESIS: Uint8Array = (() => {
  const buf = new Uint8Array(16);
  const text = new TextEncoder().encode('GENESIS');
  buf.set(text, 0);
  return buf;
})();

export const PACK_TYPES = {
  beginner: 0,
  advanced: 1,
  expert: 2,
} as const;

export const RARITY_LABELS: Record<number, string> = {
  0: 'Common',
  1: 'Uncommon',
  2: 'Rare',
  3: 'Super Rare',
  4: 'Mythic',
};

export const SOL_PRICES = {
  booster: {
    beginner: 0.01,
    advanced: 0.03,
    expert: 0.05,
  },
  premadeDeck: 0.05,
} as const;

export const CURRENT_NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet') as 'devnet' | 'mainnet-beta';

export const GACHA_TREASURY = new PublicKey('7N57HGeEuVnzveE2G4vanJodnfXBGbAQdwFkwLPAUXnb');

export const COLLECTION_SYMBOL = 'SPEKTRUM';
