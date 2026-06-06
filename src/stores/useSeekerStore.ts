import { create } from 'zustand'
import { apiFetch } from "@/lib/api"

interface SeekerState {
  isSeekerVerified: boolean
  seekerVerifiedAt: string | null
  seekerTokenMint: string | null
  seekerRewardClaimed: boolean
  isVerifying: boolean
  verificationError: string | null

  fetchSeekerStatus: (walletAddress: string) => Promise<void>
  startVerification: () => Promise<boolean>
  claimReward: () => Promise<{ success: boolean; packId?: string }>
  reset: () => void
}

export const useSeekerStore = create<SeekerState>()((set) => ({
  isSeekerVerified: false,
  seekerVerifiedAt: null,
  seekerTokenMint: null,
  seekerRewardClaimed: false,
  isVerifying: false,
  verificationError: null,

  fetchSeekerStatus: async (walletAddress: string) => {
    try {
      const response = await apiFetch(`/api/seeker/status/${walletAddress}`, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        set({
          isSeekerVerified: data.isSeekerVerified || false,
          seekerVerifiedAt: data.seekerVerifiedAt || null,
          seekerTokenMint: data.seekerTokenMint || null,
          seekerRewardClaimed: data.seekerRewardClaimed || false,
        })
      }
    } catch {
      // silently ignore fetch errors
    }
  },

  startVerification: async () => {
    set({ isVerifying: true, verificationError: null })
    try {
      const response = await apiFetch('/api/seeker/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Verification failed')
      }
      const result = await response.json()
      if (result.verified) {
        set({
          isSeekerVerified: true,
          seekerTokenMint: result.mintAddress || null,
          seekerVerifiedAt: new Date().toISOString(),
          seekerRewardClaimed: !result.rewardAvailable,
          isVerifying: false,
        })
        return true
      }
      set({ isVerifying: false, verificationError: result.message || 'No Seeker Genesis Token found.' })
      return false
    } catch (err: any) {
      set({ isVerifying: false, verificationError: err.message || 'Verification failed' })
      return false
    }
  },

  claimReward: async () => {
    try {
      const response = await apiFetch('/api/seeker/claim-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to claim reward')
      }
      const data = await response.json()
      set({ seekerRewardClaimed: true })
      return { success: true, packId: data.reward?.packId }
    } catch (err: any) {
      const msg = err?.message ?? 'Unknown error'
      set({ verificationError: msg, isVerifying: false })
      return { success: false }
    }
  },

  reset: () => {
    set({ isSeekerVerified: false, seekerVerifiedAt: null, seekerTokenMint: null, seekerRewardClaimed: false, isVerifying: false, verificationError: null })
  },
}))
