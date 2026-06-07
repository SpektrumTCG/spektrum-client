export type OpenerStage = 'idle' | 'approaching' | 'ready' | 'tearing' | 'torn' | 'reveal';

const TRANSITIONS: Record<OpenerStage, OpenerStage[]> = {
  idle: ['approaching'], // tap the pack → it comes to you
  approaching: ['ready'],
  ready: ['tearing'],
  tearing: ['ready', 'torn'], // ready = spring-back on under-threshold release
  torn: ['reveal'], // strip flies, body drops, 2D reveal takes over
  reveal: [], // terminal
};

export function canTransition(from: OpenerStage, to: OpenerStage): boolean {
  return (TRANSITIONS[from] ?? []).includes(to);
}
