"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { NAV_HEIGHT } from "@/lib/constants"

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

const LibraryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
)

const AchievementsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
)

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.6 9a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
)

const MoreGridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="5" cy="5" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="19" cy="5" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="19" cy="19" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
)

const PRIMARY_NAV = [
  { path: "/home", label: "Home", icon: <HomeIcon /> },
  { path: "/game-mode", label: "Play", icon: <GameIcon /> },
  { path: "/shop", label: "Shop", icon: <ShopIcon /> },
  { path: "/deck-builder", label: "Deck", icon: <DeckIcon /> },
]

const isDev = process.env.NODE_ENV === "development"

const MORE_NAV = [
  { path: "/library", label: "Library", icon: <LibraryIcon /> },
  { path: "/achievements", label: "Achievements", icon: <AchievementsIcon /> },
  { path: "/settings", label: "Settings", icon: <SettingsIcon /> },
  ...(isDev ? [{ path: "/dev-tools", label: "Dev Tools", icon: <SettingsIcon /> }] : []),
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
  const isMoreActive = MORE_NAV.some(item => pathname === item.path)

  const navBtnClass = (active: boolean) =>
    cn(
      "flex flex-col items-center justify-center flex-1 gap-1 min-h-[44px] min-w-[44px] transition-colors rounded-lg",
      active ? "text-orange-400" : "text-gray-400 hover:text-orange-400"
    )

  return (
    <>
      <AnimatePresence>
        {showMore && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMore(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMore && (
          <motion.div
            className="fixed left-1/2 -translate-x-1/2 w-full z-50"
            style={{ bottom: NAV_HEIGHT, maxWidth: 480 }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div
              className="w-full bg-gray-900 border-t-2 border-orange-500 px-6 pt-4 pb-4"
              style={{ boxShadow: "0 -4px 24px rgba(249, 115, 22, 0.25)" }}
            >
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3 px-1">More</p>
              <div className="grid grid-cols-4 gap-2">
                {MORE_NAV.map(item => (
                  <motion.button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors",
                      isActive(item.path)
                        ? "text-orange-400 bg-orange-500/20"
                        : "text-gray-400 hover:text-orange-400 hover:bg-orange-500/10"
                    )}
                    whileTap={{ scale: 0.93 }}
                  >
                    <div className="w-5 h-5">{item.icon}</div>
                    <span className="text-[10px] font-medium leading-none">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full z-50"
        style={{ maxWidth: 480, height: NAV_HEIGHT }}
      >
        <div
          className="w-full h-full flex items-center justify-around px-2 relative overflow-hidden"
        >
          {/* Bottom bar background image */}
          <img
            src="/ui/v2-ui/bg-bottombar.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          />
          {PRIMARY_NAV.map(item => (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(navBtnClass(isActive(item.path)), "relative z-10")}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={cn(
                  "transition-all",
                  isActive(item.path) ? "p-1.5 rounded-lg bg-orange-500/20" : ""
                )}
                animate={isActive(item.path) ? { scale: 1.15 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {item.icon}
              </motion.div>
              <span className={cn("text-[9px] font-medium leading-none", isActive(item.path) && "text-orange-400 font-semibold")}>
                {item.label}
              </span>
            </motion.button>
          ))}

          <motion.button
            onClick={() => setShowMore(v => !v)}
            className={cn(navBtnClass(isMoreActive || showMore), "relative z-10")}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label="More navigation options"
          >
            <motion.div
              className={cn("transition-all", (isMoreActive || showMore) ? "p-1.5 rounded-lg bg-orange-500/20" : "")}
              animate={(isMoreActive || showMore) ? { scale: 1.15 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MoreGridIcon />
            </motion.div>
            <span className={cn("text-[9px] font-medium leading-none", (isMoreActive || showMore) && "text-orange-400 font-semibold")}>
              More
            </span>
          </motion.button>
        </div>
      </div>
    </>
  )
}
