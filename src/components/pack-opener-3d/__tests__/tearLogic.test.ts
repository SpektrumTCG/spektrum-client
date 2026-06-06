import { describe, it, expect } from 'vitest';
import { resolveTearRelease, clampTearProgress, TEAR_THRESHOLD } from '../tearLogic';

describe('resolveTearRelease', () => {
  it('resets below threshold', () => {
    expect(resolveTearRelease(0)).toBe('reset');
    expect(resolveTearRelease(0.69)).toBe('reset');
  });

  it('completes at and above threshold', () => {
    expect(resolveTearRelease(TEAR_THRESHOLD)).toBe('complete');
    expect(resolveTearRelease(0.7)).toBe('complete');
    expect(resolveTearRelease(1)).toBe('complete');
  });
});

describe('clampTearProgress', () => {
  it('maps drag distance to 0..1 over 60% of track width', () => {
    // 600px track → full tear at 360px drag
    expect(clampTearProgress(0, 600)).toBe(0);
    expect(clampTearProgress(180, 600)).toBeCloseTo(0.5);
    expect(clampTearProgress(360, 600)).toBe(1);
  });

  it('clamps overshoot and negative (leftward) drag', () => {
    expect(clampTearProgress(9999, 600)).toBe(1);
    expect(clampTearProgress(-50, 600)).toBe(0);
  });

  it('returns 0 for zero or negative track width', () => {
    expect(clampTearProgress(100, 0)).toBe(0);
    expect(clampTearProgress(100, -10)).toBe(0);
  });
});
