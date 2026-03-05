import type { GlowUp } from '../types/bros';

export const GLOW_UPS: GlowUp[] = [
  // Jock chain
  { fromSpecies: 1, toSpecies: 2, level: 16 },
  { fromSpecies: 2, toSpecies: 3, level: 36 },

  // Prep chain
  { fromSpecies: 4, toSpecies: 5, level: 16 },
  { fromSpecies: 5, toSpecies: 6, level: 36 },

  // Nerd chain
  { fromSpecies: 7, toSpecies: 8, level: 14 },
  { fromSpecies: 8, toSpecies: 9, level: 32 },

  // Stoner chain
  { fromSpecies: 10, toSpecies: 11, level: 18 },
  { fromSpecies: 11, toSpecies: 12, level: 34 },

  // Scene chain
  { fromSpecies: 13, toSpecies: 14, level: 18 },
  { fromSpecies: 14, toSpecies: 15, level: 34 },

  // Goth chain
  { fromSpecies: 16, toSpecies: 17, level: 14 },
  { fromSpecies: 17, toSpecies: 18, level: 32 },
] as const satisfies GlowUp[];

/** Look up the GlowUp triggered by a given species at a given level, if any. */
export function getGlowUp(speciesId: number, level: number): GlowUp | undefined {
  return GLOW_UPS.find(
    (g) => g.fromSpecies === speciesId && g.level <= level
  );
}

/** Map fromSpecies → GlowUp for O(1) lookups. */
export const GLOW_UP_MAP: Record<number, GlowUp> = Object.fromEntries(
  GLOW_UPS.map((g) => [g.fromSpecies, g])
);
