"use client"

import { useFrame } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';

/**
 * Drives the camera during the approach: dolly forward (9 → 6.25) and rise
 * (0 → 1.4) so the pack appears lower with its top edge just above mid-screen
 * (Pocket-style). The GLB pack is ~2.7 world units wide — stopping at 6.25
 * keeps it ~85% of the canvas width so it never crops at the canvas bounds.
 * Moving the camera (not the pack) keeps the world-space clipping planes and
 * tear-shader uniforms valid.
 */
export const CAM_APPROACH_DY = 0.6;  // camera rises → pack appears lower
export const CAM_APPROACH_DZ = 2.75; // camera advances 9 → 6.25

export function CameraRig({ approach }: { approach: MotionValue<number> }) {
  useFrame(({ camera }) => {
    const a = approach.get();
    camera.position.y = a * CAM_APPROACH_DY;
    camera.position.z = 9 - a * CAM_APPROACH_DZ;
  });
  return null;
}
