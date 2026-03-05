import type { BroSpecies, BroStats } from '@/types/bros';
import type { SavedBro } from '@/types/save';

export interface LevelUpResult {
  newLevel: number;
  statsGained: Partial<BroStats>;
  movesLearned: number[];
  canEvolve: boolean;
  evolvesToSpeciesId?: number;
}

export function generateInstanceId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function generateRandomIVs(): BroStats {
  return {
    stamina: Math.floor(Math.random() * 32),
    hype: Math.floor(Math.random() * 32),
    clout: Math.floor(Math.random() * 32),
    chill: Math.floor(Math.random() * 32),
    drip: Math.floor(Math.random() * 32),
    vibes: Math.floor(Math.random() * 32),
  };
}

export function generateGoodIVs(): BroStats {
  const min = 20;
  const range = 12; // 20-31
  return {
    stamina: min + Math.floor(Math.random() * range),
    hype: min + Math.floor(Math.random() * range),
    clout: min + Math.floor(Math.random() * range),
    chill: min + Math.floor(Math.random() * range),
    drip: min + Math.floor(Math.random() * range),
    vibes: min + Math.floor(Math.random() * range),
  };
}

export function calculateStatsForLevel(species: BroSpecies, level: number, ivs: BroStats): BroStats {
  const calc = (base: number, iv: number) =>
    Math.floor(((2 * base + iv) * level) / 100) + 5;

  const staminaBase = species.baseStats.stamina;
  const staminaIV = ivs.stamina;
  const stamina = Math.floor(((2 * staminaBase + staminaIV) * level) / 100) + level + 10;

  return {
    stamina,
    hype: calc(species.baseStats.hype, ivs.hype),
    clout: calc(species.baseStats.clout, ivs.clout),
    chill: calc(species.baseStats.chill, ivs.chill),
    drip: calc(species.baseStats.drip, ivs.drip),
    vibes: calc(species.baseStats.vibes, ivs.vibes),
  };
}

export function getMovesForLevel(species: BroSpecies, level: number): number[] {
  const learnable = species.learnset
    .filter((entry) => entry.level <= level)
    .sort((a, b) => b.level - a.level);

  return learnable.slice(0, 4).map((entry) => entry.moveId);
}

export function createBroInstance(species: BroSpecies, level: number, ivs?: BroStats): SavedBro {
  const resolvedIVs = ivs ?? generateRandomIVs();
  const stats = calculateStatsForLevel(species, level, resolvedIVs);
  const moves = getMovesForLevel(species, level).map((moveId) => ({ moveId, currentPP: 0 }));

  return {
    instanceId: generateInstanceId(),
    speciesId: species.id,
    nickname: null,
    level,
    currentXP: 0,
    currentSTA: stats.stamina,
    stats,
    ivs: resolvedIVs,
    moves,
    statusEffect: null,
    originalTrainer: '',
  };
}

export function createWildBro(speciesId: number, level: number): SavedBro {
  const placeholder = buildPlaceholderSpecies(speciesId);
  return createBroInstance(placeholder, level, generateRandomIVs());
}

export function createStarterBro(speciesId: number, level: number): SavedBro {
  const placeholder = buildPlaceholderSpecies(speciesId);
  return createBroInstance(placeholder, level, generateGoodIVs());
}

// XP thresholds: medium-fast curve — level^3
function xpForLevel(level: number): number {
  return level * level * level;
}

export function addXP(bro: SavedBro, amount: number): LevelUpResult | null {
  if (bro.level >= 100) return null;

  const newXP = bro.currentXP + amount;
  const nextLevelXP = xpForLevel(bro.level + 1);

  if (newXP < nextLevelXP) {
    bro.currentXP = newXP;
    return null;
  }

  const oldLevel = bro.level;
  bro.currentXP = newXP - nextLevelXP;
  bro.level = oldLevel + 1;

  const movesLearned: number[] = [];
  // Check if any moves are learned at the new level but require species data
  // We return the level; callers with species data can check learnset

  const canEvolve = false; // requires species lookup; callers should check
  const result: LevelUpResult = {
    newLevel: bro.level,
    statsGained: {},
    movesLearned,
    canEvolve,
  };

  return result;
}

export function healBro(bro: SavedBro): SavedBro {
  return {
    ...bro,
    currentSTA: bro.stats.stamina,
    statusEffect: null,
    moves: bro.moves.map((m) => ({ ...m, currentPP: 0 })),
  };
}

// Minimal placeholder species for when we only have a speciesId.
// Real species data should come from the data layer.
function buildPlaceholderSpecies(speciesId: number): BroSpecies {
  return {
    id: speciesId,
    name: `Bro #${speciesId}`,
    type: 'jock',
    baseStats: { stamina: 45, hype: 45, clout: 45, chill: 45, drip: 45, vibes: 45 },
    description: '',
    learnset: [],
    catchRate: 128,
    expYield: 64,
    spriteKey: `bro-jock`,
  };
}
