"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAchievementsStore } from '@/stores/useAchievementsStore';
import { ACHIEVEMENTS, AchievementCategory, getCategoryName, getRarityColor, getRarityBg } from '@/lib/achievements';

export function AchievementsFeature() {
  const {
    achievements,
    getProgress,
    getTotalProgress,
    initialize,
    initialized,
    resetAll
  } = useAchievementsStore();

  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [showLocked, setShowLocked] = useState(true);
  const [showUnlocked, setShowUnlocked] = useState(true);

  const getAchievementIcon = (achievementId: string, size: string = '24', strokeWidth: string = '1.5') => {
    switch (achievementId) {
      case 'first_victory':
      case 'win_5':
      case 'win_10':
      case 'win_25':
      case 'win_50':
      case 'win_100':
      case 'win_250':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
            <path d="M6 9c0-1 1-2 2-2h8c1 0 2 1 2 2v8c0 1-1 2-2 2H8c-1 0-2-1-2-2V9z"/>
            <path d="M10 5l1-2h2l1 2"/>
            <path d="M12 15v2M10 13v2M14 13v2"/>
          </svg>
        );
      case 'win_streak_3':
      case 'win_streak_5':
      case 'win_streak_10':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        );
      case 'collect_10':
      case 'collect_25':
      case 'collect_50':
      case 'collect_100':
      case 'collect_250':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
            <rect x="2" y="2" width="8" height="8" rx="1"/>
            <rect x="14" y="2" width="8" height="8" rx="1"/>
            <rect x="2" y="14" width="8" height="8" rx="1"/>
            <rect x="14" y="14" width="8" height="8" rx="1"/>
          </svg>
        );
      case 'build_deck':
      case 'build_3_decks':
      case 'build_10_decks':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
            <path d="M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"/>
            <path d="M9 7h6M9 11h6M9 15h6"/>
          </svg>
        );
      case 'first_trade':
      case 'trade_5':
      case 'trade_20':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
            <path d="M3 12h18M12 5l7 7-7 7"/>
            <path d="M21 12H3M12 19l-7-7 7-7"/>
          </svg>
        );
      case 'tutorial_complete':
      case 'view_help':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
        );
      case 'legendary_pull':
      case 'perfect_match':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
        );
    }
  };

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  const totalProgress = getTotalProgress();

  const categories: (AchievementCategory | 'all')[] = ['all', 'battle', 'collection', 'deck', 'trading', 'tutorial', 'special'];

  const filteredAchievements = ACHIEVEMENTS.filter(achievement => {
    const progress = getProgress(achievement.id);
    const isUnlocked = progress?.isUnlocked ?? false;

    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false;
    if (!showLocked && !isUnlocked) return false;
    if (!showUnlocked && isUnlocked) return false;
    if (achievement.hidden && !isUnlocked) return false;

    return true;
  });

  const getCategoryCount = (category: AchievementCategory | 'all') => {
    const categoryAchievements = category === 'all'
      ? ACHIEVEMENTS.filter(a => !a.hidden)
      : ACHIEVEMENTS.filter(a => a.category === category && !a.hidden);

    const unlocked = categoryAchievements.filter(a => {
      const progress = getProgress(a.id);
      return progress?.isUnlocked ?? false;
    }).length;

    return { unlocked, total: categoryAchievements.length };
  };

  const renderAchievementCard = (achievement: typeof ACHIEVEMENTS[0], index: number) => {
    const progress = getProgress(achievement.id);
    const isUnlocked = progress?.isUnlocked ?? false;
    const currentProgress = progress?.progress ?? 0;
    const progressPercent = achievement.maxProgress > 0
      ? Math.round((currentProgress / achievement.maxProgress) * 100)
      : 0;

    return (
      <motion.div
        key={achievement.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        className={`relative p-3 rounded-lg border transition-all cursor-pointer ${
          isUnlocked
            ? 'bg-gray-900 border-orange-500 shadow-lg hover:scale-105'
            : 'bg-gray-900 border-gray-700 opacity-60 hover:scale-105'
        }`}
        style={isUnlocked ? { boxShadow: '0 0 15px rgba(249, 115, 22, 0.3)' } : {}}
      >
        {isUnlocked && (
          <div className="absolute top-1 right-1 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {'\u2713'}
          </div>
        )}

        <div className={`flex justify-center mb-2 ${isUnlocked ? 'text-orange-400' : 'text-gray-500'}`}>
          {getAchievementIcon(achievement.id, '28')}
        </div>

        <h3 className={`font-bold text-xs text-center mb-1 leading-tight ${
          isUnlocked ? getRarityColor(achievement.rarity) : 'text-gray-400'
        }`}>
          {achievement.hidden && !isUnlocked ? '???' : achievement.name}
        </h3>

        <p className={`text-[10px] text-center mb-2 line-clamp-2 h-6 ${
          isUnlocked ? 'text-gray-300' : 'text-gray-500'
        }`}>
          {achievement.hidden && !isUnlocked
            ? 'Hidden'
            : achievement.description.substring(0, 50) + (achievement.description.length > 50 ? '...' : '')}
        </p>

        {!isUnlocked && achievement.maxProgress > 1 && (
          <div className="mb-2">
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-orange-500 rounded-full h-1.5 transition-all"
                style={{ width: `${progressPercent}%`, boxShadow: '0 0 5px rgba(249, 115, 22, 0.6)' }}
              />
            </div>
            <p className="text-[9px] text-gray-400 text-center mt-0.5">
              {currentProgress}/{achievement.maxProgress}
            </p>
          </div>
        )}

        {achievement.reward && (
          <div className="flex justify-center">
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
              achievement.reward.tier === 'premium' ? 'bg-purple-900 border-purple-500 text-purple-300' :
              achievement.reward.tier === 'standard' ? 'bg-blue-900 border-blue-500 text-blue-300' :
              'bg-gray-800 border-gray-600 text-gray-300'
            }`}>
              {achievement.reward.type === 'booster'
                ? `${achievement.reward.amount}x ${achievement.reward.tier?.charAt(0).toUpperCase()}`
                : 'Title'}
            </span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
      <div className="max-w-md mx-auto p-4 w-full">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-orange-400 mb-2">
            Achievements
          </h1>
          <p className="text-spektrum-gray text-sm mb-4">
            Track your progress and unlock rewards
          </p>
        </div>

        {/* Overall Progress */}
        <motion.div
          className="bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 rounded-xl mb-6 border-2 border-orange-500 shadow-lg"
          style={{ boxShadow: '0 0 30px rgba(249, 115, 22, 0.3)' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-orange-100">Overall Progress</span>
            <span className="text-2xl font-bold">{totalProgress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-full h-3"
              style={{ boxShadow: '0 0 10px rgba(249, 115, 22, 0.8)' }}
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress.percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-orange-100 opacity-90">
            {totalProgress.unlocked} of {totalProgress.total} unlocked
          </p>
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={resetAll}
              className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
            >
              Reset All
            </button>
          )}
        </motion.div>

        {/* Category Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(category => {
              const count = getCategoryCount(category);
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-2 rounded-lg font-medium text-xs transition-all border ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-400 shadow-lg'
                      : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-orange-500'
                  }`}
                  style={selectedCategory === category ? { boxShadow: '0 0 15px rgba(249, 115, 22, 0.6)' } : {}}
                >
                  {category === 'all' ? 'All' : getCategoryName(category)}
                  <span className="ml-1.5 text-[10px] opacity-75">
                    ({count.unlocked}/{count.total})
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex space-x-4 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer text-gray-300 hover:text-orange-400">
              <input
                type="checkbox"
                checked={showUnlocked}
                onChange={(e) => setShowUnlocked(e.target.checked)}
                className="rounded border-gray-500 bg-gray-700"
              />
              <span>Unlocked</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer text-gray-300 hover:text-orange-400">
              <input
                type="checkbox"
                checked={showLocked}
                onChange={(e) => setShowLocked(e.target.checked)}
                className="rounded border-gray-500 bg-gray-700"
              />
              <span>Locked</span>
            </label>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="bg-gray-900 border-2 border-orange-500 rounded-xl p-4 mb-6 shadow-lg" style={{ boxShadow: '0 0 20px rgba(249, 115, 22, 0.2)' }}>
          {filteredAchievements.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-orange-400 text-lg">No achievements match your filters</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filter settings</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-3 gap-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
            >
              {filteredAchievements.map((achievement, idx) => renderAchievementCard(achievement, idx))}
            </motion.div>
          )}
        </div>

        {/* Stats Summary */}
        {selectedCategory !== 'all' && (
          <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-4 shadow-lg">
            <h2 className="text-lg font-bold text-orange-400 mb-3">
              {getCategoryName(selectedCategory)} Stats
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-xl font-bold text-orange-400">
                  {ACHIEVEMENTS.filter(a => a.category === selectedCategory).length}
                </p>
              </div>
              <div className="bg-gray-800 border border-green-700 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Unlocked</p>
                <p className="text-xl font-bold text-green-400">
                  {ACHIEVEMENTS.filter(a => a.category === selectedCategory && getProgress(a.id)?.isUnlocked).length}
                </p>
              </div>
              <div className="bg-gray-800 border border-orange-700 p-3 rounded-lg">
                <p className="text-xs text-gray-400">In Progress</p>
                <p className="text-xl font-bold text-orange-400">
                  {ACHIEVEMENTS.filter(a => {
                    const p = getProgress(a.id);
                    return a.category === selectedCategory && !p?.isUnlocked && (p?.progress ?? 0) > 0;
                  }).length}
                </p>
              </div>
              <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg">
                <p className="text-xs text-gray-400">Locked</p>
                <p className="text-xl font-bold text-gray-500">
                  {ACHIEVEMENTS.filter(a => a.category === selectedCategory && !getProgress(a.id)?.isUnlocked).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
