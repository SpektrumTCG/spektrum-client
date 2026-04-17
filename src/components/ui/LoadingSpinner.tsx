"use client"

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  type?: 'spin' | 'pulse' | 'bounce' | 'dots';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  color = 'spektrum-orange',
  type = 'spin',
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClass = color.startsWith('#') ? '' : `text-${color}`;

  if (type === 'spin') {
    return (
      <motion.div
        className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full ${colorClass} ${className}`}
        style={color.startsWith('#') ? { color } : {}}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    );
  }

  if (type === 'pulse') {
    return (
      <motion.div
        className={`${sizeClasses[size]} bg-current rounded-full ${colorClass} ${className}`}
        style={color.startsWith('#') ? { backgroundColor: color } : {}}
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  }

  if (type === 'bounce') {
    return (
      <motion.div
        className={`${sizeClasses[size]} bg-current rounded-full ${colorClass} ${className}`}
        style={color.startsWith('#') ? { backgroundColor: color } : {}}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
      />
    );
  }

  if (type === 'dots') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 bg-current rounded-full ${colorClass}`}
            style={color.startsWith('#') ? { backgroundColor: color } : {}}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
          />
        ))}
      </div>
    );
  }

  return null;
}

export default LoadingSpinner;
