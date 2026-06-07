"use client"

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { cardProgress, ejectPose, EJECT_START_Y, EJECT_START_Z } from './ejectionPath';

interface CardEjectionProps {
  count: number;
  active: boolean;
  onComplete: () => void;
}

/** Card-back planes rise from the pack mouth and converge into a centered stack. */
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
      const t = cardProgress(elapsed, i);
      if (t < 1) allDone = false;
      const pose = ejectPose(t, i, count);
      g.visible = pose.visible;
      g.position.set(pose.x, pose.y, pose.z);
      g.rotation.z = pose.rotZ;
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
          position={[0, EJECT_START_Y, EJECT_START_Z]}
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
