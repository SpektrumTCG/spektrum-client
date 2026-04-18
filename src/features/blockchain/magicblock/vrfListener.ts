import { Connection, PublicKey } from '@solana/web3.js';

export interface VRFResult {
  seed: Uint8Array;
  proof: Uint8Array;
  isValid: boolean;
}

export interface VRFListenerCallbacks {
  onSeedReady: (seed: Uint8Array) => void;
  onError: (error: Error) => void;
}

export class VRFListener {
  private connection: Connection;
  private subscriptionId: number | null = null;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async requestVRFSeed(): Promise<Uint8Array> {
    const seed = new Uint8Array(32);
    crypto.getRandomValues(seed);

    console.log('[VRF] Generated seed for gacha session:', 
      Array.from(seed.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(''));

    return seed;
  }

  async requestOnChainVRF(
    playerWallet: PublicKey,
    packAccount: PublicKey,
  ): Promise<Uint8Array> {
    // In production, this would call MagicBlock's VRF oracle program
    // to generate a provably fair random seed on-chain.
    //
    // The flow:
    // 1. Player requests VRF from oracle
    // 2. Oracle generates random value + proof
    // 3. Proof is verified on-chain (can't be manipulated)
    // 4. Seed is stored in the pack account
    //
    // For development, we use client-side randomness.
    // Replace with MagicBlock VRF CPI when deploying to devnet/mainnet.
    console.log('[VRF] Requesting on-chain VRF for pack:', packAccount.toBase58());

    const seed = await this.requestVRFSeed();

    return seed;
  }

  subscribeToVRFUpdates(
    accountPubkey: PublicKey,
    callbacks: VRFListenerCallbacks,
  ): void {
    try {
      this.subscriptionId = this.connection.onAccountChange(
        accountPubkey,
        (accountInfo) => {
          try {
            const data = accountInfo.data;
            if (data.length >= 32) {
              const vrfSeed = data.slice(0, 32);
              if (vrfSeed.some((b: number) => b !== 0)) {
                callbacks.onSeedReady(vrfSeed);
              }
            }
          } catch (error) {
            callbacks.onError(error as Error);
          }
        },
        'confirmed',
      );
      console.log('[VRF] Subscribed to VRF updates for:', accountPubkey.toBase58());
    } catch (error) {
      callbacks.onError(error as Error);
    }
  }

  unsubscribe(): void {
    if (this.subscriptionId !== null) {
      this.connection.removeAccountChangeListener(this.subscriptionId);
      this.subscriptionId = null;
      console.log('[VRF] Unsubscribed from VRF updates');
    }
  }
}

export async function deriveSlotRandomness(vrfSeed: Uint8Array, slotIndex: number): Promise<Uint8Array> {
  const input = new Uint8Array(33);
  input.set(vrfSeed, 0);
  input[32] = slotIndex;
  const hashBuffer = await crypto.subtle.digest('SHA-256', input);
  return new Uint8Array(hashBuffer);
}

export function randomRarityValue(randomBytes: Uint8Array): number {
  const raw = randomBytes[0] | (randomBytes[1] << 8);
  return raw % 10_000;
}

export function randomCardValue(randomBytes: Uint8Array): number {
  return randomBytes[2] | (randomBytes[3] << 8) | (randomBytes[4] << 16) | (randomBytes[5] << 24);
}
