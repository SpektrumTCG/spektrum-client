"use client"

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { animate, useMotionValue } from 'framer-motion';
import { SpektrumPackOpener, type PackCard } from '@/components/shared/SpektrumPackOpener';
import { canTransition, type OpenerStage } from './openerStages';
import { useWebGLSupport } from './useWebGLSupport';
import { PackScene } from './PackScene';
import { BoosterPackModel } from './BoosterPackModel';
import { CardEjection } from './CardEjection';
import { TearGestureOverlay } from './TearGestureOverlay';

const LOAD_TIMEOUT_MS = 3000;

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

/** Mounts only once Suspense resolves — signals the GLB finished loading. */
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

  // Handoff: cards flew to camera → existing flip-reveal takes over
  if (stage === 'reveal') {
    return (
      <SpektrumPackOpener
        packImageUrl={packImageUrl}
        packName={packName}
        cards={cards}
        onAnimationComplete={onAnimationComplete}
        initialStage="flipping"
      />
    );
  }

  const interactive = stage === 'idle' || stage === 'tearing';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 overflow-hidden">
      <div className="relative w-full max-w-sm h-[70vh]">
        <PackErrorBoundary onError={handleFail}>
          <Suspense fallback={null}>
            <PackScene>
              <BoosterPackModel tearProgress={tearProgress} topFly={topFly} />
              <CardEjection
                count={cards.length}
                active={stage === 'ejecting'}
                onComplete={handleEjectComplete}
              />
            </PackScene>
            <ModelReady onReady={handleModelReady} />
          </Suspense>
        </PackErrorBoundary>

        {!modelReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-400 border-t-transparent" />
          </div>
        )}

        <TearGestureOverlay
          tearProgress={tearProgress}
          enabled={interactive && modelReady}
          onTearStart={() => setStage('tearing')}
          onTearComplete={handleTearComplete}
          onTearReset={() => setStage('idle')}
        />

        {interactive && modelReady && (
          <p className="absolute top-4 inset-x-0 text-center text-orange-300 text-sm animate-pulse pointer-events-none">
            Slide the top strip to tear open →
          </p>
        )}
      </div>
    </div>
  );
}
