"use client"

import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { fetchPremadeDecks, type PremadeDeckCardList } from "@spektrum/shared/data"
import { useDeckStore } from "@/stores/useDeckStore"
import { useWalletStore } from "@/stores/useWalletStore"

type Step = "deck-selection" | "confirm"

const TRIBE_COLORS: Record<string, string> = {
  "kobar-borah": "from-orange-500 to-red-500",
  "kujana-kuhaka": "from-red-500 to-purple-500",
  kobar: "from-orange-400 to-orange-600",
  kujana: "from-red-400 to-red-600",
}

export function PremadeDecksFeature() {
  const router = useRouter()
  const { addCards, getAvailableCards } = useDeckStore()
  const walletAddress = useWalletStore((s) => s.walletAddress)
  const isConnected = useWalletStore((s) => s.isConnected)

  const [decks, setDecks] = useState<PremadeDeckCardList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [purchasedDecks, setPurchasedDecks] = useState<Set<string>>(new Set())
  const [selectedDeck, setSelectedDeck] = useState<PremadeDeckCardList | null>(null)
  const [step, setStep] = useState<Step>("deck-selection")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchPremadeDecks()
      .then(setDecks)
      .catch(() => toast.error("Failed to load decks"))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (!walletAddress || !isConnected) return
    apiFetch(`/api/purchases/premade-decks/${walletAddress}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : { premadeDecks: [] })
      .then((data) => {
        const ids = new Set<string>(data.premadeDecks?.map((d: { deckId: string }) => d.deckId) ?? [])
        setPurchasedDecks(ids)
      })
      .catch(() => {})
  }, [walletAddress, isConnected])

  const handleBack = () => {
    if (step === "confirm") {
      setStep("deck-selection")
      setSelectedDeck(null)
    } else {
      router.push("/shop")
    }
  }

  const handleSelectDeck = (deck: PremadeDeckCardList) => {
    setSelectedDeck(deck)
    setStep("confirm")
  }

  const handleConfirmPurchase = async () => {
    if (!selectedDeck || isProcessing) return
    setIsProcessing(true)

    try {
      if (walletAddress && isConnected) {
        await apiFetch("/api/player/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ walletAddress }),
        })
      }

      const response = await apiFetch("/api/purchases/claim-premade-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ deckId: selectedDeck.id }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        if (err.error === "Deck already purchased") {
          toast.warning("You already own this deck!")
          setPurchasedDecks((prev) => new Set([...prev, selectedDeck.id]))
          return
        }
        throw new Error(err.error || "Failed to purchase deck")
      }

      const result = await response.json()
      const available = getAvailableCards()
      const deckCards = (result.cards ?? []).flatMap((entry: { cardId: string; quantity: number }) => {
        const template = available.find((c) => c.id === entry.cardId)
        if (!template) return []
        return Array.from({ length: entry.quantity }, (_, i) => ({
          ...template,
          id: `${template.id}-premade-${selectedDeck.id}-${i}`,
          cardId: template.id,
        }))
      })

      if (deckCards.length > 0) addCards(deckCards as any)
      setPurchasedDecks((prev) => new Set([...prev, selectedDeck.id]))
      toast.success(`Purchased ${selectedDeck.name}! ${result.totalCards ?? deckCards.length} cards added to your collection.`)
      router.push("/cards")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to purchase deck")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto min-h-dvh justify-center">
      <div className="max-w-md mx-auto p-4 w-full pt-6">

        {step === "deck-selection" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-orange-400 mb-1">Premade Decks</h1>
              <p className="text-gray-400 text-sm">Ready-to-play strategies</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
              </div>
            ) : decks.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-4">📦</p>
                <p>No premade decks available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {decks.map((deck) => {
                  const owned = purchasedDecks.has(deck.id)
                  const tribeGradient = TRIBE_COLORS[deck.tribe] ?? "from-gray-500 to-gray-700"
                  return (
                    <div
                      key={deck.id}
                      className={`bg-gray-800/50 border-2 rounded-xl overflow-hidden transition-all duration-200 ${owned ? "border-green-500" : "border-orange-500 hover:border-orange-400"}`}
                    >
                      <div className="w-full aspect-[3/4] bg-white flex items-center justify-center p-2">
                        {deck.artUrl || deck.deckBoxImageUrl ? (
                          <img
                            src={deck.deckBoxImageUrl || deck.artUrl}
                            alt={deck.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const t = e.target as HTMLImageElement
                              t.style.display = "none"
                              const fallback = t.nextElementSibling as HTMLElement | null
                              if (fallback) fallback.classList.remove("hidden")
                            }}
                          />
                        ) : null}
                        <div className={`${deck.artUrl || deck.deckBoxImageUrl ? "hidden" : ""} text-center text-gray-400`}>
                          <div className="text-3xl mb-1">📦</div>
                          <div className="text-xs">Deck Box</div>
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        <h3 className="text-sm font-bold text-white text-center">{deck.name}</h3>
                        <p className="text-[11px] text-gray-300 text-center line-clamp-2">{deck.description}</p>
                        <div className="text-[10px] space-y-0.5">
                          <div className="flex justify-between text-gray-400">
                            <span>Price</span><span className="text-orange-400 font-bold">${deck.price}</span>
                          </div>
                          <div className="flex justify-between text-gray-400">
                            <span>Cards</span><span className="text-white font-semibold">{deck.cardCount}</span>
                          </div>
                          <div className="text-center text-gray-400 pt-0.5 capitalize">{deck.tribe.replace("-", " & ")}</div>
                        </div>
                        <button
                          onClick={() => !owned && handleSelectDeck(deck)}
                          disabled={owned}
                          className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all ${owned ? "bg-green-700 text-green-200 cursor-default" : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white"}`}
                        >
                          {owned ? "✓ Purchased" : "Select"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {step === "confirm" && selectedDeck && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-orange-400 mb-1">Confirm Purchase</h1>
            </div>
            <div className="bg-gray-900 border-2 border-orange-500 rounded-xl p-6 space-y-4" style={{ boxShadow: "0 0 30px rgba(249,115,22,0.2)" }}>
              {(selectedDeck.artUrl || selectedDeck.deckBoxImageUrl) && (
                <div className="flex justify-center">
                  <img
                    src={selectedDeck.deckBoxImageUrl || selectedDeck.artUrl}
                    alt={selectedDeck.name}
                    className="w-32 object-contain"
                  />
                </div>
              )}
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">{selectedDeck.name}</h2>
                <p className="text-gray-400 text-sm">{selectedDeck.expansion}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Cards</span><span className="text-white">{selectedDeck.cardCount}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Strategy</span><span className="text-white">{selectedDeck.strategy}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Difficulty</span><span className="text-white">{selectedDeck.difficulty}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-gray-300">Price</span>
                  <span className="text-orange-400 text-lg">${selectedDeck.price} USDC</span>
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
