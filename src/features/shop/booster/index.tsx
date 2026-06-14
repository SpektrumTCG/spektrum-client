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
    <div className="mb-6 pt-16">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="-ml-1 shrink-0 text-gray-600 transition-colors hover:text-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <ChevronLeft size={26} />
        </button>
        <h1 className="text-2xl font-bold uppercase leading-none tracking-wide text-gray-800">{title}</h1>
      </div>
      <div className="mt-3 flex gap-1.5 pl-7" role="status" aria-label={`Step ${current} of ${STEP_TOTAL}`}>
        {Array.from({ length: STEP_TOTAL }, (_, i) => i + 1).map((n) => (
          <span
            key={n}
            className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
              n === current ? "w-5 bg-orange-500" : n < current ? "w-1.5 bg-orange-300" : "w-1.5 bg-gray-300"
            }`}
          />
        ))}
      </div>
      {children && <div className="mt-3 pl-7">{children}</div>}
    </div>
  )
}

export function BoosterFeature() {
  const router = useRouter()
  const { addBoosterPack, addBoosterPackBundle } = useInventoryStore()
  const requireAuth = useRequireAuth("buy-pack")
  const [step, setStep] = useState<Step>("tier-selection")
  const [selectedTier, setSelectedTier] = useState<(typeof variantTemplates)[0] | null>(null)
  const [quantity, setQuantity] = useState<1 | 10>(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const handleBack = () => {
    if (step === "confirm") {
      setStep("tier-selection")
      setSelectedTier(null)
      setQuantity(1)
    } else {
      router.push("/shop")
    }
  }

  const handleTierSelect = (tier: (typeof variantTemplates)[0]) => {
    setSelectedTier(tier)
    setQuantity(1)
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

      const packId =
        quantity === 1
          ? addBoosterPack(variant, pack, tier.price)
          : addBoosterPackBundle(variant, pack, tier.price, quantity)
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

            {variantTemplates
              .filter((tier) => (ACTIVE_TIERS as readonly string[]).includes(tier.rarity))
              .map((tier) => {
                const label = TIER_LABELS[tier.rarity] || tier.rarity
                return (
                  <button
                    key={tier.rarity}
                    type="button"
                    onClick={() => handleTierSelect(tier)}
                    className="group mx-auto flex w-full max-w-[300px] flex-col overflow-hidden rounded-3xl border-2 border-transparent bg-gray-800 text-left shadow-xl transition-colors hover:border-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  >
                    <div className="relative flex aspect-[4/5] w-full items-center justify-center bg-[radial-gradient(circle_at_50%_36%,rgba(249,115,22,0.18),transparent_70%)]">
                      {TIER_IMAGES[tier.rarity] ? (
                        <img
                          src={TIER_IMAGES[tier.rarity]}
                          alt={label}
                          className="h-full w-full object-contain p-3 drop-shadow-[0_8px_24px_rgba(249,115,22,0.25)]"
                          onError={(e) => {
                            const t = e.target as HTMLImageElement
                            t.style.display = "none"
                          }}
                        />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-b ${TIER_COLORS[tier.rarity]}`}>
                          <span className="text-6xl">{TIER_EMOJIS[tier.rarity]}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white">{label}</h3>
                      <p className="mt-1 text-xs leading-snug text-gray-400">{tier.description}</p>
                      <div className="mt-3 flex items-end justify-between border-t border-white/10 pt-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Contents</p>
                          <p className="text-sm font-semibold text-white">5 cards</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Price</p>
                          <p className="text-base font-bold text-orange-400">${tier.price} USDC</p>
                        </div>
                      </div>
                      <div className="mt-3 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 py-2.5 text-center text-sm font-semibold text-white transition-colors group-hover:from-orange-500 group-hover:to-orange-400">
                        Select Pack
                      </div>
                    </div>
                  </button>
                )
              })}

            <div className="mx-auto mt-8 w-full max-w-[300px]">
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
            <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl border-2 border-orange-500 bg-gray-900" style={{ boxShadow: "0 0 30px rgba(249,115,22,0.2)" }}>
              <div className="flex items-center justify-center bg-[radial-gradient(circle_at_50%_30%,rgba(249,115,22,0.16),transparent_70%)] px-6 pt-6 pb-4">
                <img
                  src={TIER_IMAGES[selectedTier.rarity]}
                  alt={selectedTier.rarity}
                  className="w-44 object-contain drop-shadow-[0_10px_30px_rgba(249,115,22,0.3)]"
                />
              </div>
              <div className="px-6 pb-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white">{TIER_LABELS[selectedTier.rarity] || selectedTier.rarity} Pack</h2>
                  <p className="mt-0.5 text-sm text-gray-400">{EXPANSION.name} · {selectedTier.rarity}</p>
                </div>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <span className="text-sm text-gray-400">Quantity</span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {([1, 10] as const).map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuantity(q)}
                        aria-pressed={quantity === q}
                        className={`rounded-lg border-2 py-2 text-sm font-semibold transition-colors ${
                          quantity === q
                            ? "border-orange-500 bg-orange-500/10 text-orange-300"
                            : "border-white/10 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        {q}x Pack{q > 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-gray-400">Contents</span>
                    <span className="font-semibold text-white">{5 * quantity} cards</span>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <span className="text-gray-400">Guaranteed {quantity > 1 ? "per pack" : ""}</span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Object.entries(
                        selectedTier.guaranteedSlots.reduce<Record<string, number>>((acc, r) => {
                          acc[r] = (acc[r] || 0) + 1
                          return acc
                        }, {}),
                      ).map(([rarity, count]) => (
                        <span
                          key={rarity}
                          className="rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-gray-200"
                        >
                          <span className="text-orange-400">{count}x</span> {rarity}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-gray-400">Price</span>
                    <span className="text-lg font-bold text-orange-400">${selectedTier.price * quantity} USDC</span>
                  </div>
                </div>
                <p className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-center text-xs text-gray-400">
                  Mock purchase. No real payment will be processed.
                </p>
              </div>
            </div>
            <div className="mx-auto mt-4 flex w-full max-w-[340px] gap-3">
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
                ) : `Buy ${quantity}x · $${selectedTier.price * quantity}`}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
