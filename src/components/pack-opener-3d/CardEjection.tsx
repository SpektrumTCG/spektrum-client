"use client"

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

const EJECT_DURATION = 0.7; // seconds per card
const STAGGER = 0.12;       // seconds between cards

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface CardEjectionProps {
  count: number;
  active: boolean;
  onComplete: () => void;
}

/** Card-back planes rise from the pack mouth and fly toward the camera. */
export function CardEjection({ count, active, onComplete }: CardEjectionProps) {
  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const startRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const texture = useTexture('/cards/card_back.png');

  useFrame(({ clock }) => {
    if (!active || doneRef.current) return;
    if (startRef.current === null) startRef.current = clock.getElapsedTime();
    const elapsed = clock.getElapsedTime() - startRef.current;

    let allDone = true;
    for (let i = 0; i < count; i++) {
      const g = groupRefs.current[i];
      if (!g) continue;
      const t = Math.min(1, Math.max(0, (elapsed - i * STAGGER) / EJECT_DURATION));
      if (t < 1) allDone = false;
      const e = easeOutCubic(t);
      g.visible = t > 0;
      g.position.y = -0.4 + e * 2.6;
      g.position.z = 0.1 + e * 4.5; // toward camera at z=6
      g.position.x = (i - (count - 1) / 2) * 0.18 * e;
      g.rotation.z = (i - (count - 1) / 2) * 0.08 * e;
    }
    if (allDone && elapsed > 0) {
      doneRef.current = true;
      onComplete();
    }
  });

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <group
          key={i}
          ref={(el) => { groupRefs.current[i] = el; }}
          visible={false}
          position={[0, -0.4, 0.1]}
        >
          <mesh>
            <planeGeometry args={[1, 1.4]} />
            <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </>
  );
}
