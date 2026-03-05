import type { BroType, BroStats } from './bros';
import type { StatusEffect } from './moves';
import type { InventorySlot } from './items';

export interface SaveData {
  version: number;
  timestamp: number;
  playerName: string;
  playtime: number;       // seconds
  position: {
    zoneId: string;
    x: number;
    y: number;
    facing: 'up' | 'down' | 'left' | 'right';
  };
  party: SavedBro[];
  storage: SavedBro[];
  inventory: InventorySlot[];
  badges: string[];
  storyFlags: Record<string, boolean>;
  defeatedTrainers: string[];
  money: number;
}

export interface SavedBro {
  instanceId: string;
  speciesId: number;
  nickname: string | null;
  level: number;
  currentXP: number;
  currentSTA: number;
  stats: BroStats;
  ivs: BroStats;
  moves: { moveId: number; currentPP: number }[];
  statusEffect: StatusEffect | null;
  originalTrainer: string;
}

export const SAVE_VERSION = 1;
export const MAX_SAVE_SLOTS = 3;
