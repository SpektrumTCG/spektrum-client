"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const CRITICAL_IMAGES = [
  "/ui/logo.png",
  "/ui/v2-ui/Landing Page - Var 1.svg",
  "/ui/v2-ui/bg-bottombar.png",
  "/character-stocks/1.png",
  "/character-stocks/2.png",
  "/character-stocks/3.png",
];

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // don't block on failure
    img.src = src;
  });
}

export default function LoadingScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const total = CRITICAL_IMAGES.length;
    let loaded = 0;

    const promises = CRITICAL_IMAGES.map((src) =>
      preloadImage(src).then(() => {
        if (cancelled) return;
        loaded++;
        setProgress(Math.round((loaded / total) * 100));
      })
    );

    Promise.all(promises).then(() => {
      if (cancelled) return;
      // small delay so user sees 100%
      setTimeout(() => {
        if (!cancelled) onComplete();
      }, 400);
    });

    return () => {
      cancelled = true;
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center gap-8"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-[200px] h-[100px] sm:w-[300px] sm:h-[150px]"
      >
        <Image
          src="/ui/logo.png"
          alt="Spektrum"
          fill
          className="object-contain"
          priority
        />
      </motion.div>

      {/* Progress bar */}
      <div className="w-48 sm:w-64">
        <div className="h-[2px] bg-foreground/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[var(--spektrum-cyan)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <p className="text-center mt-3 text-[10px] font-mono tracking-[0.3em] uppercase text-foreground/40">
          Loading {progress}%
        </p>
      </div>
    </motion.div>
  );
}
