"use client"

import { useRouter } from "next/navigation"

interface BackButtonProps {
  to?: string
  onClick?: () => void
}

export function BackButton({ to = "/home", onClick }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push(to)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="fixed top-4 right-4 z-50 bg-gray-800 bg-opacity-80 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
      title="Back"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6"/>
      </svg>
    </button>
  )
}
