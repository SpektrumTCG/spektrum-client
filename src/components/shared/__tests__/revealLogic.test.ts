import { describe, expect, it } from 'vitest';
import { advanceReveal, createRevealState } from '../revealLogic';

describe('createRevealState', () => {
  it('starts with all cards face-down and index 0', () => {
    const s = createRevealState(5);
    expect(s.phases).toEqual(['back', 'back', 'back', 'back', 'back']);
    expect(s.current).toBe(0);
    expect(s.done).toBe(false);
  });

  it('is immediately done for an empty pack', () => {
    expect(createRevealState(0).done).toBe(true);
  });
});

describe('advanceReveal', () => {
  it('first advance flips the top card', () => {
    const s = advanceReveal(createRevealState(3));
    expect(s.phases[0]).toBe('flipped');
    expect(s.current).toBe(0);
    expect(s.done).toBe(false);
  });

  it('second advance moves the flipped card aside and exposes the next', () => {
    const s = advanceReveal(advanceReveal(createRevealState(3)));
    expect(s.phases[0]).toBe('aside');
    expect(s.phases[1]).toBe('back');
    expect(s.current).toBe(1);
    expect(s.done).toBe(false);
  });

  it('completes after the last card moves aside', () => {
    let s = createRevealState(2);
    s = advanceReveal(s); // flip 0
    s = advanceReveal(s); // aside 0
    s = advanceReveal(s); // flip 1
    expect(s.done).toBe(false);
    s = advanceReveal(s); // aside 1
    expect(s.done).toBe(true);
    expect(s.phases).toEqual(['aside', 'aside']);
  });

  it('is a no-op once done', () => {
    let s = createRevealState(1);
    s = advanceReveal(advanceReveal(s));
    expect(advanceReveal(s)).toBe(s);
  });

  it('does not mutate the input state', () => {
    const s = createRevealState(2);
    advanceReveal(s);
    expect(s.phases[0]).toBe('back');
    expect(s.current).toBe(0);
  });
});
