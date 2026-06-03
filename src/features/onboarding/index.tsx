"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SignInButton, useUser } from "@clerk/nextjs"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

interface Slide {
  step?: number
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
    step: 1,
    title: "Build Your Deck",
    body: "Collect Avatars and Action cards from packs. Craft a deck that fits your strategy.",
    image: "/decks/fire-kobar-borah.png",
  },
  {
    step: 2,
    title: "Battle Opponents",
    body: "Duel in AI practice, casual, ranked, or high-stakes Ante matches. The better play wins.",
    image: "/ui/home/2.webp",
  },
  {
    step: 3,
    title: "Win Rewards",
    body: "Earn cards, climb the leaderboards, and unlock achievements as you play.",
    image: "/boosters/beginner.png",
  },
]

export function OnboardingFeature() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const reduceMotion = useReducedMotion()
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
  const dur = reduceMotion ? 0 : 0.45

  const ctaClass =
    "w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 active:from-orange-700 active:to-orange-800 text-white py-4 px-6 rounded-xl font-bold text-lg tracking-wide transition-all duration-200 active:scale-[0.98] border border-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
  const ctaStyle = { boxShadow: "0 0 25px rgba(249, 115, 22, 0.45)" }

  return (
    <div
      className="flex flex-col h-[100dvh] min-[421px]:h-[calc(100dvh-2rem)] pt-5 pb-6 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Art stage — dark scene the dark card art sits on, grounded with a floor band */}
      <div className="relative flex-1 min-h-0 mx-4 rounded-2xl overflow-hidden bg-gradient-to-b from-[#1d2738] via-[#141d2c] to-[#0a0f19] ring-1 ring-black/10 shadow-[inset_0_-40px_60px_-30px_rgba(0,0,0,0.7)]">
        {/* warm glow behind the subject */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(115% 70% at 50% 38%, rgba(249,115,22,0.26) 0%, transparent 62%)",
          }}
        />
        {/* stage floor band */}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-orange-500/30" />

        <AnimatePresence mode="wait">
          <motion.img
            key={slide.image}
            src={slide.image}
            alt={slide.title}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.05, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.98 }}
            transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full object-contain p-7 drop-shadow-2xl"
            draggable={false}
            onError={e => {
              e.currentTarget.style.display = "none"
            }}
          />
        </AnimatePresence>
      </div>

      {/* Copy */}
      <div className="px-6 min-h-[116px] pt-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2
              className="text-[1.6rem] leading-tight text-gray-900 mb-2 tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {slide.step && <span className="text-orange-500">{slide.step}. </span>}
              {slide.title}
            </h2>
            <p className="text-gray-600 text-[0.95rem] leading-relaxed max-w-[34ch]">
              {slide.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots — small visual, 44px touch target */}
      <div className="flex items-center justify-center px-6 py-4">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to step ${i + 1} of ${SLIDES.length}`}
            aria-current={i === index ? "step" : undefined}
            className="group grid place-items-center h-11 w-7 focus-visible:outline-none"
          >
            <span
              className={`h-2 rounded-full transition-all duration-300 ease-out group-hover:bg-orange-400 group-focus-visible:ring-2 group-focus-visible:ring-orange-500 group-focus-visible:ring-offset-2 ${
                i === index ? "w-6 bg-orange-500" : "w-2 bg-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      {/* CTA — NEXT advances slides; GET STARTED opens Clerk connect-wallet */}
      <div className="px-6">
        {isLast ? (
          <SignInButton mode="modal">
            <button className={ctaClass} style={ctaStyle}>
              GET STARTED
            </button>
          </SignInButton>
        ) : (
          <button onClick={next} className={ctaClass} style={ctaStyle}>
            NEXT
          </button>
        )}
      </div>
    </div>
  )
}
