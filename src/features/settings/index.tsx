"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useAudio } from '@/stores/useAudioStore';
import { useUIScale } from '@/stores/useUIStore';
import { useAuthSession } from '@/lib/auth';

export function SettingsFeature() {
  const router = useRouter();
  const {
    sfxEnabled,
    musicEnabled,
    sfxVolume,
    musicVolume,
    toggleSfx,
    toggleMusic,
    setSfxVolume,
    setMusicVolume
  } = useAudio();

  const { scale, setScale } = useUIScale();
  const { isSignedIn, email, walletAddress, login, logout } = useAuthSession();

  const [gameSettings, setGameSettings] = useState({
    visualQuality: 'high',
    gameSpeed: 'normal',
    animations: true,
    language: 'english',
    musicEnabled: musicEnabled,
    soundEffectsEnabled: sfxEnabled
  });

  const [isUIScaleExpanded, setIsUIScaleExpanded] = useState(true);
  const [isGameSettingsExpanded, setIsGameSettingsExpanded] = useState(true);
  const [isOtherExpanded, setIsOtherExpanded] = useState(true);
  const [isAccountExpanded, setIsAccountExpanded] = useState(true);

  const handleGameSettingChange = (key: string, value: unknown) => {
    setGameSettings(prev => ({ ...prev, [key]: value }));

    if (key === 'soundEffectsEnabled') {
      toggleSfx();
    } else if (key === 'musicEnabled') {
      toggleMusic();
    }

    toast.success('Setting updated');
  };

  const handleSignOut = async () => {
    await logout();
    toast.success('Signed out');
  };

  const refreshImageAssets = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      }

      if ('indexedDB' in window) {
        const dbs = await indexedDB.databases?.();
        if (dbs) {
          dbs.forEach(db => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        }
      }

      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('image') || key.includes('card') || key.includes('asset')) {
          localStorage.removeItem(key);
        }
      });

      toast.success('Image assets cache cleared! Refreshing...');
      setTimeout(() => { window.location.reload(); }, 500);
    } catch {
      toast.error('Failed to refresh assets');
    }
  };

  return (
    <div className="flex flex-col items-center pb-24 overflow-y-auto min-h-dvh pt-14" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
      <div className="max-w-md mx-auto p-3 sm:p-4 w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-gray-600">Settings</h1>
          <p className="text-gray-500 text-xs sm:text-sm mb-4">Customize your gaming experience</p>
        </div>

        <div className="space-y-3">
          {/* UI Scale */}
          <div className="bg-gray-900 border-2 border-orange-500 rounded-lg p-3 sm:p-4 shadow-lg" style={{ boxShadow: '0 0 20px rgba(249, 115, 22, 0.2)' }}>
            <div className="flex justify-between items-center mb-3 cursor-pointer" onClick={() => setIsUIScaleExpanded(!isUIScaleExpanded)}>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
                UI Scale (Interface Size)
              </h2>
              <button className="text-white hover:text-orange-400 transition-colors">
                {isUIScaleExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            </div>

            {isUIScaleExpanded && (
              <div>
                <input
                  type="range"
                  min="25"
                  max="125"
                  step="5"
                  value={scale}
                  onChange={(e) => {
                    const newScale = parseInt(e.target.value);
                    setScale(newScale);
                    toast.success(`UI Scale: ${newScale}%`);
                  }}
                  className="w-full h-3 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-white mt-2">
                  <span className="opacity-90">Tiny (25%)</span>
                  <span className="font-bold bg-white/20 px-3 py-1 rounded-full">{scale}%</span>
                  <span className="opacity-90">Large (125%)</span>
                </div>
                <p className="text-xs text-white/80 mt-2 text-center">
                  Auto-detected based on your screen size. Adjust to your preference!
                </p>
              </div>
            )}
          </div>

          {/* Game Settings */}
          <div className="bg-gray-900 border border-orange-500 border-opacity-50 rounded-lg p-3 sm:p-4 shadow-lg" style={{ boxShadow: '0 0 15px rgba(249, 115, 22, 0.1)' }}>
            <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setIsGameSettingsExpanded(!isGameSettingsExpanded)}>
              <h2 className="text-base sm:text-lg font-bold text-white">Game Settings</h2>
              <button className="text-white hover:text-orange-400 transition-colors">
                {isGameSettingsExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            </div>

            {isGameSettingsExpanded && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Visual Quality</label>
                  <select
                    value={gameSettings.visualQuality}
                    onChange={(e) => handleGameSettingChange('visualQuality', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Game Speed</label>
                  <select
                    value={gameSettings.gameSpeed}
                    onChange={(e) => handleGameSettingChange('gameSpeed', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="slow">Slow</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Language</label>
                  <select
                    value={gameSettings.language}
                    onChange={(e) => handleGameSettingChange('language', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="english">English</option>
                    <option value="japanese">Japanese</option>
                    <option value="chinese">Chinese</option>
                    <option value="spanish">Spanish</option>
                  </select>
                </div>

                {/* Music Toggle */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-white flex-shrink-0">Music</span>
                  <button
                    onClick={() => handleGameSettingChange('musicEnabled', !gameSettings.musicEnabled)}
                    className={`relative inline-flex h-6 w-12 flex-shrink-0 items-center rounded-full px-0.5 overflow-hidden transition-colors ${gameSettings.musicEnabled ? 'bg-orange-500' : 'bg-gray-600'}`}
                  >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${gameSettings.musicEnabled ? 'translate-x-[22px]' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Sound Effects Toggle */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-white flex-shrink-0">Sound Effects</span>
                  <button
                    onClick={() => handleGameSettingChange('soundEffectsEnabled', !gameSettings.soundEffectsEnabled)}
                    className={`relative inline-flex h-6 w-12 flex-shrink-0 items-center rounded-full px-0.5 overflow-hidden transition-colors ${gameSettings.soundEffectsEnabled ? 'bg-orange-500' : 'bg-gray-600'}`}
                  >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${gameSettings.soundEffectsEnabled ? 'translate-x-[22px]' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* SFX Volume */}
                {gameSettings.soundEffectsEnabled && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Sound Effects Volume</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={sfxVolume}
                      onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0%</span>
                      <span>{Math.round(sfxVolume * 100)}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}

                {/* Music Volume */}
                {gameSettings.musicEnabled && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Music Volume</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0%</span>
                      <span>{Math.round(musicVolume * 100)}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}

                {/* Animations Toggle */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-white flex-shrink-0">Animations</span>
                  <button
                    onClick={() => handleGameSettingChange('animations', !gameSettings.animations)}
                    className={`relative inline-flex h-6 w-12 flex-shrink-0 items-center rounded-full px-0.5 overflow-hidden transition-colors ${gameSettings.animations ? 'bg-orange-500' : 'bg-gray-600'}`}
                  >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${gameSettings.animations ? 'translate-x-[22px]' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Other Options */}
          <div className="bg-gray-900 border border-orange-500 border-opacity-50 rounded-lg p-3 sm:p-4 shadow-lg" style={{ boxShadow: '0 0 15px rgba(249, 115, 22, 0.1)' }}>
            <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setIsOtherExpanded(!isOtherExpanded)}>
              <h2 className="text-base sm:text-lg font-bold text-white">Other</h2>
              <button className="text-white hover:text-orange-400 transition-colors">
                {isOtherExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            </div>

            {isOtherExpanded && (
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/achievements')}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded transition-colors font-medium flex items-center justify-between gap-2 border border-orange-500 border-opacity-30 flex-shrink-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0">
                      <circle cx="12" cy="8" r="6"/>
                      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                    </svg>
                    <span className="truncate">Achievements</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>

                <button
                  onClick={() => router.push('/tutorial')}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded transition-colors font-medium flex items-center justify-between gap-2 border border-orange-500 border-opacity-30 flex-shrink-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span className="truncate">Tutorial</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>

                <button
                  onClick={refreshImageAssets}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded transition-colors font-medium flex items-center justify-between gap-2 border border-orange-500 border-opacity-30 flex-shrink-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                    </svg>
                    <span className="truncate">Refresh Image Assets</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Account */}
          <div className="bg-gray-900 border border-orange-500 border-opacity-50 rounded-lg p-3 sm:p-4 shadow-lg" style={{ boxShadow: '0 0 15px rgba(249, 115, 22, 0.1)' }}>
            <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setIsAccountExpanded(!isAccountExpanded)}>
              <h2 className="text-base sm:text-lg font-bold text-white">Account</h2>
              <button className="text-white hover:text-orange-400 transition-colors">
                {isAccountExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </button>
            </div>

            {isAccountExpanded && (
              isSignedIn ? (
                <div className="space-y-3">
                  {email && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-white">Email</span>
                      <span className="text-sm text-gray-300 truncate">{email}</span>
                    </div>
                  )}
                  {walletAddress && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-white">Wallet</span>
                      <span className="text-sm text-gray-300 font-mono">
                        {walletAddress.slice(0, 4)}…{walletAddress.slice(-4)}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-700">
                    <button
                      onClick={handleSignOut}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 sm:px-4 rounded transition-colors font-medium text-sm border border-red-500"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-300 opacity-70">
                    Sign in to sync your decks, collection, and on-chain cards.
                  </p>
                  <button
                    onClick={() => login()}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white py-2 px-3 sm:px-4 rounded transition-colors font-medium text-sm border border-orange-400"
                  >
                    Sign In
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
