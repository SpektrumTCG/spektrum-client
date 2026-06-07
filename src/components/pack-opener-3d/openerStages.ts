export type OpenerStage = 'idle' | 'approaching' | 'ready' | 'tearing' | 'torn' | 'ejecting' | 'reveal';

const TRANSITIONS: Record<OpenerStage, OpenerStage[]> = {
  idle: ['approaching'], // tap the pack → it comes to you
  approaching: ['ready'],
  ready: ['tearing'],
  tearing: ['ready', 'torn'], // ready = spring-back on under-threshold release
  torn: ['ejecting'],
  ejecting: ['reveal'],
  reveal: [], // terminal — 2D reveal takes over
};

export function canTransition(from: OpenerStage, to: OpenerStage): boolean {
  return (TRANSITIONS[from] ?? []).includes(to);
}
