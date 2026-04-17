"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  glowColor?: string;
}

export function Card3D({
  children,
  className = '',
  hoverable = true,
  clickable = false,
  onClick,
  glowColor = 'orange'
}: Card3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverable) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setMousePosition({
      x: (x - centerX) / centerX,
      y: (y - centerY) / centerY
    });
  };

  const cardVariants = {
    idle: {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    },
    hover: {
      rotateX: mousePosition.y * -10,
      rotateY: mousePosition.x * 10,
      scale: 1.05,
      boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 20px rgba(255, 165, 0, 0.3)`
    },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      className={`relative bg-gray-800 border border-gray-600 rounded-lg overflow-hidden ${clickable ? 'cursor-pointer' : ''} ${className}`}
      style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
      variants={hoverable ? cardVariants : undefined}
      initial="idle"
      animate={isHovered ? "hover" : "idle"}
      whileTap={clickable ? "tap" : undefined}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      onClick={onClick}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {isHovered && (
        <motion.div
          className={`absolute inset-0 rounded-lg`}
          style={{ background: `rgba(255, 165, 0, 0.1)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      <div className="relative z-10">
        {children}
      </div>

      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: `linear-gradient(${45 + mousePosition.x * 20}deg, rgba(255,255,255,0.1) 0%, transparent 50%)`
          }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  );
}

export default Card3D;
