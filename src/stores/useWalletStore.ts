import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PlayerProfile {
  displayName: string | null
  gamesPlayed: number
  gamesWon: number
  gamesLost: number
  country: string | null
  region: string | null
}

interface WalletStore {
  isConnected: boolean
  isReconnecting: boolean
  walletAddress: string | null
  walletType: string | null
  savedWalletAddress: string | null
  savedWalletType: string | null
  balance: number
  connectionStatus: "disconnected" | "connecting" | "connected" | "error"
  lastConnectionError: string | null
  playerProfile: PlayerProfile | null
  isEmailAuth: boolean

  connectWallet: (walletName?: string) => Promise<boolean>
  disconnectWallet: () => Promise<void>
  attemptAutoReconnect: () => Promise<boolean>
  setConnectionStatus: (status: WalletStore["connectionStatus"]) => void
  setWalletData: (data: { address: string; balance: number; walletType?: string }) => void
  setError: (error: string | null) => void
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      isConnected: false,
      isReconnecting: false,
      walletAddress: null,
      walletType: null,
      savedWalletAddress: null,
      savedWalletType: null,
      balance: 0,
      connectionStatus: "disconnected",
      lastConnectionError: null,
      playerProfile: null,
      isEmailAuth: false,

      connectWallet: async () => false,
      disconnectWallet: async () => {},
      attemptAutoReconnect: async () => false,

      setConnectionStatus: (status) => set({ connectionStatus: status }),
      setWalletData: ({ address, balance, walletType }) =>
        set({ walletAddress: address, balance, walletType: walletType ?? null, isConnected: true }),
      setError: (error) => set({ lastConnectionError: error }),
    }),
    {
      name: "wallet-store",
      partialize: (s) => ({
        savedWalletAddress: s.walletAddress,
        savedWalletType: s.walletType,
        isEmailAuth: s.isEmailAuth,
      }),
    }
  )
)
