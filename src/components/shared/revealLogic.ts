export type CardPhase = 'back' | 'flipped' | 'aside';

export interface RevealState {
  phases: CardPhase[];
  /** Index of the top (interactive) card == number of cards already aside. */
  current: number;
  done: boolean;
}

export function createRevealState(count: number): RevealState {
  return {
    phases: new Array<CardPhase>(count).fill('back'),
    current: 0,
    done: count === 0,
  };
}

/** One tap: face-down top card flips; a flipped top card moves aside. */
export function advanceReveal(state: RevealState): RevealState {
  if (state.done) return state;
  const phases = [...state.phases];
  if (phases[state.current] === 'back') {
    phases[state.current] = 'flipped';
    return { ...state, phases };
  }
  phases[state.current] = 'aside';
  const current = state.current + 1;
  return { phases, current, done: current >= phases.length };
}
