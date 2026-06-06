"use client"

import React from 'react';
import { motion } from 'framer-motion';

/** Looping drag indicator over the crimp strip until the user interacts. */
export function FingerHint({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <motion.div
      className="absolute left-[22%] top-[16%] text-3xl pointer-events-none select-none"
      style={{ filter: 'drop-shadow(0 0 6px rgba(251,146,60,0.8))' }}
      animate={{ x: [0, 90, 0], opacity: [0, 1, 0] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      👆
    </motion.div>
  );
}
