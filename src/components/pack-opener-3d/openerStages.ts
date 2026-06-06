export type OpenerStage = 'idle' | 'tearing' | 'torn' | 'ejecting' | 'reveal';

const TRANSITIONS: Record<OpenerStage, OpenerStage[]> = {
  idle: ['tearing'],
  tearing: ['idle', 'torn'], // idle = spring-back on under-threshold release
  torn: ['ejecting'],
  ejecting: ['reveal'],
  reveal: [], // terminal — 2D reveal takes over
};

export function canTransition(from: OpenerStage, to: OpenerStage): boolean {
  return TRANSITIONS[from].includes(to);
}
