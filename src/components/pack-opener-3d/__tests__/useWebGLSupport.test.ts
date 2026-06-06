import { describe, it, expect } from 'vitest';
import { isWebGLAvailable } from '../useWebGLSupport';

function fakeCanvas(contexts: Record<string, unknown>): HTMLCanvasElement {
  return {
    getContext: (name: string) => contexts[name] ?? null,
  } as unknown as HTMLCanvasElement;
}

describe('isWebGLAvailable', () => {
  it('true when webgl2 available', () => {
    expect(isWebGLAvailable(() => fakeCanvas({ webgl2: {} }))).toBe(true);
  });

  it('true when only webgl1 available', () => {
    expect(isWebGLAvailable(() => fakeCanvas({ webgl: {} }))).toBe(true);
  });

  it('false when no context available', () => {
    expect(isWebGLAvailable(() => fakeCanvas({}))).toBe(false);
  });

  it('false when canvas creation throws', () => {
    expect(isWebGLAvailable(() => { throw new Error('no DOM'); })).toBe(false);
  });
});
