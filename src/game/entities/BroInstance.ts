import type { BroSpecies, BroStats } from '@/types/bros';
import type { SavedBro } from '@/types/save';
import { BRO_MAP } from '@/data/bros';
import { MOVE_MAP } from '@/data/moves';
import { MAX_LEVEL } from '@/data/constants';
import { xpForLevel } from '@/game/utils/math';

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
  const moves = getMovesForLevel(species, level).map((moveId) => ({ moveId, currentPP: MOVE_MAP[moveId]?.pp ?? 10 }));

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
  const species = BRO_MAP[speciesId] ?? buildPlaceholderSpecies(speciesId);
  return createBroInstance(species, level, generateRandomIVs());
}

export function createStarterBro(speciesId: number, level: number): SavedBro {
  const species = BRO_MAP[speciesId] ?? buildPlaceholderSpecies(speciesId);
  return createBroInstance(species, level, generateGoodIVs());
}

export function addXP(bro: SavedBro, amount: number): LevelUpResult | null {
  if (bro.level >= MAX_LEVEL) return null;

  bro.currentXP += amount;
  const species = BRO_MAP[bro.speciesId];
  const movesLearned: number[] = [];
  let leveled = false;

  // Multi-level-up loop
  while (bro.level < MAX_LEVEL && bro.currentXP >= xpForLevel(bro.level + 1)) {
    bro.currentXP -= xpForLevel(bro.level + 1);
    bro.level++;
    leveled = true;

    // Recalculate stats each level
    if (species) {
      const oldMaxSTA = bro.stats.stamina;
      const newStats = calculateStatsForLevel(species, bro.level, bro.ivs);
      bro.currentSTA = Math.min(bro.currentSTA + (newStats.stamina - oldMaxSTA), newStats.stamina);
      bro.stats = newStats;
    }

    // Collect new moves for this level
    if (species) {
      for (const entry of species.learnset) {
        if (entry.level === bro.level) {
          movesLearned.push(entry.moveId);
        }
      }
    }
  }

  if (!leveled) return null;

  const canEvolve = species?.evolvesTo != null && species.evolveLevel != null && bro.level >= species.evolveLevel;
  return {
    newLevel: bro.level,
    statsGained: {},
    movesLearned,
    canEvolve,
    evolvesToSpeciesId: canEvolve ? species!.evolvesTo : undefined,
  };
}

export function evolveBro(bro: SavedBro, toSpeciesId: number): SavedBro {
  const newSpecies = BRO_MAP[toSpeciesId];
  if (!newSpecies) return bro;

  const oldMaxSTA = bro.stats.stamina;
  const hpRatio = bro.currentSTA / Math.max(1, oldMaxSTA);

  bro.speciesId = toSpeciesId;
  bro.stats = calculateStatsForLevel(newSpecies, bro.level, bro.ivs);
  bro.currentSTA = Math.max(1, Math.floor(hpRatio * bro.stats.stamina));

  for (const entry of newSpecies.learnset) {
    if (entry.level <= bro.level && bro.moves.length < 4) {
      const alreadyKnows = bro.moves.some((m) => m.moveId === entry.moveId);
      if (!alreadyKnows) {
        bro.moves.push({ moveId: entry.moveId, currentPP: MOVE_MAP[entry.moveId]?.pp ?? 10 });
      }
    }
  }

  return bro;
}

export function healBro(bro: SavedBro): SavedBro {
  return {
    ...bro,
    currentSTA: bro.stats.stamina,
    statusEffect: null,
    moves: bro.moves.map((m) => ({ ...m, currentPP: MOVE_MAP[m.moveId]?.pp ?? m.currentPP })),
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
