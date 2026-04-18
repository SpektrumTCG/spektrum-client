import { Buffer } from 'buffer';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import { ERClient, getERClient, type ERClientConfig } from './erClient';
import { VRFListener, randomRarityValue, randomCardValue } from './vrfListener';
import { GACHA_PROGRAM_ID, DELEGATION_PROGRAM_ID, EXPANSION_GENESIS, GACHA_TREASURY } from './constants';
import { IDL } from './idl/spektrumGacha';

function createProgram(provider: AnchorProvider): Program<any> {
  const idlWithAddress = { ...IDL, address: GACHA_PROGRAM_ID.toBase58(), accounts: [] };
  return new Program<any>(idlWithAddress as any, provider);
}

export type PackType = 'beginner' | 'advanced' | 'expert';
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Mythic';

export const RARITY_ORDER: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Mythic'];

export interface SlotResult {
  slotIndex: number;
  cardNumber: number;
  rarity: Rarity;
  minRarity: Rarity;
  isWild: boolean;
}

export interface GachaSessionState {
  packAccount: PublicKey | null;
  packNonce: bigint | null;
  cardPoolPda: PublicKey | null;
  packType: PackType;
  isDelegated: boolean;
  vrfSeed: Uint8Array | null;
  revealedSlots: SlotResult[];
  isFinalized: boolean;
  error: string | null;
}

export type SessionEventType =
  | 'session_started'
  | 'pack_initialized'
  | 'pack_delegated'
  | 'slot_revealed'
  | 'session_finalized'
  | 'session_error';

export interface SessionEvent {
  type: SessionEventType;
  data?: SlotResult | Error | string;
  timestamp: number;
}

type SessionEventHandler = (event: SessionEvent) => void;

export interface GachaWallet {
  publicKey: PublicKey;
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
}

const PACK_TYPE_MAP: Record<PackType, number> = {
  beginner: 0,
  advanced: 1,
  expert: 2,
};

const SLOT_CONFIGS: Record<PackType, Array<{ minRarity: Rarity; isWild: boolean }>> = {
  beginner: [
    { minRarity: 'Common', isWild: false },
    { minRarity: 'Common', isWild: false },
    { minRarity: 'Common', isWild: false },
    { minRarity: 'Uncommon', isWild: false },
    { minRarity: 'Common', isWild: true },
  ],
  advanced: [
    { minRarity: 'Common', isWild: false },
    { minRarity: 'Common', isWild: false },
    { minRarity: 'Uncommon', isWild: false },
    { minRarity: 'Uncommon', isWild: false },
    { minRarity: 'Rare', isWild: true },
  ],
  expert: [
    { minRarity: 'Uncommon', isWild: false },
    { minRarity: 'Uncommon', isWild: false },
    { minRarity: 'Uncommon', isWild: false },
    { minRarity: 'Rare', isWild: false },
    { minRarity: 'Super Rare', isWild: true },
  ],
};

const WILD_WEIGHTS: Record<PackType, Record<Rarity, number>> = {
  beginner: { 'Common': 9000, 'Uncommon': 0, 'Rare': 990, 'Super Rare': 10, 'Mythic': 0 },
  advanced: { 'Common': 0, 'Uncommon': 0, 'Rare': 9000, 'Super Rare': 990, 'Mythic': 10 },
  expert: { 'Common': 0, 'Uncommon': 0, 'Rare': 0, 'Super Rare': 9000, 'Mythic': 1000 },
};

function isProgramDeployed(): boolean {
  const id = GACHA_PROGRAM_ID.toBase58();
  return !id.startsWith('GACHA');
}

export class GachaSession {
  private erClient: ERClient;
  private vrfListener: VRFListener;
  private state: GachaSessionState;
  private eventHandlers: SessionEventHandler[] = [];
  private walletPublicKey: PublicKey;
  private wallet: GachaWallet | null;

  constructor(walletPublicKey: PublicKey, wallet?: GachaWallet, erConfig?: ERClientConfig) {
    this.walletPublicKey = walletPublicKey;
    this.wallet = wallet || null;
    this.erClient = getERClient(erConfig);
    this.vrfListener = new VRFListener(this.erClient.getERConnection());
    this.state = {
      packAccount: null,
      packNonce: null,
      cardPoolPda: null,
      packType: 'beginner',
      isDelegated: false,
      vrfSeed: null,
      revealedSlots: [],
      isFinalized: false,
      error: null,
    };
  }

  onEvent(handler: SessionEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      this.eventHandlers = this.eventHandlers.filter(h => h !== handler);
    };
  }

  private emit(event: SessionEvent): void {
    this.eventHandlers.forEach(handler => handler(event));
  }

  getState(): Readonly<GachaSessionState> {
    return { ...this.state };
  }

  async startSession(packType: PackType): Promise<void> {
    try {
      this.state.packType = packType;
      this.state.revealedSlots = [];
      this.state.isFinalized = false;
      this.state.error = null;

      const vrfSeed = await this.vrfListener.requestVRFSeed();
      this.state.vrfSeed = vrfSeed;

      const isERAvailable = await this.erClient.isERAvailable();
      const programDeployed = isProgramDeployed();

      if (isERAvailable && programDeployed && this.wallet) {
        await this.startOnChainSession(packType, vrfSeed);
      } else {
        if (!programDeployed) {
          console.warn('[GachaSession] SIMULATION MODE: GACHA_PROGRAM_ID is placeholder — deploy the Anchor program first');
        } else if (!this.wallet) {
          console.warn('[GachaSession] SIMULATION MODE: no wallet provided — pass wallet to GachaSession constructor');
        } else {
          console.warn('[GachaSession] SIMULATION MODE: ER unavailable — using client-side simulation');
        }
        this.state.isDelegated = true;
      }

      this.emit({
        type: 'session_started',
        data: packType,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.state.error = (error as Error).message;
      this.emit({
        type: 'session_error',
        data: error as Error,
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  private async startOnChainSession(packType: PackType, vrfSeed: Uint8Array): Promise<void> {
    if (!this.wallet) throw new Error('Wallet required for on-chain session');

    console.log('[GachaSession] Starting on-chain session via Ephemeral Rollup');

    const solanaConnection = this.erClient.getSolanaConnection();
    const erConnection = this.erClient.getERConnection();

    const provider = new AnchorProvider(solanaConnection, this.wallet as any, {
      commitment: 'confirmed',
      skipPreflight: false,
    });
    const program = createProgram(provider);

    const nonceBytes = new Uint8Array(8);
    crypto.getRandomValues(nonceBytes);
    const packNonce = bytesToBigInt(nonceBytes);
    const nonceBuf = Buffer.alloc(8);
    nonceBuf.writeBigUInt64LE(packNonce);

    const [packPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('booster_pack'), this.walletPublicKey.toBuffer(), nonceBuf],
      GACHA_PROGRAM_ID,
    );

    const [cardPoolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('card_pool'), Buffer.from(EXPANSION_GENESIS)],
      GACHA_PROGRAM_ID,
    );

    this.state.packAccount = packPda;
    this.state.packNonce = packNonce;
    this.state.cardPoolPda = cardPoolPda;

    console.log('[GachaSession] Pack PDA:', packPda.toBase58());
    console.log('[GachaSession] Card Pool PDA:', cardPoolPda.toBase58());

    console.log('[GachaSession] Step 1: initialize_pack on Solana (priceLamports=0, payment already taken at purchase)...');
    const expansionArray = Array.from(EXPANSION_GENESIS);
    await (program.methods as any)
      .initializePack(PACK_TYPE_MAP[packType], expansionArray, new BN(packNonce.toString()), new BN(0))
      .accounts({
        boosterPack: packPda,
        owner: this.walletPublicKey,
        treasury: GACHA_TREASURY,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('[GachaSession] Step 2: delegating pack to ER...');
    const delegateTx = await this.erClient.createDelegationTransaction(
      this.walletPublicKey,
      packPda,
      GACHA_PROGRAM_ID,
    );
    const signedDelegateTx = await this.wallet.signTransaction(delegateTx);
    const delegateSig = await solanaConnection.sendRawTransaction(signedDelegateTx.serialize());
    await solanaConnection.confirmTransaction(delegateSig, 'confirmed');
    console.log('[GachaSession] Delegation tx confirmed:', delegateSig);

    console.log('[GachaSession] Step 3: delegate_and_open on ER...');
    const erProvider = new AnchorProvider(erConnection, this.wallet as any, {
      commitment: 'confirmed',
      skipPreflight: true,
    });
    const erProgram = createProgram(erProvider);

    await (erProgram.methods as any)
      .delegateAndOpen(Array.from(vrfSeed))
      .accounts({
        boosterPack: packPda,
        owner: this.walletPublicKey,
        delegationProgram: DELEGATION_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    this.state.isDelegated = true;

    this.emit({
      type: 'pack_delegated',
      data: `Pack ${packPda.toBase58()} delegated to ER validator: ${this.erClient.getValidator().toBase58()}`,
      timestamp: Date.now(),
    });

    console.log('[GachaSession] On-chain session started successfully');
  }

  async revealSlot(slotIndex: number, availableCardsByRarity: Record<Rarity, number[]>): Promise<SlotResult> {
    if (!this.state.vrfSeed) {
      throw new Error('Session not started. Call startSession first.');
    }
    if (slotIndex < 0 || slotIndex >= 5) {
      throw new Error('Invalid slot index. Must be 0-4.');
    }
    if (this.state.revealedSlots.some(s => s.slotIndex === slotIndex)) {
      throw new Error(`Slot ${slotIndex} already revealed.`);
    }

    const slotConfig = SLOT_CONFIGS[this.state.packType][slotIndex];

    const isOnChain = this.isReadyForOnChain();

    let resolvedRarity: Rarity;
    let cardNumber: number;

    if (isOnChain) {
      const result = await this.revealSlotOnChain(slotIndex);
      resolvedRarity = result.resolvedRarity;
      cardNumber = result.cardNumber;
    } else {
      const randomBytes = await deriveSlotRandomnessAsync(this.state.vrfSeed, slotIndex);

      if (slotConfig.isWild) {
        const rarityRoll = randomRarityValue(randomBytes);
        resolvedRarity = resolveRarityWithFloor(
          WILD_WEIGHTS[this.state.packType],
          slotConfig.minRarity,
          rarityRoll,
        );
      } else {
        resolvedRarity = slotConfig.minRarity;
      }

      const rarityIndex = RARITY_ORDER.indexOf(resolvedRarity);
      const minRarityIndex = RARITY_ORDER.indexOf(slotConfig.minRarity);
      if (rarityIndex < minRarityIndex) {
        console.error(
          `[GachaSession] CRITICAL: Rarity floor violation! Got ${resolvedRarity} but floor is ${slotConfig.minRarity}. Forcing floor rarity.`
        );
        resolvedRarity = slotConfig.minRarity;
      }

      const cardsOfRarity = availableCardsByRarity[resolvedRarity] || [];
      if (cardsOfRarity.length === 0) {
        throw new Error(`No cards available for rarity: ${resolvedRarity}`);
      }

      const cardRoll = randomCardValue(randomBytes);
      cardNumber = cardsOfRarity[Math.abs(cardRoll) % cardsOfRarity.length];
    }

    const result: SlotResult = {
      slotIndex,
      cardNumber,
      rarity: resolvedRarity,
      minRarity: slotConfig.minRarity,
      isWild: slotConfig.isWild,
    };

    this.state.revealedSlots.push(result);

    this.emit({
      type: 'slot_revealed',
      data: result,
      timestamp: Date.now(),
    });

    console.log(
      `[GachaSession] Slot ${slotIndex} revealed: GEN-${String(cardNumber).padStart(3, '0')} ` +
      `(${resolvedRarity}) [floor: ${slotConfig.minRarity}, wild: ${slotConfig.isWild}]`
    );

    return result;
  }

  private async revealSlotOnChain(slotIndex: number): Promise<{ resolvedRarity: Rarity; cardNumber: number }> {
    if (!this.wallet || !this.state.packAccount || !this.state.cardPoolPda) {
      throw new Error('On-chain reveal requires wallet, packAccount, and cardPoolPda');
    }

    const erConnection = this.erClient.getERConnection();
    const erProvider = new AnchorProvider(erConnection, this.wallet as any, {
      commitment: 'confirmed',
      skipPreflight: true,
    });
    const erProgram = createProgram(erProvider);

    console.log(`[GachaSession] reveal_card slot ${slotIndex} on ER...`);
    await (erProgram.methods as any)
      .revealCard(slotIndex)
      .accounts({
        boosterPack: this.state.packAccount,
        cardPool: this.state.cardPoolPda,
        owner: this.walletPublicKey,
      })
      .rpc();

    const packAccount = await (erProgram.account as any).boosterPack.fetch(this.state.packAccount);
    const slot = packAccount.slots[slotIndex];

    const resolvedRarity = RARITY_ORDER[slot.resolvedRarity] ?? 'Common';
    const cardNumber = slot.cardNumber as number;

    return { resolvedRarity, cardNumber };
  }

  async revealAllSlots(availableCardsByRarity: Record<Rarity, number[]>): Promise<SlotResult[]> {
    const results: SlotResult[] = [];
    for (let i = 0; i < 5; i++) {
      const result = await this.revealSlot(i, availableCardsByRarity);
      results.push(result);
    }
    return results;
  }

  async finalizeSession(): Promise<SlotResult[]> {
    if (this.state.revealedSlots.length !== 5) {
      throw new Error(`Cannot finalize: only ${this.state.revealedSlots.length}/5 slots revealed.`);
    }

    if (this.isReadyForOnChain()) {
      await this.finalizeSessionOnChain();
    } else {
      console.warn('[GachaSession] SIMULATION MODE: finalizeSession — no real on-chain transaction sent');
    }


    this.state.isFinalized = true;
    this.state.isDelegated = false;

    this.emit({
      type: 'session_finalized',
      timestamp: Date.now(),
    });

    console.log('[GachaSession] Session finalized. Results:',
      this.state.revealedSlots.map(s =>
        `Slot ${s.slotIndex}: GEN-${String(s.cardNumber).padStart(3, '0')} (${s.rarity})`
      ).join(', ')
    );

    return this.state.revealedSlots;
  }

  private async finalizeSessionOnChain(): Promise<void> {
    if (!this.wallet || !this.state.packAccount) {
      throw new Error('On-chain finalize requires wallet and packAccount');
    }

    const erConnection = this.erClient.getERConnection();
    const erProvider = new AnchorProvider(erConnection, this.wallet as any, {
      commitment: 'confirmed',
      skipPreflight: true,
    });
    const erProgram = createProgram(erProvider);

    console.log('[GachaSession] finalize_session on ER...');
    await (erProgram.methods as any)
      .finalizeSession()
      .accounts({
        boosterPack: this.state.packAccount,
        owner: this.walletPublicKey,
        delegationProgram: DELEGATION_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('[GachaSession] finalize_session confirmed — pack state committed to Solana via fraud-proof period');
  }

  private isReadyForOnChain(): boolean {
    return this.state.packAccount !== null
      && this.wallet !== null
      && isProgramDeployed();
  }

  destroy(): void {
    this.vrfListener.unsubscribe();
    this.eventHandlers = [];
  }
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  let result = 0n;
  for (let i = bytes.length - 1; i >= 0; i--) {
    result = (result << 8n) | BigInt(bytes[i]);
  }
  return result;
}

async function deriveSlotRandomnessAsync(vrfSeed: Uint8Array, slotIndex: number): Promise<Uint8Array> {
  const input = new Uint8Array(33);
  input.set(vrfSeed, 0);
  input[32] = slotIndex;
  const hashBuffer = await crypto.subtle.digest('SHA-256', input);
  return new Uint8Array(hashBuffer);
}

function resolveRarityWithFloor(
  weights: Record<Rarity, number>,
  minRarity: Rarity,
  randomValue: number,
): Rarity {
  const minIndex = RARITY_ORDER.indexOf(minRarity);

  const eligible: Array<{ rarity: Rarity; weight: number }> = RARITY_ORDER
    .filter((_, i) => i >= minIndex)
    .map(rarity => ({ rarity, weight: weights[rarity] }))
    .filter(({ weight }) => weight > 0);

  if (eligible.length === 0) {
    return minRarity;
  }

  const totalWeight = eligible.reduce((sum, { weight }) => sum + weight, 0);
  if (totalWeight === 0) {
    return minRarity;
  }

  const scaledValue = (randomValue * totalWeight) / 10_000;

  let cumulative = 0;
  for (const { rarity, weight } of eligible) {
    cumulative += weight;
    if (scaledValue < cumulative) {
      return rarity;
    }
  }

  return eligible[eligible.length - 1].rarity;
}
