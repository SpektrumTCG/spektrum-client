"use client"

import { useEffect } from "react"
import { useAuthSession } from "@/lib/auth"
import { useWalletStore } from "@/stores/useWalletStore"

interface SolanaWalletConnectProps {
  onConnected?: (walletAddress: string) => void
}

export function SolanaWalletConnect({ onConnected }: SolanaWalletConnectProps) {
  const { isSignedIn, login, logout, walletAddress: authWallet, email } = useAuthSession()
  const walletAddress = useWalletStore((s) => s.walletAddress)

  useEffect(() => {
    if (isSignedIn && walletAddress && onConnected) {
      onConnected(walletAddress)
    }
  }, [isSignedIn, walletAddress, onConnected])

  if (!isSignedIn) {
    return (
      <button
        onClick={() => login()}
        className="w-full bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 font-medium py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 border-2 border-orange-500 border-opacity-40 hover:border-opacity-100"
        style={{ boxShadow: "0 0 15px rgba(249, 115, 22, 0.1)" }}
      >
        Connect Wallet
      </button>
    )
  }

  const label = authWallet
    ? `${authWallet.slice(0, 4)}…${authWallet.slice(-4)}`
    : email ?? "Connected"

  return (
    <button
      onClick={() => logout()}
      className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white font-medium py-4 px-8 rounded-xl flex items-center justify-center gap-2 border border-green-500"
      style={{ boxShadow: "0 0 15px rgba(34, 197, 94, 0.3)" }}
    >
      <span>✓</span> {label}
    </button>
  )
}
