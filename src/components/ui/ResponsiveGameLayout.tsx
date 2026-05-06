"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Settings, Home, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AnimatedButton } from './AnimatedButton';
import { useAudio } from '@/stores/useAudioStore';

interface ResponsiveGameLayoutProps {
  children: React.ReactNode;
  showGameControls?: boolean;
  gameState?: any;
}

export function ResponsiveGameLayout({
  children,
  showGameControls = false,
  gameState
}: ResponsiveGameLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { playButton } = useAudio();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Users, label: 'Game Mode', path: '/game-mode' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  const handleNavigation = (path: string) => {
    playButton();
    router.push(path);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    playButton();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {isMobile && (
        <motion.header
          className="fixed top-0 left-0 right-0 z-50 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-spektrum-orange">Spektrum TCG</h1>
            <AnimatedButton onClick={toggleMenu} variant="secondary" size="sm" className="p-2">
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </AnimatedButton>
          </div>
        </motion.header>
      )}

      <AnimatePresence>
        {isMobile && isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              className="absolute top-16 left-4 right-4 bg-gray-800 rounded-lg border border-gray-600 p-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <AnimatedButton
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    variant="secondary"
                    className="w-full justify-start"
                    icon={<item.icon size={18} />}
                  >
                    {item.label}
                  </AnimatedButton>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isMobile && showGameControls && (
        <motion.div
          className="fixed bottom-4 left-4 right-4 z-30"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="bg-gray-800/95 backdrop-blur-sm rounded-lg border border-gray-600 p-3">
            <div className="flex justify-between items-center">
              <div className="text-sm text-white">
                {gameState?.gamePhase && (
                  <span className="capitalize">{gameState.gamePhase} Phase</span>
                )}
              </div>
              <div className="flex space-x-2">
                <AnimatedButton size="sm" variant="primary">Next Phase</AnimatedButton>
                <AnimatedButton size="sm" variant="secondary">Menu</AnimatedButton>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <main className={`${isMobile ? 'pt-16 pb-20' : 'pt-4'} ${isMobile && showGameControls ? 'pb-24' : ''}`}>
        {children}
      </main>

      {!isMobile && showGameControls && (
        <motion.div
          className="fixed bottom-6 right-6 z-30"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="bg-gray-800/95 backdrop-blur-sm rounded-lg border border-gray-600 p-4 shadow-xl">
            <div className="flex flex-col space-y-2">
              <AnimatedButton size="sm" variant="primary" className="w-32">Next Phase</AnimatedButton>
              <AnimatedButton size="sm" variant="secondary" className="w-32">Settings</AnimatedButton>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ResponsiveGameLayout;
