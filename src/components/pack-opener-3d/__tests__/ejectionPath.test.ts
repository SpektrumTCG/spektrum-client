import { describe, expect, it } from 'vitest';
import {
  cardProgress,
  ejectPose,
  EJECT_DURATION,
  EJECT_START_Y,
  EJECT_START_Z,
  STACK_TILT,
  STACK_Z,
  STACK_Z_GAP,
  STAGGER,
} from '../ejectionPath';

describe('cardProgress', () => {
  it('staggers cards by STAGGER seconds', () => {
    expect(cardProgress(0, 0)).toBe(0);
    expect(cardProgress(STAGGER, 1)).toBe(0);
    expect(cardProgress(STAGGER + EJECT_DURATION, 1)).toBe(1);
  });

  it('clamps to [0, 1]', () => {
    expect(cardProgress(-1, 0)).toBe(0);
    expect(cardProgress(99, 0)).toBe(1);
  });
});

describe('ejectPose', () => {
  it('starts at the pack mouth, hidden', () => {
    const p = ejectPose(0, 0, 5);
    expect(p.visible).toBe(false);
    expect(p.y).toBeCloseTo(EJECT_START_Y);
    expect(p.z).toBeCloseTo(EJECT_START_Z);
  });

  it('ends centered at stack depth with its tilt', () => {
    const p = ejectPose(1, 2, 5); // middle card of 5 → tilt 0
    expect(p.x).toBe(0);
    expect(p.y).toBeCloseTo(0);
    expect(p.z).toBeCloseTo(STACK_Z + 2 * STACK_Z_GAP);
    expect(p.rotZ).toBeCloseTo(0);
  });

  it('tilts outer cards and z-orders card 0 on top', () => {
    const first = ejectPose(1, 0, 5);
    const last = ejectPose(1, 4, 5);
    expect(first.rotZ).toBeCloseTo(-2 * STACK_TILT);
    expect(last.rotZ).toBeCloseTo(2 * STACK_TILT);
    expect(first.z).toBeGreaterThan(last.z); // card 0 closest to camera = top
  });

  it('rises before it converges', () => {
    // At t=0.25: easeOutCubic(0.25) ≈ 0.578 → rise=1 (capped), converge≈0.156
    //   y = 0.6 + 1*1.4 − 0.156*2.0 ≈ 1.69  (well above EJECT_START_Y + 0.5 = 1.1)
    //   z = 2.1 + 0.156*1.3 + gap_term   ≈ 2.30  (well below EJECT_START_Z + 0.5 = 2.6)
    const mid = ejectPose(0.25, 0, 5);
    expect(mid.y).toBeGreaterThan(EJECT_START_Y + 0.5); // up out of the pack mouth
    expect(mid.z).toBeLessThan(EJECT_START_Z + 0.5);    // not yet at stack depth
  });
});
