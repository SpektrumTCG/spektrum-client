"use client"

import { usePrivy } from "@privy-io/react-auth"

/**
 * Thin adapter over Privy exposing the auth surface the app consumes.
 * Mirrors the old Clerk `useUser()` shape (isLoaded / isSignedIn) so call
 * sites stay simple, and centralizes embedded-Solana-wallet extraction.
 */
export function useAuthSession() {
  const { ready, authenticated, user, login, logout, linkEmail } = usePrivy()

  const solanaWallet = user?.linkedAccounts?.find(
    (account) => account.type === "wallet" && account.chainType === "solana"
  )

  return {
    isLoaded: ready,
    isSignedIn: ready && authenticated,
    user,
    login,
    logout,
    linkEmail,
    walletAddress:
      solanaWallet && "address" in solanaWallet ? solanaWallet.address : null,
    email: user?.email?.address ?? null,
  }
}
