import { create } from 'zustand'

interface SeekerState {
  isSeekerVerified: boolean
  seekerVerifiedAt: string | null
  seekerTokenMint: string | null
  seekerRewardClaimed: boolean
  isVerifying: boolean
  verificationError: string | null

  fetchSeekerStatus: (walletAddress: string) => Promise<void>
  startVerification: (walletAddress: string, walletAdapter: any) => Promise<boolean>
  claimReward: (walletAddress: string, walletAdapter?: any) => Promise<{ success: boolean; packId?: string }>
  reset: () => void
}

export const useSeekerStore = create<SeekerState>((set, get) => ({
  isSeekerVerified: false,
  seekerVerifiedAt: null,
  seekerTokenMint: null,
  seekerRewardClaimed: false,
  isVerifying: false,
  verificationError: null,

  fetchSeekerStatus: async (walletAddress: string) => {
    try {
      const response = await fetch(`/api/seeker/status/${walletAddress}`)
      if (response.ok) {
        const data = await response.json()
        set({
          isSeekerVerified: data.isSeekerVerified || false,
          seekerVerifiedAt: data.seekerVerifiedAt || null,
          seekerTokenMint: data.seekerTokenMint || null,
          seekerRewardClaimed: data.seekerRewardClaimed || false,
        })
      }
    } catch (err) {
      console.warn('Failed to fetch Seeker status:', err)
    }
  },

  startVerification: async (walletAddress: string, walletAdapter: any) => {
    set({ isVerifying: true, verificationError: null })
    try {
      const nonceResponse = await fetch('/api/seeker/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      })
      if (!nonceResponse.ok) throw new Error('Failed to get verification message')
      const { message } = await nonceResponse.json()

      let signatureBytes: Uint8Array
      if (walletAdapter.signMessage) {
        const messageBytes = new TextEncoder().encode(message)
        const result = await walletAdapter.signMessage(messageBytes)
        if (result instanceof Uint8Array) signatureBytes = result
        else if (result?.signature) signatureBytes = new Uint8Array(result.signature)
        else signatureBytes = new Uint8Array(result)
      } else {
        throw new Error('Your wallet does not support message signing.')
      }

      const verifyResponse = await fetch('/api/seeker/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, message, signature: Array.from(signatureBytes) }),
      })
      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json()
        throw new Error(errorData.error || 'Verification failed')
      }
      const result = await verifyResponse.json()
      if (result.verified) {
        set({ isSeekerVerified: true, seekerTokenMint: result.mintAddress || null, seekerVerifiedAt: new Date().toISOString(), seekerRewardClaimed: !result.rewardAvailable, isVerifying: false })
        return true
      } else {
        set({ isVerifying: false, verificationError: result.message || 'No Seeker Genesis Token found.' })
        return false
      }
    } catch (err: any) {
      set({ isVerifying: false, verificationError: err.message || 'Verification failed' })
      return false
    }
  },

  claimReward: async (walletAddress: string, walletAdapter?: any) => {
    try {
      const nonceResponse = await fetch('/api/seeker/claim-nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      })
      if (!nonceResponse.ok) throw new Error('Failed to get claim nonce')
      const { message } = await nonceResponse.json()
      if (!walletAdapter?.signMessage) throw new Error('Wallet does not support message signing')
      const messageBytes = new TextEncoder().encode(message)
      const result = await walletAdapter.signMessage(messageBytes)
      let signatureBytes: Uint8Array
      if (result instanceof Uint8Array) signatureBytes = result
      else if (result?.signature) signatureBytes = new Uint8Array(result.signature)
      else signatureBytes = new Uint8Array(result)

      const response = await fetch('/api/seeker/claim-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, message, signature: Array.from(signatureBytes) }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to claim reward')
      }
      const data = await response.json()
      set({ seekerRewardClaimed: true })
      return { success: true, packId: data.reward?.packId }
    } catch (err: any) {
      return { success: false }
    }
  },

  reset: () => {
    set({ isSeekerVerified: false, seekerVerifiedAt: null, seekerTokenMint: null, seekerRewardClaimed: false, isVerifying: false, verificationError: null })
  },
}))
