"use client";

import { motion } from "framer-motion";

const SOCIALS = [
  {
    label: "X",
    href: "https://x.com/spektrum_play",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Telegram",
    href: "https://t.me/spektrumtcg",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
];

interface TopBarProps {
  onMenuToggle: () => void;
  isMobile: boolean;
}

export default function TopBar({ onMenuToggle, isMobile }: TopBarProps) {
  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="fixed top-0 left-0 right-0 z-40 flex items-center gap-2 sm:gap-3 px-3 sm:px-5 pt-3 sm:pt-5"
    >
      {/* Mobile hamburger */}
      {isMobile && (
        <button
          onClick={onMenuToggle}
          className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 flex-shrink-0"
        >
          <span className="w-5 h-px bg-foreground" />
          <span className="w-5 h-px bg-foreground" />
          <span className="w-3.5 h-px bg-foreground self-start ml-[10px]" />
        </button>
      )}

      <div className="flex-1" />

      {/* Social icons + theme + shop — unified bar */}
      <div
        className="flex items-center gap-[2px] h-[34px] px-1 rounded-xl overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/ui/v2-ui/bg-bottombar.png')" }}
      >
        {SOCIALS.map((s, i) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-[30px] h-[30px] flex items-center justify-center text-white/60 hover:text-white transition-colors duration-300"
            title={s.label}
          >
            {s.icon}
          </a>
        ))}

        <div className="w-px h-4 bg-white/15 mx-1" />

        {/* Shop button */}
        <a
          href="#"
          className="flex items-center gap-1.5 h-[30px] px-2 sm:px-3 text-white/60 hover:text-white transition-colors text-[10px] font-bold tracking-[0.15em] uppercase"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
          <span className="hidden sm:inline">SHOP</span>
        </a>
      </div>
    </motion.div>
  );
}
