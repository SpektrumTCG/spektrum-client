"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '@/stores/useAudioStore';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
  soundEffect?: boolean;
  animate?: boolean;
}

export function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  icon,
  soundEffect = true,
  animate = true
}: AnimatedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const { playButton, playHover } = useAudio();

  const baseClasses = "relative font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";

  const variantClasses = {
    primary: "bg-spektrum-orange hover:bg-orange-600 text-spektrum-dark focus:ring-orange-500",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  const handleClick = () => {
    if (disabled || loading) return;
    if (soundEffect) playButton();
    onClick?.();
  };

  const handleMouseEnter = () => {
    if (!disabled && !loading && soundEffect) playHover();
  };

  const buttonVariants = {
    idle: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -1 },
    tap: { scale: 0.98, y: 1 }
  };

  const rippleVariants = {
    initial: { scale: 0, opacity: 1 },
    animate: { scale: 4, opacity: 0 }
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      variants={animate ? buttonVariants : undefined}
      initial="idle"
      whileHover={!disabled && !loading ? "hover" : undefined}
      whileTap={!disabled && !loading ? "tap" : undefined}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      disabled={disabled || loading}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {isPressed && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          variants={rippleVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5 }}
        />
      )}

      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />

      <div className="relative flex items-center justify-center space-x-2">
        {loading ? (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </div>
    </motion.button>
  );
}

export default AnimatedButton;
