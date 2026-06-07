"use client"

import React, { useCallback, useEffect, useRef } from 'react';
import type { MotionValue } from 'framer-motion';
import type gsap from 'gsap';
import { tweenMotionValue } from './tweenMotionValue';
import { clampTearProgress, resolveTearRelease } from './tearLogic';

interface TearGestureOverlayProps {
  tearProgress: MotionValue<number>;
  enabled: boolean;
  onTearStart: () => void;
  onTearComplete: () => void;
  onTearReset: () => void;
}

/** Invisible drag zone over the crimp strip of the approached pack, ~mid-screen band. */
export function TearGestureOverlay({
  tearProgress,
  enabled,
  onTearStart,
  onTearComplete,
  onTearReset,
}: TearGestureOverlayProps) {
  const startX = useRef<number | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // the component can unmount mid-tween (fallback swap) — kill the live tween
  useEffect(() => {
    return () => {
      tweenRef.current?.kill();
    };
  }, []);

  const finish = useCallback(() => {
    if (startX.current === null) return;
    startX.current = null;
    if (resolveTearRelease(tearProgress.get()) === 'complete') {
      tweenRef.current = tweenMotionValue(tearProgress, 1, { duration: 0.12, ease: 'power2.out' });
      onTearComplete();
    } else {
      // elastic settle reads as the foil snapping back
      tweenRef.current = tweenMotionValue(tearProgress, 0, {
        duration: 0.7,
        ease: 'elastic.out(1, 0.45)',
      });
      onTearReset();
    }
  }, [tearProgress, onTearComplete, onTearReset]);

  if (!enabled) return null;

  return (
    <div
      ref={zoneRef}
      className="absolute inset-x-0 top-[30%] h-[35%] z-10 touch-none cursor-grab active:cursor-grabbing"
      onPointerDown={(e) => {
        startX.current = e.clientX;
        e.currentTarget.setPointerCapture(e.pointerId);
        onTearStart();
      }}
      onPointerMove={(e) => {
        if (startX.current === null || !zoneRef.current) return;
        tearProgress.set(
          clampTearProgress(e.clientX - startX.current, zoneRef.current.offsetWidth)
        );
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
    />
  );
}
