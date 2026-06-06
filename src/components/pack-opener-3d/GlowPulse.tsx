"use client"

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

function makeRadialTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/** Soft additive glow pulsing behind the pack while it waits to be torn. */
export function GlowPulse({ active }: { active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  // useState lazy initializer keeps document.createElement out of render body
  // (pure-function constraint) and ensures a stable identity across renders
  const [texture] = useState<THREE.Texture>(() => makeRadialTexture());

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock }, delta) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    const t = clock.getElapsedTime();
    const target = active ? 0.35 + Math.sin(t * 2.2) * 0.18 : 0;
    // frame-rate-independent exponential ease (≈0.1/frame at 60fps)
    mat.opacity += (target - mat.opacity) * Math.min(1, delta * 6);
    ref.current.visible = mat.opacity > 0.01; // skip draw call once faded out
    ref.current.scale.setScalar(4 + Math.sin(t * 2.2) * 0.3);
  });

  return (
    <mesh ref={ref} position={[0, 0, -1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        color="#fb923c"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
