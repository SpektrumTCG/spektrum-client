"use client"

import React, { useCallback, useRef } from 'react';
import { animate, type MotionValue } from 'framer-motion';
import { clampTearProgress, resolveTearRelease } from './tearLogic';

interface TearGestureOverlayProps {
  tearProgress: MotionValue<number>;
  enabled: boolean;
  onTearStart: () => void;
  onTearComplete: () => void;
  onTearReset: () => void;
}

/** Invisible drag zone over the crimp strip (top third of the canvas). */
export function TearGestureOverlay({
  tearProgress,
  enabled,
  onTearStart,
  onTearComplete,
  onTearReset,
}: TearGestureOverlayProps) {
  const startX = useRef<number | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);

  const finish = useCallback(() => {
    if (startX.current === null) return;
    startX.current = null;
    if (resolveTearRelease(tearProgress.get()) === 'complete') {
      animate(tearProgress, 1, { duration: 0.15, ease: 'easeOut' });
      onTearComplete();
    } else {
      animate(tearProgress, 0, { type: 'spring', stiffness: 400, damping: 30 });
      onTearReset();
    }
  }, [tearProgress, onTearComplete, onTearReset]);

  if (!enabled) return null;

  return (
    <div
      ref={zoneRef}
      className="absolute inset-x-0 top-0 h-1/3 z-10 touch-none cursor-grab active:cursor-grabbing"
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
