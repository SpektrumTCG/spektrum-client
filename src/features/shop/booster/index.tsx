"use client"

import { useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { toast } from "sonner"
import { useBoosterVariantStore, variantTemplates } from "@/stores/useBoosterVariantStore"
import { useInventoryStore } from "@/stores/useInventoryStore"
import { useRequireAuth } from "@/components/shared/AuthGateModal"
import type { BoosterVariant, BoosterPack } from "@/stores/useBoosterVariantStore"

type Step = "tier-selection" | "confirm"

const EXPANSION = {
  id: "genesis-series",
  name: "Genesis Series",
  cardCount: 120,
  locked: false,
}

const ACTIVE_TIERS = ["Beginner"] as const

const TIER_LABELS: Record<string, string> = {
  Beginner: "Fire and Water",
  Advanced: "Water",
}

const TIER_IMAGES: Record<string, string> = {
  Beginner: "/boosters/beginner.png",
  Advanced: "/boosters/advanced.png",
}

const TIER_COLORS: Record<string, string> = {
  Beginner: "from-red-600 to-orange-800",
  Advanced: "from-blue-600 to-cyan-800",
}

const TIER_EMOJIS: Record<string, string> = {
  Beginner: "🔥",
  Advanced: "💧",
}

const UPCOMING_PACKS: Array<{ label: string; emoji: string; color: string }> = [
  { label: "Ground", emoji: "⛰️", color: "from-amber-700 to-yellow-900" },
  { label: "Air", emoji: "🌪️", color: "from-sky-500 to-indigo-700" },
]

const STEP_NUM: Record<Step, number> = {
  "tier-selection": 1,
  confirm: 2,
}
const STEP_TOTAL = Object.keys(STEP_NUM).length

function StepHeader({
  step,
  onBack,
  title,
  children,
}: {
  step: Step
  onBack: () => void
  title: string
  children?: ReactNode
}) {
  const current = STEP_NUM[step]
  return (
    <div className="relative mb-6 mt-7">
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-600 transition-colors hover:text-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        <ChevronLeft size={28} />
      </button>
      <h1 className="text-center text-3xl font-bold uppercase tracking-wider text-gray-800">{title}</h1>
      <div className="mt-3 flex justify-center gap-1.5" role="status" aria-label={`Step ${current} of ${STEP_TOTAL}`}>
        {Array.from({ length: STEP_TOTAL }, (_, i) => i + 1).map((n) => (
          <span
            key={n}
            className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
              n === current ? "w-5 bg-orange-500" : n < current ? "w-1.5 bg-orange-300" : "w-1.5 bg-gray-300"
            }`}
          />
        ))}
      </div>
      {children && <div className="mt-3 flex justify-center">{children}</div>}
    </div>
  )
}

export function BoosterFeature() {
  const router = useRouter()
  const { addBoosterPack } = useInventoryStore()
  const requireAuth = useRequireAuth("buy-pack")
  const [step, setStep] = useState<Step>("tier-selection")
  const [selectedTier, setSelectedTier] = useState<(typeof variantTemplates)[0] | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const handleBack = () => {
    if (step === "confirm") {
      setStep("tier-selection")
      setSelectedTier(null)
    } else {
      router.push("/shop")
    }
  }

  const handleTierSelect = (tier: (typeof variantTemplates)[0]) => {
    setSelectedTier(tier)
    setStep("confirm")
  }

  const handleConfirmPurchase = async () => {
    if (!selectedTier || isProcessing) return
    const tier = selectedTier
    requireAuth(() => { void runPurchase(tier) })
  }

  const runPurchase = async (tier: NonNullable<typeof selectedTier>) => {
    setIsProcessing(true)

    try {
      const label = TIER_LABELS[tier.rarity] || tier.rarity
      const variant: BoosterVariant = {
        id: `variant-${tier.rarity.toLowerCase()}-${Date.now()}`,
        name: `${label} Pack`,
        subtitle: tier.subtitle,
        artUrl: TIER_IMAGES[tier.rarity] || "",
        rarity: tier.rarity,
        description: tier.description,
        priceMultiplier: tier.priceMultiplier,
        guaranteedRarities: tier.guaranteedRarities,
        rarityWeights: tier.rarityWeights,
        guaranteedSlots: tier.guaranteedSlots,
      }

      const pack: BoosterPack = {
        id: `pack-${EXPANSION.id}-${tier.rarity.toLowerCase()}`,
        name: `${EXPANSION.name} ${label} Pack`,
        element: "mixed",
        price: tier.price,
        description: tier.description,
        guaranteedRarity: tier.rarity,
        cardCount: 5,
        emoji: TIER_EMOJIS[tier.rarity] || "📦",
        color: "#FF6B35",
        artUrl: TIER_IMAGES[tier.rarity] || "",
      }

      const packId = addBoosterPack(variant, pack, tier.price)
      router.push(`/inventory?new=${packId}`)
    } catch {
      toast.error("Purchase failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto min-h-dvh justify-start">
      <div className="max-w-md mx-auto p-4 w-full pt-6">

        {step === "tier-selection" && (
          <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <StepHeader step="tier-selection" onBack={handleBack} title="Genesis Series" />
            <div className="mx-auto grid max-w-[220px] grid-cols-1 gap-3">
              {variantTemplates
                .filter((tier) => (ACTIVE_TIERS as readonly string[]).includes(tier.rarity))
                .map((tier) => {
                  const label = TIER_LABELS[tier.rarity] || tier.rarity
                  return (
                    <button
                      key={tier.rarity}
                      type="button"
                      onClick={() => handleTierSelect(tier)}
                      className="flex flex-col overflow-hidden rounded-2xl border-2 border-transparent bg-gray-800 text-left transition-transform duration-200 hover:scale-105 hover:border-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    >
                      <div className="flex aspect-[3/4] w-full items-center justify-center bg-[radial-gradient(circle_at_50%_38%,rgba(249,115,22,0.12),transparent_68%)]">
                        {TIER_IMAGES[tier.rarity] ? (
                          <img
                            src={TIER_IMAGES[tier.rarity]}
                            alt={label}
                            className="h-full w-full object-contain p-1"
                            onError={(e) => {
                              const t = e.target as HTMLImageElement
                              t.style.display = "none"
                            }}
                          />
                        ) : (
                          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-b ${TIER_COLORS[tier.rarity]}`}>
                            <span className="text-4xl">{TIER_EMOJIS[tier.rarity]}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-white">{label}</h3>
                          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-300">
                            {tier.rarity}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-gray-400">{tier.description}</p>
                        <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-[11px]">
                          <span className="text-gray-400">5 cards</span>
                          <span className="font-bold text-orange-400">${tier.price} USDC</span>
                        </div>
                        <div className="mt-2.5 rounded-md bg-gradient-to-r from-orange-600 to-orange-500 py-1.5 text-center text-xs font-semibold text-white">
                          Select
                        </div>
                      </div>
                    </button>
                  )
                })}
            </div>

            <div className="mt-7">
              <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Coming Soon</h2>
              <div className="grid grid-cols-2 gap-2.5">
                {UPCOMING_PACKS.map((pack) => (
                  <div
                    key={pack.label}
                    aria-disabled
                    className="flex items-center gap-2.5 rounded-xl bg-gray-800/70 p-2.5 opacity-80"
                  >
                    <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-b ${pack.color}`}>
                      <span className="text-xl grayscale">{pack.emoji}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-white">{pack.label}</h3>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Locked</p>
                    </div>
                    <span className="shrink-0 text-sm text-gray-500" aria-hidden>🔒</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === "confirm" && selectedTier && (
          <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <StepHeader step="confirm" onBack={handleBack} title="Confirm Purchase" />
            <div className="rounded-xl border-2 border-orange-500 bg-gray-900 p-6" style={{ boxShadow: "0 0 30px rgba(249,115,22,0.2)" }}>
              <div className="flex justify-center">
                <img
                  src={TIER_IMAGES[selectedTier.rarity]}
                  alt={selectedTier.rarity}
                  className="w-36 object-contain"
                />
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-xl font-bold text-white">{TIER_LABELS[selectedTier.rarity] || selectedTier.rarity} Pack</h2>
                <p className="text-sm text-gray-400">{EXPANSION.name} · {selectedTier.rarity}</p>
              </div>
              <div className="mt-5 divide-y divide-white/10 text-sm">
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Contents</span><span className="text-white">5 cards</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Guaranteed</span><span className="text-white">{selectedTier.guaranteedSlots.join(", ")}</span>
                </div>
                <div className="flex items-baseline justify-between py-2">
                  <span className="text-gray-400">Price</span>
                  <span className="text-lg font-bold text-orange-400">${selectedTier.price} USDC</span>
                </div>
              </div>
              <p className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-center text-xs text-gray-400">
                Mock purchase. No real payment will be processed.
              </p>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={isProcessing}
                className="flex-1 rounded-lg border-2 border-orange-500/40 py-3 font-semibold text-gray-300 transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPurchase}
                disabled={isProcessing}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-orange-400 bg-gradient-to-r from-orange-600 to-orange-700 py-3 font-semibold text-white transition-colors hover:from-orange-500 hover:to-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 disabled:opacity-70"
                style={{ boxShadow: "0 0 20px rgba(249,115,22,0.4)" }}
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
