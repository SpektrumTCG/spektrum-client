"use client"

import { useFrame } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';

/**
 * Drives the camera during the approach: dolly forward and rise so the pack
 * ends bottom-anchored with its top half filling the view (Pocket-style).
 * Moving the camera (not the pack) keeps the world-space clipping planes and
 * tear-shader uniforms valid.
 */
export const CAM_APPROACH_DY = 1.25; // camera rises → pack appears lower
export const CAM_APPROACH_DZ = 2.0;  // camera advances 6 → 4

export function CameraRig({ approach }: { approach: MotionValue<number> }) {
  useFrame(({ camera }) => {
    const a = approach.get();
    camera.position.y = a * CAM_APPROACH_DY;
    camera.position.z = 6 - a * CAM_APPROACH_DZ;
  });
  return null;
}
