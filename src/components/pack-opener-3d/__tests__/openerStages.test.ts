import { describe, it, expect } from 'vitest';
import { canTransition, type OpenerStage } from '../openerStages';

describe('canTransition', () => {
  it('allows the happy path', () => {
    expect(canTransition('idle', 'tearing')).toBe(true);
    expect(canTransition('tearing', 'torn')).toBe(true);
    expect(canTransition('torn', 'ejecting')).toBe(true);
    expect(canTransition('ejecting', 'reveal')).toBe(true);
  });

  it('allows spring-back from tearing to idle', () => {
    expect(canTransition('tearing', 'idle')).toBe(true);
  });

  it('rejects skips and reversals', () => {
    expect(canTransition('idle', 'torn')).toBe(false);
    expect(canTransition('idle', 'reveal')).toBe(false);
    expect(canTransition('torn', 'tearing')).toBe(false);
    expect(canTransition('reveal', 'idle')).toBe(false);
  });

  it('reveal is terminal', () => {
    const all: OpenerStage[] = ['idle', 'tearing', 'torn', 'ejecting', 'reveal'];
    for (const to of all) expect(canTransition('reveal', to)).toBe(false);
  });
});
