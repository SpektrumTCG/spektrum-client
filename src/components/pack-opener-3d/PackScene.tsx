"use client"

import React, { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';

/** Sweeping light gives the foil an idle shimmer. */
function SweepLight() {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.x = Math.sin(clock.getElapsedTime() * 0.8) * 4;
    }
  });
  return <pointLight ref={ref} position={[0, 1, 3]} intensity={6} />;
}

export function PackScene({ children }: { children: React.ReactNode }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ localClippingEnabled: true, antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <directionalLight position={[-4, 2, 2]} intensity={0.5} color="#fb923c" />
      <SweepLight />
      {/* Suspense INSIDE the Canvas: asset loading must never suspend the Canvas
          itself. If it bubbles up, React hides + re-shows the subtree, R3F tears
          down the renderer (forceContextLoss) and recreates it on the same canvas
          element whose context is now permanently lost → blank screen. */}
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
