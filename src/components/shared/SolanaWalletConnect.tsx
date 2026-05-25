"use client"

import { useEffect } from "react"
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs"
import { useWalletStore } from "@/stores/useWalletStore"

interface SolanaWalletConnectProps {
  onConnected?: (walletAddress: string) => void
}

export function SolanaWalletConnect({ onConnected }: SolanaWalletConnectProps) {
  const { isSignedIn, user } = useUser()
  const walletAddress = useWalletStore((s) => s.walletAddress)

  useEffect(() => {
    if (isSignedIn && walletAddress && onConnected) {
      onConnected(walletAddress)
    }
  }, [isSignedIn, walletAddress, onConnected])

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button
          className="w-full bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 font-medium py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 border-2 border-orange-500 border-opacity-40 hover:border-opacity-100"
          style={{ boxShadow: "0 0 15px rgba(249, 115, 22, 0.1)" }}
        >
          Connect Wallet
        </button>
      </SignInButton>
    )
  }

  const label = user?.web3Wallets?.[0]?.web3Wallet
    ? `${user.web3Wallets[0].web3Wallet.slice(0, 4)}…${user.web3Wallets[0].web3Wallet.slice(-4)}`
    : user?.primaryEmailAddress?.emailAddress ?? "Connected"

  return (
    <SignOutButton>
      <button
        className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white font-medium py-4 px-8 rounded-xl flex items-center justify-center gap-2 border border-green-500"
        style={{ boxShadow: "0 0 15px rgba(34, 197, 94, 0.3)" }}
      >
        <span>✓</span> {label}
      </button>
    </SignOutButton>
  )
}
