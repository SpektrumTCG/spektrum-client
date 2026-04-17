"use client"

import { useRouter } from "next/navigation"
import { BackButton } from "@/components/shared/BackButton"

export function ShopFeature() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto">
      <BackButton />
      <div className="max-w-md mx-auto p-4 w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-100">Shop</h1>
          <p className="text-gray-400 text-sm mb-4">Expand your collection and power up your gameplay</p>
        </div>

        <div
          className="bg-gray-900 rounded-xl p-6 border-2 border-orange-500 shadow-lg mb-6 flex flex-col space-y-3"
          style={{ boxShadow: "0 0 30px rgba(249, 115, 22, 0.2)" }}
        >
          {[
            { label: "Booster Packs", sub: "Randomized card packs", path: "/shop/booster" },
            { label: "Premade Decks", sub: "Ready-to-play decks", path: "/shop/premade" },
            { label: "Battle Sets", sub: "Themed card collections", path: "/shop/battle-sets" },
            { label: "My Inventory", sub: "View purchased items", path: "/inventory" },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white py-4 px-4 rounded-lg shadow-lg transition-all flex flex-col items-center border border-orange-400"
              style={{ boxShadow: "0 0 15px rgba(249, 115, 22, 0.4)" }}
            >
              <div className="text-lg font-bold mb-0.5">{item.label}</div>
              <div className="text-xs opacity-90">{item.sub}</div>
            </button>
          ))}

          <button
            onClick={() => window.open("https://www.tensor.trade/", "_blank")}
            className="w-full bg-gray-800 hover:bg-gray-700 text-orange-400 py-4 px-4 rounded-lg shadow-lg transition-all flex flex-col items-center border border-orange-500/50"
          >
            <div className="text-lg font-bold mb-0.5">NFT Marketplace</div>
            <div className="text-xs opacity-90 text-gray-400">Trade cards on Tensor</div>
          </button>
        </div>
      </div>
    </div>
  )
}
