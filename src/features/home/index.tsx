"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useWalletStore } from "@/stores/useWalletStore"
import { useAudio } from "@/stores/useAudioStore"
import { ProgressTracker } from "@/components/shared/ProgressTracker"
import { FirstTimeWelcomePopup } from "@/components/shared/FirstTimeWelcomePopup"

const ROLLING_IMAGES = [
  "/textures/cards/Home Screen_1.webp",
  "/textures/cards/Home Screen_2.webp",
  "/textures/cards/Home Screen_3.webp",
  "/textures/cards/Home Screen_4.webp",
]

export function HomeFeature() {
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set())
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [welcomeCheckDone, setWelcomeCheckDone] = useState(false)

  const { walletAddress, isConnected } = useWalletStore()
  const { playBackgroundMusic } = useAudio()

  useEffect(() => { playBackgroundMusic() }, [])

  useEffect(() => {
    setWelcomeCheckDone(false)
    setShowWelcomePopup(false)
  }, [walletAddress])

  useEffect(() => {
    const check = async () => {
      if (!isConnected || !walletAddress || welcomeCheckDone) return
      try {
        const res = await fetch(`/api/player/welcome-status/${walletAddress}`)
        if (res.ok) {
          const data = await res.json()
          if (!data.hasSeenWelcome) setShowWelcomePopup(true)
        }
      } catch {}
      finally { setWelcomeCheckDone(true) }
    }
    check()
  }, [isConnected, walletAddress, welcomeCheckDone])

  const handleWelcomeDismiss = async () => {
    if (!walletAddress) return
    try {
      await fetch("/api/player/welcome-seen", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      })
    } catch {}
    setShowWelcomePopup(false)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % ROLLING_IMAGES.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto">
      <FirstTimeWelcomePopup
        isOpen={showWelcomePopup}
        onClose={() => setShowWelcomePopup(false)}
        onDismiss={handleWelcomeDismiss}
      />

      <motion.div className="max-w-md mx-auto p-4" initial={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <img
            src="/attached_assets/Logo Spektrum_1760084011907.png"
            alt="Spektrum Trading Card Game"
            className="w-full max-w-sm mx-auto h-auto"
            onError={e => { e.currentTarget.style.display = "none" }}
          />
          <p className="text-gray-400 text-sm mb-4 mt-2">Ready to battle in the world of Spektrum</p>

          <div
            className="relative h-64 bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl overflow-hidden mb-6 border-2 border-orange-500 shadow-lg"
            style={{ boxShadow: "0 0 30px rgba(249, 115, 22, 0.3)" }}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {ROLLING_IMAGES.map((image, index) => (
                <div key={index} className="w-full h-full flex-shrink-0 flex items-center justify-center bg-gray-900">
                  {imageLoadErrors.has(index) ? (
                    <div className="text-center text-orange-400">
                      <div className="text-4xl mb-2">?</div>
                      <p className="text-sm">Card {index + 1}</p>
                    </div>
                  ) : (
                    <img
                      src={image}
                      alt={`Card ${index + 1}`}
                      className="w-full h-full object-contain"
                      onError={() => setImageLoadErrors(prev => new Set(prev).add(index))}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {ROLLING_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all ${index === currentImageIndex ? "bg-orange-400 w-6" : "bg-gray-600 w-2"}`}
                  style={index === currentImageIndex ? { boxShadow: "0 0 10px rgba(249, 115, 22, 0.8)" } : {}}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => router.push("/tutorial")}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-4 px-4 rounded-xl font-bold text-lg hover:from-yellow-400 hover:to-orange-500 transition-all flex items-center justify-center shadow-lg border border-orange-400"
            style={{ boxShadow: "0 0 25px rgba(249, 115, 22, 0.6)", letterSpacing: "0.05em" }}
          >
            <span className="text-orange-100">START TUTORIAL</span>
          </button>
        </div>

        <ProgressTracker />
      </motion.div>
    </div>
  )
}
