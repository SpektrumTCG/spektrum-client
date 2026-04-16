// src/components/layout/NavigationBar.tsx
"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { NAV_HEIGHT } from "@/lib/constants"

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 9.5L12 3l9 6.5v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9z"/>
    <path d="M9 22V12h6v10"/>
  </svg>
)

const GameIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8"/><path d="M12 17v4"/>
  </svg>
)

const ShopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57l1.65-7.43H5.12"/>
  </svg>
)

const DeckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    <path d="M8 7h8"/><path d="M8 11h6"/>
  </svg>
)

const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>
  </svg>
)

const PRIMARY_NAV: NavItem[] = [
  { label: "Home", path: "/home", icon: <HomeIcon /> },
  { label: "Game", path: "/game", icon: <GameIcon /> },
  { label: "Shop", path: "/shop", icon: <ShopIcon /> },
  { label: "Deck", path: "/deck-builder", icon: <DeckIcon /> },
]

const MORE_NAV: NavItem[] = [
  { label: "Inventory", path: "/inventory", icon: null },
  { label: "Library", path: "/library", icon: null },
  { label: "Achievements", path: "/achievements", icon: null },
  { label: "Multiplayer", path: "/multiplayer", icon: null },
  { label: "Settings", path: "/settings", icon: null },
]

export function NavigationBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  const navigate = (path: string) => {
    setShowMore(false)
    router.push(path)
  }

  const isActive = (path: string) => pathname === path

  return (
    <>
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
            />
            <motion.div
              className="fixed bottom-16 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 rounded-t-2xl bg-background p-4 shadow-xl"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="grid grid-cols-3 gap-3">
                {MORE_NAV.map((item) => (
                  <button
                    key={item.path}
                    className={cn(
                      "rounded-xl p-3 text-sm font-medium transition-colors",
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur"
        style={{ height: NAV_HEIGHT, paddingBottom: "var(--sab)" }}
      >
        <div className="mx-auto flex h-full max-w-sm items-center justify-around px-2">
          {PRIMARY_NAV.map((item) => (
            <button
              key={item.path}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors",
                isActive(item.path)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          <button
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors",
              showMore ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setShowMore((v) => !v)}
          >
            <MoreIcon />
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  )
}
