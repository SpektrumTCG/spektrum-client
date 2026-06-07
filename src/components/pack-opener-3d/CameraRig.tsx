"use client"

import { useFrame } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';

/**
 * Drives the camera during the approach: dolly forward (9 → 4.3) and rise
 * (0 → 1.4) so the pack appears lower with its top edge just above mid-screen
 * (Pocket-style). Moving the camera (not the pack) keeps the world-space
 * clipping planes and tear-shader uniforms valid.
 */
export const CAM_APPROACH_DY = 1.4; // camera rises → pack appears lower
export const CAM_APPROACH_DZ = 4.7; // camera advances 9 → 4.3

export function CameraRig({ approach }: { approach: MotionValue<number> }) {
  useFrame(({ camera }) => {
    const a = approach.get();
    camera.position.y = a * CAM_APPROACH_DY;
    camera.position.z = 9 - a * CAM_APPROACH_DZ;
  });
  return null;
}
