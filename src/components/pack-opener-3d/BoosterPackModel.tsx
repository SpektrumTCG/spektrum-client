"use client"

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import type { MotionValue } from 'framer-motion';

export const PACK_MODEL_URL = '/models/booster-pack.glb';

const PACK_HEIGHT = 3;                              // normalized world height
const TEAR_LINE = 0.88;                             // crimp starts at 88% of height
const TEAR_Y = PACK_HEIGHT * (TEAR_LINE - 0.5);     // world y of tear line (model centered)
const TEAR_TRAVEL_X = 2.2;                          // strip slide distance at progress 1

interface BoosterPackModelProps {
  tearProgress: MotionValue<number>; // 0..1, gesture-driven
  topFly: MotionValue<number>;       // 0..1, torn-stage fly-off
}

/**
 * Approach A (spec): same GLB rendered twice, world-space clipping planes split
 * it into crimp strip (top ~12%) and body. Planes stay fixed in world space, so
 * the strip's tear edge holds while it slides sideways/up and away.
 */
function useClippedPack(keepTop: boolean): THREE.Group {
  const { scene } = useGLTF(PACK_MODEL_URL);
  return useMemo(() => {
    const root = scene.clone(true);

    // Normalize: scale to PACK_HEIGHT, center at origin.
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    // multiply into any baked root scale — setScalar would mis-size GLBs exported at scale ≠ 1
    root.scale.multiplyScalar(PACK_HEIGHT / size.y);
    const scaledBox = new THREE.Box3().setFromObject(root);
    root.position.sub(scaledBox.getCenter(new THREE.Vector3()));

    const plane = keepTop
      ? new THREE.Plane(new THREE.Vector3(0, 1, 0), -TEAR_Y)  // keep y > TEAR_Y
      : new THREE.Plane(new THREE.Vector3(0, -1, 0), TEAR_Y); // keep y < TEAR_Y

    root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mats = (Array.isArray(obj.material) ? obj.material : [obj.material]).map(
          (m: THREE.Material) => {
            const clone = m.clone();
            clone.clippingPlanes = [plane];
            clone.side = THREE.DoubleSide; // show interior at the cut
            return clone;
          }
        );
        obj.material = Array.isArray(obj.material) ? mats : mats[0];
      }
    });
    return root;
  }, [scene, keepTop]);
}

export function BoosterPackModel({ tearProgress, topFly }: BoosterPackModelProps) {
  const wobbleRef = useRef<THREE.Group>(null);
  const topRef = useRef<THREE.Group>(null);
  const body = useClippedPack(false);
  const top = useClippedPack(true);

  // cloned materials hold GPU resources — release on unmount
  useEffect(() => {
    return () => {
      for (const root of [body, top]) {
        root.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((m: THREE.Material) => m.dispose());
          }
        });
      }
    };
  }, [body, top]);

  useFrame(({ clock }) => {
    const p = tearProgress.get();
    const f = topFly.get();
    const t = clock.getElapsedTime();

    if (wobbleRef.current) {
      // idle wobble, damped once interaction starts
      const damp = (1 - p) * (1 - f);
      wobbleRef.current.rotation.z = Math.sin(t * 1.6) * 0.03 * damp;
      wobbleRef.current.rotation.y = Math.sin(t * 0.9) * 0.08 * damp;
    }
    if (topRef.current) {
      topRef.current.position.x = p * TEAR_TRAVEL_X + f * 4;
      topRef.current.position.y = f * 3;
      topRef.current.rotation.z = -p * 0.12 - f * 1.2;
      topRef.current.visible = f < 1;
    }
  });

  return (
    <group ref={wobbleRef}>
      <primitive object={body} />
      <group ref={topRef}>
        <primitive object={top} />
      </group>
    </group>
  );
}

// Note: no module-level useGLTF.preload — assets are warmed on user intent via
// preloadPackOpenerAssets() (PackOpener3D.tsx) so inventory visitors who never
// open a pack don't download the GLB.
