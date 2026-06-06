"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';
import { useGLTF, useTexture } from '@react-three/drei';
import { SpektrumPackOpener } from '@/components/shared/SpektrumPackOpener';
import { type PackCard } from '@/components/shared/rarityStyles';
import { CardRevealStack } from '@/components/shared/CardRevealStack';
import { canTransition, type OpenerStage } from './openerStages';
import { useWebGLSupport } from './useWebGLSupport';
import { PackScene } from './PackScene';
import { BoosterPackModel, PACK_MODEL_URL } from './BoosterPackModel';
import { CardEjection } from './CardEjection';
import { TearGestureOverlay } from './TearGestureOverlay';

const LOAD_TIMEOUT_MS = 3000;

/**
 * Warm the 3D assets while the user reads the confirm modal — call on user
 * intent (e.g. tapping "Open"). Importing this module also pulls the
 * three.js chunk, so a dynamic `import()` of this file is the whole warm-up.
 */
export function preloadPackOpenerAssets() {
  useGLTF.preload(PACK_MODEL_URL);
  useTexture.preload('/cards/card_back.png');
}

interface PackOpener3DProps {
  packImageUrl: string;
  packName: string;
  cards: PackCard[];
  onAnimationComplete: () => void;
}

interface BoundaryProps {
  onError: () => void;
  children: React.ReactNode;
}

/** Catches useGLTF load failures (404, parse error) → CSS fallback. */
class PackErrorBoundary extends React.Component<BoundaryProps, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.warn('3D pack opener failed, falling back to CSS opener:', error.message);
    this.props.onError();
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/**
 * Rendered INSIDE the Canvas, after the asset-loading siblings, within
 * PackScene's internal Suspense — mounts only once all 3D assets resolved.
 * (useEffect works in R3F's reconciler.)
 */
function ModelReady({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

export function PackOpener3D({
  packImageUrl,
  packName,
  cards,
  onAnimationComplete,
}: PackOpener3DProps) {
  const webglSupported = useWebGLSupport();
  const [failed, setFailed] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [stage, setStageRaw] = useState<OpenerStage>('idle');
  const [canvasGone, setCanvasGone] = useState(false);
  const tearProgress = useMotionValue(0);
  const topFly = useMotionValue(0);
  const tearHandledRef = useRef(false);

  const setStage = useCallback((to: OpenerStage) => {
    setStageRaw((from) => (canTransition(from, to) ? to : from));
  }, []);

  // Slow load → fallback after 3s
  useEffect(() => {
    if (modelReady || failed) return;
    const t = setTimeout(() => setFailed(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [modelReady, failed]);

  const handleTearComplete = useCallback(() => {
    if (tearHandledRef.current) return; // double pointer-up → single tear
    tearHandledRef.current = true;
    setStage('torn');
    if (typeof navigator !== 'undefined') navigator.vibrate?.(40);
    animate(topFly, 1, { duration: 0.5, ease: 'easeIn' }).then(() => setStage('ejecting'));
  }, [setStage, topFly]);

  const handleModelReady = useCallback(() => setModelReady(true), []);
  const handleFail = useCallback(() => setFailed(true), []);
  const handleEjectComplete = useCallback(() => setStage('reveal'), [setStage]);

  // Fallback: no WebGL, load failed, or load timed out
  if (!webglSupported || failed) {
    return (
      <SpektrumPackOpener
        packImageUrl={packImageUrl}
        packName={packName}
        cards={cards}
        onAnimationComplete={onAnimationComplete}
      />
    );
  }

  const interactive = stage === 'idle' || stage === 'tearing';
  const revealing = stage === 'reveal';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 overflow-hidden">
      <div className="relative w-full max-w-sm h-[70vh]">
        {revealing && (
          <CardRevealStack cards={cards} onComplete={onAnimationComplete} />
        )}

        {/* Canvas stays mounted through the crossfade so the eject end frame
            fades over the matching 2D stack (match-cut), then unmounts. */}
        {!canvasGone && (
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: revealing ? 0 : 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onAnimationComplete={() => {
              if (revealing) setCanvasGone(true);
            }}
            style={{ pointerEvents: revealing ? 'none' : 'auto' }}
          >
            <PackErrorBoundary onError={handleFail}>
              <PackScene>
                <BoosterPackModel tearProgress={tearProgress} topFly={topFly} />
                <CardEjection
                  count={cards.length}
                  active={stage === 'ejecting'}
                  onComplete={handleEjectComplete}
                />
                <ModelReady onReady={handleModelReady} />
              </PackScene>
            </PackErrorBoundary>
          </motion.div>
        )}

        {!modelReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-400 border-t-transparent" />
          </div>
        )}

        {!revealing && (
          <TearGestureOverlay
            tearProgress={tearProgress}
            enabled={interactive && modelReady}
            onTearStart={() => setStage('tearing')}
            onTearComplete={handleTearComplete}
            onTearReset={() => setStage('idle')}
          />
        )}

        {interactive && modelReady && (
          <p className="absolute top-4 inset-x-0 text-center text-orange-300 text-sm animate-pulse pointer-events-none">
            Slide the top strip to tear open →
          </p>
        )}
      </div>
    </div>
  );
}
