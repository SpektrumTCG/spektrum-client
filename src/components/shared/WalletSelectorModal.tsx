"use client"

import { useState, useEffect } from "react"
import { detectSolanaWallets, listenForNewWallets, type DetectedWallets, WALLET_ICONS } from "@/features/blockchain/solana/walletDetector"
import { X } from "lucide-react"
import { isStandalonePWA } from "@/lib/pwaUtils"

interface WalletSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectWallet: (walletName: string) => void
}

export function WalletSelectorModal({
  isOpen,
  onClose,
  onSelectWallet,
}: WalletSelectorModalProps) {
  const [availableWallets, setAvailableWallets] = useState<DetectedWallets>({})
  const [hasWallets, setHasWallets] = useState(false)
  const [isInStandalonePWA, setIsInStandalonePWA] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const inPWA = isStandalonePWA()
      setIsInStandalonePWA(inPWA)

      const updateWallets = (wallets: DetectedWallets) => {
        setAvailableWallets(wallets)
        setHasWallets(Object.keys(wallets).some(key => wallets[key]?.isInstalled))
        console.log("Detected Wallets:", Object.keys(wallets).filter(k => wallets[k]?.isInstalled))
      }

      updateWallets(detectSolanaWallets())

      const unsubscribe = listenForNewWallets(updateWallets)

      const retryTimer = setTimeout(() => {
        console.log("Re-scanning for late-registering wallets...")
        updateWallets(detectSolanaWallets())
      }, 1000)

      console.log("PWA Standalone Mode:", inPWA)

      return () => {
        unsubscribe()
        clearTimeout(retryTimer)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleWalletClick = (walletName: string) => {
    onSelectWallet(walletName)
    onClose()
  }

  const installLinks: Record<string, string> = {
    phantom: "https://phantom.app/download",
    solflare: "https://solflare.com/download",
    backpack: "https://backpack.app/downloads",
    trustWallet: "https://trustwallet.com/download",
    jupiter: "https://jup.ag/mobile",
    magicEden: "https://wallet.magiceden.io",
    glow: "https://glow.app",
    slope: "https://slope.finance",
    coin98: "https://coin98.com/wallet",
    seeker: "https://seeker.solana.com",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div
        className="bg-gray-900 border-2 border-orange-500 rounded-xl shadow-2xl max-w-md w-full p-4 md:p-6 relative max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 0 40px rgba(249, 115, 22, 0.3)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-orange-400 hover:text-orange-300 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl md:text-2xl font-bold mb-2 text-orange-400">
          Connect Wallet
        </h2>
        <p className="text-xs md:text-sm text-gray-300 mb-2">
          Choose your Solana wallet to continue
        </p>

        <div className="mb-4 md:mb-6 p-3 bg-yellow-900/20 rounded-lg border border-yellow-600/50">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-xs md:text-sm font-semibold text-yellow-300 mb-1">
                Important: Switch to Devnet
              </p>
              <p className="text-xs text-yellow-200">
                Please ensure your wallet is connected to <strong>Solana Devnet</strong> before connecting. You can change networks in your wallet settings.
              </p>
            </div>
          </div>
        </div>

        {hasWallets ? (
          <div className="space-y-3">
            {Object.entries(availableWallets).map(([key, wallet]) => {
              if (!wallet?.isInstalled) return null

              const isDeepLink = wallet.isDeeplink || wallet.adapter?.isDeeplink

              return (
                <button
                  key={key}
                  onClick={() => handleWalletClick(key)}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-orange-500 border-opacity-40 bg-gray-800 hover:border-opacity-100 hover:bg-gray-700 transition-all duration-200"
                  style={{ boxShadow: "0 0 15px rgba(249, 115, 22, 0.1)" }}
                >
                  {wallet.icon.startsWith("data:") || wallet.icon.includes("/") ? (
                    <img
                      src={wallet.icon}
                      alt={wallet.name}
                      className="w-8 h-8 md:w-10 md:h-10 object-contain"
                    />
                  ) : (
                    <span className="text-3xl md:text-4xl">{wallet.icon}</span>
                  )}
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white text-base md:text-lg">
                      {wallet.name}
                    </div>
                    <div className="text-xs md:text-sm text-green-400">
                      {isDeepLink ? "↗ Open App" : "✓ Detected"}
                    </div>
                  </div>
                  <div className="text-orange-400">→</div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Wallet Detected
            </h3>
            <p className="text-sm text-gray-300 mb-6">
              Install a Solana wallet to get started
            </p>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-orange-400 mb-3">
                Recommended Wallets:
              </h4>
              {[
                { name: "Phantom", key: "phantom" },
                { name: "Solflare", key: "solflare" },
                { name: "Backpack", key: "backpack" },
              ].map((wallet) => (
                <a
                  key={wallet.key}
                  href={installLinks[wallet.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border-2 border-orange-500 border-opacity-40 bg-gray-800 hover:border-opacity-100 hover:bg-gray-700 transition-all duration-200"
                  style={{ boxShadow: "0 0 10px rgba(249, 115, 22, 0.1)" }}
                >
                  <img
                    src={WALLET_ICONS[wallet.key]}
                    alt={wallet.name}
                    className="w-6 h-6 md:w-7 md:h-7 object-contain"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-white text-sm md:text-base">
                      {wallet.name}
                    </div>
                  </div>
                  <div className="text-xs text-orange-400">Install →</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {isInStandalonePWA && (
          <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-500/70">
            <div className="space-y-2">
              <div className="text-xs text-blue-300">
                <strong>ℹ️ App Shortcut Mode:</strong> Connecting via wallet app deeplink.
              </div>
              <p className="text-xs text-blue-200">
                Select your wallet below to open the wallet app and complete the connection.
              </p>
            </div>
          </div>
        )}

        {!isInStandalonePWA && (
          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-600/50">
            <div className="text-xs text-blue-300">
              <strong>📱 Mobile Users:</strong> For the best experience, open this page in your wallet&apos;s built-in browser (e.g. Phantom, Solflare, or Seeker browser).
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
