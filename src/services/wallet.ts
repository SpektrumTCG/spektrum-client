// src/services/wallet.ts
// Wallet integration layer. Copy/rewrite from existing blockchain/ code.
// This file is the ONLY place that imports blockchain or Solana code.

export type SupportedWallet = "phantom" | "solflare" | "backpack"

export interface WalletConnectionResult {
  address: string
  walletType: SupportedWallet
  balance: number
}

// Stub — implement by copying/rewriting from existing blockchain/ integrations
export const walletService = {
  connect: async (_walletType: SupportedWallet): Promise<WalletConnectionResult> => {
    throw new Error("walletService.connect not implemented yet")
  },
  disconnect: async (): Promise<void> => {
    throw new Error("walletService.disconnect not implemented yet")
  },
  getBalance: async (_address: string): Promise<number> => {
    throw new Error("walletService.getBalance not implemented yet")
  },
}
