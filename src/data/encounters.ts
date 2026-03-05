import type { ZoneEncounter } from '../types/map';

export interface ZoneEncounterTable {
  zoneId: string;
  encounters: ZoneEncounter[];
}

export const ENCOUNTER_TABLES: ZoneEncounterTable[] = [
  {
    zoneId: 'freshman-quad',
    encounters: [
      { speciesId: 1, minLevel: 2, maxLevel: 5, weight: 30 },   // Lil Pledge
      { speciesId: 4, minLevel: 2, maxLevel: 5, weight: 25 },   // Trust Fund Baby
      { speciesId: 7, minLevel: 2, maxLevel: 5, weight: 20 },   // Shy Nerd
      { speciesId: 10, minLevel: 2, maxLevel: 4, weight: 15 },  // Chill Dude
      { speciesId: 13, minLevel: 2, maxLevel: 5, weight: 10 },  // Skater Kid
    ],
  },
  {
    zoneId: 'greek-row',
    encounters: [
      { speciesId: 2, minLevel: 10, maxLevel: 15, weight: 25 },  // Frat Bro
      { speciesId: 5, minLevel: 10, maxLevel: 15, weight: 20 },  // Country Club Kid
      { speciesId: 8, minLevel: 10, maxLevel: 14, weight: 20 },  // Lab Rat
      { speciesId: 11, minLevel: 10, maxLevel: 15, weight: 15 }, // Stoner Bro
      { speciesId: 14, minLevel: 10, maxLevel: 15, weight: 15 }, // Scene Lord
      { speciesId: 17, minLevel: 10, maxLevel: 14, weight: 5 },  // Dark Lord (rare)
    ],
  },
  {
    zoneId: 'campus-library',
    encounters: [
      { speciesId: 7, minLevel: 5, maxLevel: 10, weight: 40 },   // Shy Nerd
      { speciesId: 8, minLevel: 8, maxLevel: 12, weight: 30 },   // Lab Rat
      { speciesId: 4, minLevel: 5, maxLevel: 9, weight: 20 },    // Trust Fund Baby
      { speciesId: 16, minLevel: 5, maxLevel: 10, weight: 10 },  // Emo Kid
    ],
  },
  {
    zoneId: 'campus-gym',
    encounters: [
      { speciesId: 1, minLevel: 5, maxLevel: 12, weight: 45 },   // Lil Pledge
      { speciesId: 2, minLevel: 10, maxLevel: 16, weight: 35 },  // Frat Bro
      { speciesId: 4, minLevel: 5, maxLevel: 10, weight: 20 },   // Trust Fund Baby
    ],
  },
  {
    zoneId: 'quad-park',
    encounters: [
      { speciesId: 10, minLevel: 4, maxLevel: 8, weight: 30 },   // Chill Dude
      { speciesId: 13, minLevel: 4, maxLevel: 8, weight: 30 },   // Skater Kid
      { speciesId: 1, minLevel: 3, maxLevel: 7, weight: 20 },    // Lil Pledge
      { speciesId: 16, minLevel: 3, maxLevel: 7, weight: 20 },   // Emo Kid
    ],
  },
];

export const ENCOUNTER_MAP: Record<string, ZoneEncounterTable> = Object.fromEntries(
  ENCOUNTER_TABLES.map((t) => [t.zoneId, t])
);

// Default starting moves for each species (used by BattleScene when building enemy participants)
export const SPECIES_MOVES: Record<number, { moveId: number; currentPP: number }[]> = {
  1:  [{ moveId: 1, currentPP: 35 }],
  2:  [{ moveId: 1, currentPP: 35 }, { moveId: 2, currentPP: 25 }],
  3:  [{ moveId: 1, currentPP: 35 }, { moveId: 2, currentPP: 25 }, { moveId: 3, currentPP: 15 }],
  4:  [{ moveId: 9, currentPP: 25 }],
  5:  [{ moveId: 9, currentPP: 25 }, { moveId: 10, currentPP: 15 }],
  6:  [{ moveId: 9, currentPP: 25 }, { moveId: 10, currentPP: 15 }, { moveId: 11, currentPP: 10 }],
  7:  [{ moveId: 5, currentPP: 20 }],
  8:  [{ moveId: 5, currentPP: 20 }, { moveId: 6, currentPP: 15 }],
  9:  [{ moveId: 5, currentPP: 20 }, { moveId: 6, currentPP: 15 }, { moveId: 7, currentPP: 15 }],
  10: [{ moveId: 13, currentPP: 30 }],
  11: [{ moveId: 13, currentPP: 30 }, { moveId: 14, currentPP: 15 }],
  12: [{ moveId: 13, currentPP: 30 }, { moveId: 14, currentPP: 15 }, { moveId: 16, currentPP: 10 }],
  13: [{ moveId: 17, currentPP: 20 }],
  14: [{ moveId: 17, currentPP: 20 }, { moveId: 18, currentPP: 20 }],
  15: [{ moveId: 17, currentPP: 20 }, { moveId: 18, currentPP: 20 }, { moveId: 19, currentPP: 15 }],
  16: [{ moveId: 21, currentPP: 20 }],
  17: [{ moveId: 21, currentPP: 20 }, { moveId: 22, currentPP: 15 }],
  18: [{ moveId: 21, currentPP: 20 }, { moveId: 22, currentPP: 15 }, { moveId: 23, currentPP: 10 }],
};
