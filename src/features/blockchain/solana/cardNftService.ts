// This file provides integration with Solana's compressed NFTs (cNFTs) system
// It will be used to interact with NFT card data from the blockchain

import { createSolanaRpc, address } from '@solana/kit';
import type { Card } from '@/domain/game/types';
import { detectSolanaWallets, getPreferredWallet } from './walletDetector';
import { buildPhantomConnectUrl, parsePhantomCallback, clearPhantomSession } from './phantomDeeplink';
import { buildSolflareConnectUrl, parseSolflareCallback, clearSolflareSession } from './solflareDeeplink';
import { parseBackpackCallback, clearBackpackSession } from './backpackDeeplink';
import { isStandalonePWA } from '@/lib/pwaUtils';

// Interface for NFT metadata that matches our card structure
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

// Interface for wallet connection status
export interface WalletStatus {
  connected: boolean;
  address: string | null;
  balance: number;
}

// Interface for the card NFT service
export interface CardNftService {
  // Basic connection functions
  connect: (walletName?: string) => Promise<WalletStatus>;
  disconnect: () => Promise<void>;
  getWalletStatus: () => Promise<WalletStatus>;
  
  // NFT Collection interaction
  getOwnedCards: () => Promise<Card[]>;
  getPlayerCards: () => Promise<Card[]>;
  getNftMetadata: (mint: string) => Promise<CardNftMetadata>;
  
  // Marketplace functions (to be implemented)
  buyCard: (mint: string, price: number) => Promise<boolean>;
  sellCard: (mint: string, price: number) => Promise<boolean>;
  
  // Card conversion functions
  convertNftToCard: (metadata: CardNftMetadata) => Card;
  convertCardToNftMetadata: (card: Card) => CardNftMetadata;
  
  // Development utility functions
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
    spektraCost: getAttr('spektraCost') ? (getAttr('spektraCost') as string).split(',') as any[] : []
  } as Card;
}

function cardToNftMetadata(card: Card, symbol: string): CardNftMetadata {
  const attributes: { trait_type: string; value: string | number }[] = [
    { trait_type: 'type', value: card.type },
    { trait_type: 'element', value: card.element }
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
      value: Array.isArray(card.spektraCost) ? card.spektraCost.join(',') : String(card.spektraCost)
    });
  }
  return {
    name: card.name,
    description: card.description || '',
    symbol,
    image: card.art || '',
    attributes
  };
}

// Mock implementation for development until blockchain integration is ready
class MockCardNftService implements CardNftService {
  private walletStatus: WalletStatus = {
    connected: false,
    address: null,
    balance: 0
  };
  
  // Simulated NFT collection (for development)
  private mockNfts: { mint: string, metadata: CardNftMetadata }[] = [];
  
  constructor() {
    // Initialize with some mock data
    console.log('Initializing mock Solana cNFT service');
    this.initializeMockNfts();
  }
  
  private initializeMockNfts() {
    // Add some sample NFT cards for testing
    this.mockNfts = [
      {
        mint: 'fire123456789abcdef',
        metadata: {
          name: 'Crimson Fire Avatar',
          description: 'A powerful fire elemental avatar',
          symbol: 'SPEKTRUM',
          image: '/images/cards/avatars/crimson.png',
          attributes: [
            { trait_type: 'type', value: 'avatar' },
            { trait_type: 'element', value: 'fire' },
            { trait_type: 'level', value: 1 },
            { trait_type: 'subType', value: 'kobar' },
            { trait_type: 'health', value: 6 },
            { trait_type: 'spektraCost', value: 'fire,fire' }
          ]
        }
      },
      {
        mint: 'water987654321fedcba',
        metadata: {
          name: 'Maya Water Shaman',
          description: 'A mystical water shaman',
          symbol: 'SPEKTRUM',
          image: '/images/cards/avatars/maya.png',
          attributes: [
            { trait_type: 'type', value: 'avatar' },
            { trait_type: 'element', value: 'water' },
            { trait_type: 'level', value: 2 },
            { trait_type: 'subType', value: 'kujana' },
            { trait_type: 'health', value: 8 },
            { trait_type: 'spektraCost', value: 'water,water,neutral' }
          ]
        }
      },
      {
        mint: 'spell456789123abcdef',
        metadata: {
          name: 'Burning Sight Spell',
          description: 'A fire spell that reveals hidden enemies',
          symbol: 'SPEKTRUM',
          image: '/images/cards/spells/burning-sight.png',
          attributes: [
            { trait_type: 'type', value: 'spell' },
            { trait_type: 'element', value: 'fire' },
            { trait_type: 'spektraCost', value: 'fire,neutral' }
          ]
        }
      }
    ];
  }
  
  async connect(walletName?: string): Promise<WalletStatus> {
    console.log(`Connecting to ${walletName || 'default'} wallet (mock mode)...`);
    await new Promise(resolve => setTimeout(resolve, 100));
    this.walletStatus = { connected: true, address: 'mockSolanaAddress123456789', balance: 5.5 };
    console.log('Mock wallet connected successfully');
    return this.walletStatus;
  }
  
  async disconnect(): Promise<void> {
    console.log('Disconnecting from Solana wallet');
    this.walletStatus = {
      connected: false,
      address: null,
      balance: 0
    };
  }
  
  async getWalletStatus(): Promise<WalletStatus> {
    return this.walletStatus;
  }
  
  async getOwnedCards(): Promise<Card[]> {
    if (!this.walletStatus.connected) {
      throw new Error('Wallet not connected');
    }
    
    // Return mock card collection
    return this.mockNfts.map(nft => this.convertNftToCard(nft.metadata));
  }
  
  async getPlayerCards(): Promise<Card[]> {
    // Alias for getOwnedCards to maintain compatibility
    return this.getOwnedCards();
  }
  
  async getNftMetadata(mint: string): Promise<CardNftMetadata> {
    const nft = this.mockNfts.find(n => n.mint === mint);
    if (!nft) {
      throw new Error(`NFT with mint ${mint} not found`);
    }
    
    return nft.metadata;
  }
  
  async buyCard(mint: string, price: number): Promise<boolean> {
    console.log(`Mock: Buying card with mint ${mint} for ${price} SOL`);
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate adding the NFT to the user's collection
    try {
      // In a real implementation, this would be fetched from the blockchain
      const newCardMetadata: CardNftMetadata = {
        name: 'Purchased NFT Card',
        description: 'A card purchased from the marketplace',
        symbol: 'SPEKTRUM',
        image: '/images/cards/avatars/crimson.png',
        attributes: [
          { trait_type: 'type', value: 'avatar' },
          { trait_type: 'element', value: 'fire' },
          { trait_type: 'level', value: 1 },
          { trait_type: 'health', value: 5 }
        ]
      };
      
      // Add to mock collection
      this.mockNfts.push({
        mint: mint,
        metadata: newCardMetadata
      });
      
      // Update balance (subtract price)
      this.walletStatus.balance = Math.max(0, this.walletStatus.balance - price);
      
      console.log(`Mock: Successfully bought card ${mint}`);
      return true;
    } catch (error) {
      console.error('Mock: Failed to buy card:', error);
      return false;
    }
  }
  
  async sellCard(mint: string, price: number): Promise<boolean> {
    console.log(`Mock: Selling card with mint ${mint} for ${price} SOL`);
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate removing the NFT from the user's collection
    try {
      const cardIndex = this.mockNfts.findIndex(nft => nft.mint === mint);
      if (cardIndex === -1) {
        throw new Error('Card not found in wallet');
      }
      
      // Remove from mock collection
      this.mockNfts.splice(cardIndex, 1);
      
      // Update balance (add price minus fees)
      const fees = price * 0.05; // 5% marketplace fee
      this.walletStatus.balance += (price - fees);
      
      console.log(`Mock: Successfully sold card ${mint} for ${price} SOL (${fees} SOL fees)`);
      return true;
    } catch (error) {
      console.error('Mock: Failed to sell card:', error);
      return false;
    }
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

// Real Solana cNFT Service Implementation
class SolanaCardNftService implements CardNftService {
  private walletStatus: WalletStatus = {
    connected: false,
    address: null,
    balance: 0
  };
  
  private rpc: ReturnType<typeof createSolanaRpc> | null = null;
  private wallet: any = null;
  
  // Mock NFT collection for development (until real DAS integration)
  private mockNfts: CardNftMetadata[] = [];
  
  constructor() {
    console.log('Initializing real Solana cNFT service');
    this.initializeConnection();
  }
  
  private static getClusterUrl(network: string): string {
    const clusterUrls: Record<string, string> = {
      'mainnet-beta': 'https://api.mainnet-beta.solana.com',
      'devnet': 'https://api.devnet.solana.com',
      'testnet': 'https://api.testnet.solana.com',
    };
    return clusterUrls[network] || clusterUrls['devnet'];
  }

  private async initializeConnection() {
    try {
      const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
      const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || SolanaCardNftService.getClusterUrl(network);
      
      this.rpc = createSolanaRpc(rpcUrl);
      
      console.log(`Connected to Solana ${network} network: ${rpcUrl}`);
      console.log('Real blockchain functionality enabled (@solana/kit)');
      
      this.initializeMockNfts();
    } catch (error) {
      console.warn('Failed to initialize Solana connection:', error);
    }
  }
  
  private async verifyNetwork() {
    try {
      if (!this.rpc) {
        console.warn('Cannot verify network: no RPC connection available');
        return;
      }

      const genesisHash = await this.rpc.getGenesisHash().send();
      
      // Devnet genesis hash (this is consistent)
      const DEVNET_GENESIS = 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG';
      
      const isDevnet = genesisHash === DEVNET_GENESIS;
      
      console.log(`Network verification: Genesis hash = ${genesisHash}`);
      console.log(`Is Devnet: ${isDevnet}`);
      
      if (!isDevnet) {
        // Import toast dynamically to show warning
        const { toast } = await import('sonner');
        toast.warning('Your wallet appears to be on a different network. Please switch to Solana Devnet for this application.', {
          duration: 8000,
        });
      } else {
        const { toast } = await import('sonner');
        toast.success('Wallet connected to Devnet ✓', {
          duration: 3000,
        });
      }
    } catch (error) {
      console.warn('Network verification failed:', error);
      // Don't block connection if verification fails
    }
  }

  private setupWalletEventListeners() {
    // Set up event listeners for any connected wallet
    if (this.wallet && typeof this.wallet.on === 'function') {
      // Listen for account changes
      this.wallet.on('accountChanged', (publicKey: any) => {
        if (publicKey) {
          console.log('Account changed to:', publicKey.toString());
          this.walletStatus = {
            ...this.walletStatus,
            address: publicKey.toString()
          };
        } else {
          console.log('Account disconnected');
          this.walletStatus = {
            connected: false,
            address: null,
            balance: 0
          };
          this.wallet = null;
        }
      });
      
      // Listen for disconnect events
      this.wallet.on('disconnect', () => {
        console.log('Wallet disconnected via event');
        this.walletStatus = {
          connected: false,
          address: null,
          balance: 0
        };
        this.wallet = null;
      });
    }
  }
  
  private async handleDeeplinkCallback(publicKey: string, walletName: string): Promise<WalletStatus> {
    let balance = 2.5;
    if (this.rpc) {
      try {
        const walletAddr = address(publicKey);
        const result = await this.rpc.getBalance(walletAddr).send();
        balance = Number(result.value) / 1e9;
        console.log(`Real wallet balance fetched: ${balance} SOL`);
      } catch (error) {
        console.warn('Failed to fetch real balance, using mock:', error);
      }
    }
    this.walletStatus = { connected: true, address: publicKey, balance };
    window.history.replaceState({}, '', window.location.pathname);
    console.log(`${walletName} wallet connected via deeplink`);
    console.log('Wallet address:', publicKey);
    await this.verifyNetwork();
    return this.walletStatus;
  }

  async connect(walletName?: string): Promise<WalletStatus> {
    try {
      console.log('🔍 Detecting installed Solana wallets...');
      
      const isPWA = isStandalonePWA();
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const wallets = detectSolanaWallets();
      const walletsDetected = Object.keys(wallets).some(k => wallets[k]?.isInstalled);
      
      console.log(`📱 Environment Check:`, {
        isPWA,
        isMobile,
        walletsDetected,
        detectedWallets: Object.keys(wallets).filter(k => wallets[k]?.isInstalled)
      });
      
      const phantomCallback = parsePhantomCallback();
      if (phantomCallback) return this.handleDeeplinkCallback(phantomCallback.publicKey, 'Phantom');

      const solflareCallback = parseSolflareCallback();
      if (solflareCallback) return this.handleDeeplinkCallback(solflareCallback.publicKey, 'Solflare');

      const backpackCallback = parseBackpackCallback();
      if (backpackCallback) return this.handleDeeplinkCallback(backpackCallback.publicKey, 'Backpack');
      
      // If no wallet is detected at all, use deeplinks as fallback for mobile
      if (!walletsDetected && isMobile) {
        console.log('📱 No wallet detected on mobile - redirecting to wallet app...');
        
        let deepLinkUrl: string;
        if (walletName === 'solflare') {
          deepLinkUrl = buildSolflareConnectUrl('devnet');
          console.log('Solflare DeepLink URL:', deepLinkUrl);
        } else {
          // Default to Phantom for mobile users
          deepLinkUrl = buildPhantomConnectUrl('devnet');
          console.log('Phantom DeepLink URL:', deepLinkUrl);
        }
        
        window.location.href = deepLinkUrl;
        return new Promise(() => {});
      }
      
      // If no wallet is detected and not mobile, show error
      if (!walletsDetected) {
        throw new Error('No Solana wallet detected. Please install Phantom, Solflare, or another Solana wallet.');
      }
      
      // Wallet detected - proceed with normal connection
      console.log('✅ Wallet detected - proceeding with browser extension connection');
      
      let selectedWallet;
      if (walletName && wallets[walletName]) {
        selectedWallet = wallets[walletName];
      } else {
        selectedWallet = getPreferredWallet(wallets);
      }
      
      if (!selectedWallet) {
        throw new Error('No wallet available for connection');
      }
      
      console.log(`Connecting to ${selectedWallet.name} wallet...`);
      
      const provider = selectedWallet.adapter;
      
      // Handle Solflare-specific connection method
      let response;
      let publicKeySource = null;
      
      if (selectedWallet.name === 'Solflare') {
        console.log('🔥 Using Solflare-specific connection flow...');
        console.log('Solflare provider details:', {
          hasConnect: typeof provider.connect === 'function',
          hasPublicKey: !!provider.publicKey,
          hasDisconnect: typeof provider.disconnect === 'function'
        });
        
        try {
          // Solflare's connect() often returns void, not an object with publicKey
          response = await provider.connect();
          console.log('Solflare connect() response:', response);
          
          // For Solflare, read publicKey directly from provider instead of response
          if (provider.publicKey) {
            publicKeySource = provider.publicKey;
            console.log('✅ Got publicKey from provider.publicKey:', publicKeySource.toString());
          } else if (response?.publicKey) {
            publicKeySource = response.publicKey;
            console.log('✅ Got publicKey from response.publicKey:', publicKeySource.toString());
          }
        } catch (err: any) {
          console.error('Solflare connection error:', err);
          const errorMsg = err?.message || 'Failed to connect to Solflare wallet';
          throw new Error(`Solflare connection failed: ${errorMsg}. Please make sure Solflare is unlocked and try again.`);
        }
      } else if (provider.isWalletStandard) {
        // Wallet Standard adapter (Seeker, modern wallets)
        console.log(`🔌 Using Wallet Standard connection flow for ${selectedWallet.name}...`);
        try {
          response = await provider.connect();
          publicKeySource = response?.publicKey || provider.publicKey;
          console.log(`✅ Wallet Standard connect result:`, publicKeySource?.toString());
        } catch (err: any) {
          console.error(`Wallet Standard connection error for ${selectedWallet.name}:`, err);
          throw new Error(`${selectedWallet.name} connection failed: ${err?.message || 'Unknown error'}`);
        }
      } else {
        // Standard connection for other wallets (Phantom, Backpack, etc.)
        console.log(`🔌 Using standard connection flow for ${selectedWallet.name}...`);
        response = await provider.connect({ onlyIfTrusted: false });
        publicKeySource = response?.publicKey || provider.publicKey;
      }
      
      // Check if we got a publicKey from either the response or the provider
      if (publicKeySource) {
        let balance = 2.5;
        
        if (this.rpc) {
          try {
            const walletAddr = address(publicKeySource.toString());
            const result = await this.rpc.getBalance(walletAddr).send();
            const lamports = Number(result.value);
            balance = lamports / 1e9;
            console.log(`Real wallet balance fetched: ${balance} SOL`);
          } catch (error) {
            console.warn('Failed to fetch real balance, using mock:', error);
          }
        }
        
        this.walletStatus = {
          connected: true,
          address: publicKeySource.toString(),
          balance
        };
        
        this.wallet = provider;
        
        this.setupWalletEventListeners();
        
        console.log(`✅ ${selectedWallet.name} wallet connected successfully`);
        console.log('Wallet address:', publicKeySource.toString());
        
        // Verify network after connection
        await this.verifyNetwork();
        
        return this.walletStatus;
      }
      
      console.error('❌ No publicKey found in response or provider:', {
        response,
        providerPublicKey: provider.publicKey
      });
      throw new Error(`Failed to connect to ${selectedWallet.name}: No public key received`);
    } catch (error: any) {
      console.error('❌ Wallet connection failed:', error);
      console.error('Error details:', {
        message: error?.message || 'Unknown error',
        code: error?.code,
        name: error?.name,
        stack: error?.stack
      });
      
      this.walletStatus = {
        connected: false,
        address: null,
        balance: 0
      };
      
      // Provide more helpful error messages
      const errorMessage = error?.message || 'Unknown wallet connection error';
      throw new Error(`Wallet connection failed: ${errorMessage}`);
    }
  }
  
  async disconnect(): Promise<void> {
    try {
      if (this.wallet && this.wallet.disconnect) {
        await this.wallet.disconnect();
      }
      
      clearPhantomSession();
      clearSolflareSession();
      clearBackpackSession();
      
      this.walletStatus = {
        connected: false,
        address: null,
        balance: 0
      };
      this.wallet = null;
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Wallet disconnection error:', error);
    }
  }
  
  async getWalletStatus(): Promise<WalletStatus> {
    return this.walletStatus;
  }
  
  async getOwnedCards(): Promise<Card[]> {
    if (!this.walletStatus.connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      console.log('Fetching owned cNFTs for wallet:', this.walletStatus.address);

      // DEVNET TODO: Replace mock data with DAS (Digital Asset Standard) API call.
      // Example using Helius DAS API:
      //   const response = await fetch(`https://devnet.helius-rpc.com/?api-key=${HELIUS_KEY}`, {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({
      //       jsonrpc: '2.0', id: 'spektrum',
      //       method: 'getAssetsByOwner',
      //       params: {
      //         ownerAddress: this.walletStatus.address,
      //         page: 1, limit: 1000,
      //         displayOptions: { showCollectionMetadata: true }
      //       }
      //     })
      //   });
      //   const { result } = await response.json();
      //   return result.items
      //     .filter(item => item.grouping?.[0]?.group_value === SPEKTRUM_COLLECTION_MINT)
      //     .map(item => this.convertNftToCard(item.content.metadata));
      
      console.warn('[MOCK] getOwnedCards returning mock data — DAS API not yet integrated');
      if (this.mockNfts.length === 0) {
        return [];
      }
      
      return this.mockNfts.map(metadata => this.convertNftToCard(metadata));
    } catch (error) {
      console.error('Failed to fetch owned cards:', error);
      return [];
    }
  }
  
  async getPlayerCards(): Promise<Card[]> {
    return this.getOwnedCards();
  }
  
  async getNftMetadata(mint: string): Promise<CardNftMetadata> {
    try {
      // For development: check mock NFTs first
      const mockNft = this.mockNfts.find((_, index) => `mock-nft-${index}` === mint);
      if (mockNft) {
        return mockNft;
      }
      
      // TODO: Implement DAS API call for real NFT metadata
      // This would involve calling the DAS API with the mint address
      throw new Error(`NFT metadata not found for mint: ${mint}`);
    } catch (error) {
      console.error('Failed to fetch NFT metadata:', error);
      throw error;
    }
  }
  
  async buyCard(mint: string, price: number): Promise<boolean> {
    if (!this.walletStatus.connected || !this.wallet) {
      throw new Error('Wallet not connected');
    }
    
    if (!this.walletStatus.address || this.walletStatus.address.startsWith('phantom-mock-')) {
      throw new Error('Real wallet connection required for transactions');
    }
    
    try {
      console.log(`Attempting to buy card ${mint} for ${price} SOL`);
      
      // DEVNET TODO: Replace with real Metaplex Umi transaction.
      // Example implementation:
      //   import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
      //   import { transfer } from '@metaplex-foundation/mpl-bubblegum';
      //   const umi = createUmi(rpcUrl).use(mplBubblegum());
      //   const tx = await transfer(umi, {
      //     leafOwner: sellerPublicKey,
      //     newLeafOwner: buyerPublicKey,
      //     merkleTree, leafIndex, ...proof
      //   }).sendAndConfirm(umi);
      //   // Also: SystemProgram.transfer for SOL payment, handle marketplace fees
      
      console.warn(`[MOCK] buyCard simulating transaction — no SOL transferred, no NFT moved`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`[MOCK] Simulated purchase of card ${mint}`);
      return true;
    } catch (error) {
      console.error('Failed to buy card:', error);
      return false;
    }
  }
  
  async sellCard(mint: string, price: number): Promise<boolean> {
    if (!this.walletStatus.connected || !this.wallet) {
      throw new Error('Wallet not connected');
    }
    
    if (!this.walletStatus.address || this.walletStatus.address.startsWith('phantom-mock-')) {
      throw new Error('Real wallet connection required for transactions');
    }
    
    try {
      console.log(`Attempting to sell card ${mint} for ${price} SOL`);
      
      // DEVNET TODO: Replace with real Metaplex marketplace listing.
      // Example implementation:
      //   import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
      //   import { delegate } from '@metaplex-foundation/mpl-bubblegum';
      //   const umi = createUmi(rpcUrl).use(mplBubblegum());
      //   // 1. Delegate cNFT to marketplace escrow program
      //   // 2. Create on-chain listing with price + royalty info
      //   // 3. Marketplace program handles atomic swap on purchase
      
      console.warn(`[MOCK] sellCard simulating listing — no NFT delegated, no listing created`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`[MOCK] Simulated listing of card ${mint} for ${price} SOL`);
      return true;
    } catch (error) {
      console.error('Failed to sell card:', error);
      return false;
    }
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
  
  private initializeMockNfts() {
    // Only populate mock NFTs if explicitly enabled via environment variable
    const enableMockNfts = process.env.NEXT_PUBLIC_ENABLE_MOCK_NFTS === 'true';
    
    if (!enableMockNfts) {
      this.mockNfts = [];
      console.log('Mock NFTs disabled - wallet will show only real blockchain NFTs');
      return;
    }
    
    // Development mode: Add sample NFTs for testing
    console.log('Mock NFTs enabled for development testing');
    this.mockNfts = [];
  }
}

// Keep mock service available for development
export const mockCardNftService = new MockCardNftService();

// Determine which service to use based on explicit opt-in
const USE_REAL_BLOCKCHAIN = process.env.NEXT_PUBLIC_USE_REAL_BLOCKCHAIN === 'true';

// Export the appropriate service
export const cardNftService = USE_REAL_BLOCKCHAIN ? new SolanaCardNftService() : mockCardNftService;

// Note: The real implementation uses Phantom wallet integration and 
// requires completion of DAS API integration for full cNFT functionality.