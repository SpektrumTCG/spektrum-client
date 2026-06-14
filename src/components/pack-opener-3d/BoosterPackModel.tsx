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
const DROP_DISTANCE = 3.5;                          // body slides this far down once torn (clears the approached view)

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
    if (!meshRef.current) return;
    // each decal sits inside its half's moving group (topRef / bodyRef) — track
    // that group's transform so the jag band stays glued as the half moves
    const parent = meshRef.current.parent;
    if (parent) {
      uniformsRef.current.uTearY.value = TEAR_Y + parent.position.y;
      uniformsRef.current.uOffsetX.value = parent.position.x;
    }
  });

  return (
    <mesh ref={meshRef} material={material} position={[0, 0, packSize.z / 2 + 0.012]}>
      {/* Over-scale slightly so the art's body bleeds to the pack edges and the
          GLB base never peeks through as a white border. */}
      <planeGeometry args={[packSize.x * 1.16, PACK_HEIGHT * 1.12]} />
    </mesh>
  );
}

interface BoosterPackModelProps {
  tearProgress: MotionValue<number>; // 0..1, gesture-driven
  topFly: MotionValue<number>;       // 0..1, torn-stage fly-off
  packDrop: MotionValue<number>;     // 0..1, body drops away after the tear
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
              // Tint the base into a dark foil so the pack's curved side edges
              // read as a subtle metallic rim — not white plastic, not flat black.
              clone.color = new THREE.Color('#2a2730');
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

export function BoosterPackModel({ tearProgress, topFly, packDrop, packImageUrl }: BoosterPackModelProps) {
  const wobbleRef = useRef<THREE.Group>(null);
  const topRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const tearSmoothRef = useRef(0);
  const { root: body, tearUniforms: bodyUniforms } = useClippedPack(false);
  const { root: top, tearUniforms: topUniforms } = useClippedPack(true);
  // hold each half's shader uniforms in a ref so useFrame mutates a mutable
  // container (matches the ref-mutation idiom used for transforms below)
  const topUniformsRef = useRef(topUniforms);
  useEffect(() => {
    topUniformsRef.current = topUniforms;
  }, [topUniforms]);
  const bodyUniformsRef = useRef(bodyUniforms);
  useEffect(() => {
    bodyUniformsRef.current = bodyUniforms;
  }, [bodyUniforms]);

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

  useFrame(({ clock }, delta) => {
    const target = tearProgress.get();
    // critically-damped follower kills pointer jitter without adding lag at rest
    tearSmoothRef.current += (target - tearSmoothRef.current) * Math.min(1, delta * 22);
    if (Math.abs(target - tearSmoothRef.current) < 0.001) tearSmoothRef.current = target;
    const p = tearSmoothRef.current;
    const f = topFly.get();
    const t = clock.getElapsedTime();

    if (wobbleRef.current) {
      // idle wobble, damped once interaction starts
      const damp = (1 - p) * (1 - f);
      wobbleRef.current.rotation.z = Math.sin(t * 1.6) * 0.03 * damp;
      wobbleRef.current.rotation.y = Math.sin(t * 0.9) * 0.08 * damp;
    }
    if (bodyRef.current) {
      bodyRef.current.position.y = -packDrop.get() * DROP_DISTANCE;
      // cut follows the dropping body so geometry above the tear stays hidden
      const us = bodyUniformsRef.current;
      for (let i = 0; i < us.length; i++) {
        us[i].uTearY.value = TEAR_Y + bodyRef.current.position.y;
      }
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
      <group ref={bodyRef}>
        <primitive object={body} />
        <PackArtDecal packImageUrl={packImageUrl} keepTop={false} packSize={packSize} />
      </group>
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
