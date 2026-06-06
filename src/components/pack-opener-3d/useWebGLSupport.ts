"use client"

import { useState } from 'react';

export function isWebGLAvailable(
  createCanvas: () => HTMLCanvasElement = () => document.createElement('canvas')
): boolean {
  try {
    const canvas = createCanvas();
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Checked once on mount; the opener only renders client-side after user action. */
export function useWebGLSupport(): boolean {
  const [supported] = useState(
    () => typeof window !== 'undefined' && isWebGLAvailable()
  );
  return supported;
}
