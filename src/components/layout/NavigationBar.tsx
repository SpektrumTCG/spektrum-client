"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthSession } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { NAV_HEIGHT } from "@/lib/constants"

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 9.5L12 3l9 6.5v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9z"/>
    <path d="M9 22V12h6v10"/>
  </svg>
)

const ShopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57l1.65-7.43H5.12"/>
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

const BattleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14.5 2l-5 5 7 7-5 5"/>
    <path d="M9.5 22l5-5-7-7 5-5"/>
  </svg>
)

const CardsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="13" height="16" rx="2"/>
    <path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3"/>
    <path d="M6 9h5"/><path d="M6 13h3"/>
  </svg>
)

const HamburgerIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
)

const PRIMARY_NAV = [
  { path: "/home", label: "Home", icon: <HomeIcon /> },
  { path: "/game-mode", label: "Battle", icon: <BattleIcon /> },
  { path: "/cards", label: "Cards", icon: <CardsIcon /> },
  { path: "/shop", label: "Shop", icon: <ShopIcon /> },
  { path: "/settings", label: "Settings", icon: <SettingsIcon /> },
]

const isDev = process.env.NODE_ENV === "development"

const MORE_NAV = [
  { path: "/achievements", label: "Achievements", icon: <AchievementsIcon /> },
  ...(isDev ? [{ path: "/dev-tools", label: "Dev Tools", icon: <SettingsIcon /> }] : []),
]

export function HamburgerMenu() {
  const router = useRouter()
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)
  const { isLoaded, isSignedIn, login } = useAuthSession()

  const navigate = (path: string) => {
    setShowMore(false)
    router.push(path)
  }

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Top-right cluster: optional guest sign-in pill + hamburger */}
      <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 w-full pointer-events-none" style={{ maxWidth: 480 }}>
        {isLoaded && !isSignedIn && (
          <button
            type="button"
            onClick={() => login()}
            className="absolute top-1.5 right-16 h-9 px-3 inline-flex items-center gap-1.5 rounded-full bg-gray-900/85 backdrop-blur text-orange-300 hover:text-white active:scale-95 border border-orange-500/40 hover:border-orange-400 text-[11px] font-semibold tracking-[0.14em] uppercase pointer-events-auto transition-all"
            style={{ boxShadow: "0 0 14px rgba(249, 115, 22, 0.18)" }}
            aria-label="Sign in to save progress"
          >
            Sign in
          </button>
        )}
        <motion.button
          onClick={() => setShowMore(v => !v)}
          className="absolute top-0 right-3 w-12 h-12 flex items-center justify-center rounded-lg text-black hover:text-orange-500 transition-colors pointer-events-auto"
          whileTap={{ scale: 0.9 }}
          aria-label="Menu"
        >
          <HamburgerIcon />
        </motion.button>
      </div>

      {/* Overlay */}
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

      {/* Dropdown menu from top right, constrained to 480px frame */}
      <AnimatePresence>
        {showMore && (
          <div className="fixed top-[88px] left-1/2 -translate-x-1/2 z-50 w-full pointer-events-none" style={{ maxWidth: 480 }}>
          <motion.div
            className="absolute top-0 right-3 w-48 pointer-events-auto"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div
              className="bg-gray-900 border border-orange-500/30 rounded-xl px-2 py-2 flex flex-col gap-1"
              style={{ boxShadow: "0 4px 24px rgba(249, 115, 22, 0.2)" }}
            >
              {MORE_NAV.map(item => (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                    isActive(item.path)
                      ? "text-orange-400 bg-orange-500/20"
                      : "text-gray-400 hover:text-orange-400 hover:bg-orange-500/10"
                  )}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="w-5 h-5">{item.icon}</div>
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export function NavigationBar() {
  const router = useRouter()
  const pathname = usePathname()

  const navigate = (path: string) => {
    router.push(path)
  }

  const isActive = (path: string) => pathname === path
  const isHidden = pathname === "/cards" || (pathname?.startsWith("/game") && pathname !== "/game-mode") || pathname?.startsWith("/tutorial")

  const navBtnClass = (active: boolean) =>
    cn(
      "flex flex-col items-center justify-center flex-1 gap-1 min-h-[44px] min-w-[44px] transition-colors rounded-lg",
      active ? "text-orange-400" : "text-gray-400 hover:text-orange-400"
    )

  return (
    <AnimatePresence>
      {!isHidden && (
        <motion.div
          className="absolute bottom-0 left-0 w-full z-50 overflow-hidden min-[481px]:rounded-b-[28px]"
          style={{ height: NAV_HEIGHT, viewTransitionName: "site-nav" }}
          initial={{ y: NAV_HEIGHT }}
          animate={{ y: 0 }}
          exit={{ y: NAV_HEIGHT }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
