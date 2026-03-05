export type BroType = 'jock' | 'prep' | 'nerd' | 'stoner' | 'scene' | 'goth';

export interface BroStats {
  stamina: number;   // HP — how long they party
  hype: number;      // Attack — physical move power
  clout: number;     // Sp. Attack — social move power
  chill: number;     // Defense — physical resistance
  drip: number;      // Sp. Defense — social resistance
  vibes: number;     // Speed — turn order
}

export interface BroSpecies {
  id: number;
  name: string;
  type: BroType;
  baseStats: BroStats;
  description: string;
  evolvesTo?: number;      // species id
  evolveLevel?: number;
  learnset: LearnsetEntry[];
  catchRate: number;        // 0-255
  expYield: number;         // base XP given when defeated
  spriteKey: string;
}

export interface LearnsetEntry {
  moveId: number;
  level: number;
}

export interface GlowUp {
  fromSpecies: number;
  toSpecies: number;
  level: number;
}
