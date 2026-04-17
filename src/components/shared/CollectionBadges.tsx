"use client"

import React from 'react';
import { useCollectionBadges } from '@/lib/hooks/useCollectionBadges';
import { motion } from 'framer-motion';

const getElementIcon = (iconId: string, size: string = '24', strokeWidth: string = '1.5') => {
  switch (iconId) {
    case 'svg-fire':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <path d="M12 2c0 0-3 4-3 8c0 2.21 1.34 4.11 3.25 4.88C13 15.44 13 16.5 13 18c0 3.86-3.13 7-7 7s-7-3.14-7-7c0-5 4-9 7-11"/>
          <path d="M12 2v4m-4-1l3 3m4-3l-3 3"/>
        </svg>
      );
    case 'svg-water':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.32 0z"/>
          <path d="M12 9c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3"/>
        </svg>
      );
    case 'svg-ground':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <path d="M3 12h18"/>
          <path d="M3 12L6 8l4 4 4-4 4 4 2-4"/>
          <path d="M3 18h18v2H3z"/>
          <circle cx="6" cy="6" r="2"/>
          <circle cx="14" cy="6" r="2"/>
        </svg>
      );
    case 'svg-air':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <path d="M4 12h16"/>
          <path d="M4 6h12"/>
          <path d="M4 18h14"/>
          <circle cx="16" cy="12" r="3"/>
        </svg>
      );
    case 'svg-neutral':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
          <circle cx="12" cy="12" r="9"/>
          <circle cx="12" cy="12" r="5"/>
          <circle cx="12" cy="12" r="1"/>
        </svg>
      );
    default:
      return null;
  }
};

const getElementColor = (iconId: string) => {
  switch (iconId) {
    case 'svg-fire': return 'text-red-500';
    case 'svg-water': return 'text-blue-500';
    case 'svg-ground': return 'text-yellow-500';
    case 'svg-air': return 'text-green-500';
    case 'svg-neutral': return 'text-gray-400';
    default: return 'text-gray-400';
  }
};

const getElementGlow = (iconId: string) => {
  switch (iconId) {
    case 'svg-fire': return 'shadow-lg shadow-red-500/50';
    case 'svg-water': return 'shadow-lg shadow-blue-500/50';
    case 'svg-ground': return 'shadow-lg shadow-yellow-500/50';
    case 'svg-air': return 'shadow-lg shadow-green-500/50';
    case 'svg-neutral': return 'shadow-lg shadow-gray-500/50';
    default: return 'shadow-lg shadow-gray-500/50';
  }
};

export const CollectionBadges: React.FC = () => {
  const { getCollectionBadges } = useCollectionBadges();
  const badges = getCollectionBadges();
  const completedBadges = badges.filter(b => b.isComplete);

  return (
    <div className="w-full max-w-md mx-auto p-4 mb-6">
      <div className="bg-gray-900 border border-spektrum-orange/30 rounded-lg p-4">
        <h3 className="text-lg font-bold text-spektrum-orange mb-4 flex items-center gap-2">
          Collection Badges ({completedBadges.length}/{badges.length})
        </h3>

        <div className="grid grid-cols-4 gap-2">
          {badges.map((badge, idx) => (
            <motion.div
              key={badge.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="group relative"
              title={badge.description}
            >
              <div
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-2xl
                  transition-all duration-200 cursor-help
                  ${badge.isComplete
                    ? badge.icon.startsWith('svg-')
                      ? `bg-gray-900 border-2 border-current ${getElementColor(badge.icon)} ${getElementGlow(badge.icon)}`
                      : 'bg-gradient-to-br from-spektrum-orange to-orange-600 shadow-lg shadow-orange-500/50'
                    : 'bg-gray-800 border border-gray-700 text-gray-600'
                  }
                `}
              >
                {badge.icon.startsWith('svg-') ? getElementIcon(badge.icon, '28') : badge.icon}
              </div>

              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-950 border border-spektrum-orange/50 rounded px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                <div className="font-semibold">{badge.name}</div>
                <div className="text-gray-400">{badge.description}</div>
              </div>

              {/* Progress bar for incomplete */}
              {!badge.isComplete && badge.total > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-spektrum-orange to-orange-400 transition-all"
                    style={{ width: `${(badge.progress / badge.total) * 100}%` }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {completedBadges.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-400">
            <p>
              <span className="text-spektrum-orange font-semibold">
                {completedBadges.length}
              </span>
              {' '}badge{completedBadges.length !== 1 ? 's' : ''} completed!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionBadges;
