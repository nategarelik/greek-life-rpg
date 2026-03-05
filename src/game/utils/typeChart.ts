import type { BroType } from '../../types/bros';

// [attackType][defenderType] = multiplier
const EFFECTIVENESS: Record<BroType, Partial<Record<BroType, number>>> = {
  jock: {
    nerd: 2.0,
    stoner: 2.0,
    prep: 0.5,
    scene: 0.5,
  },
  prep: {
    jock: 2.0,
    scene: 2.0,
    nerd: 0.5,
    goth: 0.5,
  },
  nerd: {
    prep: 2.0,
    goth: 2.0,
    jock: 0.5,
    stoner: 0.5,
  },
  stoner: {
    nerd: 2.0,
    prep: 2.0,
    scene: 0.5,
    jock: 0.5,
  },
  scene: {
    stoner: 2.0,
    jock: 2.0,
    goth: 0.5,
    nerd: 0.5,
  },
  goth: {
    scene: 2.0,
    stoner: 2.0,
    prep: 0.5,
    jock: 0.5,
  },
};

export function getEffectiveness(attackType: BroType, defenderType: BroType): number {
  return EFFECTIVENESS[attackType][defenderType] ?? 1.0;
}
