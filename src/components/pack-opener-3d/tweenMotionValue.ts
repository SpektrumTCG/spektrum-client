import gsap from 'gsap';
import type { MotionValue } from 'framer-motion';

/**
 * Drive a framer MotionValue with a GSAP tween. Keeps the MotionValue API for
 * consumers (R3F useFrame readers) while choreography gains GSAP's eases and
 * timeline composition. Returns the tween so callers can compose or kill it.
 */
export function tweenMotionValue(
  mv: MotionValue<number>,
  to: number,
  vars: gsap.TweenVars = {}
): gsap.core.Tween {
  const proxy = { v: mv.get() };
  return gsap.to(proxy, {
    v: to,
    ...vars,
    onUpdate() {
      mv.set(proxy.v);
    },
  });
}
