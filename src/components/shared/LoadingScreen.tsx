"use client"

import { useMemo } from "react"

interface LoadingScreenProps {
  message?: string
  backgroundImage?: string
}

const CHARACTER_IMAGES = [
  "/ui/loading/crimson.png",
  "/ui/loading/maya.png",
  "/ui/loading/mustard.png",
  "/ui/loading/pine.png",
  "/ui/loading/radja.png",
]

export function LoadingScreen({ message = "Loading...", backgroundImage }: LoadingScreenProps) {
  const randomCharacter = useMemo(
    () => CHARACTER_IMAGES[Math.floor(Math.random() * CHARACTER_IMAGES.length)],
    []
  )
  const finalBg = backgroundImage || randomCharacter

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900"
      style={{ backgroundImage: `url(${finalBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 text-center px-4">
        <div className="mb-6">
          <img
            src="/ui/logo.png"
            alt="Spektrum"
            className="w-48 h-auto mx-auto opacity-95"
            onError={e => { e.currentTarget.style.display = "none" }}
          />
        </div>
        <div className="mb-6 flex justify-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-orange-500 border-r-orange-500"
            style={{ boxShadow: "0 0 20px rgba(249, 115, 22, 0.6)" }}
          />
        </div>
        <p className="text-white text-lg font-bold tracking-wide">{message}</p>
        <div className="mt-3 text-orange-400 text-sm font-medium" style={{ textShadow: "0 0 10px rgba(249, 115, 22, 0.5)" }}>
          Preparing your adventure...
        </div>
      </div>
    </div>
  )
}
