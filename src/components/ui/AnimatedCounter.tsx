"use client"

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

export function AnimatedCounter({
  value,
  duration = 1,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0,
  size = 'md',
  color = 'white'
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) =>
    (current as number).toFixed(decimals)
  );

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  useEffect(() => {
    spring.set(value);
    const unsubscribe = display.on('change', (latest) => {
      setDisplayValue(parseFloat(latest));
    });
    return unsubscribe;
  }, [value, spring, display]);

  return (
    <motion.span
      className={`font-mono font-bold tabular-nums ${sizeClasses[size]} ${className}`}
      style={{ color }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      <motion.span
        key={Math.floor(displayValue)}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {displayValue.toFixed(decimals)}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

export default AnimatedCounter;
