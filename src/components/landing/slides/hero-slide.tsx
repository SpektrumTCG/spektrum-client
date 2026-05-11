"use client";

import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import SlideBackground from "../slide-background";

interface SlideProps {
  active: boolean;
}

const CHARACTER_IMAGES = Array.from({ length: 19 }, (_, i) => `/character-stocks/${i + 1}.png`);
const ROTATE_INTERVAL = 30_000;

export default function HeroSlide({ active }: SlideProps) {
  const [charIndex, setCharIndex] = useState(0);
  const scrollAccum = useRef(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const scrollY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 30, damping: 40, mass: 1 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 40, mass: 1 });
  const springScrollY = useSpring(scrollY, { stiffness: 40, damping: 50, mass: 1 });

  // Rotate character every 30 seconds
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setCharIndex((prev) => (prev + 1) % CHARACTER_IMAGES.length);
    }, ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [active]);

  // Track cursor — writes directly to motion values, no re-renders
  useEffect(() => {
    if (!active) return;
    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseX.set(((e.clientX - cx) / cx) * 20);
      mouseY.set(((e.clientY - cy) / cy) * 15);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [active, mouseX, mouseY]);

  // Scroll parallax — accumulate wheel delta for vertical shift
  useEffect(() => {
    if (!active) {
      scrollAccum.current = 0;
      scrollY.set(0);
      return;
    }
    const handleWheel = (e: WheelEvent) => {
      scrollAccum.current = Math.max(-60, Math.min(60, scrollAccum.current + e.deltaY * 0.15));
      scrollY.set(scrollAccum.current);
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [active, scrollY]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Base geometric background */}
      <SlideBackground variant={1} />

      {/* Character anchored to the left (desktop) / centered background (mobile) */}
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.3 }}
          className="absolute inset-0 z-[1] pointer-events-none hidden md:block md:-translate-x-[30%]"
          style={{
            x: springX,
            y: springScrollY,
            translateY: springY,
            maskImage: "radial-gradient(ellipse 70% 80% at 50% 50%, black 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 80% at 50% 50%, black 40%, transparent 100%)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={charIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="relative w-full h-full"
            >
              <Image
                src={CHARACTER_IMAGES[charIndex]}
                alt=""
                fill
                className="object-contain object-center md:object-left-bottom opacity-40 md:opacity-90"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Content — centered on mobile, right-shifted on desktop */}
      <div className="absolute inset-0 flex items-center justify-center z-10 px-6 md:pl-[45%] md:pr-[5%] lg:pl-[40%] lg:pr-[8%]">
        <div className="flex flex-col items-center text-center">
        {active && (
          <>
            {/* Brand logo */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="relative w-[220px] h-[110px] sm:w-[380px] sm:h-[190px] md:w-[480px] md:h-[240px] lg:w-[560px] lg:h-[280px]"
            >
              <Image
                src="/ui/logo.png"
                alt="Spektrum Trading Card Game"
                fill
                className="object-contain drop-shadow-[0_0_60px_rgba(0,145,163,0.12)]"
                priority
              />
            </motion.div>

            {/* One-liner: Collect, Strategize, Battle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="mt-4"
            >
              <h2 className="font-[family-name:var(--font-display)] font-medium text-base sm:text-xl md:text-2xl lg:text-3xl tracking-[0.05em] text-[#1a1a2e] dark:text-foreground">
                Collect
                <span className="mx-1 md:mx-1.5">&bull;</span>
                Strategize
                <span className="mx-1 md:mx-1.5">&bull;</span>
                Battle
              </h2>
            </motion.div>

            {/* Play the Game button */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="mt-8"
            >
              <Link
                href="/start"
                className="relative px-8 py-3 md:px-10 md:py-3.5 text-white font-[family-name:var(--font-display)] font-bold text-xs md:text-sm tracking-[0.15em] uppercase rounded-2xl transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:brightness-110 cursor-pointer overflow-hidden bg-gradient-to-r from-[#E8541E] to-[#f59e0b] inline-block"
              >
                Play the Game
              </Link>
            </motion.div>

          </>
        )}
        </div>
      </div>

      {/* Right side vertical text */}
      <div className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col items-center gap-3 z-10">
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-foreground/10" />
        <span className="text-[8px] font-mono tracking-[0.5em] uppercase text-foreground/15 [writing-mode:vertical-lr] rotate-180">
          Trading Card Game
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-foreground/10 to-transparent" />
      </div>
    </div>
  );
}
