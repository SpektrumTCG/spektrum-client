"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { BackButton } from "@/components/shared/BackButton"
import { useDeckStore } from "@/stores/useDeckStore"
import { useCustomCardStore } from "@/stores/useCustomCardStore"
import { useAudio } from "@/stores/useAudioStore"
import { useInventoryStore } from "@/stores/useInventoryStore"
import type { Card } from "@/domain/game/types"

type Tab = "database" | "audio" | "dev-utils" | "modifications"

const ELEMENT_COLORS: Record<string, string> = {
  fire: "text-red-400",
  water: "text-blue-400",
  ground: "text-yellow-400",
  air: "text-cyan-400",
  neutral: "text-gray-400",
}

const RARITY_COLORS: Record<string, string> = {
  Common: "text-gray-400 border-gray-500",
  Uncommon: "text-green-400 border-green-500",
  Rare: "text-blue-400 border-blue-500",
  "Super Rare": "text-purple-400 border-purple-500",
  Mythic: "text-yellow-400 border-yellow-500",
}

// ─── Database Tab ──────────────────────────────────────────────────────────────

function DatabaseTab() {
  const { getAvailableCards, initializeDefaultCards, syncCardsFromDatabase } = useDeckStore()
  const { isCardDeleted, getAllModifications, markCardAsDeleted, unmarkCardAsDeleted } = useCustomCardStore()

  const [search, setSearch] = useState("")
  const [elementFilter, setElementFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [rarityFilter, setRarityFilter] = useState("all")
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const allCards = getAvailableCards()
  const modifications = getAllModifications()

  const filtered = allCards.filter((c) => {
    if (elementFilter !== "all" && c.element !== elementFilter) return false
    if (typeFilter !== "all" && c.type !== typeFilter) return false
    if (rarityFilter !== "all" && c.rarity !== rarityFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!c.name.toLowerCase().includes(q) && !(c.description || "").toLowerCase().includes(q)) return false
    }
    return true
  })

  const handleSaveToServer = async () => {
    setIsSaving(true)
    try {
      const mods = getAllModifications()
      const res = await fetch("/api/save-modifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modifications: mods }),
      })
      if (!res.ok) throw new Error("Server error")
      toast.success(`Saved ${mods.length} modifications to server`)
    } catch {
      toast.error("Failed to save modifications")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await syncCardsFromDatabase()
      toast.success("Cards synced from database")
    } catch {
      toast.error("Sync failed")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleSaveToServer}
          disabled={isSaving || modifications.length === 0}
          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white text-sm rounded-lg font-medium transition-colors"
        >
          {isSaving ? "Saving…" : `Save to Server (${modifications.length})`}
        </button>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-40 text-white text-sm rounded-lg font-medium transition-colors"
        >
          {isSyncing ? "Syncing…" : "Sync from DB"}
        </button>
        <span className="ml-auto text-xs text-gray-500 self-center">
          {filtered.length} / {allCards.length} cards
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name / description…"
          className="flex-1 min-w-[140px] bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500"
        />
        <select
          value={elementFilter}
          onChange={(e) => setElementFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500"
        >
          <option value="all">All Elements</option>
          {["fire", "water", "ground", "air", "neutral"].map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500"
        >
          <option value="all">All Types</option>
          {["avatar", "spell", "quickSpell", "ritualArmor", "item", "field", "equipment"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={rarityFilter}
          onChange={(e) => setRarityFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500"
        >
          <option value="all">All Rarities</option>
          {["Common", "Uncommon", "Rare", "Super Rare", "Mythic"].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button
          onClick={() => { setSearch(""); setElementFilter("all"); setTypeFilter("all"); setRarityFilter("all") }}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
        {filtered.map((card) => {
          const deleted = isCardDeleted(card.id)
          const modified = modifications.some((m) => m.originalId === card.id)
          return (
            <div
              key={card.id}
              className={`bg-gray-800 border rounded-lg p-3 text-xs space-y-1 transition-opacity ${deleted ? "opacity-40 border-red-700" : modified ? "border-orange-500" : "border-gray-700"}`}
            >
              {(card.imagePath || card.art) && (
                <img
                  src={card.imagePath || card.art}
                  alt={card.name}
                  className="w-full h-20 object-contain rounded mb-1 bg-gray-900"
                />
              )}
              <div className="font-semibold text-white truncate">{card.name}</div>
              <div className="flex gap-1 flex-wrap">
                <span className={`capitalize ${ELEMENT_COLORS[card.element] || "text-gray-400"}`}>{card.element}</span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-400 capitalize">{card.type}</span>
              </div>
              {card.rarity && (
                <span className={`inline-block border px-1.5 py-0.5 rounded text-[10px] ${RARITY_COLORS[card.rarity] || "text-gray-400 border-gray-500"}`}>
                  {card.rarity}
                </span>
              )}
              {modified && <span className="block text-orange-400 text-[10px]">● Modified</span>}
              <div className="flex gap-1 pt-1">
                <button
                  onClick={() => {
                    deleted ? unmarkCardAsDeleted(card.id) : markCardAsDeleted(card.id)
                    toast.success(deleted ? `Restored ${card.name}` : `Deleted ${card.name}`)
                  }}
                  className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${deleted ? "bg-green-700 hover:bg-green-600 text-white" : "bg-red-900 hover:bg-red-800 text-red-300"}`}
                >
                  {deleted ? "Restore" : "Delete"}
                </button>
                <button
                  onClick={() => { console.log("[DevTools] Card:", card); toast.info(`Logged ${card.name} to console`) }}
                  className="flex-1 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-[10px] font-medium transition-colors"
                >
                  Log
                </button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-500">No cards match filters</div>
        )}
      </div>
    </div>
  )
}

// ─── Audio Tab ─────────────────────────────────────────────────────────────────

function AudioTab() {
  const {
    sfxEnabled, musicEnabled, sfxVolume, musicVolume, currentContext, isAudioInitialized,
    toggleSfx, toggleMusic, setSfxVolume, setMusicVolume, setAudioContext,
    playContextMusic, stopMusic, getAllLoadedAudio, testPlayAudio, reloadAudio,
    playButton, playSuccess, playError, playCard, playDraw, playHit, playSkill,
  } = useAudio()

  const [loadedAudio, setLoadedAudio] = useState<{ src: string; sound: any }[]>([])

  useEffect(() => {
    setLoadedAudio(getAllLoadedAudio())
  }, [getAllLoadedAudio])

  const SFX_TESTS = [
    { label: "Button", fn: playButton },
    { label: "Card Play", fn: playCard },
    { label: "Card Draw", fn: playDraw },
    { label: "Hit", fn: playHit },
    { label: "Skill", fn: playSkill },
    { label: "Success", fn: playSuccess },
    { label: "Error", fn: playError },
  ]

  return (
    <div className="space-y-5">
      {/* Status */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${isAudioInitialized ? "bg-green-400" : "bg-red-400"}`} />
        <span className="text-gray-400">{isAudioInitialized ? "Audio initialized" : "Audio not initialized"}</span>
        <span className="ml-auto text-gray-500">Context: <span className="text-orange-400">{currentContext}</span></span>
      </div>

      {/* Audio Context */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Audio Context</h3>
        <div className="flex gap-2">
          {(["menu", "game", "battle"] as const).map((ctx) => (
            <button
              key={ctx}
              onClick={() => { setAudioContext(ctx); playContextMusic(ctx) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${currentContext === ctx ? "bg-orange-600 text-white" : "bg-gray-700 hover:bg-gray-600 text-gray-300"}`}
            >
              {ctx}
            </button>
          ))}
        </div>
      </div>

      {/* Volume Controls */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Volume Controls</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMusic}
              className={`w-20 py-1.5 rounded text-xs font-semibold transition-colors ${musicEnabled ? "bg-orange-600 text-white" : "bg-gray-700 text-gray-400"}`}
            >
              Music {musicEnabled ? "ON" : "OFF"}
            </button>
            <input
              type="range" min={0} max={100} value={Math.round(musicVolume * 100)}
              onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
              className="flex-1 accent-orange-500"
            />
            <span className="text-xs text-gray-400 w-8 text-right">{Math.round(musicVolume * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSfx}
              className={`w-20 py-1.5 rounded text-xs font-semibold transition-colors ${sfxEnabled ? "bg-orange-600 text-white" : "bg-gray-700 text-gray-400"}`}
            >
              SFX {sfxEnabled ? "ON" : "OFF"}
            </button>
            <input
              type="range" min={0} max={100} value={Math.round(sfxVolume * 100)}
              onChange={(e) => setSfxVolume(Number(e.target.value) / 100)}
              className="flex-1 accent-orange-500"
            />
            <span className="text-xs text-gray-400 w-8 text-right">{Math.round(sfxVolume * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Manual Music */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Music Playback</h3>
        <div className="flex gap-2 flex-wrap">
          {(["menu", "game", "battle"] as const).map((ctx) => (
            <button
              key={ctx}
              onClick={() => playContextMusic(ctx)}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg capitalize transition-colors"
            >
              {ctx} Music
            </button>
          ))}
          <button
            onClick={stopMusic}
            className="px-3 py-1.5 bg-red-900 hover:bg-red-800 text-red-300 text-sm rounded-lg transition-colors"
          >
            Stop Music
          </button>
        </div>
      </div>

      {/* SFX Tests */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Sound Effect Tests</h3>
        <div className="flex gap-2 flex-wrap">
          {SFX_TESTS.map(({ label, fn }) => (
            <button
              key={label}
              onClick={fn}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Loaded Audio Assets */}
      {loadedAudio.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Loaded Audio Assets ({loadedAudio.length})
          </h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {loadedAudio.map(({ src }) => (
              <div key={src} className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded text-xs">
                <span className="flex-1 text-gray-300 truncate">{src.split("/").pop()}</span>
                <button
                  onClick={() => testPlayAudio(src)}
                  className="px-2 py-0.5 bg-orange-700 hover:bg-orange-600 text-white rounded text-[10px]"
                >
                  Test
                </button>
                <button
                  onClick={() => { reloadAudio(src); toast.success("Reloaded") }}
                  className="px-2 py-0.5 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded text-[10px]"
                >
                  Reload
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Dev Utils Tab ─────────────────────────────────────────────────────────────

function DevUtilsTab() {
  const { getAvailableCards, addCards, initializeDefaultCards, syncCardsFromDatabase } = useDeckStore()
  const { boosterPacks } = useInventoryStore()
  const [confirmReset, setConfirmReset] = useState(false)

  const handleAddStarterPack = () => {
    const allCards = getAvailableCards()
    if (allCards.length === 0) {
      toast.error("No cards in catalog — sync from DB first")
      return
    }
    const starter = allCards.slice(0, 20)
    addCards(starter)
    toast.success(`Added ${starter.length} starter cards to collection`)
  }

  const handleAddAllCards = () => {
    const allCards = getAvailableCards()
    if (allCards.length === 0) {
      toast.error("No cards in catalog — sync from DB first")
      return
    }
    addCards(allCards)
    toast.success(`Added ${allCards.length} cards to collection`)
  }

  const handleResetCollection = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 5000)
      return
    }
    initializeDefaultCards()
    setConfirmReset(false)
    toast.success("Collection reset to empty")
  }

  const handleFullReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 5000)
      return
    }
    initializeDefaultCards()
    if (typeof localStorage !== "undefined") {
      const keysToRemove = Object.keys(localStorage).filter((k) =>
        k.includes("deck") || k.includes("inventory") || k.includes("achievement") || k.includes("tutorial")
      )
      keysToRemove.forEach((k) => localStorage.removeItem(k))
    }
    setConfirmReset(false)
    toast.success("Full reset complete — reload to see changes")
  }

  const handleClearTutorial = () => {
    if (typeof localStorage !== "undefined") {
      const keysToRemove = Object.keys(localStorage).filter((k) => k.includes("tutorial"))
      keysToRemove.forEach((k) => localStorage.removeItem(k))
    }
    toast.success("Tutorial progress cleared")
  }

  const handleLogState = () => {
    const state = {
      ownedCards: useDeckStore.getState().ownedCards.length,
      decks: useDeckStore.getState().decks.length,
      boosterPacks: boosterPacks.length,
    }
    console.log("[DevTools] State snapshot:", state)
    toast.info(`State logged to console`)
  }

  return (
    <div className="space-y-5">
      {/* Card Collection */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Card Collection</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAddStarterPack}
            className="py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded-lg transition-colors"
          >
            Add Starter Pack
          </button>
          <button
            onClick={handleAddAllCards}
            className="py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded-lg transition-colors"
          >
            Add All Cards
          </button>
          <button
            onClick={() => syncCardsFromDatabase().then(() => toast.success("Synced")).catch(() => toast.error("Sync failed"))}
            className="py-2.5 bg-blue-800 hover:bg-blue-700 text-blue-200 text-sm rounded-lg transition-colors"
          >
            Sync from Database
          </button>
          <button
            onClick={handleLogState}
            className="py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded-lg transition-colors"
          >
            Log State
          </button>
        </div>
      </div>

      {/* Progress & Tutorial */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Progress & Tutorial</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleClearTutorial}
            className="py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded-lg transition-colors"
          >
            Reset Tutorial
          </button>
          <button
            onClick={() => { console.log("[DevTools] Full deck store:", useDeckStore.getState()); toast.info("Deck store logged") }}
            className="py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded-lg transition-colors"
          >
            Log Deck Store
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div>
        <h3 className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-2">Danger Zone</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleResetCollection}
            className={`py-2.5 text-sm rounded-lg font-medium transition-colors ${confirmReset ? "bg-red-600 text-white animate-pulse" : "bg-red-900/40 hover:bg-red-800/50 text-red-400 border border-red-800"}`}
          >
            {confirmReset ? "Confirm Reset?" : "Reset Collection"}
          </button>
          <button
            onClick={handleFullReset}
            className={`py-2.5 text-sm rounded-lg font-medium transition-colors ${confirmReset ? "bg-red-600 text-white animate-pulse" : "bg-red-900/40 hover:bg-red-800/50 text-red-400 border border-red-800"}`}
          >
            {confirmReset ? "Confirm Full Reset?" : "Full Reset"}
          </button>
        </div>
        {confirmReset && (
          <p className="text-red-400 text-xs mt-2 text-center">Click again within 5 seconds to confirm</p>
        )}
      </div>

      {/* Stats */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Current State</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Owned Cards", value: useDeckStore.getState().ownedCards.length },
            { label: "Decks", value: useDeckStore.getState().decks.length },
            { label: "Inv. Packs", value: boosterPacks.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-orange-400">{value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Modifications Tab ─────────────────────────────────────────────────────────

function ModificationsTab() {
  const { getAllModifications, getAllDeletedIds, removeModification, migrateFieldNames } = useCustomCardStore()
  const [isSaving, setIsSaving] = useState(false)

  const modifications = getAllModifications()
  const deletedIds = getAllDeletedIds()

  const handleExport = () => {
    const data = { modifications, deletedIds, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `card-modifications-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Modifications exported")
  }

  const handleSaveToServer = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/save-modifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modifications }),
      })
      if (!res.ok) throw new Error()
      toast.success("Saved to server")
    } catch {
      toast.error("Save failed")
    } finally {
      setIsSaving(false)
    }
  }

  const handleMigrate = () => {
    const count = migrateFieldNames()
    toast.success(`Migrated ${count} card(s)`)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleExport}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded-lg transition-colors"
        >
          Export JSON
        </button>
        <button
          onClick={handleSaveToServer}
          disabled={isSaving || modifications.length === 0}
          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white text-sm rounded-lg transition-colors"
        >
          {isSaving ? "Saving…" : "Save to Server"}
        </button>
        <button
          onClick={handleMigrate}
          className="px-3 py-1.5 bg-blue-800 hover:bg-blue-700 text-blue-200 text-sm rounded-lg transition-colors"
        >
          Migrate Field Names
        </button>
        <button
          onClick={() => { console.log("[DevTools] Modifications:", modifications); toast.info("Logged to console") }}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded-lg transition-colors"
        >
          Log to Console
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">{modifications.length}</div>
          <div className="text-xs text-gray-400 mt-1">Modified Cards</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{deletedIds.length}</div>
          <div className="text-xs text-gray-400 mt-1">Deleted Cards</div>
        </div>
      </div>

      {modifications.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Modified Cards</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {modifications.map((mod) => (
              <div key={mod.originalId} className="flex items-center gap-3 bg-gray-800 border border-orange-500/30 rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">{mod.modifiedCard.name}</div>
                  <div className="text-xs text-gray-500">{mod.originalId}</div>
                  <div className="text-xs text-gray-500">{new Date(mod.modifiedAt).toLocaleString()}</div>
                </div>
                <button
                  onClick={() => { removeModification(mod.originalId); toast.success("Modification removed") }}
                  className="px-2 py-1 bg-red-900 hover:bg-red-800 text-red-300 rounded text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {deletedIds.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Deleted Card IDs</h3>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto">
            {deletedIds.map((id) => (
              <div key={id} className="text-xs text-red-400 font-mono py-0.5">{id}</div>
            ))}
          </div>
        </div>
      )}

      {modifications.length === 0 && deletedIds.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">No local modifications</div>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "database", label: "Database" },
  { id: "audio", label: "Audio" },
  { id: "dev-utils", label: "Dev Utils" },
  { id: "modifications", label: "Modifications" },
]

export function DevToolsFeature() {
  const [activeTab, setActiveTab] = useState<Tab>("database")

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <BackButton to="/home" />
      <div className="max-w-lg mx-auto p-4 w-full pt-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-orange-400 mb-1">Dev Tools</h1>
          <p className="text-gray-500 text-xs">Internal development utilities</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-800 rounded-xl p-1 mb-5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-orange-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "database" && <DatabaseTab />}
        {activeTab === "audio" && <AudioTab />}
        {activeTab === "dev-utils" && <DevUtilsTab />}
        {activeTab === "modifications" && <ModificationsTab />}
      </div>
    </div>
  )
}
