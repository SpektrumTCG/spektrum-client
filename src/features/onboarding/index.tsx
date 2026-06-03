"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SignInButton, useUser } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"

interface Slide {
  title: string
  body: string
  image: string
}

const SLIDES: Slide[] = [
  {
    title: "Welcome to Spektrum",
    body: "A strategic trading card game. Build a deck, outsmart your opponents, and rise through the ranks.",
    image: "/character-stocks-v2/1.png",
  },
  {
    title: "1. Build Your Deck",
    body: "Collect Avatars and Action cards from packs. Craft a deck that fits your strategy.",
    image: "/decks/fire-kobar-borah.png",
  },
  {
    title: "2. Battle Opponents",
    body: "Duel in AI practice, casual, ranked, or high-stakes Ante matches. The better play wins.",
    image: "/ui/home/2.webp",
  },
  {
    title: "3. Win Rewards",
    body: "Earn cards, climb the leaderboards, and unlock achievements as you play.",
    image: "/boosters/beginner.png",
  },
]

export function OnboardingFeature() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const [index, setIndex] = useState(0)
  const touchStart = useRef(0)

  // Signed-in users skip onboarding straight into the app. Also fires after the
  // GET STARTED connect-wallet flow completes.
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/home")
    }
  }, [isLoaded, isSignedIn, router])

  const isLast = index === SLIDES.length - 1

  const next = () => setIndex(i => Math.min(i + 1, SLIDES.length - 1))
  const prev = () => setIndex(i => Math.max(i - 1, 0))

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(delta) < 50) return
    if (delta > 0) next()
    else prev()
  }

  // Avoid flashing slides while Clerk resolves the session (returning users).
  if (!isLoaded || isSignedIn) return null

  const slide = SLIDES[index]

  return (
    <div
      className="flex flex-col h-[100dvh] min-[421px]:h-[calc(100dvh-2rem)] px-6 pt-8 pb-6 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Art panel */}
      <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden bg-gradient-to-b from-[#1f2937] to-[#0b1220] ring-1 ring-black/10">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 30%, rgba(249,115,22,0.22) 0%, transparent 60%)",
          }}
        />
        <AnimatePresence mode="wait">
          <motion.img
            key={slide.image}
            src={slide.image}
            alt={slide.title}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-contain p-6"
            onError={e => {
              e.currentTarget.style.display = "none"
            }}
          />
        </AnimatePresence>
      </div>

      {/* Copy */}
      <div className="min-h-[120px] pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h2
              className="text-2xl text-gray-900 mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {slide.title}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">{slide.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 py-5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-orange-500" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* CTA — NEXT advances slides; GET STARTED opens Clerk connect-wallet */}
      {isLast ? (
        <SignInButton mode="modal">
          <button
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg tracking-wide transition-all border border-orange-400"
            style={{ boxShadow: "0 0 25px rgba(249, 115, 22, 0.5)" }}
          >
            GET STARTED
          </button>
        </SignInButton>
      ) : (
        <button
          onClick={next}
          className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg tracking-wide transition-all border border-orange-400"
          style={{ boxShadow: "0 0 25px rgba(249, 115, 22, 0.5)" }}
        >
          NEXT
        </button>
      )}
    </div>
  )
}
