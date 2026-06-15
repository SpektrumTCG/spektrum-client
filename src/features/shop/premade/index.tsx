"use client"

import { useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { toast } from "sonner"
import { useDeckStore } from "@/stores/useDeckStore"
import { useWalletStore } from "@/stores/useWalletStore"
import { useRequireAuth } from "@/components/shared/AuthGateModal"
import { apiFetch } from "@/lib/api"
import { PREMADE_DECKS, buildDeckCards, deckCardQuantities, type PremadeDeck } from "./premadeDecks"

type Step = "deck-selection" | "confirm"

const STEP_NUM: Record<Step, number> = {
  "deck-selection": 1,
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

export function PremadeDeckFeature() {
  const router = useRouter()
  const { addCards, addDeck } = useDeckStore()
  const requireAuth = useRequireAuth("buy-pack")
  const [step, setStep] = useState<Step>("deck-selection")
  const [selectedDeck, setSelectedDeck] = useState<PremadeDeck | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const handleBack = () => {
    if (step === "confirm") {
      setStep("deck-selection")
      setSelectedDeck(null)
    } else {
      router.push("/shop")
    }
  }

  const handleDeckSelect = (deck: PremadeDeck) => {
    setSelectedDeck(deck)
    setStep("confirm")
  }

  const handleConfirmPurchase = () => {
    if (!selectedDeck || isProcessing) return
    const deck = selectedDeck
    requireAuth(() => { void runPurchase(deck) })
  }

  const runPurchase = async (deck: PremadeDeck) => {
    setIsProcessing(true)
    try {
      const cards = buildDeckCards(deck)

      // Grant the deck's cards to the player's DB collection FIRST. The deck
      // save endpoint validates card ownership, so without this the deck save
      // (and set-active) 404 with "Card X requires N copies but only 0 owned".
      const { walletAddress, isConnected } = useWalletStore.getState()
      const online = Boolean(walletAddress && isConnected)

      if (online) {
        const granted = await grantCardsToCollection(cards, deck.name)
        if (!granted) {
          toast.error("Could not add deck cards to your collection. Try again.")
          return
        }
      }

      // Create the deck in local state + collection.
      addCards(cards)
      const created = addDeck(deck.name, cards, deck.tribe)

      // Persist the deck to the DB and AWAIT it before navigating. /cards runs
      // syncDecksFromDatabase on mount, which overwrites local decks with the
      // DB. addDeck's own save is fire-and-forget, so without this await the
      // sync can wipe the just-bought deck before the save lands.
      if (online) {
        const saved = await saveDeckToDb(created, deck)
        if (!saved) {
          toast.error("Deck created locally but failed to save online.")
        }
      }

      toast.success(`${deck.name} added to your decks!`)
      // replace (not push) so Back from /cards skips the dead purchase flow.
      router.replace("/cards")
    } catch (error) {
      // addDeck throws when the 5-deck limit is hit (and toasts its own message).
      toast.error((error as Error).message || "Purchase failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const grantCardsToCollection = async (cards: ReturnType<typeof buildDeckCards>, deckName: string): Promise<boolean> => {
    try {
      const { walletAddress } = useWalletStore.getState()
      const connect = await apiFetch("/api/player/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ walletAddress }),
      })
      if (!connect.ok) throw new Error("Failed to establish wallet session")

      const payload = deckCardQuantities(cards).map((c) => ({
        cardId: c.cardId,
        quantity: c.quantity,
        source: "premade_deck",
        metadata: { deckName },
      }))

      const res = await apiFetch("/api/cards/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cards: payload }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP ${res.status}`)
      }
      return true
    } catch (error) {
      toast.error(`Failed to add cards: ${(error as Error).message || "Unknown error"}`)
      return false
    }
  }

  const saveDeckToDb = async (
    created: ReturnType<typeof addDeck>,
    deck: PremadeDeck,
  ): Promise<boolean> => {
    try {
      const cardIds = created.cards
        .map((c) => (c as { cardId?: string }).cardId || c.id)
        .filter((id) => !id.includes("-demo-"))
      const res = await apiFetch("/api/decks/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          deckId: created.id,
          deckName: created.name,
          cardIds,
          coverCardId: (created.cards[0] as { cardId?: string }).cardId || created.cards[0].id,
          element: deck.elements[0] || null,
          isActive: 1,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.details || err.error || `HTTP ${res.status}`)
      }
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto min-h-dvh justify-start">
      <div className="max-w-md mx-auto p-4 w-full pt-6">

        {step === "deck-selection" && (
          <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <StepHeader step="deck-selection" onBack={handleBack} title="Premade Decks" />

            <div className="space-y-5">
              {PREMADE_DECKS.map((deck) => (
                <button
                  key={deck.id}
                  type="button"
                  onClick={() => handleDeckSelect(deck)}
                  className="group mx-auto flex w-full max-w-[340px] flex-col overflow-hidden rounded-3xl border-2 border-transparent bg-gray-800 text-left shadow-xl transition-colors hover:border-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <div className="relative flex aspect-[16/9] w-full items-center justify-center bg-[radial-gradient(circle_at_50%_36%,rgba(249,115,22,0.18),transparent_70%)]">
                    {deck.artUrl ? (
                      <img
                        src={deck.artUrl}
                        alt={deck.name}
                        className="h-full w-full object-contain p-3 drop-shadow-[0_8px_24px_rgba(249,115,22,0.25)]"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement
                          t.style.display = "none"
                        }}
                      />
                    ) : (
                      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-b ${deck.color}`}>
                        <span className="text-6xl">{deck.emoji}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">{deck.name}</h3>
                      <span className="text-2xl" aria-hidden>{deck.emoji}</span>
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-400">{deck.subtitle}</p>
                    <p className="mt-1.5 text-xs leading-snug text-gray-400">{deck.description}</p>
                    <div className="mt-3 flex items-end justify-between border-t border-white/10 pt-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Contents</p>
                        <p className="text-sm font-semibold text-white">40 cards</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Price</p>
                        <p className="text-base font-bold text-orange-400">${deck.price} USDC</p>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 py-2.5 text-center text-sm font-semibold text-white transition-colors group-hover:from-orange-500 group-hover:to-orange-400">
                      Select Deck
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "confirm" && selectedDeck && (
          <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <StepHeader step="confirm" onBack={handleBack} title="Confirm Purchase" />
            <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl border-2 border-orange-500 bg-gray-900" style={{ boxShadow: "0 0 30px rgba(249,115,22,0.2)" }}>
              <div className="flex items-center justify-center bg-[radial-gradient(circle_at_50%_30%,rgba(249,115,22,0.16),transparent_70%)] px-6 pt-6 pb-4">
                {selectedDeck.artUrl ? (
                  <img
                    src={selectedDeck.artUrl}
                    alt={selectedDeck.name}
                    className="w-44 object-contain drop-shadow-[0_10px_30px_rgba(249,115,22,0.3)]"
                  />
                ) : (
                  <span className="text-6xl">{selectedDeck.emoji}</span>
                )}
              </div>
              <div className="px-6 pb-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white">{selectedDeck.name}</h2>
                  <p className="mt-0.5 text-sm text-gray-400">{selectedDeck.subtitle}</p>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-gray-400">{selectedDeck.description}</p>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-gray-400">Contents</span>
                    <span className="font-semibold text-white">40 cards · ready to play</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="text-gray-400">Price</span>
                    <span className="text-lg font-bold text-orange-400">${selectedDeck.price} USDC</span>
                  </div>
                </div>
                <p className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-center text-xs text-gray-400">
                  Mock purchase. No real payment will be processed. The deck is added to your collection.
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
                ) : `Buy · $${selectedDeck.price}`}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
