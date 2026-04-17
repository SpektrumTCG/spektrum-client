"use client"

import React from 'react';
import { motion } from 'framer-motion';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  once?: boolean;
}

export function FadeInView({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  className = '',
  once = true
}: FadeInViewProps) {
  const directionVariants = {
    up: { y: 30, opacity: 0 },
    down: { y: -30, opacity: 0 },
    left: { x: 30, opacity: 0 },
    right: { x: -30, opacity: 0 },
    none: { opacity: 0 }
  };

  const visible = {
    y: 0,
    x: 0,
    opacity: 1,
    transition: { duration, delay, ease: "easeOut" as const }
  };

  return (
    <motion.div
      className={className}
      initial={directionVariants[direction]}
      whileInView={visible}
      viewport={{ once, amount: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

export default FadeInView;
