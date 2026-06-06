export const TEAR_THRESHOLD = 0.7;

/** Fraction of overlay width a full tear requires. */
export const TEAR_TRACK_FRACTION = 0.6;

export type TearRelease = 'complete' | 'reset';

/** Decide what happens when the user releases the crimp strip. */
export function resolveTearRelease(progress: number): TearRelease {
  return progress >= TEAR_THRESHOLD ? 'complete' : 'reset';
}

/** Map horizontal drag distance (px) to tear progress 0..1. */
export function clampTearProgress(deltaX: number, trackWidth: number): number {
  if (trackWidth <= 0) return 0;
  const progress = deltaX / (trackWidth * TEAR_TRACK_FRACTION);
  return Math.min(1, Math.max(0, progress));
}
