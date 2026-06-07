export const EJECT_DURATION = 0.7; // seconds per card
export const STAGGER = 0.12;       // seconds between cards

/**
 * End-frame stack tuned to match the 2D CardRevealStack (288px card in a
 * 384px column ⇒ 75% width ⇒ a 1-unit plane needs z≈3.4 with camera z=6/fov 40).
 */
export const STACK_Z = 3.4;
export const STACK_TILT = 0.035;   // rad ≈ 2°, matches the 2D `rotate: depth * 2`
export const STACK_Z_GAP = 0.012;  // per-card depth so card 0 lands on top

/** Pack mouth at the approached pack position (APPROACH_Z = 2.0). */
export const EJECT_START_Y = 0.6;
export const EJECT_START_Z = 2.1;

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
 *
 * Sanity check (t=1):
 *   y = EJECT_START_Y + 1.4 - 2.0 = 0.6 + 1.4 - 2.0 = 0   ✓ centered
 *   z = EJECT_START_Z + (STACK_Z - EJECT_START_Z) + gap·(count-1-index)
 *     = STACK_Z + gap·(count-1-index)                         ✓ stack depth
 * Rise peak (converge=0, rise=1):
 *   y_peak = EJECT_START_Y + 1.4 = 2.0 above pack mouth      ✓
 */
export function ejectPose(t: number, index: number, count: number): EjectPose {
  const e = easeOutCubic(t);
  const rise = Math.min(1, e / 0.5);
  const converge = Math.max(0, (e - 0.5) / 0.5);
  const tilt = (index - (count - 1) / 2) * STACK_TILT;
  return {
    x: 0,
    y: EJECT_START_Y + rise * 1.4 - converge * 2.0,
    z: EJECT_START_Z + converge * (STACK_Z - EJECT_START_Z) + (count - 1 - index) * STACK_Z_GAP * converge,
    rotZ: tilt * converge,
    visible: t > 0,
  };
}
