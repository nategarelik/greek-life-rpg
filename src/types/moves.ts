import type { BroType } from './bros';

export type MoveCategory = 'hype' | 'clout' | 'status';

export type StatusEffect =
  | 'hungover'       // poison — damage over time
  | 'passed_out'     // sleep — can't act
  | 'embarrassed'    // confused — may hurt self
  | 'hyped'          // boosted attack but lower accuracy
  | 'cancelled';     // paralysis — may skip turn, lower speed

export type StatModTarget = keyof import('./bros').BroStats;

export interface StatModifier {
  stat: StatModTarget;
  stages: number;      // -6 to +6
  target: 'self' | 'opponent';
}

export interface Move {
  id: number;
  name: string;
  type: BroType;
  category: MoveCategory;
  power: number;          // 0 for status moves
  accuracy: number;       // 0-100
  pp: number;             // max uses
  description: string;
  statusEffect?: StatusEffect;
  statusChance?: number;  // 0-100
  statModifiers?: StatModifier[];
  recoilPercent?: number; // % of damage dealt as recoil
  priority?: number;      // higher = goes first, default 0
}

export interface MoveInstance {
  moveId: number;
  currentPP: number;
}
