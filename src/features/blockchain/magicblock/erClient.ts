import { Connection, PublicKey, Transaction, sendAndConfirmTransaction, Keypair } from '@solana/web3.js';
import {
  DELEGATION_PROGRAM_ID,
  DEFAULT_VALIDATOR,
  createDelegateInstruction,
  Resolver,
  type Configuration,
} from '@magicblock-labs/ephemeral-rollups-sdk';

export const ER_ENDPOINTS = {
  mainnet: {
    asia: { rpc: 'https://as.magicblock.app', ws: 'wss://as.magicblock.app', validator: 'MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57' },
    eu: { rpc: 'https://eu.magicblock.app', ws: 'wss://eu.magicblock.app', validator: 'MEUGGrYPxKk17hCr7wpT6s8dtNokZj5U2L57vjYMS8e' },
    us: { rpc: 'https://us.magicblock.app', ws: 'wss://us.magicblock.app', validator: 'MUS3hc9TCw4cGC12vHNoYcCGzJG1txjgQLZWVoeNHNd' },
  },
  devnet: {
    asia: { rpc: 'https://devnet-as.magicblock.app', ws: 'wss://devnet-as.magicblock.app', validator: 'MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57' },
    eu: { rpc: 'https://devnet-eu.magicblock.app', ws: 'wss://devnet-eu.magicblock.app', validator: 'MEUGGrYPxKk17hCr7wpT6s8dtNokZj5U2L57vjYMS8e' },
    us: { rpc: 'https://devnet-us.magicblock.app', ws: 'wss://devnet-us.magicblock.app', validator: 'MUS3hc9TCw4cGC12vHNoYcCGzJG1txjgQLZWVoeNHNd' },
  },
} as const;

export type ERNetwork = 'mainnet' | 'devnet';
export type ERRegion = 'asia' | 'eu' | 'us';

export interface ERClientConfig {
  network: ERNetwork;
  region: ERRegion;
  solanaRpcUrl: string;
}

export class ERClient {
  private solanaConnection: Connection;
  private erConnection: Connection;
  private resolver: Resolver;
  private validatorPubkey: PublicKey;
  private config: ERClientConfig;

  constructor(config: ERClientConfig) {
    this.config = config;
    const endpoint = ER_ENDPOINTS[config.network][config.region];

    this.solanaConnection = new Connection(config.solanaRpcUrl, 'confirmed');
    this.erConnection = new Connection(endpoint.rpc, 'confirmed');
    this.validatorPubkey = new PublicKey(endpoint.validator);

    const resolverConfig: Configuration = {
      chain: endpoint.rpc,
      websocket: endpoint.ws,
    };
    this.resolver = new Resolver(resolverConfig, new Map());
  }

  getSolanaConnection(): Connection {
    return this.solanaConnection;
  }

  getERConnection(): Connection {
    return this.erConnection;
  }

  getValidator(): PublicKey {
    return this.validatorPubkey;
  }

  async createDelegationTransaction(
    payer: PublicKey,
    accountToDelegateKey: PublicKey,
    ownerProgram: PublicKey,
    seeds?: Uint8Array[],
    commitFrequencyMs: number = 5000,
  ): Promise<Transaction> {
    const ix = createDelegateInstruction(
      {
        payer,
        delegatedAccount: accountToDelegateKey,
        ownerProgram,
        validator: this.validatorPubkey,
      },
      {
        commitFrequencyMs,
        seeds,
        validator: this.validatorPubkey,
      },
    );

    const tx = new Transaction().add(ix);
    const { blockhash } = await this.solanaConnection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer;

    return tx;
  }

  async resolveConnection(accountPubkey: PublicKey): Promise<Connection> {
    const resolved = await this.resolver.resolve(accountPubkey);
    return resolved || this.erConnection;
  }

  async trackDelegation(accountPubkey: PublicKey): Promise<{ isDelegated: boolean; validator?: string }> {
    try {
      const record = await this.resolver.trackAccount(accountPubkey);
      if (record.status === 0) {
        return { isDelegated: true, validator: record.validator.toBase58() };
      }
      return { isDelegated: false };
    } catch {
      return { isDelegated: false };
    }
  }

  async isERAvailable(): Promise<boolean> {
    try {
      const version = await this.erConnection.getVersion();
      return !!version;
    } catch {
      return false;
    }
  }

  async destroy(): Promise<void> {
    await this.resolver.terminate();
  }
}

let erClientInstance: ERClient | null = null;

export function getERClient(config?: ERClientConfig): ERClient {
  if (!erClientInstance && config) {
    erClientInstance = new ERClient(config);
  }
  if (!erClientInstance) {
    const networkEnv = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
    const network: ERNetwork = networkEnv === 'mainnet' ? 'mainnet' : 'devnet';
    const solanaRpcUrl = networkEnv === 'mainnet-beta' || networkEnv === 'mainnet'
      ? (process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com')
      : (process.env.NEXT_PUBLIC_HELIUS_DEVNET_URL || 'https://api.devnet.solana.com');
    erClientInstance = new ERClient({
      network,
      region: 'us',
      solanaRpcUrl,
    });
  }
  return erClientInstance;
}

export function resetERClient(): void {
  if (erClientInstance) {
    erClientInstance.destroy();
    erClientInstance = null;
  }
}
