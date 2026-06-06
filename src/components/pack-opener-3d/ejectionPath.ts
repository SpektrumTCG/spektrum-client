export const EJECT_DURATION = 0.7; // seconds per card
export const STAGGER = 0.12;       // seconds between cards

/** End-frame stack tuned to match the 2D CardRevealStack (camera z=6, fov 40). */
export const STACK_Z = 1.3;
export const STACK_TILT = 0.035;   // rad ≈ 2°, matches the 2D `rotate: depth * 2`
export const STACK_Z_GAP = 0.012;  // per-card depth so card 0 lands on top

export interface EjectPose {
  x: number;
  y: number;
  z: number;
  rotZ: number;
  visible: boolean;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function cardProgress(elapsed: number, index: number): number {
  return Math.min(1, Math.max(0, (elapsed - index * STAGGER) / EJECT_DURATION));
}

/**
 * Two-beat path: rise out of the pack mouth (first half of the ease), then
 * converge into a centered stack facing the camera (second half). The end
 * frame approximates the 2D CardRevealStack so the crossfade reads as a
 * match-cut.
 */
export function ejectPose(t: number, index: number, count: number): EjectPose {
  const e = easeOutCubic(t);
  const rise = Math.min(1, e / 0.5);
  const converge = Math.max(0, (e - 0.5) / 0.5);
  const tilt = (index - (count - 1) / 2) * STACK_TILT;
  return {
    x: 0,
    y: -0.4 + rise * 2.2 - converge * 1.8,
    z: 0.1 + converge * (STACK_Z - 0.1) + (count - 1 - index) * STACK_Z_GAP * converge,
    rotZ: tilt * converge,
    visible: t > 0,
  };
}
