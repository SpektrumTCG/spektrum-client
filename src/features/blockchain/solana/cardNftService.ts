// Card NFT service — mock implementation. Wallet identity is owned by Clerk; this service
// only handles NFT metadata operations and marketplace stubs. Real DAS integration lives elsewhere.

import type { Card } from '@spektrum/shared';

export interface CardNftMetadata {
  name: string;
  description: string;
  symbol: string;
  image: string;
  animation_url?: string;
  external_url?: string;
  attributes: {
    trait_type: string;
    value: any;
  }[];
}

export interface WalletStatus {
  connected: boolean;
  address: string | null;
  balance: number;
}

export interface CardNftService {
  setWallet: (address: string | null) => void;
  getWalletStatus: () => Promise<WalletStatus>;

  getOwnedCards: () => Promise<Card[]>;
  getPlayerCards: () => Promise<Card[]>;
  getNftMetadata: (mint: string) => Promise<CardNftMetadata>;

  buyCard: (mint: string, price: number) => Promise<boolean>;
  sellCard: (mint: string, price: number) => Promise<boolean>;

  convertNftToCard: (metadata: CardNftMetadata) => Card;
  convertCardToNftMetadata: (card: Card) => CardNftMetadata;

  clearAllNfts: () => Promise<void>;
}

const COLLECTION_SYMBOL = 'SPEKTRUM';

function nftMetadataToCard(metadata: CardNftMetadata): Card {
  const getAttr = (traitType: string) => {
    const attr = metadata.attributes.find(a => a.trait_type === traitType);
    return attr ? attr.value : null;
  };
  return {
    id: `nft-${Math.random().toString(36).substring(2, 10)}`,
    name: metadata.name,
    type: getAttr('type') as any || 'avatar',
    element: getAttr('element') as any || 'fire',
    level: getAttr('level') as any || 1,
    subType: getAttr('subType') as any,
    health: Number(getAttr('health')) || 5,
    description: metadata.description,
    art: metadata.image,
    spektraCost: getAttr('spektraCost') ? (getAttr('spektraCost') as string).split(',') as any[] : [],
  } as Card;
}

function cardToNftMetadata(card: Card, symbol: string): CardNftMetadata {
  const attributes: { trait_type: string; value: string | number }[] = [
    { trait_type: 'type', value: card.type },
    { trait_type: 'element', value: card.element },
  ];
  if ('level' in card && typeof card.level === 'number') {
    attributes.push({ trait_type: 'level', value: card.level });
  }
  if ('subType' in card && card.subType) {
    attributes.push({ trait_type: 'subType', value: card.subType });
  }
  if ('health' in card && typeof card.health === 'number') {
    attributes.push({ trait_type: 'health', value: card.health });
  }
  if (card.spektraCost) {
    attributes.push({
      trait_type: 'spektraCost',
      value: Array.isArray(card.spektraCost) ? card.spektraCost.join(',') : String(card.spektraCost),
    });
  }
  return {
    name: card.name,
    description: card.description || '',
    symbol,
    image: card.art || '',
    attributes,
  };
}

class MockCardNftService implements CardNftService {
  private walletAddress: string | null = null;
  private balance = 0;
  private mockNfts: { mint: string; metadata: CardNftMetadata }[] = [];

  setWallet(address: string | null) {
    this.walletAddress = address;
    this.balance = address ? 5.5 : 0;
  }

  async getWalletStatus(): Promise<WalletStatus> {
    return {
      connected: !!this.walletAddress,
      address: this.walletAddress,
      balance: this.balance,
    };
  }

  async getOwnedCards(): Promise<Card[]> {
    if (!this.walletAddress) return [];
    return this.mockNfts.map(nft => this.convertNftToCard(nft.metadata));
  }

  async getPlayerCards(): Promise<Card[]> {
    return this.getOwnedCards();
  }

  async getNftMetadata(mint: string): Promise<CardNftMetadata> {
    const nft = this.mockNfts.find(n => n.mint === mint);
    if (!nft) throw new Error(`NFT with mint ${mint} not found`);
    return nft.metadata;
  }

  async buyCard(mint: string, price: number): Promise<boolean> {
    if (!this.walletAddress) return false;
    await new Promise(r => setTimeout(r, 1000));
    this.mockNfts.push({
      mint,
      metadata: {
        name: 'Purchased NFT Card',
        description: 'A card purchased from the marketplace',
        symbol: COLLECTION_SYMBOL,
        image: '/images/cards/avatars/crimson.png',
        attributes: [
          { trait_type: 'type', value: 'avatar' },
          { trait_type: 'element', value: 'fire' },
          { trait_type: 'level', value: 1 },
          { trait_type: 'health', value: 5 },
        ],
      },
    });
    this.balance = Math.max(0, this.balance - price);
    return true;
  }

  async sellCard(mint: string, price: number): Promise<boolean> {
    if (!this.walletAddress) return false;
    const idx = this.mockNfts.findIndex(nft => nft.mint === mint);
    if (idx === -1) return false;
    this.mockNfts.splice(idx, 1);
    this.balance += price * 0.95;
    return true;
  }

  convertNftToCard(metadata: CardNftMetadata): Card {
    return nftMetadataToCard(metadata);
  }

  convertCardToNftMetadata(card: Card): CardNftMetadata {
    return cardToNftMetadata(card, COLLECTION_SYMBOL);
  }

  async clearAllNfts(): Promise<void> {
    this.mockNfts = [];
  }
}

export const mockCardNftService = new MockCardNftService();
export const cardNftService: CardNftService = mockCardNftService;
