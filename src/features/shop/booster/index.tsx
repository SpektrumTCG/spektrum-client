"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { BackButton } from "@/components/shared/BackButton"
import { useBoosterVariantStore, variantTemplates } from "@/stores/useBoosterVariantStore"
import { useInventoryStore } from "@/stores/useInventoryStore"
import type { BoosterVariant, BoosterPack } from "@/stores/useBoosterVariantStore"

type Step = "tier-selection" | "pack-selection" | "confirm"

const EXPANSION = {
  id: "fire-and-water",
  name: "Fire and Water",
  symbol: "🔥💧",
  description: "The first Spektrum expansion featuring Fire and Water type cards.",
  cardCount: 120,
  locked: false,
}

const TIER_IMAGES: Record<string, string> = {
  Beginner: "/boosters/beginner.png",
  Advanced: "/boosters/advanced.png",
  Expert: "/boosters/expert.png",
}

const TIER_COLORS: Record<string, string> = {
  Beginner: "from-green-600 to-green-800",
  Advanced: "from-purple-600 to-purple-800",
  Expert: "from-orange-600 to-orange-800",
}

const TIER_EMOJIS: Record<string, string> = {
  Beginner: "📦",
  Advanced: "⚡",
  Expert: "💎",
}

export function BoosterFeature() {
  const router = useRouter()
  const { addBoosterPack } = useInventoryStore()
  const [step, setStep] = useState<Step>("tier-selection")
  const [selectedTier, setSelectedTier] = useState<(typeof variantTemplates)[0] | null>(null)
  const [selectedPackIndex, setSelectedPackIndex] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBack = () => {
    if (step === "pack-selection") {
      setStep("tier-selection")
      setSelectedTier(null)
    } else if (step === "confirm") {
      setStep("pack-selection")
      setSelectedPackIndex(null)
    } else {
      router.push("/shop")
    }
  }

  const handleTierSelect = (tier: (typeof variantTemplates)[0]) => {
    setSelectedTier(tier)
    setStep("pack-selection")
  }

  const handlePackSelect = (index: number) => {
    setSelectedPackIndex(index)
    setStep("confirm")
  }

  const handleConfirmPurchase = async () => {
    if (!selectedTier || selectedPackIndex === null || isProcessing) return
    setIsProcessing(true)

    try {
      const variant: BoosterVariant = {
        id: `variant-${selectedTier.rarity.toLowerCase()}-${Date.now()}`,
        name: `${selectedTier.rarity} Pack`,
        subtitle: selectedTier.subtitle,
        artUrl: TIER_IMAGES[selectedTier.rarity] || "",
        rarity: selectedTier.rarity,
        description: selectedTier.description,
        priceMultiplier: selectedTier.priceMultiplier,
        guaranteedRarities: selectedTier.guaranteedRarities,
        rarityWeights: selectedTier.rarityWeights,
        guaranteedSlots: selectedTier.guaranteedSlots,
      }

      const pack: BoosterPack = {
        id: `pack-${EXPANSION.id}-${selectedTier.rarity.toLowerCase()}-${selectedPackIndex}`,
        name: `${EXPANSION.name} ${selectedTier.rarity} Pack`,
        element: "mixed",
        price: selectedTier.price,
        description: selectedTier.description,
        guaranteedRarity: selectedTier.rarity,
        cardCount: 5,
        emoji: TIER_EMOJIS[selectedTier.rarity] || "📦",
        color: "#FF6B35",
        artUrl: TIER_IMAGES[selectedTier.rarity] || "",
      }

      addBoosterPack(variant, pack, selectedTier.price)
      toast.success(`Purchased ${selectedTier.rarity} Pack! Check your Inventory to open it.`)
      router.push("/inventory")
    } catch {
      toast.error("Purchase failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <BackButton onClick={handleBack} />
      <div className="max-w-md mx-auto p-4 w-full pt-6">

        {step === "tier-selection" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-orange-400 mb-1">Booster Packs</h1>
              <p className="text-gray-400 text-sm">{EXPANSION.name} {EXPANSION.symbol}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {variantTemplates.map((tier) => (
                <button
                  key={tier.rarity}
                  onClick={() => handleTierSelect(tier)}
                  className="flex flex-col overflow-hidden rounded-2xl bg-gray-800 hover:scale-105 transition-transform duration-200 cursor-pointer border-2 border-transparent hover:border-orange-500 text-left"
                >
                  <div className="w-full aspect-[3/4] flex items-center justify-center">
                    {TIER_IMAGES[tier.rarity] ? (
                      <img
                        src={TIER_IMAGES[tier.rarity]}
                        alt={tier.rarity}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement
                          t.style.display = "none"
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-b ${TIER_COLORS[tier.rarity]} flex items-center justify-center`}>
                        <span className="text-4xl">{TIER_EMOJIS[tier.rarity]}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 text-center">
                    <h3 className="text-sm font-bold text-white mb-1">{tier.rarity}</h3>
                    <p className="text-[10px] text-gray-400 mb-2 line-clamp-2">{tier.description}</p>
                    <div className="bg-gray-900 rounded p-1.5 mb-2 space-y-0.5 text-[10px]">
                      <div className="flex justify-between text-gray-300">
                        <span>Price</span><span className="font-bold text-orange-400">${tier.price}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Cards</span><span className="font-bold">5</span>
                      </div>
                    </div>
                    <div className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white text-xs font-semibold py-1 rounded">
                      Select
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "pack-selection" && selectedTier && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-orange-400 mb-1">Choose Your Pack</h1>
              <p className="text-gray-400 text-sm">{EXPANSION.name} — {selectedTier.rarity}</p>
              <div className="flex justify-center gap-2 mt-2">
                <span className="bg-gray-800 text-orange-400 px-3 py-1 rounded text-sm font-bold">5 cards</span>
                <span className="bg-gray-800 text-orange-400 px-3 py-1 rounded text-sm font-bold">${selectedTier.price}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePackSelect(i)}
                  className="aspect-[3/4] rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer border-2 border-transparent hover:border-orange-500"
                >
                  <img
                    src={TIER_IMAGES[selectedTier.rarity]}
                    alt={`Pack ${i + 1}`}
                    className="w-full h-full object-contain bg-gray-800"
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-gray-400 text-sm">Each pack contains unique card combinations. Choose wisely!</p>
          </motion.div>
        )}

        {step === "confirm" && selectedTier && selectedPackIndex !== null && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-orange-400 mb-1">Confirm Purchase</h1>
            </div>
            <div className="bg-gray-900 border-2 border-orange-500 rounded-xl p-6 space-y-4" style={{ boxShadow: "0 0 30px rgba(249,115,22,0.2)" }}>
              <div className="flex justify-center">
                <img
                  src={TIER_IMAGES[selectedTier.rarity]}
                  alt={selectedTier.rarity}
                  className="w-36 object-contain"
                />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">{selectedTier.rarity} Pack</h2>
                <p className="text-gray-400 text-sm">{EXPANSION.name}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Contents</span><span className="text-white">5 cards</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Guaranteed</span><span className="text-white">{selectedTier.guaranteedSlots.join(", ")}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-gray-300">Price</span>
                  <span className="text-orange-400 text-lg">${selectedTier.price} USDC</span>
                </div>
              </div>
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 text-center">
                <p className="text-blue-300 text-xs">Mock purchase — no real payment will be processed.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBack}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-lg border-2 border-orange-500/40 text-gray-300 font-semibold hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-semibold transition-all flex items-center justify-center gap-2 border border-orange-400"
                style={{ boxShadow: "0 0 20px rgba(249,115,22,0.4)" }}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : "Confirm Purchase"}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
