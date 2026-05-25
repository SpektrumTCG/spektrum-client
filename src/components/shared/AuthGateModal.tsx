"use client"

import { useEffect } from "react"
import { SignInButton, useUser } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"
import { Sword, Trophy, Coins, Gift, PackageOpen, Sparkles } from "lucide-react"
import { useAuthGateStore, type AuthGateIntent } from "@/stores/useAuthGateStore"

interface IntentCopy {
  eyebrow: string
  title: string
  body: string
  Icon: typeof Sword
}

const INTENT_COPY: Record<AuthGateIntent, IntentCopy> = {
  "play-ai": {
    eyebrow: "Sign in to play",
    title: "Step into the arena",
    body: "Sign in to save your matches, sync decks across devices, and earn rewards.",
    Icon: Sword,
  },
  "play-casual": {
    eyebrow: "Sign in to play",
    title: "Find a casual match",
    body: "Players need an account to queue. Sign in to keep your stats and history.",
    Icon: Sword,
  },
  "play-ranked": {
    eyebrow: "Sign in to play",
    title: "Climb the ranked ladder",
    body: "Ranked matches award season points to your account. Sign in to compete.",
    Icon: Trophy,
  },
  "play-ante": {
    eyebrow: "Wallet required",
    title: "Ante up with NFT cards",
    body: "Ante Mode wagers on-chain cards. Connect a Solana wallet to enter.",
    Icon: Coins,
  },
  "buy-pack": {
    eyebrow: "Sign in to purchase",
    title: "Save your packs",
    body: "Cards from purchased packs land in your account. Sign in to keep them.",
    Icon: Gift,
  },
  "open-pack": {
    eyebrow: "Sign in to open",
    title: "Reveal your cards",
    body: "Opened cards persist to your collection. Sign in to claim them.",
    Icon: PackageOpen,
  },
  generic: {
    eyebrow: "Sign in",
    title: "Continue with Spektrum",
    body: "Sign in to unlock matches, packs, and on-chain progress.",
    Icon: Sparkles,
  },
}

export function AuthGateModal() {
  const { isOpen, intent, close, consumePendingAction } = useAuthGateStore()
  const { isSignedIn } = useUser()

  useEffect(() => {
    if (!isOpen || !isSignedIn) return
    const action = consumePendingAction()
    close()
    if (action) action()
  }, [isOpen, isSignedIn, close, consumePendingAction])

  const copy = INTENT_COPY[intent]
  const Icon = copy.Icon

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-gate-title"
            className="relative w-full max-w-sm bg-gray-950 border border-orange-500/40 rounded-2xl p-6"
            style={{ boxShadow: "0 24px 80px -16px rgba(249, 115, 22, 0.35)" }}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="shrink-0 w-11 h-11 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-300">
                <Icon size={22} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] tracking-[0.16em] uppercase text-orange-300/80 font-semibold">
                  {copy.eyebrow}
                </p>
                <h2 id="auth-gate-title" className="text-lg font-bold text-white mt-1 leading-tight">
                  {copy.title}
                </h2>
              </div>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-6">{copy.body}</p>

            <div className="flex flex-col gap-2">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-3 px-5 rounded-xl border border-orange-400/60 transition-all"
                  style={{ boxShadow: "0 0 24px rgba(249, 115, 22, 0.35)" }}
                >
                  Connect wallet or email
                </button>
              </SignInButton>
              <button
                type="button"
                onClick={close}
                className="w-full py-2.5 px-5 rounded-xl text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                Keep browsing as guest
              </button>
            </div>

            <p className="text-[11px] text-gray-500 text-center mt-4">
              Browse the app freely. Sign in only when you want to play, purchase, or open packs.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface RequireAuthFn {
  (action: () => void): void
}

export function useRequireAuth(intent: AuthGateIntent): RequireAuthFn {
  const open = useAuthGateStore((s) => s.open)
  const { isSignedIn } = useUser()
  return (action: () => void) => {
    if (isSignedIn) {
      action()
    } else {
      open({ intent, onSuccess: action })
    }
  }
}
