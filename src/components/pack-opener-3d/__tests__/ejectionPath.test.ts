import { describe, expect, it } from 'vitest';
import {
  cardProgress,
  ejectPose,
  EJECT_DURATION,
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
  it('starts inside the pack mouth, hidden', () => {
    const p = ejectPose(0, 0, 5);
    expect(p.visible).toBe(false);
    expect(p.y).toBeCloseTo(-0.4);
    expect(p.z).toBeCloseTo(0.1);
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
    const mid = ejectPose(0.4, 0, 5);
    expect(mid.y).toBeGreaterThan(0.5); // up out of the pack
    expect(mid.z).toBeLessThan(1);      // not yet at stack depth
  });
});
