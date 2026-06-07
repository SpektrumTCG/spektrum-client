"use client"

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import type { MotionValue } from 'framer-motion';
import { applyTearEdge, JAG_AMP, type TearEdgeUniforms } from './tearEdgeShader';

export const PACK_MODEL_URL = '/models/booster-pack.glb';

const PACK_HEIGHT = 3;                              // normalized world height
const TEAR_LINE = 0.88;                             // crimp starts at 88% of height
const TEAR_Y = PACK_HEIGHT * (TEAR_LINE - 0.5);     // world y of tear line (model centered)
const TEAR_TRAVEL_X = 2.2;                          // strip slide distance at progress 1
const APPROACH_Z = 2.0;                             // world units toward camera at approach=1 (Z-only: clip planes + tear shader use world Y)

interface PackArtDecalProps {
  packImageUrl: string;
  keepTop: boolean;
  packSize: THREE.Vector3;
}

/**
 * Tier artwork projected onto the pack front as a thin decal plane. Rendered
 * once per clipped half with the matching (jag-widened) clipping plane and the
 * same jagged-discard shader, so the crimp-strip slice of the artwork tears
 * and flies off with the strip.
 */
function PackArtDecal({ packImageUrl, keepTop, packSize }: PackArtDecalProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(packImageUrl, (tex) => {
    const t = Array.isArray(tex) ? tex[0] : tex;
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
  });

  const { material, uniforms } = useMemo(() => {
    const plane = keepTop
      ? new THREE.Plane(new THREE.Vector3(0, 1, 0), -(TEAR_Y - JAG_AMP))
      : new THREE.Plane(new THREE.Vector3(0, -1, 0), TEAR_Y + JAG_AMP);
    const m = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      clippingPlanes: [plane],
      metalness: 0.4,
      roughness: 0.35,
      envMapIntensity: 1.0,
    });
    const u = applyTearEdge(m, keepTop, TEAR_Y);
    return { material: m, uniforms: u };
  }, [texture, keepTop]);

  useEffect(() => () => material.dispose(), [material]);

  // hold the shader uniforms in a ref so the useFrame closure mutates a
  // mutable container (matches the ref-mutation idiom used for transforms)
  const uniformsRef = useRef(uniforms);
  useEffect(() => {
    uniformsRef.current = uniforms;
  }, [uniforms]);

  useFrame(() => {
    if (!keepTop || !meshRef.current) return;
    // top decal sits inside topRef's group — track that group's transform
    const parent = meshRef.current.parent;
    if (parent) {
      uniformsRef.current.uTearY.value = TEAR_Y + parent.position.y;
      uniformsRef.current.uOffsetX.value = parent.position.x;
    }
  });

  return (
    <mesh ref={meshRef} material={material} position={[0, 0, packSize.z / 2 + 0.012]}>
      <planeGeometry args={[packSize.x * 0.94, PACK_HEIGHT * 0.97]} />
    </mesh>
  );
}

interface BoosterPackModelProps {
  tearProgress: MotionValue<number>; // 0..1, gesture-driven
  topFly: MotionValue<number>;       // 0..1, torn-stage fly-off
  approach: MotionValue<number>;     // 0..1, tap-to-approach toward camera (Z-only)
  packImageUrl: string;
}

/**
 * Approach A (spec): same GLB rendered twice, world-space clipping planes split
 * it into crimp strip (top ~12%) and body. Planes stay fixed in world space, so
 * the strip's tear edge holds while it slides sideways/up and away.
 */
function useClippedPack(keepTop: boolean): { root: THREE.Group; tearUniforms: TearEdgeUniforms[] } {
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

    // Planes widened by JAG_AMP: the jagged shader discard owns the visible
    // edge; the plane is just a safety clip beyond the jag band.
    const plane = keepTop
      ? new THREE.Plane(new THREE.Vector3(0, 1, 0), -(TEAR_Y - JAG_AMP))
      : new THREE.Plane(new THREE.Vector3(0, -1, 0), TEAR_Y + JAG_AMP);

    const tearUniforms: TearEdgeUniforms[] = [];

    root.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mats = (Array.isArray(obj.material) ? obj.material : [obj.material]).map(
          (m: THREE.Material) => {
            const clone = m.clone();
            clone.clippingPlanes = [plane];
            clone.side = THREE.DoubleSide; // show interior at the cut
            if (clone instanceof THREE.MeshStandardMaterial) {
              // foil finish — reflects the PMREM room environment (PackScene)
              clone.metalness = 0.6;
              clone.roughness = 0.25;
              clone.envMapIntensity = 1.2;
            }
            tearUniforms.push(applyTearEdge(clone, keepTop, TEAR_Y));
            return clone;
          }
        );
        obj.material = Array.isArray(obj.material) ? mats : mats[0];
      }
    });
    return { root, tearUniforms };
  }, [scene, keepTop]);
}

export function BoosterPackModel({ tearProgress, topFly, approach, packImageUrl }: BoosterPackModelProps) {
  const wobbleRef = useRef<THREE.Group>(null);
  const topRef = useRef<THREE.Group>(null);
  const { root: body } = useClippedPack(false);
  const { root: top, tearUniforms: topUniforms } = useClippedPack(true);
  // hold the strip's shader uniforms in a ref so useFrame mutates a mutable
  // container (matches the ref-mutation idiom used for transforms below)
  const topUniformsRef = useRef(topUniforms);
  useEffect(() => {
    topUniformsRef.current = topUniforms;
  }, [topUniforms]);

  // full pack bounds (clipping is shader-level, Box3 sees the whole mesh)
  const packSize = useMemo(
    () => new THREE.Box3().setFromObject(body).getSize(new THREE.Vector3()),
    [body]
  );

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
      // tap-to-approach: move toward camera (Z-only — Y/rotation would break
      // the world-space clip planes + jagged tear shader)
      wobbleRef.current.position.z = approach.get() * APPROACH_Z;
    }
    if (topRef.current) {
      topRef.current.position.x = p * TEAR_TRAVEL_X + f * 4;
      topRef.current.position.y = f * 3;
      topRef.current.rotation.z = -p * 0.12 - f * 1.2;
      topRef.current.visible = f < 1;
      // keep the jag band glued to the strip as it slides (x) and flies (y)
      const uy = TEAR_Y + topRef.current.position.y;
      const ux = topRef.current.position.x;
      const us = topUniformsRef.current;
      for (let i = 0; i < us.length; i++) {
        us[i].uTearY.value = uy;
        us[i].uOffsetX.value = ux;
      }
    }
  });

  return (
    <group ref={wobbleRef}>
      <primitive object={body} />
      <PackArtDecal packImageUrl={packImageUrl} keepTop={false} packSize={packSize} />
      <group ref={topRef}>
        <primitive object={top} />
        <PackArtDecal packImageUrl={packImageUrl} keepTop={true} packSize={packSize} />
      </group>
    </group>
  );
}

// Note: no module-level useGLTF.preload — assets are warmed on user intent via
// preloadPackOpenerAssets() (PackOpener3D.tsx) so inventory visitors who never
// open a pack don't download the GLB.
