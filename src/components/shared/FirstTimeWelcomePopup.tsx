"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { X, BookOpen, Play, Sparkles } from "lucide-react"

interface FirstTimeWelcomePopupProps {
  isOpen: boolean
  onClose: () => void
  onDismiss: () => void
}

export function FirstTimeWelcomePopup({ isOpen, onClose, onDismiss }: FirstTimeWelcomePopupProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleStartTutorial = () => {
    onDismiss()
    router.push("/tutorial")
  }

  const handleSkip = () => {
    onDismiss()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-2 border-orange-500/60 rounded-xl shadow-2xl max-w-sm w-full p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />

        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg shadow-orange-500/30">
              <Sparkles className="text-white" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome, Summoner!</h2>
            <p className="text-gray-400 text-sm">
              Your journey into the Spektrum universe begins now
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
            <p className="text-gray-300 text-sm leading-relaxed">
              Spektrum Trading Card Game is a strategic battle game where you&apos;ll build powerful
              decks and battle opponents using Avatars and Action cards. Complete the tutorial to
              learn the basics and receive your{" "}
              <span className="text-orange-400 font-semibold">free starter deck</span>!
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleStartTutorial}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
            >
              <BookOpen size={22} />
              Start Tutorial
            </button>

            <button
              onClick={handleSkip}
              className="w-full flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 font-medium py-2 px-6 rounded-lg transition-colors border border-gray-600 text-sm"
            >
              <Play size={16} />
              Skip for Now
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            You can always access the tutorial from the main menu
          </p>
        </div>
      </div>
    </div>
  )
}
