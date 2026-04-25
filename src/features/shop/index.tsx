"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

export function ShopFeature() {
  const router = useRouter()

  const items = [
    { label: "Booster Packs", sub: "Randomized Card Packs", path: "/shop/booster" },
    { label: "Premade Decks", sub: "Ready-to-play Strategies", path: "/shop/premade" },
    { label: "Battle Sets", sub: "Ready-to-play Strategies", path: "/shop/battle-sets" },
    { label: "Booster Packs Inventory", sub: "Open Your Booster Packs", path: "/inventory" },
  ]

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto min-h-dvh justify-center">
      <div className="max-w-md mx-auto p-4 w-full">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/ui/logo.png" alt="Spektrum Trading Card Game" width={220} height={80} priority />
        </div>

        <div
          className="bg-gray-900 rounded-2xl p-6 border-2 border-orange-500 shadow-lg mb-6 flex flex-col space-y-4"
          style={{ boxShadow: "0 0 25px rgba(249, 115, 22, 0.2)" }}
        >
          <h2 className="text-2xl font-bold text-white text-center tracking-wider mb-2">SHOP</h2>

          {items.map(item => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="relative w-full h-[72px] flex flex-col items-center justify-center text-white hover:brightness-110 transition-all"
            >
              <img
                src="/ui/v2-ui/Button.png"
                alt=""
                className="absolute inset-0 w-full h-full object-fill"
              />
              <span className="relative z-10 text-lg font-bold tracking-wide">{item.label}</span>
              <span className="relative z-10 text-[11px] text-gray-300">{item.sub}</span>
            </button>
          ))}

          <button
            onClick={() => window.open("https://www.tensor.trade/", "_blank")}
            className="relative w-full h-[72px] flex flex-col items-center justify-center text-white hover:brightness-110 transition-all"
          >
            <img
              src="/ui/v2-ui/Button.png"
              alt=""
              className="absolute inset-0 w-full h-full object-fill"
            />
            <span className="relative z-10 text-lg font-bold tracking-wide">Marketplace</span>
            <span className="relative z-10 text-[11px] text-gray-300">Trade on Tensor</span>
          </button>
        </div>
      </div>
    </div>
  )
}
