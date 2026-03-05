import type { DamageResult } from '../../types/battle';
import { STAB_MULTIPLIER, CRITICAL_MULTIPLIER, CRITICAL_RATE } from '../../data/constants';

export function calculateDamage(
  attackerLevel: number,
  movePower: number,
  attackStat: number,
  defenseStat: number,
  effectiveness: number,
  stab: boolean,
  critical: boolean,
): DamageResult {
  const stabMult = stab ? STAB_MULTIPLIER : 1.0;
  const critMult = critical ? CRITICAL_MULTIPLIER : 1.0;
  const random = randomInRange(85, 100) / 100;

  const base = Math.floor(
    ((2 * attackerLevel) / 5 + 2) * movePower * (attackStat / defenseStat) / 50 + 2
  );
  const damage = Math.max(1, Math.floor(base * stabMult * effectiveness * critMult * random));

  return { damage, effectiveness, critical };
}

export function calculateCatchRate(
  maxSTA: number,
  currentSTA: number,
  speciesCatchRate: number,
  ballModifier: number,
  statusEffect?: import('../../types/moves').StatusEffect | null,
): number {
  // Gen III status multiplier: asleep/frozen = 2x, poisoned/paralyzed/burned = 1.5x
  let statusBonus = 1;
  if (statusEffect === 'passed_out') statusBonus = 2;
  else if (statusEffect === 'hungover' || statusEffect === 'cancelled') statusBonus = 1.5;

  const a = ((3 * maxSTA - 2 * currentSTA) * speciesCatchRate * ballModifier) / (3 * maxSTA) * statusBonus;
  return Math.min(255, Math.max(0, a));
}

/** Medium Fast XP curve (n-cubed, matching Pokemon Gen III) */
export function xpForLevel(level: number): number {
  return level * level * level;
}

export function calculateXPGain(
  baseYield: number,
  defeatedLevel: number,
  isWild: boolean,
): number {
  const trainerBonus = isWild ? 1 : 1.5;
  return Math.floor((baseYield * defeatedLevel * trainerBonus) / 7);
}

export function calculateStat(
  baseStat: number,
  iv: number,
  level: number,
  isStamina: boolean,
): number {
  const base = Math.floor(((2 * baseStat + iv) * level) / 100);
  if (isStamina) {
    return base + level + 10;
  }
  return base + 5;
}

// stage range: -6 to +6
export function getStatModMultiplier(stage: number): number {
  const clamped = Math.max(-6, Math.min(6, stage));
  if (clamped >= 0) {
    return (2 + clamped) / 2;
  }
  return 2 / (2 - clamped);
}

export function isCriticalHit(): boolean {
  return Math.random() < CRITICAL_RATE;
}

export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
