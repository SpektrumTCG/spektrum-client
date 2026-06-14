"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Trophy,
  BookOpen,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Copy,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useAudio } from '@/stores/useAudioStore';
import { useUIScale } from '@/stores/useUIStore';
import { useAuthSession } from '@/lib/auth';

/* ── Building blocks ─────────────────────────────────────────── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 first:mt-6">
      <h2 className="px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </h2>
      <div className="mt-2 divide-y divide-slate-900/[0.06] rounded-2xl bg-white/80 ring-1 ring-slate-900/[0.08] shadow-sm">
        {children}
      </div>
    </section>
  );
}

function Row({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex min-h-[52px] items-center justify-between gap-4 px-4 py-2 ${className}`}>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="-m-2 rounded-full p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
    >
      <span
        className={`flex h-7 w-12 items-center rounded-full px-0.5 transition-colors motion-reduce:transition-none ${
          checked ? 'bg-orange-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`h-6 w-6 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${
            checked ? 'translate-x-[20px]' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}

function VolumeSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="px-4 pb-3 pt-1">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="font-mono text-xs tabular-nums text-slate-500">
          {Math.round(value * 100)}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={value}
        aria-label={label}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer accent-orange-500"
      />
    </div>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <Row>
      <span className="text-sm font-medium text-slate-900">{label}</span>
      <div className="relative">
        <select
          value={value}
          aria-label={label}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[44px] appearance-none rounded-lg bg-slate-900/[0.05] py-2 pl-3 pr-8 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </Row>
  );
}

function LinkRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[52px] w-full items-center justify-between gap-4 px-4 py-2 text-left transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-900/[0.03] active:bg-slate-900/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="text-slate-500">{icon}</span>
        <span className="truncate text-sm font-medium text-slate-900">{label}</span>
      </span>
      <ChevronRight size={16} className="shrink-0 text-slate-400" />
    </button>
  );
}

/* ── Feature ─────────────────────────────────────────────────── */

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
    setMusicVolume,
  } = useAudio();

  const { scale, setScale } = useUIScale();
  const { isSignedIn, email, walletAddress, login, logout } = useAuthSession();

  // Scale is client-only (persisted/auto-detected). Gate on mount so SSR (100)
  // matches the first client render, then swap to the real value — avoids hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const displayScale = mounted ? scale : 100;

  const [gameSettings, setGameSettings] = useState({
    visualQuality: 'high',
    gameSpeed: 'normal',
    animations: true,
    language: 'english',
  });

  const handleGameSettingChange = (key: string, value: unknown) => {
    setGameSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopyWallet = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      toast.success('Wallet address copied');
    } catch {
      toast.error('Could not copy address');
    }
  };

  const handleSignOut = async () => {
    await logout();
    toast.success('Signed out');
  };

  const refreshImageAssets = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }

      if ('indexedDB' in window) {
        const dbs = await indexedDB.databases?.();
        if (dbs) {
          dbs.forEach((db) => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        }
      }

      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.includes('image') || key.includes('card') || key.includes('asset')) {
          localStorage.removeItem(key);
        }
      });

      toast.success('Image assets cache cleared! Refreshing...');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch {
      toast.error('Failed to refresh assets');
    }
  };

  return (
    <div className="min-h-dvh pb-28 pt-14">
      <div className="mx-auto w-full max-w-md px-4">
        <h1 className="px-1 pt-4 text-[26px] font-bold tracking-tight text-slate-900">Settings</h1>

        <Section label="Audio">
          <div>
            <Row>
              <span className="text-sm font-medium text-slate-900">Music</span>
              <Toggle checked={musicEnabled} onChange={toggleMusic} label="Music" />
            </Row>
            {musicEnabled && (
              <VolumeSlider label="Music volume" value={musicVolume} onChange={setMusicVolume} />
            )}
          </div>
          <div>
            <Row>
              <span className="text-sm font-medium text-slate-900">Sound effects</span>
              <Toggle checked={sfxEnabled} onChange={toggleSfx} label="Sound effects" />
            </Row>
            {sfxEnabled && (
              <VolumeSlider label="Effects volume" value={sfxVolume} onChange={setSfxVolume} />
            )}
          </div>
        </Section>

        <Section label="Display">
          <div className="px-4 py-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-slate-900">Interface size</span>
              <span className="font-mono text-xs tabular-nums text-orange-600">{displayScale}%</span>
            </div>
            <input
              type="range"
              min="25"
              max="125"
              step="5"
              value={displayScale}
              aria-label="Interface size"
              onChange={(e) => setScale(parseInt(e.target.value))}
              className="mt-3 h-1.5 w-full cursor-pointer accent-orange-500"
            />
            <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
              <span>Smaller</span>
              <span>Larger</span>
            </div>
          </div>
          <Row>
            <span className="text-sm font-medium text-slate-900">Animations</span>
            <Toggle
              checked={gameSettings.animations}
              onChange={() => handleGameSettingChange('animations', !gameSettings.animations)}
              label="Animations"
            />
          </Row>
          <SelectRow
            label="Visual quality"
            value={gameSettings.visualQuality}
            onChange={(v) => handleGameSettingChange('visualQuality', v)}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
          />
        </Section>

        <Section label="Game">
          <SelectRow
            label="Game speed"
            value={gameSettings.gameSpeed}
            onChange={(v) => handleGameSettingChange('gameSpeed', v)}
            options={[
              { value: 'slow', label: 'Slow' },
              { value: 'normal', label: 'Normal' },
              { value: 'fast', label: 'Fast' },
            ]}
          />
          <SelectRow
            label="Language"
            value={gameSettings.language}
            onChange={(v) => handleGameSettingChange('language', v)}
            options={[
              { value: 'english', label: 'English' },
              { value: 'japanese', label: 'Japanese' },
              { value: 'chinese', label: 'Chinese' },
              { value: 'spanish', label: 'Spanish' },
            ]}
          />
        </Section>

        <Section label="More">
          <LinkRow
            icon={<Trophy size={18} strokeWidth={1.75} />}
            label="Achievements"
            onClick={() => router.push('/achievements')}
          />
          <LinkRow
            icon={<BookOpen size={18} strokeWidth={1.75} />}
            label="Tutorial"
            onClick={() => router.push('/tutorial')}
          />
          <LinkRow
            icon={<RefreshCw size={18} strokeWidth={1.75} />}
            label="Refresh image assets"
            onClick={refreshImageAssets}
          />
        </Section>

        <Section label="Account">
          {isSignedIn ? (
            <>
              {email && (
                <Row>
                  <span className="shrink-0 text-sm font-medium text-slate-900">Email</span>
                  <span className="truncate text-sm text-slate-500">{email}</span>
                </Row>
              )}
              {walletAddress && (
                <Row>
                  <span className="text-sm font-medium text-slate-900">Wallet</span>
                  <button
                    type="button"
                    onClick={handleCopyWallet}
                    className="-m-2 flex min-h-[44px] items-center gap-2 rounded-lg p-2 text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                  >
                    <span className="font-mono text-xs">
                      {walletAddress.slice(0, 4)}…{walletAddress.slice(-4)}
                    </span>
                    <Copy size={14} />
                  </button>
                </Row>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="flex min-h-[52px] w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-red-600 transition-colors last:rounded-b-2xl hover:bg-slate-900/[0.03] active:bg-slate-900/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400"
              >
                <LogOut size={18} strokeWidth={1.75} />
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={login}
              className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-4 py-2 text-left text-sm font-medium text-orange-600 transition-colors hover:bg-slate-900/[0.03] active:bg-slate-900/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400"
            >
              <LogIn size={18} strokeWidth={1.75} />
              Sign in
            </button>
          )}
        </Section>
      </div>
    </div>
  );
}
