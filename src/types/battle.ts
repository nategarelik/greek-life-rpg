import type { BroStats } from './bros';
import type { StatusEffect } from './moves';

export interface BattleParticipant {
  broInstanceId: string;
  speciesId: number;
  name: string;
  level: number;
  currentSTA: number;
  maxSTA: number;
  stats: BroStats;
  statStages: Record<keyof BroStats, number>;
  moves: { moveId: number; currentPP: number }[];
  statusEffect: StatusEffect | null;
  statusTurns: number;
  isPlayer: boolean;
}

export type BattleAction =
  | { type: 'fight'; moveIndex: number }
  | { type: 'item'; itemId: number }
  | { type: 'switch'; partyIndex: number }
  | { type: 'flee' };

export interface DamageResult {
  damage: number;
  effectiveness: number;  // 0, 0.5, 1, 2
  critical: boolean;
}

export type BattlePhase =
  | 'intro'
  | 'player_turn'
  | 'enemy_turn'
  | 'attack'
  | 'check_faint'
  | 'catch'
  | 'victory'
  | 'defeat'
  | 'flee'
  | 'level_up'
  | 'glow_up';

export interface BattleConfig {
  isWild: boolean;
  trainerName?: string;
  trainerSprite?: string;
  enemyParty: {
    speciesId: number;
    level: number;
  }[];
  bgmKey?: string;
  backgroundKey?: string;
}
