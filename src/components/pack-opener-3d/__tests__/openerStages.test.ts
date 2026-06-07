import { describe, it, expect } from 'vitest';
import { canTransition, type OpenerStage } from '../openerStages';

describe('canTransition', () => {
  it('allows the happy path', () => {
    expect(canTransition('idle', 'approaching')).toBe(true);
    expect(canTransition('approaching', 'ready')).toBe(true);
    expect(canTransition('ready', 'tearing')).toBe(true);
    expect(canTransition('tearing', 'torn')).toBe(true);
    expect(canTransition('torn', 'reveal')).toBe(true);
  });

  it('allows spring-back from tearing to ready', () => {
    expect(canTransition('tearing', 'ready')).toBe(true);
  });

  it('forbids tearing before the pack approaches', () => {
    expect(canTransition('idle', 'tearing')).toBe(false);
  });

  it('forbids spring-back from tearing all the way to idle', () => {
    expect(canTransition('tearing', 'idle')).toBe(false);
  });

  it('rejects skips and reversals', () => {
    expect(canTransition('idle', 'torn')).toBe(false);
    expect(canTransition('idle', 'reveal')).toBe(false);
    expect(canTransition('idle', 'ready')).toBe(false);
    expect(canTransition('approaching', 'tearing')).toBe(false);
    expect(canTransition('ready', 'idle')).toBe(false);
    expect(canTransition('torn', 'tearing')).toBe(false);
    expect(canTransition('reveal', 'idle')).toBe(false);
  });

  it('reveal is terminal', () => {
    const all: OpenerStage[] = [
      'idle',
      'approaching',
      'ready',
      'tearing',
      'torn',
      'reveal',
    ];
    for (const to of all) expect(canTransition('reveal', to)).toBe(false);
  });
});
