"use client"

import React, { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDeckStore } from "@/stores/useDeckStore"
import type { Card, ElementType, AvatarCard } from "@/domain/game/types"
import { SafeCardImage } from "@/components/shared/SafeCardImage"
import { countOwnedCopies } from "@/lib/rarityUtils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { DeckBuilderFeature } from "@/features/deck-builder"

type Tab = "deck" | "library"

export function CardsFeature() {
  const [activeTab, setActiveTab] = useState<Tab>("deck")
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-dvh" style={{ fontFamily: "Noto Sans, Inter, sans-serif" }}>
      {/* Title + Back */}
      <div className="relative pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="absolute left-3 top-14 text-gray-600 hover:text-orange-500 transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800 tracking-wider text-center">CARDS</h1>
      </div>

      {/* Tab Content */}
      <div className="flex-1 px-3 pb-24 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "deck" ? (
            <motion.div
              key="deck"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DeckBuilderFeature embedded />
            </motion.div>
          ) : (
            <motion.div
              key="library"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <LibraryTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tab Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-50 px-3 pb-3" style={{ maxWidth: 480 }}>
        <motion.div
          className="relative w-full"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <img
            src="/ui/v2-ui/button-two-tabs.png"
            alt=""
            className="w-full h-auto"
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex">
            <button
              className="flex-1 flex items-center justify-center"
              onClick={() => setActiveTab("deck")}
            >
              <span
                className={`text-base font-bold tracking-wider transition-colors ${
                  activeTab === "deck" ? "text-white" : "text-gray-400"
                }`}
              >
                DECK
              </span>
            </button>
            <button
              className="flex-1 flex items-center justify-center"
              onClick={() => setActiveTab("library")}
            >
              <span
                className={`text-base font-bold tracking-wider transition-colors ${
                  activeTab === "library" ? "text-white" : "text-gray-400"
                }`}
              >
                LIBRARY
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/* ─── Library Tab ─── */
function LibraryTab() {
  const { getAvailableCards, ownedCards, syncCardsFromDatabase } = useDeckStore()
  const [allCards, setAllCards] = useState<Card[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedElement, setSelectedElement] = useState<ElementType | "all">("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedTribe, setSelectedTribe] = useState<string>("all")
  const [selectedRarity, setSelectedRarity] = useState<string>("all")
  const [selectedExpansion, setSelectedExpansion] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        await syncCardsFromDatabase()
      } catch {
        /* supplementary */
      }
      try {
        setAllCards(getAvailableCards())
      } catch {
        setAllCards([])
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [syncCardsFromDatabase, getAvailableCards])

  const uniqueCards = useMemo(() => {
    const seen = new Set<string>()
    return allCards.filter((c) => {
      if (seen.has(c.id)) return false
      seen.add(c.id)
      return true
    })
  }, [allCards])

  const filteredCards = useMemo(() => {
    return uniqueCards.filter((card) => {
      const matchSearch = !searchTerm || card.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchElement = selectedElement === "all" || card.element === selectedElement
      const matchType = selectedType === "all" || card.type === selectedType
      const matchRarity = selectedRarity === "all" || card.rarity === selectedRarity
      const matchExpansion = selectedExpansion === "all"
      let matchTribe = true
      if (selectedTribe !== "all" && card.type === "avatar") {
        matchTribe = (card as AvatarCard).subType?.includes(selectedTribe.toLowerCase()) || false
      }
      return matchSearch && matchElement && matchType && matchRarity && matchExpansion && matchTribe
    })
  }, [uniqueCards, searchTerm, selectedElement, selectedType, selectedRarity, selectedExpansion, selectedTribe])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <>
      {/* Filters */}
      <div className="bg-gray-900 border-2 border-orange-500 rounded-2xl p-4 mb-4" style={{ boxShadow: "0 0 25px rgba(249, 115, 22, 0.15)" }}>
        <h2 className="text-lg font-bold text-white text-center mb-3">Library</h2>
        <input
          type="text"
          placeholder="Search cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-orange-500/40 text-white text-sm mb-3 focus:border-orange-400 outline-none"
        />
        <div className="grid grid-cols-3 gap-2 mb-2">
          <FilterSelect label="Element" value={selectedElement} onChange={(v) => setSelectedElement(v as ElementType | "all")} options={[
            { value: "all", label: "All Elements" }, { value: "fire", label: "Fire" }, { value: "water", label: "Water" },
            { value: "air", label: "Air" }, { value: "ground", label: "Ground" }, { value: "neutral", label: "Neutral" },
          ]} />
          <FilterSelect label="Types" value={selectedType} onChange={setSelectedType} options={[
            { value: "all", label: "All Types" }, { value: "avatar", label: "Avatar" }, { value: "spell", label: "Spell" },
            { value: "quickSpell", label: "Quick Spell" }, { value: "item", label: "Item" }, { value: "ritualArmor", label: "Ritual Armor" },
            { value: "equipment", label: "Equipment" },
          ]} />
          <FilterSelect label="Tribes" value={selectedTribe} onChange={setSelectedTribe} options={[
            { value: "all", label: "All Tribes" }, { value: "kobar", label: "Kobar" }, { value: "borah", label: "Borah" },
            { value: "kujana", label: "Kujana" }, { value: "kuhaka", label: "Kuhaka" },
          ]} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FilterSelect label="Rarity" value={selectedRarity} onChange={setSelectedRarity} options={[
            { value: "all", label: "All Rarity" }, { value: "Common", label: "Common" }, { value: "Uncommon", label: "Uncommon" },
            { value: "Rare", label: "Rare" }, { value: "Super Rare", label: "Super Rare" }, { value: "Mythic", label: "Mythic" },
          ]} />
          <FilterSelect label="Expansion" value={selectedExpansion} onChange={setSelectedExpansion} options={[
            { value: "all", label: "All Expansion" },
          ]} />
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-3 gap-2">
        {filteredCards.map((card, i) => {
          const count = countOwnedCopies(card, ownedCards)
          return (
            <div key={`${card.id}-${i}`} className="relative cursor-pointer" onClick={() => setSelectedCard(card)}>
              <div className="w-full aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden border border-orange-500/30">
                <SafeCardImage
                  src={(card as AvatarCard).imagePath || card.art || ""}
                  alt={card.name}
                  className={`w-full h-full object-cover ${count === 0 ? "grayscale opacity-50" : ""}`}
                />
              </div>
              <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {count > 0 ? count : "0"}
              </div>
            </div>
          )
        })}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center text-gray-400 py-8">No cards found.</div>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setSelectedCard(null)}>
          <div
            className="bg-gray-900 border-2 border-orange-500 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            style={{ boxShadow: "0 0 30px rgba(249, 115, 22, 0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">{selectedCard.name}</h2>
              <button onClick={() => setSelectedCard(null)} className="text-orange-400 hover:text-orange-300 text-xl font-bold">X</button>
            </div>
            {((selectedCard as AvatarCard).imagePath || selectedCard.art) && (
              <SafeCardImage
                src={(selectedCard as AvatarCard).imagePath || selectedCard.art || ""}
                alt={selectedCard.name}
                className="w-full h-auto object-contain rounded mb-4"
              />
            )}
            <div className="space-y-2 text-sm text-white">
              <p><span className="font-semibold">Type:</span> {selectedCard.type}</p>
              <p><span className="font-semibold">Element:</span> {selectedCard.element}</p>
              {selectedCard.type === "avatar" && (
                <>
                  <p><span className="font-semibold">Health:</span> {(selectedCard as AvatarCard).health}</p>
                  <p><span className="font-semibold">Level:</span> {(selectedCard as AvatarCard).level}</p>
                </>
              )}
              {selectedCard.description && <p><span className="font-semibold">Description:</span> {selectedCard.description}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function FilterSelect({ label, value, onChange, options }: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <span className="text-white text-[10px] font-semibold block mb-0.5">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 bg-gray-800 rounded-lg border border-orange-500/40 text-white text-[11px] focus:border-orange-400 outline-none appearance-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
