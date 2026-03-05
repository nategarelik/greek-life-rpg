import type { ZoneEncounter } from '@/types/map';
import type { BattleConfig } from '@/types/battle';

const DEFAULT_ENCOUNTER_RATE = 0.15;
const MIN_STEPS_BEFORE_ENCOUNTER = 3;

export class EncounterSystem {
  private encounterRate: number;
  private stepCount: number = 0;

  constructor(encounterRate: number = DEFAULT_ENCOUNTER_RATE) {
    this.encounterRate = encounterRate;
  }

  checkEncounter(isEncounterTile: boolean): boolean {
    if (!isEncounterTile) return false;

    this.stepCount++;
    if (this.stepCount < MIN_STEPS_BEFORE_ENCOUNTER) return false;

    if (Math.random() < this.encounterRate) {
      this.stepCount = 0;
      return true;
    }

    return false;
  }

  generateEncounter(encounters: ZoneEncounter[]): BattleConfig {
    const species = pickWeightedRandom(encounters);
    const level = randomIntInRange(species.minLevel, species.maxLevel);

    return {
      isWild: true,
      enemyParty: [{ speciesId: species.speciesId, level }],
    };
  }

  resetStepCount(): void {
    this.stepCount = 0;
  }
}

function pickWeightedRandom(encounters: ZoneEncounter[]): ZoneEncounter {
  const totalWeight = encounters.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const encounter of encounters) {
    roll -= encounter.weight;
    if (roll <= 0) return encounter;
  }

  return encounters[encounters.length - 1];
}

function randomIntInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
