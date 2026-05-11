"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/landing/sidebar";
import TopBar from "@/components/landing/top-bar";
import HeroSlide from "@/components/landing/slides/hero-slide";
import LoreSlide from "@/components/landing/slides/lore-slide";
import CharacterSlide from "@/components/landing/slides/character-slide";
import CardsSlide from "@/components/landing/slides/cards-slide";
import GameplaySlide from "@/components/landing/slides/gameplay-slide";
import NewsSlide from "@/components/landing/slides/news-slide";
import CommunitySlide from "@/components/landing/slides/community-slide";
import ScrollIndicator from "@/components/landing/scroll-indicator";
import LoadingScreen from "@/components/landing/loading-screen";

const SECTIONS = [
  { id: "home", label: "HOME" },
  { id: "lore", label: "THE LORE" },
  { id: "characters", label: "CHARACTERS" },
  { id: "gameplay", label: "GAMEPLAY" },
  { id: "cards", label: "CARDS ARCHIVE" },
  { id: "news", label: "NEWS" },
  { id: "community", label: "COMMUNITY" },
];

export default function LandingPage() {
  const [loaded, setLoaded] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [characterDetailOpen, setCharacterDetailOpen] = useState(false);
  const touchStart = useRef(0);
  const lastScroll = useRef(0);
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelConsumed = useRef(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 750);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const goToSection = useCallback(
    (index: number) => {
      if (isTransitioning || index < 0 || index >= SECTIONS.length) return;
      if (index === currentSection) return;
      setIsTransitioning(true);
      setCurrentSection(index);
      setTimeout(() => setIsTransitioning(false), 800);
    },
    [currentSection, isTransitioning]
  );

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
      wheelTimeout.current = setTimeout(() => {
        wheelConsumed.current = false;
      }, 300);

      if (wheelConsumed.current) return;
      if (Math.abs(e.deltaY) < 5) return;

      wheelConsumed.current = true;

      if (e.deltaY > 0) {
        goToSection(currentSection + 1);
      } else if (e.deltaY < 0) {
        goToSection(currentSection - 1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
    };
  }, [currentSection, goToSection]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const delta = touchStart.current - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 50) return;
      const now = Date.now();
      if (now - lastScroll.current < 1000) return;
      lastScroll.current = now;

      if (delta > 0) goToSection(currentSection + 1);
      else goToSection(currentSection - 1);
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentSection, goToSection]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        goToSection(currentSection + 1);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        goToSection(currentSection - 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentSection, goToSection]);

  const SLIDES = [
    <HeroSlide key="hero" active={currentSection === 0} />,
    <LoreSlide key="lore" active={currentSection === 1} />,
    <CharacterSlide key="characters" active={currentSection === 2} onDetailToggle={setCharacterDetailOpen} />,
    <GameplaySlide key="gameplay" active={currentSection === 3} />,
    <CardsSlide key="cards" active={currentSection === 4} />,
    <NewsSlide key="news" active={currentSection === 5} />,
    <CommunitySlide key="community" active={currentSection === 6} />,
  ];

  const handleLoadComplete = useCallback(() => setLoaded(true), []);

  return (
    <div className="landing-scope noise-overlay fixed inset-0 bg-background overflow-hidden font-[family-name:var(--font-body)] text-foreground">
      <AnimatePresence>
        {!loaded && <LoadingScreen onComplete={handleLoadComplete} />}
      </AnimatePresence>

      {!characterDetailOpen && (
        <Sidebar
          sections={SECTIONS}
          currentSection={currentSection}
          onNavigate={(i) => { goToSection(i); setSidebarCollapsed(false); }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
          collapsed={sidebarCollapsed}
          onExpand={() => setSidebarCollapsed(false)}
        />
      )}

      {!characterDetailOpen && (
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} />
      )}

      <div className="fixed inset-0" onClick={() => { if (!isMobile && !sidebarCollapsed) setSidebarCollapsed(true); }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full"
          >
            {SLIDES[currentSection]}
          </motion.div>
        </AnimatePresence>
      </div>

      {!characterDetailOpen && (
        <ScrollIndicator
          currentSection={currentSection}
          totalSections={SECTIONS.length}
          onNext={() => goToSection(currentSection + 1)}
          onPrev={() => goToSection(currentSection - 1)}
        />
      )}

      {!characterDetailOpen && (
        <div className="fixed bottom-0 left-0 right-0 h-[2px] bg-black/[0.04] dark:bg-white/[0.06] z-40">
          <div
            className="h-full bg-[var(--spektrum-cyan)] section-progress"
            style={{
              width: `${((currentSection + 1) / SECTIONS.length) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
