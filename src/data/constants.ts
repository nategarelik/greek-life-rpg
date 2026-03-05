import type { BroType } from '../types/bros';

export const TILE_SIZE = 32;
export const MAX_PARTY_SIZE = 6;
export const MAX_LEVEL = 50;
export const MAX_MOVES = 4;
export const BASE_ENCOUNTER_RATE = 0.10;
export const BASE_FLEE_CHANCE = 0.5;
export const STAB_MULTIPLIER = 1.5;
export const CRITICAL_MULTIPLIER = 1.5;
export const CRITICAL_RATE = 1 / 16;

export const TYPE_COLORS: Record<BroType, string> = {
  jock: 'red',
  prep: 'gold',
  nerd: 'blue',
  stoner: 'green',
  scene: 'purple',
  goth: 'darkgray',
} as const;
