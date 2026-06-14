"use client"

import React, { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, MeshReflectorMaterial } from '@react-three/drei';
import { useMotionValue, type MotionValue } from 'framer-motion';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { X } from 'lucide-react';

// A true turntable ring: packs sit evenly around a circle, all facing outward,
// so the front pack faces the viewer and its neighbours curve away to the
// sides (Pokémon-Pocket style). Dragging spins the ring continuously.
const RING_R = 2.7;       // ring radius — larger = more gap between packs
const PACK_W = 1.7;
const PACK_H = PACK_W * (4 / 3);

/** Network-free PMREM room env so the foil + floor have something to reflect. */
function SceneEnvironment() {
  const getThree = useThree((s) => s.get);
  React.useEffect(() => {
    const { gl, scene } = getThree();
    const pmrem = new THREE.PMREMGenerator(gl);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    return () => {
      scene.environment = null;
      envTex.dispose();
      pmrem.dispose();
    };
  }, [getThree]);
  return null;
}

/**
 * Carousel state crosses the Canvas boundary as framer MotionValues — they're
 * mutated through `.set()` (a method call), which the react-compiler
 * immutability rule allows, unlike assigning to a prop ref's properties.
 */
function Carousel({
  texture,
  count,
  active,
  target,
}: {
  texture: THREE.Texture;
  count: number;
  active: MotionValue<number>;
  target: MotionValue<number>;
}) {
  const groups = useRef<(THREE.Group | null)[]>([]);
  const indices = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

  useFrame(({ clock }) => {
    // ease the centre toward its snap target
    const a = active.get() + (target.get() - active.get()) * 0.15;
    active.set(a);
    const t = clock.getElapsedTime();
    const step = (Math.PI * 2) / Math.max(count, 1); // even spacing around the ring

    for (let i = 0; i < groups.current.length; i++) {
      const g = groups.current[i];
      if (!g) continue;
      const theta = (i - a) * step;          // 0 = front, facing the camera
      g.position.set(Math.sin(theta) * RING_R, 0, Math.cos(theta) * RING_R);
      g.rotation.y = theta;                  // face radially outward → front faces viewer
      const front = Math.cos(theta);         // 1 at the front, -1 at the back
      const pulse = front > 0.9 ? 1 + Math.sin(t * 2) * 0.02 : 1; // front pack breathes
      g.scale.setScalar(pulse);
      const mesh = g.children[0] as THREE.Mesh;
      mesh.renderOrder = Math.round(front * 100); // front draws on top
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat) mat.opacity = THREE.MathUtils.clamp((front + 0.25) / 0.5, 0.06, 1); // fade the far side
    }
  });

  return (
    <group position={[0, 0.15, 0]}>
      {indices.map((i) => (
        <group key={i} ref={(el) => { groups.current[i] = el; }}>
          <mesh>
            <planeGeometry args={[PACK_W, PACK_H]} />
            <meshStandardMaterial
              map={texture}
              transparent
              roughness={0.45}
              metalness={0.25}
              envMapIntensity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ReflectiveFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -PACK_H / 2 - 0.05, 0]}>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        resolution={512}
        blur={[300, 90]}
        mixBlur={1}
        mixStrength={28}
        roughness={1}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#0e0e12"
        metalness={0.55}
      />
    </mesh>
  );
}

/** Texture load is isolated so it suspends INSIDE the Canvas, never the Canvas itself. */
function PackCarouselContent({
  packArt,
  count,
  active,
  target,
}: {
  packArt: string;
  count: number;
  active: MotionValue<number>;
  target: MotionValue<number>;
}) {
  const texture = useTexture(packArt);
  return (
    <>
      <Carousel texture={texture} count={count} active={active} target={target} />
      <ReflectiveFloor />
    </>
  );
}

interface PackCarousel3DProps {
  packArt: string;
  count: number;
  title: string;
  onOpenOne: () => void;
  onOpenAll: () => void;
  onClose: () => void;
}

/**
 * Pokémon-Pocket-style 3D carousel shown before a bundle is opened. The front
 * pack carries an OPEN button; OPEN ALL runs the whole bundle. DOM overlays
 * (title, buttons) sit above a transparent Canvas; the gradient lives in CSS so
 * the scene stays light on mobile-web.
 */
export function PackCarousel3D({
  packArt,
  count,
  title,
  onOpenOne,
  onOpenAll,
  onClose,
}: PackCarousel3DProps) {
  const active = useMotionValue(0);
  const target = useMotionValue(0);
  const dragRef = useRef<{ x: number; start: number; moved: boolean } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, start: target.get(), moved: false };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    target.set(d.start - dx / 120); // unbounded → the ring spins continuously
  };
  const handlePointerUp = () => {
    const d = dragRef.current;
    if (d) {
      target.set(Math.round(target.get())); // snap nearest pack to front
      if (!d.moved) onOpenOne();             // tap (no drag) = open the front pack
    }
    dragRef.current = null;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[radial-gradient(circle_at_50%_28%,#2a2730_0%,#16151c_55%,#0c0b10_100%)]">
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-gray-300 backdrop-blur transition-colors hover:text-white"
      >
        <X size={20} />
      </button>

      {/* Title */}
      <div className="absolute inset-x-0 top-14 z-20 px-6 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-white drop-shadow">{title}</h1>
        <p className="mt-1 text-sm text-orange-300">{count} sealed pack{count > 1 ? 's' : ''} remaining</p>
      </div>

      {/* 3D scene + drag surface */}
      <div
        className="absolute inset-0 touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Camera pulled well back: fov is vertical, so in a portrait viewport
            the horizontal field is ~half — distance keeps the front pack ~45%
            width and lets the side packs peek in. */}
        <Canvas camera={{ position: [0, 0.2, 14], fov: 36 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
          <ambientLight intensity={0.75} />
          <directionalLight position={[3, 5, 4]} intensity={1.3} />
          <directionalLight position={[-4, 2, 2]} intensity={0.5} color="#fb923c" />
          <SceneEnvironment />
          <Suspense fallback={null}>
            <PackCarouselContent packArt={packArt} count={count} active={active} target={target} />
          </Suspense>
        </Canvas>
      </div>

      {/* Tap a pack to open it, drag to spin. */}
      <p className="pointer-events-none absolute inset-x-0 bottom-40 z-20 text-center text-xs font-medium uppercase tracking-[0.18em] text-white/70">
        Tap a pack to open · drag to spin
      </p>

      {/* OPEN ALL */}
      <div className="absolute inset-x-0 bottom-24 z-20 flex justify-center px-6">
        <button
          type="button"
          onClick={onOpenAll}
          className="w-full max-w-xs rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 py-3.5 text-base font-bold uppercase tracking-wide text-white transition-colors hover:from-orange-500 hover:to-orange-600"
          style={{ boxShadow: '0 0 24px rgba(249,115,22,0.45)' }}
        >
          Open All ({count})
        </button>
      </div>
    </div>
  );
}
