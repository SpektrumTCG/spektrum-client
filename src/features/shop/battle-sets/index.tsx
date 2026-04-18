"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BackButton } from "@/components/shared/BackButton"

const CATEGORIES = [
  { id: "card_back", name: "Card Backs", icon: "🎴", desc: "Unique designs for the back of your cards" },
  { id: "deck_cover", name: "Deck Covers", icon: "📚", desc: "Custom sleeves and box art for your decks" },
  { id: "avatar_skin", name: "Avatar Skins", icon: "👤", desc: "Personalize your in-game avatar" },
  { id: "battlefield", name: "Battlefields", icon: "🏟️", desc: "Custom game boards and arenas" },
  { id: "effect_animation", name: "Effects", icon: "✨", desc: "Animated effects for your cards" },
]

export function BattleSetsFeature() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <BackButton to="/shop" />
      <div className="max-w-md mx-auto p-4 w-full pt-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          <div className="text-center">
            <h1 className="text-3xl font-bold text-orange-400 mb-2">Battle Sets</h1>
            <p className="text-gray-400 text-sm">Customize your game experience</p>
          </div>

          {/* Coming Soon Banner */}
          <div
            className="bg-gray-900 border-2 border-orange-500 rounded-xl p-6 text-center space-y-3"
            style={{ boxShadow: "0 0 30px rgba(249,115,22,0.2)" }}
          >
            <div className="text-5xl">🎨</div>
            <h2 className="text-2xl font-bold text-white">Coming Soon</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Battle Sets are cosmetic items that let you personalize your Spektrum experience.
              Collect card backs, deck covers, avatar skins, battlefields, and more.
            </p>
            <div className="inline-block bg-orange-500/20 border border-orange-500/50 text-orange-300 text-xs font-semibold px-4 py-2 rounded-full">
              In Development
            </div>
          </div>

          {/* Category Preview */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Categories</h3>
            <div className="grid grid-cols-1 gap-2">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-4 bg-gray-800/50 border border-gray-700 rounded-xl p-4 opacity-60"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{cat.name}</div>
                    <div className="text-xs text-gray-400">{cat.desc}</div>
                  </div>
                  <div className="ml-auto">
                    <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-1 rounded-full">
                      Soon
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => router.push("/shop")}
            className="w-full py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-all border border-gray-600"
          >
            Back to Shop
          </button>
        </motion.div>
      </div>
    </div>
  )
}
