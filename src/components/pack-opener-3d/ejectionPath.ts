export const EJECT_DURATION = 0.7; // seconds per card
export const STAGGER = 0.12;       // seconds between cards

export const STACK_TILT = 0.035;   // rad ≈ 2°, matches the 2D `rotate: depth * 2`
export const STACK_Z_GAP = 0.012;  // per-card depth so card 0 lands on top

/** Pack mouth (pack is static; the CAMERA moved to [0, 1.25, 4]). */
export const EJECT_START_Y = 1.3;
export const EJECT_START_Z = 0.15;

/**
 * End-frame stack centered in the approached camera's view: y at camera
 * height (CAM_APPROACH_DY), z at distance 2.6 from the camera so a 1-unit
 * plane spans ~75% of the canvas width (matches the 288px 2D card).
 */
export const STACK_Y = 1.25;
export const STACK_Z = 1.4;

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
 * converge into a centered stack in the approached camera's view (second
 * half). The end frame approximates the 2D CardRevealStack so the crossfade
 * reads as a match-cut.
 *
 * Sanity check (t=1):
 *   y = EJECT_START_Y + 0.9 - 0.95 = 1.3 + 0.9 - 0.95 = 1.25 = STACK_Y  ✓ centered
 *   z = EJECT_START_Z + (STACK_Z - EJECT_START_Z) + gap·(count-1-index)
 *     = STACK_Z + gap·(count-1-index)                                   ✓ stack depth
 * Rise peak (converge=0, rise=1):
 *   y_peak = EJECT_START_Y + 0.9 = 2.2 — briefly above the visible top
 *   edge, reads as "burst out"                                          ✓
 */
export function ejectPose(t: number, index: number, count: number): EjectPose {
  const e = easeOutCubic(t);
  const rise = Math.min(1, e / 0.5);
  const converge = Math.max(0, (e - 0.5) / 0.5);
  const tilt = (index - (count - 1) / 2) * STACK_TILT;
  return {
    x: 0,
    y: EJECT_START_Y + rise * 0.9 - converge * 0.95,
    z: EJECT_START_Z + converge * (STACK_Z - EJECT_START_Z) + (count - 1 - index) * STACK_Z_GAP * converge,
    rotZ: tilt * converge,
    visible: t > 0,
  };
}
