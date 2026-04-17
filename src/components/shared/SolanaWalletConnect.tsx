"use client"

import { useEffect, useState } from "react"
import { useWalletStore } from "@/stores/useWalletStore"
import { toast } from "sonner"
import { WalletSelectorModal } from "@/components/shared/WalletSelectorModal"
import { isStandalonePWA } from "@/lib/pwaUtils"

interface SolanaWalletConnectProps {
  onConnected?: (walletAddress: string) => void
}

export function SolanaWalletConnect({ onConnected }: SolanaWalletConnectProps) {
  const [showWalletSelector, setShowWalletSelector] = useState(false)
  const [isPWAStandalone, setIsPWAStandalone] = useState(false)

  const {
    isConnected,
    walletAddress,
    walletType,
    connectionStatus,
    lastConnectionError,
    connectWallet,
    disconnectWallet,
  } = useWalletStore()

  // Check for PWA standalone mode on mount
  useEffect(() => {
    setIsPWAStandalone(isStandalonePWA())
  }, [])

  // Notify parent when connected
  useEffect(() => {
    if (isConnected && walletAddress && onConnected) {
      onConnected(walletAddress)
    }
  }, [isConnected, walletAddress, onConnected])

  // Show error toast when connection fails
  useEffect(() => {
    if (lastConnectionError && connectionStatus === "error") {
      toast.error(`Wallet connection failed: ${lastConnectionError}`)
    }
  }, [lastConnectionError, connectionStatus])

  const handleConnect = () => {
    setShowWalletSelector(true)
  }

  const handleWalletSelect = async (walletName: string) => {
    const success = await connectWallet(walletName)
    if (success) {
      toast.success(`${walletName.charAt(0).toUpperCase() + walletName.slice(1)} wallet connected!`)
    }
  }

  const handleDisconnect = async () => {
    await disconnectWallet()
    toast.success("Wallet disconnected")
  }

  const getWalletDisplayName = (type: string | null) => {
    if (!type) return "Wallet"
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <>
      {isPWAStandalone && !isConnected && (
        <div className="mb-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/70">
          <div className="text-xs text-blue-300">
            <strong>ℹ️ Using App Shortcut:</strong> Click connect and select your wallet to open the wallet app.
          </div>
        </div>
      )}

      <WalletSelectorModal
        isOpen={showWalletSelector}
        onClose={() => setShowWalletSelector(false)}
        onSelectWallet={handleWalletSelect}
      />

      {!isConnected ? (
        <button
          onClick={handleConnect}
          disabled={connectionStatus === "connecting"}
          className={`w-full bg-gray-800 text-gray-300 hover:text-white font-medium py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 border-2 border-orange-500 border-opacity-40 hover:border-opacity-100 ${
            connectionStatus === "connecting"
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-700"
          }`}
          style={{ boxShadow: "0 0 15px rgba(249, 115, 22, 0.1)" }}
        >
          {connectionStatus === "connecting" ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <button
          onClick={handleDisconnect}
          className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white font-medium py-4 px-8 rounded-xl flex items-center justify-center gap-2 border border-green-500"
          style={{ boxShadow: "0 0 15px rgba(34, 197, 94, 0.3)" }}
        >
          <span>✓</span> {getWalletDisplayName(walletType)} Connected
        </button>
      )}
    </>
  )
}
